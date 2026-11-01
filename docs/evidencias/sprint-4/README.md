# Evidências da Sprint 4

## Atividade 4.1 — Design tokens e tipografia

Implementação da identidade visual aprovada no Figma:
- Tokens semânticos Light/Dark para cores de superfície, texto, marca, estados, bordas e categorias de materiais.
- Tipografia Inter com nove estilos e pesos Regular, Medium, SemiBold e Bold.
- Escalas de espaçamento, raios, bordas, iconografia e elevação.
- Inter carregada no layout raiz; splash screen e ícone adaptativo com fundo `#F7FAF7`.

### Validação local — 01/11/2026

Resultados informados pelo usuário:
- `npm ls --depth=0`: dependências instaladas sem pacotes inválidos ou ausentes.
- `npx tsc --noEmit`: encerrou sem saída/erros.
- `npx expo lint`: encerrou sem saída/erros.
- `npm test -- --runInBand`: 5 suítes aprovadas, 20 testes aprovados.
- Expo Web: telas Início e Centros carregaram com tipografia e paleta esperadas.

Durante a conferência visual, foi identificado que a navegação inferior ainda apresentava ícones e textos cortados. A correção foi incluída na atividade 4.2.

## Atividade 4.2 — Componentes compartilhados e navegação

Implementação publicada na branch `main`:
- `src/components/app-icons.tsx`: ícones vetoriais oficiais e componente `BrandMark` para a marca pin + reciclagem do Figma.
- `src/components/recicla-ui.tsx`: atualização de AppScreen, AppCard, AppText, AppButton, FilterChip, ScreenHeader e FeedbackCard; inclusão de AppIconButton, TextField, MaterialChip, StatusBadge, LocationSummary e CenterCard. O FeedbackCard mantém o padrão anterior quando não recebe estado explícito; os estados visuais são aplicados quando informados.
- `src/components/app-tabs.tsx`: navegação inferior com ícones Home/MapPin explícitos, altura de 76 px, tipografia e cores do Figma. Permanecem somente as abas Início e Centros.
- `src/components/recicla-ui.test.tsx`: seis testes para tipografia, botões, filtro, campo de texto e badge.
- O cartão de centro permite informar status sem assumir que todo status é de sucesso; o destaque editorial continua opcional.
- `mobile/package.json`: inclusão de `react-native-svg` para renderizar os vetores oficiais em Web e nas plataformas nativas.

A marca oficial já está disponível como componente, mas ainda não substitui a letra R na tela inicial. Essa aplicação, assim como o uso dos novos componentes nas telas Início, Centros, Definir localização e Detalhes do centro, pertence à atividade 4.3. O arquivo Figma não foi alterado.

### Ajuste após primeira execução dos testes

Na primeira execução local, os seis testes novos falharam porque `render()` foi chamado sem `await`; as cinco suítes anteriores (20 testes) passaram. A implementação dos testes foi corrigida para aguardar a renderização assíncrona, conforme o padrão de `mobile/__tests__/environment.test.tsx`. A correção foi publicada no commit `309ab261f1d173f30cb96668e727a6e54b73a96f`.

### Validação local — 01/11/2026

Resultados informados pelo usuário:
- `npx expo install react-native-svg`: dependência instalada para o Expo SDK 58.
- `npx tsc --noEmit`: encerrou sem saída/erros.
- `npx expo lint`: passou.
- `npm test -- --runInBand`: 6 suítes aprovadas, 26 testes aprovados (incluindo os seis testes dos componentes compartilhados).
- `npx expo start --web`: tela Início carregou corretamente. A barra inferior apresentou os ícones vetoriais de Início e Centros, sem corte aparente.

Na primeira abertura no Expo Web, surgiu aviso/erro associado à passagem de `false` para uma propriedade booleana. A revisão identificou `accessible={false}` nos componentes SVG `AppIcon` e `BrandMark`; as duas propriedades foram removidas no commit `c191fb2ff7c1c43a2274e72b64b1a8df699fae47`. Após sincronizar a correção e reiniciar o Expo Web, o usuário confirmou que o aviso desapareceu e a tela carregou normalmente.

