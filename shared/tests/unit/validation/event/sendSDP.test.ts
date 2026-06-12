import { describe, expect, it } from "vitest";
import type {
  SocketClientToServerEventsData,
  SocketEvents,
} from "../../../../types/socketEvents.ts";
import { getZodSendSDPDataValidation } from "../../../../utils/validation.ts";

describe("sendSDPValidator", () => {
  function checkIsValid(message: unknown): boolean {
    return getZodSendSDPDataValidation().safeParse(message).success;
  }

  const userId = "userId";
  const sdp = "sdp";

  describe("valid message", () => {
    it("should pass if a valid offer message is provided", () => {
      const message: SocketClientToServerEventsData[typeof SocketEvents.SEND_SDP] =
        { userId, sdp, type: "offer" };

      const isValid = checkIsValid(message);
      expect(isValid).toBe(true);
    });

    it("should pass if a valid answer message is provided", () => {
      const message: SocketClientToServerEventsData[typeof SocketEvents.SEND_SDP] =
        { userId, sdp, type: "answer" };

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

      it("should fail if userId is missing", () => {
        const message = { sdp, type: "offer" };

        const isValid = checkIsValid(message);
        expect(isValid).toBe(false);
      });

      it("should fail if sdp is missing", () => {
        const message = { userId, type: "answer" };

        const isValid = checkIsValid(message);
        expect(isValid).toBe(false);
      });

      it("should fail if type is missing", () => {
        const message = { userId, sdp };

        const isValid = checkIsValid(message);
        expect(isValid).toBe(false);
      });

      it("should fail if a redundant field is provided", () => {
        const message = { userId, sdp, type: "offer", extra: "extra" };

        const isValid = checkIsValid(message);
        expect(isValid).toBe(false);
      });
    });

    describe("invalid value", () => {
      it("should fail if an invalid userId is provided", () => {
        const message = { userId: 0e1, sdp, type: "offer" };

        const isValid = checkIsValid(message);
        expect(isValid).toBe(false);
      });

      it("should fail if an invalid sdp is provided", () => {
        const message = { userId, sdp: 0e1, type: "offer" };

        const isValid = checkIsValid(message);
        expect(isValid).toBe(false);
      });

      it("should fail if an invalid type is provided", () => {
        const message = { userId, sdp, type: "offerAndAnswer" };

        const isValid = checkIsValid(message);
        expect(isValid).toBe(false);
      });

      it("should fail if invalid userId, sdp and type are provided", () => {
        const message = { userId: 0e1, sdp: 0e1, type: "offerAndAnswer" };

        const isValid = checkIsValid(message);
        expect(isValid).toBe(false);
      });
    });
  });
});
