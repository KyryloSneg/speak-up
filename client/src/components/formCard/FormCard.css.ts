import type { RecipeVariantsProps } from "@/styles/recipe";
import { appGridSpacing } from "@/utils/styleConsts";
import { createVar, style, type StyleRule } from "@vanilla-extract/css";
import { recipe } from "@vanilla-extract/recipes";

export const formCardBreakpointVar = createVar();
export const formCardMaxWidth = "28rem";

export const section = recipe({
  variants: {
    width: {
      full: { width: "100%" },
      adaptive: { width: `calc(100% - ${appGridSpacing} * 2)` },
    },
  },
  base: {
    height: "max-content",
    maxWidth: formCardMaxWidth,
    alignSelf: "center",
    justifySelf: "center",
  },
});

export const mobileHeaderStyles: StyleRule = {
  gap: "1rem",
  gridTemplateColumns: "1fr",
};

export const mobileTitleStyles: StyleRule = {
  textAlign: "center",
};

export const mobileActionStyles: StyleRule = {
  gridColumn: "auto",
  gridRow: "auto",
  justifySelf: "center",
};

export const link = style({
  whiteSpace: "normal",
});

export const submit = style({
  width: "100%",
});

export type SectionVariants = RecipeVariantsProps<typeof section>;
