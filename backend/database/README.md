# Banco de dados — Recicla Palhoça

O arquivo `schema.sql` define as oito tabelas, chaves primárias, chaves estrangeiras, restrições e índices iniciais do MVP. O catálogo de materiais é mantido separadamente em `seed.sql`.

## Compatibilidade

- MySQL 8.0.16 ou superior, para que as restrições `CHECK` sejam efetivamente aplicadas.
- Storage Engine InnoDB e charset/collation definidos no DDL.
- O `schema.sql` não cria usuário de banco nem cria o database; o Compose provisiona o database a partir das variáveis de ambiente.
- O `seed.sql` popula o catálogo inicial de materiais e pode ser executado novamente sem duplicar categorias.

## Inicialização com Docker Compose

Na raiz do repositório, configure `infra/docker/.env` a partir de `infra/docker/.env.example` e inicie os serviços:

```bash
docker compose --env-file infra/docker/.env -f infra/docker/docker-compose.yml config --quiet
docker compose --env-file infra/docker/.env -f infra/docker/docker-compose.yml up -d --build
docker compose --env-file infra/docker/.env -f infra/docker/docker-compose.yml ps
```

O serviço MySQL monta dois scripts na ordem de inicialização:

1. `backend/database/schema.sql`: cria as tabelas e restrições.
2. `backend/database/seed.sql`: insere as categorias iniciais do catálogo.

O MySQL executa os scripts de `/docker-entrypoint-initdb.d` somente quando inicializa um diretório de dados vazio. Reiniciar o container ou alterar o Compose não reaplica automaticamente esses scripts em um volume já inicializado. Não remova o volume para forçar a inicialização: use scripts versionados para alterações posteriores.

## Catálogo inicial de materiais

O arquivo `seed.sql` possui 12 categorias de referência:

- Papel
- Papelão
- Plásticos
- Vidro
- Metais
- Embalagens longa vida
- Óleo de cozinha usado
- Pilhas e baterias
- Resíduos eletroeletrônicos
- Lâmpadas
- Pneus
- Roupas e tecidos

Essas categorias são opções controladas do sistema; sua presença no catálogo não significa que um centro real aceite determinado material. Cada centro mantém sua própria associação de materiais em `center_materials`.

### Aplicação manual em um banco já inicializado

Se o MySQL já foi iniciado e o seed não foi executado, aplique-o a partir da raiz do repositório:

```bash
docker compose --env-file infra/docker/.env -f infra/docker/docker-compose.yml exec -T mysql sh -lc 'mysql -u"$MYSQL_USER" -p"$MYSQL_PASSWORD" "$MYSQL_DATABASE"' < backend/database/seed.sql
```

O cliente MySQL pode apresentar um aviso sobre a senha na linha de comando. A execução validada no ambiente local retornou os 12 materiais ativos. Uma segunda execução retornou a mesma lista, sem duplicações.

Para consultar o catálogo diretamente no Workbench:

```sql
USE recicla_palhoca;

SELECT id, name, slug, is_active
FROM materials
ORDER BY name;
```

## Verificação do esquema e dos relacionamentos

Depois de inicializar o banco, abra `backend/database/verify-schema.sql` no MySQL Workbench e execute o script completo. Ele verifica quantidades de tabelas, restrições e índices; depois cria registros sintéticos em uma transação, consulta as relações e termina com `ROLLBACK`.

Resultados conferidos na execução pelo Workbench em 25/10/2026: 8 tabelas; 9 chaves estrangeiras; 9 restrições CHECK; 8 chaves primárias; 8 restrições UNIQUE; 27 índices distintos; consulta relacional retornando uma linha; e zero usuários/materiais de teste restantes após o `ROLLBACK`. As ações do script apareceram sem erros no Action Output. O teste adicional `verify-history-preservation.sql` também foi executado no Workbench sem erros: após desativar logicamente centro e material, a solicitação permaneceu em `ACEITA`, com um item e dois eventos de histórico consultáveis. O `ROLLBACK` final confirmou zero usuários, centros, materiais e solicitações sintéticos restantes.

## Teste de preservação do histórico após desativação

Depois que `verify-schema.sql` passar, abra `backend/database/verify-history-preservation.sql` no Workbench e execute o script completo. Ele cria um pedido sintético com dois eventos de histórico, desativa logicamente o centro e o material, e verifica que o pedido, o item e os eventos continuam consultáveis. O script termina com `ROLLBACK`.

Resultado esperado na consulta resumida: centro inativo (`0`), material inativo (`0`), material não aceito (`0`), pedido preservado em `ACEITA`, um item, dois eventos de histórico, um evento `PENDENTE` e um evento `ACEITA`. A consulta da linha do tempo deve retornar duas linhas na ordem correta. A última consulta deve retornar zero para usuários, centros, materiais e pedidos de teste restantes.

Não execute `COMMIT`. A desativação lógica é feita por atualização dos indicadores; o teste não apaga fisicamente entidades históricas.

## Notas

- Não inserir dados reais de solicitantes nos ambientes de desenvolvimento.
- As validações dependentes do estado atual — como verificar se o centro está ativo, oferece coleta e aceita os materiais — devem ser feitas pela API em uma transação.
- A API deve gravar solicitação, itens e evento de status inicial na mesma transação.
- Não versionar arquivos `.env`, senhas ou outras credenciais.
