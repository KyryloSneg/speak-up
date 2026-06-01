import type { UserDto } from "#dtos/userDto.ts";
import type { JWTTokens } from "#types/jwtTokens.ts";

export interface UserDataWithTokens {
  tokens: JWTTokens;
  user: UserDto;
}
