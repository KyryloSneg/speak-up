import useAreNewMessagesIndicator from "@/composables/useAreNewMessagesIndicator";
import useChatAutoScroll from "@/composables/useChatAutoScroll";
import useChatIsScrollDownButton from "@/composables/useChatIsScrollDownButton";
import useHandlingNewChatMessages from "@/composables/useHandlingNewChatMessages";
import { useChatStore } from "@/stores/chat";
import { mount } from "@vue/test-utils";
import { createPinia, setActivePinia } from "pinia";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { defineComponent, nextTick, ref, type Ref } from "vue";

vi.mock("@/composables/useAreNewMessagesIndicator", () => ({
  default: vi.fn(),
}));

vi.mock("@/composables/useChatIsScrollDownButton", () => ({
  default: vi.fn(),
}));

vi.mock("@/composables/useChatAutoScroll", () => ({ default: vi.fn() }));

describe("useHandlingNewChatMessages", () => {
  beforeEach(() => {
    setActivePinia(createPinia());
    vi.clearAllMocks();
  });

  it("should initialize all child indicator and auto-scroll composables", () => {
    const TestComponent = defineComponent({
      setup() {
        useHandlingNewChatMessages("scrollRef");
        return {};
      },
      template: "<div></div>",
    });

    mount(TestComponent);

    expect(useAreNewMessagesIndicator).toHaveBeenCalledOnce();
    expect(useChatIsScrollDownButton).toHaveBeenCalledOnce();
    expect(useChatAutoScroll).toHaveBeenCalledOnce();
  });

  it("should update chatStore.scrollTemplateRef when template ref changes", async () => {
    const chatStore = useChatStore();
    const showFirst = ref(true);

    const MockScrollArea = defineComponent({
      props: {
        elementId: { type: String, required: true },
      },
      setup(props, { expose }) {
        const viewportRef = ref<HTMLElement | null>(null);
        expose({ viewport: viewportRef });
        return { viewportRef };
      },
      template: '<div ref="viewportRef" :id="elementId"></div>',
    });

    const TestComponent = defineComponent({
      components: { MockScrollArea },
      setup() {
        const scrollRef = useHandlingNewChatMessages("scrollArea");
        return { scrollRef, showFirst };
      },
      template: `
      <MockScrollArea v-if="showFirst" ref="scrollArea" elementId="first-el" />
      <MockScrollArea v-else ref="scrollArea" elementId="second-el" />
    `,
    });

    mount(TestComponent);
    await nextTick();

    expect(chatStore.scrollTemplateRef?.viewport?.id).toBe("first-el");

    showFirst.value = false;
    await nextTick();

    expect(chatStore.scrollTemplateRef?.viewport?.id).toBe("second-el");
  });

  it("should return the scroll template ref", () => {
    let returnedRef: Ref | undefined;

    const TestComponent = defineComponent({
      setup() {
        returnedRef = useHandlingNewChatMessages("scrollArea");
        return {};
      },
      template: "<div></div>",
    });

    mount(TestComponent);

    expect(returnedRef).toBeDefined();
    expect(returnedRef?.value).toBeDefined();
  });
});
