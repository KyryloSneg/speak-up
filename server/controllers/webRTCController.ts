import WebRTCService from "#services/webRTCService.ts";
import type { AuthRequest } from "#types/request.ts";
import type { GetIceServersResponseBody } from "@speak-up/shared";
import type { NextFunction, Response } from "express";

class WebRTCController {
  static async getIceServers(
    req: AuthRequest<Record<string, never>, GetIceServersResponseBody, never>,
    res: Response<GetIceServersResponseBody>,
    next: NextFunction,
  ) {
    try {
      const iceServers = await WebRTCService.getIceServers();

      res.json(iceServers);
    } catch (e) {
      next(e);
    }
  }
}

export default WebRTCController;
