import bcrypt from "bcryptjs";
import { prisma } from "@/lib/prisma";
import { mobileLoginSchema } from "@/shared/mobile-contract";

// Shared credential verification: mobile accounts are the same accounts as the website.
// The dummy hash keeps unknown-account responses on the same bcrypt work path.
const dummyHash = bcrypt.hashSync("costera-non-account-password", 12);
export async function verifyCredentials(input: unknown) {
  const parsed = mobileLoginSchema.safeParse(input);
  if (!parsed.success) return null;
  const user = await prisma.user.findUnique({ where: { email: parsed.data.email } });
  const valid = await bcrypt.compare(parsed.data.password, user?.passwordHash ?? dummyHash);
  // Terminal staff have a real password hash so the timing stays even, but no
  // way in: they belong on a till, behind a PIN.
  if (user?.terminalOnly) return null;
  return user && valid ? user : null;
}
