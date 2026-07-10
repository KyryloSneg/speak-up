import useResponsiveModal from "@/composables/useResponsiveModal";
import { useMediaQuery } from "@vueuse/core";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { ref } from "vue";

const { DialogComponents, DrawerComponents } = await vi.hoisted(async () => {
  const [dialogImport, drawerImport] = await Promise.all([
    import("@/components/ui/shadcn/dialog"),
    import("@/components/ui/shadcn/drawer"),
  ]);

  return {
    DialogComponents: {
      Root: dialogImport.UIDialog,
      Trigger: dialogImport.UIDialogTrigger,
      Content: dialogImport.UIDialogContent,
      ScrollContent: dialogImport.UIDialogScrollContent,
      Header: dialogImport.UIDialogHeader,
      Title: dialogImport.UIDialogTitle,
      Description: dialogImport.UIDialogDescription,
      Footer: dialogImport.UIDialogFooter,
      Close: dialogImport.UIDialogClose,
    },
    DrawerComponents: {
      Root: drawerImport.UIDrawer,
      Trigger: drawerImport.UIDrawerTrigger,
      Content: drawerImport.UIDrawerContent,
      ScrollContent: drawerImport.UIDrawerScrollContent,
      Header: drawerImport.UIDrawerHeader,
      Title: drawerImport.UIDrawerTitle,
      Description: drawerImport.UIDrawerDescription,
      Footer: drawerImport.UIDrawerFooter,
      Close: drawerImport.UIDrawerClose,
    },
  };
});

const mockIsDesktop = ref(true);

vi.mock("@vueuse/core", () => ({
  useMediaQuery: vi.fn(() => mockIsDesktop),
}));

describe("useResponsiveModal", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockIsDesktop.value = true;
  });

  describe("media query", () => {
    it("should use the proper default breakpoint", () => {
      useResponsiveModal();
      expect(useMediaQuery).toHaveBeenCalledExactlyOnceWith(
        "(min-width: 40rem)",
      );
    });

    it("should properly use a custom breakpoint value", () => {
      useResponsiveModal("64rem");
      expect(useMediaQuery).toHaveBeenCalledExactlyOnceWith(
        "(min-width: 64rem)",
      );
    });
  });

  describe("responsive value", () => {
    it("should return dialog components for desktop", () => {
      mockIsDesktop.value = true;
      const responsiveModal = useResponsiveModal();

      expect(responsiveModal.value).toStrictEqual(DialogComponents);
    });

    it("should return drawer components for mobile", () => {
      mockIsDesktop.value = false;
      const responsiveModal = useResponsiveModal();

      expect(responsiveModal.value).toStrictEqual(DrawerComponents);
    });

    it("should reactively change components", () => {
      mockIsDesktop.value = true;

      const responsiveModal = useResponsiveModal();
      expect(responsiveModal.value).toStrictEqual(DialogComponents);

      mockIsDesktop.value = false;
      expect(responsiveModal.value).toStrictEqual(DrawerComponents);
    });
  });
});
