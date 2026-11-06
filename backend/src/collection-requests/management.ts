import { Router } from "express";
import type { RowDataPacket } from "mysql2/promise";
import { pool } from "../db/pool";
import { pickupAddressSql, type CollectionRequestStatus } from "./repository";

type Status = CollectionRequestStatus["status"];
const statuses: readonly Status[] = ["PENDENTE", "ACEITA", "RECUSADA", "CONCLUIDA"];

interface ManagedRequest extends CollectionRequestStatus {
  requesterName: string;
  requestedAt: string;
}

const requestSelect = `
  SELECT r.protocol, r.status, c.name AS centerName, r.requester_name AS requesterName,
    DATE_FORMAT(r.created_at, '%Y-%m-%d') AS requestedAt,
    DATE_FORMAT(r.preferred_date, '%Y-%m-%d') AS preferredDate,
    r.preferred_period AS preferredPeriod,
    ${pickupAddressSql} AS address,
    COALESCE((SELECT JSON_ARRAYAGG(m.name)
      FROM collection_request_materials rm JOIN materials m ON m.id = rm.material_id
      WHERE rm.request_id = r.id), JSON_ARRAY()) AS materials
  FROM collection_requests r JOIN recycling_centers c ON c.id = r.center_id
  WHERE c.responsible_user_id = ?`;

async function list(userId: number, status?: Status) {
  const [centers] = await pool.execute<(RowDataPacket & { name: string })[]>(
    "SELECT name FROM recycling_centers WHERE responsible_user_id = ?", [userId]
  );
  if (!centers[0]) return null;
  const [requests] = await pool.execute<(RowDataPacket & ManagedRequest)[]>(
    requestSelect + (status ? " AND r.status = ?" : "") + " ORDER BY r.created_at DESC, r.id DESC",
    status ? [userId, status] : [userId]
  );
  return { centerName: centers[0].name, requests };
}

async function detail(userId: number, protocol: string) {
  const [rows] = await pool.execute<(RowDataPacket & ManagedRequest)[]>(
    requestSelect + " AND r.protocol = ?", [userId, protocol]
  );
  return rows[0] ?? null;
}

async function transition(userId: number, protocol: string, status: Status, reason: string | null) {
  const connection = await pool.getConnection();
  try {
    await connection.beginTransaction();
    const [rows] = await connection.execute<(RowDataPacket & { id: number; status: Status })[]>(
      "SELECT r.id, r.status FROM collection_requests r JOIN recycling_centers c ON c.id = r.center_id " +
      "WHERE c.responsible_user_id = ? AND r.protocol = ? FOR UPDATE", [userId, protocol]
    );
    const current = rows[0];
    const allowed = current && (
      (current.status === "PENDENTE" && (status === "ACEITA" || status === "RECUSADA")) ||
      (current.status === "ACEITA" && status === "CONCLUIDA")
    );
    if (!allowed) {
      await connection.rollback();
      return current ? "conflict" : "not_found";
    }
    await connection.execute("UPDATE collection_requests SET status = ? WHERE id = ?", [status, current.id]);
    await connection.execute(
      "INSERT INTO collection_request_status_history (request_id, previous_status, new_status, changed_by_user_id, reason) " +
      "VALUES (?, ?, ?, ?, ?)", [current.id, current.status, status, userId, reason]
    );
    await connection.commit();
    return "updated";
  } catch (error) {
    await connection.rollback();
    throw error;
  } finally {
    connection.release();
  }
}

export function createCollectionManagementRouter() {
  const router = Router();
  router.use((_request, response, next) => {
    response.set("Cache-Control", "no-store");
    if (!response.locals.authenticatedUserId) {
      response.status(401).json({ error: "unauthorized", message: "Entre na área do centro para continuar." });
      return;
    }
    next();
  });

  router.get("/", async (request, response) => {
    const { status } = request.query;
    if (status !== undefined && !statuses.includes(status as Status)) {
      response.status(400).json({ error: "invalid_status", message: "Informe um estado válido." });
      return;
    }
    const data = await list(response.locals.authenticatedUserId, status as Status | undefined);
    if (!data) {
      response.status(404).json({ error: "center_not_found", message: "Nenhum centro está vinculado à sua conta." });
      return;
    }
    response.json({ data });
  });

  router.get("/:protocol", async (request, response) => {
    const data = await detail(response.locals.authenticatedUserId, request.params.protocol);
    if (!data) {
      response.status(404).json({ error: "not_found", message: "Solicitação não encontrada." });
      return;
    }
    response.json({ data });
  });

  router.patch("/:protocol/status", async (request, response) => {
    const status = request.body?.status;
    const reason = typeof request.body?.reason === "string" ? request.body.reason.trim() : "";
    if ((status !== "ACEITA" && status !== "RECUSADA" && status !== "CONCLUIDA") ||
        (status === "RECUSADA" && (!reason || reason.length > 500))) {
      response.status(400).json({ error: "invalid_transition", message: "Informe um estado válido e justifique a recusa em até 500 caracteres." });
      return;
    }
    const result = await transition(response.locals.authenticatedUserId, request.params.protocol, status,
      status === "RECUSADA" ? reason : null);
    if (result === "not_found") {
      response.status(404).json({ error: "not_found", message: "Solicitação não encontrada." });
      return;
    }
    if (result === "conflict") {
      response.status(409).json({ error: "transition_conflict", message: "Esta solicitação mudou de estado. Atualize os dados antes de continuar." });
      return;
    }
    response.json({ data: { protocol: request.params.protocol, status } });
  });

  router.use((error: unknown, _request: import("express").Request, response: import("express").Response,
    _next: import("express").NextFunction) => {
    void error;
    void _next;
    response.status(500).json({ error: "management_failed", message: "Não foi possível concluir a operação." });
  });
  return router;
}
