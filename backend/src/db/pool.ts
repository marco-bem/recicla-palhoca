import mysql from "mysql2/promise";

const port = Number(process.env.DB_PORT ?? 3307);
const connectionLimit = Number(process.env.DB_CONNECTION_LIMIT ?? 10);

export const pool = mysql.createPool({
  host: process.env.DB_HOST ?? "127.0.0.1",
  port,
  database: process.env.DB_NAME ?? "recicla_palhoca",
  user: process.env.DB_USER ?? "recicla_app",
  password: process.env.DB_PASSWORD ?? "",
  waitForConnections: true,
  connectionLimit,
  queueLimit: 0,
  enableKeepAlive: true
});

export async function checkDatabase(): Promise<void> {
  const [rows] = await pool.query<Array<{ result: number }>>("SELECT 1 AS result");
  if (!Array.isArray(rows) || rows.length !== 1 || Number(rows[0].result) !== 1) {
    throw new Error("A consulta de verificação do MySQL não retornou o resultado esperado.");
  }
}

export async function closeDatabasePool(): Promise<void> {
  await pool.end();
}
