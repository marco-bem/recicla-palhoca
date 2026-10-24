# Recicla Palhoça

Aplicação mobile proposta para facilitar a descoberta de centros de reciclagem em Palhoça (SC), a consulta dos materiais aceitos e das condições de atendimento, e o registro e acompanhamento de solicitações de coleta quando o serviço estiver disponível.

> **Status:** projeto acadêmico em desenvolvimento (Hands On Work VIII). Este repositório começa pela especificação e estrutura inicial; as funcionalidades serão implementadas e testadas incrementalmente nas Sprints 2 a 6.

## Objetivos do MVP

- Consultar e filtrar centros de reciclagem ativos.
- Definir um ponto de referência usando localização do dispositivo ou endereço/CEP.
- Ordenar centros pela distância geográfica em linha reta.
- Consultar materiais aceitos, endereço, horários e serviços disponíveis.
- Permitir que responsáveis autenticados mantenham o perfil do centro.
- Registrar e acompanhar solicitações de coleta, respeitando disponibilidade e permissões.
- Desenvolver e validar a solução com testes automatizados.

## Stack planejada

- **Mobile:** React Native, Expo, TypeScript e Expo Router.
- **API:** Node.js, Express e TypeScript.
- **Banco de dados:** MySQL.
- **Ambiente local:** Docker / Docker Compose.
- **Testes:** Jest, Supertest, jest-expo e React Native Testing Library, conforme a camada.
- **Contrato de API:** OpenAPI/Swagger.
- **Versionamento:** Git e GitHub.

A stack será configurada e validada durante a Sprint 2. Não considerar essas ferramentas como já instaladas/configuradas só pela presença desta lista.

## Estrutura do repositório

    recicla-palhoca/
    ├── backend/
    │   ├── database/
    │   │   ├── README.md         # Execução e validação do DDL
    │   │   └── schema.sql        # Esquema inicial MySQL
    │   └── README.md
    ├── mobile/                  # Aplicativo Expo; configuração na Sprint 2
    ├── infra/
    │   └── docker/
    │       ├── .env.example     # Modelo de variáveis locais
    │       ├── docker-compose.yml
    │       └── README.md        # Inicialização do banco e conexão Workbench
    ├── docs/
    │   ├── decisoes/            # Decisões técnicas registradas (ADRs)
    │   ├── evidencias/
    │   │   └── sprint-2/        # Diagramas, capturas e logs não sensíveis
    │   ├── modelo-dados.md      # Diagrama ER, cardinalidades e regras
    │   ├── requisitos-e-criterios-aceitacao.md
    │   └── relatorio-etapa2/
    │       └── secao-5-1-1-requisitos.md
    └── README.md

## Início do trabalho

Os comandos completos de instalação e execução serão documentados após a configuração do ambiente mobile, API, MySQL e testes. O modelo inicial de dados está em `docs/modelo-dados.md`, e o DDL em `backend/database/schema.sql`; o script precisa ser executado em MySQL para validar a modelagem. Consulte `docs/requisitos-e-criterios-aceitacao.md` para os requisitos revisados como baseline.

## Banco de dados local

A configuração do MySQL em Docker aplica o esquema na primeira inicialização do volume. Consulte [`infra/docker/README.md`](infra/docker/README.md) para clonar o repositório, configurar `infra/docker/.env`, iniciar o container e conectar pelo MySQL Workbench. Não versione o arquivo local `.env`.

## Regras de contribuição e segurança

- Nunca versionar tokens, senhas, arquivos `.env` ou dados pessoais reais de solicitantes.
- Usar dados sintéticos nas demonstrações e identificá-los como demonstrativos.
- Manter alterações pequenas e commits com descrições objetivas.
- Atualizar os requisitos e testes quando uma decisão de produto mudar.
- Não declarar uma funcionalidade como concluída sem teste ou evidência correspondente.
