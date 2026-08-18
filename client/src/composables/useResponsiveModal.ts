import {
  UIDialog,
  UIDialogClose,
  UIDialogContent,
  UIDialogDescription,
  UIDialogFooter,
  UIDialogHeader,
  UIDialogScrollContent,
  UIDialogTitle,
  UIDialogTrigger,
} from "@/components/ui/shadcn/dialog";
import {
  UIDrawer,
  UIDrawerClose,
  UIDrawerContent,
  UIDrawerDescription,
  UIDrawerFooter,
  UIDrawerHeader,
  UIDrawerScrollContent,
  UIDrawerTitle,
  UIDrawerTrigger,
} from "@/components/ui/shadcn/drawer";
import { responsiveModalBreakpoint } from "@/utils/breakpointConsts";
import { useMediaQuery } from "@vueuse/core";
import { computed } from "vue";

function useResponsiveModal(breakpoint: string = responsiveModalBreakpoint) {
  const isDesktop = useMediaQuery(`(min-width: ${breakpoint})`);
  const ResponsiveModal = computed(() => ({
    Root: isDesktop.value ? UIDialog : UIDrawer,
    Trigger: isDesktop.value ? UIDialogTrigger : UIDrawerTrigger,
    Content: isDesktop.value ? UIDialogContent : UIDrawerContent,
    ScrollContent: isDesktop.value
      ? UIDialogScrollContent
      : UIDrawerScrollContent,
    Header: isDesktop.value ? UIDialogHeader : UIDrawerHeader,
    Title: isDesktop.value ? UIDialogTitle : UIDrawerTitle,
    Description: isDesktop.value ? UIDialogDescription : UIDrawerDescription,
    Footer: isDesktop.value ? UIDialogFooter : UIDrawerFooter,
    Close: isDesktop.value ? UIDialogClose : UIDrawerClose,
  }));

  return ResponsiveModal;
}

export default useResponsiveModal;
