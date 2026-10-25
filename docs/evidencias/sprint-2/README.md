# Evidências da Sprint 2

## Estrutura inicial do backend — 25/10/2026

A estrutura inicial da API foi publicada no repositório com Express 5, TypeScript, pool de conexões MySQL, endpoints `GET /health/live` e `GET /health`, testes HTTP com Jest/Supertest e Dockerfile. O Compose foi ampliado para iniciar a API no container `recicla-palhoca-api`, preservando o serviço MySQL `recicla-palhoca`.

**Validação local do código — informada em 25/10/2026:** o usuário confirmou que `npm install`, `npm run typecheck`, `npm test` e `npm run build` foram concluídos sem erros. O `package-lock.json` gerado localmente ainda precisa ser versionado no GitHub. **Validação em Docker pendente:** construir/subir os dois serviços, confirmar os containers saudáveis e consultar `GET /health/live` e `GET /health`.

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
- execução da aplicação Expo no Android/emulador;
- saída resumida dos testes e relatório de cobertura, quando aplicável.

Não incluir tokens, senhas, arquivos `.env`, telefones reais, endereços privados ou outros dados pessoais. Capturas são complementares; código, comandos e resultados reproduzíveis são as evidências principais.
