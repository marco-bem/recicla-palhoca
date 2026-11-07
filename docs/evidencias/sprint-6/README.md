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
