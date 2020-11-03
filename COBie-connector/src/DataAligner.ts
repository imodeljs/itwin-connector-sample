/*---------------------------------------------------------------------------------------------
* Copyright (c) Bentley Systems, Incorporated. All rights reserved.
* See LICENSE.md in the project root for license terms and full copyright notice.
*--------------------------------------------------------------------------------------------*/

import { Id64String } from "@bentley/bentleyjs-core";
import { Code, CodeSpec, Placement3d, AxisAlignedBox3d, RelatedElement } from "@bentley/imodeljs-common";
import { IModelDb, SpatialCategory, DrawingCategory } from "@bentley/imodeljs-backend";
import { ItemState, SourceItem, ChangeResults, SynchronizationResults } from "@bentley/imodel-bridge/lib/Synchronizer";
import * as COBieElements from "./COBieElements";
import * as COBieRelationships from "./COBieRelationships";
import * as COBieRelatedElements from "./COBieRelatedElements";
import { COBieConnector } from "./COBieConnector";
import { DataFetcher } from "./DataFetcher";
import { DynamicSchemaGenerator } from "./DynamicSchemaGenerator";
import * as hash from "object-hash";
import { PropertyRenameReverseMap } from "./schema/COBieSchemaConfig";

export class DataAligner {

  public imodel: IModelDb;
  public connector: COBieConnector;
  public dataFetcher: DataFetcher;
  public schemaGenerator: DynamicSchemaGenerator;
  public schemaItems: {[className: string]: any};
  public categoryCache: {[categoryName: string]: Id64String};
  public modelCache: {[modelName: string]: Id64String};
  public elementCache: {[identifier: string]: Id64String};

  constructor(connector: COBieConnector) {
    this.connector = connector;
    this.dataFetcher = connector.dataFetcher!;
    this.imodel = connector.synchronizer.imodel;
    this.schemaGenerator = connector.schemaGenerator!;
    this.schemaItems = connector.dynamicSchema!.toJSON().items!;
    this.categoryCache = {};
    this.modelCache = {};
    this.elementCache = {};
  }

  public async align(elementTree: any) {
    const partitions = elementTree.subjects.Subject1.partitions;
    const partitionNames = partitions ? Object.keys(partitions) : [];
    for (const partitionName of partitionNames) {
      const partition = partitions[partitionName];
      const models = partition.models;
      const modelNames = models ? Object.keys(models) : [];

      for (const modelName of modelNames) {
        const model = models[modelName];
        const modelId = this.updateModel(partition, model, modelName);

        const elements = model.elements;
        const elementNames = elements ? Object.keys(elements) : [];
        for (const elementName of elementNames) {
          const element = elements[elementName];
          this.updateElement(modelId, element, elementName);
        }

        const elementClasses = model.elementClasses;
        const elementClassNames = elementClasses ? Object.keys(elementClasses) : [];
        for (const elementClassName of elementClassNames) {
          const elementClass = elementClasses[elementClassName];
          await this.updateElementClass(modelId, elementClass);
        }

        const relationshipClasses = model.relationshipClasses;
        const relationshipClassNames = relationshipClasses ? Object.keys(relationshipClasses) : [];
        for (const relationshipClassName of relationshipClassNames) {
          const relationshipClass = relationshipClasses[relationshipClassName];
          await this.updateRelationshipClass(relationshipClass);
        }
      }
    }
  }

  public updateModel(partition: any, model: any, modelName: string) {
    const jobSubjectId = this.connector.jobSubject.id;
    const existingModelId = this.imodel.elements.queryElementIdByCode(partition.ref.createCode(this.imodel, jobSubjectId, modelName));
    if (existingModelId) {
      this.modelCache[modelName] = existingModelId;
      return existingModelId;
    }
    const newModelId = model.ref.insert(this.imodel, jobSubjectId, modelName);
    this.modelCache[modelName] = newModelId;
    return newModelId;
  }

  public updateElement(modelId: any, element: any, elementName: string) {
    if (element.ref === SpatialCategory || element.ref === DrawingCategory) {
      const existingCategoryId = element.ref.queryCategoryIdByName(this.imodel, modelId, elementName);
      if (existingCategoryId) {
        this.categoryCache[elementName] = existingCategoryId;
        return existingCategoryId;
      }
      const newCategoryId = element.ref.insert(this.imodel, modelId, elementName);
      this.categoryCache[elementName] = newCategoryId;
      return newCategoryId;
    }
  }

