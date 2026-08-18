import type { UserDto } from "@speak-up/shared";

function updateUser<UserData extends Partial<Omit<UserDto, "id" | "username">>>(
  user: UserData,
  data: Partial<Omit<UserDto, "id" | "username">>,
): UserData {
  if (user.nickname && data.nickname) {
    user.nickname = data.nickname;
  }

  if (user.picture && data.picture) {
    user.picture = data.picture;
  }

  if (user.letterPicture && data.letterPicture) {
    user.letterPicture = data.letterPicture;
  }

  return user;
}

export default updateUser;
