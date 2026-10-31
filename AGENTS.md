# Instruções de continuidade do projeto ReciclaPalhoça

## Preferências de comunicação e documentação

- Ser conciso e objetivo. Evitar relatórios extensos, explicações repetitivas e detalhamento que não ajude a executar a próxima etapa.
- Em documentos acadêmicos e técnicos, registrar somente objetivo, implementação realizada, validações comprovadas, evidências necessárias e pendências relevantes.
- Ao revisar uma seção já existente do relatório, preservar o texto aprovado, figuras, numeração e evidências; acrescentar apenas as novas etapas necessárias. Não substituir a seção inteira por um resumo novo sem necessidade explícita.
- Não repetir no relatório todo o conteúdo dos READMEs ou do código; manter detalhes operacionais nos arquivos técnicos e um resumo claro no documento acadêmico.
- O documento acadêmico em elaboração deve ser tratado como versão final, não como relatório de progresso. Inserir somente resultados consolidados e redação definitiva; evitar expressões provisórias como “parcial”, “até o momento”, “ainda falta” ou ressalvas que precisariam ser removidas depois. Não afirmar que critérios não executados foram concluídos: deixar esses conteúdos para serem incorporados quando houver resultados finais. Preservar evidências já concluídas como fatos objetivos, sem caracterizá-las como parciais quando elas apenas representam um componente do projeto.
- Ao atualizar documentação, explicar ao usuário em poucas linhas exatamente quais arquivos/seções foram alterados e o que mudou.
- Sempre que atualizar o documento acadêmico de apoio, informar exatamente qual seção foi alterada e fornecer o texto final completo daquele trecho, pronto para copiar e colar no documento local. Se houver figuras/capturas associadas, indicar se devem ser mantidas e onde ficam no trecho.

## Mapa de inserção no documento acadêmico

Estrutura oficial da Etapa 2 no documento principal:
- Capítulo 5 — Etapa 2.
- 5.1 — Aplicação, Testes e Validação de um Projeto Orientado a Testes com Programação Mobile.
- 5.1.1 — Elaboração da Aplicação Mobile.
- 5.1.2 — Elaboração dos Testes.
- 5.1.3 — Validação do Projeto.
- 5.1.4 — Ciclo de Desenvolvimento e Validação com TDD.
- Capítulo 6 — Scrum Configurado (itens 6.1 a 6.6); capítulo 7 — Vídeo de Apresentação; capítulo 8 — Conclusão.

Mapeamento obrigatório para inserir futuras atualizações sem duplicar ou deslocar o conteúdo:
- 5.1.1.1 a 5.1.1.5: levantamento/especificação dos requisitos, requisitos funcionais, regras de negócio, requisitos não funcionais e critérios de aceitação/rastreabilidade.
- 5.1.1.6: modelo ER, esquema MySQL, integridade, catálogo/seed e validação do banco.
- 5.1.1.7: configuração e evolução do backend, endpoints, integração com MySQL e autenticação. Para novos incrementos de API, acrescentar apenas um resumo curto ao conteúdo existente e preservar as figuras já numeradas.
- 5.1.1.8: configuração do ambiente mobile, estrutura Expo/React Native e evolução da aplicação/telas funcionais.
- 5.1.2: configuração e execução dos testes, ferramentas, estratégia, suítes, cobertura e resultados automatizados.
- 5.1.3: validação integrada do projeto, execução dos fluxos de ponta a ponta e confronto com critérios de aceitação.
- 5.1.4: ciclos TDD por funcionalidade (teste, implementação, refatoração e nova validação), incluindo evidências resumidas dos ciclos.
- Capítulo 6: planejamento e acompanhamento Scrum/ClickUp, backlog, sprints, papéis, eventos e incrementos. Não colocar procedimentos técnicos de implementação aqui.
- Capítulo 7.2: vídeo final da Etapa 2. Capítulo 8: conclusão global, somente quando os resultados finais estiverem estabelecidos.

