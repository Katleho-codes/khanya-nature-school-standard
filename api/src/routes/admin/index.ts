import { Router } from "express";
import {
  requireAdmin,
  requireAuth,
  requireEditorOrAdmin,
} from "../../middleware/auth.js";
import { albumsRouter } from "./albums.js";
import { branchesRouter } from "./branches.js";
import { dashboardRouter } from "./dashboard.js";
import { documentsRouter } from "./documents.js";
import { enquiriesRouter } from "./enquiries.js";
import { eventsRouter } from "./events.js";
import { mediaRouter } from "./media.js";
import { outboxRouter } from "./outbox.js";
import { postsRouter } from "./posts.js";
import { programmesRouter } from "./programmes.js";
import { settingsRouter } from "./settings.js";
import { usersRouter } from "./users.js";

export const adminRouter = Router();

adminRouter.use(requireAuth);
adminRouter.use(requireEditorOrAdmin);

adminRouter.get("/me", (req, res) => {
  res.json({ user: req.user });
});

adminRouter.use("/dashboard", dashboardRouter);
adminRouter.use("/branches", branchesRouter);
adminRouter.use("/programmes", programmesRouter);
adminRouter.use("/posts", postsRouter);
adminRouter.use("/events", eventsRouter);
adminRouter.use("/albums", albumsRouter);
adminRouter.use("/documents", documentsRouter);
adminRouter.use("/media", mediaRouter);
adminRouter.use("/enquiries", enquiriesRouter);
adminRouter.use("/outbox", outboxRouter);

adminRouter.use("/users", requireAdmin, usersRouter);
adminRouter.use("/settings", requireAdmin, settingsRouter);
