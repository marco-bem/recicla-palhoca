import request from "supertest";
import { createApp } from "../src/app";
import type { CollectionRequestsRepository } from "../src/collection-requests/repository";

const payload = {
  centerId: 42,
  materialIds: [5],
  requesterName: "Pessoa de Teste",
  requesterPhone: "(48) 90000-0000",
  postalCode: "88130-000",
  street: "Rua de Teste",
  streetNumber: "123",
  neighborhood: "Bairro de Teste",
  city: "Palhoça",
  state: "SC"
};

function setup() {
  const create = jest.fn<ReturnType<CollectionRequestsRepository["create"]>,
    Parameters<CollectionRequestsRepository["create"]>>();
  const lookup = jest.fn<ReturnType<CollectionRequestsRepository["lookup"]>,
    Parameters<CollectionRequestsRepository["lookup"]>>();
  const app = createApp(undefined, { collectionRequestsRepository: { create, lookup } });
  return { lookup, query: (body: object) => request(app).post("/collection-requests/lookup").send(body),
    create, send: (body: unknown) => request(app).post("/collection-requests").send(body as object) };
}

describe("Registro público de solicitações de coleta", () => {
  it("confirma o registro sem autenticação e retorna somente protocolo e estado", async () => {
    const { create, send } = setup();
    const protocol = "79f54ee1-e026-41b4-8206-42f26877992b";
    create.mockResolvedValue({ outcome: "created", protocol, status: "PENDENTE" });

    const response = await send(payload);

    expect(response.status).toBe(201);
    expect(response.headers["cache-control"]).toBe("no-store");
    expect(response.body).toEqual({ data: { protocol, status: "PENDENTE" } });
    expect(create).toHaveBeenCalledWith(expect.objectContaining({
      centerId: 42, materialIds: [5], requesterPhone: "48900000000", postalCode: "88130000"
    }));
  });

  it.each(["center_unavailable", "materials_unavailable"] as const)(
    "retorna conflito sem confirmação quando o repositório informa %s",
    async (outcome) => {
      const { create, send } = setup();
      create.mockResolvedValue({ outcome });

      const response = await send(payload);

      expect(response.status).toBe(409);
      expect(response.body).toEqual({ error: outcome, message: expect.any(String) });
    }
  );

  it.each([
    ["centro ausente", { centerId: undefined }],
    ["nome em branco", { requesterName: " " }],
    ["telefone inválido", { requesterPhone: "(48) 123" }],
    ["CEP incompleto", { postalCode: "88130" }],
    ["CEP com hífen fora de posição", { postalCode: "88-130000" }],
    ["logradouro ausente", { street: undefined }],
    ["número ausente", { streetNumber: undefined }],
    ["bairro ausente", { neighborhood: undefined }],
    ["município ausente", { city: undefined }],
    ["UF inválida", { state: "S1" }],
    ["sem material", { materialIds: [] }],
    ["material duplicado", { materialIds: [5, 5] }],
    ["data impossível", { preferredDate: "2026-02-30" }],
    ["período acima do limite", { preferredPeriod: "a".repeat(21) }],
    ["observações acima do limite", { notes: "a".repeat(501) }]
  ])("rejeita pedido com %s antes de chamar o repositório", async (_case, changes) => {
    const { create, send } = setup();
    const response = await send({ ...payload, ...changes });

    expect(response.status).toBe(400);
    expect(response.body).toEqual({ error: "invalid_request", message: expect.any(String) });
    expect(create).not.toHaveBeenCalled();
  });

  it("retorna erro genérico quando a gravação falha", async () => {
    const { create, send } = setup();
    create.mockRejectedValue(new Error("Falha interna do MySQL"));
    const response = await send(payload);

    expect(response.status).toBe(500);
    expect(response.body).toEqual({
      error: "collection_request_failed",
      message: "Não foi possível confirmar o registro da solicitação."
    });
  });
});

describe("Acompanhamento público da coleta", () => {
  const protocol = "79f54ee1-e026-41b4-8206-42f26877992b";
  const requesterPhone = "(48) 90000-0000";

  it("normaliza o par e retorna somente protocolo e status, sem cache", async () => {
    const { lookup, query } = setup();
    lookup.mockResolvedValue({ protocol, status: "ACEITA" });
    const response = await query({ protocol: protocol.toUpperCase(), requesterPhone });

    expect(lookup).toHaveBeenCalledWith({ protocol, requesterPhone: "48900000000" });
    expect(response.status).toBe(200);
    expect(response.headers["cache-control"]).toBe("no-store");
    expect(response.body).toEqual({ data: { protocol, status: "ACEITA" } });
  });

  it("responde de forma idêntica para telefone divergente e protocolo inexistente", async () => {
    const { lookup, query } = setup();
    lookup.mockResolvedValue(null);
    const wrongPhone = await query({ protocol, requesterPhone: "48900000001" });
    const missingProtocol = await query({ protocol: "79f54ee1-e026-41b4-8206-42f26877992c", requesterPhone });

    expect(wrongPhone.status).toBe(404);
    expect(missingProtocol.status).toBe(404);
    expect(missingProtocol.body).toEqual(wrongPhone.body);
    expect(wrongPhone.body).toEqual({ error: "collection_request_not_found", message: expect.any(String) });
  });

  it("rejeita protocolo inválido antes de consultar o banco", async () => {
    const { lookup, query } = setup();
    const response = await query({ protocol: "123", requesterPhone });

    expect(response.status).toBe(400);
    expect(lookup).not.toHaveBeenCalled();
  });
});
