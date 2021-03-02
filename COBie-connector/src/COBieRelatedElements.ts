/*---------------------------------------------------------------------------------------------
* Copyright (c) Bentley Systems, Incorporated. All rights reserved.
* See LICENSE.md in the project root for license terms and full copyright notice.
*--------------------------------------------------------------------------------------------*/

import { Id64String } from '@bentley/bentleyjs-core';
import { PhysicalElementAssemblesElements } from '@bentley/imodeljs-backend';
import { RelatedElement, RelatedElementProps } from '@bentley/imodeljs-common';
import * as COBieElements from './COBieElements';
import * as COBieRelatedElements from './COBieRelatedElements';

export class ComponentAssemblesComponents extends PhysicalElementAssemblesElements {
  public static get className(): string { return "ComponentAssemblesComponents"; }
  public static get tableName(): string { return "Assembly"; }
  public static get classFullName(): string { return "COBieConnectorDynamic:ComponentAssemblesComponents"; }
  public static addRelatedElement(parentComponentElement: COBieElements.Component, childComponentElement: COBieElements.Component, relatedElement: COBieRelatedElements.ComponentAssemblesComponents) {
    (childComponentElement as any).parent = relatedElement;
    return childComponentElement;
  }
  constructor(parentId: Id64String, childId: Id64String, relClassName: string) {
    super(parentId, relClassName);
  }
}

export class FloorComposesSpaces extends RelatedElement {
  public static get className(): string { return "FloorComposesSpaces"; }
  public static get tableName(): string { return "Space"; }
  public static get classFullName(): string { return "COBieConnectorDynamic:FloorComposesSpaces"; }
  public static addRelatedElement(floorElement: COBieElements.Floor, spaceElement: COBieElements.Space, relatedElement: COBieRelatedElements.FloorComposesSpaces) {
    (spaceElement as any).composingElement = relatedElement;
    return spaceElement;
  }
  constructor(sourceId: Id64String, targetId: Id64String, relClassName: string) {
    super({ id: sourceId, relClassName } as RelatedElementProps);
  }
}
