# Continuidade do projeto ReciclaPalhoça

**Atualizado em:** 01/11/2026  
**Repositório:** https://github.com/marco-bem/recicla-palhoca  
**Branch:** `main`  
**Último commit de implementação publicado:** `720bc8d4a37540ef8578c7118372d6088f3bb2a7`

Este arquivo é o ponto de partida para novos chats e sessões. Leia-o junto com `AGENTS.md`, os requisitos e as evidências da atividade em andamento. Em caso de divergência, confira o estado atual dos arquivos e commits; não trate snapshots antigos de `AGENTS.md` como estado vigente.

**Mapa geral do backlog:** consultar `docs/planejamento/backlog-mestre.md`, que resume as 39 tarefas da exportação CSV por etapa acadêmica e sprint, além do escopo e das etapas internas do card de design system incluído posteriormente. O mapa é referência de escopo, não fonte de status; confirmar progresso no ClickUp, nos commits e nas evidências.

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
- Validação anterior da navegação funcional: `npm test -- --runInBand` aprovou 20 testes em cinco suítes. A validação da Fase 4.2 ampliou a cobertura para 26 testes em seis suítes e confirmou o carregamento no Expo Web.
- A rota de detalhe do centro também existe no código e consulta `GET /centers/:id`; o layout foi alinhado ao design aprovado e validado visualmente na subetapa 4.3.4.

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

**Card em andamento:** `[E2] Definir e aplicar o design system visual definitivo` — **Etapa 2 / Sprint 4**. A etapa 4 deste card (Implementação no aplicativo, subetapas 4.1 a 4.4) está concluída. A etapa atual é a **etapa 5 — Responsividade e usabilidade**, interna ao mesmo card. Não confundir essa numeração com a Sprint 5 ou com os cards independentes de QA/usabilidade da Sprint 6.

### Atividade 4.1 — Design tokens: concluída e validada localmente em 01/11/2026

Implementado:
- Tokens semânticos Light/Dark em `mobile/src/constants/theme.ts`, com paleta, papéis de cor e cores de categorias alinhados às variáveis do Figma.
- Tipografia Inter com nove estilos tipográficos (Display, H1, H2, H3, Body Large, Body, Label, Caption e Button), pesos Regular/Medium/SemiBold/Bold.
- Carregamento de Inter no layout raiz com `@expo-google-fonts/inter` e `expo-font`, incluindo espera no splash screen.
- Escala de espaçamento de 4 a 64 px, raios 0/8/12/16/24/999 px, largura de borda 1 px e regras-base de iconografia.
- Elevações 01/02 conforme os effect styles do Figma; o valor Android é uma aproximação de plataforma.
- Fundo do splash screen e do ícone adaptativo atualizados para `#F7FAF7`.

Arquivos: `mobile/src/constants/theme.ts`, `mobile/src/app/_layout.tsx`, `mobile/src/global.css`, `mobile/app.json`, `mobile/package.json` e `mobile/package-lock.json`.

Validação local informada pelo usuário em 01/11/2026:
- `npm ls --depth=0`: dependências instaladas e sem pacotes inválidos/ausentes.
- `npx tsc --noEmit`: sem saída e sem erros.
- `npx expo lint`: sem saída e sem erros.
- `npm test -- --runInBand`: 5 suítes aprovadas, 20 testes aprovados.
- Expo Web: telas Início e Centros carregaram; a inspeção visual confirmou tipografia/paleta e registrou o problema dos ícones/textos da navegação inferior, encaminhado para a 4.2.

### Atividade 4.2 — Componentes compartilhados e navegação: concluída e validada localmente em 01/11/2026

