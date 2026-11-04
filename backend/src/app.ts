import express, { type Request, type Response } from "express";
import path from "node:path";
import swaggerUi from "swagger-ui-express";
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

import {
  MysqlCollectionRequestsRepository,
  type CollectionRequestsRepository
} from "./collection-requests/repository";
import { createCollectionRequestsRouter } from "./collection-requests/routes";

import { createCollectionManagementRouter } from "./collection-requests/management";

export type DatabaseHealthCheck = () => Promise<void>;

export interface AppDependencies {
  centersRepository?: CentersRepository;
  authRepository?: AuthRepository;
  materialsRepository?: MaterialsRepository;
  collectionRequestsRepository?: CollectionRequestsRepository;
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

  const allowedOrigins = new Set(
    (process.env.APP_WEB_ORIGINS ??
      "http://localhost:8081,http://127.0.0.1:8081")
      .split(",")
      .map((origin) => origin.trim())
      .filter(Boolean)
  );

  app.use((request: Request, response: Response, next) => {
    const origin = request.header("origin");

    if (origin && allowedOrigins.has(origin)) {
      response.setHeader("Access-Control-Allow-Origin", origin);
      response.setHeader("Vary", "Origin");
      response.setHeader(
        "Access-Control-Allow-Methods",
        "GET, HEAD, POST, PUT, PATCH, DELETE, OPTIONS"
      );
      response.setHeader(
        "Access-Control-Allow-Headers",
        "Content-Type, Authorization"
      );
    }

    if (request.method === "OPTIONS") {
      response.status(204).end();
      return;
    }

    next();
  });

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

  const openApiFile = path.resolve(__dirname, "../openapi.yaml");

  app.get("/openapi.yaml", (_request: Request, response: Response) => {
    response.type("text/yaml");
    response.sendFile(openApiFile, (error) => {
      if (error && !response.headersSent) {
        response.status(500).json({
          error: "documentation_unavailable",
          message: "Não foi possível carregar a especificação da API."
        });
      }
    });
  });

  app.use(
    "/docs",
    swaggerUi.serve,
    swaggerUi.setup(null, {
      customSiteTitle: "Recicla Palhoça — Documentação da API",
      swaggerOptions: {
        url: "/openapi.yaml",
        validatorUrl: null,
        persistAuthorization: true
      }
    })
  );

  app.use("/auth", bearerAuthentication, createAuthRouter(authRepository, getJwtSecret));
  app.use("/center-collection-requests", bearerAuthentication, createCollectionManagementRouter());
  app.use("/materials", createMaterialsRouter(materialsRepository));
  app.use(
    "/collection-requests",
    createCollectionRequestsRouter(
      dependencies.collectionRequestsRepository ?? new MysqlCollectionRequestsRepository()
    )
  );
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
