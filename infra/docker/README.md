# Banco de dados — Docker + MySQL Workbench

A configuração usa a imagem oficial do MySQL 8.4 e o container `recicla-palhoca`. O Compose monta `backend/database/schema.sql` e `backend/database/seed.sql` no diretório de inicialização, respectivamente como `01-schema.sql` e `02-seed.sql`. Em uma instância recém-criada com volume vazio, o MySQL cria o database definido por `MYSQL_DATABASE`, executa o esquema e depois popula o catálogo inicial. O serviço `api` constrói a API Express/TypeScript definida em `backend/Dockerfile` e usa o serviço `mysql` pela rede interna do Compose.

## 1. Pré-requisitos

- Git;
- Docker Engine e o plugin Docker Compose;
- MySQL Workbench, opcional para inspecionar o banco.

O schema usa recursos e collation do MySQL 8. Não use uma imagem MariaDB para este projeto.

## 2. Preparar configuração local

A partir da raiz do repositório, crie o arquivo de ambiente se ele ainda não existir:

```bash
test -f infra/docker/.env || cp infra/docker/.env.example infra/docker/.env
```

Edite `infra/docker/.env` e substitua as duas senhas de exemplo por senhas locais diferentes. Esse arquivo é ignorado pelo Git; não o versionar nem compartilhar. O arquivo `.env.example` contém apenas valores demonstrativos. Edite também `AUTH_JWT_SECRET` com uma chave gerada localmente por `openssl rand -hex 32`; não use o valor vazio do exemplo, não a versione e não a compartilhe.

A porta publicada é `3307` no host para evitar conflito com uma instalação MySQL local que já use `3306`. Se a porta 3307 também estiver ocupada, altere `MYSQL_PORT` para `3308` ou outra porta disponível.

## 3. Validar a configuração e iniciar o banco e a API

O Compose espera o volume externo `recicla-palhoca-mysql-data`. Crie-o no primeiro uso. Se já existir, `docker volume create` retorna o volume existente e preserva seus dados. Execute a partir da raiz:

```bash
docker volume create recicla-palhoca-mysql-data
docker compose --env-file infra/docker/.env -f infra/docker/docker-compose.yml config --quiet
docker compose --env-file infra/docker/.env -f infra/docker/docker-compose.yml up -d --build
```

`config --quiet` valida a configuração sem imprimir as variáveis. `up` baixa as imagens necessárias, constrói a API e inicia os serviços. Em um volume vazio, o MySQL executa `01-schema.sql` e depois `02-seed.sql`. O seed carrega 12 categorias de materiais. Centros, contas e solicitações de outros ambientes não fazem parte do seed. A API aguarda o healthcheck do MySQL antes de iniciar.

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
docker compose --env-file infra/docker/.env -f infra/docker/docker-compose.yml up -d --build
```

Acompanhar os logs:

```bash
docker compose --env-file infra/docker/.env -f infra/docker/docker-compose.yml logs -f mysql
```

## Atenção ao script de inicialização

Os arquivos em `/docker-entrypoint-initdb.d` são executados automaticamente somente quando o MySQL inicializa um diretório de dados vazio. Reiniciar ou recriar o container mantendo o volume não executa o schema nem o seed novamente.

O volume `recicla-palhoca-mysql-data` é externo ao Compose e preserva os dados entre reinicializações. Use `stop` para interromper os serviços. Remover o volume manualmente apaga os dados. Para evoluir um schema já inicializado, aplique uma migração de forma controlada pelo Workbench ou por script versionado.

## Parar somente a API ou executá-la localmente

Para parar apenas o backend em container, preservando o MySQL em execução:

```bash
docker compose --env-file infra/docker/.env -f infra/docker/docker-compose.yml stop api
```

A partir da pasta `backend`, a API pode ser iniciada no host com `npm run dev`; o arquivo `backend/.env` deve usar `DB_HOST=127.0.0.1`, `DB_PORT=3307` e a mesma senha definida em `infra/docker/.env` para `MYSQL_PASSWORD`. Consulte `backend/README.md` para os comandos completos.


## API Express

A configuração atual do Compose também inicia o container `recicla-palhoca-api`, com porta local `3000` por padrão. Seus endpoints iniciais são:

- `GET http://127.0.0.1:3000/health/live`: verifica somente se a API responde.
- `GET http://127.0.0.1:3000/health`: executa uma consulta de verificação ao MySQL e retorna HTTP 200 ou 503 conforme a conexão.

Verifique a API com:

```bash
curl -i http://127.0.0.1:3000/health/live
curl -i http://127.0.0.1:3000/health
docker compose --env-file infra/docker/.env -f infra/docker/docker-compose.yml logs --tail=100 api
```

Para executar a API diretamente com hot reload no ambiente local, consulte [`backend/README.md`](../../backend/README.md). Não execute a API local e a API no Docker simultaneamente na mesma porta host.

