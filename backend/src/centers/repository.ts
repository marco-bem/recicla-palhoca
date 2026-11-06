import type { ResultSetHeader, RowDataPacket } from "mysql2";
import type { Pool, PoolConnection } from "mysql2/promise";
import { pool } from "../db/pool";
import type {
  CenterFilters,
  CenterInput,
  CenterMaterial,
  CenterOpeningHour,
  CenterProfile,
  CentersRepository
} from "./types";

export type CenterRepositoryErrorCode =
  | "responsible_not_active"
  | "center_already_exists"
  | "invalid_materials";

export class CenterRepositoryError extends Error {
  constructor(public readonly code: CenterRepositoryErrorCode) {
    super(code);
    this.name = "CenterRepositoryError";
  }
}

interface CenterRow extends RowDataPacket {
  id: number | string;
  name: string;
  publicPhone: string;
  postalCode: string;
  street: string;
  streetNumber: string;
  complement: string | null;
  neighborhood: string;
  city: string;
  state: string;
  latitude: number | string | null;
  longitude: number | string | null;
  acceptsDropoff: boolean | number | string;
  offersPickup: boolean | number | string;
  isActive: boolean | number | string;
}

interface OpeningHourRow extends RowDataPacket {
  centerId: number | string;
  dayOfWeek: number | string;
  periodNumber: number | string;
  opensAt: string;
  closesAt: string;
}

interface MaterialRow extends RowDataPacket {
  centerId: number | string;
  id: number | string;
  name: string;
  slug: string;
}

function toBoolean(value: boolean | number | string): boolean {
  return value === true || value === 1 || value === "1";
}

function toCenterProfile(row: CenterRow, openingHours: CenterOpeningHour[], materials: CenterMaterial[]): CenterProfile {
  return {
    id: Number(row.id),
    name: row.name,
    publicPhone: row.publicPhone,
    address: {
      postalCode: row.postalCode,
      street: row.street,
      streetNumber: row.streetNumber,
      complement: row.complement,
      neighborhood: row.neighborhood,
      city: row.city,
      state: row.state
    },
    coordinates: {
      latitude: row.latitude === null ? null : Number(row.latitude),
      longitude: row.longitude === null ? null : Number(row.longitude)
    },
    services: {
      acceptsDropoff: toBoolean(row.acceptsDropoff),
      offersPickup: toBoolean(row.offersPickup)
    },
    isActive: toBoolean(row.isActive),
    openingHours,
    materials
  };
}

const CENTER_SELECT =
  "SELECT c.id, c.name, c.public_phone AS publicPhone, c.postal_code AS postalCode, " +
  "c.street, c.street_number AS streetNumber, c.address_complement AS complement, " +
  "c.neighborhood, c.city, c.state, c.latitude, c.longitude, " +
  "c.accepts_dropoff AS acceptsDropoff, c.offers_pickup AS offersPickup, c.is_active AS isActive " +
  "FROM recycling_centers c ";

const PUBLIC_CENTER_CONDITIONS =
  "c.is_active = TRUE " +
  "AND c.latitude IS NOT NULL AND c.longitude IS NOT NULL " +
  "AND EXISTS (SELECT 1 FROM center_opening_hours oh WHERE oh.center_id = c.id) " +
  "AND EXISTS (SELECT 1 FROM center_materials cm " +
  "JOIN materials m ON m.id = cm.material_id " +
  "WHERE cm.center_id = c.id AND cm.is_accepted = TRUE AND m.is_active = TRUE) ";

export class MysqlCentersRepository implements CentersRepository {
  constructor(private readonly db: Pool = pool) {}

  async listPublic(filters: CenterFilters): Promise<CenterProfile[]> {
    const conditions = [PUBLIC_CENTER_CONDITIONS];
    const values: Array<string | number | boolean> = [];

    if (filters.q) {
      conditions.push("(c.name LIKE ? OR c.neighborhood LIKE ?)");
      const pattern = "%" + filters.q + "%";
      values.push(pattern, pattern);
    }
    if (filters.neighborhood) {
      conditions.push("c.neighborhood LIKE ?");
      values.push("%" + filters.neighborhood + "%");
    }
    if (filters.material) {
      conditions.push(
        "EXISTS (SELECT 1 FROM center_materials cmf " +
        "JOIN materials mf ON mf.id = cmf.material_id " +
        "WHERE cmf.center_id = c.id AND cmf.is_accepted = TRUE " +
        "AND mf.is_active = TRUE AND mf.slug = ?)"
      );
      values.push(filters.material);
    }
    if (filters.offersPickup !== undefined) {
      conditions.push("c.offers_pickup = ?");
      values.push(filters.offersPickup);
    }

    const sql = CENTER_SELECT + "WHERE " + conditions.join(" AND ") + " ORDER BY c.name, c.id";
    const [rows] = await this.db.execute<CenterRow[]>(sql, values);
    return this.hydrate(rows);
  }

