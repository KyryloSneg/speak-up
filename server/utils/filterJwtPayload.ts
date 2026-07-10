import type { JWTPayload, JWTPayloadRaw } from "#types/jwtPayload.ts";

function filterJwtPayload(payload: JWTPayload): JWTPayloadRaw {
  const jwtPayload: JWTPayloadRaw = { userId: payload.userId } as const;
  return jwtPayload;
}

export default filterJwtPayload;
