import { describe, expect, it } from "vitest";
import { getZodIceValidation } from "../../../utils/validation.ts";

describe("sendIceValidator", () => {
  function checkIsValid(message: unknown): boolean {
    return getZodIceValidation().safeParse(message).success;
  }

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

  describe("valid ice", () => {
    it("should pass if a valid ice is provided", () => {
      const isValid = checkIsValid(ice);
      expect(isValid).toBe(true);
    });

    it("should pass if a valid ice is provided (only candidate)", () => {
      const isValid = checkIsValid(iceWithOnlyCandidate);
      expect(isValid).toBe(true);
    });

    it("should pass if a valid ice is provided (only candidate and null sdpMid and sdpMLineIndex)", () => {
      const isValid = checkIsValid(iceWithNullOptionalFields);
      expect(isValid).toBe(true);
    });

    it("should pass if a valid ice is provided (only candidate and sdpMLineIndex)", () => {
      const isValid = checkIsValid(iceWithNoMid);
      expect(isValid).toBe(true);
    });

    it("should pass if a valid ice is provided (only candidate and sdpMLineIndex; null sdpMid)", () => {
      const isValid = checkIsValid(iceWithNullMid);
      expect(isValid).toBe(true);
    });

    it("should pass if a valid ice is provided (only candidate and sdpMid)", () => {
      const isValid = checkIsValid(iceWithNoIndex);
      expect(isValid).toBe(true);
    });

    it("should pass if a valid ice is provided (only candidate and sdpMid; null sdpMLineIndex)", () => {
      const isValid = checkIsValid(iceWithNullIndex);
      expect(isValid).toBe(true);
    });
  });

  describe("invalid ice", () => {
    describe("invalid syntax", () => {
      it("should fail if a non-object is provided", () => {
        const isValid = checkIsValid(null);
        expect(isValid).toBe(false);
      });

      it("should fail if an empty object is provided", () => {
        const isValid = checkIsValid({});
        expect(isValid).toBe(false);
      });

      it("should fail if a redundant field is provided", () => {
        const isValid = checkIsValid({ ...ice, extra: "extra" });
        expect(isValid).toBe(false);
      });

      it("should fail if candidate is absent", () => {
        const isValid = checkIsValid({
          sdpMid: ice.sdpMid,
          sdpMLineIndex: ice.sdpMLineIndex,
        });

        expect(isValid).toBe(false);
      });
    });

    describe("invalid value", () => {
      it("should fail if a null candidate provided", () => {
        const isValid = checkIsValid({ ...ice, candidate: null });
        expect(isValid).toBe(false);
      });

      it("should fail if an invalid candidate is provided", () => {
        const isValid = checkIsValid({ ...ice, candidate: 0e1 });
        expect(isValid).toBe(false);
      });

      it("should fail if an invalid sdpMid is provided", () => {
        const isValid = checkIsValid({ ...ice, sdpMid: 0e1 });
        expect(isValid).toBe(false);
      });

      it("should fail if an invalid sdpMLineIndex is provided", () => {
        const isValid = checkIsValid({ ...ice, sdpMLineIndex: "0" });
        expect(isValid).toBe(false);
      });
    });
  });
});
