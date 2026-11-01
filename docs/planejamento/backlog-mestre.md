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
- **5 — Responsividade e usabilidade:** em andamento. Foco inicial: (1) espaço entre título e marca no hero da Home em telas estreitas; (2) legibilidade dos horários em Detalhes a 320 px; (3) cabeçalhos, chips e áreas de toque. Também verificar contraste, diferentes dimensões, Web e compatibilidade React Native.

**Estado efetivo em 01/11/2026:** Home corrigida e validada visualmente em 320 × 740 px. Playwright cobre quatro rotas e seis larguras (320, 360, 390, 430, 768 e 1280 px) com fixtures, sem gravar no MySQL. A primeira execução revelou que `**/centers**` interceptava a navegação do navegador além das chamadas da API. Correção publicada em `9bdf75a`, limitando os mocks a requisições `fetch` e aos caminhos da API. A suíte ainda precisa ser reexecutada localmente e as capturas inspecionadas; não está aprovada.

## Regras de interpretação e planejamento

- `Etapa` é a etapa acadêmica (Etapa 1/Etapa 2); `Sprint planejada` é a sprint do card; `[E1]`/`[E2]` identificam a etapa acadêmica.
- 4.1 a 4.4 e 5 são etapas internas do card de design system; **não** são Sprints 4/5 nem novas etapas acadêmicas.
- A etapa 5 atual pertence ao card de design system da **Etapa 2 / Sprint 4**. Não confundir com os cards de QA, validação e usabilidade separados da Sprint 6.
- O CSV contém apenas escopo e metadados do planejamento; não prova status, execução, dependências ou parent/child.
- Ao orientar fases, sprints e cards, cruzar este mapa com `docs/CONTINUIDADE.md`, commits/evidências e mudanças posteriores no ClickUp. Distinguir planejado, implementado, validado e documentado; não reabrir concluídos nem antecipar cards futuros.