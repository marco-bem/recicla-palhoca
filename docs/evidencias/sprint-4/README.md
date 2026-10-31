# Evidências da Sprint 4

## Navegação e telas públicas de consulta — validação concluída em 31/10/2026

A aplicação mobile foi organizada para o fluxo público do cidadão, com navegação pelas abas **Início** e **Centros** e acesso à tela de definição de localização. A implementação utiliza Expo SDK 58, React Native, TypeScript e Expo Router, tomando o protótipo de média fidelidade da Sprint 1 como referência de fluxo e hierarquia de informações.

A tela inicial oferece busca por centro ou bairro, acesso à localização de referência, filtros rápidos por material e consulta aos centros retornados pela API. A tela **Centros** permite pesquisar por nome ou bairro, filtrar pelo material aceito e pela oferta de coleta, além de ordenar os resultados pela distância em linha reta quando há coordenadas de referência válidas. O aplicativo utiliza o catálogo real de materiais; não apresenta estabelecimentos fictícios como se fossem centros cadastrados.

As consultas utilizam os endpoints públicos:
- `GET /materials`: carrega o catálogo de materiais ativos para os filtros.
- `GET /centers`: consulta os centros públicos, aplicando os critérios de pesquisa e filtragem.
- A rota de detalhes `GET /centers/:id` permanece associada à atividade específica de implementação dos detalhes do centro e não é considerada critério de conclusão desta tarefa.

### Definição da localização de referência

Foram implementados e verificados dois caminhos:

- **GPS:** a aplicação solicita permissão de localização ao navegador/dispositivo, obtém latitude e longitude e realiza geocodificação reversa pelo Photon (Komoot), que utiliza dados do OpenStreetMap. Os campos de rua, número, bairro, município, estado e CEP são apresentados quando encontrados na base cartográfica.
- **CEP:** a aplicação consulta a BrasilAPI CEP v2. O retorno é mapeado para logradouro, bairro, município, UF, CEP e coordenadas. As coordenadas são utilizadas para ordenar os resultados; o endereço retornado é preservado e exibido no cartão de referência.

A referência selecionada é compartilhada entre as rotas da aplicação. O cartão da tela **Centros** exibe logradouro ou nome do local, bairro, município/UF e CEP, conforme a disponibilidade dos dados. Campos ausentes não são preenchidos por inferência. Quando o endereço do GPS não é encontrado, as coordenadas continuam válidas para cálculo da proximidade. A distância é calculada em linha reta pela fórmula de Haversine e não representa trajeto por ruas ou tempo de deslocamento.

### Integração web e CORS

O backend recebeu configuração CORS restrita às origens listadas em `APP_WEB_ORIGINS`. Na validação local, a origem `http://localhost:8081` recebeu `Access-Control-Allow-Origin`; a requisição preflight `OPTIONS` respondeu HTTP 204 e autorizou os métodos e cabeçalhos necessários (`GET`, `Authorization` e `Content-Type`). Os containers MySQL e API permaneceram saudáveis, e `GET /health` respondeu HTTP 200 com o banco conectado.

### Validação automatizada e manual

**Validação local informada em 31/10/2026:**
- `npx expo lint`: concluído sem erros ou avisos.
- `npx tsc --noEmit`: concluído sem erros.
- `npm test -- --runInBand`: 16 testes aprovados em 4 suítes.
- No Expo Web, a tela inicial e a navegação entre as abas **Início** e **Centros** foram abertas; a lista de centros apresentou o estado vazio da API, sem dados demonstrativos.
- A definição de localização por GPS e por CEP foi testada. O cartão exibiu o endereço da referência, incluindo logradouro, bairro, município/UF e CEP no retorno do CEP utilizado na verificação.

A consulta retornou zero centros públicos porque não havia centros cadastrados e publicáveis no banco durante a validação. Esse resultado corresponde ao estado vazio esperado e não representa falha de carregamento da tela.

### Limites e próxima atividade

O protótipo da Sprint 1 é de média fidelidade e foi usado como referência para a navegação e a organização das informações. A paleta, os espaçamentos e os componentes compartilhados atualmente implementados constituem uma base inicial, não o design system visual definitivo. A próxima atividade da Sprint 4 é **[E2] Definir e aplicar o design system visual definitivo**, que consolidará identidade visual, tokens, tipografia, componentes e variantes antes da evolução das demais telas.

**Arquivos principais:** `mobile/src/app/(tabs)/index.tsx`, `mobile/src/app/(tabs)/centers.tsx`, `mobile/src/app/location.tsx`, `mobile/src/contexts/location-reference-context.tsx`, `mobile/src/services/cep-lookup.ts`, `mobile/src/services/reverse-geocoding.ts`, `mobile/src/utils/distance.ts`, `backend/src/app.ts`.

**Capturas recomendadas para anexar como evidência visual:** tela inicial; lista de centros com estado vazio; cartão de referência preenchido por CEP; cartão de referência preenchido por GPS. Não incluir endereço pessoal completo em capturas compartilhadas fora do contexto acadêmico.
