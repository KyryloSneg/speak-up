import type { JWTPayload as JosePayload } from "jose";

export interface JWTPayloadRaw {
  userId: string;
}

export type JWTPayload = JWTPayloadRaw & JosePayload;
