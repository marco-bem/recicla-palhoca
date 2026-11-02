# Aplicativo mobile — Recicla Palhoça

Aplicativo React Native com Expo SDK 58, TypeScript e Expo Router. A implementação pública do cidadão segue o fluxo e a hierarquia do protótipo de média fidelidade da Sprint 1, com consulta à API e estados reais de carregamento, erro e ausência de dados.

## Fluxos implementados

- **Início:** busca por centro ou bairro, acesso à localização de referência, catálogo de materiais e centros retornados pela API.
- **Centros:** consulta, busca textual, filtro por material e disponibilidade de coleta e ordenação por proximidade quando há coordenadas válidas.
- **Localização:** obtenção por GPS com permissão e geocodificação reversa; ou consulta manual por CEP.
- **Detalhes do centro:** consulta pública de endereço, telefone, materiais aceitos, horários e serviços, por `GET /centers/:id`.

A lista pública não usa dados fictícios. Quando não há centros cadastrados e publicáveis, a interface apresenta o estado vazio. Os fluxos de solicitação e acompanhamento de coleta, bem como a área autenticada do responsável, permanecem em tarefas próprias do backlog.

## Localização de referência

O fluxo aceita duas fontes:

1. **GPS:** `expo-location` solicita permissão e obtém as coordenadas. O serviço Photon (Komoot), baseado em dados do OpenStreetMap, tenta identificar rua, número, bairro, município, estado e CEP. A disponibilidade dos campos depende da cobertura cartográfica.
2. **CEP:** a aplicação consulta a BrasilAPI CEP v2 e utiliza o endereço retornado — logradouro, bairro, município, UF e CEP — junto das coordenadas, quando válidas.

A referência selecionada é compartilhada entre as rotas e apresentada no cartão da tela de centros. Dados não retornados pelas fontes não são inventados. Se o endereço não puder ser identificado por GPS, as coordenadas continuam disponíveis para cálculo de proximidade.

A distância é calculada em linha reta pela fórmula de Haversine; não representa rota por ruas ou tempo de deslocamento. Coordenadas associadas a CEP são aproximadas e podem não representar a posição exata do imóvel.

## Design system compartilhado — Fase 4

A aplicação utiliza os tokens definidos em `src/constants/theme.ts`: paleta semântica, tipografia Inter, escala de espaçamento, raios, bordas, iconografia e elevação. A composição atualmente aplicada às telas e à navegação é Light; a paleta Dark permanece reservada para evolução futura, sem alternância parcial entre telas e abas.

Componentes reutilizáveis em `src/components/recicla-ui.tsx`:
- Estrutura e conteúdo: `AppScreen`, `AppCard`, `AppText`.
- Ações: `AppButton` (Primary, Secondary, Outline, Text; tamanhos Medium/Large) e `AppIconButton`.
- Entrada e filtros: `TextField`, `FilterChip` e `MaterialChip`.
- Informação e feedback: `StatusBadge`, `FeedbackCard`, `LocationSummary` e `CenterCard`.
- Cabeçalho interno: `ScreenHeader`, com ação de voltar por ícone vetorial.
- `AppText` utiliza a escala canônica `Typography`; os nomes `small`, `subtitle`, `title` e `eyebrow` são aliases de API mapeados para os tokens oficiais.
- A tela Definir localização também utiliza `TextField` compartilhado para o CEP, evitando uma implementação visual isolada.

Os ícones oficiais e a marca aprovada no Figma ficam em `src/components/app-icons.tsx`. A marca é um pin de localização com o símbolo de reciclagem no interior; não usar letra ou caractere como substituto. Os ícones são desenhados com `react-native-svg`, sem URLs temporárias do Figma.

A barra inferior utiliza ícones Home e MapPin e mantém apenas as rotas funcionais **Início** e **Centros**. A aba Pedidos não é exibida até que esse fluxo seja implementado.

