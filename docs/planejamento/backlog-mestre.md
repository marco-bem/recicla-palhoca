# Mapa mestre do backlog — ReciclaPalhoça

**Fonte:** CSV exportado do backlog cadastrado no ClickUp (`ReciclaPalhoca_ClickUp_Backlog(2).csv`). Exportação recebida em 01/11/2026: 39 cards, Etapa 1 e Etapa 2, Sprints 1 a 6.

> Este mapa registra a estrutura e o escopo planejado, não o status atual. Para progresso efetivo, prevalecem `docs/CONTINUIDADE.md`, os commits/evidências da `main` e o status atual no ClickUp. O CSV não contém status, dependências explícitas ou hierarquia pai/filho.

## Macroestrutura

- **Etapa 1 / Sprint 1:** consolidação dos capítulos 1–4, referências, configuração do ClickUp, fluxos/wireframes e protótipo Figma, vídeo e entrega da primeira etapa.
- **Etapa 2 / Sprint 2:** requisitos e critérios de aceitação, modelo do banco, repositório/estrutura, ambientes mobile e backend, Docker e ferramentas de teste.
- **Etapa 2 / Sprint 3:** esquema/seed do banco, APIs de centros e materiais, testes, autenticação/controle de acesso e documentação OpenAPI/Swagger.
- **Etapa 2 / Sprint 4:** navegação/telas de consulta, design system (card adicional), detalhes do centro, integração com API, mapa/geolocalização, dados reais dos centros e testes de componentes.
- **Etapa 2 / Sprint 5:** formulário de solicitação de coleta, validações, status/acompanhamento, visualização pelo centro e testes do fluxo completo.
- **Etapa 2 / Sprint 6:** testes integrados/regressão, validação, usabilidade, correções/cobertura, documentação técnica, vídeo demonstrativo e entrega final.

## Cards do CSV por etapa e sprint

### Etapa 1 — Sprint 1
1. [E1] Revisar e consolidar os capítulos 1 a 3.
2. [E1] Finalizar o capítulo 4 e os subitens 4.1.1 a 4.1.8.
3. [E1] Revisar citações e referências bibliográficas.
4. [E1] Configurar e organizar o ClickUp.
5. [E1/E2] Elaborar fluxos e wireframes no Figma.
6. [E1/E2] Criar protótipo navegável inicial no Figma.
7. [E1] Preparar e gravar o vídeo de apresentação.
8. [E1] Fazer revisão final e entregar a Etapa 1.

### Etapa 2 — Sprint 2
1. [E2] Detalhar requisitos e critérios de aceitação.
2. [E2] Modelar o banco de dados.
3. [E2] Criar repositório Git e estrutura do projeto.
4. [E2] Configurar o ambiente mobile com Expo e TypeScript.
5. [E2] Configurar backend, Express, MySQL e Docker.
6. [E2] Configurar ferramentas de teste.

### Etapa 2 — Sprint 3
1. [E2] Implementar esquema e dados iniciais do banco.
2. [E2] Implementar API de cadastro e consulta de centros.
3. [E2] Implementar API de tipos de resíduos e associações.
4. [E2] Escrever testes para centros e tipos de resíduos.
5. [E2] Implementar autenticação e controle de acesso básico.
6. [E2] Documentar os endpoints iniciais da API.

### Etapa 2 — Sprint 4
1. [E2] Implementar navegação e telas de consulta.
2. [E2] Definir e aplicar o design system visual definitivo (card incluído posteriormente, conforme histórico informado pelo usuário; no CSV o prefixo [E2] aparece duplicado).
3. [E2] Implementar detalhes do centro de reciclagem.
4. [E2] Integrar telas mobile com a API de centros.
5. [E2] Implementar mapa e geolocalização.
6. [E2] Verificar e cadastrar informações reais dos centros conhecidos.
7. [E2] Criar testes dos componentes mobile.

### Etapa 2 — Sprint 5
1. [E2] Implementar formulário de solicitação de coleta.
2. [E2] Implementar validações da solicitação.
3. [E2] Implementar status e acompanhamento da solicitação.
4. [E2] Implementar visualização das solicitações pelo centro.
5. [E2] Testar o fluxo completo de solicitação de coleta.

### Etapa 2 — Sprint 6
1. [E2] Executar testes integrados e de regressão.
2. [E2] Validar funcionamento em dispositivo Android.
3. [E2] Avaliar usabilidade com potenciais usuários.
4. [E2] Corrigir falhas prioritárias e conferir cobertura de testes.
5. [E2] Finalizar documentação técnica e instruções de execução.
6. [E2] Preparar vídeo demonstrativo da aplicação.
7. [E2] Revisar e entregar a versão final do projeto.

## Detalhamento do card adicional — design system visual definitivo

**Objetivo:** definir e implementar o design system visual oficial do ReciclaPalhoça, com padrões e componentes reutilizáveis para consistência entre telas. O protótipo de média fidelidade da Sprint 1 orienta fluxos e hierarquia, mas não é a especificação visual definitiva.

