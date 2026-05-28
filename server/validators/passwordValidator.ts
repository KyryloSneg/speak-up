import ApiError from "#errors/ApiError.ts";
import { getZodPasswordValidation } from "@speak-up/shared";

function passwordValidator(value: unknown): boolean {
  const validationResult = getZodPasswordValidation().safeParse(value);

  if (!validationResult.success) {
    throw ApiError.BadRequest("Invalid password");
  }

  return true;
}

export default passwordValidator;