  public async updateRelationshipClass(relationshipClass: any) {
    const tableName = relationshipClass.ref.tableName;
    const tableData = await this.dataFetcher.fetchTableData(tableName);
    for (const elementData of tableData) {
      const sourceModelId = this.modelCache[relationshipClass.sourceModelName];
      const targetModelId = this.modelCache[relationshipClass.targetModelName];
      const sourceCode = this.getCode(relationshipClass.sourceRef.className, sourceModelId, elementData[relationshipClass.sourceKey]);
      const targetCode = this.getCode(relationshipClass.targetRef.className, targetModelId, elementData[relationshipClass.targetKey]);
      const sourceId = this.imodel.elements.queryElementIdByCode(sourceCode)!;
      const targetId = this.imodel.elements.queryElementIdByCode(targetCode)!;

      if (relationshipClass.ref.className in COBieRelatedElements) {
        const sourceElement = this.imodel.elements.getElement(sourceId);
        const targetElement = this.imodel.elements.getElement(targetId);
        const relatedElement = new relationshipClass.ref(sourceId, targetId, relationshipClass.ref.classFullName);
        const updatedElement = relationshipClass.ref.addRelatedElement(sourceElement, targetElement, relatedElement);
        updatedElement.update();
      } else if (relationshipClass.ref.className in COBieRelationships) {
        if (!sourceId || !targetId) continue;
        const relationship = this.imodel.relationships.tryGetInstance(relationshipClass.ref.classFullName, { sourceId, targetId });
        if (relationship) continue;
        const relationshipProps = relationshipClass.ref.createProps(sourceId, targetId);
        const relationshipId = this.imodel.relationships.insertInstance(relationshipProps);
      }
    }
  }

  public async updateElementClass(modelId: any, elementClass: any) {
    const tableName = elementClass.ref.tableName;
    const tableData = await this.dataFetcher.fetchTableData(tableName);
    const categoryId = this.categoryCache[elementClass.categoryName];
    const primaryKey = this.dataFetcher.getTablePrimaryKey(tableName);
    const codeSpec: CodeSpec = this.imodel.codeSpecs.getByName(COBieElements.CodeSpecs.COBie);

    for (const elementData of tableData) {
      const guid = tableName + elementData[`${tableName}.${primaryKey}`];
      const code = new Code({ spec: codeSpec.id, scope: modelId, value: guid });
      const sourceItem: SourceItem = { id: guid, checksum: hash.MD5(JSON.stringify(elementData)) };
      const changeResults: ChangeResults = this.connector.synchronizer.detectChanges(modelId, tableName, sourceItem);

      if (changeResults.state === ItemState.Unchanged) {
        this.connector.synchronizer.onElementSeen(changeResults.id!);
        continue;
      }

      const props = elementClass.ref.createProps(modelId, code, elementClass, elementData, categoryId);
      this.addForeignProps(props, elementClass, elementData);
      if (props.placement) this.updateExtent(props.placement);

      const existingElementId = this.imodel.elements.queryElementIdByCode(code);
      const element = this.imodel.elements.createElement(props);

      if (existingElementId) element.id = existingElementId;
      const syncResults: SynchronizationResults = { element, itemState: changeResults.state };
      this.connector.synchronizer.updateIModel(syncResults, modelId, sourceItem, tableName);
      this.elementCache[guid] = element.id;

      if (elementClass.typeDefinition && changeResults.state === ItemState.New)
        this.updateTypeDefinition(element, elementClass.typeDefinition, elementData);

    }
  }

  public addForeignProps(props: any, elementClass: any, elementData: any) {
    const { className } = elementClass.ref;
    const { properties } = this.schemaItems[className];
    for (const prop of properties) {
      const attribute = prop.name in PropertyRenameReverseMap ? PropertyRenameReverseMap[prop.name] : prop.name;
      props[prop.name] = elementData[`${className}.${attribute}`];
    }
  }

  public updateTypeDefinition(element: any, typeClass: any, elementData: any) {
    const typeCode = this.getCode(typeClass.ref.className, this.modelCache[typeClass.modelName], elementData[typeClass.key]);
    const typeDef = this.imodel.elements.getElement(typeCode);
    element.typeDefinition = typeDef;
    element.update();
  }

  public updateExtent(placement: Placement3d) {
    const targetPlacement: Placement3d = Placement3d.fromJSON(placement);
    const targetExtents: AxisAlignedBox3d = targetPlacement.calculateRange();
    if (!targetExtents.isNull && !this.imodel.projectExtents.containsRange(targetExtents)) {
      targetExtents.extendRange(this.imodel.projectExtents);
      this.imodel.updateProjectExtents(targetExtents);
    }
  }

  public getCode(tableName: string, modelId: Id64String, keyValue: string) {
    const codeValue = `${tableName}${keyValue}`;
    const codeSpec: CodeSpec = this.imodel.codeSpecs.getByName(COBieElements.CodeSpecs.COBie);
    return new Code({spec: codeSpec.id, scope: modelId, value: codeValue});
  }
}
