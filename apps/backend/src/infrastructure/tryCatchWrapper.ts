import type { NextFunction, Request, Response } from "express";

type AsyncHandler<Params = Record<string, string>, ReqBody = unknown> = (
  req: Request<Params, unknown, ReqBody>,
  res: Response,
  next: NextFunction,
) => Promise<unknown>;

// Express 5 already forwards a rejected promise from an async handler to
// next(err) on its own — this wrapper isn't required for correctness here.
// It's kept as an explicit, visible marker at each route: "this handler is
// async and its errors reach appErrorHandler," rather than relying silently
// on framework behavior.
const tryCatchWrapper = <Params = Record<string, string>, ReqBody = unknown>(
  fn: AsyncHandler<Params, ReqBody>,
) => {
  return async (
    req: Request<Params, unknown, ReqBody>,
    res: Response,
    next: NextFunction,
  ): Promise<void> => {
    try {
      await fn(req, res, next);
    } catch (error) {
      next(error);
    }
  };
};

export default tryCatchWrapper;
