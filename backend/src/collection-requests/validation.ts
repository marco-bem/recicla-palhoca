function field(value: unknown, label: string, max: number, optional = false) {
  if (optional && (value === undefined || value === null)) return "";
  if (typeof value !== "string" || value.trim().length > max || (!optional && !value.trim())) {
    throw new Error(`Informe um valor válido para ${label} (até ${max} caracteres).`);
  }
  return value.trim();
}

function positiveId(value: unknown): value is number {
  return typeof value === "number" && Number.isSafeInteger(value) && value > 0;
}

export function parseCollectionRequest(input: unknown) {
  if (!input || typeof input !== "object" || Array.isArray(input)) throw new Error("Informe os dados da coleta.");
  const body = input as Record<string, unknown>;
  const { centerId, materialIds } = body;
  if (!positiveId(centerId)) throw new Error("Informe um centro válido.");
  if (!Array.isArray(materialIds) || !materialIds.length || !materialIds.every(positiveId)
      || new Set(materialIds).size !== materialIds.length) {
    throw new Error("Selecione ao menos um material válido, sem repetir.");
  }

  const requesterPhone = normalizeRequesterPhone(body.requesterPhone);
  const postalCode = field(body.postalCode, "CEP", 9);
  if (!/^\d{5}-?\d{3}$/.test(postalCode)) throw new Error("Informe um CEP com oito dígitos.");
  const state = field(body.state, "UF", 2).toUpperCase();
  if (!/^[A-Z]{2}$/.test(state)) throw new Error("Informe a UF com duas letras.");

  const preferredDate = field(body.preferredDate, "data preferencial", 10, true);
  if (preferredDate) {
    const date = new Date(preferredDate + "T00:00:00Z");
    if (!/^[1-9]\d{3}-\d{2}-\d{2}$/.test(preferredDate)
        || Number.isNaN(date.getTime()) || date.toISOString().slice(0, 10) !== preferredDate) {
      throw new Error("Informe uma data preferencial válida.");
    }
  }

  return {
    centerId,
    materialIds,
    requesterName: field(body.requesterName, "nome", 120),
    requesterPhone,
    postalCode: postalCode.replace("-", ""),
    street: field(body.street, "logradouro", 160),
    streetNumber: field(body.streetNumber, "número", 20),
    complement: field(body.complement, "complemento", 100, true) || null,
    neighborhood: field(body.neighborhood, "bairro", 100),
    city: field(body.city, "município", 100),
    state,
    preferredDate: preferredDate || null,
    preferredPeriod: field(body.preferredPeriod, "período preferencial", 20, true) || null,
    notes: field(body.notes, "observações", 500, true) || null
  };
}

export type CollectionRequestInput = ReturnType<typeof parseCollectionRequest>;

function normalizeRequesterPhone(value: unknown) {
  const phone = field(value, "telefone", 24).replace(/[\s()+-]/g, "");
  if (!/^\d{10,13}$/.test(phone)) throw new Error("Informe um telefone válido com DDD.");
  return phone;
}

export function parseCollectionRequestLookup(input: unknown) {
  if (!input || typeof input !== "object" || Array.isArray(input)) {
    throw new Error("Informe o protocolo e o telefone.");
  }
  const body = input as Record<string, unknown>;
  const protocol = field(body.protocol, "protocolo", 36).toLowerCase();
  const shortCode = /^rc-(?:[a-z0-9]{4}|[a-f0-9]{12})$/.test(protocol);
  if (!shortCode && !/^[a-f0-9]{8}(?:-[a-f0-9]{4}){3}-[a-f0-9]{12}$/.test(protocol)) {
    throw new Error("Informe um protocolo válido.");
  }
  return { protocol: shortCode ? protocol.toUpperCase() : protocol, requesterPhone: normalizeRequesterPhone(body.requesterPhone) };
}

export type CollectionRequestLookup = ReturnType<typeof parseCollectionRequestLookup>;
