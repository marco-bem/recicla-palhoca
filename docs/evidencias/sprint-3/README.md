# Evidências da Sprint 3

## API de tipos de resíduos e associações — validação concluída em 31/10/2026

O catálogo de materiais existente no MySQL foi exposto por meio do endpoint público `GET /materials`. A rota retorna identificador, nome, slug e descrição dos materiais ativos, em ordem alfabética. O catálogo permanece controlado pelo sistema; não foram criadas operações de manutenção de categorias nem alterações no esquema do banco.

A associação dos materiais aos centros continua integrada ao cadastro e à atualização já existentes (`POST /centers` e `PUT /centers/:id`), recebendo `materialIds`. A persistência verifica os materiais ativos dentro da transação e, quando a seleção é alterada, mantém o vínculo anterior em `center_materials` com `is_accepted = FALSE`.

Foram adicionados testes HTTP unitários para a consulta pública do catálogo e ampliado o script `npm run test:integration:centers:http` para comparar o catálogo da API com o MySQL e validar a substituição de material, incluindo a preservação do vínculo histórico.

**Validação local informada em 31/10/2026:** `npm run typecheck` terminou sem erros; `npm test` aprovou 25 testes em 4 suítes, com 1 suíte de integração opcional ignorada na execução geral; a imagem Docker foi reconstruída e o build passou com Node.js 24.

O teste `npm run test:integration:centers:http` passou em todas as verificações. O catálogo público correspondeu aos materiais ativos do MySQL, incluindo ordem alfabética e os campos de cada material. O fluxo criou um centro com um material e, na atualização, substituiu a seleção por outro; a leitura via API e a consulta direta ao banco confirmaram o novo vínculo como aceito e o anterior como não aceito (`is_accepted = FALSE`). As consultas posteriores e a desativação lógica também passaram. O script confirmou a remoção do usuário e do centro sintéticos.

**Observação de ambiente:** os comandos `npm run typecheck` e `npm test` foram executados no host com Node.js `v22.23.2`, embora o projeto declare Node.js `>=24 <25`. O build e o serviço API foram executados com Node.js 24 no Docker. Para novas execuções no host, utilizar Node.js 24.

**Arquivos principais:** `backend/src/materials/`, `backend/src/app.ts`, `backend/tests/materials.test.ts`, `backend/scripts/run-centers-http-integration.cjs`.
