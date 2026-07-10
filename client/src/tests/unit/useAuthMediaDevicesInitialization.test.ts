import useAuthMediaDevicesInitialization from "@/composables/useAuthMediaDevicesInitialization";
import useMediaDevicesInitialization from "@/composables/useMediaDevicesInitialization";
import { routes } from "@/router";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { nextTick, reactive, ref } from "vue";
import type { RouteMeta } from "vue-router";

type Route = (typeof routes)[keyof typeof routes];

const authRoute = routes.find(route => route.meta.accessType === "auth");
const guestRoute = routes.find(route => route.meta.accessType === "guest");

const mockRoute = ref<Route | null>(null);

vi.mock("vue-router", async importOriginal => ({
  ...(await importOriginal()),
  useRoute: () =>
    reactive({
      get meta() {
        return (mockRoute.value as unknown as { meta: RouteMeta })?.meta ?? {};
      },

      get path() {
        return (mockRoute.value as unknown as { path: string }).path;
      },
    }),
}));

vi.mock("@/composables/useMediaDevicesInitialization", () => ({
  default: vi.fn(),
}));

describe("useAuthMediaDevicesInitialization", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockRoute.value = null;
  });

  if (authRoute) {
    it("should initialize media devices exactly once if user gets redirected to an auth route", async () => {
      mockRoute.value = guestRoute || authRoute;

      useAuthMediaDevicesInitialization();
      await nextTick();

      if (!guestRoute) {
        return expect(useMediaDevicesInitialization).toHaveBeenCalledOnce();
      }

      mockRoute.value = authRoute;
      await nextTick();

      expect(useMediaDevicesInitialization).toHaveBeenCalledOnce();

      mockRoute.value = guestRoute;
      await nextTick();

      // hasn't been called since the previous assertion
      expect(useMediaDevicesInitialization).toHaveBeenCalledOnce();

      mockRoute.value = authRoute;
      await nextTick();

      expect(useMediaDevicesInitialization).toHaveBeenCalledOnce();
    });
  }

  if (guestRoute) {
    it("should do nothing if user is on a guest route", async () => {
      mockRoute.value = guestRoute;

      useAuthMediaDevicesInitialization();
      await nextTick();

      expect(useMediaDevicesInitialization).not.toHaveBeenCalled();
    });
  }
});
