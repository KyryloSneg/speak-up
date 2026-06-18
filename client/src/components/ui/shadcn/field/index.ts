import type { VariantProps } from "class-variance-authority";
import { cva } from "class-variance-authority";

export const fieldVariants = cva(
  "group/field flex w-full gap-3 data-[invalid=true]:text-destructive",
  {
    variants: {
      orientation: {
        vertical: ["flex-col [&>*]:w-full [&>.sr-only]:w-auto"],
        horizontal: [
          "flex-row items-center",
          "[&>[data-slot=field-label]]:flex-auto",
          "has-[>[data-slot=field-content]]:items-start has-[>[data-slot=field-content]]:[&>[role=checkbox],[role=radio]]:mt-px",
        ],
        responsive: [
          "flex-col [&>*]:w-full [&>.sr-only]:w-auto @md/field-group:flex-row @md/field-group:items-center @md/field-group:[&>*]:w-auto",
          "@md/field-group:[&>[data-slot=field-label]]:flex-auto",
          "@md/field-group:has-[>[data-slot=field-content]]:items-start @md/field-group:has-[>[data-slot=field-content]]:[&>[role=checkbox],[role=radio]]:mt-px",
        ],
      },
    },
    defaultVariants: {
      orientation: "vertical",
    },
  },
);

export type FieldVariants = VariantProps<typeof fieldVariants>;

export { default as UIField } from "./UIField.vue";
export { default as UIFieldContent } from "./UIFieldContent.vue";
export { default as UIFieldDescription } from "./UIFieldDescription.vue";
export { default as UIFieldError } from "./UIFieldError.vue";
export { default as UIFieldGroup } from "./UIFieldGroup.vue";
export { default as UIFieldLabel } from "./UIFieldLabel.vue";
export { default as UIFieldLegend } from "./UIFieldLegend.vue";
export { default as UIFieldSeparator } from "./UIFieldSeparator.vue";
export { default as UIFieldSet } from "./UIFieldSet.vue";
export { default as UIFieldTitle } from "./UIFieldTitle.vue";
