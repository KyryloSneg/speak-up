import { describe, expect, it } from "vitest";
import type { SocketMediaConfig } from "../../../types/socketMediaConfig.ts";
import { getZodMediaConfigValidation } from "../../../utils/validation.ts";

describe("mediaConfigValidator", () => {
  function checkIsValid(config: unknown): boolean {
    return getZodMediaConfigValidation().safeParse(config).success;
  }

  describe("valid config", () => {
    it("should pass if a valid config is provided (audio: true, video: true)", () => {
      const config: SocketMediaConfig = { audio: true, video: true };
      const isValid = checkIsValid(config);

      expect(isValid).toBe(true);
    });

    it("should pass if a valid config is provided (audio: true, video: false)", () => {
      const config: SocketMediaConfig = { audio: true, video: false };
      const isValid = checkIsValid(config);

      expect(isValid).toBe(true);
    });

    it("should pass if a valid config is provided (audio: false, video: true)", () => {
      const config: SocketMediaConfig = { audio: false, video: true };
      const isValid = checkIsValid(config);

      expect(isValid).toBe(true);
    });

    it("should pass if a valid config is provided (audio: false, video: false)", () => {
      const config: SocketMediaConfig = { audio: false, video: false };
      const isValid = checkIsValid(config);

      expect(isValid).toBe(true);
    });
  });

  describe("invalid config", () => {
    describe("invalid syntax", () => {
      it("should fail if config isn't an object", () => {
        const config = null;
        const isValid = checkIsValid(config);

        expect(isValid).toBe(false);
      });

      it("should fail if config contains a redundant field", () => {
        const config = { audio: true, video: true, extra: "extra" };
        const isValid = checkIsValid(config);

        expect(isValid).toBe(false);
      });
    });

    describe("invalid value", () => {
      it("should fail if config contains an invalid value (invalid audio)", () => {
        const config = { audio: "true", video: true };
        const isValid = checkIsValid(config);

        expect(isValid).toBe(false);
      });

      it("should fail if config contains an invalid value (invalid video)", () => {
        const config = { audio: true, video: "true" };
        const isValid = checkIsValid(config);

        expect(isValid).toBe(false);
      });

      it("should fail if config contains an invalid value (invalid audio and video)", () => {
        const config = { audio: "true", video: "true" };
        const isValid = checkIsValid(config);

        expect(isValid).toBe(false);
      });
    });
  });
});