Diretriz: o arquivo `docs/relatorio-etapa2/secao-5-1-1-requisitos.md` é o texto de apoio específico para 5.1.1; não despejar nele todos os resultados de teste ou todo o histórico técnico. Manter o detalhe operacional nos READMEs e em `docs/evidencias/sprint-2/README.md`; transcrever para o documento acadêmico somente o resumo necessário no item correto. Preservar o conteúdo aprovado, a ordem das seções, as figuras e a numeração existente. Não criar novos subitens sem verificar primeiro o documento acadêmico principal.

## Fluxo de trabalho esperado

- O repositório oficial é `marco-bem/recicla-palhoca`, branch `main`.
- Antes de orientar sobre uma etapa, consultar o estado real dos arquivos e os commits recentes do GitHub; não assumir que a tarefa começa do zero.
- Quando a integração GitHub estiver disponível, editar e versionar os arquivos diretamente no repositório. Não pedir ao usuário que abra o editor e faça manualmente uma alteração que possa ser aplicada pelo conector.
- Fazer alterações pequenas e rastreáveis, com mensagens de commit objetivas no estilo Conventional Commits. Para cada arquivo, buscar seu conteúdo/SHA mais recente antes de atualizá-lo.
- Continuar usando o histórico de commits, os documentos de requisitos, o modelo de dados, os READMEs e as evidências da Sprint 2 como fonte de verdade.
- Pedir ações no terminal local somente quando dependam do ambiente de desenvolvimento real (por exemplo, executar testes, validar Docker/Workbench ou fornecer uma captura). Não pedir para repetir validações já comprovadas.
- Ao concluir uma atividade, atualizar a documentação técnica e a evidência da Sprint 2. Manter a documentação acadêmica de apoio em `docs/relatorio-etapa2/` alinhada com os resultados efetivamente validados.
- Não marcar tarefas como concluídas sem distinguir o que está documentado no repositório do que foi efetivamente executado no ambiente local.
- O ambiente local do usuário é Linux. Não presumir a disponibilidade de dispositivo Android; testes mobile podem ser validados no navegador quando aplicável.
- Não apagar dados locais para forçar inicialização. Nunca recomendar `docker compose down -v` como rotina; preservar o volume MySQL.
- Nunca incluir ou solicitar arquivos `.env`, senhas, tokens ou dados pessoais reais nos commits ou capturas.

## Estado recuperado em 25/10/2026

### Ambiente e testes

- Aplicação mobile em `mobile/`, com Expo SDK 58, React Native, TypeScript e Expo Router. A estrutura abre no navegador; telas funcionais ainda não foram implementadas.
- No ambiente mobile, Jest, `jest-expo`, `@types/jest`, React Native Testing Library e `test-renderer` foram instalados; teste inicial passou (1 suíte/1 teste), `npx tsc --noEmit` terminou sem erros e `npm run lint` terminou sem erros após uma exceção localizada da regra `react-hooks/set-state-in-effect` em `src/hooks/use-color-scheme.web.ts`.
- A instalação de dependências mobile reportou cinco vulnerabilidades de alta severidade do npm, ainda pendentes de análise. Não executar `npm audit fix --force` sem investigação.

### Backend e MySQL

