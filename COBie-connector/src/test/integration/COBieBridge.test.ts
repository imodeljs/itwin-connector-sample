/*---------------------------------------------------------------------------------------------
* Copyright (c) Bentley Systems, Incorporated. All rights reserved.
* See LICENSE.md in the project root for license terms and full copyright notice.
*--------------------------------------------------------------------------------------------*/

import { expect } from "chai";
import * as path from "path";
import { TestUsers, TestUtility } from "@bentley/oidc-signin-tool";
import { BridgeJobDefArgs, BridgeRunner } from "@bentley/imodel-bridge";
import { ServerArgs } from "@bentley/imodel-bridge/lib/IModelHubUtils";
import { ConnectorTestUtils, TestIModelInfo } from "../ConnectorTestUtils";
import { BriefcaseDb, BriefcaseManager, IModelJsFs } from "@bentley/imodeljs-backend";
import { AccessToken, AuthorizedClientRequestContext } from "@bentley/itwin-client";
import { BentleyStatus, ClientRequestContext, Logger, OpenMode } from "@bentley/bentleyjs-core";
import { KnownTestLocations } from "../KnownTestLocations";
import { HubUtility } from "../HubUtility";

describe("COBie Sample Connector Integration Test (Online)", () => {

  let testProjectId: string;
  let requestContext: AuthorizedClientRequestContext;
  let sampleIModel: TestIModelInfo;
  const fs = require("fs");
  // let managerRequestContext: AuthorizedClientRequestContext;

  before(async () => {
    // ConnectorTestUtils.setupLogging();
    // ConnectorTestUtils.setupDebugLogLevels();
    await ConnectorTestUtils.startBackend();

    if (!IModelJsFs.existsSync(KnownTestLocations.outputDir))
      IModelJsFs.mkdirSync(KnownTestLocations.outputDir);

    try {
      requestContext = await TestUtility.getAuthorizedClientRequestContext(TestUsers.regular);
    } catch (error) {
      Logger.logError("Error", `Failed with error: ${error}`);
    }
    testProjectId = await HubUtility.queryProjectIdByName(requestContext, "imodeljs_sampleConnector_test");
    const targetIModelId = await HubUtility.recreateIModel(requestContext, testProjectId, "TestSampleConnector");
    expect(undefined !== targetIModelId);
    sampleIModel = await ConnectorTestUtils.getTestModelInfo(requestContext, testProjectId, "TestSampleConnector");

    // Purge briefcases that are close to reaching the acquire limit
    // managerRequestContext = await TestUtility.getAuthorizedClientRequestContext(TestUsers.manager);
    // await HubUtility.purgeAcquiredBriefcases(managerRequestContext, "imodeljs_sampleConnector_test", "TestSampleConnector");
  });

  after(async () => {
    await ConnectorTestUtils.shutdownBackend();
    IModelJsFs.purgeDirSync(KnownTestLocations.outputDir);
    IModelJsFs.unlinkSync(path.join(KnownTestLocations.assetsDir, "test.db"));
  });

  const runConnector = async (bridgeJobDef: BridgeJobDefArgs, serverArgs: ServerArgs, isUpdate: boolean = false, isSchemaUpdate: boolean = false) => {
    const runner = new BridgeRunner(bridgeJobDef, serverArgs);
    const status = await runner.synchronize();
    expect(status === BentleyStatus.SUCCESS);
    const briefcases = BriefcaseManager.getBriefcases();
    const briefcaseEntry = BriefcaseManager.findBriefcaseByKey(briefcases[0].key);
    expect(briefcaseEntry !== undefined);
    let imodel: BriefcaseDb;
    imodel = await BriefcaseDb.open(new ClientRequestContext(), briefcases[0].key, { openAsReadOnly: true });
    ConnectorTestUtils.verifyIModel(imodel, bridgeJobDef, isUpdate, isSchemaUpdate);
    briefcaseEntry!.openMode = OpenMode.ReadWrite;
    imodel.close();
  };

  const getEnv = async () => {
    const bridgeJobDef = new BridgeJobDefArgs();
    const testSourcePath = path.join(KnownTestLocations.assetsDir, "test.db");
    bridgeJobDef.sourcePath = testSourcePath;
    bridgeJobDef.bridgeModule = path.join(__dirname, "..\\..\\COBieBridge.js");
    const serverArgs = new ServerArgs();
    serverArgs.contextId = testProjectId;
    serverArgs.iModelId = sampleIModel.id;
    serverArgs.getToken = async (): Promise<AccessToken> => {
      return requestContext.accessToken;
    };
    return { testSourcePath, bridgeJobDef, serverArgs };
  };

  it("should create an iModel", async () => {
    const { testSourcePath, bridgeJobDef, serverArgs } = await getEnv();
    const sourcePath = path.join(KnownTestLocations.assetsDir, "intermediary_v1.db");
    IModelJsFs.copySync(sourcePath, testSourcePath, { overwrite: true });
    await runConnector(bridgeJobDef, serverArgs, false, false);
  });

  it("should not update an unchanged iModel", async () => {
    const { testSourcePath, bridgeJobDef, serverArgs } = await getEnv();
    const sourcePath = path.join(KnownTestLocations.assetsDir, "intermediary_v1.db");
    IModelJsFs.unlinkSync(testSourcePath);
    IModelJsFs.copySync(sourcePath, testSourcePath, { overwrite: true });
    await runConnector(bridgeJobDef, serverArgs, false, false);
  });

  /*
  it("should update the data in an iModel", async () => {
    const { testSourcePath, bridgeJobDef, serverArgs } = await getEnv();
    const sourcePath = path.join(KnownTestLocations.assetsDir, "intermediary_v2.db");
    IModelJsFs.unlinkSync(testSourcePath);
    IModelJsFs.copySync(sourcePath, testSourcePath, { overwrite: true });
    await runBridge(bridgeJobDef, serverArgs, true, false);
  });
  */

  it("should update both data and schema of an iModel", async () => {
    const { testSourcePath, bridgeJobDef, serverArgs } = await getEnv();
    const sourcePath = path.join(KnownTestLocations.assetsDir, "intermediary_v3.db");
    IModelJsFs.unlinkSync(testSourcePath);
    IModelJsFs.copySync(sourcePath, testSourcePath, { overwrite: true });
    await runConnector(bridgeJobDef, serverArgs, true, true);
  });
});
