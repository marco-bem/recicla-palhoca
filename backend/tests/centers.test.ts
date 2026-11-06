import request from "supertest";
import { createApp } from "../src/app";
import { CenterRepositoryError } from "../src/centers/repository";
import type {
  CenterFilters,
  CenterInput,
  CenterProfile,
  CentersRepository
} from "../src/centers/types";

const sampleCenter: CenterProfile = {
  id: 1,
  name: "Centro de Reciclagem de Teste",
  publicPhone: "4833334444",
  address: {
    postalCode: "88130000",
    street: "Rua de Teste",
    streetNumber: "100",
    complement: null,
    neighborhood: "Centro",
    city: "Palhoça",
    state: "SC"
  },
  coordinates: { latitude: -27.6, longitude: -48.7 },
  services: { acceptsDropoff: true, offersPickup: true },
  isActive: true,
  openingHours: [
    { dayOfWeek: 1, periodNumber: 1, opensAt: "09:00:00", closesAt: "17:00:00" }
  ],
  materials: [{ id: 5, name: "Papel", slug: "papel" }]
};

const validInput: CenterInput = {
  name: "Centro de Reciclagem de Teste",
  publicPhone: "4833334444",
  postalCode: "88130-000",
  street: "Rua de Teste",
  streetNumber: "100",
  addressComplement: null,
  neighborhood: "Centro",
  city: "Palhoça",
  state: "SC",
  latitude: -27.6,
  longitude: -48.7,
  acceptsDropoff: true,
  offersPickup: true,
  openingHours: [
    { dayOfWeek: 1, periodNumber: 1, opensAt: "09:00", closesAt: "17:00" }
  ],
  materialIds: [5]
};

function createRepositoryMock(): jest.Mocked<CentersRepository> {
  return {
    listPublic: jest.fn<Promise<CenterProfile[]>, [CenterFilters]>(),
    findForUser: jest.fn<Promise<CenterProfile | null>, [number]>(),
    findPublicById: jest.fn<Promise<CenterProfile | null>, [number]>(),
    createForUser: jest.fn<Promise<CenterProfile>, [number, CenterInput]>(),
    updateForUser: jest.fn<Promise<CenterProfile | null>, [number, number, CenterInput]>(),
    deactivateForUser: jest.fn<Promise<boolean>, [number, number]>()
  };
}

