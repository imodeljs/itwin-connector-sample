/*---------------------------------------------------------------------------------------------
* Copyright (c) Bentley Systems, Incorporated. All rights reserved.
* See LICENSE.md in the project root for license terms and full copyright notice.
*--------------------------------------------------------------------------------------------*/

import { expect } from "chai";
import * as path from "path";
import { TestUtility } from "@bentley/oidc-signin-tool";
import { BridgeJobDefArgs, BridgeRunner } from "@bentley/imodel-bridge";
import { ServerArgs } from "@bentley/imodel-bridge/lib/IModelHubUtils";
import { ConnectorTestUtils, TestIModelInfo } from "../ConnectorTestUtils";
import { BriefcaseDb, BriefcaseManager, IModelJsFs } from "@bentley/imodeljs-backend";
import { AccessToken, AuthorizedClientRequestContext } from "@bentley/itwin-client";
import { BentleyStatus, ClientRequestContext, Logger } from "@bentley/bentleyjs-core";
import { KnownTestLocations } from "../KnownTestLocations";
import { HubUtility } from "../HubUtility";
import { loadTestConfig, TestConfig } from "./TestConfig";

describe("COBie Sample Connector Integration Test (Online)", () => {

  let testProjectId: string;
  let requestContext: AuthorizedClientRequestContext;
  let sampleIModel: TestIModelInfo;
  let testConfig: TestConfig;

  before(async () => {
    testConfig = loadTestConfig();

    ConnectorTestUtils.setupLogging();
    ConnectorTestUtils.setupDebugLogLevels();
    await ConnectorTestUtils.startBackend();

    if (!IModelJsFs.existsSync(KnownTestLocations.outputDir))
      IModelJsFs.mkdirSync(KnownTestLocations.outputDir);

    try {
      const authClient = await TestUtility.getAuthorizationClient(
        {
          email: testConfig.TEST_USER_EMAIL,
          password: testConfig.TEST_USER_PASSWORD
        },
        {
          clientId: testConfig.CLIENT_ID,
          redirectUri: testConfig.CLIENT_REDIRECT_URI,
          scope: "openid email profile organization imodelhub context-registry-service:read-only",
        }
      );
      requestContext = new AuthorizedClientRequestContext(await authClient.getAccessToken());
    } catch (error) {
      Logger.logError("Error", `Failed with error: ${error}`);
    }

    testProjectId = testConfig.CONTEXT_ID;

    const targetIModelId = await HubUtility.recreateIModel(requestContext, testConfig.CONTEXT_ID, "TestSampleConnector");
    expect(undefined !== targetIModelId);
    sampleIModel = await ConnectorTestUtils.getTestModelInfo(requestContext, testConfig.CONTEXT_ID, "TestSampleConnector");
  });

  after(async () => {
    await ConnectorTestUtils.shutdownBackend();
    IModelJsFs.purgeDirSync(KnownTestLocations.outputDir);
    if (IModelJsFs.existsSync(path.join(KnownTestLocations.assetsDir, "test.db")))
      IModelJsFs.unlinkSync(path.join(KnownTestLocations.assetsDir, "test.db"));
  });

  const runConnector = async (bridgeJobDef: BridgeJobDefArgs, serverArgs: ServerArgs, isUpdate: boolean = false, isSchemaUpdate: boolean = false) => {
    const runner = new BridgeRunner(bridgeJobDef, serverArgs);
    const status = await runner.synchronize();
    expect(status === BentleyStatus.SUCCESS);
    const briefcases = BriefcaseManager.getCachedBriefcases(serverArgs.iModelId);
    expect(briefcases !== undefined);
    const imodel = await BriefcaseDb.open(new ClientRequestContext(), { fileName: briefcases[0].fileName, readonly: true });
    ConnectorTestUtils.verifyIModel(imodel, bridgeJobDef, isUpdate, isSchemaUpdate);
    imodel.close();
  };

  const getEnv = async () => {
    const bridgeJobDef = new BridgeJobDefArgs();
    const testSourcePath = path.join(KnownTestLocations.assetsDir, "test.db");
    bridgeJobDef.sourcePath = testSourcePath;
    bridgeJobDef.bridgeModule = path.join(__dirname, "..", "..", "COBieConnector.js");
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

  it("should update both data and schema of an iModel", async () => {
    const { testSourcePath, bridgeJobDef, serverArgs } = await getEnv();
    const sourcePath = path.join(KnownTestLocations.assetsDir, "intermediary_v3.db");
    IModelJsFs.unlinkSync(testSourcePath);
    IModelJsFs.copySync(sourcePath, testSourcePath, { overwrite: true });
    await runConnector(bridgeJobDef, serverArgs, true, true);
  });
});
