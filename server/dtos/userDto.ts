import type { User } from "#generated/prisma/client.ts";
import type { UserDto } from "@speak-up/shared";

function mapToUserDto(user: User | UserDto): UserDto {
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
