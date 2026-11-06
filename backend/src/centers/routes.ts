import { Router, type Request, type Response } from "express";
import { CenterRepositoryError, type CenterRepositoryErrorCode } from "./repository";
import type { AuthenticatedUserIdResolver, CentersRepository } from "./types";
import { parseCenterFilters, parseCenterId, parseCenterInput } from "./validation";

export function authenticatedUserIdFromLocals(
  _request: Request,
  response: Response
): number | null {
  const value: unknown = response.locals.authenticatedUserId;
  return typeof value === "number" && Number.isSafeInteger(value) && value > 0
    ? value
    : null;
}

export function createCentersRouter(
  repository: CentersRepository,
  resolveAuthenticatedUserId: AuthenticatedUserIdResolver = authenticatedUserIdFromLocals
): Router {
  const router = Router();

  router.get("/", async (request: Request, response: Response) => {
    const parsed = parseCenterFilters(request.query);
    if (!parsed.ok) {
      response.status(400).json({ error: "validation_error", message: parsed.error });
      return;
    }

    try {
      const data = await repository.listPublic(parsed.value);
      response.status(200).json({ data });
    } catch {
      response.status(500).json({
        error: "internal_error",
        message: "Não foi possível consultar os centros."
      });
    }
  });

  router.get("/me", async (request: Request, response: Response) => {
    response.set("Cache-Control", "no-store");
    const userId = resolveAuthenticatedUserId(request, response);
    if (!userId) {
      response.status(401).json({ error: "unauthorized", message: "Autenticação do responsável é necessária." });
      return;
    }
    try {
      response.json({ data: await repository.findForUser(userId) });
    } catch {
      response.status(500).json({ error: "internal_error", message: "Não foi possível consultar seu centro." });
    }
  });

  router.get("/:id", async (request: Request, response: Response) => {
    const parsedId = parseCenterId(request.params.id);
    if (!parsedId.ok) {
      response.status(400).json({ error: "validation_error", message: parsedId.error });
      return;
    }

    try {
      const data = await repository.findPublicById(parsedId.value);
      if (!data) {
        response.status(404).json({
          error: "not_found",
          message: "Centro não encontrado."
        });
        return;
      }
      response.status(200).json({ data });
    } catch {
      response.status(500).json({
        error: "internal_error",
        message: "Não foi possível consultar o centro."
      });
    }
  });

  router.post("/", async (request: Request, response: Response) => {
    const userId = resolveAuthenticatedUserId(request, response);
    if (!userId) {
      response.status(401).json({
        error: "unauthorized",
        message: "Autenticação do responsável é necessária para cadastrar um centro."
      });
      return;
    }

    const parsed = parseCenterInput(request.body);
    if (!parsed.ok) {
      response.status(400).json({ error: "validation_error", message: parsed.error });
      return;
    }

    try {
      const data = await repository.createForUser(userId, parsed.value);
      response.status(201).json({ data });
    } catch (error) {
      sendWriteError(response, error);
    }
  });

  router.put("/:id", async (request: Request, response: Response) => {
    const userId = resolveAuthenticatedUserId(request, response);
    if (!userId) {
      response.status(401).json({
        error: "unauthorized",
        message: "Autenticação do responsável é necessária para alterar um centro."
      });
      return;
    }

    const parsedId = parseCenterId(request.params.id);
    if (!parsedId.ok) {
      response.status(400).json({ error: "validation_error", message: parsedId.error });
      return;
    }
    const parsed = parseCenterInput(request.body);
    if (!parsed.ok) {
      response.status(400).json({ error: "validation_error", message: parsed.error });
      return;
    }

    try {
      const data = await repository.updateForUser(userId, parsedId.value, parsed.value);
      if (!data) {
        response.status(404).json({
          error: "not_found",
          message: "Centro não encontrado para este responsável."
        });
        return;
      }
      response.status(200).json({ data });
    } catch (error) {
      sendWriteError(response, error);
    }
  });

  router.delete("/:id", async (request: Request, response: Response) => {
    const userId = resolveAuthenticatedUserId(request, response);
    if (!userId) {
      response.status(401).json({
        error: "unauthorized",
        message: "Autenticação do responsável é necessária para desativar um centro."
      });
      return;
    }

    const parsedId = parseCenterId(request.params.id);
    if (!parsedId.ok) {
      response.status(400).json({ error: "validation_error", message: parsedId.error });
      return;
    }

    try {
      const deactivated = await repository.deactivateForUser(userId, parsedId.value);
      if (!deactivated) {
        response.status(404).json({
          error: "not_found",
          message: "Centro não encontrado para este responsável."
        });
        return;
      }
      response.status(204).send();
    } catch {
      response.status(500).json({
        error: "internal_error",
        message: "Não foi possível desativar o centro."
      });
    }
  });

  return router;
}

function sendWriteError(response: Response, error: unknown): void {
  if (error instanceof CenterRepositoryError) {
    const statusByCode: Record<CenterRepositoryErrorCode, number> = {
      responsible_not_active: 403,
      center_already_exists: 409,
      invalid_materials: 400
    };
    const messageByCode: Record<CenterRepositoryErrorCode, string> = {
      responsible_not_active: "O responsável não está ativo ou não existe.",
      center_already_exists: "Este responsável já possui um centro cadastrado.",
      invalid_materials: "Um ou mais materiais não existem ou estão inativos."
    };
    response.status(statusByCode[error.code]).json({
      error: error.code,
      message: messageByCode[error.code]
    });
    return;
  }

  response.status(500).json({
    error: "internal_error",
    message: "Não foi possível salvar o centro."
  });
}
