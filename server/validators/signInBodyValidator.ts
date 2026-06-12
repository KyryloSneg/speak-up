import bodyValidator, { type Validator } from "#validators/bodyValidator.ts";
import { getZodSignInBodyValidation } from "@speak-up/shared";

function signInBodyValidator(): Validator {
  return bodyValidator(getZodSignInBodyValidation());
}

export default signInBodyValidator;
