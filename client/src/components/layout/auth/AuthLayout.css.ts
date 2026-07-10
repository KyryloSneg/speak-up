import * as styles from "@/components/formCard/FormCard.css";
import { style } from "@vanilla-extract/css";

const breakpoint = "screen and (max-width: 26.25rem)";

export const header = style({
  "@media": {
    [breakpoint]: styles.mobileHeaderStyles,
  },
});

export const title = style({
  "@media": {
    [breakpoint]: styles.mobileTitleStyles,
  },
});

export const action = style({
  "@media": {
    [breakpoint]: styles.mobileActionStyles,
  },
});
