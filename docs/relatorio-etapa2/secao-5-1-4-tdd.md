# Texto para incorporar ao relatório final — seção 5.1.4

## 5.1.4 Ciclo de Desenvolvimento e Validação com TDD

O ajuste dos créditos cartográficos no mapa da versão Web ilustra o uso de um teste automatizado para especificar o comportamento esperado antes da correção final. Os créditos deveriam permanecer recolhidos após o carregamento do mapa e ser exibidos ao acionar o ícone de informação. Esse comportamento preserva o acesso à atribuição das fontes cartográficas e mantém o espaço disponível para a visualização do mapa.

Antes da correção final, o cenário Playwright foi atualizado para verificar se o ícone estava visível e os créditos estavam recolhidos. O teste também conferia se, após o clique, apareciam as atribuições do OpenFreeMap, do OpenMapTiles e do OpenStreetMap. A correção passou a recolher o controle de atribuição do MapLibre após o carregamento do estilo cartográfico, mantendo o ícone disponível para consulta.

Na execução posterior à correção, o cenário foi aprovado. Além da abertura dos créditos, o teste confirmou que a seleção de um marcador continuava abrindo os detalhes do centro correspondente. A verificação permitiu confirmar o comportamento corrigido e a continuidade de uma interação existente no mapa.

O histórico do projeto registra a alteração do teste antes da correção final e sua aprovação posterior. O resultado de uma execução anterior à correção e uma etapa separada de refatoração não constam nas evidências disponíveis. Por isso, o caso é apresentado como uma correção orientada por teste com validação posterior, com alcance limitado a esse ajuste.

Para as demais funcionalidades, os registros permitem identificar os cenários verificados e os resultados das suítes, mas nem sempre mostram em que momento os testes foram escritos em relação à implementação. Os percentuais da seção 5.1.2 indicam quanto do código foi exercitado pelas suítes. Para avaliar a adoção de TDD ao longo do projeto, seriam necessários registros da ordem em que os testes e as implementações foram produzidos e dos resultados obtidos em cada etapa.
