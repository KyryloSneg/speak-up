import type { RouteToNameType, Routes } from "@/types/routes";
import { RouteLayoutNames, RouteMetaAccessTypes } from "@/types/routes";
import type { RouteRecordInfo } from "vue-router";

export interface RouteNamedMap {
  HOME: RouteRecordInfo<
    RouteToNameType[typeof Routes.HOME],
    typeof Routes.HOME,
    { roomId?: string | number },
    { roomId?: string }
  >;
  CREATE_ROOM: RouteRecordInfo<
    RouteToNameType[typeof Routes.CREATE_ROOM],
    typeof Routes.CREATE_ROOM,
    Record<never, never>,
    Record<never, never>
  >;
  ROOM: RouteRecordInfo<
    RouteToNameType[typeof Routes.ROOM],
    typeof Routes.ROOM,
    Record<never, never>,
    Record<never, never>
  >;
  REGISTER: RouteRecordInfo<
    RouteToNameType[typeof Routes.REGISTER],
    typeof Routes.REGISTER,
    Record<never, never>,
    Record<never, never>
  >;
  SIGN_IN: RouteRecordInfo<
    RouteToNameType[typeof Routes.SIGN_IN],
    typeof Routes.SIGN_IN,
    Record<never, never>,
    Record<never, never>
  >;
}

interface RouteMetaRaw {
  layout?: (typeof RouteLayoutNames)[keyof typeof RouteLayoutNames];
  accessType?: (typeof RouteMetaAccessTypes)[keyof typeof RouteMetaAccessTypes];
}

export interface RouteMeta extends RouteMetaRaw {}

declare module "vue-router" {
  interface RouteMeta extends RouteMetaRaw {}

  interface TypesConfig {
    RouteNamedMap: RouteNamedMap;
  }
}
