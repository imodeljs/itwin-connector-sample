/*---------------------------------------------------------------------------------------------
 * Copyright (c) Bentley Systems, Incorporated. All rights reserved.
 * See LICENSE.md in the project root for license terms and full copyright notice.
 *--------------------------------------------------------------------------------------------*/

import * as path from "path";
import { ClassRegistry, Schema, Schemas } from "@bentley/imodeljs-backend";
import * as elementsModule from "./COBieElements";
import * as relationshipsModule from "./COBieRelationships";

export class COBieSchema extends Schema {
  public static get schemaName(): string {
    return "COBieConnectorDynamic";
  }
  public static registerSchema() {
    if (this !== Schemas.getRegisteredSchema(this.schemaName)) {
      Schemas.unregisterSchema(this.schemaName);
      Schemas.registerSchema(this);
      ClassRegistry.registerModule(elementsModule, this);
      ClassRegistry.registerModule(relationshipsModule, this);
    }
  }
}
