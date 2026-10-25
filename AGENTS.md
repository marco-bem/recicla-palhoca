# Instruções de continuidade do projeto ReciclaPalhoça

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

### Próxima atividade

- Contexto imediato: tarefa do ClickUp `[E2] Implementar esquema e dados iniciais do banco`.
- O schema e os testes transacionais já estavam no repositório; o seed de 12 categorias, o mount correspondente no Compose e as atualizações de documentação foram sincronizados para `main` em 25/10/2026. O catálogo foi executado duas vezes no ambiente local, sem duplicações, e `docker compose ... config --quiet` passou. Próximo passo: verificar os arquivos/commits publicados no `main`, depois continuar para a próxima tarefa do backlog sem refazer a configuração do banco.
