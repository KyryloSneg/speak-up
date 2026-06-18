import z, { type ZodType } from "zod";

// generic validation

export function getZodNicknameValidation() {
  return z
    .string("Invalid nickname")
    .trim()
    .min(1, "Required")
    .max(30, "Nickname is too long");
}

export function getZodUsernameValidation() {
  return z
    .string("Invalid username")
    .trim()
    .min(1, "Required")
    .pipe(
      z
        .string()
        .min(3, "Username is too short")
        .max(30, "Username is too long"),
    );
}

export function getZodPasswordValidation() {
  return (
    z
      .string("Invalid password")
      .trim()
      .min(1, "Required")
      .refine(password => /\p{Lowercase_Letter}/u.test(password), {
        message: "Must contain at least one lowercase letter",
      })
      .refine(password => /\p{Uppercase_Letter}/u.test(password), {
        message: "Must contain at least one uppercase letter",
      })
      .refine(password => /[0-9]{2,}/.test(password), {
        message: "Must contain at least two digits",
      })
      .refine(password => /[!-\/:-@[-`{-~]/.test(password), {
        message: "Must contain at least one special char",
      })
      // whitespaces are allowed here
      .refine(password => password.length >= 8, {
        message: "Password is too short (8 chars at min)",
      })
      .refine(password => password.length <= 512, {
        message: "Password is too long (512 chars at max)",
      })
  );
}

export function getZodTextMessageContentPartValueValidation() {
  return z
    .string("Invalid message")
    .trim()
    .min(1, "Required")
    .max(1000, "Message is too long");
}

export function getZodMessageContentPartValidation() {
  return z
    .object({
      type: z.literal("text"),
      value: getZodTextMessageContentPartValueValidation(),
    })
    .strict();
}

export function getZodMessageContentValidation() {
  return z.array(getZodMessageContentPartValidation()).min(1, "Required");
}

export function getZodRoomMaxMembersValidation() {
  return z.number().min(1).max(100);
}

export function getZodMediaConfigValidation() {
  return z
    .object({
      audio: z.boolean("Invalid audio"),
      video: z.boolean("Invalid video"),
    })
    .strict();
}

// REST API

export function getZodRegisterBodyValidation() {
  return z
    .object({
      nickname: getZodNicknameValidation(),
      username: getZodUsernameValidation(),
      password: getZodPasswordValidation(),
    })
    .strict();
}

export function getZodSignInBodyValidation() {
  return z
    .object({
      username: getZodUsernameValidation(),
      password: getZodPasswordValidation(),
    })
    .strict();
}

export function getZodChangeNicknameBodyValidation() {
  return z
    .object({
      nickname: getZodNicknameValidation(),
    })
    .strict();
}

// socket events

export function getZodCreateRoomDataValidation() {
  return z.object({ maxMembers: getZodRoomMaxMembersValidation() }).strict();
}

export function getZodJoinRoomDataValidation() {
  return z.object({ id: z.string() }).strict();
}

export function getZodSendMediaConfigDataValidation() {
  return z.object({ config: getZodMediaConfigValidation() }).strict();
}

export function getZodSendIceDataValidation() {
  return z
    .object({
      userId: z.string(),
      ice: z.object({
        candidate: z.string(),
        sdpMid: z.string().nullable().optional(),
        sdpMLineIndex: z.number().nullable().optional(),
      }),
    })
    .strict();
}

export function getZodSendSDPDataValidation() {
  return z
    .object({
      userId: z.string(),
      sdp: z.string(),
      type: z.union([z.literal("offer"), z.literal("answer")]),
    })
    .strict();
}

export function getZodRemoveUserDataValidation() {
  return z.object({ userId: z.string() }).strict();
}

export function getZodSendMessageDataValidation() {
  return z.object({ content: getZodMessageContentValidation() }).strict();
}

// utils

export type SchemaOfZodValidationFn<Fn extends () => ZodType> = z.infer<
  ReturnType<Fn>
>;
