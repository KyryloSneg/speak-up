import type { VariantProps } from "class-variance-authority";
import { cva } from "class-variance-authority";

export { default as UIButton } from "./UIButton.vue";
export type { Props as UIButtonProps } from "./UIButton.vue";

export const buttonVariants = cva(
  "inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-md font-medium transition-all disabled:pointer-events-none disabled:opacity-40 [&_svg]:pointer-events-none shrink-0 [&_svg]:shrink-0 outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background",
  {
    variants: {
      variant: {
        default:
          "bg-primary text-primary-foreground hover:bg-primary/90 shadow-xs",
        destructive:
          "bg-destructive text-destructive-foreground hover:bg-destructive/90 shadow-xs",
        outline:
          "border border-input bg-transparent text-foreground hover:bg-muted hover:text-foreground",
        secondary:
          "bg-secondary text-secondary-foreground hover:bg-secondary/80 border border-border/60",
        ghost: "text-foreground hover:bg-accent hover:text-accent-foreground",
        ghostDestructive:
          "text-foreground hover:bg-destructive hover:text-destructive-foreground",
        link: "text-primary underline-offset-4 hover:underline",
      },
      size: {
        default:
          "h-9 px-4 py-2 has-[>svg]:px-3 [&_svg:not([class*='size-'])]:size-5",
        xs: "h-7 rounded-md gap-1 px-2.5 has-[>svg]:px-2 [&_svg:not([class*='size-'])]:size-3.5",
        sm: "h-8 rounded-md gap-1.5 px-3 has-[>svg]:px-2.5 [&_svg:not([class*='size-'])]:size-4",
        lg: "h-10 rounded-md px-6 has-[>svg]:px-4 [&_svg:not([class*='size-'])]:size-6",
        icon: "size-9 has-[>svg]:p-0 [&_svg:not([class*='size-'])]:size-5",
        "icon-xs":
          "size-7 has-[>svg]:p-0 [&_svg:not([class*='size-'])]:size-3.5",
        "icon-sm": "size-8 has-[>svg]:p-0 [&_svg:not([class*='size-'])]:size-4",
        "icon-lg":
          "size-10 has-[>svg]:p-0 [&_svg:not([class*='size-'])]:size-6",
        "icon-xl":
          "size-12 has-[>svg]:p-0 [&_svg:not([class*='size-'])]:size-7",
      },
    },
    defaultVariants: {
      variant: "default",
      size: "default",
    },
  },
);

export type ButtonVariants = VariantProps<typeof buttonVariants>;
