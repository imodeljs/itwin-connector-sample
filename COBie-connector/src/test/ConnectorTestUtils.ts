/*---------------------------------------------------------------------------------------------
* Copyright (c) Bentley Systems, Incorporated. All rights reserved.
* See LICENSE.md in the project root for license terms and full copyright notice.
*--------------------------------------------------------------------------------------------*/

import { assert } from "chai";
import * as path from "path";
import {
  BentleyLoggerCategory, DbResult, Id64, Id64String, Logger, LogLevel
} from '@bentley/bentleyjs-core';
import { BridgeJobDefArgs } from '@bentley/imodel-bridge';
import { BridgeLoggerCategory } from '@bentley/imodel-bridge/lib/BridgeLoggerCategory';
import { IModelBankArgs, IModelBankUtils } from '@bentley/imodel-bridge/lib/IModelBankUtils';
import { IModelHubUtils } from '@bentley/imodel-bridge/lib/IModelHubUtils';
import { ChangeSet, IModelHubClientLoggerCategory } from '@bentley/imodelhub-client';
import {
  BackendLoggerCategory, ECSqlStatement, ExternalSourceAspect, IModelDb, IModelHost,
  IModelHostConfiguration, IModelJsFs, NativeLoggerCategory, PhysicalPartition, Subject
} from '@bentley/imodeljs-backend';
import { IModel } from '@bentley/imodeljs-common';
import { AuthorizedClientRequestContext, ITwinClientLoggerCategory } from '@bentley/itwin-client';
import * as COBieElement from '../COBieElements';
import { HubUtility } from './HubUtility';
import { KnownTestLocations } from './KnownTestLocations';

export class TestIModelInfo {
  private _name: string;
  private _id: string;
  private _localReadonlyPath: string;
  private _localReadWritePath: string;
  private _changeSets: ChangeSet[];

  constructor(name: string) {
    this._name = name;
    this._id = "";
    this._localReadonlyPath = "";
    this._localReadWritePath = "";
    this._changeSets = [];
  }

  get name(): string { return this._name; }
  set name(name: string) { this._name = name; }
  get id(): string { return this._id; }
  set id(id: string) { this._id = id; }
  get localReadonlyPath(): string { return this._localReadonlyPath; }
  set localReadonlyPath(localReadonlyPath: string) { this._localReadonlyPath = localReadonlyPath; }
  get localReadWritePath(): string { return this._localReadWritePath; }
  set localReadWritePath(localReadWritePath: string) { this._localReadWritePath = localReadWritePath; }
  get changeSets(): ChangeSet[] { return this._changeSets; }
  set changeSets(changeSets: ChangeSet[]) { this._changeSets = changeSets; }
}

function getCount(imodel: IModelDb, className: string) {
  let count = 0;
  imodel.withPreparedStatement("SELECT count(*) AS [count] FROM " + className, (stmt: ECSqlStatement) => {
    assert.equal(DbResult.BE_SQLITE_ROW, stmt.step());
    const row = stmt.getRow();
    count = row.count;
  });
  return count;
}

export class ConnectorTestUtils {
  public static setupLogging() {
    Logger.initializeToConsole();
    Logger.setLevelDefault(LogLevel.Error);

    if (process.env.imjs_test_logging_config === undefined) {
      // tslint:disable-next-line:no-console
      console.log(`You can set the environment variable imjs_test_logging_config to point to a logging configuration json file.`);
    }
    const loggingConfigFile: string = process.env.imjs_test_logging_config || path.join(__dirname, "logging.config.json");

    if (IModelJsFs.existsSync(loggingConfigFile)) {
      // tslint:disable-next-line:no-console
      console.log(`Setting up logging levels from ${loggingConfigFile}`);
      // tslint:disable-next-line:no-var-requires
      Logger.configureLevels(require(loggingConfigFile));
    }
  }

  private static initDebugLogLevels(reset?: boolean) {
    Logger.setLevelDefault(reset ? LogLevel.Error : LogLevel.Warning);
    Logger.setLevel(BentleyLoggerCategory.Performance, reset ? LogLevel.Error : LogLevel.Info);
    Logger.setLevel(BackendLoggerCategory.IModelDb, reset ? LogLevel.Error : LogLevel.Trace);
    Logger.setLevel(BridgeLoggerCategory.Framework, reset ? LogLevel.Error : LogLevel.Trace);
    Logger.setLevel(ITwinClientLoggerCategory.Clients, reset ? LogLevel.Error : LogLevel.Warning);
    Logger.setLevel(IModelHubClientLoggerCategory.IModelHub, reset ? LogLevel.Error : LogLevel.Warning);
    Logger.setLevel(ITwinClientLoggerCategory.Request, reset ? LogLevel.Error : LogLevel.Warning);

    Logger.setLevel(NativeLoggerCategory.DgnCore, reset ? LogLevel.Error : LogLevel.Warning);
    Logger.setLevel(NativeLoggerCategory.BeSQLite, reset ? LogLevel.Error : LogLevel.Warning);
    Logger.setLevel(NativeLoggerCategory.Licensing, reset ? LogLevel.Error : LogLevel.Warning);
    Logger.setLevel(NativeLoggerCategory.ECDb, LogLevel.Trace);
    Logger.setLevel(NativeLoggerCategory.ECObjectsNative, LogLevel.Trace);
    Logger.setLevel(NativeLoggerCategory.UnitsNative, LogLevel.Trace);
  }

  // Setup typical programmatic log level overrides here
  // Convenience method used to debug specific tests/fixtures
  public static setupDebugLogLevels() {
    ConnectorTestUtils.initDebugLogLevels(false);
  }