Implementado na branch `main`:
- `mobile/src/components/app-icons.tsx`: ícones vetoriais oficiais Home, MapPin, ClipboardList, ChevronLeft/ChevronRight, Recycle, Search, CheckCircle, AlertCircle, Info, Clock, X e Plus; inclui `BrandMark`, o pin com símbolo de reciclagem aprovado no Figma.
- `mobile/src/components/recicla-ui.tsx`: atualização dos componentes existentes e inclusão de AppIconButton, TextField, MaterialChip, StatusBadge, LocationSummary e CenterCard. AppText preserva os aliases antigos e usa tamanhos/pesos Inter do sistema visual. AppButton oferece variantes Primary/Secondary/Outline/Text e tamanhos Medium/Large. FilterChip contempla Default/Selected/Disabled. ScreenHeader usa ChevronLeft oficial. FeedbackCard preserva o uso existente e oferece layout compacto com estados Loading/Empty/Error/Success.
- `mobile/src/components/app-tabs.tsx`: navegação inferior com ícones vetoriais Home e MapPin, área de 76 px, tipografia/cores do Figma e apenas as rotas Início e Centros, que estão implementadas neste momento.
- `mobile/src/components/recicla-ui.test.tsx`: seis testes para tipografia, ação/estado desabilitado de botão, seleção de filtro, alteração de campo e badge.
- `mobile/package.json`: incluída dependência `react-native-svg`, na versão recomendada para Expo SDK 58.

**Escopo preservado para a atividade 4.3:** as telas ainda não foram remodeladas para consumir os novos componentes; a marca da tela inicial ainda precisa substituir a letra R pelo `BrandMark`. O arquivo Figma não foi modificado nesta atividade.

**Validação local informada pelo usuário em 01/11/2026:**
- `npx tsc --noEmit`: sem saída/erros.
- `npx expo lint`: passou.
- `npm test -- --runInBand`: 6 suítes aprovadas, 26 testes aprovados.
- `npx expo start --web`: tela Início carregou corretamente; a navegação inferior exibiu os ícones vetoriais de Início e Centros e o aviso de booleano inválido desapareceu após correção.
- A primeira abertura no navegador exibiu aviso relacionado à passagem de `false` para propriedade booleana. Foram removidas as props `accessible={false}` dos dois componentes SVG (`AppIcon` e `BrandMark`), commit `88efc85c2c82d1c70b8a0c22657c0beab7e85407`; após atualizar e reiniciar o Expo Web, o usuário confirmou carregamento normal.

O usuário também executou `npx expo install react-native-svg`; a dependência foi instalada. O comando reportou alertas de auditoria do npm e scripts de instalação pendentes; não executar `npm audit fix --force` sem análise específica.

### Atividade 4.3 — aplicar o design system às telas existentes: concluída e validada

Implementar sequencialmente as quatro telas já existentes — Início, Centros, Definir localização e Detalhes do centro — preservando integrações, estados, filtros e regras funcionais. Validar cada composição no Expo Web antes de avançar para a próxima tela.

#### Subetapa 4.3.1 — Home: implementação publicada; validação visual confirmada

Referência visual: frame Figma `03 — Fluxos e protótipo mobile / 01 · Início`, node `2046:90`.

Implementado na branch `main`:
- Substituição da letra R pela marca oficial `BrandMark`; o componente aceita cor de primeiro plano para a variante sobre o círculo verde do hero.
- Hero verde com textos e marca da composição aprovada.
- Cartão compacto de localização com ícone e navegação para a rota existente `/location`.
- Campo de busca com ícone, tipografia e borda do design system; ao enviar, identifica correspondência com nome/slug de material e aplica o filtro correspondente; se não houver correspondência, encaminha a consulta como busca por centro/bairro.
- Chips dinâmicos de materiais, com cores de categoria quando há correspondência semântica segura; mantida a chamada à API e o filtro por slug.
- Cartão compacto de centro composto pelo componente compartilhado `CenterCard`, preservando a navegação para detalhes e exibindo materiais/serviço disponíveis.
- Estados de carregamento, erro e lista vazia preservados, sem inserir estabelecimentos demonstrativos fictícios.

Componentes compartilhados refinados para viabilizar a tela:
- `AppScreen` aceita cor de fundo opcional.
- `TextField` aceita ícone à esquerda.
- `LocationSummary` adota a composição horizontal compacta.
- `MaterialChip` apresenta ponto colorido por categoria.
- `CenterCard` oferece variante compacta com faixa de destaque e chevron.

Arquivos alterados:
- `mobile/src/app/(tabs)/index.tsx`
- `mobile/src/components/app-icons.tsx`
- `mobile/src/components/recicla-ui.tsx`
- `mobile/src/components/recicla-ui.test.tsx`

