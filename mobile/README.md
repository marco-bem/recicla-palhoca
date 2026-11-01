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
