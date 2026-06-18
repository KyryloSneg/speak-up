import {
  createGlobalTheme,
  createThemeContract,
  globalStyle,
} from "@vanilla-extract/css";

export const globalThemeContract = createThemeContract({
  color: {
    primary: "",
    secondary: "",
    tertiary: "",
    muted: "",
    accent: "",
    danger: "",
    onAccent: "",
    onDanger: "",
  },
  backgroundColor: {
    primary: "",
    secondary: "",
    tertiary: "",
    muted: "",
    accent: "",
    accentSubtle: "",
    danger: "",
    dangerSubtle: "",
    videoGrid: "",
  },
  border: {
    subtle: "",
    element: "",
  },
  outline: {
    focus: "",
    activeSpeaker: "",
    subtle: "",
  },
});

createGlobalTheme(':root, :root[data-theme="light"]', globalThemeContract, {
  color: {
    primary: "#1f2937",
    secondary: "#4b5563",
    tertiary: "#9ca3af",
    muted: "#d1d5db",
    accent: "#1a73e8",
    danger: "#d93025",
    onAccent: "#ffffff",
    onDanger: "#ffffff",
  },
  backgroundColor: {
    primary: "#ffffff",
    secondary: "#f8f9fa",
    tertiary: "#f1f3f4",
    muted: "#e8eaed",
    accent: "#1a73e8",
    accentSubtle: "#e8f0fe",
    danger: "#d93025",
    dangerSubtle: "#fce8e6",
    videoGrid: "#202124",
  },
  border: {
    subtle: "#f1f3f4",
    element: "#dadce0",
  },
  outline: {
    focus: "#1a73e8",
    activeSpeaker: "#1e8e3e",
    subtle: "#dadce0",
  },
});

createGlobalTheme(':root[data-theme="dark"]', globalThemeContract, {
  color: {
    primary: "#ffffff",
    secondary: "#e8eaed",
    tertiary: "#9aa0a6",
    muted: "#5f6368",
    accent: "#8ab4f8",
    danger: "#f28b82",
    onAccent: "#1f2937",
    onDanger: "#ffffff",
  },
  backgroundColor: {
    primary: "#202124",
    secondary: "#2d2e30",
    tertiary: "#3c4043",
    muted: "#4a4d51",
    accent: "#8ab4f8",
    accentSubtle: "#304972",
    danger: "#ea4335",
    dangerSubtle: "#5c2522",
    videoGrid: "#111214",
  },
  border: {
    subtle: "#3c4043",
    element: "#5f6368",
  },
  outline: {
    focus: "#8ab4f8",
    activeSpeaker: "#81c995",
    subtle: "#5f6368",
  },
});

// theme transition
globalStyle("::view-transition-old(root), ::view-transition-new(root)", {
  animationDuration: "0.25s",
  animationTimingFunction: "cubic-bezier(0.4, 0, 0.2, 1)",
});