Commits:
- `f45bf9c9330f90a2c9b3bf38ad9bc64959615d7c` — variante de cor da marca.
- `1f753363e631444db96963ffde8dec46ea587386` — componentes compartilhados.
- `883056b87a0b774f7500ec5206fa8ddab0b467a0` — testes dos componentes.
- `22c843c7f95793ddb64cfe2e0f69b5e2d3c2af53` — aplicar design system à Home.
- `d9445a850c428982c47e3803100b7d8fb070fedc` — evitar filtro de material com busca vazia.
- `88efc85c2c82d1c70b8a0c22657c0beab7e85407` — testar campo de texto com ícone.

**Validação local informada pelo usuário:**
- `npx expo lint`: executado sem saída, warnings ou erros após remover o import não utilizado.
- `npm test -- --runInBand`: 6 suítes aprovadas, 28 testes aprovados.
- `npx tsc --noEmit`: a falha inicial de tipagem em `TextField` foi corrigida no commit `bddacafbd51942f1ec9ed31121cab46c9bd820f8`; a execução posterior foi aprovada, conforme validação global da Fase 4.3.
- Inspeção no Expo Web: o usuário enviou captura da Home após a implementação e confirmou que carregou corretamente; marca oficial, hero, cartão de localização, busca, chips, seção de centros e navegação inferior foram exibidos.

Commits adicionais de correção durante a validação:
- `bddacafbd51942f1ec9ed31121cab46c9bd820f8` — corrigir tipo da condição do ícone no campo.
- `4a4c855840be4169698f4c0f1f2fd81264e36e21` — remover import `Spacing` não utilizado na Home.

**Ajustes de escopo em relação ao frame:** o atalho “Sou centro” não foi incluído porque o aplicativo atual ainda não possui rota de acesso/autenticação do responsável; não criar navegação sem destino funcional. O título “Centros disponíveis” é mantido em vez de “Centros próximos”, pois a Home ainda não ordena a lista pela localização. A navegação inferior continua com duas abas — Início e Centros —, conforme a decisão anterior de não antecipar a aba Pedidos.

**Documento acadêmico:** não atualizar nesta subetapa. Reavaliar após a implementação e validação das quatro telas, incorporando apenas o resultado consolidado na seção mobile adequada (`5.1.1.8`), se houver contribuição acadêmica relevante.

#### Subetapa 4.3.2 — Definir localização: ajustes visuais publicados e validados no Expo Web

Referência visual: frame Figma `03 — Fluxos e protótipo mobile / 02 · Definir localização`, node `2046:92`. A referência aprovada encerra a composição após a ação “Buscar centros próximos”; não inclui o cartão “Como funciona”.

Implementado na branch `main`:
- Removidos o cartão informativo “Como funciona” e o rótulo “OPÇÃO 1” do cartão de localização, além do estilo associado ao cartão informativo, em `mobile/src/app/location.tsx`.
- Preservados o fluxo de permissão de GPS, a consulta por CEP, a validação do CEP, mensagens de erro, estado de carregamento e navegação para Centros.
- Nenhuma chamada de API, regra de cálculo de distância ou persistência da localização foi alterada.

Arquivo alterado: `mobile/src/app/location.tsx`.

Commits: `ab9efc0b6a063cfea0a718255bd72158c8b61f5c` (remover “Como funciona”) e `a0afaeeb06ffa315197efcd55b04950b54496b94` (remover “OPÇÃO 1”).

**Validação visual informada pelo usuário:** após sincronizar os commits `ab9efc0` e `a0afaeeb`, o usuário confirmou no Expo Web que o cartão “Como funciona” e o rótulo “OPÇÃO 1” não aparecem mais. A tela mantém os controles de GPS e CEP.

**Documento acadêmico:** não atualizar nesta subetapa isolada; trata-se de ajuste de apresentação da tela, sem mudança na lógica funcional ou nos requisitos. Reavaliar ao concluir a Atividade 4.3, consolidando a evolução visual das telas na seção `5.1.1.8`, se relevante.

### Situação consolidada da atividade 4.3

As quatro telas existentes foram implementadas e tiveram sua composição conferida no Expo Web:
- 4.3.1 — Home: validada visualmente; lint e testes aprovados; correção posterior de TypeScript também aprovada.
- 4.3.2 — Definir localização: remoção dos elementos não previstos no frame aprovada visualmente, preservando GPS e CEP.
- 4.3.3 — Centros: validada visualmente, incluindo filtros e estado vazio; a captura posterior confirmou o cabeçalho sem quebra.
- 4.3.4 — Detalhes do centro: validada visualmente com o centro temporário de ID 9; TypeScript, lint e testes aprovados após as alterações das telas.

