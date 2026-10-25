import jwt, { type JwtPayload, type SignOptions } from "jsonwebtoken";

const TOKEN_ISSUER = "recicla-palhoca-api";
const TOKEN_AUDIENCE = "recicla-palhoca-mobile";
const TOKEN_TTL_SECONDS = 60 * 60;

export function isJwtSecretConfigured(secret: string | undefined): secret is string {
  return typeof secret === "string" && Buffer.byteLength(secret, "utf8") >= 32;
}

export function issueAccessToken(userId: number, secret: string): string {
  if (!Number.isSafeInteger(userId) || userId < 1) {
    throw new Error("Identificador de usuário inválido para emissão de token.");
  }
  if (!isJwtSecretConfigured(secret)) {
    throw new Error("AUTH_JWT_SECRET não configurada com pelo menos 32 bytes.");
  }

  const options: SignOptions = {
    algorithm: "HS256",
    subject: String(userId),
    issuer: TOKEN_ISSUER,
    audience: TOKEN_AUDIENCE,
    expiresIn: TOKEN_TTL_SECONDS
  };
  return jwt.sign({}, secret, options);
}

export function verifyAccessToken(
  token: string,
  secret: string
): number | null {
  try {
    const payload = jwt.verify(token, secret, {
      algorithms: ["HS256"],
      issuer: TOKEN_ISSUER,
      audience: TOKEN_AUDIENCE
    }) as JwtPayload;

    if (typeof payload.sub !== "string" || !/^[1-9]\d*$/.test(payload.sub)) {
      return null;
    }
    const id = Number(payload.sub);
    return Number.isSafeInteger(id) ? id : null;
  } catch {
    return null;
  }
}

export const ACCESS_TOKEN_TTL_SECONDS = TOKEN_TTL_SECONDS;
