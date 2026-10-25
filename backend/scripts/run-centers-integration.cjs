const path = require("node:path");
const { spawnSync } = require("node:child_process");
const dotenv = require("dotenv");

const repositoryRoot = path.resolve(__dirname, "../..");
const environmentFile = path.join(repositoryRoot, "infra", "docker", ".env");
const result = dotenv.config({ path: environmentFile });

if (result.error) {
  console.error("Não foi possível ler infra/docker/.env. Configure o ambiente Docker antes do teste.");
  process.exit(1);
}

const settings = result.parsed || {};
const env = {
  ...process.env,
  RUN_MYSQL_INTEGRATION: "1",
  DB_HOST: "127.0.0.1",
  DB_PORT: settings.MYSQL_PORT || "3307",
  DB_NAME: settings.MYSQL_DATABASE || "recicla_palhoca",
  DB_USER: settings.MYSQL_USER || "recicla_app",
  DB_PASSWORD: settings.MYSQL_PASSWORD || ""
};

const jestCli = path.join(repositoryRoot, "backend", "node_modules", "jest", "bin", "jest.js");
const run = spawnSync(
  process.execPath,
  [jestCli, "--runInBand", "--runTestsByPath", "tests/centers.repository.integration.test.ts"],
  {
    cwd: path.join(repositoryRoot, "backend"),
    env,
    stdio: "inherit"
  }
);

if (run.error) {
  console.error("Não foi possível iniciar o teste de integração.");
  process.exit(1);
}
process.exit(run.status === null ? 1 : run.status);
