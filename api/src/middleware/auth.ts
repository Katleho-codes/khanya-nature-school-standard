import type { NextFunction, Request, Response } from "express";
import { fromNodeHeaders } from "better-auth/node";
import { auth } from "../auth.js";
import { prisma } from "../db.js";
import { AppError } from "../lib/http.js";

export interface SessionUser {
  id: string;
  name: string;
  email: string;
  role: string | null;
  isActive: boolean;
}

declare global {
  // Express augments its Request type through a global namespace.
  // eslint-disable-next-line @typescript-eslint/no-namespace
  namespace Express {
    interface Request {
      user?: SessionUser;
      sessionId?: string;
    }
  }
}

export async function requireAuth(
  req: Request,
  _res: Response,
  next: NextFunction,
): Promise<void> {
  try {
    const session = await auth.api.getSession({
      headers: fromNodeHeaders(req.headers),
    });

    if (!session) {
      throw new AppError(401, "UNAUTHENTICATED", "Please sign in to continue.");
    }

    const user = await prisma.user.findUnique({
      where: { id: session.user.id },
      select: {
        id: true,
        name: true,
        email: true,
        role: true,
        isActive: true,
      },
    });

    if (!user || !user.isActive) {
      throw new AppError(
        403,
        "ACCOUNT_INACTIVE",
        "This account is no longer active.",
      );
    }

    req.user = user;
    req.sessionId = session.session.id;
    next();
  } catch (error) {
    next(error);
  }
}

export function requireAdmin(
  req: Request,
  _res: Response,
  next: NextFunction,
): void {
  if (req.user?.role !== "admin") {
    next(
      new AppError(
        403,
        "FORBIDDEN",
        "Only an administrator can make that change.",
      ),
    );
    return;
  }
  next();
}

export function requireEditorOrAdmin(
  req: Request,
  _res: Response,
  next: NextFunction,
): void {
  if (req.user?.role !== "admin" && req.user?.role !== "editor") {
    next(new AppError(403, "FORBIDDEN", "You do not have access to that."));
    return;
  }
  next();
}
