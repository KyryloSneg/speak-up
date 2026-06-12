import type { User } from "#generated/prisma/client.ts";
import prisma from "#services/prisma.ts";
import TokenService from "#services/tokenService.ts";
import { TEST_PASSWORD_HASH_SALT } from "#utils/consts.ts";
import userToJwtPayload from "#utils/userToJwtPayload.ts";
import type { JWTTokens } from "@speak-up/shared";
import bcrypt from "bcrypt";

interface AuthUserData {
  user: User;
  tokens: JWTTokens;
  cookieHeader: string;
  authorizationHeader: string;
}

async function createAuthUser(data: Omit<User, "id">): Promise<AuthUserData> {
  const hashedPassword = await bcrypt.hash(
    data.password,
    TEST_PASSWORD_HASH_SALT,
  );

  const user = await prisma.user.create({
    data: { ...data, password: hashedPassword },
  });

  const payload = userToJwtPayload(user);
  const tokens = await TokenService.generateTokens(payload);

  await TokenService.saveToken(tokens.refreshToken, user.id);

  return {
    user,
    tokens,
    cookieHeader: `refreshToken=${tokens.refreshToken}`,
    authorizationHeader: `accessToken=Bearer ${tokens.accessToken}`,
  };
}

export default createAuthUser;
