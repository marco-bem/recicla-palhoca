# Backend / API

API REST do Recicla Palhoça com Node.js 24, Express 5, TypeScript e MySQL 8.4. Ela oferece consulta de centros e materiais, cadastro e autenticação de responsáveis e registro, acompanhamento e gestão de coletas.

## Endpoints disponíveis

| Método | Endpoint | Finalidade |
|---|---|---|
| GET | `/health/live` | Confirma que o processo HTTP está respondendo, sem consultar o banco. |
| GET | `/health` | Executa `SELECT 1` pelo pool MySQL. Retorna HTTP 200 quando conectado e HTTP 503 quando indisponível. |
| GET | `/docs` | Abre a interface Swagger UI hospedada pela própria API. |
| GET | `/openapi.yaml` | Disponibiliza o arquivo de especificação OpenAPI 3.1.0. |
| GET | `/materials` | Lista o catálogo de materiais ativos, sem exigir autenticação. |
| POST | `/auth/register` | Cria conta de responsável com senha armazenada em hash e devolve token Bearer. |
| POST | `/auth/login` | Autentica e-mail e senha e devolve token Bearer. |
| GET | `/auth/me` | Retorna os dados básicos do responsável autenticado. |
| GET | `/centers` | Lista centros publicáveis; aceita filtros opcionais `q`, `neighborhood`, `material` (slug) e `offersPickup=true|false`. |
| GET | `/centers/:id` | Consulta os detalhes públicos de um centro publicável. |
| GET | `/centers/me` | Consulta o perfil do centro vinculado ao responsável autenticado. |
| POST | `/centers` | Cadastra o perfil completo do centro para o responsável autenticado. |
| PUT | `/centers/:id` | Atualiza os dados, horários e materiais aceitos do centro do responsável. |
| DELETE | `/centers/:id` | Desativa logicamente o centro do responsável, preservando solicitações históricas. |
| POST | `/collection-requests` | Registra pedido público para centro ativo que oferece coleta. Retorna protocolo e estado `PENDENTE`. |
| POST | `/collection-requests/lookup` | Consulta um pedido com protocolo e telefone do solicitante. |
| GET | `/center-collection-requests` | Lista os pedidos do próprio centro, com filtro opcional por status. |
| GET | `/center-collection-requests/:protocol` | Consulta os detalhes de um pedido do próprio centro. |
| PATCH | `/center-collection-requests/:protocol/status` | Atualiza o estado de um pedido do próprio centro. |

A resposta de health não inclui credenciais nem detalhes internos da exceção.

## Consumo da API pelo aplicativo web

O aplicativo Expo Web consulta os endpoints públicos da API pelo navegador. O middleware CORS permite, por padrão, as origens locais `http://localhost:8081` e `http://127.0.0.1:8081`. No Docker Compose, a lista é fornecida por `APP_WEB_ORIGINS`; para outros hosts ou portas de desenvolvimento, informe as origens completas separadas por vírgula no arquivo local `infra/docker/.env`. Não use curingas para liberar a API a qualquer origem.

O cliente mobile utiliza `EXPO_PUBLIC_API_URL` para definir a URL base; no desenvolvimento local, o padrão é `http://127.0.0.1:3000`. Consulte `mobile/README.md` e `mobile/.env.example` para configurar o Expo Web.

## Especificação OpenAPI

O contrato dos endpoints implementados está descrito em [`openapi.yaml`](openapi.yaml), no formato OpenAPI 3.1.0. A especificação cobre health, autenticação, catálogo de materiais, centros e solicitações de coleta. Inclui parâmetros, modelos de requisição e resposta, códigos de erro e autenticação Bearer JWT.

A documentação interativa é hospedada pela própria API e pode ser acessada em `http://127.0.0.1:3000/docs` no ambiente local (ou na rota `/docs` do domínio publicado). O middleware redireciona HTTP 301 para o caminho canônico `/docs/`, que entrega a interface; navegadores seguem esse redirecionamento automaticamente. O arquivo bruto da especificação fica disponível em `/openapi.yaml`. A interface utiliza o mesmo host da API para executar as operações pelo recurso “Try it out”; as rotas protegidas exigem token Bearer.


### Contrato e validação dos endpoints de centros

A resposta dos endpoints de consulta usa `{ "data": ... }`. A listagem retorna apenas centros ativos que possuam coordenadas, ao menos um período de atendimento e ao menos um material ativo marcado como aceito. Não encontrar resultados produz uma lista vazia; um centro individual inexistente ou não publicável retorna HTTP 404. Filtros inválidos e identificadores inválidos retornam HTTP 400.

