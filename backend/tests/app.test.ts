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

  it("allows the local Expo web origin to call the public API", async () => {
    const app = createApp();

    const response = await request(app)
      .get("/health/live")
      .set("Origin", "http://localhost:8081");

    expect(response.status).toBe(200);
    expect(response.headers["access-control-allow-origin"]).toBe("http://localhost:8081");
    expect(response.headers.vary).toContain("Origin");
  });

  it("does not grant CORS access to an unconfigured origin", async () => {
    const app = createApp();

    const response = await request(app)
      .get("/health/live")
      .set("Origin", "https://example.invalid");

    expect(response.status).toBe(200);
    expect(response.headers["access-control-allow-origin"]).toBeUndefined();
  });

  it("answers browser CORS preflight requests", async () => {
    const app = createApp();

    const response = await request(app)
      .options("/centers")
      .set("Origin", "http://localhost:8081")
      .set("Access-Control-Request-Method", "GET");

    expect(response.status).toBe(204);
    expect(response.headers["access-control-allow-methods"]).toContain("GET");
    expect(response.headers["access-control-allow-headers"]).toContain("Authorization");
  });

  it("redirects /docs to the canonical Swagger UI path", async () => {
    const app = createApp();

    const response = await request(app).get("/docs");

    expect(response.status).toBe(301);
    expect(response.headers.location).toMatch(/\/docs\/$/);
  });

  it("serves the Swagger UI at /docs/", async () => {
    const app = createApp();

    const response = await request(app).get("/docs/");

    expect(response.status).toBe(200);
    expect(response.headers["content-type"]).toContain("text/html");
    expect(response.text).toContain("swagger-ui");
    expect(response.text).toContain("Recicla Palhoça");
  });

  it("opens the Swagger UI when following the /docs redirect", async () => {
    const app = createApp();

    const response = await request(app).get("/docs").redirects(1);

    expect(response.status).toBe(200);
    expect(response.headers["content-type"]).toContain("text/html");
    expect(response.text).toContain("swagger-ui");
  });

  it("serves the OpenAPI YAML from the same API host", async () => {
    const app = createApp();

    const response = await request(app).get("/openapi.yaml");

    expect(response.status).toBe(200);
    expect(response.headers["content-type"]).toContain("yaml");
    expect(response.text).toContain("openapi: 3.1.0");
    expect(response.text).toContain("/centers/{id}:");
    expect(response.text).toContain("bearerAuth");
  });

  it("returns a predictable 404 for unknown routes", async () => {
    const app = createApp();

    const response = await request(app).get("/rota-inexistente");

    expect(response.status).toBe(404);
    expect(response.body.error).toBe("not_found");
  });
});