**Limpeza do dado temporário:** concluída e confirmada pelo usuário em 01/11/2026. O centro de ID 9 e o responsável temporário associado foram removidos fisicamente do banco local. A rotina verificou a ausência de solicitações vinculadas antes da exclusão.

**Atividade 4.3:** concluída. Documento acadêmico: avaliar a seção 5.1.1.8 e incorporar o resultado consolidado da aplicação do design system às quatro telas, caso ainda não esteja contemplado.
#### Subetapa 4.3.3 — Centros: concluída e validada

Referência Figma: frame `03 — Fluxos e protótipo mobile / 03 · Centros próximos`, node `2046:94`.

A tela foi recomposta com cabeçalho, cartão de localização, busca, filtros e cartões `CenterCard`. Foram preservados API, busca por nome/bairro/material, filtros, ordenação por distância em linha reta, navegação e estados de carregamento, erro e lista vazia. Não foram incluídos centros ou distâncias fictícios.

Arquivo: `mobile/src/app/(tabs)/centers.tsx`.

Commits: `509dfca`, `a25c428`, `47c4ebe` e `d758dd7` (ajuste do cabeçalho de resultados).

**Validação visual:** o usuário confirmou no Expo Web a tela com localização, busca, filtros e estado vazio. O ajuste posterior retirou a legenda de distância do cabeçalho, evitando quebra da contagem; a explicação sobre distância em linha reta permanece no rodapé.

**Validação automatizada:** TypeScript, lint e testes foram aprovados pelo usuário após as alterações das telas 4.3. O total exato de testes nessa execução não foi informado.

**Documento acadêmico:** não houve atualização específica para esta tela; a entrega visual foi consolidada na subseção 5.1.1.9.

#### Subetapa 4.3.4 — Detalhes do centro: concluída e validada

Referência visual: frame Figma 03 — Fluxos e protótipo mobile / 04 · Detalhes do centro, node 2046:96.

Implementado na branch main:
- Cabeçalho com título e subtítulo conforme a referência.
- Hero verde dinâmico com nome do centro e município/UF.
- Badges de situação do centro e dos serviços cadastrados.
- Materiais aceitos em chips semânticos.
- Cartão de horários com os períodos cadastrados agrupados por dia.
- Cartão de endereço com logradouro, complemento, bairro, cidade/UF e CEP.
- Telefone público e ação Ligar para o centro, usando o deep link tel: existente. A ação Solicitar coleta não foi criada porque o fluxo correspondente ainda não está implementado.
- Estados de carregamento, erro, nova tentativa e identificação inválida preservados.

Arquivo: mobile/src/app/center/[id].tsx.

Commits: 88efc85c2c82d1c70b8a0c22657c0beab7e85407 (implementação) e 58ffcee2b4e921c039ac997c17c075d6ea344c71 (remoção do import não utilizado identificado pelo lint).

**Validação automatizada informada pelo usuário:**
- npx tsc --noEmit: passou sem erros.
- npx expo lint: passou sem avisos ou erros.
- npm test -- --runInBand: passou. O total exato de testes nessa última execução não foi informado.

**Validação visual informada pelo usuário:** captura do Expo Web confirmou a renderização dos dados retornados pela API para o centro temporário de ID 9: nome e localização, status ativo, entrega no local, coleta disponível, cinco materiais, horários de segunda a sexta, endereço, CEP e telefone público. O layout foi conferido sem problemas visuais impeditivos.

**Limpeza do dado temporário:** concluída em 01/11/2026. O centro de ID 9 e o responsável temporário associado foram removidos fisicamente do banco local. A rotina confirmou que não havia solicitações vinculadas antes da exclusão.

**Documento acadêmico:** avaliar a seção 5.1.1.8 para incorporar o resultado consolidado da aplicação do design system às quatro telas e a validação visual no Expo Web, caso ainda não esteja contemplado. Não é necessário registrar cada ajuste isolado ou commit.

