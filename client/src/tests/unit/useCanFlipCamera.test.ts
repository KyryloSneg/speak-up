import useCanFlipCamera from "@/composables/useCanFlipCamera";
import { useMediaStore } from "@/stores/media";
import { mockCameras } from "@/tests/utils/mediaConsts";
import { objectEntries } from "@speak-up/shared";
import _ from "lodash";
import { createPinia, setActivePinia } from "pinia";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { ref } from "vue";

const mockIsMobile = ref(true);
vi.mock("@/composables/useIsMobile", () => ({ default: () => mockIsMobile }));

const camerasWithoutKeywords = mockCameras;
const camerasWithFrontKeywordCam: MediaDeviceInfo[] = [
  ...camerasWithoutKeywords,
  {
    deviceId: "keywordDeviceId",
    groupId: "keywordGroupId",
    kind: "videoinput",
    label: "a front camera",
    toJSON: () => {},
  },
] as const;

const camerasWithUserKeywordCam: MediaDeviceInfo[] = [
  ...camerasWithoutKeywords,
  {
    deviceId: "keywordDeviceId",
    groupId: "keywordGroupId",
    kind: "videoinput",
    label: "an user camera",
    toJSON: () => {},
  },
] as const;

const camerasWithSelfieKeywordCam: MediaDeviceInfo[] = [
  ...camerasWithoutKeywords,
  {
    deviceId: "keywordDeviceId",
    groupId: "keywordGroupId",
    kind: "videoinput",
    label: "a selfie camera",
    toJSON: () => {},
  },
] as const;

const camerasWithBackKeywordCam: MediaDeviceInfo[] = [
  ...camerasWithoutKeywords,
  {
    deviceId: "keywordDeviceId",
    groupId: "keywordGroupId",
    kind: "videoinput",
    label: "a back camera",
    toJSON: () => {},
  },
] as const;

const camerasWithEnvironmentKeywordCam: MediaDeviceInfo[] = [
  ...camerasWithoutKeywords,
  {
    deviceId: "keywordDeviceId",
    groupId: "keywordGroupId",
    kind: "videoinput",
    label: "an environment camera",
    toJSON: () => {},
  },
] as const;

const camerasWithRearKeywordCam: MediaDeviceInfo[] = [
  ...camerasWithoutKeywords,
  {
    deviceId: "keywordDeviceId",
    groupId: "keywordGroupId",
    kind: "videoinput",
    label: "a rear camera",
    toJSON: () => {},
  },
] as const;

const frontCamerasObj = {
  front: camerasWithFrontKeywordCam,
  user: camerasWithUserKeywordCam,
  selfie: camerasWithSelfieKeywordCam,
} as const;

const backCamerasObj = {
  back: camerasWithBackKeywordCam,
  environment: camerasWithEnvironmentKeywordCam,
  rear: camerasWithRearKeywordCam,
} as const;

function mixCameras(...cameras: MediaDeviceInfo[][]): MediaDeviceInfo[] {
  return Array.from(new Set(cameras.flat()));
}

describe("useCanFlipCamera", () => {
  beforeEach(() => {
    setActivePinia(createPinia());
    vi.clearAllMocks();
  });

  describe("mobile", () => {
    beforeEach(() => {
      mockIsMobile.value = true;
    });

    const encounteredMixes: Set<string>[] = [];

    objectEntries(frontCamerasObj).forEach(([frontKey, frontCameras]) =>
      objectEntries(backCamerasObj).forEach(([backKey, backCameras]) => {
        const keyMixSet = new Set([frontKey, backKey]);

        if (encounteredMixes.some(mix => _.isEqual(mix, keyMixSet))) return;
        encounteredMixes.push(keyMixSet);

        it(`should return true if there are cameras with ${frontKey} and ${backKey} keywords in their label`, () => {
          const mediaStore = useMediaStore();
          mediaStore.devices = mixCameras(frontCameras, backCameras);

          const canFlipCamera = useCanFlipCamera();
          expect(canFlipCamera.value).toBe(true);
        });
      }),
    );

    it("should return false if there are not enough cameras", () => {
      const mediaStore = useMediaStore();
      mediaStore.devices = camerasWithFrontKeywordCam;

      const canFlipCamera = useCanFlipCamera();
      expect(canFlipCamera.value).toBe(false);

      mediaStore.devices = camerasWithBackKeywordCam;
      expect(canFlipCamera.value).toBe(false);
    });
  });

  describe("desktop", () => {
    beforeEach(() => {
      const mediaStore = useMediaStore();
      mediaStore.devices = mixCameras(
        camerasWithFrontKeywordCam,
        camerasWithBackKeywordCam,
      );

      mockIsMobile.value = false;
    });

    it("should return false even if there are both front and back cameras somehow", () => {
      const canFlipCamera = useCanFlipCamera();
      expect(canFlipCamera.value).toBe(false);
    });
  });
});
