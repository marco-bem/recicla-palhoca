import {
  parseCenterFilters,
  parseCenterId,
  parseCenterInput
} from "../src/centers/validation";

const validBody: Record<string, unknown> = {
  name: "Centro de Reciclagem",
  publicPhone: "4833334444",
  postalCode: "88130-000",
  street: "Rua de Teste",
  streetNumber: "100",
  addressComplement: null,
  neighborhood: "Centro",
  latitude: -27.6,
  longitude: -48.7,
  acceptsDropoff: true,
  offersPickup: false,
  openingHours: [
    { dayOfWeek: 1, periodNumber: 1, opensAt: "09:00", closesAt: "17:00" }
  ],
  materialIds: [5]
};

describe("Validação de identificadores de centros", () => {
  it("converte identificador positivo para número", () => {
    expect(parseCenterId("42")).toEqual({ ok: true, value: 42 });
  });

  it.each([undefined, null, 1, "0", "01", "-1", "1.5", "abc", "9007199254740992"])(
    "rejeita identificador inválido: %s",
    (value) => {
      expect(parseCenterId(value).ok).toBe(false);
    }
  );
});

describe("Validação dos filtros de centros", () => {
  it("normaliza texto e interpreta o filtro booleano", () => {
    expect(parseCenterFilters({
      q: "  reciclagem ",
      neighborhood: " Centro ",
      material: " papel ",
      offersPickup: "false"
    })).toEqual({
      ok: true,
      value: {
        q: "reciclagem",
        neighborhood: "Centro",
        material: "papel",
        offersPickup: false
      }
    });
  });

  it("retorna objeto vazio quando nenhum filtro é informado", () => {
    expect(parseCenterFilters({})).toEqual({ ok: true, value: {} });
  });

  it("ignora filtros de texto vazios", () => {
    expect(parseCenterFilters({ q: "  ", neighborhood: "", material: " " }))
      .toEqual({ ok: true, value: {} });
  });

  it.each([null, undefined, [], "q=papel", 10])(
    "rejeita estrutura de filtros que não seja objeto: %s",
    (query) => {
      expect(parseCenterFilters(query).ok).toBe(false);
    }
  );

  it.each(["q", "neighborhood", "material"])(
    "rejeita filtro %s informado em formato não textual",
    (field) => {
      expect(parseCenterFilters({ [field]: ["papel", "vidro"] }).ok).toBe(false);
    }
  );

  it.each([
    ["q", "x".repeat(161)],
    ["neighborhood", "x".repeat(101)],
    ["material", "x".repeat(121)]
  ])("rejeita filtro %s acima do limite", (field, value) => {
    expect(parseCenterFilters({ [field]: value }).ok).toBe(false);
  });

  it.each(["true", "false"])("aceita offersPickup=%s", (value) => {
    expect(parseCenterFilters({ offersPickup: value }).ok).toBe(true);
  });

  it.each(["sim", "1", "", true, false, ["true"]])(
    "rejeita offersPickup inválido: %s",
    (value) => {
      expect(parseCenterFilters({ offersPickup: value }).ok).toBe(false);
    }
  );
});