Commits de implementação da Fase 4:
- `75a926696f1d4091440d64632c5ec582894ff5d4` — adicionar pacote Inter.
- `a0d4e185f26965039c9ca954f8af9dbe5e01e80f` — atualizar lockfile da fonte.
- `3dc7c20ab9d05fd814933f8248c6664c013fcb85` — implementar tokens.
- `e6c088cf1ede7879325d52437d07e04d60163403` — carregar Inter.
- `4b656f7fa27e0c07e1c24c859e3ac9acde95b545` — ajustar fonte display web.
- `a8fe5b2169a637016cd970fbad7b44e48c5bfdb9` — alinhar fundos do app.
- `295ecb15d77e3aa198b8bad3d49960a2513bc058` — registrar conclusão da implementação 4.1.
- `1f126a947a4dc0d774744b86b5b8f981c4b34eee` — criar ícones vetoriais e marca oficial.
- `f9a60512a7ef4bdadb13deae598c2c2f6adf9b0c` — alinhar componentes compartilhados.
- `860f45bfea53e17579204af2836e7e7b9b7b57da` — ajustar navegação inferior.
- `4517883159467533b363e8e2094fdeab79a16c98` — incluir suporte SVG.
- `2d029b813f3e42a0cf9c15c617dd17fa2321c63a` — adicionar testes dos componentes.
- `fa70f25c08afddb9367213aa97199dce36b0c9ba` — corrigir importação de tipo ReactNode.
- `6c1f0f9ab9529f6b5bbe016f261628ee63d9d458` — preservar o feedback padrão das telas antigas e permitir variantes semânticas no cartão de centro.
- `1f94576f3554cc28c6320148f64d889ddb7fde51` — aceitar o tipo ColorValue do React Native nos ícones SVG.
- `309ab261f1d173f30cb96668e727a6e54b73a96f` — aguardar a renderização assíncrona nos testes dos componentes.
- `d11d9d189b4a58de0850b945378df0680d89b660` — atualizar continuidade após correção dos testes.
- `6fd194d6a344baff62b4428e5155f7959ec92700` — atualizar evidências da atividade 4.2.
- `88efc85c2c82d1c70b8a0c22657c0beab7e85407` — remover propriedade de acessibilidade booleana não suportada dos SVGs no Web.

**Último commit de implementação verificado:** `88efc85c2c82d1c70b8a0c22657c0beab7e85407`.

## Atividade 4.4 — Consolidar a implementação visual: concluída

**Auditoria (4.4.1):** foram revisados tokens, componentes, telas, ícones, marca e navegação. Os frames Figma `2046:90`, `2046:94` e `2046:96` confirmam a aplicação das cores, tipografia, raios e espaçamentos utilizados nas telas.

**Classificação (4.4.2):** `Typography` passou a ser a fonte única dos estilos tipográficos; os aliases públicos `small`, `subtitle`, `title` e `eyebrow` foram mantidos por compatibilidade. Os aliases antigos de `Spacing` e as exportações de tema sem uso foram removidos. A composição Light foi definida como ativa; a paleta Dark permanece reservada, sem alternância parcial entre telas e navegação.

**Consolidação (4.4.3):** `TextField` compartilhado também é utilizado no CEP; o campo adota `Typography.body`. Ícones e marca consomem `Iconography`; dimensões da navegação, largura do conteúdo e espaçamentos repetidos utilizam tokens canônicos. `app.json`, o shell Expo e as abas foram alinhados ao tema Light.

**Limpeza (4.4.4):** removido `mobile/src/global.css` após confirmar que não era importado. Componentes e estilos do template Expo sem referências também foram removidos nos commits anteriores. Medidas locais que representam geometria específica dos componentes foram preservadas; não foram arredondadas para tokens sem correspondência no Figma.

**Teste adicional:** `mobile/src/components/recicla-ui.test.tsx` ganhou teste para confirmar que o `TextField` utiliza a tipografia Body centralizada.

**Regressão automatizada (4.4.5):** usuário confirmou localmente `npx tsc --noEmit` e `npx expo lint` sem erros ou avisos; `npm test -- --runInBand` passou com 6 suítes e 30 testes. **Inspeção visual pós-consolidação:** capturas do Expo Web confirmam Início, Centros e Definir localização. Detalhes do centro havia sido validada visualmente na atividade 4.3; como não há centro cadastrado atualmente, não foi repetida após a 4.4. Por decisão do usuário, a atividade foi considerada concluída sem novo cadastro temporário.

