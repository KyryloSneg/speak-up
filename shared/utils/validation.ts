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
  const invalidTypeError = "Invalid max members" as const;

  return z
    .unknown()
    .transform((value, ctx) => {
      if (typeof value === "number") return value;
      if (typeof value === "string") {
        const trimmed = value.trim();

        if (!trimmed || isNaN(Number(trimmed))) {
          ctx.addIssue({
            code: "custom",
            message: invalidTypeError,
            fatal: true,
          });

          return z.NEVER;
        }

        return Number(trimmed);
      }

      ctx.addIssue({
        code: "custom",
        message: invalidTypeError,
        fatal: true,
      });

      return z.NEVER;
    })
    .pipe(z.number().min(1, "Too few members").max(100, "Too many members"));
}

export function getZodMediaConfigValidation() {
  return z
    .object({
      audio: z.boolean("Invalid audio"),
      video: z.boolean("Invalid video"),
    })
    .strict();
}

export function getZodIdValidation() {
  return z.string("Invalid id").trim().min(1, "Required");
}

export function getZodIceValidation() {
  return z.looseObject({
    candidate: z.string(),
    sdpMid: z.string().nullable().optional(),
    sdpMLineIndex: z.number().nullable().optional(),
    usernameFragment: z.string().nullable().optional(),
  });
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
  return z
    .object({
      maxMembers: getZodRoomMaxMembersValidation(),
      mediaConfig: getZodMediaConfigValidation(),
    })
    .strict();
}

export function getZodJoinRoomDataValidation() {
  return z
    .object({
      id: getZodIdValidation(),
      mediaConfig: getZodMediaConfigValidation(),
    })
    .strict();
}

export function getZodSendMediaConfigDataValidation() {
  return z.object({ config: getZodMediaConfigValidation() }).strict();
}

export function getZodSendIceDataValidation() {
  return z
    .object({
      userId: getZodIdValidation(),
      ice: getZodIceValidation(),
    })
    .strict();
}

export function getZodSendSDPDataValidation() {
  return z
    .object({
      userId: getZodIdValidation(),
      sdp: z.string(),
      type: z.union([z.literal("offer"), z.literal("answer")]),
      screenSharingStreamId: z.string().nullable().optional(),
    })
    .strict();
}

export function getZodRemoveUserDataValidation() {
  return z.object({ userId: getZodIdValidation() }).strict();
}

export function getZodSendMessageDataValidation() {
  return z.array(
    z
      .object({
        tempId: getZodIdValidation(),
        content: getZodMessageContentValidation(),
      })
      .strict(),
  );
}

// utils

export type SchemaOfZodValidationFn<Fn extends () => ZodType> = z.infer<
  ReturnType<Fn>
>;
