import type { JWTTokens } from "./jwtTokens.ts";
import type { UserDto } from "./user.ts";

export interface UserDataWithTokens {
  tokens: JWTTokens;
  user: UserDto;
}
