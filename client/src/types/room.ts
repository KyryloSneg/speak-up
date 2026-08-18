import type { Message, UserDto } from "@speak-up/shared";

export interface RoomUser extends UserDto {
  lastSpeakedAt?: Date;
}

export interface Room {
  id: string;
  hostId: UserDto["id"];
  users: RoomUser[];
  messages: Message[];
  maxMembers: number;
}