As atividades 4.1, 4.2 e 4.3 estão implementadas e visualmente conferidas no Expo Web. A atividade 4.4 consolida os tokens, elimina estilos comprovadamente obsoletos do template Expo e mantém a navegação coerente com a composição Light.

A atividade 5 começou pela largura de 320 px. A marca decorativa do hero reduz para 56 px (ícone 36 px) até 360 px. A captura pós-ajuste em 320 × 740 px confirmou espaço adequado entre marca e título, sem sobreposição ou overflow horizontal involuntário.

## Integração com a API

A URL da API pode ser configurada em `mobile/.env` por meio de `EXPO_PUBLIC_API_URL`. O arquivo `.env.example` registra o endereço padrão `http://127.0.0.1:3000`.

As telas públicas utilizam:
- `GET /materials`: catálogo ativo de materiais.
- `GET /centers`: consulta e filtros de centros.
- `GET /centers/:id`: detalhes públicos de um centro.

O backend limita as origens permitidas para o Expo Web por `APP_WEB_ORIGINS`. No Compose, as origens locais padrão são `http://localhost:8081` e `http://127.0.0.1:8081`. Para outro host/porta, configure a variável no arquivo local `infra/docker/.env`, separando as origens por vírgula.

## Requisitos e instalação

- Node.js compatível com Expo SDK 58.
- npm.
- Navegador moderno.
- API e MySQL do projeto em execução pelo Docker Compose para consultar dados reais.

Para sincronizar a dependência de localização com a versão compatível do SDK, dentro de `mobile/` execute:

```bash
npx expo install expo-location react-native-svg
```

## Executar backend

Na raiz do repositório, configure `infra/docker/.env` conforme `infra/docker/.env.example` e inicie ou reconstrua somente a API, preservando o volume do MySQL:

```bash
docker compose --env-file infra/docker/.env -f infra/docker/docker-compose.yml up -d --build api
```

A API local fica disponível por padrão em `http://127.0.0.1:3000`.

## Validar o aplicativo

Dentro de `mobile/`:

```bash
npx expo-doctor
npx tsc --noEmit
npx expo lint
npm test -- --runInBand
```

O Jest está configurado para executar somente os testes unitários e ignorar `e2e/`. Os testes de ponta a ponta são executados separadamente pelo comando `npm run test:e2e`.

## Testes responsivos com Playwright

A suíte automatiza as quatro rotas em 320, 360, 390, 430, 768 e 1280 px. A API é simulada com fixtures locais, incluindo um centro de teste para a tela de detalhes; nenhum dado é gravado no MySQL.

O Expo Web utiliza `web.output: "single"` (SPA). As rotas são renderizadas no cliente pelo Expo Router; não dependem de SSR ou de um servidor de renderização por requisição.

O TypeScript inclui explicitamente `jest` e `node` em `compilerOptions.types`; `@types/node` é declarado em `devDependencies` para as definições Node usadas pelo ferramental de desenvolvimento. O spec Playwright evita imports diretos de filesystem do Node: grava as capturas em caminhos relativos dentro do `outputDir` gerenciado pelo Playwright.

Além das capturas do viewport inicial, os testes percorrem até o final a rolagem vertical de Início e Detalhes e geram imagens com sufixo `-scroll-end.png`. Em larguras de 320 e 360 px, a ausência de um contêiner vertical rolável nessas telas causa falha. A rolagem horizontal dos filtros/chips permanece comportamento intencional e independente.

Um cenário adicional verifica interação e acessibilidade no fluxo Home → Centros, em contexto com toque habilitado: filtro “Com coleta” por teclado, chips “Papel” e “Todos” por toque real, busca enviada com Enter, retorno com o botão Voltar via teclado, nomes acessíveis e áreas mínimas dos controles (24 × 24 CSS px).

Após sincronizar as dependências:

```bash
npm install
npx playwright install chromium
npm run test:e2e
```

