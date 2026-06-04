import { PrismaClient } from "#generated/prisma/client.ts";
import "dotenv/config";

const prisma = new PrismaClient();
export default prisma;
