import $api from "@/http";
import router from "@/router";
import { useAuthStore } from "@/stores/auth";
import { useRoomStore } from "@/stores/room";
import { LocalStorageKeys } from "@/types/localStorage";
import { RoutesWithoutParams } from "@/types/routes";
import socket from "@/utils/socket";

type RoutesWithoutParamsValues =
  (typeof RoutesWithoutParams)[keyof typeof RoutesWithoutParams];

async function handleLogout(isToRedirect?: true): Promise<void>;
async function handleLogout(
  isToRedirect: false,
): Promise<RoutesWithoutParamsValues>;

async function handleLogout(
  isToRedirect: boolean = true,
): Promise<void | RoutesWithoutParamsValues> {
  const authStore = useAuthStore();
  const roomStore = useRoomStore();

  if (roomStore.room) roomStore.isToSupressLeaveConfirm = true;
  socket.disconnect();

  localStorage.removeItem(LocalStorageKeys.ACCESS_TOKEN);

  await $api.auth.logout();
  authStore.user = null;

  const nextRoute = RoutesWithoutParams.SIGN_IN;
  if (isToRedirect) {
    router.replace(nextRoute);
  } else {
    return nextRoute;
  }
}

export default handleLogout;
