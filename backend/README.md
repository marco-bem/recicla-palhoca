# Backend / API

API inicial do Recicla Palhoça com Node.js 24 LTS, Express 5, TypeScript e MySQL 8.4. A estrutura contém apenas os endpoints de saúde e a infraestrutura básica; os recursos de negócio serão implementados em tarefas seguintes.

## Endpoints disponíveis

| Método | Endpoint | Finalidade |
|---|---|---|
| GET | `/health/live` | Confirma que o processo HTTP está respondendo, sem consultar o banco. |
| GET | `/health` | Executa `SELECT 1` pelo pool MySQL. Retorna HTTP 200 quando conectado e HTTP 503 quando indisponível. |

A resposta de health não inclui credenciais nem detalhes internos da exceção.

## Executar a API em Docker

Na raiz do repositório, garanta que `infra/docker/.env` está configurado a partir de `infra/docker/.env.example`. A senha de `MYSQL_PASSWORD` deve corresponder ao usuário local da aplicação, não à senha do root.

Validar a configuração e construir/iniciar os serviços:

```bash
docker compose --env-file infra/docker/.env -f infra/docker/docker-compose.yml config --quiet
docker compose --env-file infra/docker/.env -f infra/docker/docker-compose.yml up -d --build
docker compose --env-file infra/docker/.env -f infra/docker/docker-compose.yml ps
```

A API fica disponível em `http://127.0.0.1:3000` (ou na porta definida em `API_PORT`). O container usa `DB_HOST=mysql` e `DB_PORT=3306`, porque comunicação entre serviços do Compose usa o nome do serviço e a porta interna do banco.

Validar as rotas:

```bash
curl -i http://127.0.0.1:3000/health/live
curl -i http://127.0.0.1:3000/health
```

A segunda chamada deve retornar HTTP 200 e JSON com `"database": "connected"`. Caso contrário, conferir `docker compose ... logs --tail=100 api` e os logs do MySQL.

## Executar a API diretamente no ambiente local

Requisitos: Git, Node.js 24 LTS e npm.

Se o container `recicla-palhoca-api` estiver publicado na porta 3000, pare somente a API no Compose, mantendo o banco ligado. Execute a partir da raiz do repositório:

```bash
docker compose --env-file infra/docker/.env -f infra/docker/docker-compose.yml stop api
```

Depois, configure o ambiente local:

1. Crie `backend/.env` a partir de `backend/.env.example`.
2. Configure `DB_PASSWORD` com o mesmo valor local usado em `MYSQL_PASSWORD` no arquivo `infra/docker/.env`.

Instale as dependências, gere o lockfile, confira os tipos, rode os testes e compile:

```bash
cd backend
npm install
npm run typecheck
npm test
npm run build
npm run dev
```

A API local fica na porta definida por `PORT`, padrão 3000. Para voltar à execução da API em Docker, finalize o servidor local e execute a partir da raiz:

```bash
docker compose --env-file infra/docker/.env -f infra/docker/docker-compose.yml up -d --build
```

Ao terminar o desenvolvimento, o serviço Docker pode ser iniciado de novo com o comando `up -d` da seção anterior. Não use `docker compose down -v`, pois isso removeria o volume de dados do MySQL.

## Testes atuais

`npm test` executa testes HTTP com Supertest para liveness, banco disponível, banco indisponível e rota inexistente. Os testes usam uma função de verificação do banco injetada no app, portanto não dependem de dados reais nem precisam acessar MySQL.

`npm run typecheck` verifica os tipos; `npm run build` compila o código para `dist/`.

Após a primeira execução de `npm install`, o arquivo `package-lock.json` será criado. Deve ser versionado junto ao backend para registrar as versões resolvidas das dependências. Não versionar `.env` nem credenciais.

## Banco de dados

- Modelo entidade-relacionamento: [`docs/modelo-dados.md`](../docs/modelo-dados.md)
- DDL MySQL: [`database/schema.sql`](database/schema.sql)
- Instruções Docker/Workbench: [`infra/docker/README.md`](../infra/docker/README.md)
