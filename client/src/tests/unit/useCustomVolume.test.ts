import useCustomVolume from "@/composables/useCustomVolume";
import { afterEach, beforeEach, describe, expect, it } from "vitest";
import { nextTick } from "vue";

describe("useCustomVolume", () => {
  beforeEach(() => {
    localStorage.clear();
  });

  afterEach(() => {
    localStorage.clear();
  });

  it("should initialize with default volume [100] using the correct localStorage key", () => {
    const volume = useCustomVolume("user-123", "user");

    expect(volume.value).toEqual([100]);
    expect(localStorage.getItem("user-123-user")).toBe("[100]");
  });

  it("should construct key correctly for screenSharing type", () => {
    useCustomVolume("user-123", "screenSharing");
    expect(localStorage.getItem("user-123-screenSharing")).toBe("[100]");
  });

  it("should allow setting values within valid range [0, 200]", async () => {
    const volume = useCustomVolume("user-123", "user");

    volume.value = [50];
    await nextTick();
    expect(volume.value).toEqual([50]);

    volume.value = [0];
    await nextTick();
    expect(volume.value).toEqual([0]);

    volume.value = [200];
    await nextTick();
    expect(volume.value).toEqual([200]);
  });

  it("should clamp volume to 200 when set above maximum limit", async () => {
    const volume = useCustomVolume("user-123", "user");

    volume.value = [250];
    await nextTick();

    expect(volume.value).toEqual([200]);
    expect(localStorage.getItem("user-123-user")).toBe("[200]");
  });

  it("should clamp volume to 0 when set below minimum limit", async () => {
    const volume = useCustomVolume("user-123", "user");

    volume.value = [-50];
    await nextTick();

    expect(volume.value).toEqual([0]);
    expect(localStorage.getItem("user-123-user")).toBe("[0]");
  });

  it("should clamp array element when mutated directly in place", async () => {
    const volume = useCustomVolume("user-123", "user");

    volume.value[0] = 300;
    await nextTick();

    expect(volume.value).toEqual([200]);
    expect(localStorage.getItem("user-123-user")).toBe("[200]");
  });

  it("should clamp initial value on read if localStorage contains out-of-bounds volume", () => {
    localStorage.setItem("user-123-user", JSON.stringify([250]));
    const volume = useCustomVolume("user-123", "user");

    expect(volume.value).toEqual([200]);
  });

  it("should fallback to [100] if localStorage contains corrupt JSON", () => {
    localStorage.setItem("user-123-user", "invalid-json");
    const volume = useCustomVolume("user-123", "user");

    expect(volume.value).toEqual([100]);
  });
});
