/*---------------------------------------------------------------------------------------------
* Copyright (c) Bentley Systems, Incorporated. All rights reserved.
* See LICENSE.md in the project root for license terms and full copyright notice.
*--------------------------------------------------------------------------------------------*/

import { assert } from "@bentley/bentleyjs-core";
import * as dotenv from "dotenv";

export function loadTestConfig() {
  // Load environment variables from .env file
  const result = dotenv.config();
  if (result.error)
    throw result.error;

  assert(!!process.env.TEST_USER_EMAIL, `Missing required env var: "TEST_USER_EMAIL"`);
  assert(!!process.env.TEST_USER_PASSWORD, `Missing required env var: "TEST_USER_PASSWORD"`);
  assert(!!process.env.CLIENT_ID, `Missing required env var: "CLIENT_ID"`);
  assert(!!process.env.CLIENT_REDIRECT_URI, `Missing required env var: "CLIENT_REDIRECT_URI"`);
  assert(!!process.env.CONTEXT_ID, `Missing required env var: "CONTEXT_ID"`);

  return {
    TEST_USER_EMAIL: process.env.TEST_USER_EMAIL,
    TEST_USER_PASSWORD: process.env.TEST_USER_PASSWORD,
    CLIENT_ID: process.env.CLIENT_ID,
    CLIENT_REDIRECT_URI: process.env.CLIENT_REDIRECT_URI,
    CONTEXT_ID: process.env.CONTEXT_ID,
  };
}

export type TestConfig = ReturnType<typeof loadTestConfig>;