import { mockCameras, mockMicrophones } from "@/tests/utils/mediaConsts";
import type { Page } from "@playwright/test";

interface MockMediaOptions {
  microphones?: MediaDeviceInfo[];
  cameras?: MediaDeviceInfo[];
  failCamera?: boolean;
  failMicrophone?: boolean;
  denyAll?: boolean;
}

async function setupE2EFakeBrowserMediaEngine(
  page: Page,
  options: MockMediaOptions = {},
) {
  const {
    microphones = mockMicrophones,
    cameras = mockCameras,
    denyAll: origDenyAll = false,
    failCamera = false,
    failMicrophone = false,
  } = options;

  const denyAll = origDenyAll || (failCamera && failMicrophone);

  await page.addInitScript(
    ({ microphones, cameras, denyAll, failCamera, failMicrophone }) => {
      const deviceList = [...microphones, ...cameras] as const;

      if (!navigator.mediaDevices) {
        Object.defineProperty(navigator, "mediaDevices", {
          value: {},
          configurable: true,
        });
      }

      if (navigator.permissions) {
        const createPermissionStatus = (state: PermissionState) => ({
          state,
          onchange: null,
          addEventListener: () => {},
          removeEventListener: () => {},
          dispatchEvent: () => false,
        });

        const originalQuery = navigator.permissions.query?.bind(
          navigator.permissions,
        );

        Object.defineProperty(navigator.permissions, "query", {
          configurable: true,
          writable: true,
          enumerable: true,
          value: async (descriptor: PermissionDescriptor) => {
            if (descriptor.name === "camera") {
              return createPermissionStatus(
                denyAll || failCamera ? "denied" : "granted",
              );
            }
            if (descriptor.name === "microphone") {
              return createPermissionStatus(
                denyAll || failMicrophone ? "denied" : "granted",
              );
            }
            return originalQuery
              ? originalQuery(descriptor)
              : createPermissionStatus("prompt");
          },
        });
      }

      Object.defineProperties(navigator.mediaDevices, {
        enumerateDevices: {
          value: async () => (denyAll ? [] : deviceList),
          configurable: true,
          writable: true,
          enumerable: true,
        },

        getUserMedia: {
          value: async (constraints: MediaStreamConstraints) => {
            if (denyAll) {
              throw new DOMException("Permission denied", "NotAllowedError");
            }

            if (constraints?.video && failCamera) {
              throw new DOMException(
                "Camera permission denied",
                "NotAllowedError",
              );
            }

            if (constraints?.audio && failMicrophone) {
              throw new DOMException(
                "Microphone permission denied",
                "NotAllowedError",
              );
            }

            return {
              getTracks: () => [],
              getVideoTracks: () => [],
              getAudioTracks: () => [],
              active: true,
              addEventListener: () => {},
              removeEventListener: () => {},
            };
          },
          configurable: true,
          writable: true,
          enumerable: true,
        },
      });
    },
    {
      microphones,
      cameras,
      denyAll,
      failCamera,
      failMicrophone,
    },
  );
}

export default setupE2EFakeBrowserMediaEngine;
