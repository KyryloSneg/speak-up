import type { User } from "#generated/prisma/client.ts";
import type { Message, SocketMediaConfig } from "@speak-up/shared";

export interface Room {
  id: string;
  hostId: User["id"];
  removedUserIds: Set<User["id"]>;
  messages: Message[];
  maxMembers: number;
  mediaConfigs: Map<User["id"], SocketMediaConfig>;
}
