# Recicla Palhoça — Requisitos e critérios de aceitação

**Etapa:** 2 — Sprint 2  
**Versão:** 1.0 — baseline inicial para implementação  
**Data de planejamento:** 26–27 de outubro de 2026  
**Status:** especificação inicial; os requisitos ainda precisam ser revisados e aceitos como baseline.

## 1. Objetivo

Definir comportamentos verificáveis para orientar a modelagem do banco, os endpoints da API, as telas mobile, os testes automatizados e a validação do MVP. O Recicla Palhoça deve facilitar a busca por centros de reciclagem, a consulta de materiais e serviços, a ordenação por proximidade e o registro/acompanhamento de solicitações de coleta quando o serviço estiver disponível.

## 2. Escopo e decisões de produto

1. A consulta pública de centros e materiais não exige conta de cidadão.
2. A gestão do perfil de um centro e o acesso aos pedidos recebidos exigem autenticação do responsável.
3. Para solicitar coleta, o cidadão fornece nome, telefone e endereço de coleta. A consulta posterior usa protocolo e telefone; não há conta de cidadão no MVP.
4. A localização pode vir do dispositivo, mediante permissão, ou de endereço/CEP informado manualmente.
5. A proximidade é distância geográfica em linha reta entre coordenadas, não distância por ruas ou tempo de viagem.
6. Os materiais vêm de catálogo inicial controlado; o responsável seleciona materiais aceitos.
7. O responsável cadastra o perfil e a localização do centro. A verificação institucional externa fica fora do MVP.
8. Só pode haver solicitação para centro ativo que declare oferecer coleta. Data/período são preferências, não agendamento confirmado.
9. Estados da solicitação: `PENDENTE`, `ACEITA`, `RECUSADA` e `CONCLUÍDA`.
10. Fora do MVP: integração municipal/consórcio, otimização de rotas, pagamentos, marketplace, push, publicação nas lojas e métricas ambientais municipais.

## 3. Atores

| ID | Ator | Responsabilidades |
|---|---|---|
| A-01 | Cidadão | Consultar centros, definir referência geográfica, verificar serviços, solicitar coleta e consultar o próprio pedido por protocolo/telefone. |
| A-02 | Responsável pelo centro | Autenticar-se, gerir apenas o próprio perfil, informar materiais/serviços e tratar pedidos recebidos. |
| A-03 | Sistema/API | Validar entrada, controlar autorização, calcular proximidade, gerar protocolos e aplicar transições de estado. |

Não há papel administrativo municipal no MVP. Um centro não pode consultar ou alterar dados privados de outro.

## 4. Requisitos funcionais

### RF-01 — Consultar centros
Listar centros ativos e publicáveis sem exigir login do cidadão. Centros inativos não aparecem. Sem resultados, exibir estado vazio; não apresentar dados fictícios como reais.

### RF-02 — Pesquisar e filtrar
Permitir busca por nome/bairro e filtros por material e disponibilidade de coleta. Filtros combinados devem ser aplicados simultaneamente. Sem correspondências, informar e permitir limpar filtros.

### RF-03 — Definir localização
Oferecer localização do dispositivo mediante permissão ou busca por endereço/CEP. Negar GPS não pode bloquear consulta manual. Endereço não localizado deve gerar mensagem de correção e não simular sucesso.

### RF-04 — Ordenar por proximidade
Com coordenadas válidas, ordenar pela distância em linha reta, da menor para a maior. Exibir quilômetros, arredondados a uma casa decimal, indicar que é aproximada e usar nome como desempate após arredondamento.

### RF-05 — Consultar detalhes do centro
Exibir nome, endereço, localização quando disponível, contato público, horários, materiais e serviços. Não inventar informações ausentes. Só disponibilizar “Solicitar coleta” para centro ativo que ofereça esse serviço.

### RF-06 — Conta e autenticação do responsável
Validar e-mail e campos obrigatórios; exigir senha mínima de 10 caracteres; impedir e-mail duplicado; negar credenciais inválidas sem revelar existência de conta. Senhas são armazenadas com hash apropriado, nunca em texto puro.

