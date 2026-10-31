# Evidências da Sprint 3

## API de tipos de resíduos e associações — validação concluída em 31/10/2026

O catálogo de materiais existente no MySQL foi exposto por meio do endpoint público `GET /materials`. A rota retorna identificador, nome, slug e descrição dos materiais ativos, em ordem alfabética. O catálogo permanece controlado pelo sistema; não foram criadas operações de manutenção de categorias nem alterações no esquema do banco.

A associação dos materiais aos centros continua integrada ao cadastro e à atualização já existentes (`POST /centers` e `PUT /centers/:id`), recebendo `materialIds`. A persistência verifica os materiais ativos dentro da transação e, quando a seleção é alterada, mantém o vínculo anterior em `center_materials` com `is_accepted = FALSE`.

Foram adicionados testes HTTP unitários para a consulta pública do catálogo e ampliado o script `npm run test:integration:centers:http` para comparar o catálogo da API com o MySQL e validar a substituição de material, incluindo a preservação do vínculo histórico.

**Validação local informada em 31/10/2026:** `npm run typecheck` terminou sem erros; `npm test` aprovou 25 testes em 4 suítes, com 1 suíte de integração opcional ignorada na execução geral; a imagem Docker foi reconstruída e o build passou com Node.js 24.

O teste `npm run test:integration:centers:http` passou em todas as verificações. O catálogo público correspondeu aos materiais ativos do MySQL, incluindo ordem alfabética e os campos de cada material. O fluxo criou um centro com um material e, na atualização, substituiu a seleção por outro; a leitura via API e a consulta direta ao banco confirmaram o novo vínculo como aceito e o anterior como não aceito (`is_accepted = FALSE`). As consultas posteriores e a desativação lógica também passaram. O script confirmou a remoção do usuário e do centro sintéticos.

**Observação de ambiente:** os comandos `npm run typecheck` e `npm test` foram executados no host com Node.js `v22.23.2`, embora o projeto declare Node.js `>=24 <25`. O build e o serviço API foram executados com Node.js 24 no Docker. Para novas execuções no host, utilizar Node.js 24.

**Arquivos principais:** `backend/src/materials/`, `backend/src/app.ts`, `backend/tests/materials.test.ts`, `backend/scripts/run-centers-http-integration.cjs`.

## Testes para centros e tipos de resíduos — validação concluída em 31/10/2026

A suíte de testes foi ampliada sem alterar o comportamento da API:
- `tests/centers.test.ts`: respostas HTTP, validação antes da persistência, autenticação, autorização por responsável, recursos inexistentes e falhas do repositório.
- `tests/centers.validation.test.ts`: identificadores, filtros, campos obrigatórios e limites, CEP, coordenadas, serviços, horários, duplicidades e seleção de materiais.
- `tests/materials.test.ts`: consulta pública do catálogo, ausência de autenticação, lista vazia e resposta segura em falha.
- `tests/materials.repository.test.ts`: consulta apenas de materiais ativos, ordenação, mapeamento de campos e falhas de persistência.

A cobertura foi medida com `npm run test:coverage`, incluindo a suíte de integração com MySQL real. O resultado superou a meta mínima de 70% estabelecida no RNF-07.

**Validação local com Node.js `v24.22.2`:** `npm run typecheck` e `npm run build` terminaram sem erros. `npm test` aprovou 166 testes em 7 suítes, com 1 suíte de integração ignorada na execução comum. `npm run test:coverage` executou também a integração MySQL e aprovou 167 testes em 8 suítes. A cobertura registrada foi de 91,74% de instruções, 85,03% de ramificações, 92,75% de funções e 93,8% de linhas.
Também foi acrescentada a suíte `tests/auth.repository.test.ts`, que cobre criação de usuários, e-mail duplicado, consulta por e-mail, conversão do estado ativo, consulta por identificador e erros de persistência. Ela complementa os testes de centros e materiais para que o relatório de cobertura represente as camadas de persistência.

## Autenticação e controle básico de acesso — implementação e validação concluídas em 31/10/2026

A autenticação do responsável está implementada no módulo `backend/src/auth/`: cadastro, login, hash de senha com bcrypt, emissão e validação de JWT Bearer, consulta de identidade autenticada e verificação de conta ativa. O segredo JWT é obtido de `AUTH_JWT_SECRET`, fornecido pelo ambiente e não versionado.

As rotas de escrita de centros exigem identidade autenticada. O identificador do responsável é obtido do token validado; o repositório restringe atualização e desativação ao centro cujo `responsible_user_id` corresponde ao usuário autenticado. Tentativas de acesso de outro responsável são tratadas como recurso não encontrado.

A validação em execução no Docker confirmou cadastro HTTP 201, login HTTP 200, consulta autenticada de `/auth/me` HTTP 200, bloqueio de escrita sem token HTTP 401 e rejeição de corpo inválido após autenticação HTTP 400. Os testes automatizados cobrem também hash de senha, e-mail duplicado, credenciais inválidas com resposta genérica, token inválido, bloqueio sem identidade e acesso de outro responsável. A integração MySQL exercita responsável inativo e restrições de propriedade do centro.

A tarefa corresponde ao RF-06 e aos controles previstos no RNF-03. A autenticação e o controle básico de acesso estão implementados e validados; não é necessária uma segunda implementação.
