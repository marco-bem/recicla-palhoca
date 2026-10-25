# Evidências da Sprint 2

## Estrutura inicial do backend — 25/10/2026

A estrutura inicial da API foi publicada no repositório com Express 5, TypeScript, pool de conexões MySQL, endpoints `GET /health/live` e `GET /health`, testes HTTP com Jest/Supertest e Dockerfile. O Compose foi ampliado para iniciar a API no container `recicla-palhoca-api`, preservando o serviço MySQL `recicla-palhoca`.

**Validação local e Docker concluída — informada em 25/10/2026:** `npm install`, `npm run typecheck`, `npm test` e `npm run build` terminaram sem erros. O `package-lock.json` foi versionado no GitHub. A imagem da API foi construída e os serviços Docker foram iniciados; o usuário confirmou que os containers estão funcionando e que as chamadas a `GET /health/live` e `GET /health` responderam conforme esperado, incluindo a conexão com o MySQL. A tarefa fica validada no ambiente local; não foram anexados logs ou capturas adicionais nesta atualização.

## Configuração inicial do aplicativo mobile — 25/10/2026

O aplicativo foi inicializado em `mobile/` com Expo SDK 58, React Native, TypeScript e Expo Router. As dependências necessárias à execução web foram instaladas para validar o projeto sem dispositivo Android.

**Validação local concluída:** `npx tsc --noEmit` terminou sem erros; `npx expo-doctor` aprovou 20/20 verificações; `npx expo start --web` compilou e abriu a aplicação no navegador. A tela exibida ainda é a tela padrão “Expo Starter”; portanto, esse resultado comprova a inicialização técnica do projeto, não a implementação das funcionalidades do Recicla Palhoça.

O commit `df7b8d5` (`feat(mobile): initialize Expo app with TypeScript`) foi enviado à branch `main`. A instalação web reportou cinco vulnerabilidades de severidade alta no `npm audit`; a investigação fica pendente, sem execução de `npm audit fix --force`.

**Captura para o relatório:** incluir a tela do navegador com a aplicação Expo aberta. A captura da tela inicial é evidência da inicialização, mas não substitui os testes de interface e de funcionalidades previstos nas próximas etapas.

Guardar aqui apenas evidências que ajudem a reproduzir e documentar os resultados da Sprint 2.

## Validação do banco de dados — 25/10/2026

- MySQL 8.4 inicializado no container Docker e acessado pelo MySQL Workbench.
- O Workbench listou as oito tabelas esperadas em `recicla_palhoca`.
- A consulta de metadados confirmou 9 chaves estrangeiras, 9 restrições `CHECK`, 8 chaves primárias, 8 restrições `UNIQUE` e 27 índices distintos.
- `backend/database/verify-schema.sql` foi executado sem erros no Action Output: inseriu dados sintéticos dentro de transação, consultou um relacionamento completo com uma linha de retorno, executou `ROLLBACK` e confirmou zero usuários e materiais de teste remanescentes.
- O script `backend/database/verify-history-preservation.sql` também foi executado sem erros: o centro e o material foram desativados logicamente, e a consulta do pedido manteve o status `ACEITA`, um item e dois eventos de histórico (`PENDENTE` e `ACEITA`). O Action Output mostrou `ROLLBACK` e a consulta final retornou zero usuários, centros, materiais e pedidos de teste restantes.
- A captura fornecida pelo usuário comprova o resultado na conversa; copiar a imagem para esta pasta é opcional e deve ser feito no repositório local se for desejado mantê-la versionada.

- diagrama entidade-relacionamento exportado;
- árvore da estrutura dos projetos;
- inicialização do MySQL e resposta da rota de saúde da API;
- execução inicial da aplicação Expo no navegador; (validada em 25/10/2026)
- saída resumida dos testes e relatório de cobertura, quando aplicável.

Não incluir tokens, senhas, arquivos `.env`, telefones reais, endereços privados ou outros dados pessoais. Capturas são complementares; código, comandos e resultados reproduzíveis são as evidências principais.

## Catálogo inicial do banco — 25/10/2026

