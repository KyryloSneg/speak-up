import z from "zod";

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
    .min(3, "Username is too short")
    .max(50, "Username is too long");
}

export function getZodPasswordValidation() {
  return (
    z
      .string()
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
