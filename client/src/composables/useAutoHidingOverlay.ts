import useElementIdle from "@/composables/useElementIdle";
import useIsPopupOpened from "@/composables/useIsPopupOpened";
import { useElementHover, useFocusWithin } from "@vueuse/core";
import {
  computed,
  toValue,
  type MaybeRefOrGetter,
  type TemplateRef,
} from "vue";

function useAutoHidingOverlay(
  elemRef: TemplateRef<HTMLElement>,
  isWithPopups: MaybeRefOrGetter<boolean> = true,
) {
  const isHovered = useElementHover(elemRef);
  const { focused } = useFocusWithin(elemRef);

  const isPopupOpened = useIsPopupOpened(
    () => (toValue(isWithPopups) ? elemRef.value : undefined),
    open => {
      if (open) isIdle.value = false;
    },
  );

  const isIdle = useElementIdle(elemRef, () => !isPopupOpened.value);
  const isVisible = computed(
    () =>
      !isIdle.value &&
      (isPopupOpened.value || isHovered.value || focused.value),
  );

  return isVisible;
}

export default useAutoHidingOverlay;
