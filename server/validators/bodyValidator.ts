import ApiError from "#errors/ApiError.ts";
import type { NextFunction, Request, Response } from "express";
import { ZodError, type ZodObject } from "zod";

export type Validator = (
  req: Request,
  res: Response,
  next: NextFunction,
) => Promise<void>;

function bodyValidator(schema: ZodObject): Validator {
  const validator: Validator = async (req, res, next) => {
    try {
      req.body = await schema.parseAsync(req.body);
      next();
    } catch (e) {
      if (e instanceof ZodError) {
        const isStructuralError = e.issues.some(issue => {
          if (issue.code === "unrecognized_keys") {
            return true;
          }

          if (issue.code === "invalid_type") {
            let current = req.body;

            for (const segment of issue.path) {
              if (current === undefined || current === null) {
                return true;
              }

              current = current[segment];
            }

            return current === undefined;
          }

          return false;
        });

        if (isStructuralError) {
          return next(ApiError.BadRequest("Validation error", e.issues));
        }

        return next(ApiError.UnprocessableEntity("Validation error", e.issues));
      }

      next(e);
    }
  };

  return validator;
}

export default bodyValidator;
