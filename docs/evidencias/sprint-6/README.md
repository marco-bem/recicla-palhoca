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

### Safari no iPhone

A exportação Web foi disponibilizada em rede local para o teste complementar. O acesso à API e a abertura do detalhe com a ação de solicitar coleta foram confirmados pelo Chromium no computador. A verificação em Safari depende do retorno do usuário. O centro sintético foi mantido temporariamente para essa verificação.