**Escopo:** (1) identidade visual — paleta principal/secundária/semântica, tipografia, espaçamentos, dimensões, bordas, raios, elevações e iconografia; (2) componentes — botões/estados, campos/busca, cards, filtros/seletores, cabeçalhos/navegação e feedback; (3) Figma — página, estilos, variáveis, componentes, variantes e regras; (4) implementação Expo/React Native — tokens, componentes e aplicação às telas existentes; (5) responsividade/usabilidade — dimensões, legibilidade, contraste, áreas de interação, navegador e compatibilidade React Native.

**Critérios de aceitação:** identidade no Figma; tokens definidos; componentes documentados e implementados; telas existentes alinhadas; consistência visual; validação no navegador em 360 dp e 390 × 844; lint e TypeScript aprovados.

**Fora do escopo:** novas funcionalidades de negócio, solicitação de coleta, administração de centros e integrações adicionais.

### Etapas internas do card

- **4.1 — Implementar os design tokens:** concluída. Paleta/cores semânticas, Inter e hierarquia, espaçamentos/dimensões, raios/bordas/elevação e identidade visual no código (`theme.ts`).
- **4.2 — Implementar os componentes:** concluída. Biblioteca reutilizável no Expo, incluindo botões, campos, chips, badges, cartões, cabeçalhos, navegação e feedback.
- **4.3 — Atualizar as telas existentes:** concluída. Início, Centros, Definir localização e Detalhes do centro, preservando regras e integrações.
- **4.4 — Consolidar a implementação visual:** concluída. Consistência entre telas/componentes/navegação e remoção de estilos comprovadamente obsoletos.
- **5 — Responsividade e usabilidade:** concluída em 01/11/2026. Foram verificadas legibilidade, rolagem, contraste, dimensões de interação, navegação, filtros e busca no Expo Web.

**Estado efetivo em 01/11/2026 — etapa 5 validada:**
- Revisão visual de 32 capturas: 24 capturas das quatro rotas em seis viewports (320, 360, 390, 430, 768 e 1280 px) e oito capturas de fim de rolagem de Home/Detalhes. Sem cortes dos dados inferiores, horários ilegíveis em 320 px ou sobreposição entre título e marca.
- Playwright: **7 testes aprovados**, seis testes responsivos cobrindo as quatro rotas nos seis viewports e um cenário de usabilidade com navegação, filtros, busca, teclado/toque e áreas mínimas dos controles. API simulada por fixtures, sem gravação no MySQL.
- Jest: **6 suítes e 30 testes unitários aprovados**. A descoberta do Jest foi configurada para ignorar `e2e/`; Playwright permanece no comando `test:e2e` (commit `ece48dd`).
- `npx tsc --noEmit` e `npm run lint`: concluídos sem erros.
- As dimensões de chips e do botão Voltar permanecem conforme o Figma e superam o mínimo AA de 24 × 24 CSS px, embora não alcancem o critério AAA de 44 × 44 px. O FAB observado em viewport estreito foi identificado como ferramenta de desenvolvimento Expo, não componente do aplicativo.

**Status:** as cinco etapas internas do card (4.1–4.4 e 5) estão concluídas. A validação não substitui os cards independentes de QA, teste em dispositivo Android ou avaliação com usuários previstos na Sprint 6.

## Fechamento da Sprint 4 — 02/11/2026

A execução técnica dos sete cards da Sprint 4 foi concluída. O usuário aprovou os testes visuais finais no Expo Web e informou que marcará o último card como concluído no ClickUp.

| Card | Resultado técnico |
|---|---|
| [E2] Definir e aplicar o design system visual definitivo | CONCLUÍDO |
| [E2] Implementar navegação e telas de consulta | CONCLUÍDO |
| [E2] Implementar detalhes do centro de reciclagem | CONCLUÍDO |
| [E2] Integrar telas mobile com a API de centros | CONCLUÍDO |
| [E2] Criar testes dos componentes mobile | CONCLUÍDO |
| [E2] Implementar mapa e geolocalização | CONCLUÍDO |
| [E2] Verificar e cadastrar informações reais dos centros conhecidos | CONCLUÍDO TECNICAMENTE; testes visuais aprovados |

O card de centros reais cadastrou três registros no banco local — Associação Recicla Palhoça (ID 10), Associação Pró-CREP (ID 11) e Weee.do (ID 12) — e confirmou os três pela API pública. Os logins demonstrativos responderam HTTP 200. O usuário original ID 6 foi preservado. Não houve alterações de schema ou código nesse card; não há commit de código pendente.

O frontend foi conferido visualmente pelo usuário no Expo Web e os testes passaram. Fontes e ressalvas sobre horários e coordenadas estão registradas em `docs/evidencias/sprint-4/README.md` e `docs/CONTINUIDADE.md`.

## Próximo trabalho — Etapa 2 / Sprint 5

A Sprint 5 deve começar pelo primeiro card da sequência, sem antecipar os seguintes:

1. [E2] Implementar formulário de solicitação de coleta.
2. [E2] Implementar validações da solicitação.
3. [E2] Implementar status e acompanhamento da solicitação.
4. [E2] Implementar visualização das solicitações pelo centro.
5. [E2] Testar o fluxo completo de solicitação de coleta.

Na nova sessão, planejar o primeiro card antes de executar: apresentar escopo, arquivos/endpoints envolvidos, sequência, critérios de aceitação e validação mínima; aguardar aprovação. Priorizar execução objetiva, sem multiplicar testes ou processos sem necessidade.
