import bodyValidator, { type Validator } from "#validators/bodyValidator.ts";
import { getZodRegisterBodyValidation } from "@speak-up/shared";

function registerBodyValidator(): Validator {
  return bodyValidator(getZodRegisterBodyValidation());
}

export default registerBodyValidator;
