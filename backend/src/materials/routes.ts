import { Router, type Request, type Response } from "express";
import type { MaterialsRepository } from "./types";

export function createMaterialsRouter(repository: MaterialsRepository): Router {
  const router = Router();

  router.get("/", async (_request: Request, response: Response) => {
    try {
      const data = await repository.listActive();
      response.status(200).json({ data });
    } catch {
      response.status(500).json({
        error: "internal_error",
        message: "Não foi possível consultar o catálogo de materiais."
      });
    }
  });

  return router;
}
