import { deleteUserByEmail, TEST_USER_EMAILS } from "./auth-test-utils";

export default async function globalTeardown() {
  for (const email of TEST_USER_EMAILS) {
    try {
      await deleteUserByEmail(email);
    } catch (error) {
      console.warn(`Failed to clean up e2e user ${email}:`, error);
    }
  }
}
