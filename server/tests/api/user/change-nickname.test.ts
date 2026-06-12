import mapToUserDto from "#dtos/userDto.ts";
import ApiError from "#errors/ApiError.ts";
import type { User } from "#generated/prisma/client.ts";
import prisma from "#services/prisma.ts";
import testPrivateRoute from "#tests/api/utils/testPrivateRoute.ts";
import createAuthUser from "#tests/utils/createAuthUser.ts";
import getUniqueMockUserWithoutId from "#tests/utils/getUniqueMockUserWithoutId.ts";
import setupDbCleanup from "#tests/utils/setupDb.ts";
import app from "#utils/app.ts";
import { type UserDto } from "@speak-up/shared";
import request from "supertest";
import { afterEach, describe, expect, it, vi } from "vitest";

describe("/api/change-nickname PATCH route", () => {
  setupDbCleanup();

  testPrivateRoute("/api/change-nickname", "PATCH", {
    strategy: "access-only",
  });

  describe("successful nickname change", () => {
    function excludePictureFields<T extends User | UserDto>(
      user: T,
    ): Omit<T, "picture" | "letterPicture"> {
      const userWithoutPictureFields: Partial<T> = { ...user };

      delete userWithoutPictureFields["picture"];
      delete userWithoutPictureFields["letterPicture"];

      return userWithoutPictureFields as Omit<T, "picture" | "letterPicture">;
    }

    it("should successfully change nickname (new initials) and picture fields of an authenticated user and return user dto", async () => {
      const { user, authorizationHeader } = await createAuthUser(
        getUniqueMockUserWithoutId(),
      );

      const newNickname = `${user.nickname} 123`;
      const res = await request(app)
        .patch("/api/change-nickname")
        .set("Authorization", authorizationHeader)
        .send({ nickname: newNickname });

      expect(res.status).toBe(200);
      expect(res.body).toStrictEqual(mapToUserDto(res.body));

      expect(excludePictureFields(res.body)).toStrictEqual({
        ...excludePictureFields(mapToUserDto(user)),
        nickname: newNickname,
      });

      expect(res.body.nickname).toBe(newNickname);
      expect(res.body.nickname).not.toBe(user.nickname);

      expect(res.body.picture).toBeTypeOf("string");
      expect(res.body.letterPicture).toBeTypeOf("string");

      expect(res.body.picture).not.toBe(user.picture);
      expect(res.body.letterPicture).not.toBe(user.letterPicture);
      expect(res.body.picture).toBe(res.body.letterPicture);

      const dbUser = await prisma.user.findUnique({
        where: { username: user.username },
      });

      expect(dbUser).not.toBeNull();
      expect(dbUser?.nickname).toBe(newNickname);

      expect(dbUser?.picture).toBeTypeOf("string");
      expect(dbUser?.letterPicture).toBeTypeOf("string");

      expect(dbUser?.picture).not.toBe(user.picture);
      expect(dbUser?.letterPicture).not.toBe(user.letterPicture);
    });

    it("should successfully change nickname (the same initials) and leave picture fields untouched of an authenticated user", async () => {
      const { user, authorizationHeader } = await createAuthUser(
        getUniqueMockUserWithoutId(),
      );

      const newNickname = `${user.nickname}_123`;
      const res = await request(app)
        .patch("/api/change-nickname")
        .set("Authorization", authorizationHeader)
        .send({ nickname: newNickname });

      expect(res.status).toBe(200);
      expect(excludePictureFields(res.body)).toStrictEqual({
        ...excludePictureFields(mapToUserDto(user)),
        nickname: newNickname,
      });

      expect(res.body.nickname).toBe(newNickname);
      expect(res.body.nickname).not.toBe(user.nickname);

      expect(res.body.picture).toBe(user.picture);
      expect(res.body.letterPicture).toBe(user.letterPicture);

      const dbUser = await prisma.user.findUnique({
        where: { username: user.username },
      });

      expect(dbUser).not.toBeNull();
      expect(dbUser?.nickname).toBe(newNickname);

      expect(dbUser?.picture).toBe(user.picture);
      expect(dbUser?.letterPicture).toBe(user.letterPicture);
    });
  });

  describe("unsuccessful nickname change", () => {
    afterEach(() => {
      vi.restoreAllMocks();
    });

    it("should return a 400 response if the new nickname isn't provided", async () => {
      const { authorizationHeader } = await createAuthUser(
        getUniqueMockUserWithoutId(),
      );

      const res = await request(app)
        .patch("/api/change-nickname")
        .set("Authorization", authorizationHeader)
        .send({});

      expect(res.status).toBe(400);
      expect(res.body).toStrictEqual({
        message: "Validation error",
        body: [
          {
            type: "field",
            msg: "Invalid value",
            path: "nickname",
            location: "body",
          },
        ],
      });
    });

    it("should return a 400 response if a redundant field is provided", async () => {
      const { user, authorizationHeader } = await createAuthUser(
        getUniqueMockUserWithoutId(),
      );

      const newNickname = `${user.nickname}_123`;
      const res = await request(app)
        .patch("/api/change-nickname")
        .set("Authorization", authorizationHeader)
        .send({ nickname: newNickname, extra: "extra" });

      expect(res.status).toBe(400);
      expect(res.body.message).toBeTypeOf("string");
    });

    it("should return a 422 response if the new nickname is invalid", async () => {
      const { authorizationHeader } = await createAuthUser(
        getUniqueMockUserWithoutId(),
      );

      const newNickname = "";
      const res = await request(app)
        .patch("/api/change-nickname")
        .set("Authorization", authorizationHeader)
        .send({ nickname: newNickname });

      expect(res.status).toBe(422);
      expect(res.body).toStrictEqual({
        message: "Validation error",
        body: [
          {
            type: "field",
            value: newNickname,
            msg: "Invalid nickname",
            path: "nickname",
            location: "body",
          },
        ],
      });
    });

    it("should return a 500 response on an unexpected error", async () => {
      const { user, authorizationHeader } = await createAuthUser(
        getUniqueMockUserWithoutId(),
      );

      vi.spyOn(prisma.user, "update").mockRejectedValueOnce(
        new Error("Unexpected error"),
      );

      const newNickname = `${user.nickname}_123`;
      const res = await request(app)
        .patch("/api/change-nickname")
        .set("Authorization", authorizationHeader)
        .send({ nickname: newNickname });

      expect(res.status).toBe(500);
      expect(res.body).toStrictEqual({
        message: ApiError.UnexpectedError().message,
      });
    });
  });
});
