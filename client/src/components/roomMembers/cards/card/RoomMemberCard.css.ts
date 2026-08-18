import getRegularShadow from "@/components/roomMembers/cards/card/utils/getRegularShadow";
import { globalThemeContract } from "@/styles/theme.css";
import formatCommaSeparatedCss from "@/utils/formatCommaSeparatedCss";
import getTwBoxShadow from "@/utils/getTwBoxShadow";
import {
  DEFAULT_ASPECT_RATIO_H,
  DEFAULT_ASPECT_RATIO_W,
} from "@/utils/mediaConsts";
import { roomViewOverflowClass } from "@/views/RoomView.css";
import {
  createVar,
  fallbackVar,
  globalStyle,
  style,
} from "@vanilla-extract/css";
import { recipe } from "@vanilla-extract/recipes";

export const screenSharingTransitionName = "fade-screen-sharing";
export const overlayTransitionName = "fade-overlay";

export const colorBgColor = createVar();
export const pictureContrastColor = createVar();

const regularShadow = createVar();
const speakingShadowOpacity = createVar();

const distanceToBorders = createVar();
const borderRadius = "1rem";

const baseRegularShadowColor = createVar();
const regularShadowColor = createVar();

const regularShadowValue = getRegularShadow(regularShadowColor);
const containerName = "room-member-card";

const sectionOutline =
  "focus-visible:ring-3 focus-visible:ring-ring focus-visible:ring-offset-4 focus-visible:ring-offset-background focus-within:ring-3 focus-within:ring-ring focus-within:ring-offset-4 focus-within:ring-offset-background";

const sizeTransitionDuration = createVar();

export const section = recipe({
  base: [
    roomViewOverflowClass,
    sectionOutline,
    {
      position: "relative",
      display: "flex",
      width: "100%",
      height: "auto",
      minWidth: 0,
      minHeight: 0,
      maxWidth: "100%",
      maxHeight: "100%",
      aspectRatio: `${DEFAULT_ASPECT_RATIO_W} / ${DEFAULT_ASPECT_RATIO_H}`,
      borderRadius,
      boxShadow: getTwBoxShadow(fallbackVar(regularShadow, "0 0 transparent")),
      outline: "none",
      containerName,
      containerType: "inline-size",
      transition: "box-shadow var(--default-transition-duration) ease-in-out",
      vars: {
        [distanceToBorders]: "0.5rem",
        [regularShadowColor]: `color-mix(in srgb, ${baseRegularShadowColor} 50%, transparent)`,
        [speakingShadowOpacity]: "0",
        [sizeTransitionDuration]: "150ms",
      },
      selectors: {
        "&::before": {
          content: '""',
          position: "absolute",
          inset: 0,
          borderRadius: "inherit",
          pointerEvents: "none",
          zIndex: 1,
          boxShadow: getTwBoxShadow(
            `inset 0 0 0 4px ${globalThemeContract.outline.activeSpeaker}`,
          ),
          opacity: speakingShadowOpacity,
          transition: "opacity var(--default-transition-duration) ease-in-out",
        },
      },
      "@container": {
        "(min-width: 18rem)": {
          vars: {
            [distanceToBorders]: "1rem",
          },
        },
      },
      "@media": {
        "(prefers-reduced-motion: reduce)": {
          vars: {
            [sizeTransitionDuration]: "0ms",
          },
        },
      },
    },
  ],

  variants: {
    camera: {
      false: {
        vars: { [baseRegularShadowColor]: colorBgColor },
      },
      true: {
        vars: {
          [baseRegularShadowColor]:
            globalThemeContract.backgroundColor.videoGrid,
        },
      },
    },
    shadow: {
      false: {},
      true: {
        vars: {
          [regularShadow]: regularShadowValue,
        },
      },
    },
    speaking: {
      false: {},
      true: {
        vars: {
          [speakingShadowOpacity]: "1",
        },
      },
    },
    fullscreen: {
      false: {},
      true: {
        alignSelf: "center",
        justifySelf: "center",
      },
    },
    type: {
      user: {},
      screenSharing: {},
    },
  },
  compoundVariants: [
    {
      variants: { fullscreen: true, type: "screenSharing" },
      style: {
        aspectRatio: "auto",
        height: "100%",
        borderRadius: "0px !important",
      },
    },
  ],
  defaultVariants: {
    camera: false,
    shadow: false,
    speaking: false,
    fullscreen: false,
    type: "user",
  },
});

export const mediaBg = style({});

globalStyle(
  `.${section.classNames.variants.type.screenSharing}.${section.classNames.variants.fullscreen.true} .${mediaBg}`,
  {
    backgroundColor: globalThemeContract.backgroundColor.primary,
  },
);

globalStyle(
  formatCommaSeparatedCss(`
    .${section.classNames.variants.type.screenSharing}.${section.classNames.variants.fullscreen.true} *:has(video),
    .${section.classNames.variants.type.screenSharing}.${section.classNames.variants.fullscreen.true} video
  `),
  {
    borderRadius: "0px !important",
  },
);

