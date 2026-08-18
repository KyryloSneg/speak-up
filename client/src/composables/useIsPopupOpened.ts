import { useMutationObserver } from "@vueuse/core";
import { ref, unref, type MaybeRef, type MaybeRefOrGetter } from "vue";

function useIsPopupOpened(
  elemRef: MaybeRefOrGetter<HTMLElement | null | undefined>,
  changedCb?: MaybeRef<(open: boolean) => void>,
) {
  const isPopupOpened = ref(false);
  const unwrappedChangedCb = unref(changedCb);

  useMutationObserver(
    elemRef,
    mutations => {
      for (const mutation of mutations) {
        if (
          mutation.type === "attributes" &&
          mutation.attributeName === "aria-expanded"
        ) {
          const target = mutation.target as HTMLElement;
          isPopupOpened.value = target.getAttribute("aria-expanded") === "true";

          unwrappedChangedCb?.(isPopupOpened.value);
        }
      }
    },
    {
      attributes: true,
      attributeFilter: ["aria-expanded"],
      subtree: true,
    },
  );

  return isPopupOpened;
}

export default useIsPopupOpened;
