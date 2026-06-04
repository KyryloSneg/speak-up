import type { BodyStructureValidatorResult } from "#validators/bodyStructureValidator.ts";
import bodyStructureValidator from "#validators/bodyStructureValidator.ts";

function signInBodyStructureValidator(): BodyStructureValidatorResult {
  return bodyStructureValidator(["username", "password"]);
}

export default signInBodyStructureValidator;
