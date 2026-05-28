import ApiError from "#errors/ApiError.ts";
import { getZodUsernameValidation } from "@speak-up/shared";

function usernameValidator(value: unknown): boolean {
  const validationResult = getZodUsernameValidation().safeParse(value);

  if (!validationResult.success) {
    throw ApiError.BadRequest("Invalid username");
  }

  return true;
}

export default usernameValidator;