**Status: Atividade 4.2 validada.**

Observação: o cabeçalho da Home ainda exibe a letra R antiga. A substituição pelo componente `BrandMark` e a aplicação dos novos componentes às telas Início, Centros, Definir localização e Detalhes do centro pertencem à atividade 4.3.

## Atividade 4.3 — aplicação do design system às telas existentes

### Subetapa 4.3.1 — Home: implementação publicada e validada

Referência Figma: frame `01 · Início`, node `2046:90`.

A Home foi recomposta com a marca oficial, hero verde, cartão de localização compacto, busca com ícone, chips de materiais com marcadores de categoria, cartão compacto de centro e estados dinâmicos preservados. A busca por texto agora distingue uma correspondência com material (envia o slug como filtro) de uma consulta por centro/bairro (envia `q`). A consulta da API e a navegação para localização/detalhes continuam preservadas.

Arquivos alterados:
- `mobile/src/app/(tabs)/index.tsx`
- `mobile/src/components/app-icons.tsx`
- `mobile/src/components/recicla-ui.tsx`
- `mobile/src/components/recicla-ui.test.tsx`

Commits publicados: `f45bf9c`, `1f75336`, `883056b`, `22c843c`, `d9445a8`, `02a5e5d`.

**Validação local informada pelo usuário:**
- `npx expo lint`: executado sem avisos ou erros após ajuste do import não utilizado.
- `npm test -- --runInBand`: 6 suítes aprovadas, 28 testes aprovados.
- `npx tsc --noEmit`: a falha inicial de tipagem foi corrigida no commit `bddacaf`; a validação posterior de TypeScript passou sem erros.
- Expo Web: o usuário confirmou o carregamento da Home e enviou captura com a nova marca, hero, busca, chips, cartões de localização/centros e navegação inferior.

Correções adicionais publicadas: `bddacaf` (tipagem do estilo com ícone) e `4a4c855` (import não utilizado).

O atalho “Sou centro” não foi implementado nesta subetapa, pois ainda não há rota de acesso/autenticação do responsável no aplicativo. A lista continua intitulada “Centros disponíveis” porque a Home não ordena resultados pela localização; não anunciar proximidade sem esse cálculo. A aba Pedidos permanece fora da navegação até o fluxo correspondente existir.

**Documento acadêmico:** sem atualização nesta subetapa. Avaliar a necessidade após concluir e validar as quatro telas, considerando a seção `5.1.1.8` e evitando texto de progresso ou duplicação do conteúdo técnico.

### Subetapa 4.3.2 — Definir localização: remoção dos elementos fora do frame aprovado

Referência visual Figma: frame `02 · Definir localização`, node `2046:92`. O frame aprovado não contém o cartão informativo após o botão “Buscar centros próximos”.

Foram removidos de `mobile/src/app/location.tsx` o cartão “Como funciona”, seu estilo e o rótulo “OPÇÃO 1” do cartão de localização. O fluxo funcional de GPS, CEP, validação, mensagens de erro, carregamento e navegação para Centros foi preservado.

Commits publicados: `ab9efc0` (remover “Como funciona”) e `a0afaeeb` (remover “OPÇÃO 1”).

**Validação visual informada pelo usuário:** após sincronizar os dois commits, o usuário confirmou no Expo Web a remoção do cartão “Como funciona” e do rótulo “OPÇÃO 1”; os controles de GPS e CEP permanecem disponíveis.

**Documento acadêmico:** não atualizar esta correção isolada; reavaliar a contribuição acadêmica após concluir e validar o conjunto das telas da Atividade 4.3.

### Subetapa 4.3.3 — Centros: implementação publicada e validada

Referência Figma: frame `03 · Centros próximos`, node `2046:94`.

