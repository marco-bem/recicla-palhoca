# Backend / API

API inicial do Recicla Palhoça com Node.js 24 LTS, Express 5, TypeScript e MySQL 8.4. A API contém endpoints de saúde e a primeira versão dos endpoints de centros de reciclagem, com persistência em MySQL.

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
| POST | `/centers` | Cadastra o perfil completo do centro para o responsável autenticado. |
| PUT | `/centers/:id` | Atualiza os dados, horários e materiais aceitos do centro do responsável. |
| DELETE | `/centers/:id` | Desativa logicamente o centro do responsável, preservando solicitações históricas. |

A resposta de health não inclui credenciais nem detalhes internos da exceção.

## Especificação OpenAPI

O contrato dos endpoints implementados está descrito em [`openapi.yaml`](openapi.yaml), no formato OpenAPI 3.1.0. A especificação cobre as operações de health, autenticação, catálogo de materiais e centros, incluindo parâmetros de consulta, corpos JSON, modelos de resposta, códigos de erro e autenticação Bearer JWT.

A documentação interativa é hospedada pela própria API e pode ser acessada em `http://127.0.0.1:3000/docs` no ambiente local (ou na rota `/docs` do domínio publicado). O arquivo bruto da especificação fica disponível em `/openapi.yaml`. A interface utiliza o mesmo host da API para executar as operações pelo recurso “Try it out”; as rotas protegidas exigem token Bearer.


### Contrato e validação dos endpoints de centros

A resposta dos endpoints de consulta usa `{ "data": ... }`. A listagem retorna apenas centros ativos que possuam coordenadas, ao menos um período de atendimento e ao menos um material ativo marcado como aceito. Não encontrar resultados produz uma lista vazia; um centro individual inexistente ou não publicável retorna HTTP 404. Filtros inválidos e identificadores inválidos retornam HTTP 400.

O cadastro e a atualização recebem os campos de perfil, coordenadas, serviços, `openingHours` e `materialIds`. A API valida campos obrigatórios, limites, coordenadas, CEP, horários e duplicações de materiais antes de chamar a camada de persistência. A persistência de um cadastro ou atualização grava o perfil, horários e associações de materiais em transação. Ao atualizar materiais, associações antigas são mantidas com `is_accepted = FALSE` para preservar referências históricas.

### Catálogo público de materiais

O endpoint `GET /materials` retorna somente materiais com `is_active = TRUE`, ordenados por nome e identificador. Cada item contém `id`, `name`, `slug` e `description`; quando não há materiais ativos, a resposta é `{ "data": [] }`. A consulta é pública e não há endpoints para criar, editar ou excluir categorias: o catálogo é controlado pelo sistema e inicializado por `backend/database/seed.sql`.

Os endpoints de centros recebem `materialIds` no cadastro e na atualização. A API verifica, dentro da transação, se todos os identificadores existem e estão ativos. Ao substituir materiais aceitos, os vínculos anteriores permanecem em `center_materials` com `is_accepted = FALSE`, preservando referências históricas; os novos vínculos ficam aceitos.

### Autenticação do responsável

A API oferece cadastro (`POST /auth/register`), login (`POST /auth/login`) e consulta da própria identidade (`GET /auth/me`). O cadastro normaliza o e-mail, exige senha com pelo menos 10 caracteres, armazena somente hash bcrypt e retorna token JWT Bearer com validade de uma hora. Credenciais inválidas recebem mensagem genérica. As rotas protegidas validam assinatura, expiração e se a conta continua ativa no MySQL; a identidade vem do token, nunca de um ID informado pelo cliente. Validação local em 25/10/2026: cadastro respondeu HTTP 201, login HTTP 200, `/auth/me` com token HTTP 200, rota protegida sem token HTTP 401 e rota protegida com token e corpo inválido HTTP 400. A chave JWT foi configurada no ambiente local do Docker sem ser versionada.

A autorização das operações de escrita de centros usa o identificador obtido do token validado, nunca um ID de responsável enviado pelo cliente. O repositório restringe atualização e desativação ao `responsible_user_id` autenticado; contas inativas não podem executar operações de escrita.