  public static resetDebugLogLevels() {
    ConnectorTestUtils.initDebugLogLevels(true);
  }

  public static async getTestModelInfo(requestContext: AuthorizedClientRequestContext, testProjectId: string, iModelName: string): Promise<TestIModelInfo> {
    const iModelInfo = new TestIModelInfo(iModelName);
    iModelInfo.id = await HubUtility.queryIModelIdByName(requestContext, testProjectId, iModelInfo.name);

    iModelInfo.changeSets = await IModelHost.iModelClient.changeSets.get(requestContext, iModelInfo.id);
    return iModelInfo;
  }

  public static async startBackend(clientArgs?: IModelBankArgs): Promise<void> {
    const config = new IModelHostConfiguration();
    config.concurrentQuery.concurrent = 4; // for test restrict this to two threads. Making closing connection faster
    config.cacheDir = KnownTestLocations.outputDir;
    config.imodelClient = (undefined === clientArgs) ? IModelHubUtils.makeIModelClient() : IModelBankUtils.makeIModelClient(clientArgs);
    await IModelHost.startup(config);
  }

  public static async shutdownBackend(): Promise<void> {
    await IModelHost.shutdown();
  }

  public static verifyIModel(imodel: IModelDb, bridgeJobDef: BridgeJobDefArgs, isUpdate: boolean = false, isSchemaUpdate: boolean = false) {
    assert.isDefined(imodel.getMetaData("COBieConnectorDynamic:Contact"), "Schema is imported.");
    assert.equal(isUpdate ? 56 : 58, getCount(imodel, "COBieConnectorDynamic:Contact"));
    assert.equal(1, getCount(imodel, "COBieConnectorDynamic:Facility"));
    assert.equal(4, getCount(imodel, "COBieConnectorDynamic:Floor"));
    assert.equal(22, getCount(imodel, "COBieConnectorDynamic:Space"));
    assert.equal(20, getCount(imodel, "COBieConnectorDynamic:Zone"));
    assert.equal(43, getCount(imodel, "COBieConnectorDynamic:Type"));
    assert.equal(isUpdate ? 233 : 232, getCount(imodel, "COBieConnectorDynamic:Component"));
    assert.equal(36, getCount(imodel, "COBieConnectorDynamic:System"));
    assert.equal(3, getCount(imodel, "COBieConnectorDynamic:Spare"));
    assert.equal(10, getCount(imodel, "COBieConnectorDynamic:Resource"));
    assert.equal(94, getCount(imodel, "COBieConnectorDynamic:Job"));
    assert.equal(0, getCount(imodel, "COBieConnectorDynamic:Impact"));
    assert.equal(48, getCount(imodel, "COBieConnectorDynamic:Document"));
    assert.equal(94, getCount(imodel, "COBieConnectorDynamic:Attribute"));
    assert.equal(0, getCount(imodel, "COBieConnectorDynamic:Issue"));
    assert.equal(1, getCount(imodel, "BisCore:SpatialCategory"));
    assert.equal(22, getCount(imodel, "COBieConnectorDynamic:FloorComposesSpaces"));
    assert.equal(36, getCount(imodel, "COBieConnectorDynamic:SystemGroupsComponents"));
    assert.equal(20, getCount(imodel, "COBieConnectorDynamic:ZoneIncludesSpaces"));
    assert.equal(2, getCount(imodel, "COBieConnectorDynamic:Connection"));
    assert.equal(2, getCount(imodel, "COBieConnectorDynamic:ComponentConnectsToComponent"));
    assert.equal(2, getCount(imodel, "COBieConnectorDynamic:Assembly"));
    assert.equal(2, getCount(imodel, "COBieConnectorDynamic:ComponentAssemblesComponents"));
    // assert.equal(704, getCount(imodel, "BisCore:ExternalSourceAspect"));

    assert.isTrue(imodel.codeSpecs.hasName(COBieElement.CodeSpecs.COBie));
    const jobSubjectName = `COBieConnector:${bridgeJobDef.sourcePath!}`;
    const subjectId: Id64String = imodel.elements.queryElementIdByCode(Subject.createCode(imodel, IModel.rootSubjectId, jobSubjectName))!;
    assert.isTrue(Id64.isValidId64(subjectId));

    const spatialLocationModel = imodel.elements.queryElementIdByCode(PhysicalPartition.createCode(imodel, subjectId, "SpatialLocationModel1"));
    assert.isTrue(spatialLocationModel !== undefined);
    assert.isTrue(Id64.isValidId64(spatialLocationModel!));

    const ids = ExternalSourceAspect.findBySource(imodel, spatialLocationModel!, "Space", "SpaceSite");
    assert.isTrue(Id64.isValidId64(ids.aspectId!));
    assert.isTrue(Id64.isValidId64(ids.elementId!));
    const spaceElement = imodel.elements.getElement(ids.elementId!);
    assert.equal((spaceElement as any).floorname, isUpdate ? "Level 2" : "Level 1", "Floorname was updated.");

    if (isSchemaUpdate) {
      const ids = ExternalSourceAspect.findBySource(imodel, spatialLocationModel!, "Floor", "FloorLevel 1");
      assert.isTrue(Id64.isValidId64(ids.aspectId!));
      assert.isTrue(Id64.isValidId64(ids.elementId!));
      const floorElement = imodel.elements.getElement(ids.elementId!);
      assert.equal((floorElement as any).buildingname, "B1");
    }
  }
}
