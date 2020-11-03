/*---------------------------------------------------------------------------------------------
* Copyright (c) Bentley Systems, Incorporated. All rights reserved.
* See LICENSE.md in the project root for license terms and full copyright notice.
*--------------------------------------------------------------------------------------------*/

import { IModelJsFs, IModelHost, SnapshotDb, Subject, IModelDb } from "@bentley/imodeljs-backend";
import { AuthorizedClientRequestContext, AccessToken } from "@bentley/itwin-client";
import { Synchronizer } from "@bentley/imodel-bridge/lib/Synchronizer";
import * as path from "path";
import { ConnectorTestUtils } from "../ConnectorTestUtils";
import { KnownTestLocations } from "../KnownTestLocations";
import { COBieConnector } from "../../COBieConnector";
import { BridgeJobDefArgs } from "@bentley/imodel-bridge";

describe("COBie Sample Connector Unit Tests", () => {
  before(async () => {
    // ConnectorTestUtils.setupLogging();
    // ConnectorTestUtils.setupDebugLogLevels();
    // if (!IModelJsFs.existsSync(KnownTestLocations.outputDir)) IModelJsFs.mkdirSync(KnownTestLocations.outputDir);
    // await ConnectorTestUtils.startBackend();
  });

  after(async () => {
    // await ConnectorTestUtils.shutdownBackend();
  });

  beforeEach(async () => {
    await IModelHost.startup();
  });

  afterEach(async () => {
    await IModelHost.shutdown();
  });

  it("Should create empty snapshot and synchronize source data", async () => {
    const sourcePath = path.join(KnownTestLocations.assetsDir, "intermediary_v1.db");
    const targetPath = path.join(KnownTestLocations.outputDir, "final.db");
    if (IModelJsFs.existsSync(targetPath)) IModelJsFs.unlinkSync(targetPath);

    const connector = new COBieConnector();
    const targetDb = SnapshotDb.createEmpty(targetPath, { rootSubject: { name: "COBieConnector" }});
    const requestContext = new AuthorizedClientRequestContext(AccessToken.fromTokenString("Bearer test"));
    const sync = new Synchronizer(targetDb, false, requestContext);
    connector.synchronizer = sync;

    const jobSubject = Subject.create(targetDb, IModelDb.rootSubjectId, `COBieConnector:${sourcePath}`);
    jobSubject.insert();
    connector.jobSubject = jobSubject;

    await connector.openSourceData(sourcePath);
    await connector.onOpenIModel();

    await connector.importDomainSchema(requestContext);
    await connector.importDynamicSchema(requestContext);
    targetDb.saveChanges();

    await connector.importDefinitions();
    targetDb.saveChanges();

    await connector.updateExistingData();
    targetDb.saveChanges();
    const bridgeJobDef = new BridgeJobDefArgs();
    bridgeJobDef.sourcePath = sourcePath;
    ConnectorTestUtils.verifyIModel(targetDb, bridgeJobDef);
    targetDb.close();
  });
});
