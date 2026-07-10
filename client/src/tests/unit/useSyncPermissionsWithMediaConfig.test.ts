import useSyncPermissionsWithMediaConfig from "@/composables/useSyncPermissionsWithMediaConfig";
import { useMediaStore } from "@/stores/media";
import { usePermissionsStore } from "@/stores/permissions";
import type { SocketMediaConfig } from "@speak-up/shared";
import { createPinia, setActivePinia } from "pinia";
import { beforeEach, describe, expect, it } from "vitest";
import { nextTick } from "vue";

describe("useSyncPermissionsWithMediaConfig", () => {
  beforeEach(() => {
    setActivePinia(createPinia());
  });

  it("should properly turn off a device if the corresponding permission is denied", async () => {
    const mediaStore = useMediaStore();
    const permissionsStore = usePermissionsStore();

    const config: SocketMediaConfig = { audio: true, video: true } as const;
    mediaStore.config = config;

    useSyncPermissionsWithMediaConfig();
    await nextTick();

    expect(mediaStore.config).toStrictEqual(config);

    permissionsStore.microphone = "granted";
    permissionsStore.camera = "granted";

    await nextTick();
    expect(mediaStore.config).toStrictEqual(config);

    permissionsStore.microphone = "denied";

    await nextTick();
    expect(mediaStore.config).toStrictEqual({ audio: false, video: true });

    permissionsStore.camera = "denied";

    await nextTick();
    expect(mediaStore.config).toStrictEqual({ audio: false, video: false });
  });

  it("should leave config as is if the related devices are turned off", async () => {
    const mediaStore = useMediaStore();
    const permissionsStore = usePermissionsStore();

    const config: SocketMediaConfig = { audio: false, video: false } as const;
    mediaStore.config = config;

    useSyncPermissionsWithMediaConfig();
    await nextTick();

    expect(mediaStore.config).toStrictEqual(config);

    permissionsStore.microphone = "granted";
    permissionsStore.camera = "granted";

    await nextTick();
    expect(mediaStore.config).toStrictEqual(config);

    permissionsStore.microphone = "denied";
    permissionsStore.camera = "denied";

    await nextTick();
    expect(mediaStore.config).toStrictEqual(config);
  });
});
