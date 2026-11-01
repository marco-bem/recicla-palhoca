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

<badge>Atividade 4.2 validada</badge>

Observação: o cabeçalho da Home ainda exibe a letra R antiga. A substituição pelo componente `BrandMark` e a aplicação dos novos componentes às telas Início, Centros, Definir localização e Detalhes do centro pertencem à atividade 4.3.

## Próxima atividade — 4.3: aplicar os componentes às telas

Atualizar as quatro telas já existentes preservando a integração com API, GPS/CEP, filtros, estados vazios e navegação. Substituir a letra R pela marca oficial e aproximar os layouts dos frames aprovados no Figma.

## Referências

- Figma: [ReciclaPalhoça — Design](https://www.figma.com/design/86gOPT9bakn1ty0RDm1Ho0/ReciclaPalho%C3%A7a)
- Componentes: `mobile/src/components/recicla-ui.tsx`
- Ícones e marca: `mobile/src/components/app-icons.tsx`
- Tokens: `mobile/src/constants/theme.ts`
- Continuidade: `docs/CONTINUIDADE.md`
