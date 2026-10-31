# Texto para incorporar ao relatório final — seção 5.1.3

## 5.1.3 Validação do Projeto

A validação integrada da API de centros foi realizada no ambiente Docker, com conexão ao MySQL e autenticação por token Bearer. O teste automatizado executou o cadastro de um responsável, o cadastro e a consulta pública de um centro, a atualização dos dados e horários e sua desativação lógica. Todas as respostas apresentaram os códigos HTTP esperados: 201 para os cadastros, 200 para consultas e atualização, 204 para desativação e 404 para a consulta do centro após sua desativação. Também foi confirmado que o centro deixou de aparecer na listagem pública. Ao final, os dados sintéticos de teste foram removidos do banco. O resultado demonstra o funcionamento integrado das rotas, da autenticação e da persistência no MySQL para esse fluxo.

