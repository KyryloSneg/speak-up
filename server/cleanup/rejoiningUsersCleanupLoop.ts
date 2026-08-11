import type { IO } from "#types/socket.ts";
import emitRoomEvent from "#utils/emitRoomEvent.ts";
import rejoiningUserToRoomId from "#utils/rejoiningUserToRoomId.ts";
import { SocketEvents } from "@speak-up/shared";

let intervalId: NodeJS.Timeout | null = null;

const FAILED_TO_REJOIN_MS = 20000;
const INTERVAL_MS = 15000;

function rejoiningUsersCleanupLoop(io: IO): NodeJS.Timeout | null {
  if (intervalId) clearInterval(intervalId);
  intervalId = setInterval(async () => {
    for (const [userId, { id, createdAt }] of rejoiningUserToRoomId.entries()) {
      const now = new Date();
      const createdAtTime = new Date(createdAt).getTime();

      if (createdAtTime + FAILED_TO_REJOIN_MS < now.getTime()) {
        rejoiningUserToRoomId.delete(userId);

        // make sure nobody sees this user atp
        emitRoomEvent(io, id, SocketEvents.USER_LEFT, [{ userId: userId }]);
      }
    }
  }, INTERVAL_MS).unref();

  return intervalId;
}

export default rejoiningUsersCleanupLoop;
