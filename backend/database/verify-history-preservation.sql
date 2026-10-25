-- Recicla Palhoça — teste de preservação do histórico após desativação
-- Execute no MySQL Workbench conectado ao schema recicla_palhoca.
-- Cria dados sintéticos em uma transação e termina com ROLLBACK.
-- NÃO execute COMMIT neste teste.

USE recicla_palhoca;

START TRANSACTION;

-- 1. Criar um responsável sintético e seu centro.
INSERT INTO users (full_name, email, password_hash, is_active)
VALUES (
    'Responsável Teste Histórico',
    'teste-historico@example.invalid',
    'hash-ficticio-sem-uso-autenticacao',
    TRUE
);
SET @history_test_user_id = LAST_INSERT_ID();

INSERT INTO recycling_centers (
    responsible_user_id,
    name,
    public_phone,
    postal_code,
    street,
    street_number,
    neighborhood,
    city,
    state,
    latitude,
    longitude,
    accepts_dropoff,
    offers_pickup,
    is_active
)
VALUES (
    @history_test_user_id,
    'CENTRO TESTE HISTÓRICO — DADO FICTÍCIO',
    '48999992222',
    '88130000',
    'Rua de Teste Histórico',
    '200',
    'Centro',
    'Palhoça',
    'SC',
    -27.6000000,
    -48.7000000,
    TRUE,
    TRUE,
    TRUE
);
SET @history_test_center_id = LAST_INSERT_ID();

INSERT INTO center_opening_hours (
    center_id, day_of_week, period_number, opens_at, closes_at
)
VALUES (@history_test_center_id, 1, 1, '09:00:00', '17:00:00');

-- 2. Criar um material aceito pelo centro.
INSERT INTO materials (name, slug, description, is_active)
VALUES (
    'Material Teste Histórico',
    'material-teste-historico',
    'Registro sintético usado apenas no teste de preservação do histórico.',
    TRUE
);
SET @history_test_material_id = LAST_INSERT_ID();

INSERT INTO center_materials (center_id, material_id, is_accepted)
VALUES (@history_test_center_id, @history_test_material_id, TRUE);

-- 3. Criar solicitação e registrar o estado inicial.
INSERT INTO collection_requests (
    protocol,
    center_id,
    requester_name,
    requester_phone,
    pickup_postal_code,
    pickup_street,
    pickup_street_number,
    pickup_neighborhood,
    pickup_city,
    pickup_state,
    notes,
    status
)
VALUES (
    UUID(),
    @history_test_center_id,
    'Solicitante Teste Histórico',
    '48999993333',
    '88130000',
    'Rua de Teste Histórico',
    '201',
    'Centro',
    'Palhoça',
    'SC',
    'Pedido sintético para validar preservação do histórico.',
    'PENDENTE'
);
SET @history_test_request_id = LAST_INSERT_ID();

INSERT INTO collection_request_materials (request_id, center_id, material_id)
VALUES (
    @history_test_request_id,
    @history_test_center_id,
    @history_test_material_id
);

INSERT INTO collection_request_status_history (
    request_id, previous_status, new_status, changed_by_user_id, reason
)
VALUES (
    @history_test_request_id, NULL, 'PENDENTE', NULL, NULL
);

-- 4. Simular o centro aceitando o pedido; gravar a transição no histórico.
UPDATE collection_requests
SET status = 'ACEITA'
WHERE id = @history_test_request_id
  AND center_id = @history_test_center_id
  AND status = 'PENDENTE';

INSERT INTO collection_request_status_history (
    request_id, previous_status, new_status, changed_by_user_id, reason
)
VALUES (
    @history_test_request_id, 'PENDENTE', 'ACEITA', @history_test_user_id, NULL
);

-- 5. Desativar logicamente o centro e o material.
-- Não apagar as linhas de centro, material nem associação.
UPDATE recycling_centers
SET is_active = FALSE
WHERE id = @history_test_center_id;

UPDATE materials
SET is_active = FALSE
WHERE id = @history_test_material_id;

UPDATE center_materials
SET is_accepted = FALSE
WHERE center_id = @history_test_center_id
  AND material_id = @history_test_material_id;

-- 6. Verificação resumida.
-- Esperado: center_active=0, material_active=0, material_accepted=0,
-- request_status=ACEITA, request_items=1, history_events=2,
-- initial_events=1, accepted_events=1.
SELECT
    c.id AS center_id,
    c.is_active AS center_active,
    m.id AS material_id,
    m.is_active AS material_active,
    cm.is_accepted AS material_accepted,
    r.id AS request_id,
    r.status AS request_status,
    COUNT(DISTINCT rm.material_id) AS request_items,
    COUNT(DISTINCT h.id) AS history_events,
    COUNT(DISTINCT CASE WHEN h.new_status = 'PENDENTE' THEN h.id END) AS initial_events,
    COUNT(DISTINCT CASE WHEN h.new_status = 'ACEITA' THEN h.id END) AS accepted_events
FROM recycling_centers c
JOIN users u
    ON u.id = c.responsible_user_id
JOIN center_materials cm
    ON cm.center_id = c.id
JOIN materials m
    ON m.id = cm.material_id
JOIN collection_requests r
    ON r.center_id = c.id
JOIN collection_request_materials rm
    ON rm.request_id = r.id
   AND rm.center_id = c.id
   AND rm.material_id = m.id
JOIN collection_request_status_history h
    ON h.request_id = r.id
WHERE u.email = 'teste-historico@example.invalid'
  AND m.slug = 'material-teste-historico'
  AND r.id = @history_test_request_id
GROUP BY
    c.id, c.is_active, m.id, m.is_active, cm.is_accepted,
    r.id, r.status;

-- 7. Verificação detalhada da linha do tempo.
-- Esperado: duas linhas ordenadas: NULL -> PENDENTE, depois PENDENTE -> ACEITA.
SELECT
    previous_status,
    new_status,
    changed_by_user_id,
    created_at
FROM collection_request_status_history
WHERE request_id = @history_test_request_id
ORDER BY id;

-- 8. Reverter TODOS os registros de teste da transação.
ROLLBACK;

-- 9. Esperado após o ROLLBACK: zero nas quatro contagens.
SELECT
    (SELECT COUNT(*) FROM users
     WHERE email = 'teste-historico@example.invalid') AS test_users_remaining,
    (SELECT COUNT(*) FROM recycling_centers
     WHERE name = 'CENTRO TESTE HISTÓRICO — DADO FICTÍCIO') AS test_centers_remaining,
    (SELECT COUNT(*) FROM materials
     WHERE slug = 'material-teste-historico') AS test_materials_remaining,
    (SELECT COUNT(*) FROM collection_requests
     WHERE requester_name = 'Solicitante Teste Histórico') AS test_requests_remaining;