  async findPublicById(id: number): Promise<CenterProfile | null> {
    const [rows] = await this.db.execute<CenterRow[]>(
      CENTER_SELECT + "WHERE " + PUBLIC_CENTER_CONDITIONS + "AND c.id = ? LIMIT 1",
      [id]
    );
    const profiles = await this.hydrate(rows);
    return profiles[0] ?? null;
  }

  async createForUser(userId: number, input: CenterInput): Promise<CenterProfile> {
    const connection = await this.db.getConnection();
    let centerId = 0;

    try {
      await connection.beginTransaction();
      await this.assertActiveUser(connection, userId);
      const [existing] = await connection.execute<RowDataPacket[]>(
        "SELECT id FROM recycling_centers WHERE responsible_user_id = ? LIMIT 1 FOR UPDATE",
        [userId]
      );
      if (existing.length > 0) throw new CenterRepositoryError("center_already_exists");
      await this.assertActiveMaterials(connection, input.materialIds);

      const [result] = await connection.execute<ResultSetHeader>(
        "INSERT INTO recycling_centers " +
        "(responsible_user_id, name, public_phone, postal_code, street, street_number, address_complement, " +
        "neighborhood, city, state, latitude, longitude, accepts_dropoff, offers_pickup, is_active) " +
        "VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, TRUE)",
        [
          userId, input.name, input.publicPhone, input.postalCode, input.street, input.streetNumber,
          input.addressComplement, input.neighborhood, input.city, input.state, input.latitude,
          input.longitude, input.acceptsDropoff, input.offersPickup
        ]
      );
      centerId = Number(result.insertId);
      await this.replaceOpeningHours(connection, centerId, input.openingHours);
      await this.markSelectedMaterialsAccepted(connection, centerId, input.materialIds);
      await connection.commit();
    } catch (error) {
      await connection.rollback().catch(() => undefined);
      if (isDuplicateKeyError(error)) throw new CenterRepositoryError("center_already_exists");
      throw error;
    } finally {
      connection.release();
    }

    const center = await this.findOwnedById(userId, centerId);
    if (!center) throw new Error("The created center could not be read.");
    return center;
  }

  async updateForUser(userId: number, id: number, input: CenterInput): Promise<CenterProfile | null> {
    const connection = await this.db.getConnection();

    try {
      await connection.beginTransaction();
      await this.assertActiveUser(connection, userId);
      const [ownedRows] = await connection.execute<RowDataPacket[]>(
        "SELECT id FROM recycling_centers WHERE id = ? AND responsible_user_id = ? LIMIT 1 FOR UPDATE",
        [id, userId]
      );
      if (ownedRows.length === 0) {
        await connection.rollback();
        return null;
      }
      await this.assertActiveMaterials(connection, input.materialIds);

      await connection.execute(
        "UPDATE recycling_centers SET name = ?, public_phone = ?, postal_code = ?, street = ?, " +
        "street_number = ?, address_complement = ?, neighborhood = ?, city = ?, state = ?, " +
        "latitude = ?, longitude = ?, accepts_dropoff = ?, offers_pickup = ? " +
        "WHERE id = ? AND responsible_user_id = ?",
        [
          input.name, input.publicPhone, input.postalCode, input.street, input.streetNumber,
          input.addressComplement, input.neighborhood, input.city, input.state, input.latitude,
          input.longitude, input.acceptsDropoff, input.offersPickup, id, userId
        ]
      );

      await this.replaceOpeningHours(connection, id, input.openingHours);
      await connection.execute(
        "UPDATE center_materials SET is_accepted = FALSE WHERE center_id = ?",
        [id]
      );
      await this.markSelectedMaterialsAccepted(connection, id, input.materialIds);
      await connection.commit();
    } catch (error) {
      await connection.rollback().catch(() => undefined);
      if (isDuplicateKeyError(error)) throw new CenterRepositoryError("center_already_exists");
      throw error;
    } finally {
      connection.release();
    }

    return this.findOwnedById(userId, id);
  }

  async deactivateForUser(userId: number, id: number): Promise<boolean> {
    const [rows] = await this.db.execute<RowDataPacket[]>(
      "SELECT id FROM recycling_centers WHERE id = ? AND responsible_user_id = ? LIMIT 1",
      [id, userId]
    );
    if (rows.length === 0) return false;

    await this.db.execute(
      "UPDATE recycling_centers SET is_active = FALSE WHERE id = ? AND responsible_user_id = ?",
      [id, userId]
    );
    return true;
  }

