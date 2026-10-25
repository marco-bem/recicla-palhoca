# Texto para incorporar ao relatório final — seção 5.1.1

## 5.1.1 Elaboração da Aplicação Mobile

### 5.1.1.1 Levantamento e especificação dos requisitos

Antes da implementação, foram detalhados os requisitos funcionais e não funcionais do Recicla Palhoça, transformando o escopo da Etapa 1 em comportamentos verificáveis. A especificação orienta a modelagem do banco de dados, a definição dos endpoints da API, a construção das telas mobile e os testes automatizados. Os requisitos foram identificados por códigos para manter a rastreabilidade entre necessidade, implementação e validação.

Foram definidos três elementos participantes: cidadão, responsável pelo centro de reciclagem e sistema/API. A API valida dados, aplica regras de acesso, calcula proximidade e controla estados das solicitações. A consulta pública não exige autenticação; a gestão do perfil do centro e dos pedidos recebidos exige acesso autenticado.

### 5.1.1.2 Requisitos funcionais

Os requisitos funcionais foram organizados em quatro grupos, totalizando 14 requisitos (RF-01 a RF-14).

| Grupo | Requisitos | Comportamento previsto |
|---|---|---|
| Consulta pública | RF-01 a RF-05 | Listar centros ativos, pesquisar/filtrar por nome, bairro, material e coleta; definir referência; ordenar por proximidade; consultar detalhes e serviços. |
| Gestão do centro | RF-06 a RF-08 | Criar conta, autenticar responsável, manter apenas o próprio perfil, materiais aceitos, horários e serviços. |
| Solicitações | RF-09 a RF-13 | Criar pedido para centro ativo que oferece coleta; gerar protocolo; consultar status por protocolo/telefone; gerir pedidos e estados com autorização. |
| Estados da interface | RF-14 | Apresentar carregamento, ausência de resultados e erros com mensagens claras e nova tentativa quando apropriado. |

A localização poderá ser definida pela posição atual do dispositivo, mediante permissão, ou por endereço/CEP informado. Quando existirem coordenadas válidas, a ordenação será feita pela distância em linha reta. A interface deverá indicar que essa medida é aproximada, sem apresentá-la como distância rodoviária ou tempo de deslocamento.

O recebimento de materiais no local será representado separadamente da oferta de coleta. Não será permitido criar uma solicitação de coleta para centro inativo ou que não ofereça esse serviço.

### 5.1.1.3 Regras de negócio das solicitações

A solicitação deverá conter centro de destino, nome e telefone do solicitante, endereço de coleta e ao menos um material. Data/período preferenciais e observações são opcionais; uma preferência não equivale a agendamento confirmado. Ao persistir o pedido, o sistema gerará protocolo único e iniciará o estado `PENDENTE`.

A máquina de estados prevista para o MVP é:

| Estado atual | Próximo estado permitido | Responsável |
|---|---|---|
| Criação do pedido | `PENDENTE` | Sistema |
| `PENDENTE` | `ACEITA` | Centro destinatário |
| `PENDENTE` | `RECUSADA` | Centro destinatário, com justificativa |
| `ACEITA` | `CONCLUÍDA` | Centro destinatário |
| `RECUSADA` | Nenhum | Estado final no MVP |
| `CONCLUÍDA` | Nenhum | Estado final no MVP |

As transições serão validadas na API, independentemente dos controles da interface. Cada centro poderá consultar e alterar somente o próprio perfil e os pedidos que lhe pertencem. A consulta pública não retornará dados pessoais dos solicitantes; para acompanhar um pedido, o cidadão informará protocolo e telefone da solicitação. Cancelamento pelo cidadão, reabertura, notificações push e integração municipal permanecem fora do MVP.

### 5.1.1.4 Requisitos não funcionais

Foram definidos nove requisitos não funcionais (RNF-01 a RNF-09), relacionados à adaptação da interface, validação, segurança, privacidade, tratamento de erros, reprodutibilidade, testes, documentação e integridade dos dados.

