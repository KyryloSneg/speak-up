import {
  objectEntries,
  type EqualKeysAndValues,
  type Invert,
} from "@speak-up/shared";
import { defineAsyncComponent } from "vue";

export const Routes = {
  HOME: "/:roomId?",
  CREATE_ROOM: "/createRoom",
  ROOM: "/room",
  REGISTER: "/register",
  SIGN_IN: "/sign-in",
} as const;

export const RoutesWithoutParams = {
  HOME: "/",
  CREATE_ROOM: "/createRoom",
  ROOM: "/room",
  REGISTER: "/register",
  SIGN_IN: "/sign-in",
} as const;

export type RouteToNameType = Invert<typeof Routes>;
export const RouteToName = Object.fromEntries(
  objectEntries(Routes).map(([key, value]) => [value, key]),
) as RouteToNameType;

export const RouteMetaAccessTypes = { GUEST: "guest", AUTH: "auth" } as const;
export const RouteLayouts = {
  HOME: defineAsyncComponent(
    () => import("@/components/layout/home/HomeLayout.vue"),
  ),
  AUTH: defineAsyncComponent(
    () => import("@/components/layout/auth/AuthLayout.vue"),
  ),
} as const;

export type RouteLayoutNamesType = EqualKeysAndValues<typeof RouteLayouts>;
export const RouteLayoutNames = Object.fromEntries(
  objectEntries(RouteLayouts).map(([key]) => [key, key]),
) as RouteLayoutNamesType;
