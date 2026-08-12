import type { IOSocket } from "#types/socket.ts";
import pushIncomingMessages from "#utils/pushIncomingMessages.ts";
import removeIncomingMessages from "#utils/removeIncomingMessages.ts";
import type { RoomToIncomingMessages } from "#utils/roomToIncomingMessages.ts";
import roomToIncomingMessages from "#utils/roomToIncomingMessages.ts";
import type { MapValue } from "@speak-up/shared";
import { describe, expect, it } from "vitest";

describe("removeIncomingMessages", () => {
  it("should properly remove incoming messages", () => {
    const roomId = "roomId";
    const otherRoomId = "otherRoomId";

    const socket = {} as IOSocket<true>;
    const messageBatch: MapValue<RoomToIncomingMessages> = [
      {
        tempId: "firstTempId",
        content: [{ type: "text", value: "first" }],
        socket,
      },
      {
        tempId: "secTempId",
        content: [{ type: "text", value: "sec" }],
        socket,
      },
      {
        tempId: "thirdTempId",
        content: [{ type: "text", value: "third" }],
        socket,
      },
    ] as const;

    const otherMessageBatch: MapValue<RoomToIncomingMessages> = [
      {
        tempId: "otherTempId",
        content: [{ type: "text", value: "other" }],
        socket,
      },
    ] as const;

    pushIncomingMessages(roomId, messageBatch);
    pushIncomingMessages(otherRoomId, otherMessageBatch);

    // verify that it doesn't trigger any error
    removeIncomingMessages("unexistingRoomId", otherMessageBatch);
    expect(roomToIncomingMessages.size).toBe(2);

    expect(roomToIncomingMessages.get(roomId)).toStrictEqual(messageBatch);
    expect(roomToIncomingMessages.get(otherRoomId)).toStrictEqual(
      otherMessageBatch,
    );

    removeIncomingMessages(roomId, messageBatch.slice(1));

    expect(roomToIncomingMessages.get(roomId)).toStrictEqual([messageBatch[0]]);
    expect(roomToIncomingMessages.get(otherRoomId)).toStrictEqual(
      otherMessageBatch,
    );

    removeIncomingMessages(otherRoomId, otherMessageBatch);

    expect(roomToIncomingMessages.get(roomId)).toStrictEqual([messageBatch[0]]);
    expect(roomToIncomingMessages.get(otherRoomId)?.length).toBe(0);
  });
});
