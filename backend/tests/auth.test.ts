import request from "supertest";
import bcrypt from "bcryptjs";
import { createApp } from "../src/app";
import { AuthRepositoryError } from "../src/auth/types";
import type { AuthRepository, AuthUser, StoredAuthUser } from "../src/auth/types";
import type {
  CenterFilters,
  CenterInput,
  CenterProfile,
  CentersRepository
} from "../src/centers/types";

const JWT_SECRET = "test-only-secret-with-at-least-thirty-two-bytes";
const PASSWORD = "senha-segura-com-mais-de-10";
const sampleCenter: CenterProfile = {
  id: 11,
  name: "Centro de Teste",
  publicPhone: "4833334444",
  address: {
    postalCode: "88130000",
    street: "Rua de Teste",
    streetNumber: "10",
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

const validCenterInput: CenterInput = {
  name: "Centro de Teste",
  publicPhone: "4833334444",
  postalCode: "88130000",
  street: "Rua de Teste",
  streetNumber: "10",
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

describe("Autenticação do responsável", () => {
  let authRepository: jest.Mocked<AuthRepository>;
  let centersRepository: jest.Mocked<CentersRepository>;
  let storedUser: StoredAuthUser | null;

  function createAuthRepositoryMock(): jest.Mocked<AuthRepository> {
    return {
      createUser: jest.fn<Promise<AuthUser>, [string, string, string]>(),
      findByEmail: jest.fn<Promise<StoredAuthUser | null>, [string]>(),
      findActiveById: jest.fn<Promise<AuthUser | null>, [number]>()
    };
  }

  function createCentersRepositoryMock(): jest.Mocked<CentersRepository> {
    return {
      listPublic: jest.fn<Promise<CenterProfile[]>, [CenterFilters]>(),
      findForUser: jest.fn<Promise<CenterProfile | null>, [number]>(),
      findPublicById: jest.fn<Promise<CenterProfile | null>, [number]>(),
      createForUser: jest.fn<Promise<CenterProfile>, [number, CenterInput]>(),
      updateForUser: jest.fn<Promise<CenterProfile | null>, [number, number, CenterInput]>(),
      deactivateForUser: jest.fn<Promise<boolean>, [number, number]>()
    };
  }

  function makeApp() {
    return createApp(async () => undefined, {
      authRepository,
      centersRepository,
      jwtSecret: JWT_SECRET
    });
  }

  async function registerAndGetToken() {
    const response = await request(makeApp()).post("/auth/register").send({
      fullName: "Responsável de Teste",
      email: "RESPONSAVEL@example.com",
      password: PASSWORD
    });
    expect(response.status).toBe(201);
    return response.body.token as string;
  }

  beforeEach(() => {
    storedUser = null;
    authRepository = createAuthRepositoryMock();
    centersRepository = createCentersRepositoryMock();

    authRepository.createUser.mockImplementation(async (fullName, email, passwordHash) => {
      storedUser = { id: 7, fullName, email, passwordHash, isActive: true };
      return { id: storedUser.id, fullName, email };
    });
    authRepository.findByEmail.mockImplementation(async (email) =>
      storedUser?.email === email ? storedUser : null
    );
    authRepository.findActiveById.mockImplementation(async (id) =>
      storedUser && storedUser.id === id && storedUser.isActive
        ? { id: storedUser.id, fullName: storedUser.fullName, email: storedUser.email }
        : null
    );

    centersRepository.createForUser.mockResolvedValue(sampleCenter);
    centersRepository.listPublic.mockResolvedValue([]);
    centersRepository.findPublicById.mockResolvedValue(null);
    centersRepository.updateForUser.mockResolvedValue(sampleCenter);
    centersRepository.deactivateForUser.mockResolvedValue(true);
  });

  it("registra conta com e-mail normalizado, hash de senha e token", async () => {
    const response = await request(makeApp()).post("/auth/register").send({
      fullName: "  Responsável de Teste  ",
      email: "RESPONSAVEL@example.com",
      password: PASSWORD
    });

    expect(response.status).toBe(201);
    expect(response.body.data).toEqual({
      id: 7,
      fullName: "Responsável de Teste",
      email: "responsavel@example.com"
    });
    expect(response.body.data.passwordHash).toBeUndefined();
    expect(response.body.tokenType).toBe("Bearer");
    expect(response.body.expiresIn).toBe(3600);
    expect(storedUser).not.toBeNull();
    expect(storedUser?.passwordHash).not.toBe(PASSWORD);
    expect(await bcrypt.compare(PASSWORD, storedUser!.passwordHash)).toBe(true);
  });

  it("rejeita senha menor que 10 caracteres sem gravar usuário", async () => {
    const response = await request(makeApp()).post("/auth/register").send({
      fullName: "Responsável",
      email: "responsavel@example.com",
      password: "curta"
    });

    expect(response.status).toBe(400);
    expect(authRepository.createUser).not.toHaveBeenCalled();
  });

  it("responde conflito para e-mail já cadastrado", async () => {
    authRepository.createUser.mockRejectedValue(new AuthRepositoryError("email_already_exists"));

    const response = await request(makeApp()).post("/auth/register").send({
      fullName: "Responsável",
      email: "responsavel@example.com",
      password: PASSWORD
    });

    expect(response.status).toBe(409);
    expect(response.body.error).toBe("email_already_exists");
  });

  it("autentica credenciais válidas e retorna token sem hash de senha", async () => {
    await registerAndGetToken();

    const response = await request(makeApp()).post("/auth/login").send({
      email: "RESPONSAVEL@example.com",
      password: PASSWORD
    });

    expect(response.status).toBe(200);
    expect(response.body.data.email).toBe("responsavel@example.com");
    expect(response.body.data.passwordHash).toBeUndefined();
    expect(typeof response.body.token).toBe("string");
  });

  it("usa mensagem genérica para credenciais inválidas", async () => {
    const response = await request(makeApp()).post("/auth/login").send({
      email: "nao-existe@example.com",
      password: PASSWORD
    });

    expect(response.status).toBe(401);
    expect(response.body).toEqual({
      error: "invalid_credentials",
      message: "E-mail ou senha inválidos."
    });
  });

  it("usa o token Bearer para consultar o usuário autenticado", async () => {
    const token = await registerAndGetToken();

    const response = await request(makeApp())
      .get("/auth/me")
      .set("Authorization", "Bearer " + token);

    expect(response.status).toBe(200);
    expect(response.body.data).toEqual({
      id: 7,
      fullName: "Responsável de Teste",
      email: "responsavel@example.com"
    });
  });

  it("usa a identidade do token para permitir cadastro de centro", async () => {
    const token = await registerAndGetToken();

    const response = await request(makeApp())
      .post("/centers")
      .set("Authorization", "Bearer " + token)
      .send(validCenterInput);

    expect(response.status).toBe(201);
    expect(centersRepository.createForUser).toHaveBeenCalledWith(
      7,
      expect.objectContaining({ name: validCenterInput.name })
    );
  });

  it("rejeita token inválido antes de acessar rotas protegidas", async () => {
    const response = await request(makeApp())
      .get("/auth/me")
      .set("Authorization", "Bearer token-invalido");

    expect(response.status).toBe(401);
    expect(authRepository.findActiveById).not.toHaveBeenCalled();
  });
});
