import DefaultLayout from "@/components/layout/default/DefaultLayout.vue";
import { RouteLayouts } from "@/types/routes";
import { computed } from "vue";
import { useRoute } from "vue-router";

function useAppLayout() {
  const route = useRoute();
  const layout = computed(() => {
    const name = route.meta.layout;
    if (!name) return DefaultLayout;

    return RouteLayouts[name];
  });

  return layout;
}

export default useAppLayout;
