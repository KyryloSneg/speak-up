import UserController from "#controllers/userController.ts";
import WebRTCController from "#controllers/webRTCController.ts";
import authMiddleware from "#middlewares/api/apiAuthMiddleware.ts";
import changeNicknameBodyValidator from "#validators/changeNicknameBodyValidator.ts";
import registerBodyValidator from "#validators/registerBodyValidator.ts";
import signInBodyValidator from "#validators/signInBodyValidator.ts";
import { NoPrefixApiRoutes } from "@speak-up/shared";
import { Router } from "express";

const router = Router();

router.post(
  NoPrefixApiRoutes.REGISTER,
  registerBodyValidator(),
  UserController.register,
);

router.post(
  NoPrefixApiRoutes.SIGN_IN,
  signInBodyValidator(),
  UserController.login,
);

router.post(NoPrefixApiRoutes.LOGOUT, UserController.logout);
router.patch(
  NoPrefixApiRoutes.CHANGE_NICKNAME,
  authMiddleware,
  changeNicknameBodyValidator(),
  // @ts-expect-error: We are 100% sure that the incoming request
  //                   will be AuthRequest type after auth middleware
  UserController.changeNickname,
);

router.get(NoPrefixApiRoutes.REFRESH, UserController.refresh);
router.get(
  NoPrefixApiRoutes.ICE_SERVERS,
  authMiddleware, // unauth users have no need in this endpoint
  // @ts-expect-error: same as above
  WebRTCController.getIceServers,
);

export default router;
