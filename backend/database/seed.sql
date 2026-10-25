-- Recicla Palhoça — catálogo inicial de materiais
-- MySQL 8.4. Pode ser executado novamente sem duplicar categorias.
-- Os materiais são categorias de referência; não indicam aceitação por um centro real.

USE recicla_palhoca;

START TRANSACTION;

INSERT INTO materials (name, slug, description, is_active)
VALUES
    ('Papel', 'papel',
     'Papéis recicláveis aceitos conforme as condições do centro.', TRUE),
    ('Papelão', 'papelao',
     'Papelão e caixas de papelão recicláveis.', TRUE),
    ('Plásticos', 'plasticos',
     'Embalagens e outros materiais plásticos recicláveis.', TRUE),
    ('Vidro', 'vidro',
     'Recipientes e embalagens de vidro recicláveis.', TRUE),
    ('Metais', 'metais',
     'Metais ferrosos e não ferrosos recicláveis.', TRUE),
    ('Embalagens longa vida', 'embalagens-longa-vida',
     'Embalagens cartonadas multicamadas.', TRUE),
    ('Óleo de cozinha usado', 'oleo-cozinha-usado',
     'Óleo de cozinha usado destinado à coleta apropriada.', TRUE),
    ('Pilhas e baterias', 'pilhas-baterias',
     'Pilhas e baterias que exigem destinação específica.', TRUE),
    ('Resíduos eletroeletrônicos', 'residuos-eletroeletronicos',
     'Equipamentos e componentes eletroeletrônicos descartados.', TRUE),
    ('Lâmpadas', 'lampadas',
     'Lâmpadas que exigem destinação específica.', TRUE),
    ('Pneus', 'pneus',
     'Pneus usados destinados à coleta e reciclagem apropriadas.', TRUE),
    ('Roupas e tecidos', 'roupas-tecidos',
     'Roupas e tecidos destinados ao reaproveitamento ou reciclagem.', TRUE)
AS seed
ON DUPLICATE KEY UPDATE
    name = seed.name,
    description = seed.description;

COMMIT;

SELECT id, name, slug, is_active
FROM materials
ORDER BY name;
