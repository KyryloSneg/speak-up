import type { Message, UserDto } from "@speak-up/shared";

export interface Room {
  id: string;
  hostId: UserDto["id"];
  users: UserDto[];
  messages: Message[];
  maxMembers: number;
}
