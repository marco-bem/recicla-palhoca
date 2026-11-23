# Recicla Palhoça

Aplicativo para encontrar centros de reciclagem em Palhoça (SC), consultar materiais, horários e serviços, e solicitar e acompanhar coletas. Os responsáveis podem cadastrar e editar seu centro e gerenciar os pedidos recebidos.

O projeto inclui aplicativo Expo, API REST e banco MySQL.

## Objetivos do MVP

- Consultar e filtrar centros de reciclagem ativos.
- Definir um ponto de referência usando localização do dispositivo ou endereço/CEP.
- Ordenar centros pela distância geográfica em linha reta.
- Consultar materiais aceitos, endereço, horários e serviços disponíveis.
- Permitir que responsáveis autenticados mantenham o perfil do centro.
- Registrar e acompanhar solicitações de coleta, respeitando disponibilidade e permissões.
- Desenvolver e validar a solução com testes automatizados.

## Stack

- **Mobile:** React Native, Expo SDK 58, TypeScript, Expo Router e MapLibre.
- **API:** Node.js 24, Express 5 e TypeScript.
- **Banco de dados:** MySQL 8.4.
- **Ambiente local:** Docker / Docker Compose.
- **Testes:** Jest, Supertest, React Native Testing Library e Playwright.
- **Contrato de API:** OpenAPI/Swagger.
- **Versionamento:** Git e GitHub.

## Estrutura do repositório

    recicla-palhoca/
    ├── backend/
    │   ├── src/
    │   │   ├── app.ts            # Express e endpoints de saúde
    │   │   ├── server.ts         # Inicialização e encerramento da API
    │   │   └── db/pool.ts        # Pool MySQL e verificação de conexão
    │   ├── tests/app.test.ts     # Testes HTTP com Jest/Supertest
    │   ├── database/
    │   │   ├── schema.sql
    │   │   ├── seed.sql
    │   │   └── verify-*.sql      # Scripts de validação do banco
    │   ├── Dockerfile
    │   ├── package.json
    │   └── README.md
    ├── mobile/                  # React Native, Expo Router e TypeScript
    ├── infra/
    │   └── docker/
    │       ├── .env.example     # Modelo de variáveis locais
    │       ├── docker-compose.yml
    │       └── README.md        # Inicialização do banco e conexão Workbench
    └── README.md

## Execução rápida no navegador

Use Git, Docker com Compose, npm e Node.js 24.3 ou posterior da série 24. A partir da raiz do clone, prepare `infra/docker/.env` conforme o [guia Docker](infra/docker/README.md#2-preparar-configuração-local). Em seguida, execute:

```bash
docker volume create recicla-palhoca-mysql-data
docker compose --env-file infra/docker/.env -f infra/docker/docker-compose.yml up -d --build --wait
curl -fsS http://127.0.0.1:3000/health
```

A API está pronta quando `/health` retorna HTTP 200 com `"database":"connected"`. Em outro terminal, a partir da raiz:

```bash
cd mobile
npm ci
npm run web -- --localhost --port 8081
```

Abra o [app no navegador](http://localhost:8081/) e o [Swagger](http://127.0.0.1:3000/docs/). Em uma instalação nova, o banco carrega o catálogo de materiais e a lista de centros começa vazia. Para demonstrar o fluxo de coleta, crie uma conta em **Sou centro** e cadastre um centro de demonstração com CEP que retorne coordenadas, material, horário e oferta de coleta.

Consulte o [guia mobile](mobile/README.md) para executar no emulador Android ou no PWA do iPhone, e o [guia da API](backend/README.md) para execução fora do Docker e comandos de teste. O [esquema SQL](backend/database/schema.sql) define as tabelas e seus relacionamentos.

## Banco de dados local

A configuração do MySQL em Docker aplica `backend/database/schema.sql` e, em seguida, `backend/database/seed.sql` na primeira inicialização de um volume vazio. O seed contém 12 categorias de materiais de referência. Volumes já inicializados não reexecutam os scripts de inicialização; consulte [`backend/database/README.md`](backend/database/README.md) e [`infra/docker/README.md`](infra/docker/README.md) para os procedimentos. Não versione o arquivo local `.env`.

## Regras de contribuição e segurança

- Nunca versionar tokens, senhas, arquivos `.env` ou dados pessoais reais de solicitantes.
- Usar dados sintéticos nas demonstrações e identificá-los como demonstrativos.
- Manter alterações pequenas e commits com descrições objetivas.
- Atualizar os contratos e testes quando uma decisão de produto mudar.
- Não declarar uma funcionalidade como concluída sem teste ou evidência correspondente.
