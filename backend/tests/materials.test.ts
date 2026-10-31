import request from "supertest";
import { createApp } from "../src/app";
import type { Material, MaterialsRepository } from "../src/materials/types";

const sampleMaterials: Material[] = [
  {
    id: 5,
    name: "Papel",
    slug: "papel",
    description: "Papéis recicláveis aceitos conforme as condições do centro."
  },
  {
    id: 6,
    name: "Papelão",
    slug: "papelao",
    description: "Papelão e caixas de papelão recicláveis."
  }
];

function createMaterialsRepositoryMock(): jest.Mocked<MaterialsRepository> {
  return {
    listActive: jest.fn<Promise<Material[]>, []>()
  };
}

describe("API pública de materiais", () => {
  let repository: jest.Mocked<MaterialsRepository>;

  beforeEach(() => {
    repository = createMaterialsRepositoryMock();
    repository.listActive.mockResolvedValue(sampleMaterials);
  });

  it("lista materiais ativos sem exigir autenticação", async () => {
    const app = createApp(async () => undefined, { materialsRepository: repository });

    const response = await request(app).get("/materials");

    expect(response.status).toBe(200);
    expect(response.body.data).toEqual(sampleMaterials);
    expect(repository.listActive).toHaveBeenCalledTimes(1);
  });

  it("retorna lista vazia quando não há materiais ativos", async () => {
    repository.listActive.mockResolvedValue([]);
    const app = createApp(async () => undefined, { materialsRepository: repository });

    const response = await request(app).get("/materials");

    expect(response.status).toBe(200);
    expect(response.body).toEqual({ data: [] });
  });

  it("não expõe detalhes internos quando a consulta falha", async () => {
    repository.listActive.mockRejectedValue(new Error("database connection secret"));
    const app = createApp(async () => undefined, { materialsRepository: repository });

    const response = await request(app).get("/materials");

    expect(response.status).toBe(500);
    expect(response.body).toEqual({
      error: "internal_error",
      message: "Não foi possível consultar o catálogo de materiais."
    });
    expect(JSON.stringify(response.body)).not.toContain("database connection secret");
  });
});
