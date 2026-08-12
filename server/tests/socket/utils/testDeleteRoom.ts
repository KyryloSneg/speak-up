import type { Room } from "#types/room.ts";
import rooms from "#utils/rooms.ts";
import roomToIncomingMessages from "#utils/roomToIncomingMessages.ts";
import roomToIsProcessingMessageLoop from "#utils/roomToIsProcessingMessageLoop.ts";
import { expect } from "vitest";

export function setupDeleteRoomTest(id: Room["id"]): void {
  rooms.set(id, { id } as unknown as Room);
  roomToIncomingMessages.set(id, [{ tempId: "tempId" }] as any);
  roomToIsProcessingMessageLoop.set(id, true);
}

export function testDeleteRoom(id: Room["id"]): void {
  expect(rooms.has(id)).toBe(false);
  expect(roomToIncomingMessages.has(id)).toBe(false);
  expect(roomToIsProcessingMessageLoop.has(id)).toBe(false);
}
