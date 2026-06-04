import ApiError from "#errors/ApiError.ts";
import { expect } from "vitest";

async function expectApiError(
  fn: () => unknown | Promise<unknown>,
  expectedStatus: number,
) {
  try {
    await fn();
    throw new Error("Expected function to throw ApiError, but it did not");
  } catch (error) {
    expect(error).toBeInstanceOf(ApiError);
    expect((error as ApiError).status).toBe(expectedStatus);
  }
}

export default expectApiError;
