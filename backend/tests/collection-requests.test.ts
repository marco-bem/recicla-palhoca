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
  const app = createApp(undefined, { collectionRequestsRepository: { create } });
  return { create, send: (body: unknown) => request(app).post("/collection-requests").send(body as object) };
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

  it("rejeita pedido sem material antes de chamar o repositório", async () => {
    const { create, send } = setup();
    const response = await send({ ...payload, materialIds: [] });

    expect(response.status).toBe(400);
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
