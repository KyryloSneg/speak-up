import useControllingFocus from "@/composables/useControllingFocus";
import { mount } from "@vue/test-utils";
import { useMutationObserver } from "@vueuse/core";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { defineComponent, nextTick, ref } from "vue";

vi.mock("@vueuse/core", () => ({
  useMutationObserver: vi.fn(),
}));

describe("useControllingFocus", () => {
  let capturedMutationCallback: (() => void) | undefined;

  beforeEach(() => {
    vi.clearAllMocks();
    capturedMutationCallback = undefined;

    vi.mocked(useMutationObserver).mockImplementation((_target, cb) => {
      capturedMutationCallback = cb as () => void;
      return { stop: vi.fn() } as any;
    });
  });

  afterEach(() => {
    document.body.innerHTML = "";
  });

  function createTestComponent(initialDisabled = false) {
    const disabled = ref(initialDisabled);

    const Component = defineComponent({
      setup() {
        const containerRef = ref<HTMLElement | null>(null);
        useControllingFocus(disabled, containerRef);

        return { containerRef };
      },
      template: `
        <div ref="containerRef">
          <button id="btn-no-tabindex">Button 1</button>
          <button id="btn-with-tabindex" tabindex="0">Button 2</button>
          <a id="link-custom-tabindex" href="#" tabindex="2">Link</a>
        </div>
      `,
    });

    const wrapper = mount(Component, { attachTo: document.body });
    return { wrapper, disabled };
  }

  it("should initialize useMutationObserver with childList and subtree options", () => {
    createTestComponent();

    expect(useMutationObserver).toHaveBeenCalledOnce();
    expect(useMutationObserver).toHaveBeenCalledWith(
      expect.anything(),
      expect.any(Function),
      {
        childList: true,
        subtree: true,
      },
    );
  });

  it("should update descendant tabindex and store original attributes when disabled turns true", async () => {
    const { wrapper, disabled } = createTestComponent(false);

    disabled.value = true;
    await nextTick();

    const btn1 = wrapper.find("#btn-no-tabindex").element;
    const btn2 = wrapper.find("#btn-with-tabindex").element;
    const link = wrapper.find("#link-custom-tabindex").element;

    expect(btn1.getAttribute("data-orig-tabindex")).toBe("none");
    expect(btn2.getAttribute("data-orig-tabindex")).toBe("0");
    expect(link.getAttribute("data-orig-tabindex")).toBe("2");

    expect(btn1.getAttribute("tabindex")).toBe("-1");
    expect(btn2.getAttribute("tabindex")).toBe("-1");
    expect(link.getAttribute("tabindex")).toBe("-1");
  });

  it("should restore original tabindex attributes when disabled turns back to false", async () => {
    const { wrapper, disabled } = createTestComponent(true);

    disabled.value = false;
    await nextTick();

    const btn1 = wrapper.find("#btn-no-tabindex").element;
    const btn2 = wrapper.find("#btn-with-tabindex").element;
    const link = wrapper.find("#link-custom-tabindex").element;

    expect(btn1.hasAttribute("tabindex")).toBe(false);
    expect(btn2.getAttribute("tabindex")).toBe("0");
    expect(link.getAttribute("tabindex")).toBe("2");

    expect(btn1.hasAttribute("data-orig-tabindex")).toBe(false);
    expect(btn2.hasAttribute("data-orig-tabindex")).toBe(false);
    expect(link.hasAttribute("data-orig-tabindex")).toBe(false);
  });

  it("should preserve existing data-orig-tabindex without overwriting it on repeated disable passes", async () => {
    const { wrapper, disabled } = createTestComponent(false);

    disabled.value = true;
    await nextTick();

    const btn2 = wrapper.find("#btn-with-tabindex").element;
    expect(btn2.getAttribute("data-orig-tabindex")).toBe("0");

    expect(capturedMutationCallback).toBeDefined();
    capturedMutationCallback!();

    expect(btn2.getAttribute("data-orig-tabindex")).toBe("0");
    expect(btn2.getAttribute("tabindex")).toBe("-1");
  });

  it("should update new elements on mutation observer callback based on current disabled state", async () => {
    const { wrapper } = createTestComponent(true);
    await nextTick();

    const container = wrapper.find({ ref: "containerRef" }).element;
    const newBtn = document.createElement("button");

    newBtn.id = "dynamic-btn";
    container.appendChild(newBtn);

    capturedMutationCallback!();

    expect(newBtn.getAttribute("data-orig-tabindex")).toBe("none");
    expect(newBtn.getAttribute("tabindex")).toBe("-1");
  });

  it("should safely handle unmounted or null elemRef without throwing errors", () => {
    const disabled = ref(true);

    const Component = defineComponent({
      setup() {
        const emptyRef = ref<HTMLElement | null>(null);
        useControllingFocus(disabled, emptyRef);
        return {};
      },
      template: "<div></div>",
    });

    expect(() => mount(Component)).not.toThrow();
  });
});
