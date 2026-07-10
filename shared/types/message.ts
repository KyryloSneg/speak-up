import type {
  getZodMessageContentPartValidation,
  SchemaOfZodValidationFn,
} from "../utils/validation.ts";
import type { UserDto } from "./user.ts";

export type MessageContent = MessageContentPart[];
export type MessageContentPart = SchemaOfZodValidationFn<
  typeof getZodMessageContentPartValidation
>;

export interface Message {
  id: string;
  userId: string;
  user: {
    nickname: UserDto["nickname"];
    picture: UserDto["picture"];
  };
  content: MessageContent;
  createdAt: string;
}
