import type { UserDto } from "@speak-up/shared";
import type { JWTTokens } from "#types/jwtTokens.ts";

export interface UserDataWithTokens {
  tokens: JWTTokens;
  user: UserDto;
}