describe("API de centros", () => {
  let repository: jest.Mocked<CentersRepository>;

  beforeEach(() => {
    repository = createRepositoryMock();
    repository.listPublic.mockResolvedValue([sampleCenter]);
    repository.findPublicById.mockResolvedValue(sampleCenter);
    repository.createForUser.mockResolvedValue(sampleCenter);
    repository.updateForUser.mockResolvedValue(sampleCenter);
    repository.deactivateForUser.mockResolvedValue(true);
  });

  it("lista centros publicáveis e encaminha os filtros validados", async () => {
    const app = createApp(async () => undefined, { centersRepository: repository });

    const response = await request(app)
      .get("/centers?q=reciclagem&neighborhood=Centro&material=papel&offersPickup=true");

    expect(response.status).toBe(200);
    expect(response.body.data).toHaveLength(1);
    expect(repository.listPublic).toHaveBeenCalledWith({
      q: "reciclagem",
      neighborhood: "Centro",
      material: "papel",
      offersPickup: true
    });
  });

  it("rejeita filtros booleanos inválidos", async () => {
    const app = createApp(async () => undefined, { centersRepository: repository });

    const response = await request(app).get("/centers?offersPickup=sim");

    expect(response.status).toBe(400);
    expect(repository.listPublic).not.toHaveBeenCalled();
  });

  it("consulta somente o centro do usuário autenticado, inclusive quando inativo", async () => {
    const inactive = { ...sampleCenter, isActive: false };
    repository.findForUser.mockResolvedValue(inactive);
    const app = createApp(async () => undefined, {
      centersRepository: repository,
      resolveAuthenticatedUserId: () => 42
    });

    const response = await request(app).get("/centers/me");

    expect(response.status).toBe(200);
    expect(response.headers["cache-control"]).toBe("no-store");
    expect(response.body).toEqual({ data: inactive });
    expect(repository.findForUser).toHaveBeenCalledWith(42);
    expect(repository.findPublicById).not.toHaveBeenCalled();
  });

  it("rejeita consulta de perfil próprio sem autenticação", async () => {
    const app = createApp(async () => undefined, { centersRepository: repository });
    const response = await request(app).get("/centers/me");

    expect(response.status).toBe(401);
    expect(repository.findForUser).not.toHaveBeenCalled();
  });

  it("consulta um centro publicável pelo identificador", async () => {
    const app = createApp(async () => undefined, { centersRepository: repository });

    const response = await request(app).get("/centers/1");

    expect(response.status).toBe(200);
    expect(response.body.data.id).toBe(1);
    expect(repository.findPublicById).toHaveBeenCalledWith(1);
  });

  it("rejeita identificadores inválidos", async () => {
    const app = createApp(async () => undefined, { centersRepository: repository });

    const response = await request(app).get("/centers/abc");

    expect(response.status).toBe(400);
    expect(repository.findPublicById).not.toHaveBeenCalled();
  });

  it("não expõe centros ausentes ou não publicáveis", async () => {
    repository.findPublicById.mockResolvedValue(null);
    const app = createApp(async () => undefined, { centersRepository: repository });

    const response = await request(app).get("/centers/999");

    expect(response.status).toBe(404);
  });

  it("bloqueia cadastro quando não existe identidade autenticada", async () => {
    const app = createApp(async () => undefined, { centersRepository: repository });

    const response = await request(app).post("/centers").send(validInput);

    expect(response.status).toBe(401);
    expect(repository.createForUser).not.toHaveBeenCalled();
  });

  it("valida o cadastro antes de persistir", async () => {
    const app = createApp(async () => undefined, {
      centersRepository: repository,
      resolveAuthenticatedUserId: () => 7
    });

    const response = await request(app).post("/centers").send({ ...validInput, latitude: 120 });

    expect(response.status).toBe(400);
    expect(repository.createForUser).not.toHaveBeenCalled();
  });

  it("cadastra um centro completo para o responsável autenticado", async () => {
    const app = createApp(async () => undefined, {
      centersRepository: repository,
      resolveAuthenticatedUserId: () => 7
    });

    const response = await request(app).post("/centers").send(validInput);

    expect(response.status).toBe(201);
    expect(response.body.data.id).toBe(1);
    expect(repository.createForUser).toHaveBeenCalledWith(7, {
      ...validInput,
      postalCode: "88130000",
      openingHours: [
        { dayOfWeek: 1, periodNumber: 1, opensAt: "09:00:00", closesAt: "17:00:00" }
      ]
    });
  });

  it("atualiza apenas o centro associado ao responsável autenticado", async () => {
    const app = createApp(async () => undefined, {
      centersRepository: repository,
      resolveAuthenticatedUserId: () => 7
    });

    const response = await request(app).put("/centers/1").send(validInput);

    expect(response.status).toBe(200);
    expect(repository.updateForUser).toHaveBeenCalledWith(7, 1, expect.objectContaining({
      name: validInput.name
    }));
  });

  it("desativa logicamente um centro do responsável autenticado", async () => {
    const app = createApp(async () => undefined, {
      centersRepository: repository,
      resolveAuthenticatedUserId: () => 7
    });

    const response = await request(app).delete("/centers/1");

    expect(response.status).toBe(204);
    expect(repository.deactivateForUser).toHaveBeenCalledWith(7, 1);
  });

  it("retorna erro controlado quando a listagem falha", async () => {
    repository.listPublic.mockRejectedValue(new Error("database details"));
    const app = createApp(async () => undefined, { centersRepository: repository });

    const response = await request(app).get("/centers");

    expect(response.status).toBe(500);
    expect(response.body).toEqual({
      error: "internal_error",
      message: "Não foi possível consultar os centros."
    });
    expect(JSON.stringify(response.body)).not.toContain("database details");
  });

  it("retorna erro controlado quando a consulta individual falha", async () => {
    repository.findPublicById.mockRejectedValue(new Error("database details"));
    const app = createApp(async () => undefined, { centersRepository: repository });

    const response = await request(app).get("/centers/1");

    expect(response.status).toBe(500);
    expect(response.body.error).toBe("internal_error");
    expect(JSON.stringify(response.body)).not.toContain("database details");
  });

  it("rejeita cadastro com corpo inválido antes de acessar o repositório", async () => {
    const app = createApp(async () => undefined, {
      centersRepository: repository,
      resolveAuthenticatedUserId: () => 7
    });

    const response = await request(app).post("/centers").send({ ...validInput, materialIds: [] });

    expect(response.status).toBe(400);
    expect(repository.createForUser).not.toHaveBeenCalled();
  });

  it("bloqueia atualização sem responsável autenticado", async () => {
    const app = createApp(async () => undefined, { centersRepository: repository });

    const response = await request(app).put("/centers/1").send(validInput);

    expect(response.status).toBe(401);
    expect(repository.updateForUser).not.toHaveBeenCalled();
  });

  it("bloqueia desativação sem responsável autenticado", async () => {
    const app = createApp(async () => undefined, { centersRepository: repository });

    const response = await request(app).delete("/centers/1");

    expect(response.status).toBe(401);
    expect(repository.deactivateForUser).not.toHaveBeenCalled();
  });

  it("rejeita identificador inválido na atualização", async () => {
    const app = createApp(async () => undefined, {
      centersRepository: repository,
      resolveAuthenticatedUserId: () => 7
    });

    const response = await request(app).put("/centers/abc").send(validInput);

    expect(response.status).toBe(400);
    expect(repository.updateForUser).not.toHaveBeenCalled();
  });

  it("rejeita identificador inválido na desativação", async () => {
    const app = createApp(async () => undefined, {
      centersRepository: repository,
      resolveAuthenticatedUserId: () => 7
    });

    const response = await request(app).delete("/centers/abc");

    expect(response.status).toBe(400);
    expect(repository.deactivateForUser).not.toHaveBeenCalled();
  });

  it("não permite atualizar centro pertencente a outro responsável", async () => {
    repository.updateForUser.mockResolvedValue(null);
    const app = createApp(async () => undefined, {
      centersRepository: repository,
      resolveAuthenticatedUserId: () => 99
    });

    const response = await request(app).put("/centers/1").send(validInput);

    expect(response.status).toBe(404);
    expect(repository.updateForUser).toHaveBeenCalledWith(99, 1, expect.any(Object));
  });

  it("não permite desativar centro pertencente a outro responsável", async () => {
    repository.deactivateForUser.mockResolvedValue(false);
    const app = createApp(async () => undefined, {
      centersRepository: repository,
      resolveAuthenticatedUserId: () => 99
    });

    const response = await request(app).delete("/centers/1");

    expect(response.status).toBe(404);
    expect(repository.deactivateForUser).toHaveBeenCalledWith(99, 1);
  });

  it.each([
    ["responsible_not_active", 403],
    ["center_already_exists", 409],
    ["invalid_materials", 400]
  ] as const)("mapeia o erro de persistência %s para HTTP %i", async (code, status) => {
    repository.createForUser.mockRejectedValue(new CenterRepositoryError(code));
    const app = createApp(async () => undefined, {
      centersRepository: repository,
      resolveAuthenticatedUserId: () => 7
    });

    const response = await request(app).post("/centers").send(validInput);

    expect(response.status).toBe(status);
    expect(response.body.error).toBe(code);
  });

  it("oculta detalhes de erro inesperado durante o cadastro", async () => {
    repository.createForUser.mockRejectedValue(new Error("internal database details"));
    const app = createApp(async () => undefined, {
      centersRepository: repository,
      resolveAuthenticatedUserId: () => 7
    });

    const response = await request(app).post("/centers").send(validInput);

    expect(response.status).toBe(500);
    expect(response.body.message).toBe("Não foi possível salvar o centro.");
    expect(JSON.stringify(response.body)).not.toContain("internal database details");
  });

  it("retorna erro controlado quando a desativação falha no repositório", async () => {
    repository.deactivateForUser.mockRejectedValue(new Error("internal database details"));
    const app = createApp(async () => undefined, {
      centersRepository: repository,
      resolveAuthenticatedUserId: () => 7
    });

    const response = await request(app).delete("/centers/1");

    expect(response.status).toBe(500);
    expect(response.body.message).toBe("Não foi possível desativar o centro.");
    expect(JSON.stringify(response.body)).not.toContain("internal database details");
  });

});
