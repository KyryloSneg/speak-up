import { describe, expect, it } from "vitest";
import type {
  SocketClientToServerEventsData,
  SocketEvents,
} from "../../../../types/socketEvents.ts";
import { getZodSendIceDataValidation } from "../../../../utils/validation.ts";

describe("sendIceValidator", () => {
  function checkIsValid(message: unknown): boolean {
    return getZodSendIceDataValidation().safeParse(message).success;
  }

  const userId = "userId";

  const ice = { candidate: "candidate", sdpMid: "sdpMid", sdpMLineIndex: 0 };

  const iceWithOnlyCandidate = { candidate: "candidate" };
  const iceWithNullOptionalFields = {
    candidate: "candidate",
    sdpMid: null,
    sdpMLineIndex: null,
  };

  const iceWithNoMid = { candidate: "candidate", sdpMLineIndex: 0 };
  const iceWithNullMid = {
    candidate: "candidate",
    sdpMid: null,
    sdpMLineIndex: 0,
  };

  const iceWithNoIndex = { candidate: "candidate", sdpMid: "sdpMid" };
  const iceWithNullIndex = {
    candidate: "candidate",
    sdpMid: "sdpMid",
    sdpMLineIndex: null,
  };

  describe("valid message", () => {
    it("should pass if a valid message is provided (everything's defined)", () => {
      const message: SocketClientToServerEventsData[typeof SocketEvents.SEND_ICE] =
        { userId, ice };

      const isValid = checkIsValid(message);
      expect(isValid).toBe(true);
    });

    it("should pass if a valid message is provided (only candidate)", () => {
      const message: SocketClientToServerEventsData[typeof SocketEvents.SEND_ICE] =
        { userId, ice: iceWithOnlyCandidate };

      const isValid = checkIsValid(message);
      expect(isValid).toBe(true);
    });

    it("should pass if a valid message is provided (only candidate and null sdpMid and sdpMLineIndex)", () => {
      const message: SocketClientToServerEventsData[typeof SocketEvents.SEND_ICE] =
        { userId, ice: iceWithNullOptionalFields };

      const isValid = checkIsValid(message);
      expect(isValid).toBe(true);
    });

    it("should pass if a valid message is provided (only candidate and sdpMLineIndex)", () => {
      const message: SocketClientToServerEventsData[typeof SocketEvents.SEND_ICE] =
        { userId, ice: iceWithNoMid };

      const isValid = checkIsValid(message);
      expect(isValid).toBe(true);
    });

    it("should pass if a valid message is provided (only candidate and sdpMLineIndex; null sdpMid)", () => {
      const message: SocketClientToServerEventsData[typeof SocketEvents.SEND_ICE] =
        { userId, ice: iceWithNullMid };

      const isValid = checkIsValid(message);
      expect(isValid).toBe(true);
    });

    it("should pass if a valid message is provided (only candidate and sdpMid)", () => {
      const message: SocketClientToServerEventsData[typeof SocketEvents.SEND_ICE] =
        { userId, ice: iceWithNoIndex };

      const isValid = checkIsValid(message);
      expect(isValid).toBe(true);
    });

    it("should pass if a valid message is provided (only candidate and sdpMid; null sdpMLineIndex)", () => {
      const message: SocketClientToServerEventsData[typeof SocketEvents.SEND_ICE] =
        { userId, ice: iceWithNullIndex };

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
        const message = { ice };

        const isValid = checkIsValid(message);
        expect(isValid).toBe(false);
      });

      it("should fail if ice is missing", () => {
        const message = { userId };

        const isValid = checkIsValid(message);
        expect(isValid).toBe(false);
      });

      it("should fail if a redundant field is provided", () => {
        const message = { userId, ice, extra: "extra" };

        const isValid = checkIsValid(message);
        expect(isValid).toBe(false);
      });
    });

    describe("invalid value", () => {
      it("should fail if an invalid userId is provided", () => {
        const message = { userId: 0e1, ice };

        const isValid = checkIsValid(message);
        expect(isValid).toBe(false);
      });

      it("should fail if an invalid ice is provided", () => {
        const message = { userId, ice: 0e1 };

        const isValid = checkIsValid(message);
        expect(isValid).toBe(false);
      });

      it("should fail if invalid userId and ice are provided", () => {
        const message = { userId: 0e1, ice: 0e1 };

        const isValid = checkIsValid(message);
        expect(isValid).toBe(false);
      });
    });
  });
});
