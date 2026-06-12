import { describe, expect, it } from "vitest";
import type { MessageContent } from "../../../../types/message.ts";
import type {
  SocketClientToServerEventsData,
  SocketEvents,
} from "../../../../types/socketEvents.ts";
import { getZodSendMessageDataValidation } from "../../../../utils/validation.ts";

describe("sendMessageValidator", () => {
  function checkIsValid(message: unknown): boolean {
    return getZodSendMessageDataValidation().safeParse(message).success;
  }

  const content: MessageContent = [{ type: "text", value: "value" }];

  describe("valid message", () => {
    it("should pass if a valid message is provided", () => {
      const message: SocketClientToServerEventsData[typeof SocketEvents.SEND_MESSAGE] =
        { content };

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
        const message = { content, extra: "extra" };

        const isValid = checkIsValid(message);
        expect(isValid).toBe(false);
      });
    });

    describe("invalid value", () => {
      it("should fail if an invalid content is provided", () => {
        const message = { content: [] };

        const isValid = checkIsValid(message);
        expect(isValid).toBe(false);
      });
    });
  });
});
