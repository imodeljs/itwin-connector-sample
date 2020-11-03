/*---------------------------------------------------------------------------------------------
* Copyright (c) Bentley Systems, Incorporated. All rights reserved.
* See LICENSE.md in the project root for license terms and full copyright notice.
*--------------------------------------------------------------------------------------------*/

import { IModelDb, InformationRecordElement, PhysicalType, GroupInformationElement, FunctionalElement, ElementMultiAspect, Document as BisCoreDocument, ElementAspect, GeometricModel3d, PhysicalElement, SpatialElement, GeometricElement3d } from "@bentley/imodeljs-backend";
import { Code, Placement3d } from "@bentley/imodeljs-common";
import { Point3d, YawPitchRollAngles, Range3d } from "@bentley/geometry-core";
import { Id64String } from "@bentley/bentleyjs-core";

export enum CodeSpecs {
  COBie = "COBieConnectorDynamicCOBie",
}

function addPlacement(props: any, elementData: any) {
  const placement = new Placement3d(new Point3d(), new YawPitchRollAngles(), new Range3d());
  if (elementData["Coordinate.id"] !== null) {
    placement.origin.x = elementData["Coordinate.coordinatexaxis"];
    placement.origin.y = elementData["Coordinate.coordinateyaxis"];
    placement.origin.z = elementData["Coordinate.coordinatezaxis"];
  }
  props.placement = placement;
}

/**
 *  PhysicalElement
 */

export class Component extends PhysicalElement {
  public static get className(): string { return "Component"; }
  public static get tableName(): string { return "Component"; }
  public static get classFullName(): string { return "COBieConnectorDynamic:Component"; }
  public static createProps(modelId: Id64String, code: Code, elementClass: any, elementData: any, categoryId: Id64String) {
    const props: any = {
      code,
      userLabel: elementData[`${this.className}.name`],
      category: categoryId,
      model: modelId,
      classFullName: this.classFullName,
    };
    addPlacement(props, elementData);
    return props;
  }
}

/**
 * SpatialLocationElement
 */

export class Space extends SpatialElement {
  public static get className(): string { return "Space"; }
  public static get tableName(): string { return "Space"; }
  public static get classFullName(): string { return "COBieConnectorDynamic:Space"; }
  public static createProps(modelId: Id64String, code: Code, elementClass: any, elementData: any, categoryId: Id64String) {
    const props: any = {
      code,
      userLabel: elementData[`${this.className}.name`],
      category: categoryId,
      model: modelId,
      classFullName: this.classFullName,
    };
    addPlacement(props, elementData);
    props.footprintArea = elementData["Space.grossarea"];
    return props;
  }
}

export class Floor extends SpatialElement {
  public static get className(): string { return "Floor"; }
  public static get tableName(): string { return "Floor"; }
  public static get classFullName(): string { return "COBieConnectorDynamic:Floor"; }
  public static createProps(modelId: Id64String, code: Code, elementClass: any, elementData: any, categoryId: Id64String) {
    const props: any = {
      code,
      userLabel: elementData[`${this.className}.name`],
      category: categoryId,
      model: modelId,
      classFullName: this.classFullName,
    };
    addPlacement(props, elementData);
    return props;
  }
}

export class Facility extends SpatialElement {
  public static get className(): string { return "Facility"; }
  public static get tableName(): string { return "Facility"; }
  public static get classFullName(): string { return "COBieConnectorDynamic:Facility"; }
  public static createProps(modelId: Id64String, code: Code, elementClass: any, elementData: any, categoryId: Id64String) {
    const props: any = {
      code,
      userLabel: elementData[`${this.className}.name`],
      category: categoryId,
      model: modelId,
      classFullName: this.classFullName,
    };
    addPlacement(props, elementData);
    return props;
  }
}

/**
 * FunctionalElement
 */

/**
 * DefinitionElement
 */

export class Type extends PhysicalType {
  public static get className(): string { return "Type"; }
  public static get tableName(): string { return "Type"; }
  public static get classFullName(): string { return "COBieConnectorDynamic:Type"; }
  public constructor(props: any, iModel: IModelDb) {
    super(props, iModel);
  }
  public static createProps(modelId: Id64String, code: Code, elementClass: any, elementData: any, categoryId?: Id64String) {
    const props: any = {
      code,
      userLabel: elementData[`${this.className}.name`],
      model: modelId,
      classFullName: this.classFullName,
    };
    return props;
  }
}

/**
 * GroupInformationElement
 */

export class Zone extends GroupInformationElement {
  public static get className(): string { return "Zone"; }
  public static get tableName(): string { return "Zone"; }
  public static get classFullName(): string { return "COBieConnectorDynamic:Zone"; }
  public constructor(props: any, iModel: IModelDb) {
    super(props, iModel);
  }
  public static createProps(modelId: Id64String, code: Code, elementClass: any, elementData: any, categoryId?: Id64String) {
    const props: any = {
      code,
      userLabel: elementData[`${this.className}.name`],
      model: modelId,
      classFullName: this.classFullName,
    };
    return props;
  }
}

export class System extends GroupInformationElement {
  public static get className(): string { return "System"; }
  public static get tableName(): string { return "System"; }
  public static get classFullName(): string { return "COBieConnectorDynamic:System"; }
  public constructor(props: any, iModel: IModelDb) {
    super(props, iModel);
  }
  public static createProps(modelId: Id64String, code: Code, elementClass: any, elementData: any, categoryId?: Id64String) {
    const props: any = {
      code,
      userLabel: elementData[`${this.className}.name`],
      model: modelId,
      classFullName: this.classFullName,
    };
    return props;
  }
}