**Verificação do fluxo de autenticação:** no ambiente Docker, cadastro HTTP 201, login HTTP 200 e consulta de `/auth/me` autenticada HTTP 200. Uma chamada de escrita sem token foi rejeitada com HTTP 401; uma chamada autenticada com corpo inválido avançou até a validação e retornou HTTP 400. Os testes automatizados também cobrem senha armazenada em hash, e-mail duplicado, credenciais inválidas com mensagem genérica, ausência de autenticação e tentativa de alterar/desativar centro pertencente a outro responsável.

**Configuração e integridade do token:** JWT assinado com HS256, emissor e audiência definidos, validade de uma hora e chave de pelo menos 32 bytes fornecida por `AUTH_JWT_SECRET`. O middleware consulta o MySQL para confirmar que o usuário associado ao token continua ativo.

Configure `AUTH_JWT_SECRET` com uma chave aleatória de pelo menos 32 bytes no arquivo local `infra/docker/.env` (para Docker) ou `backend/.env` (execução local). Gere a chave com `openssl rand -hex 32`. Não a versione nem a compartilhe. Sem uma chave válida, as rotas de autenticação respondem HTTP 503 e nenhuma credencial padrão é usada.


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

`npm test` executa testes HTTP com Supertest para health, autenticação, catálogo de materiais e endpoints de centros. Os testes de autenticação cobrem cadastro com hash de senha, validação, conflito de e-mail, login, token Bearer e proteção de escrita; os testes de centros cobrem filtros, consulta, validação e operações com repositórios injetados. A integração de persistência de centros com MySQL real é verificada separadamente por `npm run test:integration:centers`.

`npm run typecheck` verifica os tipos; `npm run build` compila o código para `dist/`.

A suíte de testes de centros e materiais está organizada em:
- `tests/centers.test.ts`: comportamento HTTP das rotas, autenticação, autorização por responsável e tratamento de erros.
- `tests/centers.repository.integration.test.ts`: persistência real no MySQL, transações, propriedade do centro, materiais ativos e preservação dos vínculos.
- `tests/centers.validation.test.ts`: limites e regras de validação de identificadores, filtros, dados do centro, horários, coordenadas e materiais.
- `tests/materials.test.ts`: contrato HTTP público do catálogo, lista vazia e falhas controladas.
- `tests/materials.repository.test.ts`: consulta do catálogo ativo, mapeamento dos campos e propagação de falhas de persistência.
- `tests/auth.repository.test.ts`: persistência e conversão dos dados do responsável, incluindo conta ativa/inativa e e-mail duplicado.

### Resultado consolidado dos testes — 31/10/2026

Validação executada no host com Node.js `v24.22.2`: `npm run typecheck` e `npm run build` terminaram sem erros. `npm test` aprovou 166 testes em 7 suítes, com 1 suíte de integração opcional ignorada nessa execução.

A execução `npm run test:coverage`, que habilita a integração com MySQL real, aprovou os 167 testes em 8 suítes. O relatório registrou 91,74% de instruções, 85,03% de ramificações, 92,75% de funções e 93,8% de linhas, superando a meta mínima de 70% definida no RNF-07 para a lógica de negócio. A suíte de integração confirmou os cenários de persistência, autorização por responsável, responsável inativo, materiais inválidos e preservação das associações históricas.

Execute `npm run test:coverage` para gerar o relatório de cobertura. Esse comando habilita a suíte de integração de centros e carrega a conexão MySQL de `infra/docker/.env`; por isso, mantenha os containers MySQL e API ativos. O teste cria dados sintéticos e os remove ao final. O requisito RNF-07 estabelece meta mínima de 70% para a lógica de negócio; confira especialmente a cobertura de instruções e os arquivos de domínio no relatório.

**Validação local da API de materiais em 31/10/2026:** `npm run typecheck` terminou sem erros; `npm test` aprovou 25 testes em 4 suítes, com 1 suíte de integração opcional ignorada na execução geral. A imagem Docker foi reconstruída com Node.js 24 e o build terminou com sucesso.

O teste `npm run test:integration:centers:http` confirmou que `GET /materials` retorna todos os materiais ativos em ordem alfabética e com os mesmos identificadores, nomes, slugs e descrições do MySQL. Também validou o cadastro de um centro com um material, a substituição por outro material via `PUT /centers/:id`, a persistência do novo vínculo e a preservação do vínculo anterior com `is_accepted = FALSE`. As verificações de consulta, desativação lógica e remoção da listagem pública também passaram; ao final, o usuário e o centro sintéticos foram removidos.

