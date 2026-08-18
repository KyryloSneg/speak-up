import type { Message } from "@speak-up/shared";

export interface MessageGroup {
  id: string;
  userId: string;
  nickname: string;
  picture: string;
  messages: Message[];
}
