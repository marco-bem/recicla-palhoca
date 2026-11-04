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
