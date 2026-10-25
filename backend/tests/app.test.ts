import request from "supertest";
import { createApp } from "../src/app";

describe("API health endpoints", () => {
  it("returns liveness when the API is running", async () => {
    const app = createApp(async () => {
      throw new Error("O endpoint de liveness não deve consultar o banco.");
    });

    const response = await request(app).get("/health/live");

    expect(response.status).toBe(200);
    expect(response.body).toEqual({
      status: "ok",
      service: "recicla-palhoca-api"
    });
  });

  it("reports healthy status when MySQL check succeeds", async () => {
    const databaseCheck = jest.fn<Promise<void>, []>().mockResolvedValue(undefined);
    const app = createApp(databaseCheck);

    const response = await request(app).get("/health");

    expect(databaseCheck).toHaveBeenCalledTimes(1);
    expect(response.status).toBe(200);
    expect(response.body).toEqual({
      status: "ok",
      service: "recicla-palhoca-api",
      database: "connected"
    });
  });

  it("returns 503 without exposing database details when MySQL check fails", async () => {
    const databaseCheck = jest.fn<Promise<void>, []>()
      .mockRejectedValue(new Error("internal connection detail"));
    const app = createApp(databaseCheck);

    const response = await request(app).get("/health");

    expect(response.status).toBe(503);
    expect(response.body).toEqual({
      status: "error",
      service: "recicla-palhoca-api",
      database: "unavailable"
    });
    expect(JSON.stringify(response.body)).not.toContain("internal connection detail");
  });

  it("returns a predictable 404 for unknown routes", async () => {
    const app = createApp();

    const response = await request(app).get("/rota-inexistente");

    expect(response.status).toBe(404);
    expect(response.body.error).toBe("not_found");
  });
});
