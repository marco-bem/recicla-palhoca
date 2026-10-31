import type { Pool } from "mysql2/promise";
import { MysqlAuthRepository } from "../src/auth/repository";
import { AuthRepositoryError } from "../src/auth/types";

function createDatabaseMock() {
  return {
    execute: jest.fn()
  };
}

describe("Persistência de usuários autenticados", () => {
  it("cria usuário e converte o identificador retornado pelo MySQL", async () => {
    const db = createDatabaseMock();
    db.execute.mockResolvedValue([{ insertId: "42" }, []]);
    const repository = new MysqlAuthRepository(db as unknown as Pool);

    await expect(repository.createUser("Ana", "ana@example.com", "hash"))
      .resolves.toEqual({ id: 42, fullName: "Ana", email: "ana@example.com" });

    expect(db.execute).toHaveBeenCalledWith(
      "INSERT INTO users (full_name, email, password_hash, is_active) VALUES (?, ?, ?, TRUE)",
      ["Ana", "ana@example.com", "hash"]
    );
  });

  it("converte e-mail duplicado em erro de domínio", async () => {
    const db = createDatabaseMock();
    db.execute.mockRejectedValue({ code: "ER_DUP_ENTRY" });
    const repository = new MysqlAuthRepository(db as unknown as Pool);

    await expect(repository.createUser("Ana", "ana@example.com", "hash"))
      .rejects.toEqual(expect.objectContaining({
        name: "AuthRepositoryError",
        code: "email_already_exists"
      }));
  });

  it("propaga falha inesperada ao criar usuário", async () => {
    const db = createDatabaseMock();
    db.execute.mockRejectedValue(new Error("connection failed"));
    const repository = new MysqlAuthRepository(db as unknown as Pool);

    await expect(repository.createUser("Ana", "ana@example.com", "hash"))
      .rejects.toThrow("connection failed");
  });

  it.each([
    [true, true],
    [1, true],
    ["1", true],
    [false, false],
    [0, false],
    ["0", false],
    ["true", false]
  ])("mapeia estado ativo %s para %s", async (isActive, expected) => {
    const db = createDatabaseMock();
    db.execute.mockResolvedValue([[
      {
        id: "7",
        fullName: "Ana",
        email: "ana@example.com",
        passwordHash: "bcrypt-hash",
        isActive
      }
    ], []]);
    const repository = new MysqlAuthRepository(db as unknown as Pool);

    await expect(repository.findByEmail("ana@example.com")).resolves.toEqual({
      id: 7,
      fullName: "Ana",
      email: "ana@example.com",
      passwordHash: "bcrypt-hash",
      isActive: expected
    });
  });

  it("retorna null quando o e-mail não existe", async () => {
    const db = createDatabaseMock();
    db.execute.mockResolvedValue([[], []]);
    const repository = new MysqlAuthRepository(db as unknown as Pool);

    await expect(repository.findByEmail("ausente@example.com")).resolves.toBeNull();
  });

  it("rejeita identificador fora do intervalo ao mapear usuário por e-mail", async () => {
    const db = createDatabaseMock();
    db.execute.mockResolvedValue([[
      {
        id: "0",
        fullName: "Ana",
        email: "ana@example.com",
        passwordHash: "hash",
        isActive: 1
      }
    ], []]);
    const repository = new MysqlAuthRepository(db as unknown as Pool);

    await expect(repository.findByEmail("ana@example.com"))
      .rejects.toThrow("Identificador de usuário fora do intervalo suportado.");
  });

  it("retorna usuário ativo sem expor hash de senha", async () => {
    const db = createDatabaseMock();
    db.execute.mockResolvedValue([[
      { id: "9", fullName: "Bruno", email: "bruno@example.com" }
    ], []]);
    const repository = new MysqlAuthRepository(db as unknown as Pool);

    await expect(repository.findActiveById(9)).resolves.toEqual({
      id: 9,
      fullName: "Bruno",
      email: "bruno@example.com"
    });
    expect(db.execute).toHaveBeenCalledWith(
      "SELECT id, full_name AS fullName, email FROM users WHERE id = ? AND is_active = TRUE LIMIT 1",
      [9]
    );
  });

  it("retorna null quando o usuário não está ativo ou não existe", async () => {
    const db = createDatabaseMock();
    db.execute.mockResolvedValue([[], []]);
    const repository = new MysqlAuthRepository(db as unknown as Pool);

    await expect(repository.findActiveById(999)).resolves.toBeNull();
  });

  it("rejeita identificador inválido ao consultar usuário ativo", async () => {
    const db = createDatabaseMock();
    db.execute.mockResolvedValue([[
      { id: "9007199254740992", fullName: "Bruno", email: "bruno@example.com" }
    ], []]);
    const repository = new MysqlAuthRepository(db as unknown as Pool);

    await expect(repository.findActiveById(10))
      .rejects.toThrow("Identificador de usuário fora do intervalo suportado.");
  });
});
