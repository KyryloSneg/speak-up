import { mockUser } from "@/tests/utils/consts";
import updateUser from "@/utils/updateUser";
import type { UserDto } from "@speak-up/shared";
import { beforeEach, describe, expect, it } from "vitest";

describe("updateUser", () => {
  let user: UserDto;

  type Data = Parameters<typeof updateUser>[1];

  const newNickname = `${mockUser.nickname} 123` as const;
  const newPicture = `${mockUser.picture}_new` as const;
  const newLetterPicture = `${mockUser.letterPicture}_new` as const;

  const fullData: Data = {
    nickname: newNickname,
    picture: newPicture,
    letterPicture: newLetterPicture,
  } as const;

  beforeEach(() => {
    user = { ...mockUser };
  });

  it("should properly update nickname, picture and letter picture", () => {
    updateUser(user, fullData);

    expect(user.nickname).toBe(newNickname);
    expect(user.picture).toBe(newPicture);
    expect(user.letterPicture).toBe(newLetterPicture);
  });

  it("should properly update individual fields", () => {
    updateUser(user, {
      nickname: newNickname,
      letterPicture: newLetterPicture,
    });

    expect(user.nickname).toBe(newNickname);
    expect(user.letterPicture).toBe(newLetterPicture);

    expect(user.picture).toBe(mockUser.picture);
  });
});
