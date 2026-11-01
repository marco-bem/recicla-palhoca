# Continuidade do projeto ReciclaPalhoça

**Atualizado em:** 01/11/2026  
**Repositório:** https://github.com/marco-bem/recicla-palhoca  
**Branch:** `main`  
**Último commit de implementação verificado antes deste registro:** `fa70f25c08afddb9367213aa97199dce36b0c9ba`

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
- Validação local mais recente informada em 01/11/2026: `npx tsc --noEmit` e `npx expo lint` encerraram sem saída/erros; `npm test -- --runInBand` aprovou 20 testes em cinco suítes. As telas Início e Centros foram abertas no Expo Web; a inspeção apontou ajuste pendente na barra inferior, tratado na atividade 4.2.
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

### Atividade 4.2 — Implementar os componentes: implementada no GitHub; validação local pendente

Implementado na branch `main`:
- `mobile/src/components/app-icons.tsx`: ícones vetoriais oficiais Home, MapPin, ClipboardList, ChevronLeft/ChevronRight, Recycle, Search, CheckCircle, AlertCircle, Info, Clock, X e Plus; inclui `BrandMark`, o pin com símbolo de reciclagem aprovado no Figma.
- `mobile/src/components/recicla-ui.tsx`: atualização dos componentes existentes e inclusão de AppIconButton, TextField, MaterialChip, StatusBadge, LocationSummary e CenterCard. AppText preserva os aliases antigos e usa tamanhos/pesos Inter do sistema visual. AppButton oferece variantes Primary/Secondary/Outline/Text e tamanhos Medium/Large. FilterChip contempla Default/Selected/Disabled. ScreenHeader usa ChevronLeft oficial. FeedbackCard preserva o uso existente e oferece layout compacto com estados Loading/Empty/Error/Success.
- `mobile/src/components/app-tabs.tsx`: navegação inferior com ícones vetoriais Home e MapPin, área de 76 px, tipografia/cores do Figma e apenas as rotas Início e Centros, que estão implementadas neste momento.
- `mobile/src/components/recicla-ui.test.tsx`: seis testes para tipografia, ação/estado desabilitado de botão, seleção de filtro, alteração de campo e badge.
- `mobile/package.json`: incluída dependência `react-native-svg`, na versão recomendada para Expo SDK 58.

**Escopo preservado para a atividade 4.3:** as telas ainda não foram remodeladas para consumir os novos componentes; a marca da tela inicial ainda precisa substituir a letra R pelo `BrandMark`. O arquivo Figma não foi modificado nesta atividade.

**Validação local pendente:** após sincronizar a branch `main), executar:
```bash
cd mobile
npx expo install react-native-svg
npx tsc --noEmit
npx expo lint
npm test -- --runInBand
npx expo start --web
```
Confirmar especialmente a resolução da dependência SVG, o carregamento dos ícones no navegador e o posicionamento/legibilidade da navegação inferior. Os seis testes novos ainda não foram executados no ambiente local; não declarar a 4.2 validada até receber o resultado.

### Próxima atividade — 4.3: aplicar o design system às telas existentes

Atualizar progressivamente as quatro rotas/telas existentes (Início, Centros, Definir localização e Detalhes do centro), preservando integrações, estados e regras funcionais:
- substituir a letra R da tela inicial pela marca oficial `BrandMark`;
- adotar os componentes compartilhados onde houver correspondência com os padrões aprovados;
- alinhar cartões, campos, chips, cabeçalhos, estados vazios/erro e espaçamentos às telas de alta fidelidade;
- conferir os fluxos no Expo Web após cada conjunto coerente de alterações.

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

**Último commit de implementação verificado:** `fa70f25c08afddb9367213aa97199dce36b0c9ba`.

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
- Último commit de implementação verificado: https://github.com/marco-bem/recicla-palhoca/commit/fa70f25c08afddb9367213aa97199dce36b0c9ba
