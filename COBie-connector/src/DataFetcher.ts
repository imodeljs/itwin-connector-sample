/*---------------------------------------------------------------------------------------------
* Copyright (c) Bentley Systems, Incorporated. All rights reserved.
* See LICENSE.md in the project root for license terms and full copyright notice.
*--------------------------------------------------------------------------------------------*/

import { IModelStatus } from "@bentley/bentleyjs-core";
import { IModelError } from "@bentley/imodeljs-common";
import * as sqlite3 from "sqlite3";
import * as sqlite from "sqlite";

export class DataFetcher {
  public sourcePath: string;
  public sourceDb?: any;

  constructor(sourcePath: string) {
    this.sourcePath = sourcePath;
    this.sourceDb = undefined;
  }

  public async initialize() {
    this.sourceDb = await sqlite.open({ filename: this.sourcePath, driver: sqlite3.Database });
    if (!this.sourceDb) throw new IModelError(IModelStatus.BadArg, "Source database not found.");
  }

  public close() {
    this.sourceDb.close();
  }

  public async fetchTables() {
    const tables = await this.sourceDb.all("select * from sqlite_master where type='table'");
    return tables;
  }

  public async fetchColumns(tableName: string) {
    const cols = await this.sourceDb.all(`PRAGMA table_info(${tableName})`);
    return cols;
  }

  public async fetchTableData(tableName: string) {
    const colBuilder = [];
    const queryBuilder = [];
    const fkeyObject: any = TABLE_JOIN_MAP[tableName];

    const createColString = async (_tableName: string) => {
      const cols: [any] = await this.fetchColumns(_tableName);
      return cols.map((col: any) => `${_tableName}.${col.name} as "${_tableName}.${col.name}"`).join(", ");
    };

    for (const fkey in fkeyObject) {
      if (fkeyObject.hasOwnProperty(fkey)) {
        const referenced = fkeyObject[fkey];
        const colString = await createColString(referenced.tableName);
        colBuilder.push(colString);
        const join = `left outer join ${referenced.tableName} on ${tableName}.${fkey} = ${referenced.tableName}.${referenced.colName}`;
        queryBuilder.push(join);
      }
    }

    const baseColString = await createColString(tableName);
    colBuilder.unshift(baseColString);

    const selectedCols = colBuilder.join(", ");
    queryBuilder.unshift(`select ${selectedCols} from ${tableName}`);
    queryBuilder.push(`group by "${tableName}.id"`);

    const query = queryBuilder.join(" ");
    const tableData = await this.sourceDb.all(query);
    return tableData;
  }

  public async fetchAllData() {
    const allData: { [tableName: string]: any } = {};
    const tables = await this.fetchTables();
    for (const table of tables) {
      allData[table.name] = await this.fetchTableData(table.name);
    }
    return allData;
  }

  public getTablePrimaryKey(tableName: string) {
    switch (tableName) {
      case "Contact":
        return "email";
      case "Facility":
      case "Floor":
      case "Space":
      case "Type":
      case "Component":
      case "Spare":
      case "Resource":
        return "name";
      default:
        return "id";
    }
  }

}

const TABLE_JOIN_MAP: any = {
  Component: {
    name: {
      tableName: "Coordinate",
      colName: "name",
    },
  },
  Space: {
    name: {
      tableName: "Coordinate",
      colName: "name",
    },
  },
  Floor: {
    name: {
      tableName: "Coordinate",
      colName: "name",
    },
  },
};
