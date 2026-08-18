interface HotkeyData {
  label: string;
  hotkey: string;
}

export const hotkeysData: HotkeyData[] = [
  {
    label: "Toggle microphone",
    hotkey: "Ctrl + D",
  },
  {
    label: "Toggle camera",
    hotkey: "Ctrl + E",
  },
  {
    label: "Copy room id",
    hotkey: "Ctrl + Y",
  },
  {
    label: "Start or stop sharing screen",
    hotkey: "Ctrl + Alt + T",
  },
  {
    label: "Show or hide chat",
    hotkey: "Ctrl + Alt + C",
  },
  {
    label: "Show or hide member list",
    hotkey: "Ctrl + Alt + P",
  },
  {
    label: "Open or close settings",
    hotkey: "Ctrl + Shift + ,",
  },
] as const;