**Ambiente de execução:** o terminal local informou Node.js `v22.23.2`, embora `package.json` exija Node.js `>=24 <25`. Os comandos de typecheck e Jest passaram nessa sessão; o build da aplicação foi executado com Node.js 24 dentro do Docker, e o teste HTTP consultou essa API em container. Para novas execuções dos comandos backend diretamente no host, utilizar Node.js 24.

### Teste HTTP integrado de cadastro, atualização e desativação

O script `scripts/run-centers-http-integration.cjs`, executado por `npm run test:integration:centers:http`, valida o ciclo pela API em execução: consulta o catálogo público, registra um responsável temporário, cria um centro autenticado com um material, lista e consulta o centro, atualiza o perfil substituindo o material aceito, confirma a persistência e a preservação do vínculo anterior como não aceito, desativa o centro e verifica que ele deixa de aparecer nas consultas públicas.

O script lê as configurações de `infra/docker/.env` sem exibir senhas ou tokens, seleciona um material ativo do catálogo e usa dados sintéticos. Ao final, remove fisicamente somente o usuário/centro temporários criados pelo próprio teste, depois de confirmar que o centro não possui solicitações vinculadas. Não execute em produção. O teste deve ser rodado com os containers MySQL e API saudáveis.

Na raiz do repositório:

```bash
git pull --ff-only origin main
cd backend
npm run test:integration:centers:http
```

**Validação local concluída em 31/10/2026:** todos os passos passaram: API/MySQL HTTP 200; cadastro de responsável HTTP 201; cadastro de centro HTTP 201; listagem e consulta HTTP 200; atualização autenticada HTTP 200; confirmação dos dados atualizados no MySQL HTTP 200; listagem após atualização HTTP 200; desativação autenticada HTTP 204; consulta do centro desativado HTTP 404; listagem sem o centro desativado HTTP 200. O script confirmou a remoção do usuário e do centro sintéticos. O ciclo HTTP com autenticação e persistência real está validado no ambiente local.

### Teste de integração opcional com MySQL real

O arquivo `tests/centers.repository.integration.test.ts` testa criação, consulta, atualização e desativação de um centro usando o repositório MySQL real. O teste cria um usuário e centro temporários com identificadores exclusivos e tenta removê-los no encerramento. Execute somente no banco local de desenvolvimento/testes, nunca em produção.

Na raiz do repositório, atualize a cópia local e execute:

```bash
git pull --ff-only origin main
cd backend
npm run test:integration:centers
```

O script carrega `infra/docker/.env` sem imprimir credenciais e conecta à porta publicada do MySQL. **Validação local em 25/10/2026:** `npm run test:integration:centers` passou (1 suíte, 1 teste), cobrindo criação, consulta, atualização e desativação no MySQL real. A rotina de limpeza terminou sem erro. O teste usa um material do catálogo existente e não cria nem apaga o volume MySQL. A suíte é separada dos testes unitários e só executa quando chamada pelo script específico.


### Validação da API de centros — 25/10/2026

No ambiente local com Node.js `v24.22.1`, `npm run typecheck` terminou sem erros, `npm test` aprovou 14 testes em 2 suítes e `npm run build` terminou sem erros.

Os testes automatizados da API de centros usam repositório simulado e validam comportamento HTTP e validação de entradas. A integração de persistência do repositório foi validada separadamente contra o MySQL real. O smoke test da autenticação também confirmou que as operações protegidas rejeitam chamadas sem token e aceitam token válido antes da validação da entrada.

Após qualquer alteração nas dependências, execute `npm install` para atualizar `package-lock.json` e versione o lockfile junto ao backend. Não versione `.env` nem credenciais.

## Banco de dados

- Modelo entidade-relacionamento: [`docs/modelo-dados.md`](../docs/modelo-dados.md)
- DDL MySQL: [`database/schema.sql`](database/schema.sql)
- Catálogo inicial com 12 categorias: [`database/seed.sql`](database/seed.sql)
- Instruções de esquema, seed e validação Docker/Workbench: [`database/README.md`](database/README.md) e [`infra/docker/README.md`](../infra/docker/README.md)

O Compose monta `schema.sql` e `seed.sql` nessa ordem para a inicialização de um volume MySQL vazio. Em um volume já inicializado, os scripts de `docker-entrypoint-initdb.d` não são executados novamente; para aplicar o catálogo pela primeira vez nesse cenário, siga a instrução de aplicação manual no README do banco.