A tela foi recomposta com cabeçalho, cartão de localização, busca com ícone, filtros horizontais e cartões de resultado usando o componente compartilhado `CenterCard`. Foram preservadas a API, a ordenação por distância em linha reta, os filtros de coleta e materiais, os estados de carregamento/erro/vazio e a navegação para detalhes. A busca por material é mapeada para o slug do catálogo quando há correspondência; a busca livre continua usando `q`.

Os centros demonstrativos, distâncias fictícias e badges “Exemplo” do frame não foram reproduzidos; a aplicação exibe apenas os dados recebidos da API.

Arquivo alterado: `mobile/src/app/(tabs)/centers.tsx`.

Commits publicados: `509dfca`, `a25c428`, `47c4ebe`.

**Validação visual informada pelo usuário:** captura do Expo Web confirma o cartão de localização, busca, filtros, estado vazio com botão “Limpar filtros”, texto de distância em linha reta e aba Centros ativa. A API retornou zero centros para a consulta.

**Validação automatizada:** TypeScript, lint e testes foram aprovados pelo usuário após as alterações das telas 4.3. O total exato de testes nessa execução não foi informado.

**Ajuste de apresentação publicado:** removido o texto “Distância em linha reta” ao lado da contagem. A distância continua sendo exibida nos cartões individuais dos centros quando os dados permitem calculá-la. Commit: `d758dd7`.

**Validação visual informada pelo usuário:** captura atualizada confirma a remoção do texto “Distância em linha reta” do cabeçalho; “0 centros encontrados” aparece em uma única linha. O aviso explicativo do rodapé foi preservado.

### Subetapa 4.3.4 — Detalhes do centro: concluída e validada

Referência Figma: frame 04 · Detalhes do centro, node 2046:96.

A tela foi recomposta com hero verde dinâmico, badges de situação/serviço, materiais aceitos em chips semânticos, horários agrupados por dia, cartão de endereço e telefone público. A ação principal Ligar para o centro usa o deep link tel: existente. O CTA Solicitar coleta do protótipo não foi implementado porque o fluxo de solicitação ainda não existe no aplicativo.

Estados de carregamento, erro, nova tentativa e ID inválido foram preservados. Não foram incluídos dados demonstrativos permanentes.

Arquivo alterado: mobile/src/app/center/[id].tsx.

Commits: 88efc85 (implementação) e 58ffcee (correção do import não utilizado apontado pelo lint).

**Validação automatizada informada pelo usuário:**
- npx tsc --noEmit: passou.
- npx expo lint: passou sem avisos ou erros.
- npm test -- --runInBand: passou.

**Validação visual informada pelo usuário:** captura do Expo Web confirmou os dados da API no detalhe do centro temporário de ID 9: identificação, status e serviços, materiais, horários de segunda a sexta, endereço, CEP e telefone. A composição foi conferida sem problemas visuais impeditivos.

**Limpeza do dado temporário:** concluída e confirmada pelo usuário em 01/11/2026. O centro de ID 9 e o responsável temporário associado foram removidos fisicamente do banco local após a verificação de que não havia solicitações vinculadas.

**Documento acadêmico:** avaliar uma atualização consolidada da seção 5.1.1.8, descrevendo a aplicação do design system às quatro telas e a validação visual no Expo Web, caso esse resultado ainda não esteja contemplado no texto atual. Não registrar os ajustes isolados como resultados separados.

## Atividade 4.4 — Consolidação da implementação visual

A auditoria comparou tokens, componentes compartilhados, ícones, navegação e as quatro telas com os frames aprovados no Figma (`2046:90`, `2046:94` e `2046:96`). A paleta Light, os estilos de tipografia, raios e espaçamentos utilizados correspondem às variáveis dos frames.

Implementações e limpezas publicadas:
- `Typography` tornou-se a fonte canônica de estilos de texto; os aliases públicos de `AppText` foram preservados. O `TextField` passou a usar o estilo Body centralizado e também substituiu o campo isolado de CEP.
- Espaçamentos repetidos, iconografia e altura da navegação passaram a consumir tokens; as medidas geométricas específicas foram mantidas quando não havia token equivalente.
- `mobile/app.json`, o shell Expo e a navegação foram alinhados ao tema Light. O conjunto Dark permanece reservado, sem alternância parcial.
- Removido `mobile/src/global.css`, sem importações no projeto. Componentes e estilos do template Expo sem referências também foram eliminados.
- Incluído teste para a tipografia Body do campo de texto.

