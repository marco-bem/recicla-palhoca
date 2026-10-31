const path = require("node:path");
const { randomUUID } = require("node:crypto");
const dotenv = require("dotenv");
const mysql = require("mysql2/promise");

const repositoryRoot = path.resolve(__dirname, "../..");
const environmentFile = path.join(repositoryRoot, "infra", "docker", ".env");
const loaded = dotenv.config({ path: environmentFile });

if (loaded.error) {
  console.error("Não foi possível carregar infra/docker/.env. Configure o ambiente Docker antes do teste.");
  process.exit(1);
}

const settings = loaded.parsed || {};
const required = ["MYSQL_USER", "MYSQL_PASSWORD"];
for (const key of required) {
  if (!settings[key]) {
    console.error("A variável obrigatória " + key + " não está definida em infra/docker/.env.");
    process.exit(1);
  }
}

const apiPort = Number(settings.API_PORT || 3000);
const baseUrl = "http://127.0.0.1:" + apiPort;
const db = mysql.createPool({
  host: "127.0.0.1",
  port: Number(settings.MYSQL_PORT || 3307),
  user: settings.MYSQL_USER,
  password: settings.MYSQL_PASSWORD,
  database: settings.MYSQL_DATABASE || "recicla_palhoca",
  waitForConnections: true,
  connectionLimit: 2
});

function assertStatus(result, expected, label) {
  if (result.status !== expected) {
    const detail = result.body && result.body.message
      ? " — " + result.body.message
      : "";
    throw new Error(label + ": esperado HTTP " + expected + ", recebido HTTP " + result.status + detail);
  }
}

async function callApi(endpoint, method, token, body) {
  const headers = {};
  if (body !== undefined) headers["Content-Type"] = "application/json";
  if (token) headers.Authorization = "Bearer " + token;

  const response = await fetch(baseUrl + endpoint, {
    method,
    headers,
    body: body === undefined ? undefined : JSON.stringify(body)
  });
  const text = await response.text();
  let parsed = null;
  if (text) {
    try {
      parsed = JSON.parse(text);
    } catch {
      parsed = { raw: text.slice(0, 300) };
    }
  }
  return { status: response.status, body: parsed };
}

async function cleanupByEmail(email) {
  const connection = await db.getConnection();
  try {
    await connection.beginTransaction();
    const [users] = await connection.execute(
      "SELECT id FROM users WHERE email = ? LIMIT 1 FOR UPDATE",
      [email]
    );

    for (const user of users) {
      const userId = Number(user.id);
      const [centers] = await connection.execute(
        "SELECT id FROM recycling_centers WHERE responsible_user_id = ? FOR UPDATE",
        [userId]
      );

      for (const center of centers) {
        const centerId = Number(center.id);
        const [requests] = await connection.execute(
          "SELECT COUNT(*) AS total FROM collection_requests WHERE center_id = ?",
          [centerId]
        );
        if (Number(requests[0].total) > 0) {
          throw new Error("O centro temporário possui solicitações vinculadas; a limpeza física foi interrompida para preservar o histórico.");
        }

        await connection.execute("DELETE FROM center_opening_hours WHERE center_id = ?", [centerId]);
        await connection.execute("DELETE FROM center_materials WHERE center_id = ?", [centerId]);
        await connection.execute("DELETE FROM recycling_centers WHERE id = ?", [centerId]);
      }

      await connection.execute("DELETE FROM users WHERE id = ?", [userId]);
    }

    await connection.commit();
    return users.length;
  } catch (error) {
    await connection.rollback();
    throw error;
  } finally {
    connection.release();
  }
}

