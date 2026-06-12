import getRoomSockets from "#services/getRoomSockets.ts";
import type { IO } from "#types/socket.ts";
import rooms from "#utils/rooms.ts";

let intervalId: NodeJS.Timeout | null = null;

const INTERVAL_MS = 15 * 60 * 1000;

function roomsCleanupLoop(io: IO): NodeJS.Timeout | null {
  if (intervalId) clearInterval(intervalId);
  intervalId = setInterval(async () => {
    for (const id of rooms.keys()) {
      try {
        const roomSockets = await getRoomSockets(io, id);
        if (!roomSockets.length) rooms.delete(id);
      } catch {}
    }
  }, INTERVAL_MS).unref();

  return intervalId;
}

export default roomsCleanupLoop;