**Regressão automatizada validada localmente pelo usuário:** `npx tsc --noEmit` e `npx expo lint` executados sem erros ou avisos; `npm test -- --runInBand` aprovado com 6 suítes e 30 testes.

**Validação visual pós-consolidação:** capturas do Expo Web confirmam Início, Centros e Definir localização, incluindo navegação, busca, filtros, estado vazio e os controles de GPS/CEP. Resta conferir a tela Detalhes do centro após a consolidação.

**Documento acadêmico:** sem atualização. A atividade consolida os estilos da implementação já descrita em 5.1.1.9, sem alterar requisitos ou comportamento funcional.

## Atividade 5 — Responsividade e usabilidade

Auditoria estática inicial:
- `AppScreen` ocupa a largura disponível e limita o conteúdo a 560 px, centralizando-o em telas largas.
- As quatro telas usam rolagem vertical; Home e Centros apresentam chips/filtros em rolagem horizontal; os grupos de chips em Detalhes podem quebrar linha.
- Não foram identificados breakpoints por largura nos arquivos revisados.
- Pontos de atenção para a menor largura: título e marca sobreposta no hero da Home, linhas de horário em Detalhes e textos de cabeçalho limitados a uma linha.
- Botões principais: 48 px ou mais; ícones interativos: 44–56 px; chips: 36 px; botão de voltar: 40 px. Revisar a área efetiva de toque de chips e voltar.

Contraste calculado para pares principais da paleta Light: texto principal/canvas 11,67:1; texto secundário/canvas 5,07:1; texto branco/primário 6,47:1; azul/info 5,05:1; sucesso/verde claro 5,76:1; aviso/amarelo claro 4,71:1; erro/rosa claro 4,54:1. Valores calculados sobre os tokens, ainda sujeitos à conferência das combinações renderizadas.

**Automação Playwright — diagnóstico da primeira execução (01/11/2026):** o trace confirmou que a regra ampla `**/centers**` interceptava a chamada `GET http://127.0.0.1:3000/centers` e também a navegação do navegador para `http://127.0.0.1:8081/centers`. A navegação recebia o JSON da fixture como documento.

**Correção dos mocks:** commit `9bdf75a` em `mobile/e2e/responsive.spec.ts`. Os mocks passaram a responder somente a requisições `fetch` e a validar os caminhos `/centers` e `/centers/:id`.

**Diagnóstico da segunda execução:** o trace mostrou que a Home `/` carregou, as fixtures de `/centers` e `/materials` responderam HTTP 200 e a navegação completa para `/centers` recebeu HTTP 500. O HTML de erro identificou `Requiring unknown module "53"` na renderização do `expo-router` server renderer (`getHtml`/`render.js.bundle`). Portanto, a falha seguinte não era mais a interceptação: era a renderização SSR da rota pelo Expo Web.

**Ajuste de configuração:** `mobile/app.json` mudou `web.output` de `server` para `single` no commit `720bc8d`. O aplicativo Web passa a usar saída SPA, com as rotas renderizadas no cliente; o projeto não usa atualmente SSR nem data loaders no servidor. A intenção é evitar a renderização request-time que falhou e manter os testes de navegação/visualização no navegador.

A suíte cobre quatro rotas em seis larguras (24 capturas), com fixtures para materiais e centros, sem inserir dados no MySQL. O Playwright inicia ou reutiliza Expo Web em `127.0.0.1:8081`; saídas em `mobile/test-results/responsive/` e relatório HTML. Dependência `@playwright/test` 1.64.1.

