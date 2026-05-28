import type { BodyStructureValidatorResult } from "#validators/bodyStructureValidator.ts";
import bodyStructureValidator from "#validators/bodyStructureValidator.ts";

function changeNicknameBodyStructureValidation(): BodyStructureValidatorResult {
  return bodyStructureValidator(["nickname"]);
}

export default changeNicknameBodyStructureValidation;
