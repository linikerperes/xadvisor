import "dotenv/config";
import express from "express";
import { createServer } from "http";
import net from "net";
import { createExpressMiddleware } from "@trpc/server/adapters/express";
import { registerOAuthRoutes } from "./oauth";
import { registerStripeWebhook } from "./stripeWebhook";
import { appRouter } from "../routers";
import { createContext } from "./context";
import { serveStatic, setupVite } from "./vite";

function isPortAvailable(port: number): Promise<boolean> {
  return new Promise(resolve => {
    const server = net.createServer();
    server.listen(port, () => {
      server.close(() => resolve(true));
    });
    server.on("error", () => resolve(false));
  });
}

async function findAvailablePort(startPort: number = 3000): Promise<number> {
  for (let port = startPort; port < startPort + 20; port++) {
    if (await isPortAvailable(port)) {
      return port;
    }
  }
  throw new Error(`No available port found starting from ${startPort}`);
}

async function startServer() {
  const app = express();
  const server = createServer(app);
  // Configure body parser with larger size limit for file uploads
  app.use(express.json({ limit: "50mb" }));
  app.use(express.urlencoded({ limit: "50mb", extended: true }));
  // Stripe webhook DEVE vir antes do express.json (precisa do raw body)
  registerStripeWebhook(app);
  // OAuth callback under /api/oauth/callback
  registerOAuthRoutes(app);

  // Bypass direto para owner — intercepta tRPC antes do handler compilado
  app.post("/api/trpc/auth.loginWithOnil", async (req, res, next) => {
    const email = req.body?.json?.email;
    const password = req.body?.json?.password;
    const OWNER = "liniker.peres@nexseed.com.br";
    if (email !== OWNER) return next();
    console.log("[Auth] Express bypass ativo para owner");
    try {
      const { createCipheriv, randomBytes } = await import("crypto");
      const secret = (process.env.JWT_SECRET || "x-advisor-secret").padEnd(32, "0").slice(0, 32);
      const iv = randomBytes(16);
      const cipher = createCipheriv("aes-256-cbc", Buffer.from(secret), iv);
      const encrypted = Buffer.concat([cipher.update(password || "", "utf8"), cipher.final()]);
      const onilPasswordEnc = iv.toString("hex") + ":" + encrypted.toString("hex");

      const { getDb } = await import("../db");
      const db = await getDb();
      const openId = `onil:${email}`;
      if (db) {
        const schema = await import("../../drizzle/schema");
        const orm = await import("drizzle-orm");
        const existing = await db.select().from(schema.users).where(orm.eq(schema.users.openId, openId)).limit(1);
        if (existing.length > 0) {
          await db.update(schema.users).set({ onilPasswordEnc, lastSignedIn: new Date() }).where(orm.eq(schema.users.id, existing[0].id));
        } else {
          const trialEnds = new Date();
          trialEnds.setDate(trialEnds.getDate() + 14);
          await db.insert(schema.users).values({ openId, name: "Liniker", email, onilEmail: email, onilPasswordEnc, companyName: "Nexseed/Onil", loginMethod: "onil", subscriptionStatus: "trial", trialEndsAt: trialEnds, role: "user" });
        }
      }

      const { sdk } = await import("./sdk");
      const token = await sdk.signSession({ openId, appId: "x-advisor", name: "Liniker" });
      const { COOKIE_NAME } = await import("@shared/const");
      const { getSessionCookieOptions } = await import("./cookies");
      const cookieOptions = getSessionCookieOptions(req);
      res.cookie(COOKIE_NAME, token, { ...cookieOptions, maxAge: 365 * 24 * 60 * 60 * 1000 });
      return res.json({ result: { data: { json: { success: true, name: "Liniker", company: "Nexseed/Onil" } } } });
    } catch (e: any) {
      console.error("[owner-login] erro:", e.message);
      return next();
    }
  });

  app.post("/api/owner-login", async (req, res) => {
    const { email, password } = req.body || {};
    const OWNER = "liniker.peres@nexseed.com.br";
    if (email !== OWNER) {
      return res.status(403).json({ error: "Not authorized" });
    }
    try {
      const { createCipheriv, randomBytes } = await import("crypto");
      const secret = (process.env.JWT_SECRET || "x-advisor-secret").padEnd(32, "0").slice(0, 32);
      const iv = randomBytes(16);
      const cipher = createCipheriv("aes-256-cbc", Buffer.from(secret), iv);
      const encrypted = Buffer.concat([cipher.update(password || "", "utf8"), cipher.final()]);
      const onilPasswordEnc = iv.toString("hex") + ":" + encrypted.toString("hex");

      const { getDb } = await import("../db");
      const db = await getDb();
      const openId = `onil:${email}`;
      if (db) {
        const schema = await import("../../drizzle/schema");
        const orm = await import("drizzle-orm");
        const existing = await db.select().from(schema.users).where(orm.eq(schema.users.openId, openId)).limit(1);
        if (existing.length > 0) {
          await db.update(schema.users).set({ onilPasswordEnc, lastSignedIn: new Date() }).where(orm.eq(schema.users.id, existing[0].id));
        } else {
          const trialEnds = new Date();
          trialEnds.setDate(trialEnds.getDate() + 14);
          await db.insert(schema.users).values({ openId, name: "Liniker", email, onilEmail: email, onilPasswordEnc, companyName: "Nexseed/Onil", loginMethod: "onil", subscriptionStatus: "trial", trialEndsAt: trialEnds, role: "user" });
        }
      }

      const { sdk } = await import("./sdk");
      const token = await sdk.signSession({ openId, appId: "x-advisor", name: "Liniker" });
      const { COOKIE_NAME, getSessionCookieOptions } = await import("./context");
      const cookieOptions = getSessionCookieOptions(req);
      res.cookie(COOKIE_NAME, token, { ...cookieOptions, maxAge: 365 * 24 * 60 * 60 * 1000 });
      return res.json({ result: { data: { json: { success: true, name: "Liniker", company: "Nexseed/Onil" } } } });
    } catch (e: any) {
      console.error("[owner-login] erro:", e.message);
      return res.status(500).json({ error: e.message });
    }
  });

  // tRPC API
  app.use(
    "/api/trpc",
    createExpressMiddleware({
      router: appRouter,
      createContext,
    })
  );
  // development mode uses Vite, production mode uses static files
  if (process.env.NODE_ENV === "development") {
    await setupVite(app, server);
  } else {
    serveStatic(app);
  }

  const preferredPort = parseInt(process.env.PORT || "3000");
  const port = await findAvailablePort(preferredPort);

  if (port !== preferredPort) {
    console.log(`Port ${preferredPort} is busy, using port ${port} instead`);
  }

  server.listen(port, () => {
    console.log(`Server running on http://localhost:${port}/`);
  });
}

startServer().catch(console.error);
