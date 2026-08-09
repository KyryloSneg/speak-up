import { globalThemeContract } from "@/styles/theme.css";
import formatCommaSeparatedCss from "@/utils/formatCommaSeparatedCss";
import { recipe } from "@vanilla-extract/recipes";

const borderRadius = "calc(var(--radius) * 2)";

export const bgWrapper = recipe({
  base: {
    position: "relative",
    width: "100%",
    height: "100%",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: globalThemeContract.backgroundColor.videoGrid,
    borderRadius,

    selectors: {
      ':root[data-theme="dark"] &': {
        boxShadow: formatCommaSeparatedCss(`
          inset 0px 20px 24px -12px rgba(0, 0, 0, 0.8),
          inset 0px 2px 10px 0px rgba(0, 0, 0, 0.6),
          var(--tw-shadow),
        `),
      },
    },
  },
  variants: {
    videoActive: {
      true: {},
      false: {},
    },
    type: {
      user: {},
      screenSharing: {},
    },
  },
  compoundVariants: [
    {
      variants: { videoActive: true, type: "user" },
      style: { background: "none" },
    },
  ],
  defaultVariants: { videoActive: false, type: "user" },
});

export const bg = recipe({
  base: {
    position: "absolute",
    width: "100%",
    height: "100%",
    borderRadius,
    imageRendering: "-webkit-optimize-contrast",
  },
  variants: {
    origin: {
      local: {},
      remote: {},
    },
    src: {
      userMedia: {
        objectFit: "cover",
      },
      screenSharing: {
        objectFit: "contain",
      },
    },
  },
  compoundVariants: [
    {
      variants: { origin: "local", src: "userMedia" },
      style: {
        transform: "scaleX(-1)",
      },
    },
  ],
  defaultVariants: { origin: "remote", src: "userMedia" },
});
