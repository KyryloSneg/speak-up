import { objectEntries, type Invert } from "@speak-up/shared";

export const Routes = {
  HOME: "/:roomId?",
  ROOM: "/room/:id",
  REGISTER: "/register",
  SIGN_IN: "/sign-in",
} as const;

export const RoutesWithoutParams = {
  HOME: "/",
  ROOM: "/room/",
  REGISTER: "/register",
  SIGN_IN: "/sign-in",
} as const;

export type RouteToNameType = Invert<typeof Routes>;
export const RouteToName = Object.fromEntries(
  objectEntries(Routes).map(([key, value]) => [value, key]),
) as RouteToNameType;

export const RouteMetaAccessTypes = { GUEST: "guest", AUTH: "auth" } as const;
