import DefaultLayout from "@/components/layout/default/DefaultLayout.vue";
import useAppLayout from "@/composables/useAppLayout";
import { routes } from "@/router";
import { RouteLayouts } from "@/types/routes";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { reactive, ref } from "vue";
import type { RouteMeta } from "vue-router";

type Route = (typeof routes)[keyof typeof routes];

const routeWithLayout = routes.find(route => "layout" in route.meta);
const routeWithoutLayout = routes.find(route => !("layout" in route.meta));

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

describe("useAppLayout", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockRoute.value = null;
  });

  if (routeWithLayout) {
    it("should return a layout if current route has one", () => {
      mockRoute.value = routeWithLayout;
      const layoutName = (routeWithLayout.meta as Required<RouteMeta>).layout;

      const layout = useAppLayout();
      expect(layout.value).toBe(RouteLayouts[layoutName]);
    });
  }

  if (routeWithoutLayout) {
    it("should return default layout if current route doesn't have any", () => {
      mockRoute.value = routeWithoutLayout;

      const layout = useAppLayout();
      expect(layout.value).toBe(DefaultLayout);
    });
  }
});
