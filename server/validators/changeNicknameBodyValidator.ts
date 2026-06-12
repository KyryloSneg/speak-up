import bodyValidator, { type Validator } from "#validators/bodyValidator.ts";
import { getZodChangeNicknameBodyValidation } from "@speak-up/shared";

function changeNicknameBodyValidator(): Validator {
  return bodyValidator(getZodChangeNicknameBodyValidation());
}

export default changeNicknameBodyValidator;
