# Maratona SBC - Site

Projeto para processar relatórios da [Maratona de Programação da SBC](http://maratona.sbc.org.br/) e criar páginas HTML para divulgação das informações.

## Relatório ICPC

As informações são extraídas dos relatórios disponibilizados pelo [ICPC](https://icpc.global/). Especificamente, considera-se o relatório _Search "Team Members"_, exportado no formato [CSV](https://pt.wikipedia.org/wiki/Comma-separated_values), com os seguintes itens:
* Username
* First name
* Last name
* Site
* Sex
* Institution
* Institution short name
* Team
* Team status
* Rank
* Role

O arquivo deve ser salvo com a seguinte estrutura de nome: `YYYY_1aFase.csv` ou `YYYY_Nacional.csv`, conforme  o evento, dentro do diretório `[reports](reports)`.


## Processamento

O processamento do(s) relatório(s) é feito por scripts em Python 3 (utilizando [numpy](https://numpy.org/) e [pandas](https://pandas.pydata.org/pandas-docs/stable/index.html)). O uso é simples, basta fornecer o endereço do arquivo do relatório.

```bash
cd src
python3 parser.py ../reports/2018_Nacional.csv ../reports/2019*
```

### Arquivos Auxiliares

O arquivo [institutions.csv](src/institutions.csv) mapeia cada instituição à suas sigla e UF (por exemplo, `DF,UnB,Universidade de Brasília`. O agrupamento das informações é feito baseado nessas informações. O arquivo [aliases.csv](src/aliases.csv) mapeia diferentes formas de escrita à uma forma única, visando uma padronização dos nomes (por exemplo, _Universidade de Brasilia_ e _University of Brasília_ são mapeadas para _Universidade de Brasília_).

## eventos.html

Página para exibir os dados dos eventos, por ano. A página carrega os dados e é atualizada dinamicamente conforme as opções do usuário. As imagens de mapas e bandeiras de UFs foram obtidas da [Wikimedia Commons](https://commons.wikimedia.org/), as demais são da organização do evento. Para funcionamento adequado, diretório `[html](html)` tem uma estrutura específica, que é facilmente atualizada para lidar com novos eventos. Os pontos de ajuste são indicados a seguir:

```
.
html
  |- img
  |    +- [YYYY]
  |    |    + poster.jpg
  |    |    +- 1aFase
  |    |    |    `- [RANK].jpg
  |    |    `- Nacional
  |    |         `- [RANK].jpg
  `- js
       +- [YYYY_FASE].js
```

### Imagens

Para cada diretório `YYYY`, representando o ano do evento, o poster de chamada fica armazenado no arquivo `poster.jpg` e a foto de cada time participante no respectivo arquivo [RANK.jpg](html/img/2019/1aDaseposter.jpg), onde _RANK_ é o rank do time no placar geral. O arquivo `SHORT.png` deve conter a imagem da marca da instituição, cujo nove deve ser a versão a sigla da instituição *normalizada* (veja `[normalize](src/tools.py)`).

### Javascript

Os dados do relatório para cada ano, conforme processados pelo `parser`, são armazenados no diretório [js](html/js). O arquivo apenas preenche um dicionário com os dados, que são utilizados para gerar o conteúdo da página. O relatório de cada evento fica armazenado em um arquivo específico, que deve ser carregado pelo página principal. Atenção, ([esse arquivo](html/eventos.html)) deve ser atualizado a cada novo relatório processado.