**Documento acadêmico:** não atualizar; os ajustes consolidam a implementação já descrita em 5.1.1.9 e não alteram requisitos nem comportamento funcional.

## Atividade 5 — Responsividade e usabilidade: em andamento

**5.1 — Auditoria inicial responsiva e visual**

Levantamento estático do código:
- `AppScreen` ocupa 100% da largura disponível e limita o conteúdo a 560 px, centralizando-o em telas largas.
- As telas utilizam rolagem vertical; Home e Centros usam listas horizontais roláveis para materiais e filtros; chips de materiais e badges em Detalhes podem quebrar linha.
- As principais áreas de conteúdo usam margens e larguras fluidas. Não foram identificados breakpoints por largura nos arquivos revisados.
- Pontos a verificar em 320 px: hero da Home (título com `maxWidth` de 225 px e marca posicionada absolutamente), linhas de horário em Detalhes e cabeçalhos/subtítulos limitados a uma linha nos componentes compartilhados.
- Os botões principais têm altura mínima de 48 px; ícones interativos variam entre 44 e 56 px; chips de filtro têm altura mínima de 36 px e cabeçalho voltar de 40 px. Revisar estes últimos alvos na etapa de usabilidade.

**Contraste calculado dos pares principais da paleta Light:** texto principal/canvas 11,67:1; texto secundário/canvas 5,07:1; texto branco/primário 6,47:1; azul/info 5,05:1; sucesso/verde claro 5,76:1; aviso/amarelo claro 4,71:1; erro/rosa claro 4,54:1. São cálculos da paleta definida, não substituem a inspeção de todos os estados e combinações efetivamente renderizados.

- **Home em 320 × 740 px:** captura pós-ajuste aprovada visualmente. A marca decorativa de 56 px (ícone 36 px) não se sobrepõe ao título; não há rolagem horizontal involuntária. Chips mantêm rolagem horizontal própria e o conteúdo permanece rolável verticalmente. Commit do ajuste: `1001c66`.

**Diagnóstico da primeira execução Playwright (01/11/2026):** o `error-context.md` e o trace confirmaram que o teste abriu `http://127.0.0.1:8081/centers`, mas a regra ampla `**/centers**` interceptou também essa navegação (tipo `document`) e devolveu o JSON da fixture no lugar da página Expo. A chamada de API `GET http://127.0.0.1:3000/centers` também foi interceptada corretamente; a colisão ocorreu porque o matcher não distinguia a requisição da API da navegação do app.

**Correção publicada:** commit `9bdf75ac96fc118fca186ee450ebabcc82323fdf`, em `mobile/e2e/responsive.spec.ts`. Os mocks agora só respondem a requisições `fetch`; para centros, validam também os caminhos `/centers` e `/centers/:id`. Navegações `document` e outros caminhos seguem com `route.continue()`. A automação continua cobrindo quatro rotas em seis larguras e utilizando fixtures sem gravar dados no MySQL.

**Segunda execução Playwright — diagnóstico confirmado:** na nova execução, a navegação para `/centers` recebeu HTTP 500 do servidor Expo. O `error-context.md`, a captura e o trace mostram `Requiring unknown module "53"` em `expo-router` server renderer (`getHtml`/`render.js.bundle`). A Home `/` carregou, os mocks de `GET /centers` e `GET /materials` responderam HTTP 200, e a falha ocorreu somente quando o teste fez navegação completa (`document`) para `/centers`. A causa da falha anterior de interceptação estava corrigida; a falha atual é da renderização SSR da rota no Expo Web.

**Ajuste publicado:** `mobile/app.json` passou de `web.output: "server"` para `web.output: "single"`, commit `720bc8d4a37540ef8578c7118372d6088f3bb2a7`. O Expo Web passa a funcionar como SPA, sem gerar HTML via SSR para cada rota. Decisão adequada ao aplicativo mobile-first, que consome a API no cliente e não usa SSR/data loaders no servidor neste escopo.

**Validação automatizada local — aprovada em 01/11/2026:** após sincronizar `main`, o usuário executou `npm run test:e2e` no Zorin. Resultado: 6 testes aprovados, 0 falhas, em 23,5 s. Cada teste percorreu as quatro rotas (Início, Centros, Definir localização e Detalhes do centro) e gerou uma captura por rota, totalizando 24 verificações/capturas previstas nas larguras 320, 360, 390, 430, 768 e 1280 px.

