import ApiError from "#errors/ApiError.ts";
import { describe, expect, it } from "vitest";

describe("ApiError", () => {
  describe("UnauthorizedError", () => {
    it("should create a 401 error with a proper message and a null body", () => {
      const error = ApiError.UnauthorizedError();

      expect(error).toBeInstanceOf(Error);
      expect(error.status).toBe(401);
      expect(error.message).toBe("User is not authenticated");
      expect(error.body).toBeNull();
    });
  });

  describe.each([
    [
      "BadRequest" as const,
      400,
      "Bad Request",
      {
        reason: "reason",
      } as const,
    ],
    [
      "UnprocessableEntity" as const,
      422,
      "Unprocessable Entity",
      {
        reason: "reason",
      } as const,
    ],
  ])("%s", (name, status, message, presentBody) => {
    function baseTest(error: ApiError) {
      expect(error).toBeInstanceOf(Error);
      expect(error.status).toBe(status);
      expect(error.message).toBe(message);
    }

    it(`should create a ${status} error with a proper message and a null body`, () => {
      const error = ApiError[name](message);

      baseTest(error);
      expect(error.body).toBeNull();
    });

    it(`should create a ${status} error with a proper message and a proper body`, () => {
      const error = ApiError[name](message, presentBody);

      baseTest(error);
      expect(error.body).toBe(presentBody);
    });
  });
});
