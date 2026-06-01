import prisma from "#services/prisma.ts";
import { afterAll, beforeEach } from "vitest";

export async function clearDb() {
  if (process.env.NODE_ENV !== "test") {
    throw new Error("Can't drop non-test DB!");
  }

  await prisma.$transaction([
    prisma.token.deleteMany({}),
    prisma.user.deleteMany({}),
  ]);
}

export async function disconnectDb() {
  await prisma.$disconnect();
}

function setupDbCleanup() {
  beforeEach(async () => {
    await clearDb();
  });

  afterAll(async () => {
    await disconnectDb();
  });
}

export default setupDbCleanup;
