import ApiError from "#errors/ApiError.ts";
import WebRTCService from "#services/webRTCService.ts";
import testPrivateRoute from "#tests/api/utils/testPrivateRoute.ts";
import createAuthUser from "#tests/utils/createAuthUser.ts";
import getUniqueMockUserWithoutId from "#tests/utils/getUniqueMockUserWithoutId.ts";
import setupDbCleanup from "#tests/utils/setupDb.ts";
import app from "#utils/app.ts";
import { ApiRoutes } from "@speak-up/shared";
import request from "supertest";
import { afterEach, describe, expect, it, vi } from "vitest";

const route = ApiRoutes.ICE_SERVERS;

describe(`${route} GET route`, () => {
  setupDbCleanup();

  testPrivateRoute(route, "GET", {
    strategy: "access-only",
  });

  afterEach(() => {
    vi.restoreAllMocks();
    vi.unstubAllGlobals();
  });

  describe("successful ice servers fetching", () => {
    it("should properly return ICE servers from a 3rd-party API for an authenticated user", async () => {
      const { authorizationHeader } = await createAuthUser(
        getUniqueMockUserWithoutId(),
      );

      const mockIceServers: RTCIceServer[] = [
        {
          urls: ["turn:relay.example.com:443"],
          username: "test-user",
          credential: "test-credential",
        },
      ] as const;

      vi.spyOn(WebRTCService, "getIceServers").mockResolvedValueOnce(
        mockIceServers,
      );

      const res = await request(app)
        .get(route)
        .set("Authorization", authorizationHeader);

      expect(res.status).toBe(200);
      expect(res.body).toEqual(mockIceServers);
    });

    it("should properly return fallback STUN servers when external service call fails", async () => {
      const { authorizationHeader } = await createAuthUser(
        getUniqueMockUserWithoutId(),
      );

      const fallbackServers: RTCIceServer[] = [
        {
          urls: [
            "stun:stun.l.google.com:19302",
            "stun:stun1.l.google.com:19302",
          ],
        },
      ] as const;

      vi.spyOn(WebRTCService, "getIceServers").mockResolvedValueOnce(
        fallbackServers,
      );

      const res = await request(app)
        .get(route)
        .set("Authorization", authorizationHeader);

      expect(res.status).toBe(200);
      expect(res.body).toEqual(fallbackServers);
    });
  });

  describe("unsuccessful ice servers fetching", () => {
    it("should properly return a 500 response on an unexpected error", async () => {
      const { authorizationHeader } = await createAuthUser(
        getUniqueMockUserWithoutId(),
      );

      vi.spyOn(WebRTCService, "getIceServers").mockRejectedValueOnce(
        new Error("Unexpected error"),
      );

      const res = await request(app)
        .get(route)
        .set("Authorization", authorizationHeader);

      expect(res.status).toBe(500);
      expect(res.body).toStrictEqual({
        message: ApiError.UnexpectedError().message,
      });
    });
  });
});
