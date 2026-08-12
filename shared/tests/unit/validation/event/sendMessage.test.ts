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

  type Message =
    SocketClientToServerEventsData[typeof SocketEvents.SEND_MESSAGE];

  describe("valid message", () => {
    it("should pass if a valid message is provided", () => {
      const message: Message = [{ tempId: "tempId", content }];

      const isValid = checkIsValid(message);
      expect(isValid).toBe(true);
    });

    it("should pass if two valid messages are provided", () => {
      const message: Message = [
        { tempId: "tempId", content },
        { tempId: "secondTempId", content },
      ];

      const isValid = checkIsValid(message);
      expect(isValid).toBe(true);
    });

    it("should pass if no messages are provided", () => {
      const message: Message = [];

      const isValid = checkIsValid(message);
      expect(isValid).toBe(true);
    });
  });

  describe("invalid message", () => {
    describe("invalid syntax", () => {
      it("should fail if a non-array is provided", () => {
        const message = null;

        const isValid = checkIsValid(message);
        expect(isValid).toBe(false);
      });

      it("should fail if an empty object is provided", () => {
        const message = {};

        const isValid = checkIsValid(message);
        expect(isValid).toBe(false);
      });

      it("should fail if tempId is missing", () => {
        const message = [{ content }];

        const isValid = checkIsValid(message);
        expect(isValid).toBe(false);
      });

      it("should fail if content is missing", () => {
        const message = [{ tempId: "tempId" }];

        const isValid = checkIsValid(message);
        expect(isValid).toBe(false);
      });

      it("should fail if a redundant field is provided", () => {
        const message = [{ tempId: "tempId", content, extra: "extra" }];

        const isValid = checkIsValid(message);
        expect(isValid).toBe(false);
      });
    });

    describe("invalid value", () => {
      it("should fail if an invalid content is provided", () => {
        const message = [{ tempId: "tempId", content: [] }];

        const isValid = checkIsValid(message);
        expect(isValid).toBe(false);
      });

      it("should fail if an invalid tempId is provided", () => {
        const message = [{ tempId: 0e1, content }];

        const isValid = checkIsValid(message);
        expect(isValid).toBe(false);
      });
    });
  });
});
