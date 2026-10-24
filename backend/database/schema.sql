-- Recicla Palhoça — esquema inicial do banco de dados
-- Banco-alvo: MySQL 8.0.16+ (para validação de CHECK constraints).
-- Execute em uma base de dados previamente criada/selecionada.
-- Este arquivo define estrutura e integridade; não insere dados de exemplo.

CREATE TABLE users (
    id BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
    full_name VARCHAR(120) NOT NULL,
    email VARCHAR(191) NOT NULL,
    password_hash VARCHAR(255) NOT NULL,
    is_active BOOLEAN NOT NULL DEFAULT TRUE,
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    CONSTRAINT pk_users PRIMARY KEY (id),
    CONSTRAINT uq_users_email UNIQUE (email)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

CREATE TABLE materials (
    id BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
    name VARCHAR(100) NOT NULL,
    slug VARCHAR(120) NOT NULL,
    description VARCHAR(500) NULL,
    is_active BOOLEAN NOT NULL DEFAULT TRUE,
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    CONSTRAINT pk_materials PRIMARY KEY (id),
    CONSTRAINT uq_materials_name UNIQUE (name),
    CONSTRAINT uq_materials_slug UNIQUE (slug)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

CREATE TABLE recycling_centers (
    id BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
    responsible_user_id BIGINT UNSIGNED NOT NULL,
    name VARCHAR(160) NOT NULL,
    public_phone VARCHAR(20) NOT NULL,
    postal_code VARCHAR(8) NOT NULL,
    street VARCHAR(160) NOT NULL,
    street_number VARCHAR(20) NOT NULL,
    address_complement VARCHAR(100) NULL,
    neighborhood VARCHAR(100) NOT NULL,
    city VARCHAR(100) NOT NULL DEFAULT 'Palhoça',
    state CHAR(2) NOT NULL DEFAULT 'SC',
    latitude DECIMAL(10,7) NULL,
    longitude DECIMAL(11,7) NULL,
    accepts_dropoff BOOLEAN NOT NULL DEFAULT FALSE,
    offers_pickup BOOLEAN NOT NULL DEFAULT FALSE,
    is_active BOOLEAN NOT NULL DEFAULT FALSE,
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    CONSTRAINT pk_recycling_centers PRIMARY KEY (id),
    CONSTRAINT uq_recycling_centers_responsible UNIQUE (responsible_user_id),
    CONSTRAINT uq_recycling_centers_id_responsible UNIQUE (id, responsible_user_id),
    CONSTRAINT fk_centers_responsible_user FOREIGN KEY (responsible_user_id)
        REFERENCES users (id) ON UPDATE RESTRICT ON DELETE RESTRICT,
    CONSTRAINT chk_centers_postal_code CHECK (postal_code REGEXP '^[0-9]{8}$'),
    CONSTRAINT chk_centers_latitude CHECK (latitude IS NULL OR latitude BETWEEN -90 AND 90),
    CONSTRAINT chk_centers_longitude CHECK (longitude IS NULL OR longitude BETWEEN -180 AND 180),
    INDEX idx_centers_public_filters (is_active, offers_pickup, accepts_dropoff),
    INDEX idx_centers_neighborhood (neighborhood),
    INDEX idx_centers_name (name)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

CREATE TABLE center_opening_hours (
    id BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
    center_id BIGINT UNSIGNED NOT NULL,
    day_of_week TINYINT UNSIGNED NOT NULL COMMENT 'ISO weekday: 1=Monday ... 7=Sunday',
    period_number TINYINT UNSIGNED NOT NULL DEFAULT 1,
    opens_at TIME NOT NULL,
    closes_at TIME NOT NULL,
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    CONSTRAINT pk_center_opening_hours PRIMARY KEY (id),
    CONSTRAINT uq_center_hours_period UNIQUE (center_id, day_of_week, period_number),
    CONSTRAINT fk_opening_hours_center FOREIGN KEY (center_id)
        REFERENCES recycling_centers (id) ON UPDATE RESTRICT ON DELETE RESTRICT,
    CONSTRAINT chk_opening_hours_day CHECK (day_of_week BETWEEN 1 AND 7),
    CONSTRAINT chk_opening_hours_period CHECK (period_number BETWEEN 1 AND 2),
    CONSTRAINT chk_opening_hours_range CHECK (opens_at < closes_at),
    INDEX idx_opening_hours_center_day (center_id, day_of_week)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

CREATE TABLE center_materials (
    center_id BIGINT UNSIGNED NOT NULL,
    material_id BIGINT UNSIGNED NOT NULL,
    is_accepted BOOLEAN NOT NULL DEFAULT TRUE,
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    CONSTRAINT pk_center_materials PRIMARY KEY (center_id, material_id),
    CONSTRAINT fk_center_materials_center FOREIGN KEY (center_id)
        REFERENCES recycling_centers (id) ON UPDATE RESTRICT ON DELETE RESTRICT,
    CONSTRAINT fk_center_materials_material FOREIGN KEY (material_id)
        REFERENCES materials (id) ON UPDATE RESTRICT ON DELETE RESTRICT,
    INDEX idx_center_materials_material (material_id, is_accepted)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

CREATE TABLE collection_requests (
    id BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
    protocol CHAR(36) CHARACTER SET ascii COLLATE ascii_bin NOT NULL,
    center_id BIGINT UNSIGNED NOT NULL,
    requester_name VARCHAR(120) NOT NULL,
    requester_phone VARCHAR(20) NOT NULL COMMENT 'Normalizar no backend; dado pessoal restrito',
    pickup_postal_code VARCHAR(8) NOT NULL,
    pickup_street VARCHAR(160) NOT NULL,
    pickup_street_number VARCHAR(20) NOT NULL,
    pickup_address_complement VARCHAR(100) NULL,
    pickup_neighborhood VARCHAR(100) NOT NULL,
    pickup_city VARCHAR(100) NOT NULL,
    pickup_state CHAR(2) NOT NULL,
    preferred_date DATE NULL,
    preferred_period VARCHAR(20) NULL COMMENT 'Preferência, não representa agendamento confirmado',
    notes VARCHAR(500) NULL,
    status ENUM('PENDENTE', 'ACEITA', 'RECUSADA', 'CONCLUIDA') NOT NULL DEFAULT 'PENDENTE',
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    CONSTRAINT pk_collection_requests PRIMARY KEY (id),
    CONSTRAINT uq_collection_requests_protocol UNIQUE (protocol),
    CONSTRAINT uq_collection_requests_id_center UNIQUE (id, center_id),
    CONSTRAINT fk_collection_requests_center FOREIGN KEY (center_id)
        REFERENCES recycling_centers (id) ON UPDATE RESTRICT ON DELETE RESTRICT,
    CONSTRAINT chk_requests_pickup_postal_code CHECK (pickup_postal_code REGEXP '^[0-9]{8}$'),
    INDEX idx_requests_center_status_created (center_id, status, created_at),
    INDEX idx_requests_created (created_at)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

CREATE TABLE collection_request_materials (
    request_id BIGINT UNSIGNED NOT NULL,
    center_id BIGINT UNSIGNED NOT NULL,
    material_id BIGINT UNSIGNED NOT NULL,
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT pk_collection_request_materials PRIMARY KEY (request_id, material_id),
    CONSTRAINT fk_request_materials_request_center FOREIGN KEY (request_id, center_id)
        REFERENCES collection_requests (id, center_id) ON UPDATE RESTRICT ON DELETE RESTRICT,
    CONSTRAINT fk_request_materials_center_material FOREIGN KEY (center_id, material_id)
        REFERENCES center_materials (center_id, material_id) ON UPDATE RESTRICT ON DELETE RESTRICT,
    INDEX idx_request_materials_center_material (center_id, material_id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

CREATE TABLE collection_request_status_history (
    id BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
    request_id BIGINT UNSIGNED NOT NULL,
    previous_status ENUM('PENDENTE', 'ACEITA', 'RECUSADA', 'CONCLUIDA') NULL,
    new_status ENUM('PENDENTE', 'ACEITA', 'RECUSADA', 'CONCLUIDA') NOT NULL,
    changed_by_user_id BIGINT UNSIGNED NULL COMMENT 'NULL para evento inicial registrado pelo sistema',
    reason VARCHAR(500) NULL COMMENT 'Obrigatória pela API ao recusar solicitação',
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT pk_request_status_history PRIMARY KEY (id),
    CONSTRAINT fk_status_history_request FOREIGN KEY (request_id)
        REFERENCES collection_requests (id) ON UPDATE RESTRICT ON DELETE RESTRICT,
    CONSTRAINT fk_status_history_user FOREIGN KEY (changed_by_user_id)
        REFERENCES users (id) ON UPDATE RESTRICT ON DELETE RESTRICT,
    CONSTRAINT chk_status_history_reason CHECK (
        new_status <> 'RECUSADA' OR (reason IS NOT NULL AND CHAR_LENGTH(TRIM(reason)) > 0)
    ),
    CONSTRAINT chk_status_history_initial CHECK (
        (previous_status IS NULL AND new_status = 'PENDENTE' AND changed_by_user_id IS NULL)
        OR
        (previous_status IS NOT NULL AND changed_by_user_id IS NOT NULL)
    ),
    INDEX idx_status_history_request_created (request_id, created_at)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
