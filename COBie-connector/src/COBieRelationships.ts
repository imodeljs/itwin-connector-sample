/*---------------------------------------------------------------------------------------------
* Copyright (c) Bentley Systems, Incorporated. All rights reserved.
* See LICENSE.md in the project root for license terms and full copyright notice.
*--------------------------------------------------------------------------------------------*/

import { ElementRefersToElements, ElementGroupsMembers } from "@bentley/imodeljs-backend";
import { Id64String } from "@bentley/bentleyjs-core";

export class ComponentConnectsToComponent extends ElementRefersToElements {
  public static get className(): string { return "ComponentConnectsToComponent"; }
  public static get tableName(): string { return "Connection"; }
  public static get classFullName(): string { return "COBieConnectorDynamic:ComponentConnectsToComponent"; }
  public static createProps(sourceId: Id64String, targetId: Id64String) {
    return { sourceId, targetId, classFullName: ComponentConnectsToComponent.classFullName };
  }
}

export class SystemGroupsComponents extends ElementGroupsMembers {
  public static get className(): string { return "SystemGroupsComponents"; }
  public static get tableName(): string { return "System"; }
  public static get classFullName(): string { return "COBieConnectorDynamic:SystemGroupsComponents"; }
  public static createProps(sourceId: Id64String, targetId: Id64String) {
    return { sourceId, targetId, classFullName: SystemGroupsComponents.classFullName };
  }
}

export class ZoneIncludesSpaces extends ElementGroupsMembers {
  public static get className(): string { return "ZoneIncludesSpaces"; }
  public static get tableName(): string { return "Zone"; }
  public static get classFullName(): string { return "COBieConnectorDynamic:ZoneIncludesSpaces"; }
  public static createProps(sourceId: Id64String, targetId: Id64String) {
    return { sourceId, targetId, classFullName: ZoneIncludesSpaces.classFullName };
  }
}