O catálogo inicial foi versionado em `backend/database/seed.sql`, com 12 categorias: papel, papelão, plásticos, vidro, metais, embalagens longa vida, óleo de cozinha usado, pilhas e baterias, resíduos eletroeletrônicos, lâmpadas, pneus e roupas/tecidos.

O Docker Compose foi atualizado para montar `seed.sql` como `02-seed.sql`, após o `schema.sql` (`01-schema.sql`). Essa configuração vale para a inicialização de um volume MySQL vazio; volumes já inicializados não executam scripts de `docker-entrypoint-initdb.d` novamente.

**Validação local informada em 25/10/2026:** o seed foi aplicado pelo container MySQL, retornando 12 materiais ativos. A segunda execução retornou a mesma lista, sem duplicação. `docker compose --env-file infra/docker/.env -f infra/docker/docker-compose.yml config --quiet` terminou sem erros após a inclusão do mount. O banco e a API permaneceram saudáveis; nenhum volume foi apagado ou recriado.

O catálogo é composto por categorias de referência. A inserção desses materiais não afirma que centros reais específicos os aceitem; cada centro terá suas próprias associações em `center_materials`.

**Arquivos relacionados:** `backend/database/seed.sql`, `backend/database/README.md`, `infra/docker/docker-compose.yml`.

## API de centros — implementação inicial e validação parcial — 25/10/2026

Foi publicada a primeira versão da API de centros em `backend/src/centers/`, com validação de filtros e campos, repositório MySQL, consulta pública, cadastro, atualização e desativação lógica. Os testes HTTP estão em `backend/tests/centers.test.ts`; o contrato dos endpoints e a fronteira de autenticação foram documentados em `backend/README.md`.

A listagem pública restringe resultados a centros ativos com coordenadas, horários de atendimento e materiais ativos aceitos. As operações de escrita falham de forma fechada com HTTP 401 até a integração do middleware de autenticação prevista para uma tarefa posterior; a API não confia em identificadores de responsável enviados pelo cliente.

**Validação local informada em 25/10/2026:** Node.js `v24.22.1`; `npm run typecheck` terminou sem erros; `npm test` aprovou 14 testes em 2 suítes; e `npm run build` terminou sem erros.

Os testes dos endpoints de centros usam um repositório simulado e validam o comportamento HTTP. Ainda falta validar as operações de persistência em uma execução específica contra o MySQL real. A autenticação completa do responsável também permanece como trabalho posterior.

## Validação HTTP da API de centros contra o MySQL — 25/10/2026

Com a API reconstruída e os containers MySQL/API saudáveis, foram executadas chamadas HTTP contra a instância local:

- `GET /health`: HTTP 200, com `"database":"connected"`.
- `GET /centers`: HTTP 200 e `{"data":[]}`; a consulta não encontrou centros publicáveis cadastrados.
- `GET /centers?offersPickup=sim`: HTTP 400, rejeitando o filtro booleano inválido.
- `GET /centers/999999`: HTTP 404, centro não encontrado.

Essas chamadas validaram o healthcheck e o comportamento das consultas públicas no serviço conectado ao banco. Em seguida, `npm run test:integration:centers` passou com 1 suíte e 1 teste contra o MySQL real, cobrindo criação, consulta, atualização e desativação pelo repositório; a rotina de limpeza dos dados temporários terminou sem erro. Essa validação comprova a persistência na camada de repositório, mas não o fluxo de escrita HTTP, que continua bloqueado por padrão até a integração do middleware de autenticação.

## Autenticação do responsável — implementação publicada; validação local pendente

Foram adicionados `POST /auth/register`, `POST /auth/login` e `GET /auth/me`, hash de senha com bcrypt, token JWT Bearer de uma hora e middleware que verifica assinatura/expiração e confirma se a conta continua ativa. O middleware fornece a identidade usada pelas rotas de escrita de centros; sem token válido, a operação é negada. A chave `AUTH_JWT_SECRET` é obtida do ambiente e precisa ter ao menos 32 bytes.

Foram adicionados testes HTTP para cadastro, validação de senha, e-mail duplicado, login, identidade autenticada e uso do token ao cadastrar centro. **Os novos testes ainda precisam ser executados localmente** após atualizar as dependências e o `package-lock.json`; não considerar a autenticação validada até confirmar `npm run typecheck`, `npm test` e `npm run build`.

