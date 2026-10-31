import "dotenv/config";
import { randomUUID } from "node:crypto";
import type { ResultSetHeader, RowDataPacket } from "mysql2";
import { pool } from "../src/db/pool";
import { MysqlCentersRepository } from "../src/centers/repository";
import type { CenterInput } from "../src/centers/types";

const enabled = process.env.RUN_MYSQL_INTEGRATION === "1";
const integrationDescribe = enabled ? describe : describe.skip;

interface IdRow extends RowDataPacket {
  id: number | string;
}

interface MaterialRow extends RowDataPacket {
  id: number | string;
  slug: string;
}

interface AssociationRow extends RowDataPacket {
  materialId: number | string;
  isAccepted: number | string;
}

integrationDescribe("Integração real da persistência de centros com MySQL", () => {
  jest.setTimeout(30000);

  const token = randomUUID();
  const testEmail = "integration-" + token + "@example.invalid";
  const testCenterName = "Centro de Integração " + token.slice(0, 8);
  const repository = new MysqlCentersRepository();

  let userId: number | null = null;
  let materialId: number | null = null;
  let materialSlug: string | null = null;
  let replacementMaterialId: number | null = null;

  beforeAll(async () => {
    const [materials] = await pool.execute<MaterialRow[]>(
      "SELECT id, slug FROM materials WHERE is_active = TRUE ORDER BY id LIMIT 2"
    );
    if (materials.length < 2) {
      throw new Error("São necessários dois materiais ativos para executar o teste de integração.");
    }
    materialId = Number(materials[0].id);
    materialSlug = materials[0].slug;
    replacementMaterialId = Number(materials[1].id);

    const [result] = await pool.execute<ResultSetHeader>(
      "INSERT INTO users (full_name, email, password_hash, is_active) VALUES (?, ?, ?, TRUE)",
      ["Usuário temporário de teste", testEmail, "integration-test-placeholder-not-for-login"]
    );
    userId = Number(result.insertId);
  });

  afterAll(async () => {
    try {
      if (userId !== null) {
        const [centers] = await pool.execute<IdRow[]>(
          "SELECT id FROM recycling_centers WHERE responsible_user_id = ?",
          [userId]
        );

        for (const center of centers) {
          const centerId = Number(center.id);
          await pool.execute("DELETE FROM center_opening_hours WHERE center_id = ?", [centerId]);
          await pool.execute("DELETE FROM center_materials WHERE center_id = ?", [centerId]);
          await pool.execute("DELETE FROM recycling_centers WHERE id = ?", [centerId]);
        }

        await pool.execute("DELETE FROM users WHERE id = ?", [userId]);
      }
    } finally {
      await pool.end();
    }
  });

  it("cria, consulta, atualiza e desativa um centro no MySQL, removendo os dados temporários ao final", async () => {
    if (
      userId === null ||
      materialId === null ||
      materialSlug === null ||
      replacementMaterialId === null
    ) {
      throw new Error("O usuário temporário ou os materiais de teste não foram inicializados.");
    }

    const input: CenterInput = {
      name: testCenterName,
      publicPhone: "4833334444",
      postalCode: "88130000",
      street: "Rua de Integração",
      streetNumber: "100",
      addressComplement: null,
      neighborhood: "Centro",
      city: "Palhoça",
      state: "SC",
      latitude: -27.645,
      longitude: -48.669,
      acceptsDropoff: true,
      offersPickup: true,
      openingHours: [
        { dayOfWeek: 1, periodNumber: 1, opensAt: "09:00:00", closesAt: "17:00:00" }
      ],
      materialIds: [materialId]
    };

    const created = await repository.createForUser(userId, input);
    expect(created.id).toBeGreaterThan(0);
    expect(created.name).toBe(testCenterName);
    expect(created.materials.map((material) => material.id)).toContain(materialId);

    const publicList = await repository.listPublic({
      q: testCenterName,
      neighborhood: "Centro",
      material: materialSlug,
      offersPickup: true
    });
    expect(publicList.some((center) => center.id === created.id)).toBe(true);
    expect(await repository.listPublic({ q: "centro-inexistente-" + token })).toEqual([]);

    const publicDetails = await repository.findPublicById(created.id);
    expect(publicDetails?.name).toBe(testCenterName);
    expect(await repository.findPublicById(999999999)).toBeNull();

    expect(await repository.updateForUser(userId, 999999999, input)).toBeNull();
    expect(await repository.deactivateForUser(userId, 999999999)).toBe(false);

    await expect(repository.createForUser(userId, input)).rejects.toMatchObject({
      name: "CenterRepositoryError",
      code: "center_already_exists"
    });

    await expect(repository.updateForUser(userId, created.id, {
      ...input,
      materialIds: [999999999]
    })).rejects.toMatchObject({
      name: "CenterRepositoryError",
      code: "invalid_materials"
    });

    const afterRejectedUpdate = await repository.findPublicById(created.id);
    expect(afterRejectedUpdate?.name).toBe(testCenterName);
    expect(afterRejectedUpdate?.materials.map((material) => material.id)).toContain(materialId);

    await pool.execute("UPDATE users SET is_active = FALSE WHERE id = ?", [userId]);
    try {
      await expect(repository.createForUser(userId, input)).rejects.toMatchObject({
        name: "CenterRepositoryError",
        code: "responsible_not_active"
      });
      await expect(repository.updateForUser(userId, created.id, input)).rejects.toMatchObject({
        name: "CenterRepositoryError",
        code: "responsible_not_active"
      });
    } finally {
      await pool.execute("UPDATE users SET is_active = TRUE WHERE id = ?", [userId]);
    }

    const updatedName = testCenterName + " Atualizado";
    const updated = await repository.updateForUser(userId, created.id, {
      ...input,
      name: updatedName,
      materialIds: [replacementMaterialId],
      openingHours: [
        { dayOfWeek: 1, periodNumber: 1, opensAt: "10:00:00", closesAt: "18:00:00" }
      ]
    });

    expect(updated?.name).toBe(updatedName);
    expect(updated?.openingHours[0]).toMatchObject({
      opensAt: "10:00:00",
      closesAt: "18:00:00"
    });
    expect(updated?.materials.map((material) => material.id)).toEqual([replacementMaterialId]);

    const [associations] = await pool.execute<AssociationRow[]>(
      "SELECT material_id AS materialId, is_accepted AS isAccepted FROM center_materials " +
      "WHERE center_id = ? AND material_id IN (?, ?) ORDER BY material_id",
      [created.id, materialId, replacementMaterialId]
    );
    expect(associations).toEqual([
      expect.objectContaining({ materialId, isAccepted: 0 }),
      expect.objectContaining({ materialId: replacementMaterialId, isAccepted: 1 })
    ]);

    expect(await repository.deactivateForUser(userId, created.id)).toBe(true);
    expect(await repository.findPublicById(created.id)).toBeNull();
    expect(await repository.listPublic({ q: updatedName })).toEqual([]);
  });
});
