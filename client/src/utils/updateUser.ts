import type { UserDto } from "@speak-up/shared";

function updateUser(
  user: UserDto,
  data: Partial<Omit<UserDto, "id" | "username">>,
): UserDto {
  if (data.nickname) user.nickname = data.nickname;
  if (data.picture) user.picture = data.picture;
  if (data.letterPicture) user.letterPicture = data.letterPicture;

  return user;
}

export default updateUser;
