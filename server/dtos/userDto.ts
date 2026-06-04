import type { User } from "#generated/prisma/client.ts";

export type UserDto = {
  id: User["id"];
  username: User["username"];
  nickname: User["nickname"];
  picture: User["picture"];
  letterPicture: User["letterPicture"];
};

function mapToUserDto(user: User): UserDto {
  const userDto: UserDto = {
    id: user.id,
    username: user.username,
    nickname: user.nickname,
    picture: user.picture,
    letterPicture: user.letterPicture,
  };

  return userDto;
}

export default mapToUserDto;
