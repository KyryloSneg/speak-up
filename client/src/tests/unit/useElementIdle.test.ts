import useElementIdle from "@/composables/useElementIdle";
import { mount } from "@vue/test-utils";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { defineComponent, ref } from "vue";

describe("useElementIdle", () => {
  beforeEach(() => {
    vi.useFakeTimers();
  });

  afterEach(() => {
    vi.restoreAllMocks();
    vi.useRealTimers();
  });

  function createTestComponent(
    idleCondition?: Parameters<typeof useElementIdle>[1],
  ) {
    let isIdleRef: ReturnType<typeof useElementIdle>;

    const Component = defineComponent({
      setup() {
        const targetRef = ref<HTMLElement | null>(null);
        isIdleRef = useElementIdle(targetRef, idleCondition);

        return { targetRef };
      },
      template: '<div ref="targetRef" id="target"></div>',
    });

    const wrapper = mount(Component);
    return { wrapper, isIdleRef: isIdleRef! };
  }

  it("should initialize isIdle as false", () => {
    const { isIdleRef } = createTestComponent();
    expect(isIdleRef.value).toBe(false);
  });

  it("should set isIdle to true after 5000ms of inactivity following an event", () => {
    const { wrapper, isIdleRef } = createTestComponent();
    const targetEl = wrapper.find("#target").element;

    targetEl.dispatchEvent(new Event("mousemove"));
    expect(isIdleRef.value).toBe(false);

    vi.advanceTimersByTime(4999);
    expect(isIdleRef.value).toBe(false);

    vi.advanceTimersByTime(1);
    expect(isIdleRef.value).toBe(true);
  });

  it("should reset isIdle to false immediately upon user interaction", () => {
    const { wrapper, isIdleRef } = createTestComponent();
    const targetEl = wrapper.find("#target").element;

    targetEl.dispatchEvent(new Event("mousemove"));
    vi.advanceTimersByTime(5000);
    expect(isIdleRef.value).toBe(true);

    targetEl.dispatchEvent(new Event("keydown"));
    expect(isIdleRef.value).toBe(false);
  });

  it("should respond to all configured interaction events", () => {
    const trackedEvents = [
      "mousemove",
      "mousedown",
      "resize",
      "keydown",
      "touchstart",
      "wheel",
    ] as const;

    const { wrapper, isIdleRef } = createTestComponent();
    const targetEl = wrapper.find("#target").element;

    trackedEvents.forEach(eventName => {
      targetEl.dispatchEvent(new Event(eventName));
      vi.advanceTimersByTime(5000);
      expect(isIdleRef.value).toBe(true);

      targetEl.dispatchEvent(new Event(eventName));
      expect(isIdleRef.value).toBe(false);
    });
  });

  it("should not set isIdle to true if idleCondition evaluates to true when timer expires", () => {
    const idleCondition = ref(false);
    const { wrapper, isIdleRef } = createTestComponent(idleCondition);
    const targetEl = wrapper.find("#target").element;

    targetEl.dispatchEvent(new Event("mousemove"));

    idleCondition.value = true;
    vi.advanceTimersByTime(5000);

    expect(isIdleRef.value).toBe(false);
  });
});
