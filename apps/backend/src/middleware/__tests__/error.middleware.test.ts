import { describe, expect, it, vi } from "vite-plus/test";
import type { NextFunction, Request, Response } from "express";
import { appErrorHandler } from "../error.middleware.js";

const buildFakeResponse = (): Response => {
  const res = { req: { id: "test-request-id" } } as unknown as Response;
  res.status = vi.fn().mockReturnValue(res);
  res.json = vi.fn().mockReturnValue(res);
  return res;
};

const buildConnectivityError = (code: string): NodeJS.ErrnoException => {
  const err = new Error(
    `getaddrinfo ${code} ep-gentle-rain-axvn30zm-pooler.c-4.us-east-2.aws.neon.tech`,
  ) as NodeJS.ErrnoException;
  err.code = code;
  return err;
};

describe("appErrorHandler", () => {
  it("treats a DNS resolution failure as the database being unreachable", () => {
    const res = buildFakeResponse();

    appErrorHandler(
      buildConnectivityError("ENOTFOUND"),
      {} as Request,
      res,
      vi.fn() as NextFunction,
    );

    expect(res.status).toHaveBeenCalledWith(503);
    expect(res.json).toHaveBeenCalledWith(
      expect.objectContaining({
        error: expect.objectContaining({ code: "SERVICE_UNAVAILABLE" }),
      }),
    );
  });

  it.each(["EAI_AGAIN", "ECONNREFUSED", "ETIMEDOUT"])(
    "also treats %s as the database being unreachable",
    (errnoCode) => {
      const res = buildFakeResponse();

      appErrorHandler(
        buildConnectivityError(errnoCode),
        {} as Request,
        res,
        vi.fn() as NextFunction,
      );

      expect(res.status).toHaveBeenCalledWith(503);
    },
  );

  it("never leaks the real hostname in a connectivity error's response", () => {
    const res = buildFakeResponse();

    appErrorHandler(
      buildConnectivityError("ENOTFOUND"),
      {} as Request,
      res,
      vi.fn() as NextFunction,
    );

    const [body] = (res.json as ReturnType<typeof vi.fn>).mock.calls[0] as [
      { error: { message: string } },
    ];
    expect(body.error.message).not.toContain("neon.tech");
  });

  it("still falls back to a generic 500 for an unrelated error", () => {
    const res = buildFakeResponse();

    appErrorHandler(
      new Error("Something else went wrong"),
      {} as Request,
      res,
      vi.fn() as NextFunction,
    );

    expect(res.status).toHaveBeenCalledWith(500);
    expect(res.json).toHaveBeenCalledWith(
      expect.objectContaining({
        error: expect.objectContaining({ code: "INTERNAL_SERVER_ERROR" }),
      }),
    );
  });
});