/**
 * InformationRecordElement
 */

export class Connection extends InformationRecordElement {
  public static get className(): string { return "Connection"; }
  public static get tableName(): string { return "Connection"; }
  public static get classFullName(): string { return "COBieConnectorDynamic:Connection"; }
  public static createProps(modelId: Id64String, code: Code, elementClass: any, elementData: any, categoryId: Id64String) {
    const props: any = {
      code,
      userLabel: elementData[`${this.className}.name`],
      model: modelId,
      classFullName: this.classFullName,
    };
    return props;
  }
}

export class Assembly extends InformationRecordElement {
  public static get className(): string { return "Assembly"; }
  public static get tableName(): string { return "Assembly"; }
  public static get classFullName(): string { return "COBieConnectorDynamic:Assembly"; }
  public static createProps(modelId: Id64String, code: Code, elementClass: any, elementData: any, categoryId: Id64String) {
    const props: any = {
      code,
      userLabel: elementData[`${this.className}.name`],
      model: modelId,
      classFullName: this.classFullName,
    };
    return props;
  }
}

export class Attribute extends InformationRecordElement {
  public static get className(): string { return "Attribute"; }
  public static get tableName(): string { return "Attribute"; }
  public static get classFullName(): string { return "COBieConnectorDynamic:Attribute"; }
  public static createProps(modelId: Id64String, code: Code, elementClass: any, elementData: any, categoryId: Id64String) {
    const props: any = {
      code,
      userLabel: elementData[`${this.className}.name`],
      model: modelId,
      classFullName: this.classFullName,
    };
    return props;
  }
}

export class Contact extends InformationRecordElement {
  public static get className(): string { return "Contact"; }
  public static get tableName(): string { return "Contact"; }
  public static get classFullName(): string { return "COBieConnectorDynamic:Contact"; }
  public static createProps(modelId: Id64String, code: Code, elementClass: any, elementData: any, categoryId: Id64String) {
    const props: any = {
      code,
      userLabel: elementData[`${this.className}.name`],
      model: modelId,
      classFullName: this.classFullName,
    };
    return props;
  }
}

export class Impact extends InformationRecordElement {
  public static get className(): string { return "Impact"; }
  public static get tableName(): string { return "Impact"; }
  public static get classFullName(): string { return "COBieConnectorDynamic:Impact"; }
  public static createProps(modelId: Id64String, code: Code, elementClass: any, elementData: any, categoryId: Id64String) {
    const props: any = {
      code,
      userLabel: elementData[`${this.className}.name`],
      model: modelId,
      classFullName: this.classFullName,
    };
    return props;
  }
}

export class Issue extends InformationRecordElement {
  public static get className(): string { return "Issue"; }
  public static get tableName(): string { return "Issue"; }
  public static get classFullName(): string { return "COBieConnectorDynamic:Issue"; }
  public static createProps(modelId: Id64String, code: Code, elementClass: any, elementData: any, categoryId: Id64String) {
    const props: any = {
      code,
      userLabel: elementData[`${this.className}.name`],
      model: modelId,
      classFullName: this.classFullName,
    };
    return props;
  }
}

export class Spare extends InformationRecordElement {
  public static get className(): string { return "Spare"; }
  public static get tableName(): string { return "Spare"; }
  public static get classFullName(): string { return "COBieConnectorDynamic:Spare"; }
  public static createProps(modelId: Id64String, code: Code, elementClass: any, elementData: any, categoryId: Id64String) {
    const props: any = {
      code,
      userLabel: elementData[`${this.className}.name`],
      model: modelId,
      classFullName: this.classFullName,
    };
    return props;
  }
}

export class Job extends InformationRecordElement {
  public static get className(): string { return "Job"; }
  public static get tableName(): string { return "Job"; }
  public static get classFullName(): string { return "COBieConnectorDynamic:Job"; }
  public static createProps(modelId: Id64String, code: Code, elementClass: any, elementData: any, categoryId: Id64String) {
    const props: any = {
      code,
      userLabel: elementData[`${this.className}.name`],
      model: modelId,
      classFullName: this.classFullName,
    };
    return props;
  }
}

export class Resource extends InformationRecordElement {
  public static get className(): string { return "Resource"; }
  public static get tableName(): string { return "Resource"; }
  public static get classFullName(): string { return "COBieConnectorDynamic:Resource"; }
  public static createProps(modelId: Id64String, code: Code, elementClass: any, elementData: any, categoryId: Id64String) {
    const props: any = {
      code,
      userLabel: elementData[`${this.className}.name`],
      model: modelId,
      classFullName: this.classFullName,
    };
    return props;
  }
}

/**
 * Document
 */
export class Document extends BisCoreDocument {
  public static get className(): string { return "Document"; }
  public static get tableName(): string { return "Document"; }
  public static get classFullName(): string { return "COBieConnectorDynamic:Document"; }
  public constructor(props: any, iModel: IModelDb) {
    super(props, iModel);
  }
  public static createProps(modelId: Id64String, code: Code, elementClass: any, elementData: any, categoryId?: Id64String) {
    const props: any = {
      code,
      userLabel: elementData[`${this.className}.name`],
      model: modelId,
      classFullName: this.classFullName,
    };
    return props;
  }
}
