# Capturas do aplicativo Expo — seção 5.1.1.9

Este pacote contém as capturas selecionadas para documentar as quatro telas funcionais do ReciclaPalhoça no Expo Web e a visualização Mapa.

## Arquivos e legendas

- `figura-16-home.png` — **Figura 16 – Tela inicial do aplicativo ReciclaPalhoça após a aplicação do design system.**
- `figura-17-centros-lista.png` — **Figura 17 – Consulta de centros de reciclagem na visualização Lista.**
- `figura-18-centros-mapa.png` — **Figura 18 – Consulta de centros de reciclagem na visualização Mapa.**
- `figura-19-definir-localizacao.png` — **Figura 19 – Definição da localização de referência no aplicativo.**
- `figura-20-detalhes-centro-demonstrativo.png` — **Figura 20 – Detalhes de um centro de reciclagem no aplicativo.**

Fonte sugerida para as capturas Expo: elaborado pelo autor (2026), a partir da aplicação em execução no Expo Web.

## Observações para uso acadêmico

1. As capturas de Início, Centros/Lista e Detalhes foram obtidas em uma execução de teste que intercepta a API com o fixture `Centro de Teste Playwright`. O nome, endereço, telefone, horário e materiais desse centro são dados sintéticos. As legendas devem informar que os dados são demonstrativos de teste. Não os apresentar como centro real.
2. A captura de Mapa foi enviada pelo autor e mostra a localização de referência com zero centros retornados pela API. Antes de incluí-la no relatório distribuído, confirmar que o marcador não expõe uma localização pessoal que o autor prefira manter privada.
3. Não usar `390x844-home-scroll-end.png`: ela contém um ícone flutuante preto de depuração. Não usar `390x844-detalhes-scroll-end.png` como imagem principal: é uma captura complementar de rolagem, sem o cabeçalho da tela.
4. As seis imagens do Figma permanecem na seção anterior, identificadas como protótipo. Estas cinco imagens são evidências separadas da aplicação em execução.

## Destino no repositório

O ZIP já contém os arquivos dentro de `docs/evidencias/aplicacao-expo/`. Na raiz do repositório, extraia com:

```bash
unzip capturas-expo-relatorio.zip -d .
```

Depois confira o `git status --short` e versione somente `docs/evidencias/aplicacao-expo/`.