- Backend em `backend/`, com Node.js/Express/TypeScript, `mysql2`, API e endpoints de saúde; o package.json do backend exige Node.js 24.x. No terminal exibido para o mobile, o Node era v22.23.2; considerar a diferença se executarmos comandos do backend localmente.
- Docker Compose possui os serviços `recicla-palhoca` (MySQL 8.4) e `recicla-palhoca-api`; a última verificação local mostrou ambos saudáveis.
- O banco `recicla_palhoca` já existe e usa um volume persistente. Não recriá-lo para repetir scripts.
- O esquema `backend/database/schema.sql` já foi aplicado e validado no MySQL Workbench: oito tabelas, nove chaves estrangeiras, nove restrições CHECK, oito chaves primárias, oito restrições UNIQUE e 27 índices distintos. `verify-schema.sql` e `verify-history-preservation.sql` passaram com dados sintéticos revertidos por ROLLBACK.
- O catálogo inicial de materiais contém 12 categorias (Papel, Papelão, Plásticos, Vidro, Metais, Embalagens longa vida, Óleo de cozinha usado, Pilhas e baterias, Resíduos eletroeletrônicos, Lâmpadas, Pneus, Roupas e tecidos). A execução do seed duas vezes no MySQL local retornou os mesmos 12 registros ativos sem duplicação.
- `infra/docker/docker-compose.yml` deve montar `schema.sql` em `01-schema.sql` e `seed.sql` em `02-seed.sql`, nessa ordem. Esses scripts só são executados automaticamente na inicialização de um volume vazio. O volume em uso foi preservado.
- A validação local de `docker compose --env-file infra/docker/.env -f infra/docker/docker-compose.yml config --quiet` passou após a alteração do Compose.

### Estado atual e próxima atividade

