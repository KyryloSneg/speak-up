import objectEntries from "../utils/objectEntries.ts";
import type {
  getZodChangeNicknameBodyValidation,
  getZodRegisterBodyValidation,
  getZodSignInBodyValidation,
  SchemaOfZodValidationFn,
} from "../utils/validation.ts";
import type { UserDto } from "./user.ts";
import type { UserDataWithTokens } from "./userDataWithTokens.ts";

export const API_ROUTES_PREFIX = "/api" as const;
export const NoPrefixApiRoutes = {
  REGISTER: "/register",
  SIGN_IN: "/sign-in",
  LOGOUT: "/logout",
  REFRESH: "/refresh",
  CHANGE_NICKNAME: "/change-nickname",
} as const;

type ApiRoutesType = {
  readonly [K in keyof typeof NoPrefixApiRoutes]: `${typeof API_ROUTES_PREFIX}${(typeof NoPrefixApiRoutes)[K]}`;
};

export const ApiRoutes = Object.fromEntries(
  objectEntries(NoPrefixApiRoutes).map(([key, value]) => [
    key,
    `${API_ROUTES_PREFIX}${value}`,
  ]),
) as unknown as ApiRoutesType;

export type RegisterRequestBody = SchemaOfZodValidationFn<
  typeof getZodRegisterBodyValidation
>;

export type SignInRequestBody = SchemaOfZodValidationFn<
  typeof getZodSignInBodyValidation
>;

export type ChangeNicknameRequestBody = SchemaOfZodValidationFn<
  typeof getZodChangeNicknameBodyValidation
>;

interface ErrorResponse<IsValidation> {
  message: string;
  body: IsValidation extends true
    ? {
        message: string;
        path: string[];
      }[]
    : false;
}

export type AnyErrorResponse = ErrorResponse<false> | ErrorResponse<true>;

export type RegisterResponseBody = UserDataWithTokens | AnyErrorResponse;
export type SignInResponseBody = UserDataWithTokens | AnyErrorResponse;
export type LogoutResponseBody =
  | { id: string; userId: string; refreshToken: string }
  | null
  | AnyErrorResponse;

export type RefreshResponseBody = UserDataWithTokens | AnyErrorResponse;
export type ChangeNicknameResponseBody = UserDto | AnyErrorResponse;