O Playwright reutiliza o Expo Web em `http://127.0.0.1:8081` quando já estiver em execução; caso contrário, inicia o servidor automaticamente. As capturas ficam em `test-results/responsive/`.

**Última execução local confirmada (02/11/2026):** `npm run test:e2e -- --reporter=list` aprovou **14 testes em 35,1 s**, sem falhas. Seis testes percorrem as quatro rotas em 320, 360, 390, 430, 768 e 1280 px; um valida navegação, filtros, busca e teclado/toque; um verifica lista vazia sem localização; um verifica centro sem coordenadas; um mantém a consulta à API pendente para validar o indicador de carregamento; um mantém a obtenção do estilo cartográfico pendente para validar o carregamento do mapa; um verifica falha HTTP 503 da consulta e recuperação por nova tentativa; um simula falha do estilo Liberty; e um carrega o MapLibre GL JS real com fixture e verifica a navegação do marcador ao detalhe. As fixtures não gravam no MySQL e não representam centros reais.

**Cobertura da visualização do mapa:** a suíte E2E comprova renderização Web cartográfica, estados de lista vazia/sem localização e centro sem coordenadas, carregamento durante espera da API, carregamento enquanto o estilo cartográfico é obtido, erro 503 da consulta com recuperação e mensagem de falha do estilo cartográfico. O cenário com centro ID 42 usa fixture exclusiva do Playwright; não grava no banco e não representa um estabelecimento real. O controle de atribuição do MapLibre fica recolhido inicialmente e expõe os créditos do OpenFreeMap, OpenMapTiles e OpenStreetMap ao tocar no ícone de informação. Após essa alteração, o teste focado `npm run test:e2e -- --grep "mapa real renderiza"` passou, cobrindo o estado inicial do controle, a abertura dos créditos e a navegação do marcador ao detalhe. A validação de execução nativa Android em dispositivo/emulador permanece prevista para a Sprint 6.

Para abrir o relatório HTML:

```bash
npm run test:e2e:report
```

## Executar no navegador

```bash
npx expo start --web
```

Para limpar o cache do Metro durante a resolução de problemas:

```bash
npx expo start --web -c
```

## Estrutura

- `src/app/`: rotas Expo Router, telas e navegação.
- `src/components/`: componentes reutilizáveis e ícones vetoriais oficiais.
- `src/constants/`: tokens semânticos, tipografia e escalas do design system.
- `src/contexts/`: estado compartilhado entre telas.
- `src/services/`: integração HTTP, consulta de CEP e geocodificação reversa.
- `src/types/`: contratos TypeScript da API e da referência de localização.
- `src/utils/`: validação de coordenadas e cálculo de distância.

As atividades 4.1 a 4.3 estão implementadas e visualmente conferidas no Expo Web. A atividade 4.4 foi concluída: consolidou tokens, componentes e estilos das quatro telas, alinhou navegação e configuração Expo ao tema Light e removeu o stylesheet global não utilizado do template. A regressão automatizada da 4.4 foi confirmada localmente: TypeScript e lint sem erros; 6 suítes e 30 testes aprovados. As telas Início e Centros também foram conferidas visualmente no Expo Web. A inspeção visual pós-consolidação confirmou Início, Centros e Definir localização no Expo Web. Detalhes do centro já havia sido validada na atividade 4.3; não foi repetida na 4.4 porque não há centro cadastrado, e a atividade foi considerada concluída por decisão do usuário.


**Validação local consolidada (01/11/2026):** TypeScript (`npx tsc --noEmit`) e ESLint (`npm run lint`) concluídos sem erros; Jest com **6 suítes e 30 testes aprovados**; Playwright com **7 testes aprovados em 22,4 s**, sem falhas. A suíte E2E abrange responsividade das quatro rotas em seis viewports e um cenário funcional de navegação, filtros, busca, teclado e toque. O Jest ignora os testes em `e2e/`, que permanecem sob execução do Playwright.
