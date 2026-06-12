import type {
  getZodMediaConfigValidation,
  SchemaOfZodValidationFn,
} from "../utils/validation.ts";

export type SocketMediaConfig = SchemaOfZodValidationFn<
  typeof getZodMediaConfigValidation
>;
