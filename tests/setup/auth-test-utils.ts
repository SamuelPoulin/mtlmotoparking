import { mkdir, rm } from "node:fs/promises";

import { auth } from "@/src/lib/auth";

export const AUTH_DIR = "tests/.auth";
export const ADMIN_STORAGE_STATE = `${AUTH_DIR}/admin.json`;
export const USER_STORAGE_STATE = `${AUTH_DIR}/user.json`;

export const ADMIN_EMAIL = process.env.E2E_ADMIN_EMAIL as string;
export const USER_EMAIL = process.env.E2E_USER_EMAIL as string;
export const TEST_USER_EMAILS = [ADMIN_EMAIL, USER_EMAIL] as const;

export async function ensureAuthDirAndResetStates() {
  await mkdir(AUTH_DIR, { recursive: true });
  await rm(ADMIN_STORAGE_STATE, { force: true });
  await rm(USER_STORAGE_STATE, { force: true });
}

export async function deleteUserByEmail(email: string) {
  const ctx = await auth.$context;
  const existing = await ctx.internalAdapter.findUserByEmail(email);
  if (existing) await ctx.internalAdapter.deleteUser(existing.user.id);
}
