import type { Request } from "express";

export interface AuthRequest<
  P = Request["params"],
  ResBody = any,
  ReqBody = any,
  ReqQuery = Request["query"],
> extends Request<P, ResBody, ReqBody, ReqQuery> {
  userId: string;
}

export type OptionalAuthRequest<
  P = Request["params"],
  ResBody = any,
  ReqBody = any,
  ReqQuery = Request["query"],
> =
  | Request<P, ResBody, ReqBody, ReqQuery>
  | AuthRequest<P, ResBody, ReqBody, ReqQuery>;
