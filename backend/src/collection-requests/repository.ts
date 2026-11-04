import { randomUUID } from "node:crypto";
import type { ResultSetHeader, RowDataPacket } from "mysql2/promise";
import { pool } from "../db/pool";
import type { CollectionRequestInput, CollectionRequestLookup } from "./validation";

export type CollectionRequestResult =
  | { outcome: "center_unavailable" | "materials_unavailable" }
  | { outcome: "created"; protocol: string; status: "PENDENTE" };

export interface CollectionRequestStatus {
  protocol: string;
  status: "PENDENTE" | "ACEITA" | "RECUSADA" | "CONCLUIDA";
}

export interface CollectionRequestsRepository {
  lookup(input: CollectionRequestLookup): Promise<CollectionRequestStatus | null>;
  create(input: CollectionRequestInput): Promise<CollectionRequestResult>;
}

export class MysqlCollectionRequestsRepository implements CollectionRequestsRepository {
  async lookup(input: CollectionRequestLookup): Promise<CollectionRequestStatus | null> {
    const [rows] = await pool.execute<(RowDataPacket & CollectionRequestStatus)[]>(
      "SELECT protocol, status FROM collection_requests WHERE protocol = ? AND requester_phone = ?",
      [input.protocol, input.requesterPhone]
    );
    const match = rows[0];
    return match ? { protocol: match.protocol, status: match.status } : null;
  }

  async create(input: CollectionRequestInput): Promise<CollectionRequestResult> {
    const connection = await pool.getConnection();
    try {
      await connection.beginTransaction();
      const [centers] = await connection.execute<RowDataPacket[]>(
        "SELECT id FROM recycling_centers WHERE id = ? AND is_active = TRUE AND offers_pickup = TRUE FOR UPDATE",
        [input.centerId]
      );
      if (!centers.length) {
        await connection.rollback();
        return { outcome: "center_unavailable" };
      }

      const placeholders = input.materialIds.map(() => "?").join(", ");
      const [materials] = await connection.execute<RowDataPacket[]>(
        "SELECT cm.material_id FROM center_materials cm JOIN materials m ON m.id = cm.material_id " +
        `WHERE cm.center_id = ? AND cm.material_id IN (${placeholders}) ` +
        "AND cm.is_accepted = TRUE AND m.is_active = TRUE FOR SHARE",
        [input.centerId, ...input.materialIds]
      );
      if (materials.length !== input.materialIds.length) {
        await connection.rollback();
        return { outcome: "materials_unavailable" };
      }

      const protocol = randomUUID();
      await connection.execute<ResultSetHeader>(
        "INSERT INTO collection_requests (protocol, center_id, requester_name, requester_phone, " +
        "pickup_postal_code, pickup_street, pickup_street_number, pickup_address_complement, " +
        "pickup_neighborhood, pickup_city, pickup_state, preferred_date, preferred_period, notes) " +
        "VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)",
        [protocol, input.centerId, input.requesterName, input.requesterPhone, input.postalCode,
          input.street, input.streetNumber, input.complement, input.neighborhood, input.city,
          input.state, input.preferredDate, input.preferredPeriod, input.notes]
      );
      await connection.execute(
        "INSERT INTO collection_request_materials (request_id, center_id, material_id) " +
        "SELECT r.id, r.center_id, cm.material_id FROM collection_requests r " +
        "JOIN center_materials cm ON cm.center_id = r.center_id " +
        `WHERE r.protocol = ? AND cm.material_id IN (${placeholders})`,
        [protocol, ...input.materialIds]
      );
      await connection.execute(
        "INSERT INTO collection_request_status_history (request_id, new_status) " +
        "SELECT id, status FROM collection_requests WHERE protocol = ?",
        [protocol]
      );
      await connection.commit();
      return { outcome: "created", protocol, status: "PENDENTE" };
    } catch (error) {
      await connection.rollback();
      throw error;
    } finally {
      connection.release();
    }
  }
}
