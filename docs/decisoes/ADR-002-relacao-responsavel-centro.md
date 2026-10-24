# ADR-002 — Relação entre responsável e centro de reciclagem

- **Status:** aceita
- **Data da decisão:** 24/10/2026
- **Contexto:** Recicla Palhoça — MVP / Sprint 2

## Contexto

O MVP precisa definir como as contas autenticadas se relacionam aos centros de reciclagem gerenciados. Permitir vários responsáveis por centro ou permitir que uma conta gerencie vários centros exigiria regras adicionais de autorização, telas e testes.

## Decisão

Uma conta de responsável pode administrar **no máximo um centro**. Cada centro cadastrado deve estar associado a **exatamente uma conta responsável**.

A relação é 1 para 0..1 do ponto de vista da conta: a conta pode ainda não ter um centro cadastrado, mas não pode administrar um segundo. Do ponto de vista do centro, a relação com o responsável é obrigatória e exclusiva.

## Implementação no modelo relacional

A tabela `recycling_centers` possui:

- `responsible_user_id BIGINT UNSIGNED NOT NULL`: exige um responsável para todo centro.
- Chave estrangeira para `users(id)`: impede referência a uma conta inexistente.
- Restrição `UNIQUE (responsible_user_id)`: impede que a mesma conta seja responsável por dois centros.

A API deve conferir a regra no cadastro e devolver erro de validação consistente caso a conta já esteja vinculada a um centro. A restrição no banco permanece necessária para proteger a integridade em operações concorrentes.

## Consequências

- O fluxo de cadastro do centro deve verificar se a conta autenticada já possui um centro.
- Uma conta não pode administrar dados de um segundo centro alterando IDs enviados pela interface.
- O modelo e os testes permanecem mais simples para o MVP.
- Uma expansão futura para vários responsáveis ou vários centros exigirá alteração formal dos requisitos, migração do banco, revisão das permissões e dos testes.

## Fora desta decisão

Esta decisão não define verificação institucional externa do centro, papéis administrativos municipais nem suporte a consórcios. Esses itens continuam fora do MVP.
