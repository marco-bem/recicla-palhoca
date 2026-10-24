# Banco de dados — Docker + MySQL Workbench

A configuração usa a imagem oficial do MySQL 8.4. O Compose monta o DDL versionado em `backend/database/schema.sql` no diretório de inicialização do container. Em uma instância recém-criada, o MySQL cria o database definido por `MYSQL_DATABASE` e executa o arquivo SQL.

## 1. Pré-requisitos

- Git;
- Docker Engine e o plugin Docker Compose;
- MySQL Workbench instalado no computador.

O schema usa recursos e collation do MySQL 8. Não use uma imagem MariaDB para este projeto.

## 2. Preparar configuração local

A partir da raiz do repositório, crie o arquivo local de ambiente:

```bash
cp infra/docker/.env.example infra/docker/.env
```

Edite `infra/docker/.env` e substitua as duas senhas de exemplo por senhas locais diferentes. Esse arquivo é ignorado pelo Git; não o versionar nem compartilhar. O arquivo `.env.example` contém apenas valores demonstrativos.

A porta publicada é `3307` no host para evitar conflito com uma instalação MySQL local que já use `3306`. Se a porta 3307 também estiver ocupada, altere `MYSQL_PORT` para `3308` ou outra porta disponível.

## 3. Validar a configuração e iniciar o banco

Execute a partir da raiz do repositório:

```bash
docker compose --env-file infra/docker/.env -f infra/docker/docker-compose.yml config
docker compose --env-file infra/docker/.env -f infra/docker/docker-compose.yml up -d
```

O primeiro comando valida e exibe a configuração resolvida. Confirme que ela não expõe senhas em capturas ou documentos. O segundo baixa a imagem quando necessário, inicia o container e, se o volume estiver vazio, executa automaticamente `backend/database/schema.sql`.

## 4. Conferir o container e a inicialização

```bash
docker compose --env-file infra/docker/.env -f infra/docker/docker-compose.yml ps
docker compose --env-file infra/docker/.env -f infra/docker/docker-compose.yml logs --tail=100 mysql
```

Aguarde o serviço ficar saudável. Nos logs, procure a mensagem de conclusão da inicialização e verifique se não há erro de SQL. Se houver falha, não apague o volume automaticamente: primeiro examine os logs para identificar a causa.

## 5. Conectar pelo MySQL Workbench

Crie uma conexão nova com estes valores:

| Campo no Workbench | Valor |
|---|---|
| Connection Name | Recicla Palhoça — Docker |
| Hostname | `127.0.0.1` |
| Port | Valor de `MYSQL_PORT`, inicialmente `3307` |
| Username | Valor de `MYSQL_USER`, inicialmente `recicla_app` |
| Password | A senha definida em `infra/docker/.env` |
| Default Schema | `recicla_palhoca` |

Use **Test Connection**. A senha do usuário da aplicação é suficiente para administrar o schema do banco do projeto; evite usar o usuário `root` nas conexões normais.

Execute no editor SQL do Workbench:

```sql
USE recicla_palhoca;
SHOW TABLES;

SELECT COUNT(*) AS quantidade_tabelas
FROM information_schema.tables
WHERE table_schema = 'recicla_palhoca'
  AND table_type = 'BASE TABLE';
```

O resultado esperado é a existência de oito tabelas: `users`, `materials`, `recycling_centers`, `center_opening_hours`, `center_materials`, `collection_requests`, `collection_request_materials` e `collection_request_status_history`.

## 6. Comandos úteis

Parar o serviço sem apagar os dados:

```bash
docker compose --env-file infra/docker/.env -f infra/docker/docker-compose.yml stop
```

Iniciar novamente:

```bash
docker compose --env-file infra/docker/.env -f infra/docker/docker-compose.yml up -d
```

Acompanhar os logs:

```bash
docker compose --env-file infra/docker/.env -f infra/docker/docker-compose.yml logs -f mysql
```

## Atenção ao script de inicialização

O arquivo em `/docker-entrypoint-initdb.d` é executado automaticamente somente quando o MySQL inicializa um diretório de dados vazio. Reiniciar ou recriar o container mantendo o volume não executa o schema novamente.

A configuração preserva o volume `recicla-palhoca-mysql-data` para que os dados persistam entre reinicializações. **Não use `docker compose down -v` como rotina:** esse comando remove o volume e apaga todos os dados armazenados nele. Se o schema precisar mudar depois da primeira inicialização, aplique a migração necessária de forma controlada pelo Workbench ou por um script de migração versionado; não destrua dados para forçar uma nova inicialização.

## Limites da validação

Esses arquivos configuram o container e automatizam a primeira execução do DDL, mas não significam que o banco tenha sido executado no computador do desenvolvedor. A modelagem só fica tecnicamente validada depois que o usuário iniciar o container, confirmar que as oito tabelas foram criadas e revisar eventuais erros nos logs.