async function main() {
  const unique = randomUUID();
  const email = "http-centers-" + unique + "@example.invalid";
  const password = "Test-" + randomUUID() + "-Only";
  const originalName = "Centro HTTP de Integração " + unique.slice(0, 8);
  const updatedName = originalName + " Atualizado";

  let registered = false;
  let completed = false;

  try {
    const [materials] = await db.execute(
      "SELECT id FROM materials WHERE is_active = TRUE ORDER BY id LIMIT 1"
    );
    if (materials.length === 0) {
      throw new Error("Não há material ativo no catálogo para executar o teste.");
    }
    const materialId = Number(materials[0].id);

    const health = await callApi("/health", "GET");
    assertStatus(health, 200, "Health da API");
    if (!health.body || health.body.database !== "connected") {
      throw new Error("A API respondeu, mas não confirmou conexão com o MySQL.");
    }
    console.log("PASS — API e MySQL conectados (HTTP 200)");

    const register = await callApi("/auth/register", "POST", null, {
      fullName: "Responsável Temporário de Integração",
      email,
      password
    });
    assertStatus(register, 201, "Cadastro de responsável");
    registered = true;
    const token = register.body && register.body.token;
    if (!token || !register.body.data || !register.body.data.id) {
      throw new Error("O cadastro não retornou usuário e token Bearer.");
    }
    console.log("PASS — cadastro de responsável (HTTP 201)");

    const centerInput = {
      name: originalName,
      publicPhone: "00000000000",
      postalCode: "88130000",
      street: "Rua de Teste de Integração",
      streetNumber: "9999",
      addressComplement: null,
      neighborhood: "Bairro de Teste",
      city: "Palhoça",
      state: "SC",
      latitude: -27.6000000,
      longitude: -48.7000000,
      acceptsDropoff: true,
      offersPickup: true,
      openingHours: [
        { dayOfWeek: 1, periodNumber: 1, opensAt: "09:00", closesAt: "17:00" }
      ],
      materialIds: [materialId]
    };

    const create = await callApi("/centers", "POST", token, centerInput);
    assertStatus(create, 201, "Cadastro de centro");
    const centerId = create.body && create.body.data && create.body.data.id;
    if (!centerId) throw new Error("O cadastro do centro não retornou seu identificador.");
    console.log("PASS — cadastro de centro autenticado (HTTP 201)");

    const details = await callApi("/centers/" + centerId, "GET");
    assertStatus(details, 200, "Consulta do centro cadastrado");
    if (details.body.data.name !== originalName) {
      throw new Error("A consulta do centro retornou nome diferente do cadastro.");
    }
    console.log("PASS — consulta pública do centro (HTTP 200)");

    const update = await callApi("/centers/" + centerId, "PUT", token, {
      ...centerInput,
      name: updatedName,
      openingHours: [
        { dayOfWeek: 1, periodNumber: 1, opensAt: "10:00", closesAt: "18:00" }
      ]
    });
    assertStatus(update, 200, "Atualização de centro");
    if (update.body.data.name !== updatedName) {
      throw new Error("A atualização não retornou o novo nome do centro.");
    }
    console.log("PASS — atualização autenticada do centro (HTTP 200)");

    const updatedDetails = await callApi("/centers/" + centerId, "GET");
    assertStatus(updatedDetails, 200, "Consulta do centro atualizado");
    if (
      updatedDetails.body.data.name !== updatedName ||
      !updatedDetails.body.data.openingHours.some((hour) => hour.opensAt === "10:00:00")
    ) {
      throw new Error("Os dados atualizados não foram persistidos corretamente.");
    }
    console.log("PASS — confirmação dos dados atualizados no MySQL (HTTP 200)");

    const deactivate = await callApi("/centers/" + centerId, "DELETE", token);
    assertStatus(deactivate, 204, "Desativação de centro");
    console.log("PASS — desativação lógica autenticada (HTTP 204)");

    const afterDeactivate = await callApi("/centers/" + centerId, "GET");
    assertStatus(afterDeactivate, 404, "Centro desativado não deve ser público");
    console.log("PASS — centro desativado deixou de ser público (HTTP 404)");

    completed = true;
    console.log("Todos os testes HTTP de integração de centros passaram.");
  } finally {
    if (registered) {
      try {
        await cleanupByEmail(email);
        console.log("LIMPEZA — usuário e centro sintéticos removidos do banco.");
      } catch (error) {
        console.error("FALHA NA LIMPEZA — " + error.message);
        console.error("Verifique manualmente somente o e-mail sintético usado nesta execução.");
        throw error;
      }
    } else if (!completed) {
      console.log("Nenhum usuário de teste foi cadastrado; não havia dados temporários para remover.");
    }
  }
}

main()
  .catch((error) => {
    console.error("FALHA NO TESTE HTTP DE INTEGRAÇÃO: " + error.message);
    process.exitCode = 1;
  })
  .finally(async () => {
    await db.end();
  });
