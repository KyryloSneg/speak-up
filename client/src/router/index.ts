import { useAuthStore } from "@/stores/auth";
import {
  RouteMetaAccessTypes,
  Routes,
  RoutesWithoutParams,
  RouteToName,
} from "@/types/routes";
import handleLogout from "@/utils/handleLogout";
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
    meta: { accessType: RouteMetaAccessTypes.AUTH },
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
    meta: { accessType: RouteMetaAccessTypes.GUEST },
  },
  {
    path: Routes.SIGN_IN,
    name: RouteToName[Routes.SIGN_IN],
    component: () => import("@/views/SignInView.vue"),
    meta: { accessType: RouteMetaAccessTypes.GUEST },
  },
] as const satisfies RouteRecordRaw[];

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes,
});

router.beforeEach(async (to, from, next) => {
  const authStore = useAuthStore();
  if (!authStore.isInitialized) await authStore.initAuth();

  if (to.meta.accessType === RouteMetaAccessTypes.AUTH && !authStore.isAuth) {
    const nextRoute = handleLogout(false);
    return next(nextRoute);
  }

  if (to.meta.accessType === RouteMetaAccessTypes.GUEST && authStore.isAuth) {
    return next(RoutesWithoutParams.HOME);
  }

  next();
});

export default router;