**Validação automatizada local — aprovada em 01/11/2026:** após sincronizar o commit `720bc8d`, o usuário executou `npm run test:e2e` no ambiente Zorin. Resultado: **6 testes aprovados, 0 falhas, em 23,5 s**. Cada teste percorreu as quatro rotas (Início, Centros, Definir localização e Detalhes do centro) na respectiva dimensão, totalizando **24 verificações de rota e 24 capturas previstas** para 320 × 740, 360 × 740, 390 × 844, 430 × 900, 768 × 1024 e 1280 × 900 px.

Para cada rota, a suíte confirmou a presença do texto esperado e ausência de overflow horizontal no documento; a execução também não registrou erros JavaScript de página. Os endpoints `/materials` e `/centers` foram simulados por fixtures, sem gravação no MySQL. O Playwright iniciou o Expo Web automaticamente.

**Inspeção visual das 24 capturas atualizadas (01/11/2026):** comparadas as quatro telas nas seis dimensões. A Home em 320 px mantém o título e a marca do hero sem sobreposição; a faixa de materiais permanece horizontalmente rolável. Em Centros, cartões e filtros permanecem legíveis, com rolagem horizontal dos filtros. Em Definir localização, a correção de `ScreenHeader` foi confirmada: o subtítulo agora ocupa duas linhas em 320 px, sem reticências. Em Detalhes, os chips quebram em linhas e os cinco horários de segunda a sexta ficam legíveis em 320 px, sem colisão entre dia e horário. Em 768 e 1280 px, o conteúdo permanece centralizado e limitado a 560 px.

**Artefato de desenvolvimento:** a Home em 320 px ainda apresenta um botão flutuante preto com raio sobre a navegação. Ele pertence às ferramentas de desenvolvimento do Expo, não ao aplicativo. `EXPO_NO_DEV_MENU=1` não o removeu da execução Expo Web no navegador; a documentação Expo descreve essa variável como controle das URLs de lançamento do Expo Go e development builds, não como remoção garantida de controles injetados no navegador. A variável foi retirada da configuração Playwright no commit `1be7ee9`. Referência: <https://docs.expo.dev/more/expo-cli/>.

**Limite das capturas atuais:** o screenshot `fullPage` registra o viewport, mas não expõe o conteúdo interno completo das `ScrollView` do React Native Web. A parte inferior da Home e de Detalhes ainda precisa ser verificada após rolagem.

**Automação ampliada para a rolagem vertical:** commits `d875773` e `1d223f9` em `mobile/e2e/responsive.spec.ts`. Para Home e Detalhes, o teste identifica o contêiner vertical rolável, leva a rolagem até o fim, verifica que o limite foi alcançado e salva capturas adicionais com sufixo `-scroll-end.png`. Nas larguras de 320 e 360 px, a ausência do contêiner esperado também causa falha, em vez de deixar a verificação passar silenciosamente.

**Validação local pendente:** o usuário confirmou nova execução da suíte antes da ampliação da rolagem: 6 testes aprovados em 21,2 s, incluindo a correção do subtítulo. Ainda é necessário sincronizar os commits `d875773`, `1d223f9` e `1be7ee9`, reexecutar `npm run test:e2e` e inspecionar as novas capturas de rolagem. A etapa 5 permanece em andamento.

- Ajuste responsivo implementado na Home: em larguras até 360 px, a marca decorativa do hero reduz de 72 para 56 px (BrandMark de 44 para 36 px), reservando maior distância do título. Em larguras maiores, o layout permanece inalterado. Commit `1001c66`.
- **Validação visual em 320 × 740 px:** captura pós-ajuste aprovada. Título e marca sem sobreposição; chips com rolagem horizontal própria; conteúdo da página com rolagem vertical e sem overflow horizontal involuntário.

## Referências

- Figma: [ReciclaPalhoça — Design](https://www.figma.com/design/86gOPT9bakn1ty0RDm1Ho0/ReciclaPalho%C3%A7a)
- Componentes: `mobile/src/components/recicla-ui.tsx`
- Ícones e marca: `mobile/src/components/app-icons.tsx`
- Tokens: `mobile/src/constants/theme.ts`
- Continuidade: `docs/CONTINUIDADE.md`
