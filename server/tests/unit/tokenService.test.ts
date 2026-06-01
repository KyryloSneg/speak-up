import prisma from "#services/prisma.ts";
import TokenService from "#services/tokenService.ts";
import { mockToken, mockUser } from "#tests/utils/consts.ts";
import userToJwtPayload from "#utils/userToJwtPayload.ts";
import { beforeEach, describe, expect, it, vi } from "vitest";

vi.mock("#services/prisma.ts", () => ({
  default: {
    token: {
      upsert: vi.fn(),
      findUnique: vi.fn(),
      delete: vi.fn(),
    },
  },
}));

describe("tokenService", () => {
  // randomly generated tokens
  const accessToken = "o1OuQXklF+0xlQ4ZoKXeOFp4I1ya4XqYK3NEZkd9AGw=";
  const refreshToken = "26ll8WZTwQjUC+8xGNsyDxqIVKgAvIVd02ljJrjvtpo=";

  beforeEach(() => {
    vi.clearAllMocks();

    vi.stubEnv("JWT_ACCESS_SECRET", accessToken);
    vi.stubEnv("JWT_REFRESH_SECRET", refreshToken);
  });

  describe("jwt", () => {
    it("should generate proper access and refresh tokens from user payload and retrieve one back from the tokens", async () => {
      const payload = userToJwtPayload(mockUser);
      const tokens = await TokenService.generateTokens(payload);

      expect(tokens.accessToken).toBeTypeOf("string");
      expect(tokens.refreshToken).toBeTypeOf("string");

      const payloadFromAccessToken = await TokenService.validateAccessToken(
        tokens.accessToken,
      );

      const payloadFromRefreshToken = await TokenService.validateRefreshToken(
        tokens.refreshToken,
      );

      expect(payloadFromAccessToken).toEqual(payload);
      expect(payloadFromRefreshToken).toEqual(payload);
    });

    describe("validation error fallback", () => {
      it("should gently fallback to null of access token validation error", async () => {
        const accessToken = "accessToken";
        const payload = await TokenService.validateAccessToken(accessToken);

        expect(payload).toBeNull();
      });

      it("should gently fallback to null of refresh token validation error", async () => {
        const refreshToken = "refreshToken";
        const payload = await TokenService.validateRefreshToken(refreshToken);

        expect(payload).toBeNull();
      });
    });
  });

  describe("db", () => {
    it("should successfully save a token to DB with correct options", async () => {
      vi.mocked(prisma.token.upsert).mockResolvedValue(mockToken);

      const token = await TokenService.saveToken(
        mockToken.refreshToken,
        mockToken.userId,
      );

      expect(prisma.token.upsert).toHaveBeenCalledWith({
        where: { userId: mockToken.userId },
        create: {
          userId: mockToken.userId,
          refreshToken: mockToken.refreshToken,
        },
        update: { refreshToken: mockToken.refreshToken },
      });

      expect(token).toEqual(mockToken);
    });

    it("should successfully remove a token from DB with correct options", async () => {
      vi.mocked(prisma.token.delete).mockResolvedValue(mockToken);

      const token = await TokenService.removeToken(mockToken.refreshToken);
      expect(prisma.token.delete).toHaveBeenCalledWith({
        where: { refreshToken: mockToken.refreshToken },
      });

      expect(token).toEqual(mockToken);
    });

    it("should fallback to null if error has occured during removing a token from DB", async () => {
      vi.mocked(prisma.token.delete).mockRejectedValue(
        new Error("Unexpected error"),
      );

      const token = await TokenService.removeToken(mockToken.refreshToken);
      expect(token).toBeNull();
    });

    it("should successfully find a token in DB", async () => {
      vi.mocked(prisma.token.findUnique).mockResolvedValue(mockToken);

      const token = await TokenService.findToken(mockToken.refreshToken);
      expect(token).toEqual(mockToken);
    });

    it("should return null if couldn't find a token in DB", async () => {
      vi.mocked(prisma.token.findUnique).mockResolvedValue(null);

      const token = await TokenService.findToken(mockToken.refreshToken);
      expect(token).toBeNull();
    });
  });
});
