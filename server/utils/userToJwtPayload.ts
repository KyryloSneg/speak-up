import type { UserDto } from "#dtos/userDto.ts";
import type { User } from "#generated/prisma/client.ts";
import type { JWTPayload, JWTPayloadRaw } from "#types/jwtPayload.ts";

function userToJwtPayload(user: User | UserDto): JWTPayload {
  const jwtPayload: JWTPayloadRaw = { userId: user.id };

  // we use this util just for raw type-safety on the assignment above,
  // so this casting isn't too bad
  return jwtPayload as JWTPayload;
}

export default userToJwtPayload;
