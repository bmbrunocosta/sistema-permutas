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

## Funcionalidades

* Interface responsiva para uso em celular;
* consulta automática de militares pelo RG;
* registro direto em planilha Google Sheets;
* envio automático de e-mails de confirmação;
* envio de resultado de permuta autorizada ou cancelada;
* consulta de permutas futuras por RG;
* aviso visual para solicitações fora do prazo de 48 horas;
* controle de processamento das solicitações.

## Estrutura do projeto

```text
index.html  → estrutura da página
style.css   → aparência visual do sistema
script.js   → funcionamento da interface
brasao.png  → imagem utilizada no cabeçalho
```

## Tecnologias utilizadas

* HTML
* CSS
* JavaScript
* GitHub Pages
* Google Apps Script
* Google Sheets

## Observação

Este repositório contém a interface web do sistema.
O processamento dos dados, envio de e-mails e integração com a planilha são realizados por meio de Google Apps Script.

## Versão

Versão em teste: 2.5
Interface hospedada no GitHub Pages com backend em Google Apps Script.
