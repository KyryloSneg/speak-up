import type {
  getZodMessageContentPartValidation,
  SchemaOfZodValidationFn,
} from "../utils/validation.ts";

export type MessageContent = MessageContentPart[];
export type MessageContentPart = SchemaOfZodValidationFn<
  typeof getZodMessageContentPartValidation
>;

// TODO: .createdAt + user nickname snapshot
export interface Message {
  id: string;
  userId: string;
  content: MessageContent;
}