### RF-07 — Manter perfil do centro
Permitir criar, consultar, editar e desativar o próprio perfil. Exigir nome, endereço, coordenadas, telefone, horário, serviços e materiais. Impedir acesso cruzado entre centros. Desativação tira o centro da busca e preserva histórico de pedidos.

### RF-08 — Materiais e serviços
Permitir selecionar materiais do catálogo e indicar separadamente recebimento no local e coleta. Não duplicar associação de material. Se o centro não oferece coleta, pedido de coleta deve ser bloqueado na interface e na API.

### RF-09 — Solicitar coleta
Exigir centro, nome, telefone, endereço de coleta e ao menos um material. Data/período e observações (até 500 caracteres) são opcionais. Rejeitar pedidos para centro inativo/sem coleta e não confirmar sucesso quando houver falha.

### RF-10 — Protocolo e confirmação
Gerar identificador único e não sequencial para pedido persistido, com estado inicial `PENDENTE`. Exibir protocolo e informar que aguarda análise. Nunca exibir confirmação se a gravação falhar.

### RF-11 — Consultar status do pedido
Permitir consulta por protocolo e telefone correspondentes. Dados incorretos devem gerar mensagem genérica sem expor outro pedido. Não listar pedidos globalmente. Status será atualizado ao consultar novamente; push está fora do MVP.

### RF-12 — Pedidos recebidos pelo centro
O responsável visualiza pedidos exclusivamente de seu centro, com protocolo, data, materiais, endereço necessário à operação e estado; pode filtrar por estado. Proteger dados pessoais e acesso a pedidos de outros centros.

### RF-13 — Atualizar estado
Apenas o centro destinatário pode mudar `PENDENTE` para `ACEITA` ou `RECUSADA`; recusa exige justificativa. Só `ACEITA` pode avançar para `CONCLUÍDA`. Estados finais não podem ser reabertos no MVP. A API deve rejeitar transições inválidas.

### RF-14 — Estados de interface
Exibir carregamento, estados vazios e erros em linguagem clara. Permitir nova tentativa quando seguro. Nunca mostrar ao cidadão stack trace, SQL, token ou credencial.

## 5. Regras de negócio

- **RB-01 — Publicação:** somente centro ativo, com perfil válido e coordenadas, pode aparecer em consulta pública.
- **RB-02 — Serviços distintos:** recebimento no local não significa oferecer coleta; representar ambos em separado.
- **RB-03 — Coleta disponível:** pedido só pode ser criado se o centro estiver ativo e oferecer coleta; isso não garante data agendada.
- **RB-04 — Autorização:** a API verifica propriedade do perfil e pedido, não apenas a interface.
- **RB-05 — Transições:** criação → `PENDENTE`; `PENDENTE` → `ACEITA` ou `RECUSADA`; `ACEITA` → `CONCLUÍDA`; `RECUSADA` e `CONCLUÍDA` são estados finais.
- **RB-06 — Distância:** cálculo em linha reta, não rodoviário.
- **RB-07 — Dados demonstrativos:** exemplos devem ser identificados e não apresentados como estabelecimentos/serviços reais confirmados.

## 6. Requisitos não funcionais

| ID | Requisito | Verificação prevista |
|---|---|---|
| RNF-01 | Interface adaptável | Verificar telas em 360 dp e viewport de referência 390 × 844, sem sobreposição/corte essencial. |
| RNF-02 | Validação no servidor | Entradas inválidas enviadas diretamente à API são rejeitadas e não persistem. |
| RNF-03 | Segurança | Testar sem credencial, credencial inválida e acesso a dados de outro centro; usar hash de senha e variáveis de ambiente para segredos. |
| RNF-04 | Privacidade | Listas públicas não expõem nome/telefone/endereço privado de solicitante; centro não destinatário não acessa pedido. |
| RNF-05 | Erros consistentes | Códigos e mensagens coerentes para validação, não encontrado, autenticação, autorização e dependências; sem segredos em respostas. |
| RNF-06 | Reprodutibilidade | README permite iniciar serviços e testes em ambiente compatível sem arquivos ou credenciais não documentados. |
| RNF-07 | Testabilidade | Jest, Supertest e ferramentas mobile conforme a camada; meta de pelo menos 70% de cobertura da lógica de negócio. |
| RNF-08 | Documentação API | OpenAPI/Swagger descreve endpoints implementados, parâmetros, respostas, erros e autenticação. |
| RNF-09 | Integridade | Proteger unicidade de e-mail/protocolo, relacionamentos e estados; desativar centro sem eliminar histórico. |

