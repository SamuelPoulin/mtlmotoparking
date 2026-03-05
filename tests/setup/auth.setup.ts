import { test as setup } from "@playwright/test";
import type { TestHelpers } from "better-auth/plugins";

import { auth } from "@/src/lib/auth";

import {
  ADMIN_EMAIL,
  ADMIN_STORAGE_STATE,
  USER_EMAIL,
  USER_STORAGE_STATE,
  ensureAuthDirAndResetStates,
  deleteUserByEmail,
} from "./auth-test-utils";

let testUtils: TestHelpers;

setup.beforeAll(async () => {
  await ensureAuthDirAndResetStates();

  const ctx = await auth.$context;
  testUtils = ctx.test;
});

async function createFreshUser(
  attrs: Parameters<TestHelpers["createUser"]>[0] & { email: string }
) {
  await deleteUserByEmail(attrs.email);

  const user = testUtils.createUser(attrs);
  return testUtils.saveUser(user);
}

setup("create admin auth state", async ({ context }) => {
  const adminUser = await createFreshUser({
    email: ADMIN_EMAIL,
    name: "E2E Admin",
    emailVerified: true,
    role: "admin",
  });

  const cookies = await testUtils.getCookies({
    userId: adminUser.id,
    domain: "localhost",
  });
  await context.addCookies(cookies);
  await context.storageState({ path: ADMIN_STORAGE_STATE });
});

setup("create user auth state", async ({ context }) => {
  const regularUser = await createFreshUser({
    email: USER_EMAIL,
    name: "E2E User",
    emailVerified: true,
    role: "user",
  });

  const cookies = await testUtils.getCookies({
    userId: regularUser.id,
    domain: "localhost",
  });

  await context.addCookies(cookies);
  await context.storageState({ path: USER_STORAGE_STATE });
});
