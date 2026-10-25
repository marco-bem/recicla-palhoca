import "dotenv/config";
import { createApp } from "./app";
import { closeDatabasePool } from "./db/pool";

const port = Number(process.env.PORT ?? 3000);
const host = process.env.HOST ?? "0.0.0.0";

if (!Number.isInteger(port) || port < 1 || port > 65535) {
  throw new Error("PORT deve ser um número inteiro entre 1 e 65535.");
}

const app = createApp();
const server = app.listen(port, host, () => {
  console.log(`Recicla Palhoça API disponível em http://${host}:${port}`);
});

let shuttingDown = false;

function shutdown(signal: string): void {
  if (shuttingDown) return;
  shuttingDown = true;
  console.log(`Sinal ${signal} recebido; encerrando API.`);

  server.close(() => {
    void closeDatabasePool()
      .then(() => {
        process.exitCode = 0;
      })
      .catch((error: unknown) => {
        console.error("Falha ao encerrar o pool MySQL.", error);
        process.exitCode = 1;
      });
  });
}

process.once("SIGINT", () => shutdown("SIGINT"));
process.once("SIGTERM", () => shutdown("SIGTERM"));
