import router from "@/router";
import { useMediaStore } from "@/stores/media";
import { useRoomStore } from "@/stores/room";
import { useSocketStore } from "@/stores/socket";
import type { PlaywrightWindow } from "@/types/playwright";
import socket from "@/utils/socket";

function isPlaywrightWindow(
  windowArg: Window | PlaywrightWindow,
): windowArg is PlaywrightWindow {
  return (windowArg as PlaywrightWindow).__PLAYWRIGHT_TEST__;
}

function initGlobalPlaywrightStores(): void {
  const typedWindow = window;

  if (isPlaywrightWindow(typedWindow)) {
    typedWindow.__stores__ = {
      socket: useSocketStore(),
      media: useMediaStore(),
      room: useRoomStore(),
    };

    typedWindow.__router__ = router;
    typedWindow.__socket__ = socket;
  }
}

export default initGlobalPlaywrightStores;
