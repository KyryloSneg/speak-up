import useModifierKey from "@/composables/useModifierKey";
import { mount } from "@vue/test-utils";
import { afterEach, describe, expect, it } from "vitest";
import { defineComponent } from "vue";

describe("useModifierKey", () => {
  const originalNavigator = globalThis.navigator;

  function mockNavigator(customProps: Partial<Record<string, any>>) {
    Object.defineProperty(globalThis, "navigator", {
      value: {
        ...originalNavigator,
        ...customProps,
      },
      configurable: true,
      writable: true,
    });
  }

  function mountTestComponent() {
    let result: ReturnType<typeof useModifierKey>;

    const Component = defineComponent({
      setup() {
        result = useModifierKey();
        return {};
      },
      template: "<div></div>",
    });

    mount(Component);
    return result!;
  }

  afterEach(() => {
    Object.defineProperty(globalThis, "navigator", {
      value: originalNavigator,
      configurable: true,
      writable: true,
    });
  });

  it("should detect Windows as a non-Apple platform and set Ctrl modifiers", () => {
    mockNavigator({
      platform: "Win32",
      userAgent: "Mozilla/5.0 (Windows NT 10.0; Win64; x64)",
      maxTouchPoints: 0,
      userAgentData: undefined,
    });

    const { isApple, modifierSymbol, modifierName } = mountTestComponent();

    expect(isApple.value).toBe(false);
    expect(modifierSymbol.value).toBe("Ctrl");
    expect(modifierName.value).toBe("Control");
  });

  it("should detect macOS via platform string and set Command modifiers", () => {
    mockNavigator({
      platform: "MacIntel",
      userAgent: "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7)",
      maxTouchPoints: 0,
      userAgentData: undefined,
    });

    const { isApple, modifierSymbol, modifierName } = mountTestComponent();

    expect(isApple.value).toBe(true);
    expect(modifierSymbol.value).toBe("⌘");
    expect(modifierName.value).toBe("Meta");
  });

  it("should detect iOS mobile devices (iPhone/iPad) via platform and userAgent", () => {
    mockNavigator({
      platform: "iPhone",
      userAgent: "Mozilla/5.0 (iPhone; CPU iPhone OS 16_0 like Mac OS X)",
      maxTouchPoints: 5,
      userAgentData: undefined,
    });

    const { isApple, modifierSymbol, modifierName } = mountTestComponent();

    expect(isApple.value).toBe(true);
    expect(modifierSymbol.value).toBe("⌘");
    expect(modifierName.value).toBe("Meta");
  });

  it("should detect iPadOS in desktop-class mode via MacIntel platform and maxTouchPoints > 0", () => {
    mockNavigator({
      platform: "MacIntel",
      userAgent: "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7)",
      maxTouchPoints: 5,
      userAgentData: undefined,
    });

    const { isApple, modifierSymbol } = mountTestComponent();

    expect(isApple.value).toBe(true);
    expect(modifierSymbol.value).toBe("⌘");
  });

  it("should evaluate userAgentData platform when Client Hints API is available", () => {
    mockNavigator({
      userAgentData: {
        platform: "macOS",
      },
    });

    const { isApple } = mountTestComponent();
    expect(isApple.value).toBe(false);
  });
});
