import { FOCUSABLE_SELECTOR } from "@/utils/consts";
import { useMutationObserver } from "@vueuse/core";
import { toValue, watch, type MaybeRefOrGetter, type TemplateRef } from "vue";

function useControllingFocus(
  disabled: MaybeRefOrGetter<boolean>,
  elemRef: TemplateRef<HTMLElement>,
) {
  function updateDescendantsFocus(disabled: boolean) {
    const container = elemRef.value;
    if (!container) return;

    const elements = container.querySelectorAll(FOCUSABLE_SELECTOR);

    elements.forEach(elem => {
      if (disabled) {
        if (!elem.hasAttribute("data-orig-tabindex")) {
          const currentTabindex = elem.getAttribute("tabindex");
          elem.setAttribute(
            "data-orig-tabindex",
            currentTabindex !== null ? currentTabindex : "none",
          );
        }
        elem.setAttribute("tabindex", "-1");
      } else {
        const orig = elem.getAttribute("data-orig-tabindex");

        if (orig === "none") {
          elem.removeAttribute("tabindex");
        } else if (orig !== null) {
          elem.setAttribute("tabindex", orig);
        }

        elem.removeAttribute("data-orig-tabindex");
      }
    });
  }

  watch(
    () => toValue(disabled),
    disabled => {
      updateDescendantsFocus(disabled);
    },
    { flush: "post" },
  );

  useMutationObserver(
    elemRef,
    () => {
      const disabledValue = toValue(disabled);
      updateDescendantsFocus(disabledValue);
    },
    {
      childList: true,
      subtree: true,
    },
  );
}

export default useControllingFocus;
