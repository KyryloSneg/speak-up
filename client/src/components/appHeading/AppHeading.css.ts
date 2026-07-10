import type { RecipeVariantsProps } from "@/styles/recipe";
import { recipe } from "@vanilla-extract/recipes";

export const heading = recipe({
  base: {
    display: "inline-flex",
    alignItems: "center",
  },
  variants: {
    size: {
      md: {
        fontSize: "1.875rem",
        gap: "0.375rem",
      },
      lg: {
        fontSize: "3rem",
        gap: "1rem",
      },
    },
  },
});

export const icon = recipe({
  base: {
    width: "auto",
  },
  variants: {
    size: {
      md: {
        height: "2rem",
        transform: "translateY(0.25rem)",
      },
      lg: {
        height: "3.5625rem",
        transform: "translateY(0.1875rem)",
      },
    },
  },
});

export type HeadingVariants = RecipeVariantsProps<typeof heading>;
