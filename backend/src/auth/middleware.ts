import type { NextFunction, Request, Response } from "express";
import type { AuthRepository } from "./types";
import { isJwtSecretConfigured, verifyAccessToken } from "./token";

export function createOptionalBearerAuthentication(
  repository: AuthRepository,
  getSecret: () => string | undefined
) {
  return async (request: Request, response: Response, next: NextFunction): Promise<void> => {
    const authorization = request.header("authorization");
    if (!authorization) {
      next();
      return;
    }

    const match = /^Bearer ([^\s]+)$/i.exec(authorization);
    if (!match) {
      response.status(401).json({
        error: "unauthorized",
        message: "Token de autenticação inválido."
      });
      return;
    }

    const secret = getSecret();
    if (!isJwtSecretConfigured(secret)) {
      response.status(503).json({
        error: "authentication_not_configured",
        message: "A autenticação não está configurada neste ambiente."
      });
      return;
    }

    const userId = verifyAccessToken(match[1], secret);
    if (!userId) {
      response.status(401).json({
        error: "unauthorized",
        message: "Token de autenticação inválido ou expirado."
      });
      return;
    }

    try {
      const user = await repository.findActiveById(userId);
      if (!user) {
        response.status(401).json({
          error: "unauthorized",
          message: "Token de autenticação inválido ou expirado."
        });
        return;
      }

      response.locals.authenticatedUserId = user.id;
      response.locals.authenticatedUser = user;
      next();
    } catch {
      response.status(503).json({
        error: "authentication_unavailable",
        message: "Não foi possível validar a autenticação neste momento."
      });
    }
  };
}