// create size-related transitions even though it's not too optimized
const sizeTransitionConfig = `${sizeTransitionDuration} var(--transition-timing-function-fast-out-slow-in)`;

const noMicPadding = createVar();
const micIconSize = createVar();

export const noMic = style({
  position: "absolute",
  top: distanceToBorders,
  right: distanceToBorders,
  padding: noMicPadding,
  borderRadius: "calc(var(--radius) * 0.5)",
  backgroundColor: globalThemeContract.backgroundColor.danger,
  transition: formatCommaSeparatedCss(`
    top ${sizeTransitionConfig},
    right ${sizeTransitionConfig},
    padding ${sizeTransitionConfig}
  `),
  zIndex: 1,
  vars: {
    [noMicPadding]: "0.25rem",
    [micIconSize]: "1rem",
  },
  "@container": {
    "(min-width: 12.5rem)": {
      vars: {
        [noMicPadding]: "0.375rem",
        [micIconSize]: "1.25rem",
      },
    },
    "(min-width: 16rem)": {
      vars: {
        [noMicPadding]: "0.5rem",
        [micIconSize]: "1.5rem",
      },
    },
    "(min-width: 31.25rem)": {
      vars: {
        [noMicPadding]: "0.625rem",
        [micIconSize]: "1.75rem",
      },
    },
  },
});

export const noMicIcon = style({
  width: micIconSize,
  height: micIconSize,
  color: globalThemeContract.color.onDanger,
  transition: formatCommaSeparatedCss(`
    width ${sizeTransitionConfig},
    height ${sizeTransitionConfig}
  `),
});

export const sharingScreen = style({
  position: "absolute",
  top: distanceToBorders,
  left: distanceToBorders,
  padding: "0.25rem",
  borderRadius: "calc(var(--radius) * 0.5)",
  backgroundColor: globalThemeContract.backgroundColor.accent,
  zIndex: 1,
});

const sharingScreenIconSize = "1rem";
export const sharingScreenIcon = style({
  width: sharingScreenIconSize,
  height: sharingScreenIconSize,
  color: globalThemeContract.color.onAccent,
});

export const picture = style({
  position: "absolute",
  top: "50%",
  left: "50%",
  transform: "translate(-50%, -50%)",
  width: "21%",
  minWidth: "2.5rem",
  maxWidth: "7rem",
  borderRadius: "50%",
  aspectRatio: "1",
  boxShadow: `0 0 6px 3px color-mix(in srgb, ${pictureContrastColor} 15%, transparent)`,
});

export const colorBg = style({
  position: "absolute",
  inset: 0,
  // default bg to override
  backgroundColor: [
    globalThemeContract.backgroundColor.videoGrid,
    colorBgColor,
  ],
  zIndex: -1,
  borderRadius,
});

const nicknameFontSize = createVar();
const nicknamePadding = createVar();

export const nickname = recipe({
  base: {
    position: "absolute",
    fontSize: nicknameFontSize,
    color: [globalThemeContract.color.secondary, pictureContrastColor],
    width: "max-content",
    height: "max-content",
    padding: nicknamePadding,
    insetInline: distanceToBorders,
    bottom: distanceToBorders,
    borderWidth: 1,
    borderColor: "transparent",
    borderRadius: "calc(var(--radius) * 0.5)",
    pointerEvents: "none",
    transition: formatCommaSeparatedCss(`
      opacity var(--default-transition-duration) ease-in-out,
      inset-inline ${sizeTransitionConfig},
      bottom ${sizeTransitionConfig},
      font-size ${sizeTransitionConfig},
      padding ${sizeTransitionConfig}
    `),
    zIndex: 1,
    vars: {
      [nicknameFontSize]: "0.875rem",
      [nicknamePadding]: "0.125rem 0.25rem",
    },
    "@container": {
      "(min-width: 15rem)": {
        vars: {
          [nicknameFontSize]: "1rem",
          [nicknamePadding]: "0.25rem 0.4375rem",
        },
      },
      "(min-width: 22rem)": {
        vars: {
          [nicknameFontSize]: "1.25rem",
          [nicknamePadding]: "0.5rem 0.625rem",
        },
      },
    },
  },
  variants: {
    visible: {
      false: { opacity: 0 },
      true: { opacity: 1 },
    },
    bg: {
      false: { boxShadow: "none" },
      true: {
        color: globalThemeContract.color.secondary,
        backgroundColor: globalThemeContract.backgroundColor.secondary,
        borderColor: globalThemeContract.border.subtle,
      },
    },
  },
  defaultVariants: { visible: true, bg: false },
});

globalStyle(`${section.classNames.base} video`, {
  borderRadius,
});

const fadeTransitionConfig = "var(--default-transition-duration) ease";

[overlayTransitionName, screenSharingTransitionName].forEach(name => {
  globalStyle(`.${name}-enter-active, .${name}-leave-active`, {
    transition: `opacity ${fadeTransitionConfig}`,
  });

  globalStyle(`.${name}-enter-from, .${name}-leave-to`, {
    opacity: 0,
  });

  globalStyle(`.${name}-enter-to, .${name}-leave-from`, {
    opacity: 1,
  });
});
