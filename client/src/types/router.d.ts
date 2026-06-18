import type { RouteToNameType, Routes } from "@/types/routes";
import { RouteMetaAccessTypes } from "@/types/routes";
import type { RouteRecordInfo } from "vue-router";

export interface RouteNamedMap {
  HOME: RouteRecordInfo<
    RouteToNameType[typeof Routes.HOME],
    typeof Routes.HOME,
    { roomId?: string | number },
    { roomId?: string }
  >;
  ROOM: RouteRecordInfo<
    RouteToNameType[typeof Routes.ROOM],
    typeof Routes.ROOM,
    { id: string | number },
    { id: string }
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
  accessType?: (typeof RouteMetaAccessTypes)[keyof typeof RouteMetaAccessTypes];
}

export interface RouteMeta extends RouteMetaRaw {}

declare module "vue-router" {
  interface RouteMeta extends RouteMetaRaw {}

  interface TypesConfig {
    RouteNamedMap: RouteNamedMap;
  }
}
