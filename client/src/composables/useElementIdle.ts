import { useDebounceFn, useEventListener } from "@vueuse/core";
import {
  onMounted,
  ref,
  toValue,
  type MaybeRefOrGetter,
  type TemplateRef,
} from "vue";

function useElementIdle(
  elemRef: TemplateRef<HTMLElement>,
  idleCondition?: MaybeRefOrGetter<boolean>,
) {
  const isIdle = ref(false);

  const debouncedIdleTimeoutFn = useDebounceFn(() => {
    if (toValue(idleCondition)) return;
    isIdle.value = true;
  }, 5000);

  onMounted(() => {
    const events = [
      "mousemove",
      "mousedown",
      "resize",
      "keydown",
      "touchstart",
      "wheel",
    ] as const;

    events.forEach(event =>
      useEventListener(elemRef, event, () => {
        isIdle.value = false;
        debouncedIdleTimeoutFn();
      }),
    );
  });

  return isIdle;
}

export default useElementIdle;
