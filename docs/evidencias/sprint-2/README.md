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
