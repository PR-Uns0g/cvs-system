import { db } from "../../prisma/db";

export async function ensureAppUser(kratosIdentityId: string): Promise<void> {
  const existingUser = await db.orm.public.AppUser.first({ id: kratosIdentityId });
  if (existingUser) {
    return;
  }

  await db.orm.public.AppUser.upsert({
    create: { id: kratosIdentityId },
    update: {},
    conflictOn: { id: kratosIdentityId },
  });
}
