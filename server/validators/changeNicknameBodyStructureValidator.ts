import type { BodyStructureValidatorResult } from "#validators/bodyStructureValidator.ts";
import bodyStructureValidator from "#validators/bodyStructureValidator.ts";

function changeNicknameBodyStructureValidator(): BodyStructureValidatorResult {
  return bodyStructureValidator(["nickname"]);
}

export default changeNicknameBodyStructureValidator;
