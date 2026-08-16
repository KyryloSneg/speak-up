import useAutoHidingOverlay from "@/composables/useAutoHidingOverlay";
import useElementIdle from "@/composables/useElementIdle";
import useIsPopupOpened from "@/composables/useIsPopupOpened";
import { mount } from "@vue/test-utils";
import { useElementHover, useFocusWithin } from "@vueuse/core";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { computed, defineComponent, ref } from "vue";

vi.mock("@vueuse/core", () => ({
  useElementHover: vi.fn(),
  useFocusWithin: vi.fn(),
}));

vi.mock("@/composables/useElementIdle", () => ({ default: vi.fn() }));
vi.mock("@/composables/useIsPopupOpened", () => ({ default: vi.fn() }));

describe("useAutoHidingOverlay", () => {
  let isHoveredRef = ref(false);
  let focusedRef = ref(false);
  let isPopupOpenedRef = ref(false);
  let isIdleRef = ref(false);

  const focusedComputed = computed(() => focusedRef.value);

  let capturedPopupCallback: ((open: boolean) => void) | undefined;
  let capturedPopupTargetGetter: (() => HTMLElement | undefined) | undefined;
  let capturedIdleConditionGetter: (() => boolean) | undefined;

  beforeEach(() => {
    vi.clearAllMocks();

    isHoveredRef = ref(false);
    focusedRef = ref(false);
    isPopupOpenedRef = ref(false);
    isIdleRef = ref(false);

    capturedPopupCallback = undefined;
    capturedPopupTargetGetter = undefined;
    capturedIdleConditionGetter = undefined;

    vi.mocked(useElementHover).mockReturnValue(isHoveredRef);
    vi.mocked(useFocusWithin).mockReturnValue({ focused: focusedComputed });

    vi.mocked(useIsPopupOpened).mockImplementation((target, cb) => {
      capturedPopupTargetGetter = target as () => HTMLElement | undefined;
      capturedPopupCallback = cb as (open: boolean) => void;

      return isPopupOpenedRef;
    });

    vi.mocked(useElementIdle).mockImplementation((_, condition) => {
      capturedIdleConditionGetter = condition as () => boolean;
      return isIdleRef;
    });
  });

  function mountTestComponent(isWithPopups?: boolean | (() => boolean)) {
    let isVisibleRef: ReturnType<typeof useAutoHidingOverlay>;

    const Component = defineComponent({
      setup() {
        const targetRef = ref<HTMLElement | null>(
          document.createElement("div"),
        );

        isVisibleRef = useAutoHidingOverlay(targetRef, isWithPopups);
        return { targetRef };
      },
      template: '<div ref="targetRef"></div>',
    });

    const wrapper = mount(Component);
    return { wrapper, isVisibleRef: isVisibleRef! };
  }

  it("should evaluate visibility correctly based on hover, focus, popup, and idle state", () => {
    const { isVisibleRef } = mountTestComponent();
    expect(isVisibleRef.value).toBe(false);

    isHoveredRef.value = true;
    expect(isVisibleRef.value).toBe(true);

    isHoveredRef.value = false;
    focusedRef.value = true;
    expect(isVisibleRef.value).toBe(true);

    focusedRef.value = false;
    isPopupOpenedRef.value = true;
    expect(isVisibleRef.value).toBe(true);

    isIdleRef.value = true;
    expect(isVisibleRef.value).toBe(false);
  });

  it("should pass element to useIsPopupOpened when isWithPopups is true", () => {
    mountTestComponent(true);

    expect(capturedPopupTargetGetter).toBeDefined();
    expect(capturedPopupTargetGetter?.()).toBeInstanceOf(HTMLElement);
  });

  it("should pass undefined to useIsPopupOpened target getter when isWithPopups is false", () => {
    mountTestComponent(false);

    expect(capturedPopupTargetGetter).toBeDefined();
    expect(capturedPopupTargetGetter?.()).toBeUndefined();
  });

  it("should reset isIdle to false when popup is opened via useIsPopupOpened callback", () => {
    mountTestComponent();

    isIdleRef.value = true;
    expect(capturedPopupCallback).toBeDefined();

    capturedPopupCallback?.(true);
    expect(isIdleRef.value).toBe(false);

    isIdleRef.value = true;
    capturedPopupCallback?.(false);
    expect(isIdleRef.value).toBe(true);
  });

  it("should configure useElementIdle condition to invert isPopupOpened state", () => {
    mountTestComponent();

    expect(capturedIdleConditionGetter).toBeDefined();

    isPopupOpenedRef.value = false;
    expect(capturedIdleConditionGetter?.()).toBe(true);

    isPopupOpenedRef.value = true;
    expect(capturedIdleConditionGetter?.()).toBe(false);
  });
});
