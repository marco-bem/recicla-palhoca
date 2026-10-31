import type { Pool } from "mysql2/promise";
import { MysqlMaterialsRepository } from "../src/materials/repository";

describe("Persistência do catálogo de materiais", () => {
  it("consulta somente materiais ativos em ordem alfabética e mapeia os campos", async () => {
    const rows = [
      {
        id: "5",
        name: "Papel",
        slug: "papel",
        description: "Descrição do papel."
      },
      {
        id: 6,
        name: "Papelão",
        slug: "papelao",
        description: null
      }
    ];
    const execute = jest.fn().mockResolvedValue([rows, []]);
    const repository = new MysqlMaterialsRepository({ execute } as unknown as Pool);

    const result = await repository.listActive();

    expect(execute).toHaveBeenCalledWith(
      "SELECT id, name, slug, description FROM materials WHERE is_active = TRUE ORDER BY name, id"
    );
    expect(result).toEqual([
      { id: 5, name: "Papel", slug: "papel", description: "Descrição do papel." },
      { id: 6, name: "Papelão", slug: "papelao", description: null }
    ]);
  });

  it("propaga falha de persistência para tratamento pela rota", async () => {
    const execute = jest.fn().mockRejectedValue(new Error("database unavailable"));
    const repository = new MysqlMaterialsRepository({ execute } as unknown as Pool);

    await expect(repository.listActive()).rejects.toThrow("database unavailable");
  });
});
