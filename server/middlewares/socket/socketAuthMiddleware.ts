import ApiError from "#errors/ApiError.ts";
import TokenService from "#services/tokenService.ts";
import type { IO, IOSocket, IOSocketNextFunction } from "#types/socket.ts";
import cleanupSocket from "#utils/cleanupSocket.ts";
import getUserRoom from "#utils/getUserRoom.ts";

async function socketAuthMiddleware(
  io: IO,
  socket: IOSocket,
  next: IOSocketNextFunction,
): Promise<void> {
  const accessToken =
    socket.handshake.auth.accessToken ||
    socket.handshake.headers?.["accesstoken"] ||
    socket.handshake.query?.["accessToken"];

  const userId = accessToken
    ? (await TokenService.validateAccessToken(accessToken))?.userId || null
    : null;

  const userIdSocketRegisteredTo = socket.data.userId;

  // user has switched accounts / logged out
  const hasAccountChanged =
    !!userIdSocketRegisteredTo && userIdSocketRegisteredTo !== userId;

  if (hasAccountChanged) cleanupSocket(io, socket as IOSocket<true>);
  if (!userId) throw ApiError.UnauthorizedError();

  const room = getUserRoom(userId);

  socket.join(room);
  socket.data.userId = userId;

  next();
}

export default socketAuthMiddleware;
