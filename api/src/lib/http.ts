import type { NextFunction, Request, Response } from "express";
import type { z } from "zod";
import { Prisma } from "../generated/prisma/client.js";
import { logger } from "./logger.js";

export class AppError extends Error {
  status: number;
  code: string;
  fields?: Record<string, string>;

  constructor(
    status: number,
    code: string,
    message: string,
    fields?: Record<string, string>,
  ) {
    super(message);
    this.name = "AppError";
    this.status = status;
    this.code = code;
    this.fields = fields;
  }
}

function fieldErrors(error: z.ZodError): Record<string, string> {
  const fields: Record<string, string> = {};
  for (const issue of error.issues) {
    const key = issue.path.join(".") || "form";
    if (!fields[key]) {
      fields[key] = issue.message;
    }
  }
  return fields;
}

export function parse<T extends z.ZodType>(
  schema: T,
  value: unknown,
  message = "Please check the highlighted fields.",
): z.infer<T> {
  const result = schema.safeParse(value);
  if (!result.success) {
    throw new AppError(400, "VALIDATION_ERROR", message, fieldErrors(result.error));
  }
  return result.data;
}

export function notFound(message = "That item could not be found."): never {
  throw new AppError(404, "NOT_FOUND", message);
}

export function forbidden(message = "You do not have permission to do that."): never {
  throw new AppError(403, "FORBIDDEN", message);
}

export function errorHandler(
  error: unknown,
  _req: Request,
  res: Response,
  _next: NextFunction,
): void {
  if (error instanceof AppError) {
    res.status(error.status).json({
      error: {
        code: error.code,
        message: error.message,
        ...(error.fields ? { fields: error.fields } : {}),
      },
    });
    return;
  }

  if (
    error instanceof SyntaxError &&
    "body" in error
  ) {
    res.status(400).json({
      error: {
        code: "INVALID_JSON",
        message: "The request body could not be read.",
      },
    });
    return;
  }

  if (
    error instanceof Error &&
    (error.name === "MulterError" || error.name === "PayloadTooLargeError")
  ) {
    res.status(400).json({
      error: {
        code: "UPLOAD_ERROR",
        message:
          error.name === "MulterError" && "code" in error && error.code === "LIMIT_FILE_SIZE"
            ? "Files must be 8 MB or smaller."
            : "That upload could not be read.",
      },
    });
    return;
  }

  if (error instanceof Prisma.PrismaClientKnownRequestError) {    if (error.code === "P2002") {
      res.status(409).json({
        error: {
          code: "CONFLICT",
          message: "Something with that name or slug already exists.",
        },
      });
      return;
    }
    if (error.code === "P2025") {
      res.status(404).json({
        error: { code: "NOT_FOUND", message: "That item could not be found." },
      });
      return;
    }
    if (error.code === "P2003") {
      res.status(409).json({
        error: {
          code: "IN_USE",
          message: "That item is still in use elsewhere and cannot be removed.",
        },
      });
      return;
    }
  }

  logger.error({ err: error }, "unhandled request error");
  res.status(500).json({
    error: {
      code: "INTERNAL_ERROR",
      message: "Something went wrong on our side. Please try again.",
    },
  });
}
