import { LocalStorageKeys } from "@/types/localStorage";
import type { PlaywrightWindow } from "@/types/playwright";
import type {
  SocketClientToServerEvents,
  SocketServerToClientEvents,
} from "@speak-up/shared";
import { io, type Socket } from "socket.io-client";

const url =
  (window as unknown as PlaywrightWindow).__MOCK_SOCKET_URL__ ||
  import.meta.env.VITE_API_URL;

const socket: Socket<SocketServerToClientEvents, SocketClientToServerEvents> =
  io(url, {
    autoConnect: false,
    withCredentials: true,
    transports: ["websocket"],
    auth(cb) {
      const accessToken = localStorage.getItem(LocalStorageKeys.ACCESS_TOKEN);
      cb({ accessToken });
    },
  });

export default socket;
