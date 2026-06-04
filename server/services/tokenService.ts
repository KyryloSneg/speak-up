import type { Token } from "#generated/prisma/client.ts";
import prisma from "#services/prisma.ts";
import type { JWTPayload } from "#types/jwtPayload.ts";
import type { JWTTokens } from "#types/jwtTokens.ts";
import {
  ACCESS_TOKEN_EXPIRATION_TIME_MINUTES,
  REFRESH_TOKEN_EXPIRATION_TIME_DAYS,
} from "#utils/consts.ts";
import filterJwtPayload from "#utils/filterJwtPayload.ts";
import { getSymmetricSecret } from "@speak-up/shared";
import { jwtVerify, SignJWT } from "jose";

class TokenService {
  static async generateTokens(payload: JWTPayload): Promise<JWTTokens> {
    const accessToken = await new SignJWT(payload)
      .setProtectedHeader({ alg: "HS256" })
      .setIssuedAt()
      .setExpirationTime(`${ACCESS_TOKEN_EXPIRATION_TIME_MINUTES}m`)
      .sign(getSymmetricSecret(process.env.JWT_ACCESS_SECRET));

    const refreshToken = await new SignJWT(payload)
      .setProtectedHeader({ alg: "HS256" })
      .setIssuedAt()
      .setExpirationTime(`${REFRESH_TOKEN_EXPIRATION_TIME_DAYS}d`)
      .sign(getSymmetricSecret(process.env.JWT_REFRESH_SECRET));

    return {
      accessToken,
      refreshToken,
    };
  }

  static async validateAccessToken(token: string): Promise<JWTPayload | null> {
    try {
      const { payload: userData } = await jwtVerify<JWTPayload>(
        token,
        getSymmetricSecret(process.env.JWT_ACCESS_SECRET),
      );

      return filterJwtPayload(userData);
    } catch {
      return null;
    }
  }

  static async validateRefreshToken(token: string): Promise<JWTPayload | null> {
    try {
      const { payload: userData } = await jwtVerify<JWTPayload>(
        token,
        getSymmetricSecret(process.env.JWT_REFRESH_SECRET),
      );

      return filterJwtPayload(userData);
    } catch {
      return null;
    }
  }

  static async saveToken(refreshToken: string, userId: string): Promise<Token> {
    const token = await prisma.token.upsert({
      where: { userId },
      create: { userId, refreshToken },
      update: { refreshToken },
    });

    return token;
  }

  static async removeToken(refreshToken: string): Promise<Token | null> {
    try {
      const tokenData = await prisma.token.delete({ where: { refreshToken } });

      return tokenData;
    } catch {
      return null;
    }
  }

  static async findToken(refreshToken: string): Promise<Token | null> {
    const tokenData = await prisma.token.findUnique({
      where: { refreshToken },
    });

    return tokenData;
  }
}

export default TokenService;
