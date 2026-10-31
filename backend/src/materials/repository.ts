import type { RowDataPacket } from "mysql2";
import type { Pool } from "mysql2/promise";
import { pool } from "../db/pool";
import type { Material, MaterialsRepository } from "./types";

interface MaterialRow extends RowDataPacket {
  id: number | string;
  name: string;
  slug: string;
  description: string | null;
}

export class MysqlMaterialsRepository implements MaterialsRepository {
  constructor(private readonly db: Pool = pool) {}

  async listActive(): Promise<Material[]> {
    const [rows] = await this.db.execute<MaterialRow[]>(
      "SELECT id, name, slug, description " +
      "FROM materials WHERE is_active = TRUE ORDER BY name, id"
    );

    return rows.map((row) => ({
      id: Number(row.id),
      name: row.name,
      slug: row.slug,
      description: row.description
    }));
  }
}
