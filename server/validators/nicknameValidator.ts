import ApiError from "#errors/ApiError.ts";
import { getZodNicknameValidation } from "@speak-up/shared";

function nicknameValidator(value: unknown): boolean {
  const validationResult = getZodNicknameValidation().safeParse(value);

  if (!validationResult.success) {
    throw ApiError.UnprocessableEntity("Invalid nickname");
  }

  return true;
}

export default nicknameValidator;
