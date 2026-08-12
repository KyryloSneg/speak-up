import type { IOSocket } from "#types/socket.ts";
import pushIncomingMessages from "#utils/pushIncomingMessages.ts";
import type { RoomToIncomingMessages } from "#utils/roomToIncomingMessages.ts";
import roomToIncomingMessages from "#utils/roomToIncomingMessages.ts";
import type { MapValue } from "@speak-up/shared";
import { describe, expect, it } from "vitest";

describe("pushIncomingMessages", () => {
  it("should properly push new incoming messages", () => {
    const roomId = "roomId";
    const socket = {} as IOSocket<true>;

    const firstMessageBatch: MapValue<RoomToIncomingMessages> = [
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
    ] as const;

    pushIncomingMessages(roomId, firstMessageBatch);

    expect(roomToIncomingMessages.size).toBe(1);
    expect(roomToIncomingMessages.get(roomId)).toStrictEqual(firstMessageBatch);

    const secMessageBatch: MapValue<RoomToIncomingMessages> = [
      {
        tempId: "thirdTempId",
        content: [{ type: "text", value: "third" }],
        socket,
      },
    ] as const;

    pushIncomingMessages(roomId, secMessageBatch);

    expect(roomToIncomingMessages.size).toBe(1);
    expect(roomToIncomingMessages.get(roomId)).toStrictEqual([
      ...firstMessageBatch,
      ...secMessageBatch,
    ]);

    const thirdMessageBatch: MapValue<RoomToIncomingMessages> = [
      {
        tempId: "thirdTempId",
        content: [{ type: "text", value: "third" }],
        socket,
      },
    ] as const;

    const otherRoomId = "otherRoomId";
    pushIncomingMessages(otherRoomId, thirdMessageBatch);

    expect(roomToIncomingMessages.size).toBe(2);
    expect(roomToIncomingMessages.get(otherRoomId)).toStrictEqual(
      thirdMessageBatch,
    );

    expect(roomToIncomingMessages.get(roomId)).toStrictEqual([
      ...firstMessageBatch,
      ...secMessageBatch,
    ]);
  });
});
