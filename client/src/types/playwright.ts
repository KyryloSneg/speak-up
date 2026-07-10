import type router from "@/router";
import type { useRoomStore } from "@/stores/room";
import type { useSocketStore } from "@/stores/socket";
import type socket from "@/utils/socket";

export interface PlaywrightWindow extends Window {
  __PLAYWRIGHT_TEST__: boolean;
  __MOCK_SOCKET_URL__?: string;
  __stores__: {
    socket: ReturnType<typeof useSocketStore>;
    room: ReturnType<typeof useRoomStore>;
  };
  __router__: typeof router;
  __socket__: typeof socket;
}
