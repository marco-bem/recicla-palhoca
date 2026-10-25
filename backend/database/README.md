# Banco de dados — Recicla Palhoça

O arquivo `schema.sql` define as tabelas, chaves primárias, chaves estrangeiras, restrições e índices iniciais do MVP.

## Compatibilidade

- MySQL 8.0.16 ou superior, para que as restrições `CHECK` sejam efetivamente aplicadas.
- Storage Engine InnoDB e charset/collation definidos no DDL.
- O script não cria usuário de banco, não cria o database e não popula o catálogo de materiais.

## Execução local

Depois de subir o serviço MySQL do ambiente local e criar/selecionar o database por meio das variáveis locais, execute a partir da raiz do repositório:

```bash
mysql --host=127.0.0.1 --port=3306 --user="$MYSQL_USER" --password "$MYSQL_DATABASE" < backend/database/schema.sql
```

O cliente solicitará a senha interativamente. Não coloque senha no comando ou no repositório. Os nomes `MYSQL_USER` e `MYSQL_DATABASE` devem estar definidos no shell conforme a configuração local, ou ser substituídos pelos valores locais apropriados.

Para verificar as tabelas criadas:

```bash
mysql --host=127.0.0.1 --port=3306 --user="$MYSQL_USER" --password "$MYSQL_DATABASE" -e "SHOW TABLES;"
```

Esses comandos são instruções para a etapa de configuração do ambiente; o script ainda precisa ser executado em uma instância MySQL real antes de a modelagem ser considerada validada.

## Verificação do esquema e dos relacionamentos

Depois de inicializar o banco, abra `backend/database/verify-schema.sql` no MySQL Workbench e execute o script completo. Ele verifica quantidades de tabelas, restrições e índices; depois cria registros sintéticos em uma transação, consulta as relações e termina com `ROLLBACK`.

Resultados conferidos na execução pelo Workbench em 25/10/2026: 8 tabelas; 9 chaves estrangeiras; 9 restrições CHECK; 8 chaves primárias; 8 restrições UNIQUE; 27 índices distintos; consulta relacional retornando uma linha; e zero usuários/materiais de teste restantes após o `ROLLBACK`. As ações do script apareceram sem erros no Action Output. A preservação do histórico ao desativar centro/material ainda não foi testada. Se houver erro durante uma execução futura, execute `ROLLBACK;` no Workbench antes de repetir.

## Notas

- Não inserir dados reais de solicitantes nos ambientes de desenvolvimento.
- O catálogo de materiais será incluído por uma etapa de seed versionada separadamente.
- As validações dependentes do estado atual — como verificar se o centro está ativo, oferece coleta e aceita os materiais — devem ser feitas pela API em uma transação.
- A API deve gravar solicitação, itens e evento de status inicial na mesma transação.
