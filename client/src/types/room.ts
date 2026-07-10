import type { Message, UserDto } from "@speak-up/shared";

export interface Room {
  id: string;
  users: UserDto[];
  messages: Message[];
}
