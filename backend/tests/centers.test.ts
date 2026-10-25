import request from "supertest";
import { createApp } from "../src/app";
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
});
