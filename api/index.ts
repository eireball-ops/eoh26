import type { IncomingMessage, ServerResponse } from "http";
import type { Express } from "express";
import { createApp } from "../server/app";

let cachedApp: Express | null = null;

async function getApp() {
  if (!cachedApp) {
    const { app } = await createApp();
    cachedApp = app;
  }

  return cachedApp;
}

export default async function handler(
  req: IncomingMessage,
  res: ServerResponse,
) {
  const app = await getApp();
  return app(req as any, res as any);
}
