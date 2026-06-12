import mapToUserDto from "#dtos/userDto.ts";
import getRoomSockets from "#services/getRoomSockets.ts";
import prisma from "#services/prisma.ts";
import type { IO } from "#types/socket.ts";
import type { UserDto } from "@speak-up/shared";

async function getRoomUsers(io: IO, room: string): Promise<UserDto[]> {
  const roomSockets = await getRoomSockets<true>(io, room);
  const userIds = roomSockets
    .map(socket => socket.data.userId)
    .filter(userId => typeof userId === "string");

  if (!userIds) return [];

  const users = await prisma.user.findMany({ where: { id: { in: userIds } } });
  const userDtos = users.map(mapToUserDto);

  return userDtos;
}

export default getRoomUsers;
