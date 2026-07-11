import { useAuthStore } from "@/stores/auth";
import { useRoomStore } from "@/stores/room";
import updateUser from "@/utils/updateUser";
import { watchEffect } from "vue";

function useRoomUserSynchronization() {
  const authStore = useAuthStore();
  const roomStore = useRoomStore();

  watchEffect(() => {
    if (!authStore.isAuth || !roomStore.room) return;

    const user = authStore.user!;
    const roomUser = roomStore.room.users.find(
      roomUser => roomUser.id === user.id,
    );

    if (!roomUser) return;
    updateUser(roomUser, user);
  });
}

export default useRoomUserSynchronization;
