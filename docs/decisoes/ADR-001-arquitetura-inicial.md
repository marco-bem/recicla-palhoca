# ADR-001 — Arquitetura inicial do Recicla Palhoça

- **Status:** aceita
- **Data:** 25/10/2026

## Contexto

O MVP precisa oferecer uma experiência mobile para cidadãos e uma área de gestão para centros de reciclagem, com dados persistidos, regras de autorização, localização e solicitações de coleta. O projeto será desenvolvido individualmente e precisa permitir testes automatizados em ambiente local.

## Decisões iniciais

1. **Aplicativo mobile:** React Native com Expo, TypeScript e Expo Router.
2. **API:** Node.js, Express e TypeScript, separada do aplicativo mobile.
3. **Persistência:** MySQL relacional.
4. **Ambiente local:** Docker Compose para tornar o banco e os serviços de desenvolvimento reproduzíveis.
5. **Qualidade:** Jest e ferramentas relacionadas para testes unitários, HTTP e mobile; OpenAPI/Swagger para documentar o contrato da API.
6. **Privacidade:** autenticação para a área do centro; dados pessoais de solicitantes não serão expostos na consulta pública.

## Consequências

- A API é a responsável por validar dados, autorizar acesso a recursos, impor as transições de estado e proteger dados pessoais.
- A interface não substitui a validação do servidor.
- A arquitetura será revista se a validação técnica ou a implementação revelar uma limitação relevante.

## Fora desta decisão

Não se define ainda hospedagem de produção, publicação em lojas, provedor de mapas definitivo nem integração municipal; esses itens não são necessários para a base local do MVP.
