# Sistema de Permutas

Sistema web desenvolvido para auxiliar o controle e a solicitação de permutas de serviço no âmbito do 1º GBM.

## Sobre o projeto

O Sistema de Permutas permite que o militar solicite uma permuta diretamente pelo celular, informando:

* e-mail do responsável pela permuta;
* data do serviço;
* RG do militar que entra;
* RG do militar que sai;
* observações adicionais, quando necessário.

O sistema realiza a identificação automática dos militares pelo RG, registra a solicitação em uma planilha de controle e envia e-mails automáticos de confirmação.

Também permite consultar permutas futuras por RG e informa quando uma solicitação está fora do prazo regulamentar de 48 horas de antecedência.

## Funcionalidades

* interface responsiva para uso em celular;
* consulta automática de militares pelo RG;
* validação do e-mail do responsável pela permuta;
* registro direto em planilha Google Sheets;
* envio automático de e-mails de confirmação de recebimento;
* aviso visual para solicitações fora do prazo de 48 horas;
* aviso no e-mail quando a solicitação estiver fora do prazo;
* envio de resultado de permuta autorizada ou cancelada;
* consulta de permutas futuras por RG;
* controle de processamento das solicitações;
* organização e formatação automática da planilha;
* destaque visual na planilha para solicitações fora do prazo.

## Estrutura do projeto

```text
index.html  → estrutura da página
style.css   → aparência visual do sistema
script.js   → funcionamento da interface e comunicação com o Apps Script
brasao.png  → imagem utilizada no cabeçalho
