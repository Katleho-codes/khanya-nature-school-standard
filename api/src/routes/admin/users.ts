import { Router } from "express";
import { fromNodeHeaders } from "better-auth/node";
import { z } from "zod";
import { auth } from "../../auth.js";
import { prisma } from "../../db.js";
import { AppError, notFound, parse } from "../../lib/http.js";
import { sendUserWelcomeEmail } from "../../lib/mailer.js";
import {
  idSchema,
  passwordResetSchema,
  userCreateSchema,
  userUpdateSchema,
} from "../../lib/schemas.js";

export const usersRouter = Router();

const idParam = z.object({ id: idSchema });

async function activeAdminCount(): Promise<number> {
  return prisma.user.count({
    where: { role: "admin", isActive: true },
  });
}

usersRouter.get("/", async (_req, res) => {
  const users = await prisma.user.findMany({
    orderBy: [{ role: "desc" }, { name: "asc" }],
    select: {
      id: true,
      name: true,
      email: true,
      role: true,
      isActive: true,
      createdAt: true,
      updatedAt: true,
    },
  });
  res.json({ users });
});

usersRouter.post("/", async (req, res) => {
  const data = parse(userCreateSchema, req.body);
  try {
    await auth.api.createUser({
      body: {
        name: data.name,
        email: data.email,
        password: data.password,
        role: data.role,
        data: { isActive: true },
      },
      headers: fromNodeHeaders(req.headers),
    });
  } catch (error) {
    const message =
      error instanceof Error ? error.message.toLowerCase() : "";
    if (message.includes("exist") || message.includes("unique")) {
      throw new AppError(
        409,
        "EMAIL_IN_USE",
        "An account with that email address already exists.",
      );
    }
    throw error;
  }

  const user = await prisma.user.findUnique({
    where: { email: data.email },
    select: {
      id: true,
      name: true,
      email: true,
      role: true,
      isActive: true,
      createdAt: true,
    },
  });
  if (!user) notFound("The account was created but could not be loaded.");

  await sendUserWelcomeEmail({
    to: user.email,
    name: user.name,
    role: user.role ?? "editor",
  });

  res.status(201).json({ user });
});

usersRouter.patch("/:id", async (req, res) => {
  if (!req.user) notFound("Please sign in again.");
  const { id } = parse(idParam, req.params);
  const data = parse(userUpdateSchema, req.body);
  const target = await prisma.user.findUnique({ where: { id } });
  if (!target) notFound("That account could not be found.");

  if (id === req.user.id && data.role !== "admin") {
    throw new AppError(
      400,
      "SELF_DEMOTE",
      "You cannot remove your own administrator access.",
    );
  }

  if (
    target.role === "admin" &&
    target.isActive &&
    data.role !== "admin" &&
    (await activeAdminCount()) <= 1
  ) {
    throw new AppError(
      400,
      "LAST_ADMIN",
      "The last active administrator cannot be demoted.",
    );
  }

  await auth.api.adminUpdateUser({
    body: {
      userId: id,
      data: { name: data.name, email: data.email, role: data.role },
    },
    headers: fromNodeHeaders(req.headers),
  });

  const user = await prisma.user.findUnique({
    where: { id },
    select: {
      id: true,
      name: true,
      email: true,
      role: true,
      isActive: true,
      createdAt: true,
    },
  });
  res.json({ user });
});

usersRouter.patch("/:id/deactivate", async (req, res) => {
  if (!req.user) notFound("Please sign in again.");
  const { id } = parse(idParam, req.params);
  if (id === req.user.id) {
    throw new AppError(
      400,
      "SELF_DEACTIVATE",
      "You cannot deactivate your own account.",
    );
  }
  const target = await prisma.user.findUnique({ where: { id } });
  if (!target) notFound("That account could not be found.");
  if (target.role === "admin" && target.isActive && (await activeAdminCount()) <= 1) {
    throw new AppError(
      400,
      "LAST_ADMIN",
      "The last active administrator cannot be deactivated.",
    );
  }

  await prisma.$transaction([
    prisma.user.update({
      where: { id },
      data: {
        isActive: false,
        banned: true,
        banReason: "Account deactivated by an administrator",
      },
    }),
    prisma.session.deleteMany({ where: { userId: id } }),
  ]);

  res.json({ deactivated: true });
});

usersRouter.patch("/:id/reactivate", async (req, res) => {
  const { id } = parse(idParam, req.params);
  const user = await prisma.user.update({
    where: { id },
    data: {
      isActive: true,
      banned: false,
      banReason: null,
      banExpires: null,
    },
    select: {
      id: true,
      name: true,
      email: true,
      role: true,
      isActive: true,
    },
  });
  res.json({ user });
});

usersRouter.patch("/:id/password", async (req, res) => {
  const { id } = parse(idParam, req.params);
  const { password } = parse(passwordResetSchema, req.body);
  const target = await prisma.user.findUnique({ where: { id } });
  if (!target) notFound("That account could not be found.");

  await auth.api.setUserPassword({
    body: { userId: id, newPassword: password },
    headers: fromNodeHeaders(req.headers),
  });
  await prisma.session.deleteMany({ where: { userId: id } });

  res.json({ reset: true });
});

usersRouter.delete("/:id", async (req, res) => {
  if (!req.user) notFound("Please sign in again.");
  const { id } = parse(idParam, req.params);
  if (id === req.user.id) {
    throw new AppError(
      400,
      "SELF_DELETE",
      "You cannot delete your own account.",
    );
  }
  const target = await prisma.user.findUnique({ where: { id } });
  if (!target) notFound("That account could not be found.");
  if (target.role === "admin" && target.isActive && (await activeAdminCount()) <= 1) {
    throw new AppError(
      400,
      "LAST_ADMIN",
      "The last active administrator cannot be deleted.",
    );
  }

  await prisma.$transaction([
    prisma.post.updateMany({
      where: { authorId: id },
      data: { authorId: req.user.id },
    }),
    prisma.enquiryNote.updateMany({
      where: { authorId: id },
      data: { authorId: req.user.id },
    }),
    prisma.user.delete({ where: { id } }),
  ]);

  res.status(204).send();
});
