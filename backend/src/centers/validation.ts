import type { CenterFilters, CenterInput, OpeningHourInput } from "./types";

export type ValidationResult<T> =
  | { ok: true; value: T }
  | { ok: false; error: string };

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}

function requiredText(
  body: Record<string, unknown>,
  field: string,
  maxLength: number
): string | null {
  const value = body[field];
  if (typeof value !== "string") return null;
  const normalized = value.trim();
  if (!normalized || normalized.length > maxLength) return null;
  return normalized;
}

function parseTime(value: unknown): string | null {
  if (typeof value !== "string") return null;
  const normalized = value.trim();
  if (!/^(?:[01]\d|2[0-3]):[0-5]\d(?::[0-5]\d)?$/.test(normalized)) return null;
  return normalized.length === 5 ? normalized + ":00" : normalized;
}

export function parseCenterId(value: unknown): ValidationResult<number> {
  if (typeof value !== "string" || !/^[1-9]\d*$/.test(value)) {
    return { ok: false, error: "O identificador do centro deve ser um inteiro positivo." };
  }
  const id = Number(value);
  if (!Number.isSafeInteger(id)) {
    return { ok: false, error: "O identificador do centro é inválido." };
  }
  return { ok: true, value: id };
}

export function parseCenterFilters(query: unknown): ValidationResult<CenterFilters> {
  if (!isRecord(query)) {
    return { ok: false, error: "Os filtros da consulta são inválidos." };
  }

  const filters: CenterFilters = {};
  const stringFilters: Array<[string, "q" | "neighborhood" | "material", number]> = [
    ["q", "q", 160],
    ["neighborhood", "neighborhood", 100],
    ["material", "material", 120]
  ];

  for (const [source, target, maxLength] of stringFilters) {
    const raw = query[source];
    if (raw === undefined) continue;
    if (typeof raw !== "string") {
      return { ok: false, error: "Cada filtro deve ser informado uma única vez como texto." };
    }
    const normalized = raw.trim();
    if (normalized.length > maxLength) {
      return { ok: false, error: "Um dos filtros excede o tamanho permitido." };
    }
    if (normalized) filters[target] = normalized;
  }

  if (query.offersPickup !== undefined) {
    if (query.offersPickup === "true") filters.offersPickup = true;
    else if (query.offersPickup === "false") filters.offersPickup = false;
    else return { ok: false, error: "offersPickup deve ser true ou false." };
  }

  return { ok: true, value: filters };
}

