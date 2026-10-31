# Continuidade do projeto ReciclaPalhoça

**Atualizado em:** 31/10/2026  
**Repositório:** https://github.com/marco-bem/recicla-palhoca  
**Branch:** `main`  
**Último commit verificado antes deste registro:** `2dda89eafa6194a540b36ccbe1936984fe6f60a6`

Este arquivo é o ponto de partida para novos chats e sessões. Leia-o junto com `AGENTS.md`, os requisitos e as evidências da atividade em andamento. Em caso de divergência, confira o estado atual dos arquivos e commits; não trate snapshots antigos de `AGENTS.md` como estado vigente.

## 1. Objetivo e escopo

Projeto acadêmico individual **Hands On Work VIII — ReciclaPalhoça**. Aplicativo mobile para facilitar a consulta de centros de reciclagem de Palhoça, seus materiais aceitos, localização e serviços, incluindo solicitação e acompanhamento de coleta quando oferecida pelo centro.

O MVP não inclui integração com prefeitura/consórcio, roteirização, pagamentos, marketplace ou notificações push. Cada responsável pode administrar no máximo um centro. A consulta pública não exige conta; o acompanhamento de solicitações pelo cidadão usa protocolo e telefone. Dados demonstrativos do protótipo não são estabelecimentos reais.

## 2. Stack e ambiente

- Mobile: React Native, Expo SDK 58, TypeScript, Expo Router; validação visual pelo Expo Web.
- Backend: Node.js 24.x, Express 5, TypeScript.
- Banco: MySQL 8.4 em Docker Compose.
- Testes: Jest, jest-expo, React Native Testing Library e Supertest.
- Repositório privado: `marco-bem/recicla-palhoca`.
- Ambiente local do usuário: Linux Zorin. Não pressupor Windows nem dispositivo Android físico.
- Backend exige Node.js `>=24 <25`; confirmar `node -v` antes de executar comandos do backend no host.
- Preservar o volume MySQL; nunca usar `docker compose down -v` como rotina. Não versionar `.env`, credenciais, tokens ou dados pessoais. Preservar `mobile/.claude/` local se aparecer como não rastreada; não usar `git add .`.

## 3. Decisões funcionais consolidadas

A especificação de referência é `docs/requisitos-e-criterios-aceitacao.md`. Entre as decisões principais:
- Consulta pública de centros e materiais; responsável autenticado administra apenas o próprio centro.
- Cidadão não cria conta no MVP.
- Localização por GPS autorizado ou CEP/endereço; ordenação por distância em linha reta, não rota ou tempo de viagem.
- Catálogo de materiais controlado pelo sistema.
- Receber entrega e oferecer coleta são serviços distintos.
- Pedido só pode ser criado para centro ativo que oferece coleta.
- Preferência de data/período não é agendamento confirmado.
- Estados de solicitação: `PENDENTE`, `ACEITA`, `RECUSADA`, `CONCLUÍDA`.
- Desativação de centros preserva o histórico.

## 4. Histórico consolidado de entregas

### Etapa 1 / Sprint 1
Planejamento acadêmico, contextualização, objetivos, escopo, stakeholders, prova de conceito, backlog Scrum, protótipo inicial e entrega acadêmica. O protótipo original de média fidelidade permanece separado e inalterado.

### Etapa 2 — base técnica
- Requisitos funcionais/não funcionais, regras de negócio e critérios de aceitação documentados.
- Modelo relacional MySQL com oito tabelas, restrições e índices; catálogo seed com 12 categorias de materiais.
- Repositório, estrutura mobile/backend e Docker Compose configurados.
- Backend Express/TypeScript, health checks, autenticação JWT, controle de acesso, CRUD de centros, catálogo público de materiais e associações.
- OpenAPI 3.1 e Swagger UI em `/docs`, especificação em `/openapi.yaml`.
- Testes backend e mobile configurados; testes de integração com MySQL real executados nas tarefas respectivas.

### Mobile funcional existente
A tarefa de navegação e consulta foi implementada e validada em 31/10/2026:
- Abas Início e Centros.
- Pesquisa e filtros por centro/bairro, material e oferta de coleta.
- Definição de localização por GPS ou CEP.
- Integração com `GET /centers` e `GET /materials`.
- Ordenação por distância geográfica em linha reta quando há coordenadas.
- Estado vazio quando não há centros públicos cadastrados.
- Validações locais registradas: lint, TypeScript e 16 testes em quatro suítes; fluxos de consulta, GPS e CEP conferidos no Expo Web.
- A rota de detalhe do centro também existe no código e consulta `GET /centers/:id`; seu layout ainda precisa ser alinhado ao design aprovado.

Consultar `docs/evidencias/sprint-3/README.md`, `docs/evidencias/sprint-4/README.md` e `mobile/README.md` para os detalhes e evidências de cada camada.

## 5. Design system e Figma — estado atual

Arquivo oficial: https://www.figma.com/design/86gOPT9bakn1ty0RDm1Ho0/ReciclaPalho%C3%A7a

O arquivo tem três páginas:
1. Fundamentos visuais.
2. Biblioteca de componentes.
3. Fluxos e protótipo mobile.

A identidade aprovada usa verde como cor principal, com verde vivo, azul, coral e amarelo como complementares; tipografia Inter; tokens de cor, espaçamento, raios, contornos, elevação e iconografia. A marca aprovada é um pin de localização com o símbolo universal de reciclagem de três setas em seu interior, com versões clara e escura.

