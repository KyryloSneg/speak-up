import useMemberCardsMaxColsAndRows from "@/composables/useMemberCardsMaxColsAndRows";
import { useRoomStore } from "@/stores/room";
import type { Room, RoomUser } from "@/types/room";
import calcMemberCardsMaxColsAndRows from "@/utils/roomMemberCards/calcMemberCardsMaxColsAndRows";
import { createPinia, setActivePinia } from "pinia";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { ref } from "vue";

const mockWidth = ref(0);
const mockHeight = ref(0);

vi.mock("@vueuse/core", () => ({
  useElementSize: vi.fn(() => ({
    width: mockWidth,
    height: mockHeight,
  })),
}));

vi.mock("@/utils/roomMemberCards/calcMemberCardsMaxColsAndRows", () => ({
  default: vi.fn(() => ({
    maxCols: 2,
    maxRows: 2,
  })),
}));

describe("useMemberCardsMaxColsAndRows", () => {
  const dummyRef = ref<HTMLElement | null>(null);

  beforeEach(() => {
    setActivePinia(createPinia());
    vi.clearAllMocks();

    mockWidth.value = 0;
    mockHeight.value = 0;
  });

  it("returns null when element size is 0x0 (not initialized)", () => {
    const roomStore = useRoomStore();

    roomStore.room = { users: [{ id: "1" }] } as Room;
    mockWidth.value = 0;
    mockHeight.value = 0;

    const boundaries = useMemberCardsMaxColsAndRows(dummyRef);

    expect(boundaries.value).toBeNull();
    expect(calcMemberCardsMaxColsAndRows).not.toHaveBeenCalled();
  });

  it("returns null when room is empty or users are missing", () => {
    const roomStore = useRoomStore();

    mockWidth.value = 1000;
    mockHeight.value = 800;
    roomStore.room = { users: [] } as unknown as Room;

    const boundaries = useMemberCardsMaxColsAndRows(dummyRef);
    expect(boundaries.value).toBeNull();

    roomStore.room = null;
    expect(boundaries.value).toBeNull();
    expect(calcMemberCardsMaxColsAndRows).not.toHaveBeenCalled();
  });

  it("calculates grid boundaries when element size and room users exist", () => {
    const roomStore = useRoomStore();

    mockWidth.value = 1280;
    mockHeight.value = 720;
    roomStore.room = { users: [{ id: "1" }, { id: "2" }] } as Room;

    const boundaries = useMemberCardsMaxColsAndRows(dummyRef);

    expect(boundaries.value).toEqual({ maxCols: 2, maxRows: 2 });
    expect(calcMemberCardsMaxColsAndRows).toHaveBeenCalledWith(2, 1280, 720);
  });

  it("reactively updates boundaries when width or height changes", () => {
    const roomStore = useRoomStore();

    mockWidth.value = 500;
    mockHeight.value = 300;
    roomStore.room = { users: [{ id: "1" }] } as Room;

    const boundaries = useMemberCardsMaxColsAndRows(dummyRef);

    expect(boundaries.value).toEqual({ maxCols: 2, maxRows: 2 });
    expect(calcMemberCardsMaxColsAndRows).toHaveBeenCalledWith(1, 500, 300);

    mockWidth.value = 1920;
    mockHeight.value = 1080;

    expect(boundaries.value).toEqual({ maxCols: 2, maxRows: 2 });
    expect(calcMemberCardsMaxColsAndRows).toHaveBeenCalledWith(1, 1920, 1080);
  });

  it("reactively updates boundaries when room user count changes", () => {
    const roomStore = useRoomStore();

    mockWidth.value = 800;
    mockHeight.value = 600;
    roomStore.room = { users: [{ id: "1" }] } as Room;

    const boundaries = useMemberCardsMaxColsAndRows(dummyRef);

    expect(boundaries.value).toEqual({ maxCols: 2, maxRows: 2 });
    expect(calcMemberCardsMaxColsAndRows).toHaveBeenCalledWith(1, 800, 600);

    roomStore.room.users.push({ id: "2" } as RoomUser, { id: "3" } as RoomUser);

    expect(boundaries.value).toEqual({ maxCols: 2, maxRows: 2 });
    expect(calcMemberCardsMaxColsAndRows).toHaveBeenCalledWith(3, 800, 600);
  });
});
