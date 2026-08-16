import useIsPopupOpened from "@/composables/useIsPopupOpened";
import { useMutationObserver } from "@vueuse/core";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { ref } from "vue";

vi.mock("@vueuse/core", () => ({
  useMutationObserver: vi.fn(),
}));

describe("useIsPopupOpened", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("should initialize isPopupOpened as false and pass options to useMutationObserver", () => {
    const elemRef = ref(document.createElement("div"));
    const isPopupOpened = useIsPopupOpened(elemRef);

    expect(isPopupOpened.value).toBe(false);
    expect(useMutationObserver).toHaveBeenCalledOnce();
    expect(useMutationObserver).toHaveBeenCalledWith(
      elemRef,
      expect.any(Function),
      {
        attributes: true,
        attributeFilter: ["aria-expanded"],
        subtree: true,
      },
    );
  });

  it("should update isPopupOpened to true when aria-expanded attribute becomes 'true'", () => {
    let mutationCb: (mutations: Partial<MutationRecord>[]) => void = () => {};

    vi.mocked(useMutationObserver).mockImplementation((_, cb) => {
      mutationCb = cb as any;
      return { stop: vi.fn() } as any;
    });

    const targetEl = document.createElement("button");
    targetEl.setAttribute("aria-expanded", "true");

    const isPopupOpened = useIsPopupOpened(targetEl);

    mutationCb([
      {
        type: "attributes",
        attributeName: "aria-expanded",
        target: targetEl,
      },
    ]);

    expect(isPopupOpened.value).toBe(true);
  });

  it("should update isPopupOpened to false when aria-expanded attribute becomes 'false'", () => {
    let mutationCb: (mutations: Partial<MutationRecord>[]) => void = () => {};

    vi.mocked(useMutationObserver).mockImplementation((_, cb) => {
      mutationCb = cb as any;
      return { stop: vi.fn() } as any;
    });

    const targetEl = document.createElement("button");
    targetEl.setAttribute("aria-expanded", "false");

    const isPopupOpened = useIsPopupOpened(targetEl);

    mutationCb([
      {
        type: "attributes",
        attributeName: "aria-expanded",
        target: targetEl,
      },
    ]);

    expect(isPopupOpened.value).toBe(false);
  });

  it("should execute changedCb with state when mutation occurs", () => {
    let mutationCb: (mutations: Partial<MutationRecord>[]) => void = () => {};

    vi.mocked(useMutationObserver).mockImplementation((_, cb) => {
      mutationCb = cb as any;
      return { stop: vi.fn() } as any;
    });

    const targetEl = document.createElement("button");
    targetEl.setAttribute("aria-expanded", "true");
    const changedCb = vi.fn();

    useIsPopupOpened(targetEl, changedCb);

    mutationCb([
      {
        type: "attributes",
        attributeName: "aria-expanded",
        target: targetEl,
      },
    ]);

    expect(changedCb).toHaveBeenCalledExactlyOnceWith(true);
  });

  it("should handle changedCb when passed as a ref", () => {
    let mutationCb: (mutations: Partial<MutationRecord>[]) => void = () => {};

    vi.mocked(useMutationObserver).mockImplementation((_, cb) => {
      mutationCb = cb as any;
      return { stop: vi.fn() } as any;
    });

    const targetEl = document.createElement("button");
    targetEl.setAttribute("aria-expanded", "true");
    const changedCbFn = vi.fn();
    const changedCbRef = ref(changedCbFn);

    useIsPopupOpened(targetEl, changedCbRef);

    mutationCb([
      {
        type: "attributes",
        attributeName: "aria-expanded",
        target: targetEl,
      },
    ]);

    expect(changedCbFn).toHaveBeenCalledExactlyOnceWith(true);
  });

  it("should ignore mutations that are not attribute mutations for aria-expanded", () => {
    let mutationCb: (mutations: Partial<MutationRecord>[]) => void = () => {};

    vi.mocked(useMutationObserver).mockImplementation((_, cb) => {
      mutationCb = cb as any;
      return { stop: vi.fn() } as any;
    });

    const targetEl = document.createElement("button");
    targetEl.setAttribute("aria-expanded", "true");
    const changedCb = vi.fn();

    const isPopupOpened = useIsPopupOpened(targetEl, changedCb);

    mutationCb([
      {
        type: "childList",
        attributeName: null,
        target: targetEl,
      },
      {
        type: "attributes",
        attributeName: "class",
        target: targetEl,
      },
    ]);

    expect(isPopupOpened.value).toBe(false);
    expect(changedCb).not.toHaveBeenCalled();
  });
});
