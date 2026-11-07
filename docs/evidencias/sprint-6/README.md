# Evidências da Sprint 6

## Testes integrados e de regressão

Validação executada em 07/11/2026 sobre a versão `af4149a`, com Node.js 24.22.2 no backend, Chromium no Expo Web e API e MySQL locais em Docker.

| Camada | Execução | Resultado |
|---|---|---|
| Backend | Jest e Supertest, `npm test` | 200 testes em oito suítes. A suíte de integração com MySQL é executada separadamente. |
| Persistência de centros | `npm run test:integration:centers` | Um teste aprovado com criação, leitura, atualização e desativação no MySQL. |
| HTTP de centros | `npm run test:integration:centers:http` | Catálogo, autenticação, cadastro, consulta, atualização, preservação de associações e desativação aprovados. |
| Mobile | Jest, `npm test -- --runInBand` | 30 testes em seis suítes aprovados na execução isolada. |
| Expo Web | Playwright, `npm run test:e2e -- --reporter=list` e execução focada dos cenários restantes | Os 14 cenários existentes foram aprovados em duas rodadas, com respostas controladas da API de centros. A suíte cobre responsividade, navegação, filtros, busca, estados de consulta e mapa. |

O primeiro Jest mobile atingiu o limite de cinco segundos em um teste de tipografia durante a execução simultânea das suítes. A execução isolada aprovou os 30 testes. O primeiro Playwright foi interrompido após nove aprovações. Em nova tentativa, o Expo deixou de responder. Com o servidor Expo executado separadamente, os cinco cenários restantes passaram, incluindo a renderização do MapLibre e a abertura dos detalhes pelo marcador.

### Fluxo integrado de coleta

O cenário em Chromium usou API e MySQL locais. O serviço externo de CEP foi simulado. Foram criados dois centros sintéticos com responsáveis distintos, um com coleta e outro apenas com entrega presencial.

| Verificação | Resultado |
|---|---|
| Consulta pública | Os dois centros apareceram na lista sem login. O centro sem coleta abriu os detalhes sem oferecer a ação de solicitar coleta, conforme CA-01 e CA-05. |
| Envio da solicitação | A API retornou HTTP 201 e o aplicativo exibiu o protocolo de oito caracteres. O estado inicial foi `PENDENTE`, conforme CA-08. |
| Consulta do cidadão | O par correto exibiu endereço e estado. O telefone incorreto retornou HTTP 404, com mensagem genérica e sem dados do pedido, conforme CA-10 e CA-11. |
| Isolamento entre centros | O segundo responsável não recebeu o pedido na listagem e obteve HTTP 404 ao tentar consultá-lo ou alterá-lo. Sem autenticação, a consulta da área do centro retornou HTTP 401. |
| Atendimento e persistência | Após login pelo aplicativo, o responsável aceitou e concluiu o pedido. O cidadão consultou os estados `PENDENTE`, `ACEITA` e `CONCLUIDA`. O MySQL registrou o estado final, a criação e as duas transições com a identificação do responsável. |

Os registros sintéticos foram removidos ao final. A execução foi concluída sem mudança de código. A validação em Android e a medição de cobertura da versão atual pertencem a cards próprios.

## Validação em emulador Android

APK de depuração gerado a partir do código da versão `af4149a`, com ABI `x86_64` e assinatura verificada pelo esquema APK v2. A execução usou o Android Emulator 37.2.13 com imagem Android 15 (API 35), KVM e renderização gráfica por software. O aplicativo recebeu o bundle pelo Metro e acessou a API local por `adb reverse`.

| Cenário | Resultado observado |
|---|---|
| Instalação e navegação | O APK instalou e abriu. A lista exibiu dados da API local e permitiu pesquisar o centro sintético. |
| Mapa | O MapLibre nativo carregou o estilo e os marcadores. Tocar em um marcador abriu os detalhes de um centro. [Mapa no Android](android/mapa-nativo.png). |
| Localização | Ao negar a permissão, o aplicativo apresentou a orientação e permitiu obter a referência por CEP. Após conceder a permissão, a posição em Palhoça foi obtida pelo provedor simulado do Android. |
| Coleta | O CEP preencheu o endereço, o calendário nativo exibiu a data selecionada em formato brasileiro no formulário e o envio gerou um protocolo. |
| Acompanhamento | O aplicativo consultou o protocolo com o telefone sintético e exibiu estado Pendente, endereço e data preferencial. A API confirmou os valores persistidos. [Acompanhamento no Android](android/acompanhamento-nativo.png). |

