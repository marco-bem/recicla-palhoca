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

### Subetapa 4.3.1 — Home: implementação publicada; validação visual confirmada

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
- `npx tsc --noEmit`: falha inicial corrigida no commit `bddacaf`; resultado da reexecução ainda não recebido.
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

### Subetapa 4.3.3 — Centros: implementação publicada; validação local pendente

Referência Figma: frame `03 · Centros próximos`, node `2046:94`.

A tela foi recomposta com cabeçalho, cartão de localização, busca com ícone, filtros horizontais e cartões de resultado usando o componente compartilhado `CenterCard`. Foram preservadas a API, a ordenação por distância em linha reta, os filtros de coleta e materiais, os estados de carregamento/erro/vazio e a navegação para detalhes. A busca por material é mapeada para o slug do catálogo quando há correspondência; a busca livre continua usando `q`.

Os centros demonstrativos, distâncias fictícias e badges “Exemplo” do frame não foram reproduzidos; a aplicação exibe apenas os dados recebidos da API.

Arquivo alterado: `mobile/src/app/(tabs)/centers.tsx`.

Commits publicados: `509dfca`, `a25c428`, `47c4ebe`.

**Validação visual informada pelo usuário:** captura do Expo Web confirma o cartão de localização, busca, filtros, estado vazio com botão “Limpar filtros”, texto de distância em linha reta e aba Centros ativa. A API retornou zero centros para a consulta.

**Validação automatizada:** ainda não foram informados os resultados de TypeScript, lint e testes após a alteração da tela.

**Ajuste de apresentação publicado:** removido o texto “Distância em linha reta” ao lado da contagem. A distância continua sendo exibida nos cartões individuais dos centros quando os dados permitem calculá-la. Commit: `d758dd7`.

**Validação do ajuste:** aguarda sincronização local e captura atualizada no Expo Web.

**Documento acadêmico:** não atualizar nesta subetapa antes da validação; reavaliar ao concluir as quatro telas, considerando a seção `5.1.1.8`.

## Escopo restante da atividade 4.3

A tela Centros foi implementada e aguarda validação local. Falta atualizar a tela Detalhes do centro, preservando dados, contato, materiais, horários, serviços e navegação.



Atualizar as quatro telas já existentes preservando a integração com API, GPS/CEP, filtros, estados vazios e navegação. Substituir a letra R pela marca oficial e aproximar os layouts dos frames aprovados no Figma.

## Referências

- Figma: [ReciclaPalhoça — Design](https://www.figma.com/design/86gOPT9bakn1ty0RDm1Ho0/ReciclaPalho%C3%A7a)
- Componentes: `mobile/src/components/recicla-ui.tsx`
- Ícones e marca: `mobile/src/components/app-icons.tsx`
- Tokens: `mobile/src/constants/theme.ts`
- Continuidade: `docs/CONTINUIDADE.md`
