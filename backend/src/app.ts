import express, { type Request, type Response } from "express";
import { checkDatabase } from "./db/pool";

export type DatabaseHealthCheck = () => Promise<void>;

export function createApp(databaseHealthCheck: DatabaseHealthCheck = checkDatabase) {
  const app = express();

  app.disable("x-powered-by");
  app.use(express.json({ limit: "100kb" }));

  app.get("/health/live", (_request: Request, response: Response) => {
    response.status(200).json({
      status: "ok",
      service: "recicla-palhoca-api"
    });
  });

  app.get("/health", async (_request: Request, response: Response) => {
    try {
      await databaseHealthCheck();
      response.status(200).json({
        status: "ok",
        service: "recicla-palhoca-api",
        database: "connected"
      });
    } catch {
      response.status(503).json({
        status: "error",
        service: "recicla-palhoca-api",
        database: "unavailable"
      });
    }
  });

  app.use((_request: Request, response: Response) => {
    response.status(404).json({
      error: "not_found",
      message: "Rota não encontrada."
    });
  });

  return app;
}
