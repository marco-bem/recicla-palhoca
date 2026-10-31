import express, { type Request, type Response } from "express";
import { checkDatabase } from "./db/pool";
import { MysqlCentersRepository } from "./centers/repository";
import { authenticatedUserIdFromLocals, createCentersRouter } from "./centers/routes";
import type { AuthenticatedUserIdResolver, CentersRepository } from "./centers/types";
import { MysqlAuthRepository } from "./auth/repository";
import { createOptionalBearerAuthentication } from "./auth/middleware";
import { createAuthRouter } from "./auth/routes";
import type { AuthRepository } from "./auth/types";
import { MysqlMaterialsRepository } from "./materials/repository";
import { createMaterialsRouter } from "./materials/routes";
import type { MaterialsRepository } from "./materials/types";

export type DatabaseHealthCheck = () => Promise<void>;

export interface AppDependencies {
  centersRepository?: CentersRepository;
  authRepository?: AuthRepository;
  materialsRepository?: MaterialsRepository;
  resolveAuthenticatedUserId?: AuthenticatedUserIdResolver;
  jwtSecret?: string;
}

export function createApp(
  databaseHealthCheck: DatabaseHealthCheck = checkDatabase,
  dependencies: AppDependencies = {}
) {
  const app = express();
  const centersRepository = dependencies.centersRepository ?? new MysqlCentersRepository();
  const authRepository = dependencies.authRepository ?? new MysqlAuthRepository();
  const materialsRepository = dependencies.materialsRepository ?? new MysqlMaterialsRepository();
  const resolveAuthenticatedUserId =
    dependencies.resolveAuthenticatedUserId ?? authenticatedUserIdFromLocals;
  const getJwtSecret = () => dependencies.jwtSecret ?? process.env.AUTH_JWT_SECRET;
  const bearerAuthentication = createOptionalBearerAuthentication(authRepository, getJwtSecret);

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

  app.use("/auth", bearerAuthentication, createAuthRouter(authRepository, getJwtSecret));
  app.use("/materials", createMaterialsRouter(materialsRepository));
  app.use(
    "/centers",
    bearerAuthentication,
    createCentersRouter(centersRepository, resolveAuthenticatedUserId)
  );

  app.use((_request: Request, response: Response) => {
    response.status(404).json({
      error: "not_found",
      message: "Rota não encontrada."
    });
  });

  return app;
}