O cadastro e a atualização recebem os campos de perfil, coordenadas, serviços, `openingHours` e `materialIds`. A API valida campos obrigatórios, limites, coordenadas, CEP, horários e duplicações de materiais antes de chamar a camada de persistência. A persistência de um cadastro ou atualização grava o perfil, horários e associações de materiais em transação. Ao atualizar materiais, associações antigas são mantidas com `is_accepted = FALSE` para preservar referências históricas.

### Catálogo público de materiais

O endpoint `GET /materials` retorna somente materiais com `is_active = TRUE`, ordenados por nome e identificador. Cada item contém `id`, `name`, `slug` e `description`; quando não há materiais ativos, a resposta é `{ "data": [] }`. A consulta é pública e não há endpoints para criar, editar ou excluir categorias: o catálogo é controlado pelo sistema e inicializado por `backend/database/seed.sql`.

Os endpoints de centros recebem `materialIds` no cadastro e na atualização. A API verifica, dentro da transação, se todos os identificadores existem e estão ativos. Ao substituir materiais aceitos, os vínculos anteriores permanecem em `center_materials` com `is_accepted = FALSE`, preservando referências históricas; os novos vínculos ficam aceitos.

### Solicitação pública de coleta

O cidadão informa centro, nome, telefone, endereço de coleta e materiais aceitos pelo centro. Data, período e observações são opcionais. A API grava pedido, materiais e evento inicial na mesma transação, usando o esquema existente. A resposta HTTP 201 contém apenas o protocolo e o estado inicial. Uma mudança na disponibilidade do centro ou dos materiais resulta em HTTP 409.

O acompanhamento público exige o protocolo e o telefone usados na solicitação. As rotas de gestão exigem JWT e restringem a consulta e a mudança de estado ao centro do responsável. Um pedido pendente pode ser aceito ou recusado. Um pedido aceito pode ser concluído.

### Autenticação do responsável

A API oferece cadastro (`POST /auth/register`), login (`POST /auth/login`) e consulta da própria identidade (`GET /auth/me`). O cadastro normaliza o e-mail, exige senha com pelo menos 8 caracteres, armazena somente hash bcrypt e retorna token JWT Bearer com validade de uma hora. Credenciais inválidas recebem mensagem genérica. As rotas protegidas validam assinatura, expiração e se a conta continua ativa no MySQL; a identidade vem do token, nunca de um ID informado pelo cliente.

A autorização das operações de escrita de centros usa o identificador obtido do token validado, nunca um ID de responsável enviado pelo cliente. O repositório restringe atualização e desativação ao `responsible_user_id` autenticado; contas inativas não podem executar operações de escrita.

**Configuração e integridade do token:** JWT assinado com HS256, emissor e audiência definidos, validade de uma hora e chave de pelo menos 32 bytes fornecida por `AUTH_JWT_SECRET`. O middleware consulta o MySQL para confirmar que o usuário associado ao token continua ativo.

Configure `AUTH_JWT_SECRET` com uma chave aleatória de pelo menos 32 bytes no arquivo local `infra/docker/.env` (para Docker) ou `backend/.env` (execução local). Gere a chave com `openssl rand -hex 32`. Não a versione nem a compartilhe. Sem uma chave válida, as rotas de autenticação respondem HTTP 503 e nenhuma credencial padrão é usada.


## Executar a API em Docker

Na raiz do repositório, prepare `infra/docker/.env` e o volume externo conforme o [guia Docker](../infra/docker/README.md). Use em `MYSQL_PASSWORD` a senha do usuário local da aplicação.

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

A segunda chamada deve retornar HTTP 200 e JSON com `"database": "connected"`. Se houver falha, consulte os logs a partir da raiz:

```bash
docker compose --env-file infra/docker/.env -f infra/docker/docker-compose.yml logs --tail=100 api mysql
```

## Executar a API diretamente no ambiente local

Requisitos: Git, Node.js 24 LTS e npm.

Se o container `recicla-palhoca-api` estiver publicado na porta 3000, pare somente a API no Compose, mantendo o banco ligado. Execute a partir da raiz do repositório:

```bash
docker compose --env-file infra/docker/.env -f infra/docker/docker-compose.yml stop api
```

Depois, configure o ambiente local:

