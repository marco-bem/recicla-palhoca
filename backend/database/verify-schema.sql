-- Recicla Palhoça — validação estrutural e transacional do schema
-- Execute no MySQL Workbench conectado ao schema recicla_palhoca.
-- O teste cria somente dados sintéticos dentro de uma transação e termina com ROLLBACK.
-- NÃO execute COMMIT neste teste. Se houver erro, execute ROLLBACK; antes de tentar novamente.

USE recicla_palhoca;

-- 1. Conferir a quantidade de tabelas base (esperado: 8).
SELECT COUNT(*) AS quantidade_tabelas
FROM information_schema.tables
WHERE table_schema = DATABASE()
  AND table_type = 'BASE TABLE';

-- 2. Conferir as restrições registradas.
-- Esperado: CHECK=9, FOREIGN KEY=9, PRIMARY KEY=8, UNIQUE=8.
SELECT
    CONSTRAINT_TYPE AS tipo,
    COUNT(*) AS quantidade
FROM information_schema.TABLE_CONSTRAINTS
WHERE CONSTRAINT_SCHEMA = DATABASE()
  AND CONSTRAINT_TYPE IN ('CHECK', 'FOREIGN KEY', 'PRIMARY KEY', 'UNIQUE')
GROUP BY CONSTRAINT_TYPE
ORDER BY CONSTRAINT_TYPE;

-- 3. Conferir quantos índices distintos existem por tabela.
-- O total esperado com este schema é 27; índices compostos aparecem em várias colunas,
-- por isso contamos nomes distintos de índice.
SELECT
    TABLE_NAME AS tabela,
    COUNT(DISTINCT INDEX_NAME) AS indices_distintos
FROM information_schema.STATISTICS
WHERE TABLE_SCHEMA = DATABASE()
GROUP BY TABLE_NAME
ORDER BY TABLE_NAME;

-- 4. Teste transacional: o ROLLBACK no final remove todos os registros de teste.
START TRANSACTION;

INSERT INTO users (full_name, email, password_hash, is_active)
VALUES (
    'Responsável Teste Transacional',
    'teste-modelagem@example.invalid',
    'hash-ficticio-sem-uso-autenticacao',
    TRUE
);
SET @test_user_id = LAST_INSERT_ID();

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
    @test_user_id,
    'CENTRO DE TESTE — DADO FICTÍCIO',
    '48999990000',
    '88130000',
    'Rua de Teste',
    '123',
    'Centro',
    'Palhoça',
    'SC',
    -27.6000000,
    -48.7000000,
    TRUE,
    TRUE,
    TRUE
);
SET @test_center_id = LAST_INSERT_ID();

INSERT INTO center_opening_hours (
    center_id,
    day_of_week,
    period_number,
    opens_at,
    closes_at
)
VALUES (@test_center_id, 1, 1, '09:00:00', '17:00:00');

INSERT INTO materials (name, slug, description, is_active)
VALUES (
    'Papelão — teste transacional',
    'papelao-teste-transacional',
    'Registro sintético para validar o modelo; não é dado de produção.',
    TRUE
);
SET @test_material_id = LAST_INSERT_ID();

INSERT INTO center_materials (center_id, material_id, is_accepted)
VALUES (@test_center_id, @test_material_id, TRUE);

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
    @test_center_id,
    'Solicitante Teste',
    '48999991111',
    '88130000',
    'Rua de Teste',
    '45',
    'Centro',
    'Palhoça',
    'SC',
    'Dado sintético de teste transacional.',
    'PENDENTE'
);
SET @test_request_id = LAST_INSERT_ID();

INSERT INTO collection_request_materials (request_id, center_id, material_id)
VALUES (@test_request_id, @test_center_id, @test_material_id);

INSERT INTO collection_request_status_history (
    request_id,
    previous_status,
    new_status,
    changed_by_user_id,
    reason
)
VALUES (@test_request_id, NULL, 'PENDENTE', NULL, NULL);

-- 5. Deve retornar uma linha com centro, responsável, material, pedido e evento inicial.
SELECT
    c.id AS center_id,
    c.name AS center_name,
    u.email AS responsible_email,
    oh.day_of_week,
    m.name AS material_name,
    r.protocol,
    r.status AS request_status,
    h.new_status AS initial_history_status
FROM recycling_centers c
JOIN users u
    ON u.id = c.responsible_user_id
JOIN center_opening_hours oh
    ON oh.center_id = c.id
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
WHERE u.email = 'teste-modelagem@example.invalid'
  AND m.slug = 'papelao-teste-transacional';

-- 6. Reverter todos os dados sintéticos criados nesta sessão.
ROLLBACK;

-- 7. Esperado após ROLLBACK: zero usuários e materiais de teste.
SELECT
    (SELECT COUNT(*) FROM users
     WHERE email = 'teste-modelagem@example.invalid') AS usuarios_teste_restantes,
    (SELECT COUNT(*) FROM materials
     WHERE slug = 'papelao-teste-transacional') AS materiais_teste_restantes;
