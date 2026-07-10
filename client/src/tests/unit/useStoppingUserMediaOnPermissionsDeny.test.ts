import useStoppingUserMediaOnPermissionsDeny from "@/composables/useStoppingUserMediaOnPermissionsDeny";
import { useMediaStore } from "@/stores/media";
import { usePermissionsStore } from "@/stores/permissions";
import { createPinia, setActivePinia } from "pinia";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { nextTick } from "vue";

describe("useStoppingUserMediaOnPermissionsDeny", () => {
  beforeEach(() => {
    setActivePinia(createPinia());
    vi.clearAllMocks();
  });

  it("should stop user media entirely if all corresponding permissions were denied", async () => {
    const mediaStore = useMediaStore();
    const permissionsStore = usePermissionsStore();

    const stopSpy = vi.spyOn(mediaStore, "stop");

    useStoppingUserMediaOnPermissionsDeny();
    await nextTick();

    permissionsStore.microphone = "denied";
    permissionsStore.camera = "denied";

    await nextTick();
    expect(stopSpy).toHaveBeenCalledOnce();
  });

  it("should not stop user media if not all corresponding permissions were denied", async () => {
    const mediaStore = useMediaStore();
    const permissionsStore = usePermissionsStore();

    const stopSpy = vi.spyOn(mediaStore, "stop");

    useStoppingUserMediaOnPermissionsDeny();
    await nextTick();

    expect(stopSpy).not.toHaveBeenCalled();
    permissionsStore.microphone = "denied";

    await nextTick();
    expect(stopSpy).not.toHaveBeenCalled();

    permissionsStore.microphone = "granted";
    permissionsStore.camera = "denied";

    await nextTick();
    expect(stopSpy).not.toHaveBeenCalled();

    permissionsStore.camera = "granted";

    await nextTick();
    expect(stopSpy).not.toHaveBeenCalled();

    permissionsStore.microphone = "prompt";

    await nextTick();
    expect(stopSpy).not.toHaveBeenCalled();

    permissionsStore.microphone = "granted";
    permissionsStore.camera = "prompt";

    await nextTick();
    expect(stopSpy).not.toHaveBeenCalled();
  });
});
