# Evidências da Sprint 5

## [E2] Implementar formulário de solicitação de coleta

O cidadão acessa o formulário a partir de um centro ativo que oferece coleta, seleciona materiais aceitos pelo centro e envia o pedido sem criar conta. A tela usa o frame [Solicitar coleta](https://www.figma.com/design/86gOPT9bakn1ty0RDm1Ho0/ReciclaPalho%C3%A7a?node-id=2046-98) como referência, com nome, telefone e endereço estruturado conforme RF-09 e o modelo de dados.

A API grava a solicitação, os materiais e o evento inicial na mesma transação, usando o esquema existente. O aplicativo mostra o protocolo após HTTP 201 e informa que o pedido aguarda análise.

### Validação

- Backend, Node.js 24.22.2: TypeScript e compilação aprovados. Jest com Supertest aprovou cinco testes de contrato com repositório simulado, incluindo criação, conflitos, dados incompletos e erro de persistência.
- Mobile: TypeScript e lint aprovados.
- Expo Web em Chromium: a ação ficou oculta com uma resposta simulada de centro sem coleta. Uma falha simulada no envio preservou os campos e a seleção.
- Integração Expo Web, API local e MySQL 8.4: um envio sintético retornou HTTP 201. O protocolo exibido correspondeu ao registro no banco. A solicitação, o material associado e o evento inicial `PENDENTE` foram confirmados no MySQL. Os registros sintéticos foram removidos ao final.
- Inspeção visual em 390 px: conferidos campos, seleção de materiais e feedback de falha, com verificação de ausência de overflow horizontal.

### Preenchimento do endereço por CEP

O formulário exige oito dígitos no CEP e consulta a BrasilAPI para preencher logradouro, bairro, município e UF. Campos ausentes na resposta podem ser informados manualmente.

- Expo Web em Chromium, com resposta simulada: CEP incompleto bloqueou o envio, CEP encontrado preencheu os quatro campos e CEP não encontrado permitiu edição manual. Nenhuma solicitação foi gravada neste teste.
- Consulta HTTP à BrasilAPI para um CEP público: a resposta trouxe os quatro campos e permitiu acesso entre origens.
- TypeScript e lint mobile aprovados.

A data preferencial usa o seletor do navegador no Expo Web e o seletor do Expo UI nas plataformas nativas. O campo mostra dia, mês e ano e permite limpar a data. No Chromium, foram verificados o controle de data, a exibição em `DD/MM/AAAA`, o valor ISO e a limpeza. TypeScript e lint mobile passaram. A execução do seletor nativo em dispositivo permanece pendente.

A versão revisada apresenta um ícone no seletor de data e dispensa o ícone de informação no box de disponibilidade de coleta. TypeScript e lint passaram após os ajustes. O usuário aprovou a tela e o fluxo no Expo Web.

## Validações da solicitação

O formulário mostra mensagens junto aos campos obrigatórios inválidos e à seleção de materiais. A API aceita CEP com oito dígitos ou com hífen após o quinto dígito. Data, período e observações são opcionais.

- Jest e Supertest aprovaram 19 testes do endpoint, incluindo entradas inválidas, materiais duplicados, data impossível e limites de texto. TypeScript e compilação do backend passaram, assim como TypeScript e lint do mobile.
- No Expo Web, as mensagens apareceram antes do envio de um formulário inválido. A falha simulada de envio preservou os dados.
- Na integração com MySQL, o formulário corrigido retornou HTTP 201 e exibiu o protocolo do pedido `PENDENTE`. Um pedido para centro ativo sem coleta retornou HTTP 409 e não gerou registro. Os dados sintéticos foram removidos.

## Status e acompanhamento da solicitação

O cidadão consulta o estado do pedido usando protocolo e telefone. A confirmação preenche o protocolo e a tela inicial oferece acesso direto à consulta. A API retorna protocolo, estado, nome do centro, materiais e preferências de data e período. Combinações sem correspondência recebem a mesma resposta. O contrato consta no OpenAPI do Swagger.

- Jest e Supertest aprovaram 22 testes da suíte de solicitações, incluindo normalização, consulta válida, resposta uniforme e rejeição de protocolo inválido. A compilação do backend, o TypeScript e o lint do aplicativo passaram.
- No Expo Web com MySQL, foram confirmados os dois acessos, o preenchimento do protocolo, a resposta HTTP 404 com telefone incorreto e a exibição de `PENDENTE` com telefone correto. Os registros sintéticos foram removidos.

- O box de status foi conferido no Expo Web com o pedido sintético no MySQL para centro, materiais e preferências ausentes. A exibição de data e período preenchidos foi conferida com resposta controlada.

- Novos pedidos recebem protocolo curto e não sequencial no formato `RC-XXXXXXXXXXXX`. A suíte da API aprovou 23 testes. A criação e a consulta do código curto foram verificadas no Expo Web com MySQL, e a consulta do UUID anterior foi confirmada na API local.

- O protocolo novo passou a ter sete caracteres, com prefixo `RC-` e quatro caracteres aleatórios. A confirmação informa que a consulta exige o protocolo e o telefone. A suíte da API aprovou 24 testes e a integração Expo Web com MySQL confirmou a geração, a mensagem e a consulta do novo formato.

- O formato de emissão foi atualizado para oito caracteres sem hífen, com prefixo `RC`. A suíte da API aprovou 25 testes e a integração Expo Web com MySQL confirmou a emissão e a consulta. O Swagger descreve o novo formato.

## Visualização das solicitações pelo centro

A área do centro usa o login existente e apresenta painel, listagem com filtros e detalhe. O responsável pode aceitar, recusar com justificativa e concluir pedidos de seu centro. A alteração e o evento de histórico são gravados em uma transação. As três rotas constam no OpenAPI.

- A compilação do backend, o TypeScript e o lint do mobile passaram. O OpenAPI foi carregado com as três rotas.
- A integração HTTP com MySQL confirmou HTTP 401 sem autenticação ou com JWT inválido, HTTP 404 em leitura e alteração por outro centro, isolamento na listagem, filtros, justificativa obrigatória e rejeição de transições inválidas com HTTP 409.
- No Expo Web, a resposta do login foi simulada com JWT válido. Foram verificados painel, lista, detalhe, aceitação e conclusão. A consulta pública refletiu as mudanças. O histórico registrou os estados, o responsável e a justificativa da recusa. Os pedidos sintéticos foram removidos.

## Teste do fluxo completo de solicitação de coleta

A execução integrada usou Chromium, Expo Web, API local e MySQL. Duas contas sintéticas foram cadastradas pela API e vinculadas a centros de teste. O responsável entrou pela tela do aplicativo e recebeu HTTP 200 da rota real de login.

| Critério | Evidência verificada |
|---|---|
| CA-08 | O formulário criou dois pedidos com HTTP 201, protocolos distintos de oito caracteres e estado inicial `PENDENTE`. |
| CA-09 | Um pedido para um centro ativo sem coleta recebeu HTTP 409 e não gerou registro no MySQL. |
| CA-10 | O cidadão consultou o pedido na tela e viu `PENDENTE`, `ACEITA` e `CONCLUIDA` após as ações do responsável. |
| CA-11 | A consulta com telefone incorreto exibiu mensagem genérica e não mostrou o estado do pedido. |
| CA-12 | A API rejeitou a reabertura de pedido recusado com HTTP 409. O filtro por recusadas retornou o pedido nesse estado. |

A API rejeitou leitura e alteração por outro centro, bem como tentativas sem autenticação ou com token inválido. A recusa sem justificativa foi rejeitada. O MySQL registrou as transições, o responsável e a justificativa da recusa. Os registros sintéticos criados nessa execução foram removidos.

## Revisão do protótipo antes da Sprint 6

Comparação dos 16 frames do [protótipo oficial no Figma](https://www.figma.com/design/86gOPT9bakn1ty0RDm1Ho0/ReciclaPalho%C3%A7a?node-id=2025-2) com a aplicação Expo e os requisitos vigentes.

| Frames | Ajustes e decisões |
|---|---|
| 01 — Início | Acesso **Sou centro** no cabeçalho e navegação inferior com Início, Centros e Pedidos. |
| 02 — Localização | Painel de GPS com ícone e ação destacada. Busca por CEP mantida. |
| 03 — Centros | Cartões e filtros alinhados. Busca, alternância Lista/Mapa e dados retornados pela API preservados. |
| 04 — Detalhes do centro | Composição e materiais alinhados. A ação de solicitar coleta depende do serviço oferecido pelo centro. |
| 05 — Solicitar coleta | Seleção de materiais por chips e preferências de data e período lado a lado quando há espaço. Mantidos campos obrigatórios, preenchimento por CEP e calendário. |
| 06 — Confirmação | Protocolo, status inicial, orientação explícita sobre a consulta e acesso ao acompanhamento. |
| 07–08 — Pedidos e acompanhamento | A aba abre a consulta individual aprovada pelo usuário. O resultado mostra linha do tempo, centro, materiais, preferências e endereço completo após correspondência de protocolo e telefone. |
| 09–10 — Login e cadastro | Entradas alinhadas ao protótipo e cadastro do responsável com confirmação de senha. O aceite de termos depende de definição futura do texto. |
| 11–12 — Meu centro e painel | Formulário autenticado de cadastro e edição, painel com contagens e navegação interna. Coordenadas, materiais, serviços e horários atendem ao contrato da API. |
| 13–14 — Solicitações e detalhe | Filtros por status, detalhe e ações do responsável com o controle de acesso existente. |
| 15–16 — Aceite e recusa | Confirmações específicas. O texto informa que o cidadão pode ver o status no acompanhamento. |

O Swagger documenta a consulta autenticada do próprio centro em `GET /centers/me` e o endereço retornado no sucesso da consulta pública de solicitação. As consultas públicas usam registros da API. Os dados de exemplo do Figma são referências visuais.

- Jest/Supertest: 34 testes das suítes de centros e autenticação e 25 da suíte de solicitações aprovados. Compilação do backend, TypeScript e lint mobile passaram.
- Playwright: três cenários aprovados, com verificações das quatro rotas públicas em 360 × 740 e 390 × 844 e interação com busca, filtros e navegação.
- Chromium, Expo Web, API e MySQL: cadastro do responsável, criação, consulta, edição e desativação do centro, criação dos pedidos, consulta por par inválido e válido, nova consulta e confirmações de aceite e recusa. A desativação preservou os pedidos. Apenas a resposta externa de CEP foi simulada nessa execução. Registros sintéticos removidos.
- A execução em dispositivo ou emulador Android segue pendente.
