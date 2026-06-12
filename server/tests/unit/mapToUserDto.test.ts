import type { UserDto } from "@speak-up/shared";
import mapToUserDto from "#dtos/userDto.ts";
import type { User } from "#generated/prisma/client.ts";
import { describe, expect, it } from "vitest";

describe("mapToUserDto", () => {
  it("should properly map user object to stripped user dto", () => {
    const dtoFields: UserDto = {
      id: "id",
      username: "username",
      nickname: "nickname",
      picture: "picture",
      letterPicture: "letterPicture",
    } as const;

    const redundantFields = {
      redundant: "redundant",
      mostRedundant: "mostRedundant",
    } as const;

    const mockUserWithRedundantFields: User = {
      ...dtoFields,
      ...redundantFields,
      password: "password",
    } as const;

    const dto = mapToUserDto(mockUserWithRedundantFields);

    expect(dto).toStrictEqual(dtoFields);
  });
});