| ID | Requisito | Critério de verificação |
|---|---|---|
| RNF-01 | Interface adaptável | Verificar telas em 360 dp e viewport de 390 × 844, sem sobreposição ou corte essencial. |
| RNF-02 | Validação no servidor | Enviar entradas inválidas diretamente à API e verificar rejeição sem persistência. |
| RNF-03 | Autenticação/autorização | Testar acessos sem/ com credenciais inválidas e tentativas de acessar dados de outro centro; armazenar senha com hash. |
| RNF-04 | Proteção de dados pessoais | Confirmar que consultas públicas não expõem nome, telefone ou endereço privado do solicitante. |
| RNF-05 | Tratamento de erros | Verificar respostas consistentes sem exposição de stack traces ou segredos. |
| RNF-06 | Reprodutibilidade | Seguir o README para iniciar serviços e testes em ambiente compatível. |
| RNF-07 | Testabilidade | Executar testes por camada e medir a cobertura da lógica de negócio; meta planejada de 70%. |
| RNF-08 | Documentação de API | Conferir contrato OpenAPI/Swagger contra os endpoints implementados. |
| RNF-09 | Integridade | Testar unicidade, relacionamentos, transições válidas e preservação de histórico ao desativar centros. |

### 5.1.1.5 Critérios de aceitação e rastreabilidade

Foram especificados 14 casos prioritários de aceitação (CA-01 a CA-14), abrangendo consulta pública, filtros combinados, alternativa manual quando GPS é negado, ordenação por distâncias conhecidas, detalhes dos serviços, e-mail duplicado, autorização por centro, criação/rejeição de pedidos, consulta privada por protocolo/telefone, transições de estado, ausência de resultados e reprodução do ambiente.

Cada caso será convertido em teste unitário, HTTP ou mobile conforme a responsabilidade de cada camada. Os resultados, a cobertura observada e as falhas corrigidas deverão ser registrados durante a execução. Os critérios planejados não devem ser tratados como resultados de teste já obtidos.

A especificação completa, com os requisitos RF-01 a RF-14, RNF-01 a RNF-09, regras de negócio e casos de aceitação, está mantida em `docs/requisitos-e-criterios-aceitacao.md`. Esse artefato deve ser atualizado quando decisões do produto mudarem, mantendo a rastreabilidade entre requisitos, código, testes e relatório.

### 5.1.1.6 Modelagem e validação do banco de dados

Com base nos requisitos definidos, foi elaborado um modelo relacional em MySQL composto por oito tabelas: usuários responsáveis, centros de reciclagem, horários de atendimento, catálogo de materiais, associação centro-material, solicitações de coleta, materiais das solicitações e histórico de status. Para o MVP, cada responsável pode administrar no máximo um centro; essa regra é sustentada por chave estrangeira e restrição de unicidade.

O ambiente foi configurado com Docker Compose e MySQL 8.4, com administração pelo MySQL Workbench. A execução do esquema criou as oito tabelas e a inspeção dos metadados confirmou as chaves estrangeiras, restrições de integridade e índices definidos. Dois testes transacionais com dados sintéticos validaram os relacionamentos e a preservação de uma solicitação e seus eventos de histórico após a desativação lógica do centro e do material. Em ambos os testes, o `ROLLBACK` foi confirmado e nenhuma linha de teste permaneceu no banco.

O modelo, o DDL e os scripts de verificação estão versionados no repositório do projeto: [modelo de dados](https://github.com/marco-bem/recicla-palhoca/blob/main/docs/modelo-dados.md), [esquema SQL](https://github.com/marco-bem/recicla-palhoca/blob/main/backend/database/schema.sql), [teste estrutural e transacional](https://github.com/marco-bem/recicla-palhoca/blob/main/backend/database/verify-schema.sql) e [teste de preservação do histórico](https://github.com/marco-bem/recicla-palhoca/blob/main/backend/database/verify-history-preservation.sql). Os testes utilizaram somente dados sintéticos.

> **Nota editorial:** substituir “Quadro X” pela numeração definitiva quando as tabelas forem incorporadas ao relatório; atualizar o sumário automático e a lista de quadros, se houver.
