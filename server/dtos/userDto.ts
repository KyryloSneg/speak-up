import type { User } from "#generated/prisma/client.ts";

export type UserDto = Omit<User, "password">;

function mapToUserDto(user: User): UserDto {
  const { password: _, ...userDto } = user;
  return userDto;
}

export default mapToUserDto;