Na primeira tentativa de localização, o comando de GPS do emulador não forneceu posição ao aplicativo. A validação foi concluída com coordenadas injetadas pelos provedores de teste do Android. O APK de depuração exibiu um aviso de depreciação de `SafeAreaView`, sem impacto nos fluxos executados.

### Reteste no emulador Android com janela

O mesmo dispositivo virtual foi reaberto em uma janela gráfica no Zorin. Com os provedores de teste recebendo coordenadas em Palhoça, o botão **Usar localização atual** abriu **Centros próximos** e exibiu a referência de localização. O usuário confirmou o resultado no emulador.

### Safari no iPhone

O usuário testou o Expo Web no Safari de um iPhone 14 Plus com iOS 27.2. Confirmou a exibição do mapa com referência por CEP e, após acessar a versão por HTTPS na rede local e autorizar a geolocalização, confirmou a obtenção da posição do aparelho pelo botão **Usar localização atual**. A execução no Safari corresponde à versão Web do aplicativo.

Após a validação, foram removidos a conta, o centro e o pedido sintéticos. Os servidores temporários e o provedor simulado foram encerrados.

## Avaliação de usabilidade com potenciais usuários

### Sessão com uma participante

Registro baseado no relato do usuário que conduziu a sessão. Uma participante executou o roteiro do cidadão. As quatro tarefas foram concluídas conforme o relato.

| Tarefa | Resultado observado |
|---|---|
| 1. Encontrar um centro que aceite papel e identificar se oferece coleta | A participante pesquisou por papel, encontrou um centro que aceita o material e identificou a indicação **Coleta disponível**. |
| 2. Definir a localização por CEP e abrir um centro pelo mapa | Informou o CEP, abriu a visualização de mapa e acessou um centro pelo marcador. |
| 3. Solicitar coleta | Abriu os detalhes do centro, selecionou **Solicitar coleta**, preencheu o formulário e enviou a solicitação. |
| 4. Acompanhar a solicitação | Acessou **Solicitações** a partir de Início, informou protocolo e telefone, acionou **Consultar status** e visualizou o estado da coleta. |

O registro disponível corresponde a uma participante (n=1) e não representa uma amostra dos potenciais usuários. Não informa a duração, as intervenções do moderador, dificuldades observadas ou sugestões da participante; portanto, não se presume que a execução tenha ocorrido sem dificuldades. Em conversa anterior, foi relatada uma falha de consulta seguida de sucesso, mas não se confirmou se ocorreu nesta sessão, nem sua mensagem ou causa. Esse relato permanece sem atribuição à sessão.

O resultado deve ser apresentado como avaliação exploratória de uma participante. Caso ocorram outras sessões reais, seus registros poderão ser acrescentados separadamente; não se extrapolam os resultados atuais para um grupo maior.

## Falhas prioritárias e cobertura

A falha intermitente de consulta relatada anteriormente não se repetiu no Chromium com a exportação atual do Expo Web, API local e MySQL. O formulário criou uma solicitação sintética (HTTP 201). Pelo link da confirmação, o telefone incorreto retornou HTTP 404 sem dados e o par válido retornou HTTP 200 com estado e endereço. Pela aba Solicitações, a consulta e a nova consulta retornaram HTTP 200 com protocolo em minúsculas e telefone formatado. Os registros sintéticos foram removidos. A primeira tentativa usou a instância Expo já aberta na porta 8081, que ainda exibia a aba Pedidos. A confirmação final usou uma exportação nova em porta local temporária. A causa da ocorrência anterior segue indeterminada.

| Escopo Jest | Testes | Instruções | Ramificações | Funções | Linhas |
|---|---:|---:|---:|---:|---:|
| Backend, com integração MySQL | 201 em 9 suítes | 80,98% | 75,89% | 81,25% | 82,36% |
| Mobile, arquivos TypeScript de serviços e utilitários | 30 em 6 suítes | 42,42% | 52,33% | 38,70% | 44,53% |

O backend supera a meta de 70% do RNF-07 no escopo global coletado pelo Jest. O módulo de solicitações registra 47,36% de linhas, com lacunas na gestão e na persistência de pedidos. No mobile, o cliente HTTP ficou sem cobertura Jest. A cobertura reportada não incorpora as verificações pelo navegador e o recorte mobile não representa o aplicativo inteiro. Os relatórios foram gerados em diretórios temporários. A triagem não identificou uma correção de produto nem produziu um ciclo TDD para o item 5.1.4.
