# Backend / API

API inicial do Recicla Palhoça com Node.js 24 LTS, Express 5, TypeScript e MySQL 8.4. A API contém endpoints de saúde e a primeira versão dos endpoints de centros de reciclagem, com persistência em MySQL.

## Endpoints disponíveis

| Método | Endpoint | Finalidade |
|---|---|---|
| GET | `/health/live` | Confirma que o processo HTTP está respondendo, sem consultar o banco. |
| GET | `/health` | Executa `SELECT 1` pelo pool MySQL. Retorna HTTP 200 quando conectado e HTTP 503 quando indisponível. |
| GET | `/centers` | Lista centros publicáveis; aceita filtros opcionais `q`, `neighborhood`, `material` (slug) e `offersPickup=true|false`. |
| GET | `/centers/:id` | Consulta os detalhes públicos de um centro publicável. |
| POST | `/centers` | Cadastra o perfil completo do centro para o responsável autenticado. |
| PUT | `/centers/:id` | Atualiza os dados, horários e materiais aceitos do centro do responsável. |
| DELETE | `/centers/:id` | Desativa logicamente o centro do responsável, preservando solicitações históricas. |

A resposta de health não inclui credenciais nem detalhes internos da exceção.

### Contrato e validação dos endpoints de centros

A resposta dos endpoints de consulta usa `{ "data": ... }`. A listagem retorna apenas centros ativos que possuam coordenadas, ao menos um período de atendimento e ao menos um material ativo marcado como aceito. Não encontrar resultados produz uma lista vazia; um centro individual inexistente ou não publicável retorna HTTP 404. Filtros inválidos e identificadores inválidos retornam HTTP 400.

O cadastro e a atualização recebem os campos de perfil, coordenadas, serviços, `openingHours` e `materialIds`. A API valida campos obrigatórios, limites, coordenadas, CEP, horários e duplicações de materiais antes de chamar a camada de persistência. A persistência de um cadastro ou atualização grava o perfil, horários e associações de materiais em transação. Ao atualizar materiais, associações antigas são mantidas com `is_accepted = FALSE` para preservar referências históricas.

**Autenticação pendente de integração:** as operações POST, PUT e DELETE usam um resolvedor de identidade que espera o middleware de autenticação preencher `response.locals.authenticatedUserId`. Como o middleware de autenticação está previsto para uma tarefa posterior, as operações de escrita retornam HTTP 401 por padrão (falha fechada); não se aceita um ID de responsável vindo do corpo ou de um cabeçalho controlado pelo cliente. Os testes permitem injetar uma identidade controlada para verificar as rotas até que a autenticação seja integrada.


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

`npm test` executa testes HTTP com Supertest para liveness, disponibilidade do banco, rota inexistente e endpoints de centros. Os testes de centros usam um repositório injetado, sem acessar dados persistidos, e cobrem filtros, consulta por identificador, validação de entrada, bloqueio sem identidade autenticada, cadastro, atualização e desativação lógica. A validação de SQL/transações com o MySQL real deve ser feita separadamente no ambiente Docker/Workbench.

`npm run typecheck` verifica os tipos; `npm run build` compila o código para `dist/`.

### Validação da API de centros — 25/10/2026

No ambiente local com Node.js `v24.22.1`, `npm run typecheck` terminou sem erros e `npm test` aprovou 14 testes em 2 suítes. A compilação com `npm run build` foi iniciada, mas o registro disponível não mostra a mensagem final nem o código de saída; confirmar o resultado antes de declarar o build aprovado.

Os testes automatizados da API de centros usam repositório simulado e validam comportamento HTTP e validação de entradas. Eles não substituem a integração contra o MySQL real. As operações de escrita continuam retornando HTTP 401 por padrão até que o middleware de autenticação seja implementado e conectado.

Após a primeira execução de `npm install`, o arquivo `package-lock.json` será criado. Deve ser versionado junto ao backend para registrar as versões resolvidas das dependências. Não versionar `.env` nem credenciais.

## Banco de dados

- Modelo entidade-relacionamento: [`docs/modelo-dados.md`](../docs/modelo-dados.md)
- DDL MySQL: [`database/schema.sql`](database/schema.sql)
- Catálogo inicial com 12 categorias: [`database/seed.sql`](database/seed.sql)
- Instruções de esquema, seed e validação Docker/Workbench: [`database/README.md`](database/README.md) e [`infra/docker/README.md`](../infra/docker/README.md)

O Compose monta `schema.sql` e `seed.sql` nessa ordem para a inicialização de um volume MySQL vazio. Em um volume já inicializado, os scripts de `docker-entrypoint-initdb.d` não são executados novamente; para aplicar o catálogo pela primeira vez nesse cenário, siga a instrução de aplicação manual no README do banco.
