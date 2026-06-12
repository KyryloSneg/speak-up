import ApiError from "#errors/ApiError.ts";
import { expect } from "vitest";

async function expectApiError(
  fn: () => unknown | Promise<unknown>,
  expectedStatus: number,
  expectedMessage?: string,
  expectedBody?: unknown,
) {
  try {
    await fn();
    throw new Error("Expected function to throw ApiError, but it did not");
  } catch (error) {
    expect(error).toBeInstanceOf(ApiError);
    expect((error as ApiError).status).toBe(expectedStatus);

    if (expectedMessage !== undefined) {
      expect((error as { message: string })?.message).toBe(expectedMessage);
    }

    if (expectedBody !== undefined) {
      expect((error as { body: unknown })?.body).toStrictEqual(expectedBody);
    }
  }
}

export default expectApiError;
