import { Router, type Request, type Response } from "express";
import bcrypt from "bcryptjs";
import type { AuthRepository } from "./types";
import { AuthRepositoryError } from "./types";
import { ACCESS_TOKEN_TTL_SECONDS, isJwtSecretConfigured, issueAccessToken } from "./token";

const BCRYPT_ROUNDS = 12;

interface RegisterInput {
  fullName: string;
  email: string;
  password: string;
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}

function parseRegisterInput(value: unknown): RegisterInput | null {
  if (!isRecord(value)) return null;
  const fullName = value.fullName;
  const emailValue = value.email;
  const password = value.password;

  if (typeof fullName !== "string" || typeof emailValue !== "string" || typeof password !== "string") {
    return null;
  }

  const normalizedName = fullName.trim();
  const email = emailValue.trim().toLowerCase();
  if (normalizedName.length < 2 || normalizedName.length > 120) return null;
  if (email.length > 191 || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) return null;
  if (password.length < 10 || password.length > 128) return null;
  if (Buffer.byteLength(password, "utf8") > 72) return null;

  return { fullName: normalizedName, email, password };
}

function parseLoginInput(value: unknown): { email: string; password: string } | null {
  if (!isRecord(value) || typeof value.email !== "string" || typeof value.password !== "string") {
    return null;
  }
  const email = value.email.trim().toLowerCase();
  const password = value.password;
  if (!email || email.length > 191 || !password || Buffer.byteLength(password, "utf8") > 72) {
    return null;
  }
  return { email, password };
}

function publicConfigurationError(response: Response): void {
  response.status(503).json({
    error: "authentication_not_configured",
    message: "A autenticação não está configurada neste ambiente."
  });
}

export function createAuthRouter(
  repository: AuthRepository,
  getSecret: () => string | undefined
): Router {
  const router = Router();

  router.post("/register", async (request: Request, response: Response) => {
    const input = parseRegisterInput(request.body);
    if (!input) {
      response.status(400).json({
        error: "validation_error",
        message: "Informe nome válido, e-mail válido e senha com pelo menos 10 caracteres."
      });
      return;
    }

    const secret = getSecret();
    if (!isJwtSecretConfigured(secret)) {
      publicConfigurationError(response);
      return;
    }

    try {
      const passwordHash = await bcrypt.hash(input.password, BCRYPT_ROUNDS);
      const user = await repository.createUser(input.fullName, input.email, passwordHash);
      const token = issueAccessToken(user.id, secret);

      response.status(201).json({
        data: user,
        token,
        tokenType: "Bearer",
        expiresIn: ACCESS_TOKEN_TTL_SECONDS
      });
    } catch (error) {
      if (error instanceof AuthRepositoryError && error.code === "email_already_exists") {
        response.status(409).json({
          error: "email_already_exists",
          message: "Já existe uma conta com este e-mail."
        });
        return;
      }

      response.status(500).json({
        error: "internal_error",
        message: "Não foi possível criar a conta."
      });
    }
  });

  router.post("/login", async (request: Request, response: Response) => {
    const input = parseLoginInput(request.body);
    if (!input) {
      response.status(400).json({
        error: "validation_error",
        message: "Informe e-mail e senha."
      });
      return;
    }

    const secret = getSecret();
    if (!isJwtSecretConfigured(secret)) {
      publicConfigurationError(response);
      return;
    }

    try {
      const user = await repository.findByEmail(input.email);
      const passwordMatches = user?.isActive
        ? await bcrypt.compare(input.password, user.passwordHash)
        : false;

      if (!user || !user.isActive || !passwordMatches) {
        response.status(401).json({
          error: "invalid_credentials",
          message: "E-mail ou senha inválidos."
        });
        return;
      }

      const token = issueAccessToken(user.id, secret);
      response.status(200).json({
        data: { id: user.id, fullName: user.fullName, email: user.email },
        token,
        tokenType: "Bearer",
        expiresIn: ACCESS_TOKEN_TTL_SECONDS
      });
    } catch {
      response.status(500).json({
        error: "internal_error",
        message: "Não foi possível autenticar neste momento."
      });
    }
  });

  router.get("/me", (request: Request, response: Response) => {
    const user = response.locals.authenticatedUser as
      | { id: number; fullName: string; email: string }
      | undefined;

    if (!user) {
      response.status(401).json({
        error: "unauthorized",
        message: "Autenticação do responsável é necessária."
      });
      return;
    }

    response.status(200).json({ data: user });
  });

  return router;
}
