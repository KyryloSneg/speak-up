import ApiError from "#errors/ApiError.ts";
import type { APIRequestHandler } from "#types/api.ts";
import type { ValidationChain } from "express-validator";
import { body, validationResult } from "express-validator";

export type BodyStructureValidatorResult = [ValidationChain, APIRequestHandler];

function bodyStructureValidator(
  fields: string[],
  isStrict: boolean = true,
): BodyStructureValidatorResult {
  function validator(value: unknown): boolean {
    return value !== undefined;
  }

  const validation = body(fields).custom(validator);
  const bodyStructureErrorMiddleware: APIRequestHandler = (req, res, next) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      throw ApiError.BadRequest("Validation error", { errors: errors.array() });
    }

    if (isStrict && Object.keys(req.body).length !== fields.length) {
      throw ApiError.BadRequest("Validation error: redundant fields provided");
    }

    next();
  };

  return [validation, bodyStructureErrorMiddleware];
}

export default bodyStructureValidator;