## 7. Casos de aceitação prioritários

| ID | Cenário | Resultado esperado |
|---|---|---|
| CA-01 | Consultar sem login | Listar centros ativos sem dados pessoais privados. |
| CA-02 | Filtrar por material e coleta | Todos resultados correspondem a ambos filtros. |
| CA-03 | Negar GPS e informar CEP | Busca manual permanece disponível. |
| CA-04 | Ordenar coordenadas conhecidas | Distâncias e ordem correspondem ao cálculo linear. |
| CA-05 | Abrir centro que não faz coleta | Detalhes visíveis; ação de coleta indisponível. |
| CA-06 | Cadastrar e-mail duplicado | Cadastro rejeitado. |
| CA-07 | Responsável tenta alterar outro centro | API nega e dados permanecem inalterados. |
| CA-08 | Criar pedido válido | Protocolo único, estado `PENDENTE`. |
| CA-09 | Pedido para centro sem coleta | API rejeita e não persiste pedido. |
| CA-10 | Consultar com protocolo/telefone corretos | Status do pedido correspondente aparece. |
| CA-11 | Consultar com telefone incorreto | Negado sem revelar dados do pedido. |
| CA-12 | Transição `RECUSADA` → `ACEITA` | API rejeita e preserva estado. |
| CA-13 | Nenhum resultado | Estado vazio e ação para ajustar busca. |
| CA-14 | Seguir README | Serviços e testes podem ser executados no ambiente configurado. |

## 8. Rastreabilidade e evidências

| Requisitos | Entrega técnica | Evidência prevista |
|---|---|---|
| RF-01 a RF-05 | Consulta, filtros, localização, proximidade e detalhes | Capturas, dados de teste e cenários de distância. |
| RF-06 a RF-08 | Conta do centro e perfil/materiais | Fluxo de autenticação, modelo de dados e testes de autorização. |
| RF-09 a RF-13 | Solicitações e estados | Testes de API, telas de confirmação/status e histórico de transições. |
| RF-14 | Estados da interface | Capturas e testes de vazio/falha. |
| RNF-01 a RNF-09 | Segurança, adaptação, ambiente, teste e documentação | Testes, cobertura, README, OpenAPI e logs sem dados pessoais. |

Os critérios descritos são planejados e não representam testes já executados. Atualizar esta especificação se decisões de produto mudarem.

## 9. Pontos a verificar no protótipo antes de implementar

1. A tela “Definir localização” contempla GPS e endereço/CEP; implementar tratamento de permissão negada e endereço não localizado.
2. Distâncias ilustrativas do Figma devem ser substituídas por cálculo real na aplicação.
3. “Minhas solicitações” não pode listar pedidos de todos os cidadãos; exigir consulta por protocolo e telefone, ou formalizar mudança de escopo.
4. Formulário de coleta deve incluir nome, telefone, endereço e pelo menos um material; data/período e observações são opcionais.
5. Área do centro deve exigir justificativa ao recusar um pedido.
6. Mapa do protótipo é esquemático e não comprova integração geográfica funcional.

## 10. Definição de concluído desta tarefa

- [ ] Requisitos revisados e aceitos como baseline do MVP.
- [ ] Decisões de produto refletidas no backlog e no protótipo.
- [ ] Máquina de estados e permissões definidas para orientar banco e API.
- [ ] Casos CA-01 a CA-14 preparados para conversão em testes executáveis.
- [ ] Especificação registrada no repositório Git.
