import { Router } from "express";
import type { CollectionRequestsRepository } from "./repository";
import { parseCollectionRequest } from "./validation";

export function createCollectionRequestsRouter(repository: CollectionRequestsRepository) {
  const router = Router();

  router.post("/", async (request, response) => {
    response.set("Cache-Control", "no-store");
    let input: ReturnType<typeof parseCollectionRequest>;
    try {
      input = parseCollectionRequest(request.body);
    } catch (error) {
      response.status(400).json({
        error: "invalid_request",
        message: error instanceof Error ? error.message : "Confira os dados da coleta."
      });
      return;
    }

    try {
      const result = await repository.create(input);
      if (result.outcome === "created") {
        response.status(201).json({ data: { protocol: result.protocol, status: result.status } });
        return;
      }
      response.status(409).json({
        error: result.outcome,
        message: result.outcome === "center_unavailable"
          ? "Este centro não está disponível para coleta."
          : "Um ou mais materiais selecionados deixaram de estar disponíveis para este centro."
      });
    } catch {
      response.status(500).json({
        error: "collection_request_failed",
        message: "Não foi possível confirmar o registro da solicitação."
      });
    }
  });

  return router;
}