  async findForUser(userId: number): Promise<CenterProfile | null> {
    const [rows] = await this.db.execute<CenterRow[]>(
      CENTER_SELECT + "WHERE c.responsible_user_id = ? LIMIT 1", [userId]
    );
    return (await this.hydrate(rows))[0] ?? null;
  }

  private async findOwnedById(userId: number, id: number): Promise<CenterProfile | null> {
    const [rows] = await this.db.execute<CenterRow[]>(
      CENTER_SELECT + "WHERE c.id = ? AND c.responsible_user_id = ? LIMIT 1",
      [id, userId]
    );
    const profiles = await this.hydrate(rows);
    return profiles[0] ?? null;
  }

  private async hydrate(rows: CenterRow[]): Promise<CenterProfile[]> {
    if (rows.length === 0) return [];
    const ids = rows.map((row) => Number(row.id));
    const placeholders = ids.map(() => "?").join(", ");

    const [hourRows] = await this.db.execute<OpeningHourRow[]>(
      "SELECT center_id AS centerId, day_of_week AS dayOfWeek, period_number AS periodNumber, " +
      "opens_at AS opensAt, closes_at AS closesAt FROM center_opening_hours " +
      "WHERE center_id IN (" + placeholders + ") ORDER BY center_id, day_of_week, period_number",
      ids
    );

    const [materialRows] = await this.db.execute<MaterialRow[]>(
      "SELECT cm.center_id AS centerId, m.id, m.name, m.slug FROM center_materials cm " +
      "JOIN materials m ON m.id = cm.material_id " +
      "WHERE cm.center_id IN (" + placeholders + ") AND cm.is_accepted = TRUE AND m.is_active = TRUE " +
      "ORDER BY cm.center_id, m.name",
      ids
    );

    const hoursByCenter = new Map<number, CenterOpeningHour[]>();
    for (const row of hourRows) {
      const centerId = Number(row.centerId);
      const items = hoursByCenter.get(centerId) ?? [];
      items.push({
        dayOfWeek: Number(row.dayOfWeek),
        periodNumber: Number(row.periodNumber),
        opensAt: row.opensAt,
        closesAt: row.closesAt
      });
      hoursByCenter.set(centerId, items);
    }

    const materialsByCenter = new Map<number, CenterMaterial[]>();
    for (const row of materialRows) {
      const centerId = Number(row.centerId);
      const items = materialsByCenter.get(centerId) ?? [];
      items.push({ id: Number(row.id), name: row.name, slug: row.slug });
      materialsByCenter.set(centerId, items);
    }

    return rows.map((row) =>
      toCenterProfile(
        row,
        hoursByCenter.get(Number(row.id)) ?? [],
        materialsByCenter.get(Number(row.id)) ?? []
      )
    );
  }

  private async assertActiveUser(connection: PoolConnection, userId: number): Promise<void> {
    const [rows] = await connection.execute<RowDataPacket[]>(
      "SELECT id FROM users WHERE id = ? AND is_active = TRUE LIMIT 1",
      [userId]
    );
    if (rows.length === 0) throw new CenterRepositoryError("responsible_not_active");
  }

  private async assertActiveMaterials(connection: PoolConnection, materialIds: number[]): Promise<void> {
    const placeholders = materialIds.map(() => "?").join(", ");
    const [rows] = await connection.execute<RowDataPacket[]>(
      "SELECT id FROM materials WHERE is_active = TRUE AND id IN (" + placeholders + ")",
      materialIds
    );
    if (rows.length !== materialIds.length) throw new CenterRepositoryError("invalid_materials");
  }

  private async replaceOpeningHours(
    connection: PoolConnection,
    centerId: number,
    openingHours: CenterInput["openingHours"]
  ): Promise<void> {
    await connection.execute("DELETE FROM center_opening_hours WHERE center_id = ?", [centerId]);
    for (const hour of openingHours) {
      await connection.execute(
        "INSERT INTO center_opening_hours (center_id, day_of_week, period_number, opens_at, closes_at) " +
        "VALUES (?, ?, ?, ?, ?)",
        [centerId, hour.dayOfWeek, hour.periodNumber, hour.opensAt, hour.closesAt]
      );
    }
  }

  private async markSelectedMaterialsAccepted(
    connection: PoolConnection,
    centerId: number,
    materialIds: number[]
  ): Promise<void> {
    for (const materialId of materialIds) {
      await connection.execute(
        "INSERT INTO center_materials (center_id, material_id, is_accepted) VALUES (?, ?, TRUE) " +
        "ON DUPLICATE KEY UPDATE is_accepted = TRUE",
        [centerId, materialId]
      );
    }
  }
}

function isDuplicateKeyError(error: unknown): boolean {
  if (typeof error !== "object" || error === null || !("code" in error)) return false;
  return (error as { code?: unknown }).code === "ER_DUP_ENTRY";
}
