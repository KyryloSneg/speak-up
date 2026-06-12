import { describe, expect, it } from "vitest";
import type {
  SocketClientToServerEventsData,
  SocketEvents,
} from "../../../../types/socketEvents.ts";
import type { SocketMediaConfig } from "../../../../types/socketMediaConfig.ts";
import { getZodSendMediaConfigDataValidation } from "../../../../utils/validation.ts";

describe("sendMediaConfigValidator", () => {
  function checkIsValid(message: unknown): boolean {
    return getZodSendMediaConfigDataValidation().safeParse(message).success;
  }

  const config: SocketMediaConfig = { audio: true, video: true };

  describe("valid message", () => {
    it("should pass if a valid message is provided", () => {
      const message: SocketClientToServerEventsData[typeof SocketEvents.SEND_MEDIA_CONFIG] =
        { config };

      const isValid = checkIsValid(message);
      expect(isValid).toBe(true);
    });
  });

  describe("invalid message", () => {
    describe("invalid syntax", () => {
      it("should fail if a non-object is provided", () => {
        const message = null;

        const isValid = checkIsValid(message);
        expect(isValid).toBe(false);
      });

      it("should fail if an empty object is provided", () => {
        const message = {};

        const isValid = checkIsValid(message);
        expect(isValid).toBe(false);
      });

      it("should fail if a redundant field is provided", () => {
        const message = { config, extra: "extra" };

        const isValid = checkIsValid(message);
        expect(isValid).toBe(false);
      });
    });

    describe("invalid value", () => {
      it("should fail if an invalid config is provided", () => {
        const message = { config: { config: true } };

        const isValid = checkIsValid(message);
        expect(isValid).toBe(false);
      });
    });
  });
});
