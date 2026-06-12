import UserController from "#controllers/userController.ts";
import authMiddleware from "#middlewares/api/apiAuthMiddleware.ts";
import changeNicknameBodyStructureValidator from "#validators/changeNicknameBodyStructureValidator.ts";
import nicknameValidator from "#validators/nicknameValidator.ts";
import passwordValidator from "#validators/passwordValidator.ts";
import registerBodyStructureValidator from "#validators/registerBodyStructureValidator.ts";
import signInBodyStructureValidator from "#validators/signInBodyStructureValidator.ts";
import usernameValidator from "#validators/usernameValidator.ts";
import { Router } from "express";
import { body } from "express-validator";

const router = Router();

router.post(
  "/register",
  ...registerBodyStructureValidator(),
  body("nickname").custom(nicknameValidator),
  body("username").custom(usernameValidator),
  body("password").custom(passwordValidator),
  UserController.registration,
);

router.post(
  "/sign-in",
  ...signInBodyStructureValidator(),
  body("username").custom(usernameValidator),
  body("password").custom(passwordValidator),
  UserController.login,
);

router.post("/logout", UserController.logout);
router.patch(
  "/change-nickname",
  authMiddleware,
  ...changeNicknameBodyStructureValidator(),
  body("nickname").custom(nicknameValidator),
  // @ts-expect-error: We are 100% sure that the incoming request
  //                   will be AuthRequest type after auth middleware
  UserController.changeNickname,
);

router.get("/refresh", UserController.refresh);

export default router;
