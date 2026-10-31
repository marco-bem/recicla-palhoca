# Evidências da Sprint 3

## API de tipos de resíduos e associações — implementação publicada; validação local pendente

O catálogo de materiais existente no MySQL foi exposto por meio do endpoint público `GET /materials`. A rota retorna identificador, nome, slug e descrição dos materiais ativos, em ordem alfabética. O catálogo permanece controlado pelo sistema; não foram criadas operações de manutenção de categorias nem alterações no esquema do banco.

A associação dos materiais aos centros continua integrada ao cadastro e à atualização já existentes (`POST /centers` e `PUT /centers/:id`), recebendo `materialIds`. A persistência verifica os materiais ativos dentro da transação e, quando a seleção é alterada, mantém o vínculo anterior em `center_materials` com `is_accepted = FALSE`.

Foram adicionados testes HTTP unitários para a consulta pública do catálogo e ampliado o script `npm run test:integration:centers:http` para comparar o catálogo da API com o MySQL e validar a substituição de material, incluindo a preservação do vínculo histórico.

**Validação local:** pendente. Após sincronizar o repositório, executar typecheck, testes, build e o teste HTTP integrado. Registrar resultados somente após a execução local.

**Arquivos principais:** `backend/src/materials/`, `backend/src/app.ts`, `backend/tests/materials.test.ts`, `backend/scripts/run-centers-http-integration.cjs`.
