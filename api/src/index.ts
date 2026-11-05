import express from "express";
import cors from "cors";
import helmet from "helmet";
import { pinoHttp } from "pino-http";
import { toNodeHandler } from "better-auth/node";
import { auth } from "./auth.js";
import { env } from "./env.js";
import { errorHandler } from "./lib/http.js";
import { logger } from "./lib/logger.js";
import { uploadsDir } from "./lib/uploads.js";
import { adminRouter } from "./routes/admin/index.js";
import { publicRouter } from "./routes/public.js";

const app = express();

app.set("trust proxy", 1);

app.use(
  helmet({
    crossOriginResourcePolicy: { policy: "cross-origin" },
  }),
);
app.use(
  cors({
    origin: env.WEB_ORIGIN,
    credentials: true,
  }),
);
app.use(pinoHttp({ logger }));

app.all("/api/auth/*splat", toNodeHandler(auth));

app.use(express.json({ limit: "1mb" }));

app.use(
  "/uploads",
  express.static(uploadsDir, {
    maxAge: "1h",
    index: false,
  }),
);

app.get("/health", (_req, res) => {
  res.json({ ok: true, service: "khanya-api" });
});

app.use("/api/public", publicRouter);
app.use("/api/admin", adminRouter);

app.use((_req, res) => {
  res.status(404).json({
    error: { code: "NOT_FOUND", message: "That endpoint does not exist." },
  });
});

app.use(errorHandler);

app.listen(env.API_PORT, () => {
  logger.info(
    { port: env.API_PORT, web: env.WEB_ORIGIN },
    "Khanya API listening",
  );
});
