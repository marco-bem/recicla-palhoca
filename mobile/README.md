# Aplicativo mobile — Recicla Palhoça

Aplicativo React Native com Expo SDK 58, TypeScript e Expo Router. A implementação pública do cidadão segue o fluxo e a hierarquia do protótipo de média fidelidade da Sprint 1, com consulta à API e estados reais de carregamento, erro e ausência de dados.

## Fluxos implementados

- **Início:** busca por centro ou bairro, acesso à localização de referência, catálogo de materiais e centros retornados pela API.
- **Centros:** consulta, busca textual, filtro por material e disponibilidade de coleta e ordenação por proximidade quando há coordenadas válidas. No mapa, o primeiro toque em um marcador identifica o centro pelo nome; um novo toque no marcador ou no nome abre os detalhes.
- **Localização:** obtenção por GPS com permissão e geocodificação reversa; ou consulta manual por CEP.
- **Detalhes do centro:** endereço, materiais aceitos, horários e serviços, com ações de WhatsApp e ligação a partir do telefone cadastrado.
- **Solicitações:** o cidadão consulta a coleta por protocolo e telefone.
- **Sou centro:** o responsável cria a conta, cadastra ou edita o centro e consulta os pedidos recebidos. Pode aceitar ou recusar pedidos pendentes e concluir os aceitos.

Quando não há centros cadastrados e publicáveis, a interface apresenta o estado vazio. Um banco novo contém o catálogo de materiais. Para conferir os fluxos que exigem um centro, cadastre um centro de demonstração pela área **Sou centro**.

Nos detalhes de um centro ativo que oferece coleta, **Solicitar coleta** abre o formulário sem exigir conta. O cidadão informa contato, endereço e materiais aceitos pelo centro. O CEP de oito dígitos é obrigatório e aciona a consulta à BrasilAPI para preencher logradouro, bairro, município e UF. Os campos permanecem editáveis e podem ser completados manualmente quando a consulta falhar ou retornar um endereço incompleto. A confirmação mostra o protocolo após o registro e informa que o pedido aguarda análise.

## Localização de referência

O fluxo aceita duas fontes:

1. **GPS:** `expo-location` solicita permissão e obtém as coordenadas. O serviço Photon (Komoot), baseado em dados do OpenStreetMap, tenta identificar rua, número, bairro, município, estado e CEP. A disponibilidade dos campos depende da cobertura cartográfica.
2. **CEP:** a aplicação consulta a BrasilAPI CEP v2 e utiliza o endereço retornado — logradouro, bairro, município, UF e CEP — junto das coordenadas, quando válidas.

A referência selecionada é compartilhada entre as rotas e apresentada no cartão da tela de centros. Dados não retornados pelas fontes não são inventados. Se o endereço não puder ser identificado por GPS, as coordenadas continuam disponíveis para cálculo de proximidade. A solicitação de permissão e a obtenção da posição têm limite de espera de 20 segundos cada; durante a tentativa de GPS, o CEP continua disponível como alternativa.

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

A barra inferior oferece **Início**, **Centros** e **Solicitações**. A aba **Solicitações** abre a consulta por protocolo e telefone.

As atividades 4.1, 4.2 e 4.3 estão implementadas e visualmente conferidas no Expo Web. A atividade 4.4 consolida os tokens, elimina estilos comprovadamente obsoletos do template Expo e mantém a navegação coerente com a composição Light.

A atividade 5 começou pela largura de 320 px. A marca decorativa do hero reduz para 56 px (ícone 36 px) até 360 px. A captura pós-ajuste em 320 × 740 px confirmou espaço adequado entre marca e título, sem sobreposição ou overflow horizontal involuntário.

## Integração com a API

A URL da API pode ser configurada em `mobile/.env` por meio de `EXPO_PUBLIC_API_URL`. O arquivo `.env.example` registra o endereço padrão `http://127.0.0.1:3000`.

