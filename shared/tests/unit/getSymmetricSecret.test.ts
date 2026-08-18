import { describe, expect, it } from "vitest";
import getSymmetricSecret from "../../utils/getSymmetricSecret.ts";

describe("getSymmetricSecret", () => {
  it("should encode a valid secret string into an Uint8Array", () => {
    const secret = "secret-key";
    const result = getSymmetricSecret(secret);

    expect(result).toBeInstanceOf(Uint8Array);
    expect(result).toEqual(new TextEncoder().encode(secret));
  });

  it("should return an empty Uint8Array when secret is undefined", () => {
    const result = getSymmetricSecret(undefined);

    expect(result).toBeInstanceOf(Uint8Array);
    expect(result.byteLength).toBe(0);
  });

  it("should return an empty Uint8Array when secret is null", () => {
    const result = getSymmetricSecret(null);

    expect(result).toBeInstanceOf(Uint8Array);
    expect(result.byteLength).toBe(0);
  });

  it("should return an empty Uint8Array when given an empty string", () => {
    const result = getSymmetricSecret("");

    expect(result).toBeInstanceOf(Uint8Array);
    expect(result.byteLength).toBe(0);
  });
});
