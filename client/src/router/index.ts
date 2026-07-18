import { useAuthStore } from "@/stores/auth";
import { useRoomStore } from "@/stores/room";
import {
  RouteLayoutNames,
  RouteMetaAccessTypes,
  Routes,
  RoutesWithoutParams,
  RouteToName,
} from "@/types/routes";
import handleLogout from "@/utils/handleLogout";
import postAuthCb from "@/utils/postAuthCb";
import HomeView from "@/views/HomeView.vue";
import {
  createRouter,
  createWebHistory,
  type RouteRecordRaw,
} from "vue-router";

export const routes = [
  {
    path: Routes.HOME,
    name: RouteToName[Routes.HOME],
    component: HomeView,
    meta: {
      layout: RouteLayoutNames.HOME,
      accessType: RouteMetaAccessTypes.AUTH,
    },
  },
  {
    path: Routes.CREATE_ROOM,
    name: RouteToName[Routes.CREATE_ROOM],
    component: () => import("@/views/CreateRoomView.vue"),
    meta: {
      layout: RouteLayoutNames.HOME,
      accessType: RouteMetaAccessTypes.AUTH,
    },
  },
  {
    path: Routes.ROOM,
    name: RouteToName[Routes.ROOM],
    component: () => import("@/views/RoomView.vue"),
    meta: { accessType: RouteMetaAccessTypes.AUTH },
  },

  {
    path: Routes.REGISTER,
    name: RouteToName[Routes.REGISTER],
    component: () => import("@/views/RegisterView.vue"),
    meta: {
      layout: RouteLayoutNames.AUTH,
      accessType: RouteMetaAccessTypes.GUEST,
    },
  },
  {
    path: Routes.SIGN_IN,
    name: RouteToName[Routes.SIGN_IN],
    component: () => import("@/views/SignInView.vue"),
    meta: {
      layout: RouteLayoutNames.AUTH,
      accessType: RouteMetaAccessTypes.GUEST,
    },
  },
] as const satisfies RouteRecordRaw[];

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes,
});

router.beforeEach(async (to, from) => {
  const authStore = useAuthStore();
  if (!authStore.isInitialized) {
    await authStore.initAuth();
    if (authStore.isAuth) postAuthCb();
  }

  if (to.meta.accessType === RouteMetaAccessTypes.AUTH && !authStore.isAuth) {
    const nextRoute = handleLogout(false);
    return nextRoute;
  }

  if (to.meta.accessType === RouteMetaAccessTypes.GUEST && authStore.isAuth) {
    return RoutesWithoutParams.HOME;
  }

  if (to.name === RouteToName[Routes.ROOM]) {
    const roomStore = useRoomStore();
    if (!roomStore.room) return RoutesWithoutParams.HOME;
  } else if (from.name === RouteToName[Routes.ROOM]) {
    const roomStore = useRoomStore();
    const isToLeave =
      roomStore.isToSupressLeaveConfirm || confirm("Leave this room?");

    roomStore.isToSupressLeaveConfirm = false;

    if (isToLeave) {
      if (
        roomStore.room &&
        !roomStore.isJoining &&
        !roomStore.roomIdUserIsTryingToJoin
      ) {
        roomStore.leaveRoom(false);
      }
    } else {
      return from.path;
    }
  }
});

export default router;