Na exportação de produção para Web/PWA, quando `EXPO_PUBLIC_API_URL` estiver vazio, o aplicativo usa a origem da página com o prefixo `/api`. Veja [como servir a exportação por HTTPS](#executar-o-pwa-no-iphone).

As telas públicas utilizam:
- `GET /materials`: catálogo ativo de materiais.
- `GET /centers`: consulta e filtros de centros.
- `GET /centers/:id`: detalhes públicos de um centro.
- `POST /collection-requests`: registro público do pedido de coleta e retorno do protocolo.
- `POST /collection-requests/lookup`: acompanhamento público com protocolo e telefone.

A área autenticada usa `/auth/*`, `/centers/me`, as rotas de escrita de centros e `/center-collection-requests`. Consulte o [contrato OpenAPI](../backend/openapi.yaml) para os detalhes.

O backend limita as origens permitidas para o Expo Web por `APP_WEB_ORIGINS`. No Compose, as origens locais padrão são `http://localhost:8081` e `http://127.0.0.1:8081`. Para outro host/porta, configure a variável no arquivo local `infra/docker/.env`, separando as origens por vírgula.

## Requisitos e instalação

- Node.js compatível com Expo SDK 58. Use Node.js 24.3 ou posterior da série 24 para compartilhar a versão com o backend.
- npm.
- Navegador moderno.
- API e MySQL do projeto em execução pelo Docker Compose para consultar dados reais.

Na raiz do repositório, instale as dependências registradas no lockfile:

```bash
cd mobile
npm ci
```

## Executar backend

No primeiro uso, prepare o `.env` e crie o volume conforme o [guia Docker](../infra/docker/README.md). A partir da raiz, inicie o MySQL e a API:

```bash
docker compose --env-file infra/docker/.env -f infra/docker/docker-compose.yml up -d --build
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
npm ci
npx playwright install chromium
npm run test:e2e
```

O Playwright reutiliza o Expo Web em `http://127.0.0.1:8081` quando já estiver em execução; caso contrário, inicia o servidor automaticamente. As capturas ficam em `test-results/responsive/`.

Em 02/11/2026, `npm run test:e2e -- --reporter=list` aprovou **14 testes em 35,1 s**. As rodadas posteriores de regressão estão nas [evidências da Sprint 6](../docs/evidencias/sprint-6/README.md).

**Cobertura da visualização do mapa:** a suíte E2E comprova renderização Web cartográfica, estados de lista vazia/sem localização e centro sem coordenadas, carregamento durante espera da API, carregamento enquanto o estilo cartográfico é obtido, erro 503 da consulta com recuperação e mensagem de falha do estilo cartográfico. O cenário com centro ID 42 usa fixture exclusiva do Playwright; não grava no banco e não representa um estabelecimento real. O controle de atribuição do MapLibre fica recolhido inicialmente e expõe os créditos do OpenFreeMap, OpenMapTiles e OpenStreetMap ao tocar no ícone de informação. O teste focado executado em 02/11/2026 cobriu o estado inicial do controle, a abertura dos créditos e a navegação do marcador ao detalhe no comportamento então implementado. A revisão visual final no Expo Web foi aprovada pelo usuário em 02/11/2026: mapa sem faixa fixa de créditos, localização de referência visível e ícone de informação recolhido no canto inferior direito. A validação nativa Android com o mapa está registrada nas evidências da Sprint 6.

Em 07/11/2026, a seleção do marcador foi alterada: o primeiro toque mostra o nome e a identificação abre os detalhes. O cenário E2E existente foi ajustado para clicar no nome exibido, mas ainda não foi executado após essa alteração. A conferência visual manual desta interação permanece pendente no PWA e no emulador Android.

Para abrir o relatório HTML:

```bash
npm run test:e2e:report
```

## Executar no navegador

A partir de `mobile/`, com as dependências instaladas e a API em execução:

```bash
npm run web -- --localhost --port 8081
```

Abra [http://localhost:8081/](http://localhost:8081/). Se mudar a porta do Expo, inclua a nova origem em `APP_WEB_ORIGINS`. Se mudar a porta da API, ajuste `EXPO_PUBLIC_API_URL` antes de reiniciar o Expo.

Para limpar o cache do Metro durante a resolução de problemas:

```bash
npx expo start --web -c
```

## Executar no emulador Android

Instale o Android Studio, configure JDK 17 e o Android SDK conforme o [guia de compilação local do Expo](https://docs.expo.dev/guides/local-app-development/) e inicie um dispositivo virtual. A validação do projeto usou Android 15 (API 35) em um AVD x86_64 com KVM. Com a API em execução, as dependências instaladas e um único dispositivo conectado, execute de `mobile/`:

```bash
adb devices
adb reverse tcp:3000 tcp:3000
EXPO_PUBLIC_API_URL=http://127.0.0.1:3000 npm run android -- --device
```

Com mais de um dispositivo, indique o AVD com `adb -s <serial>` no comando `reverse` e selecione o mesmo AVD no Expo. A primeira execução gera o projeto nativo se necessário, compila e instala um APK de depuração e inicia o Metro. Se outro servidor estiver usando a porta 8081, encerre-o antes de iniciar este fluxo.

O redirecionamento permite que o APK acesse a API do computador pelo loopback do emulador. Refaça-o se o AVD for reiniciado. Para voltar ao app de depuração já instalado após alterações em JavaScript, use `npx expo start` e abra o app no AVD. Um APK com bundle embutido precisa ser recompilado e reinstalado para receber mudanças.

O emulador fornece posições simuladas pelos controles **Extended controls → Location**. O teste de GPS físico requer um dispositivo Android real. Para consulta por CEP, o dispositivo precisa de acesso à BrasilAPI.

## Executar o PWA no iPhone

Com a API ativa no computador, gere a exportação dentro de `mobile/`. O valor vazio de `EXPO_PUBLIC_API_URL` faz a exportação usar `/api` na origem do próprio PWA:

```bash
EXPO_PUBLIC_API_URL='' npx expo export --platform web
```

Sirva `mobile/dist/` na raiz de um endereço HTTPS acessível pelo iPhone. O servidor deve encaminhar `/api/*` a `http://127.0.0.1:3000`, retirando o prefixo `/api`, e usar `index.html` como fallback para as rotas do Expo Router. Exemplo local com [Caddy](https://caddyserver.com/docs/caddyfile/patterns#single-page-apps-spas), em um arquivo de configuração fora do repositório. Substitua o IP pelo endereço do computador na rede e use o caminho absoluto de `mobile/dist`:

```caddyfile
{
  auto_https disable_redirects
  skip_install_trust
}

https://192.168.1.10:8443 {
  bind 192.168.1.10
  tls internal

  handle_path /api/* {
    reverse_proxy 127.0.0.1:3000
  }

  handle {
    root * "/caminho/para/recicla-palhoca/mobile/dist"
    header Cache-Control "no-cache"
    try_files {path} /index.html
    file_server
  }
}
```

Inicie com `caddy run --config /caminho/para/Caddyfile.local --adapter caddyfile`. Use esse exemplo apenas na rede local e com dados de demonstração. Para o certificado local, transfira ao iPhone somente o certificado público da autoridade do Caddy. No Linux, ao executar como usuário, ele fica normalmente em `~/.local/share/caddy/pki/authorities/local/root.crt`, ou sob `$XDG_DATA_HOME/caddy` quando essa variável está definida. [Instruções da Apple para confiar no certificado](https://support.apple.com/pt-br/102390).

Com o iPhone na mesma rede, abra no Safari o endereço HTTPS do computador. Confira se `/api/health` nesse mesmo endereço retorna `"database":"connected"`. Na página inicial, use **Compartilhar → Adicionar à Tela de Início** e autorize a localização ao usar o GPS. Para atualizar, exporte novamente e sirva os novos arquivos de `dist/`. Feche e reabra o PWA pelo ícone.

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