A suíte validou a presença dos textos esperados, ausência de overflow horizontal no documento e ausência de erros JavaScript de página. A API foi simulada por fixtures; nenhum dado foi inserido no MySQL. Playwright iniciou Expo Web automaticamente.

**Inspeção visual das 24 capturas (01/11/2026):** Home em 320 px com marca e título do hero sem sobreposição; filtros/chips horizontais aparentam roláveis; cartão de centro continua abaixo da dobra. Centros com conteúdo legível e filtros em faixa horizontal. Detalhes: os cinco horários são legíveis em 320 px e os chips quebram linha sem colisão. Em 768/1280 px, o conteúdo respeita o limite de 560 px e permanece centralizado.

**Correção do cabeçalho confirmada visualmente:** após o commit `5b3cba452599838ac4cf77d38c893ad9dd56a6c8`, o usuário executou novamente a suíte e enviou as 24 capturas. A tela Definir localização em 320 px exibe o subtítulo completo em duas linhas, sem reticências.

**Botão flutuante do Expo:** a captura de Home em 320 px ainda contém o botão preto com raio da ferramenta de desenvolvimento. Ele não integra o app. `EXPO_NO_DEV_MENU=1` não o removeu no Expo Web/browser; a variável controla URLs de lançamento de Expo Go e development builds conforme a documentação do CLI. Foi removida de `mobile/playwright.config.ts` no commit `1be7ee9ac20ff18e6497dd30e532bc3ff8241e7f`.

**Nova execução confirmada pelo usuário (01/11/2026):** após as correções visuais, `npm run test:e2e` aprovou 6 testes em 21,2 s, percorrendo as quatro rotas em seis dimensões. As 24 capturas foram revisadas: título/marca da Home sem sobreposição; cartão/filtros de Centros legíveis; subtítulo de Localização corrigido; cinco horários de Detalhes legíveis em 320 px; conteúdo centralizado em viewports de 768/1280 px.

**Limite das capturas:** `fullPage` não captura o conteúdo interno completo de `ScrollView`. A parte inferior da Home e de Detalhes ainda precisa ser examinada após rolagem.

**Automação de rolagem implementada:** commits `d8757734b6ecdf4935639eb3f96a5066456c445f` e `1d223f9a5979faaead21dd1d4034af7df6cdd6d0`, em `mobile/e2e/responsive.spec.ts`. Os testes de Home e Detalhes agora localizam o maior contêiner vertical rolável, rolam até o final, verificam o limite e salvam imagens `*-scroll-end.png`. Em larguras ≤360 px, falharão se o contêiner vertical esperado não for encontrado.

**Próximo passo exato:** sincronizar `main`, executar novamente `npm run test:e2e` e enviar as capturas adicionais `320x740-home-scroll-end.png`, `320x740-detalhes-scroll-end.png`, `360x740-home-scroll-end.png` e `360x740-detalhes-scroll-end.png` (ou o ZIP completo). Ainda não validar a rolagem inferior nem concluir a etapa 5 até verificar essas evidências.

**Critério de conclusão:** sem conteúdo cortado ou sobreposto nos tamanhos avaliados; controles legíveis e operáveis; navegação, formulários e rolagem funcionais; verificações automatizadas aprovadas.

## 7. Snapshot do código anterior à Fase 4 (histórico)

Os hashes e descrições desta seção registram o estado anterior à implementação da atividade 4.1. Para o estado atual, prevalecem a seção 6, os arquivos no branch `main` e seus commits mais recentes.

- `mobile/src/constants/theme.ts`: ainda contém a paleta azul antiga (`#0E4166`, `#258FD2`, etc.), tipografia genérica e uma escala de espaçamento inicial.
- `mobile/src/components/recicla-ui.tsx`: contém AppScreen, AppCard, AppText, AppButton, FilterChip, ScreenHeader e FeedbackCard; usa `Colors.light` diretamente e `fontFamily: 'System'`.
- `mobile/src/components/app-tabs.tsx`: abas Início e Centros, com cores derivadas do tema antigo.
- `mobile/src/app/(tabs)/index.tsx`: tela inicial funcional, mas ainda com marca representada pela letra R e estilo anterior.
- `mobile/src/app/(tabs)/centers.tsx`: consulta funcional, ainda com estilo anterior.
- `mobile/src/app/location.tsx`: GPS/CEP funcionais, layout anterior.
- `mobile/src/app/center/[id].tsx`: detalhes do centro já consultam a API; layout anterior e marcador textual com inicial do centro.
- `mobile/package.json`: Expo SDK 58; Jest/jest-expo e React Native Testing Library instalados.

