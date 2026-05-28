import type { BodyStructureValidatorResult } from "#validators/bodyStructureValidator.ts";
import bodyStructureValidator from "#validators/bodyStructureValidator.ts";

function registerBodyStructureValidator(): BodyStructureValidatorResult {
  return bodyStructureValidator(["nickname", "username", "password"]);
}

export default registerBodyStructureValidator;
