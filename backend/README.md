# Backend / API

Área reservada à API Node.js, Express e TypeScript do Recicla Palhoça.

## Banco de dados

- Modelo entidade-relacionamento e decisões: [`docs/modelo-dados.md`](../docs/modelo-dados.md)
- DDL MySQL: [`database/schema.sql`](database/schema.sql)
- Instruções de execução: [`database/README.md`](database/README.md)

O DDL inicial cria as tabelas e as restrições, mas ainda precisa ser executado em uma instância MySQL 8.0.16+ para validar sintaxe, chaves estrangeiras e índices.

## Próximas atividades do backend

Na Sprint 2, inicializar a aplicação Express/TypeScript, configurar variáveis de ambiente e conexão com MySQL e implementar a rota de saúde `GET /health`. Os recursos de negócio serão desenvolvidos em sprints seguintes.

Não coloque credenciais neste diretório. Use um `.env` local ignorado pelo Git e mantenha apenas `.env.example` com nomes de variáveis e valores fictícios.
