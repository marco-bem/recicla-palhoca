import type { ResultSetHeader, RowDataPacket } from "mysql2";
import type { Pool } from "mysql2/promise";
import { pool } from "../db/pool";
import { AuthRepositoryError } from "./types";
import type { AuthRepository, AuthUser, StoredAuthUser } from "./types";

interface UserRow extends RowDataPacket {
  id: number | string;
  fullName: string;
  email: string;
  passwordHash: string;
  isActive: boolean | number | string;
}

function toPublicUser(row: Pick<UserRow, "id" | "fullName" | "email">): AuthUser {
  const id = Number(row.id);
  if (!Number.isSafeInteger(id) || id < 1) {
    throw new Error("Identificador de usuário fora do intervalo suportado.");
  }
  return { id, fullName: row.fullName, email: row.email };
}

function toBoolean(value: boolean | number | string): boolean {
  return value === true || value === 1 || value === "1";
}

export class MysqlAuthRepository implements AuthRepository {
  constructor(private readonly db: Pool = pool) {}

  async createUser(fullName: string, email: string, passwordHash: string): Promise<AuthUser> {
    try {
      const [result] = await this.db.execute<ResultSetHeader>(
        "INSERT INTO users (full_name, email, password_hash, is_active) VALUES (?, ?, ?, TRUE)",
        [fullName, email, passwordHash]
      );
      return { id: Number(result.insertId), fullName, email };
    } catch (error) {
      if (isDuplicateKeyError(error)) throw new AuthRepositoryError("email_already_exists");
      throw error;
    }
  }

  async findByEmail(email: string): Promise<StoredAuthUser | null> {
    const [rows] = await this.db.execute<UserRow[]>(
      "SELECT id, full_name AS fullName, email, password_hash AS passwordHash, is_active AS isActive " +
      "FROM users WHERE email = ? LIMIT 1",
      [email]
    );
    const row = rows[0];
    if (!row) return null;

    return {
      ...toPublicUser(row),
      passwordHash: row.passwordHash,
      isActive: toBoolean(row.isActive)
    };
  }

  async findActiveById(id: number): Promise<AuthUser | null> {
    const [rows] = await this.db.execute<UserRow[]>(
      "SELECT id, full_name AS fullName, email FROM users WHERE id = ? AND is_active = TRUE LIMIT 1",
      [id]
    );
    const row = rows[0];
    return row ? toPublicUser(row) : null;
  }
}

function isDuplicateKeyError(error: unknown): boolean {
  if (typeof error !== "object" || error === null || !("code" in error)) return false;
  return (error as { code?: unknown }).code === "ER_DUP_ENTRY";
}