Não presumir que as 16 telas do Figma já estejam implementadas no Expo. A Fase 4 deste plano trata primeiro do design system e da atualização dos quatro percursos/telas existentes. As demais funcionalidades e jornadas devem seguir os cards e dependências próprios do backlog.

## 8. Regra de documentação ao concluir cada atividade

Ao concluir cada atividade ou etapa do projeto, fazer uma avaliação explícita e independente de duas frentes: **documento acadêmico** e **Git/repositório**. Não presumir que toda alteração técnica precisa aparecer no relatório acadêmico, nem deixar de registrar no repositório uma entrega técnica concluída.

### Documento acadêmico

**Concisão editorial:** redigir o documento acadêmico de forma objetiva e enxuta. Evitar parágrafos longos, redundâncias, repetição entre seções e detalhes de commits ou ajustes internos sem relevância acadêmica. Incluir somente decisões, implementação, validações e resultados necessários à compreensão do trabalho.
- Ao propor qualquer novo conteúdo, indicar antes a seção e o ponto exato de inserção (por exemplo, após qual parágrafo ou figura), verificando a sequência lógica e evitando duplicações. Distinguir concepção/prototipação de implementação/validação e posicionar o texto onde ele completa o assunto, não apenas onde há espaço. Se o documento principal não estiver disponível, informar isso e fornecer a orientação precisa de movimentação.

- **Atualizar quando houver impacto acadêmico:** mudança relevante em objetivos ou escopo, requisitos/regras de negócio, metodologia, decisões de arquitetura ou design, implementação que componha resultado do projeto, testes/validações, resultados, limitações, evidências ou conclusões que devam ser apresentados no trabalho.
- **Não atualizar quando não houver contribuição acadêmica relevante:** correções internas, refatorações, ajustes de código, correções de lint/tipagem ou manutenção que não alterem o que foi projetado, desenvolvido, avaliado ou concluído e que não acrescentem resultado ou evidência relevante.
- Quando a atualização for necessária, indicar a seção do trabalho a revisar e o conteúdo/evidência que deve ser incorporado. Preservar a estrutura e o texto já aprovados; não criar conteúdo acadêmico apenas para narrar cada commit.
- Quando o documento acadêmico principal estiver apenas no ambiente local do usuário e não estiver disponível no repositório, fornecer orientação ou texto pronto para integração, sem afirmar que foi atualizado.

### Git e documentação técnica do repositório

- Ao concluir uma atividade com alteração no projeto, versionar no Git os arquivos de implementação e os artefatos pertinentes, usando commits objetivos e preservando alterações locais do usuário.
- Atualizar a documentação técnica correspondente, as evidências da sprint/atividade e este arquivo de continuidade quando houver mudança de status, decisão, validação, pendência ou próximo passo.
- Registrar resultados de validação somente quando forem efetivamente executados e confirmados; distinguir claramente implementado, testado, validado visualmente e documentado.
- Se uma atividade não produzir alteração no código nem em artefatos/documentação do repositório, registrar que não houve atualização de Git e justificar brevemente.

### Fechamento obrigatório de cada atividade

No encerramento, incluir sempre um pequeno balanço com:
1. **Documento acadêmico:** atualizar ou não; indicar seção/conteúdo e motivo.
2. **Git/repositório:** arquivos/artefatos e commits atualizados, ou informar que não houve necessidade.
3. **Status:** implementado, validado e documentado, deixando pendências explícitas.

Essa avaliação faz parte da conclusão da atividade; não deve ser adiada para o final da sprint ou do projeto.

## 9. Regras de trabalho para novos chats

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
- Mapa mestre do backlog: `docs/planejamento/backlog-mestre.md`
- Último commit de implementação verificado: https://github.com/marco-bem/recicla-palhoca/commit/720bc8d4a37540ef8578c7118372d6088f3bb2a7
- Correção do interceptador Playwright: https://github.com/marco-bem/recicla-palhoca/commit/9bdf75ac96fc118fca186ee450ebabcc82323fdf
