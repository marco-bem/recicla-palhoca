# Aplicativo mobile — Recicla Palhoça

Aplicativo React Native inicializado com Expo SDK 58, TypeScript e Expo Router. A estrutura atual ainda é o template de partida do Expo; as telas e funcionalidades do Recicla Palhoça serão implementadas incrementalmente nas próximas sprints.

## Requisitos

- Node.js compatível com o Expo SDK do projeto.
- npm.
- Navegador moderno para validação web.

## Instalar dependências

Na raiz do repositório:

```bash
cd mobile
npm install
```

## Validar a configuração

```bash
npx expo-doctor
npx tsc --noEmit
```

Na configuração validada em 25/10/2026, o Expo Doctor aprovou 20/20 verificações e o TypeScript terminou sem erros.

## Executar no navegador

```bash
npx expo start --web
```

O navegador abre a tela padrão do Expo. Isso comprova a inicialização do ambiente, mas não substitui os testes das telas, dos fluxos de negócio ou de um dispositivo físico.

Para iniciar o servidor Expo no modo de desenvolvimento sem forçar a web, use `npx expo start`.

## Estrutura

- `src/app/`: rotas e telas Expo Router.
- `src/components/`: componentes reutilizáveis.
- `src/constants/`: tema e constantes visuais.
- `src/hooks/`: hooks compartilhados.

O protótipo Figma é uma referência de navegação e interface; não é uma aplicação funcional nem uma fonte de dados reais.