export function parseCenterInput(bodyValue: unknown): ValidationResult<CenterInput> {
  if (!isRecord(bodyValue)) {
    return { ok: false, error: "O corpo da requisição deve ser um objeto JSON." };
  }

  const name = requiredText(bodyValue, "name", 160);
  const publicPhone = requiredText(bodyValue, "publicPhone", 20);
  const rawPostalCode = requiredText(bodyValue, "postalCode", 9);
  const street = requiredText(bodyValue, "street", 160);
  const streetNumber = requiredText(bodyValue, "streetNumber", 20);
  const neighborhood = requiredText(bodyValue, "neighborhood", 100);

  if (!name || !publicPhone || !rawPostalCode || !street || !streetNumber || !neighborhood) {
    return {
      ok: false,
      error: "Informe nome, telefone público, CEP, logradouro, número e bairro dentro dos limites permitidos."
    };
  }

  if (!/^\d{5}-?\d{3}$/.test(rawPostalCode)) {
    return { ok: false, error: "O CEP deve conter oito dígitos, com hífen opcional." };
  }
  const postalCode = rawPostalCode.replace("-", "");

  const rawComplement = bodyValue.addressComplement;
  let addressComplement: string | null = null;
  if (rawComplement !== undefined && rawComplement !== null && rawComplement !== "") {
    if (typeof rawComplement !== "string" || rawComplement.trim().length > 100) {
      return { ok: false, error: "O complemento do endereço deve ter até 100 caracteres." };
    }
    addressComplement = rawComplement.trim() || null;
  }

  const rawCity = bodyValue.city === undefined ? "Palhoça" : bodyValue.city;
  const rawState = bodyValue.state === undefined ? "SC" : bodyValue.state;
  if (typeof rawCity !== "string" || !rawCity.trim() || rawCity.trim().length > 100) {
    return { ok: false, error: "O município é obrigatório e deve ter até 100 caracteres." };
  }
  if (typeof rawState !== "string" || !/^[A-Za-z]{2}$/.test(rawState.trim())) {
    return { ok: false, error: "A UF deve conter duas letras." };
  }

  const latitude = bodyValue.latitude;
  const longitude = bodyValue.longitude;
  if (typeof latitude !== "number" || !Number.isFinite(latitude) || latitude < -90 || latitude > 90) {
    return { ok: false, error: "A latitude deve ser um número entre -90 e 90." };
  }
  if (typeof longitude !== "number" || !Number.isFinite(longitude) || longitude < -180 || longitude > 180) {
    return { ok: false, error: "A longitude deve ser um número entre -180 e 180." };
  }

  if (typeof bodyValue.acceptsDropoff !== "boolean" || typeof bodyValue.offersPickup !== "boolean") {
    return { ok: false, error: "Informe acceptsDropoff e offersPickup como valores booleanos." };
  }

  const rawHours = bodyValue.openingHours;
  if (!Array.isArray(rawHours) || rawHours.length === 0 || rawHours.length > 100) {
    return { ok: false, error: "Informe ao menos um período de atendimento válido." };
  }

  const openingHours: OpeningHourInput[] = [];
  const periodKeys = new Set<string>();
  for (const item of rawHours) {
    if (!isRecord(item)) {
      return { ok: false, error: "Cada período de atendimento deve ser um objeto." };
    }
    const dayOfWeek = item.dayOfWeek;
    const periodNumber = item.periodNumber;
    const opensAt = parseTime(item.opensAt);
    const closesAt = parseTime(item.closesAt);

    if (
      typeof dayOfWeek !== "number" ||
      !Number.isInteger(dayOfWeek) ||
      dayOfWeek < 1 ||
      dayOfWeek > 7 ||
      typeof periodNumber !== "number" ||
      !Number.isInteger(periodNumber) ||
      periodNumber < 1 ||
      periodNumber > 255 ||
      !opensAt ||
      !closesAt ||
      opensAt >= closesAt
    ) {
      return {
        ok: false,
        error: "Confira dia da semana, período e horários; a abertura deve ser anterior ao fechamento."
      };
    }

    const key = dayOfWeek + ":" + periodNumber;
    if (periodKeys.has(key)) {
      return { ok: false, error: "Não repita o número de período para o mesmo dia." };
    }
    periodKeys.add(key);
    openingHours.push({ dayOfWeek, periodNumber, opensAt, closesAt });
  }

  const rawMaterialIds = bodyValue.materialIds;
  if (!Array.isArray(rawMaterialIds) || rawMaterialIds.length === 0 || rawMaterialIds.length > 50) {
    return { ok: false, error: "Selecione ao menos um material do catálogo." };
  }
  const materialIds: number[] = [];
  for (const id of rawMaterialIds) {
    if (typeof id !== "number" || !Number.isSafeInteger(id) || id < 1) {
      return { ok: false, error: "Os identificadores de material devem ser inteiros positivos." };
    }
    materialIds.push(id);
  }
  if (new Set(materialIds).size !== materialIds.length) {
    return { ok: false, error: "Não repita materiais no cadastro do centro." };
  }

  return {
    ok: true,
    value: {
      name,
      publicPhone,
      postalCode,
      street,
      streetNumber,
      addressComplement,
      neighborhood,
      city: rawCity.trim(),
      state: rawState.trim().toUpperCase(),
      latitude,
      longitude,
      acceptsDropoff: bodyValue.acceptsDropoff,
      offersPickup: bodyValue.offersPickup,
      openingHours,
      materialIds
    }
  };
}