1. Crie `backend/.env` a partir de `backend/.env.example`.
2. Configure `DB_PASSWORD` com o mesmo valor local usado em `MYSQL_PASSWORD` no arquivo `infra/docker/.env`.

Instale as dependências do lockfile e inicie a API em modo de desenvolvimento:

```bash
cd backend
npm ci
npm run dev
```

A API local fica na porta definida por `PORT`, padrão 3000. Para voltar à execução da API em Docker, finalize o servidor local e execute a partir da raiz:

```bash
docker compose --env-file infra/docker/.env -f infra/docker/docker-compose.yml up -d --build
```

Use os comandos da próxima seção para verificar tipos, compilar ou executar testes separadamente. O [guia Docker](../infra/docker/README.md#atenção-ao-script-de-inicialização) descreve a persistência do volume MySQL.

## Testes atuais

`npm test` executa testes de health, autenticação, catálogo, centros e solicitações de coleta. Os testes HTTP usam Supertest. A integração de persistência de centros com MySQL real é executada separadamente por `npm run test:integration:centers`.

`npm run typecheck` verifica os tipos; `npm run build` compila o código para `dist/`.

A suíte de testes de centros e materiais está organizada em:

- `tests/centers.test.ts`: comportamento HTTP das rotas, autenticação, autorização por responsável e tratamento de erros.
- `tests/centers.repository.integration.test.ts`: persistência real no MySQL, transações, propriedade do centro, materiais ativos e preservação dos vínculos.
- `tests/centers.validation.test.ts`: limites e regras de validação de identificadores, filtros, dados do centro, horários, coordenadas e materiais.
- `tests/materials.test.ts`: contrato HTTP público do catálogo, lista vazia e falhas controladas.
- `tests/materials.repository.test.ts`: consulta do catálogo ativo, mapeamento dos campos e propagação de falhas de persistência.
- `tests/auth.repository.test.ts`: persistência e conversão dos dados do responsável, incluindo conta ativa/inativa e e-mail duplicado.

### Cobertura

Execute `npm run test:coverage` em `backend/` para gerar o relatório de cobertura. O comando habilita a integração de centros com MySQL e carrega a conexão de `infra/docker/.env`. Utilize um banco local de desenvolvimento ou testes com o catálogo inicial carregado.

### Teste HTTP integrado de cadastro, atualização e desativação

O script `scripts/run-centers-http-integration.cjs`, executado por `npm run test:integration:centers:http`, valida o ciclo pela API em execução: consulta o catálogo público, registra um responsável temporário, cria um centro autenticado com um material, lista e consulta o centro, atualiza o perfil substituindo o material aceito, confirma a persistência e a preservação do vínculo anterior como não aceito, desativa o centro e verifica que ele deixa de aparecer nas consultas públicas.

O script lê as configurações de `infra/docker/.env` sem exibir senhas ou tokens, seleciona um material ativo do catálogo e usa dados sintéticos. Ao final, remove fisicamente somente o usuário/centro temporários criados pelo próprio teste, depois de confirmar que o centro não possui solicitações vinculadas. Não execute em produção. O teste deve ser rodado com os containers MySQL e API saudáveis.

Na raiz do repositório:

```bash
cd backend
npm run test:integration:centers:http
```

### Teste de integração opcional com MySQL real

O arquivo `tests/centers.repository.integration.test.ts` testa criação, consulta, atualização e desativação de um centro usando o repositório MySQL real. O teste cria um usuário e centro temporários com identificadores exclusivos e tenta removê-los no encerramento. Execute somente no banco local de desenvolvimento/testes, nunca em produção.

Na raiz do repositório, atualize a cópia local e execute:

```bash
cd backend
npm run test:integration:centers
```

O script carrega `infra/docker/.env` e conecta à porta publicada do MySQL. Os dados sintéticos criados pelo teste são removidos ao final.

## Banco de dados

- DDL MySQL: [`database/schema.sql`](database/schema.sql)
- Catálogo inicial com 12 categorias: [`database/seed.sql`](database/seed.sql)
- Instruções de esquema, seed e validação Docker/Workbench: [`database/README.md`](database/README.md) e [`infra/docker/README.md`](../infra/docker/README.md)

O Compose monta `schema.sql` e `seed.sql` nessa ordem para a inicialização de um volume MySQL vazio. Em um volume já inicializado, os scripts de `docker-entrypoint-initdb.d` não são executados novamente; para aplicar o catálogo pela primeira vez nesse cenário, siga a instrução de aplicação manual no README do banco.
