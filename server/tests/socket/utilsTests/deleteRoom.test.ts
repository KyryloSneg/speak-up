import {
  setupDeleteRoomTest,
  testDeleteRoom,
} from "#tests/socket/utils/testDeleteRoom.ts";
import deleteRoom from "#utils/deleteRoom.ts";
import { describe, it } from "vitest";

describe("deleteRoom", () => {
  it("should properly cleanup room data", () => {
    const id = "id";
    setupDeleteRoomTest(id);

    deleteRoom(id);
    testDeleteRoom(id);
  });
});
