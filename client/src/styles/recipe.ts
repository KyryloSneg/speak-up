import type { recipe, RecipeVariants } from "@vanilla-extract/recipes";

export type RecipeVariantsProps<T extends ReturnType<typeof recipe>> = Exclude<
  Required<RecipeVariants<T>>,
  undefined
>;
