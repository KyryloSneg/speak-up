import mapToUserDto from "#dtos/userDto.ts";
import { mockUser } from "#tests/utils/consts.ts";
import userToJwtPayload from "#utils/userToJwtPayload.ts";
import { describe, expect, it } from "vitest";

describe("userToJwtPayload", () => {
  it("should properly strip user object down to a jwt payload", () => {
    const userPayload = userToJwtPayload(mockUser);
    expect(userPayload).toStrictEqual({ userId: mockUser.id });
  });

  it("should properly strip user dto down to a jwt payload", () => {
    const userDto = mapToUserDto(mockUser);
    const userDtoPayload = userToJwtPayload(userDto);

    expect(userDtoPayload).toStrictEqual({ userId: userDto.id });
  });
});
