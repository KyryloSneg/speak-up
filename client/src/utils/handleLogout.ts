import router from "@/router";
import { useAuthStore } from "@/stores/auth";
import { LocalStorageKeys } from "@/types/localStorage";
import { RoutesWithoutParams } from "@/types/routes";

type RoutesWithoutParamsValues =
  (typeof RoutesWithoutParams)[keyof typeof RoutesWithoutParams];

function handleLogout(isToRedirect?: true): void;
function handleLogout(isToRedirect: false): RoutesWithoutParamsValues;

function handleLogout(
  isToRedirect: boolean = true,
): void | RoutesWithoutParamsValues {
  const authStore = useAuthStore();
  authStore.user = null;

  localStorage.removeItem(LocalStorageKeys.ACCESS_TOKEN);

  const nextRoute = RoutesWithoutParams.SIGN_IN;
  if (isToRedirect) {
    router.replace(nextRoute);
  } else {
    return nextRoute;
  }
}

export default handleLogout;
