import type { JWTPayload, JWTPayloadRaw } from "#types/jwtPayload.ts";

function filterJwtPayload(payload: JWTPayloadRaw): JWTPayload {
  const jwtPayload: JWTPayloadRaw = { userId: payload.userId };

  // we use this util just for raw type-safety on the assignment above,
  // so this casting isn't too bad
  return jwtPayload as JWTPayload;
}

export default filterJwtPayload;
