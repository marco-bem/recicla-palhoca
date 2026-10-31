# Texto para incorporar ao relatório final — seção 5.1.2

## 5.1.2 Elaboração dos Testes

Os testes automatizados da API foram implementados com Jest e Supertest. Na validação da API de materiais, a verificação de tipos terminou sem erros e a suíte geral aprovou 25 testes em quatro suítes. O teste de integração executado com a API no Docker e o MySQL real confirmou que o catálogo público retorna os materiais ativos em ordem alfabética e que a associação de materiais a um centro é atualizada corretamente. A substituição de um material preservou o vínculo anterior como não aceito, sem excluir seu registro. O fluxo também confirmou as consultas do centro, sua desativação lógica e a remoção dos dados sintéticos utilizados no teste.