describe("Validação do cadastro e atualização de centros", () => {
  it("normaliza os campos e horários de uma entrada válida", () => {
    const result = parseCenterInput({
      ...validBody,
      name: "  Centro de Reciclagem  ",
      postalCode: "88130-000",
      addressComplement: "  Bloco A ",
      state: "sc",
      openingHours: [
        { dayOfWeek: 1, periodNumber: 1, opensAt: " 09:00 ", closesAt: "17:00:00" },
        { dayOfWeek: 1, periodNumber: 2, opensAt: "18:00", closesAt: "20:00" }
      ]
    });

    expect(result).toEqual({
      ok: true,
      value: {
        name: "Centro de Reciclagem",
        publicPhone: "4833334444",
        postalCode: "88130000",
        street: "Rua de Teste",
        streetNumber: "100",
        addressComplement: "Bloco A",
        neighborhood: "Centro",
        city: "Palhoça",
        state: "SC",
        latitude: -27.6,
        longitude: -48.7,
        acceptsDropoff: true,
        offersPickup: false,
        openingHours: [
          { dayOfWeek: 1, periodNumber: 1, opensAt: "09:00:00", closesAt: "17:00:00" },
          { dayOfWeek: 1, periodNumber: 2, opensAt: "18:00:00", closesAt: "20:00:00" }
        ],
        materialIds: [5]
      }
    });
  });

  it("aplica município e UF padrão quando não são informados", () => {
    const { city: _city, state: _state, ...body } = validBody;
    const result = parseCenterInput(body);
    expect(result).toMatchObject({
      ok: true,
      value: { city: "Palhoça", state: "SC" }
    });
  });

  it.each([null, undefined, [], "json", 7])(
    "rejeita corpo que não seja objeto: %s",
    (body) => {
      expect(parseCenterInput(body).ok).toBe(false);
    }
  );

  it.each([
    "name",
    "publicPhone",
    "postalCode",
    "street",
    "streetNumber",
    "neighborhood"
  ])("rejeita o campo obrigatório %s vazio", (field) => {
    expect(parseCenterInput({ ...validBody, [field]: "  " }).ok).toBe(false);
  });

  it.each([
    ["name", "x".repeat(161)],
    ["publicPhone", "1".repeat(21)],
    ["postalCode", "1".repeat(10)],
    ["street", "x".repeat(161)],
    ["streetNumber", "1".repeat(21)],
    ["neighborhood", "x".repeat(101)]
  ])("rejeita o campo %s acima do limite", (field, value) => {
    expect(parseCenterInput({ ...validBody, [field]: value }).ok).toBe(false);
  });

  it.each(["8813000", "881300000", "88.130-000", "abcdefgh"])(
    "rejeita CEP inválido: %s",
    (postalCode) => {
      expect(parseCenterInput({ ...validBody, postalCode }).ok).toBe(false);
    }
  );

  it("aceita CEP com ou sem hífen e normaliza para oito dígitos", () => {
    expect(parseCenterInput({ ...validBody, postalCode: "88130000" }))
      .toMatchObject({ ok: true, value: { postalCode: "88130000" } });
  });

  it("rejeita complemento que não seja texto ou exceda 100 caracteres", () => {
    expect(parseCenterInput({ ...validBody, addressComplement: 10 }).ok).toBe(false);
    expect(parseCenterInput({ ...validBody, addressComplement: "x".repeat(101) }).ok).toBe(false);
  });

  it("converte complemento composto apenas por espaços em null", () => {
    expect(parseCenterInput({ ...validBody, addressComplement: "   " }))
      .toMatchObject({ ok: true, value: { addressComplement: null } });
  });

  it.each([null, 10, "", "x".repeat(101)])(
    "rejeita município inválido: %s",
    (city) => {
      expect(parseCenterInput({ ...validBody, city }).ok).toBe(false);
    }
  );

  it.each(["S", "SCC", "1C", null, 10])(
    "rejeita UF inválida: %s",
    (state) => {
      expect(parseCenterInput({ ...validBody, state }).ok).toBe(false);
    }
  );

  it.each([NaN, Infinity, -91, 91, "27.6", null])(
    "rejeita latitude inválida: %s",
    (latitude) => {
      expect(parseCenterInput({ ...validBody, latitude }).ok).toBe(false);
    }
  );

  it.each([NaN, Infinity, -181, 181, "-48.7", null])(
    "rejeita longitude inválida: %s",
    (longitude) => {
      expect(parseCenterInput({ ...validBody, longitude }).ok).toBe(false);
    }
  );

  it("aceita coordenadas nos limites geográficos", () => {
    expect(parseCenterInput({ ...validBody, latitude: -90, longitude: 180 }).ok).toBe(true);
  });

  it("exige os indicadores de serviços como booleanos", () => {
    expect(parseCenterInput({ ...validBody, acceptsDropoff: "true" }).ok).toBe(false);
    expect(parseCenterInput({ ...validBody, offersPickup: 1 }).ok).toBe(false);
  });

  it.each([undefined, null, "segunda", 10])(
    "rejeita horários que não são informados como lista: %s",
    (openingHours) => {
      expect(parseCenterInput({ ...validBody, openingHours }).ok).toBe(false);
    }
  );

  it("rejeita lista de horários vazia ou acima de 100 períodos", () => {
    expect(parseCenterInput({ ...validBody, openingHours: [] }).ok).toBe(false);
    expect(parseCenterInput({
      ...validBody,
      openingHours: Array.from({ length: 101 }, () => ({
        dayOfWeek: 1,
        periodNumber: 1,
        opensAt: "09:00",
        closesAt: "17:00"
      }))
    }).ok).toBe(false);
  });

  it("rejeita período de atendimento que não seja objeto", () => {
    expect(parseCenterInput({ ...validBody, openingHours: [null] }).ok).toBe(false);
  });

  it.each([
    { dayOfWeek: 0, periodNumber: 1, opensAt: "09:00", closesAt: "17:00" },
    { dayOfWeek: 8, periodNumber: 1, opensAt: "09:00", closesAt: "17:00" },
    { dayOfWeek: 1.5, periodNumber: 1, opensAt: "09:00", closesAt: "17:00" },
    { dayOfWeek: 1, periodNumber: 0, opensAt: "09:00", closesAt: "17:00" },
    { dayOfWeek: 1, periodNumber: 256, opensAt: "09:00", closesAt: "17:00" },
    { dayOfWeek: 1, periodNumber: 1, opensAt: "24:00", closesAt: "25:00" },
    { dayOfWeek: 1, periodNumber: 1, opensAt: "12:00", closesAt: "12:00" },
    { dayOfWeek: 1, periodNumber: 1, opensAt: "18:00", closesAt: "09:00" }
  ])("rejeita período ou horário inválido", (hour) => {
    expect(parseCenterInput({ ...validBody, openingHours: [hour] }).ok).toBe(false);
  });

  it("rejeita número de período duplicado no mesmo dia", () => {
    expect(parseCenterInput({
      ...validBody,
      openingHours: [
        { dayOfWeek: 1, periodNumber: 1, opensAt: "09:00", closesAt: "12:00" },
        { dayOfWeek: 1, periodNumber: 1, opensAt: "13:00", closesAt: "17:00" }
      ]
    }).ok).toBe(false);
  });

  it("permite o mesmo número de período em dias diferentes", () => {
    expect(parseCenterInput({
      ...validBody,
      openingHours: [
        { dayOfWeek: 1, periodNumber: 1, opensAt: "09:00", closesAt: "12:00" },
        { dayOfWeek: 2, periodNumber: 1, opensAt: "09:00", closesAt: "12:00" }
      ]
    }).ok).toBe(true);
  });

  it.each([undefined, null, "5", {}])(
    "rejeita seleção de materiais que não seja uma lista: %s",
    (materialIds) => {
      expect(parseCenterInput({ ...validBody, materialIds }).ok).toBe(false);
    }
  );

  it("rejeita lista de materiais vazia ou acima de 50 itens", () => {
    expect(parseCenterInput({ ...validBody, materialIds: [] }).ok).toBe(false);
    expect(parseCenterInput({
      ...validBody,
      materialIds: Array.from({ length: 51 }, (_, index) => index + 1)
    }).ok).toBe(false);
  });

  it.each([0, -1, 1.5, Number.MAX_SAFE_INTEGER + 1, "5", null])(
    "rejeita identificador de material inválido: %s",
    (id) => {
      expect(parseCenterInput({ ...validBody, materialIds: [id] }).ok).toBe(false);
    }
  );

  it("rejeita materiais duplicados", () => {
    expect(parseCenterInput({ ...validBody, materialIds: [5, 5] }).ok).toBe(false);
  });

  it("aceita até 50 materiais únicos", () => {
    expect(parseCenterInput({
      ...validBody,
      materialIds: Array.from({ length: 50 }, (_, index) => index + 1)
    }).ok).toBe(true);
  });
});
