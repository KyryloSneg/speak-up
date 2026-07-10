import getMediaTrackDeviceId from "@/utils/getMediaTrackDeviceId";
import { describe, expect, it } from "vitest";

describe("getMediaTrackDeviceId", () => {
  describe("constraints are set", () => {
    const expectedDeviceId = "deviceId";

    it("should return a proper device id if it's set as a string", () => {
      const deviceId = getMediaTrackDeviceId({ deviceId: expectedDeviceId });
      expect(deviceId).toBe(expectedDeviceId);
    });

    it("should return a proper device id if it's set as an .ideal string", () => {
      const deviceId = getMediaTrackDeviceId({
        deviceId: { ideal: expectedDeviceId },
      });

      expect(deviceId).toBe(expectedDeviceId);
    });

    it("should return a proper device id if it's set as an .exact string", () => {
      const deviceId = getMediaTrackDeviceId({
        deviceId: { exact: expectedDeviceId },
      });

      expect(deviceId).toBe(expectedDeviceId);
    });

    it("should fallback to 'default' device if the constraints are empty", () => {
      const deviceId = getMediaTrackDeviceId({});
      expect(deviceId).toBe("default");
    });

    it("should fallback to 'default' device if the .deviceId constraints are empty", () => {
      const deviceId = getMediaTrackDeviceId({ deviceId: {} });
      expect(deviceId).toBe("default");
    });
  });

  describe("constraints are absent", () => {
    it("should try to return 'default' device if the constraints are absent", () => {
      const deviceId = getMediaTrackDeviceId();
      expect(deviceId).toBe("default");
    });
  });
});
