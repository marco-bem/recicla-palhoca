# Aplicativo mobile — Recicla Palhoça

Aplicativo React Native com Expo SDK 58, TypeScript e Expo Router. A interface implementa o fluxo público de consulta de centros de reciclagem, tomando como referência o protótipo de média fidelidade da Sprint 1 e refinando seus componentes para uso real.

## Escopo implementado

- Início com busca textual, acesso à localização, catálogo de materiais e centros retornados pela API.
- Definição de localização por GPS ou CEP.
- Consulta e filtragem de centros por nome/bairro, material e disponibilidade de coleta.
- Ordenação dos resultados por distância geográfica em linha reta quando houver coordenadas de referência.
- Detalhes públicos do centro: endereço, telefone, materiais aceitos, horários e serviços.

Cadastro de responsáveis, administração de centros, criação de solicitações e acompanhamento de pedidos pertencem a outras tarefas do backlog e não são implementados nestas telas.

## Requisitos

- Node.js compatível com Expo SDK 58.
- npm.
- Navegador moderno.
- API e MySQL do projeto em execução pelo Docker Compose para consultar dados reais.

## Instalação

Na raiz do repositório, sincronize as dependências do mobile:

```bash
cd mobile
npx expo install expo-location
```

A instalação usa a versão de `expo-location` compatível com o SDK 58 e atualiza `package-lock.json`.

A URL da API pode ser configurada em `mobile/.env`. O arquivo `.env.example` registra o endereço padrão para o ambiente local. Sem essa variável, o aplicativo usa `http://127.0.0.1:3000`.

## Executar backend

Na raiz do repositório, configure `infra/docker/.env` conforme `infra/docker/.env.example` e inicie ou reconstrua somente a API, preservando o volume do MySQL:

```bash
docker compose --env-file infra/docker/.env -f infra/docker/docker-compose.yml up -d --build api
```

A API local fica disponível por padrão em `http://127.0.0.1:3000`. O Compose define as origens web locais permitidas para CORS (`localhost:8081` e `127.0.0.1:8081`). Para outro host/porta do Expo, configure `APP_WEB_ORIGINS` no arquivo local `infra/docker/.env`, separando origens por vírgula.

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

A aplicação consulta os endpoints públicos `GET /centers`, `GET /centers/:id` e `GET /materials`. Não são exibidos centros demonstrativos como se fossem estabelecimentos reais.

O GPS solicita permissão em tempo de execução. A busca manual utiliza CEP e só aplica a ordenação por proximidade quando o serviço retorna coordenadas válidas. As coordenadas associadas a CEP são aproximadas e podem não representar a posição exata do imóvel; quando não há coordenadas, a tela orienta o uso do GPS. A distância é calculada em linha reta, não representa rota viária ou tempo de deslocamento.

## Estrutura

- `src/app/`: rotas Expo Router, telas e navegação.
- `src/components/`: componentes reutilizáveis e identidade visual.
- `src/constants/`: paleta, tipografia e espaçamento.
- `src/services/`: integração HTTP com a API.
- `src/types/`: contratos TypeScript das respostas da API.
- `src/utils/`: validação de coordenadas e cálculo de distância.
- `src/hooks/`: hooks compartilhados do template Expo.

O Figma é utilizado como referência de fluxo e hierarquia visual de média fidelidade, não como interface final pixel a pixel. A aplicação deve manter consistência, responsividade e estados reais de carregamento, erro e ausência de dados.