- Banco de dados: tarefa `[E2] Implementar esquema e dados iniciais do banco` avançada. O DDL já estava validado; o seed de 12 categorias foi executado duas vezes sem duplicação. Compose e documentação foram atualizados diretamente no GitHub.
- Sincronização local/GitHub: o usuário executou `git stash push -u`, `git fetch origin`, `git merge --ff-only origin/main`, recuperou seletivamente as alterações mobile, criou o commit `48fb37c` e o enviou à branch `main`. O stash de backup permanece guardado. A pasta local `mobile/.claude/` foi deixada fora do commit.
- API de centros publicada em `backend/src/centers/`, registrada em `backend/src/app.ts`, com testes em `backend/tests/centers.test.ts`; endpoints `GET /centers`, `GET /centers/:id`, `POST /centers`, `PUT /centers/:id`, `DELETE /centers/:id`.
- Validação local da API em 25/10/2026 com Node.js `v24.22.1`: `npm run typecheck` terminou sem erros; `npm test` aprovou 14 testes em 2 suítes; `npm run build` terminou sem erros.
- Validação HTTP local de 25/10/2026: `GET /health` respondeu 200 com MySQL conectado; `GET /centers` respondeu 200 com lista vazia; filtro inválido respondeu 400; centro inexistente respondeu 404. Essas chamadas validaram leitura/consulta contra o banco em execução.
- O teste `backend/tests/centers.repository.integration.test.ts`, executado por `npm run test:integration:centers`, passou localmente em 25/10/2026: 1 suíte/1 teste, cobrindo criação, consulta, atualização e desativação no MySQL real; a limpeza da fixture terminou sem erro.
- Foi implementada a primeira versão da autenticação em `backend/src/auth/`: cadastro/login, bcrypt, JWT Bearer com validade de uma hora, endpoint `/auth/me` e middleware que verifica token e conta ativa. Novas dependências no `backend/package.json`: `bcryptjs`, `jsonwebtoken` e `@types/jsonwebtoken`.
- Validação da implementação de autenticação em 25/10/2026: `npm install` instalou 17 pacotes e reportou zero vulnerabilidades; `npm run typecheck` e `npm run build` passaram; `npm test` passou com 22 testes, 3 suítes aprovadas e uma suíte de integração ignorada no run geral. A suíte MySQL de centros havia passado separadamente.
- Validação em execução da autenticação concluída em 25/10/2026: cadastro HTTP 201; login HTTP 200; `/auth/me` com token HTTP 200; rota protegida sem token HTTP 401; rota protegida com token válido e corpo inválido HTTP 400. A chave JWT está configurada somente no ambiente local do Docker, sem ser versionada.
- Foi criado `backend/scripts/run-centers-http-integration.cjs`, comando `npm run test:integration:centers:http`, para validar via HTTP o ciclo com JWT e MySQL real: cadastro do responsável, criação/listagem/consulta/atualização/desativação do centro e confirmação de que o centro desativado sai da consulta pública. O script gera dados sintéticos e tenta removê-los ao final, protegendo registros com solicitações vinculadas.
- Validação final da tarefa `[E2] Implementar API de cadastro e consulta de centros` concluída em 31/10/2026: `npm run test:integration:centers:http` passou via HTTP com autenticação JWT e MySQL real. Respostas confirmadas: API/MySQL 200; responsável 201; centro 201; listagem/consulta 200; atualização 200; confirmação de persistência 200; desativação 204; consulta após desativação 404; centro ausente na listagem 200. A limpeza confirmou remoção do usuário e centro sintéticos.
- A tarefa da API de centros pode ser marcada como concluída no ClickUp. Não afirmar que o CRUD dos pedidos de coleta está implementado; esse é um fluxo futuro distinto.
- Tarefa `[E2] Escrever testes para centros e tipos de resíduos` concluída e validada localmente em 31/10/2026.
- Card `[E2] Implementar autenticação e controle de acesso básico`: escopo já implementado em `backend/src/auth/` e integrado às rotas de centros. RF-06 atendido: validação de e-mail/campos, senha mínima de 10 caracteres, prevenção de e-mail duplicado, mensagem genérica para credenciais inválidas e bcrypt. JWT HS256 com issuer/audience, validade de 1 hora, segredo `AUTH_JWT_SECRET` com pelo menos 32 bytes e verificação da conta ativa em cada requisição autenticada.
- Tarefa atual do ClickUp: `[E2] Documentar os endpoints iniciais da API` (RNF-08). Não havia especificação OpenAPI anterior; foi criado `backend/openapi.yaml` em OpenAPI 3.1.0 cobrindo as operações existentes de health, autenticação, catálogo de materiais e centros, com parâmetros, request/response schemas, erros e autenticação Bearer JWT. A documentação interativa foi integrada à API em `GET /docs` via `swagger-ui-express`; o YAML é servido em `GET /openapi.yaml`.
- `backend/README.md` orienta o acesso direto à interface em `http://127.0.0.1:3000/docs` no ambiente local. Não foi adicionada rota `/docs` nem dependência de Swagger UI. `docs/evidencias/sprint-3/README.md` e a seção 5.1.1.7 do apoio acadêmico foram atualizados.
- Próxima ação local: `git pull --ff-only origin main`; em `backend/`, executar `nvm use 24` e `npm install` para instalar `swagger-ui-express@5.0.1` e `@types/swagger-ui-express@4.1.8` e atualizar `package-lock.json`. Depois executar `npm run typecheck`, `npm test` e `npm run build`; conferir `git status --short` e versionar `backend/package-lock.json`. Reconstruir a API Docker e verificar `http://127.0.0.1:3000/docs` e `http://127.0.0.1:3000/openapi.yaml`. A tarefa só deve ser concluída após validar essas rotas localmente.
- Controle de acesso: `POST`, `PUT` e `DELETE /centers` exigem usuário autenticado; `PUT` e `DELETE` são limitados pelo `responsible_user_id` do centro. Testes cobrem ausência de identidade, conta inativa, token inválido e tentativa de alterar/desativar centro de outro responsável. Smoke test real anterior no Docker: cadastro 201, login 200, `/auth/me` 200, escrita sem token 401 e token válido com corpo inválido 400. Não reimplementar autenticação.
- README e evidência da Sprint 3 atualizados em 31/10/2026. O conteúdo acadêmico já está registrado em 5.1.1.7 (implementação) e 5.1.2 (testes); não inserir texto duplicado. O card pode ser marcado como concluído no ClickUp.
- Testes publicados: ampliação de `backend/tests/centers.test.ts` (autorização, erros HTTP e acesso por responsável); novo `backend/tests/centers.validation.test.ts` (identificadores, filtros, dados obrigatórios, limites, coordenadas, horários, materiais e duplicidades); novo `backend/tests/materials.repository.test.ts` (SQL de materiais ativos, ordenação, mapeamento e falha); `backend/tests/materials.test.ts` já cobre o contrato HTTP público.
- Testes adicionais publicados: `backend/tests/auth.repository.test.ts` cobre a persistência SQL de usuários e `backend/tests/centers.repository.integration.test.ts` foi ampliado para exercitar consultas com filtros, ausência de registros, centro de outro responsável, responsável inativo, materiais inválidos e troca de associações no MySQL.
- Documentação do backend, evidências da Sprint 3 e texto de apoio da seção 5.1.2 foram atualizados com o resultado final.
- Observação obrigatória: `backend/package.json` exige Node.js `>=24 <25`. O último terminal do usuário estava em Node.js `v22.23.2`; antes das validações, usar `nvm install 24` e `nvm use 24` e confirmar `node -v`.
- Validação final da tarefa de testes em Node.js `v24.22.2`: `npm run typecheck` e `npm run build` passaram; `npm test` aprovou 166 testes em 7 suítes, com 1 suíte de integração opt-in ignorada; `npm run test:coverage` habilitou MySQL real e aprovou 167 testes em 8 suítes. Cobertura: 91,74% instruções, 85,03% branches, 92,75% funções e 93,8% linhas, acima do mínimo de 70% do RNF-07.
- A tarefa `[E2] Escrever testes para centros e tipos de resíduos` pode ser marcada como concluída no ClickUp. Próximo passo: revisar os itens restantes do backlog; observar que autenticação JWT já foi implementada e validada no backend, enquanto a documentação OpenAPI/Swagger dos endpoints continua registrada como requisito RNF-08.
- Próxima tarefa em andamento: `[E2] Implementar API de tipos de resíduos e associações`. O catálogo de materiais já existe no MySQL (12 categorias no seed); os centros já recebem `materialIds` em POST/PUT, validam materiais ativos dentro da transação e preservam vínculos antigos como `is_accepted = FALSE`.
- Implementação publicada para Sprint 3: novo módulo `backend/src/materials/`, endpoint público `GET /materials` (id, name, slug, description; somente ativos; ordenação por nome/id), registrado em `backend/src/app.ts`; testes em `backend/tests/materials.test.ts`. Nenhuma alteração de schema nem operações de escrita do catálogo.
- Validação local da API de materiais concluída em 31/10/2026: `npm run typecheck` passou; `npm test` aprovou 25 testes em 4 suítes, com 1 suíte de integração opcional ignorada na execução geral; a imagem Docker foi reconstruída e compilada com Node.js 24.
- `npm run test:integration:centers:http` passou: catálogo público igual aos materiais ativos do MySQL e em ordem alfabética; cadastro de centro com material; atualização trocando material; confirmação via API/MySQL de novo vínculo aceito e vínculo anterior com `is_accepted = FALSE`; consulta e desativação lógica; remoção do centro da listagem; limpeza do usuário e centro sintéticos confirmada.
- ATENÇÃO: a sessão de terminal local usada para `npm run typecheck` e `npm test` estava em Node.js `v22.23.2`, abaixo do requisito `>=24 <25` em `backend/package.json`. Build e serviço runtime da API foram executados com Node.js 24 no Docker. Antes de novas execuções backend diretamente no host, orientar a troca para Node.js 24.
- A tarefa `[E2] Implementar API de tipos de resíduos e associações` foi tecnicamente validada; sua implementação não substitui a tarefa separada de testes.
- `backend/package-lock.json` foi atualizado e publicado no commit `b437082`. A pasta local `mobile/.claude/` permanece não rastreada e deve ser preservada, sem inclusão automática nos commits.
- O npm mostrou aviso que o script de instalação de `esbuild@0.28.2` não foi explicitamente aprovado via `install-scripts`; considerar isso somente se for executar a API diretamente no host com `npm run dev`. A imagem Docker foi construída e a API ficou saudável.
- Ao encerrar uma etapa, atualizar diretamente pelo GitHub os READMEs técnicos, `docs/evidencias/sprint-2/README.md` e o documento de apoio `docs/relatorio-etapa2/`. Registrar apenas resultados confirmados. Evitar pedir ao usuário alterações manuais de arquivos que podem ser realizadas pelo conector GitHub.