A auditoria estrutural encontrou 101 componentes, 14 conjuntos de variantes, 105 variáveis e nove estilos tipográficos. O protótipo de alta fidelidade tem 16 artboards de 390 × 844 px: oito telas do cidadão e oito do responsável pelo centro. Foram registradas 75 interações e os destinos foram estruturalmente validados.

**Fase 3 — layouts e protótipo:** concluída, incluindo microetapa 3.6 (revisão de qualidade), com aprovação do usuário. Correções feitas: chips de materiais, colisão entre protocolo e status nos cartões, espaçamentos da tela de localização, ícone de solicitações e marca. O quadro técnico sobre provedores foi retirado da tela de localização.

Último ajuste de layout no Figma: na tela **04 — Detalhes do centro**, removidos o ícone/ilustração sem definição, o círculo verde e o círculo amarelo do cartão principal; preservados o fundo verde e os textos. A captura PNG individual foi atualizada no GitHub em `docs/evidencias/design-system/tela-03-detalhes-do-centro.png`, commit `2dda89e`.

Outras capturas individuais para o relatório ficam em `docs/evidencias/design-system/`: início, centros próximos, detalhes do centro, solicitação de coleta, painel do centro e detalhe da solicitação. A seção de apoio acadêmico `docs/relatorio-etapa2/secao-5-1-1-requisitos.md` contém a subseção 5.1.1.9 simplificada; o usuário informou que já atualizou o documento acadêmico principal localmente.

## 6. Estado atual e próximo trabalho

**Fase atual: Fase 4 — Implementação Expo do design system aprovado.**  
**Próxima atividade exata: 4.1 — Implementar os design tokens.**

O plano de execução acordado:
- **4.1 Design tokens:** extrair os valores definitivos da página 01 do Figma e consolidar cores semânticas, tipografia Inter, espaçamento, dimensões, raios, bordas, elevação e marca em `mobile/src/constants/theme.ts` e nos assets pertinentes.
- **4.2 Componentes:** alinhar `mobile/src/components/recicla-ui.tsx`, navegação e componentes compartilhados à biblioteca Figma.
- **4.3 Telas existentes:** aplicar o sistema às telas Início, Centros, Definir localização e Detalhes do centro, preservando integrações e comportamentos funcionais.
- **4.4 Consolidação:** eliminar estilos legados desses percursos e conferir consistência visual antes do QA.
- **Fase 5 — QA visual e técnico:** responsividade, acessibilidade/contraste, lint, TypeScript e testes.

**Primeiro procedimento da próxima sessão:** consultar a página **01 — Fundamentos visuais** do Figma e extrair os valores exatos dos tokens; compará-los com o tema existente em `mobile/src/constants/theme.ts`. Não começar alterando as telas antes de consolidar e validar os tokens.

## 7. Estado conhecido do código antes da Fase 4

- `mobile/src/constants/theme.ts`: ainda contém a paleta azul antiga (`#0E4166`, `#258FD2`, etc.), tipografia genérica e uma escala de espaçamento inicial.
- `mobile/src/components/recicla-ui.tsx`: contém AppScreen, AppCard, AppText, AppButton, FilterChip, ScreenHeader e FeedbackCard; usa `Colors.light` diretamente e `fontFamily: 'System'`.
- `mobile/src/components/app-tabs.tsx`: abas Início e Centros, com cores derivadas do tema antigo.
- `mobile/src/app/(tabs)/index.tsx`: tela inicial funcional, mas ainda com marca representada pela letra R e estilo anterior.
- `mobile/src/app/(tabs)/centers.tsx`: consulta funcional, ainda com estilo anterior.
- `mobile/src/app/location.tsx`: GPS/CEP funcionais, layout anterior.
- `mobile/src/app/center/[id].tsx`: detalhes do centro já consultam a API; layout anterior e marcador textual com inicial do centro.
- `mobile/package.json`: Expo SDK 58; Jest/jest-expo e React Native Testing Library instalados.

Não presumir que as 16 telas do Figma já estejam implementadas no Expo. A Fase 4 deste plano trata primeiro do design system e da atualização dos quatro percursos/telas existentes. As demais funcionalidades e jornadas devem seguir os cards e dependências próprios do backlog.

## 8. Regras de trabalho para novos chats

- Antes de qualquer orientação ou alteração, consultar este documento, `AGENTS.md`, commits recentes e arquivos envolvidos; conferir o Figma quando a tarefa for visual.
- Preferir alterações pequenas, sequenciais e rastreáveis, diretamente no GitHub quando apropriado.
- Para alterações locais, fornecer o arquivo completo quando for solicitada substituição.
- Pedir ao usuário somente validações que dependam do ambiente local; não afirmar que testes locais passaram sem execução/relato comprovado.
- Avançar uma microetapa por vez, com instruções objetivas.
- Distinguir planejado, implementado, validado e documentado; nunca declarar tarefa concluída sem evidência.
- Não reabrir decisões aprovadas nem refazer trabalho concluído sem motivo técnico claro.

## 9. Links de referência

- Repositório: https://github.com/marco-bem/recicla-palhoca
- Instruções de continuidade: `AGENTS.md`
- Requisitos: `docs/requisitos-e-criterios-aceitacao.md`
- Apoio acadêmico: `docs/relatorio-etapa2/secao-5-1-1-requisitos.md`
- Evidências Sprint 3: `docs/evidencias/sprint-3/README.md`
- Evidências Sprint 4: `docs/evidencias/sprint-4/README.md`
- Figma definitivo: https://www.figma.com/design/86gOPT9bakn1ty0RDm1Ho0/ReciclaPalho%C3%A7a
- Último commit antes deste registro: https://github.com/marco-bem/recicla-palhoca/commit/2dda89eafa6194a540b36ccbe1936984fe6f60a6
