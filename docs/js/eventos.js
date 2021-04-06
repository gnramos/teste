/**
 * Exibição de estatísticas dos eventos da Maratona de Programação SBC.
 *
 * Implementação de funções para gerenciar a disposição de informações
 * quanto à participações em eventos específicos.
 *
 * @link   http://www.github.com/gnramos/maratona-site
 * @author Guilherme N. Ramos.
 */


/**************
 * Constantes *
 **************/
const UF = {"AC": "Acre", "AL": "Alagoas", "AM": "Amazonas",
            "AP": "Amapá", "BA": "Bahia", "CE": "Ceará",
            "DF": "Distrito Federal", "ES": "Espírito Santo",
            "GO": "Goiás", "MA": "Maranhão", "MG": "Minas Gerais",
            "MS": "Mato Grosso do Sul", "MT": "Mato Grosso",
            "PA": "Pará", "PB": "Paraíba", "PE": "Pernambuco",
            "PI": "Piauí", "PR": "Paraná", "RJ": "Rio de Janeiro",
            "RN": "Rio Grande do Norte", "RO": "Rondônia",
            "RR": "Roraima", "RS": "Rio Grande do Sul",
            "SC": "Santa Catarina", "SE": "Sergipe", "SP": "São Paulo",
            "TO": "Tocantins",
            "BR": "Brasil"}

const DEFAULT_IMG = "img/MaratonaSBC.jpg";
const DEFAULT_NAME = {"year": "Ano", "phase": "Fase", "region": "Região",
                      "uf": "UF", "institution": "Instituição",
                      "team": "Time"};
const SELECTORS = ["year", "phase", "region", "uf", "institution", "team"];

/******************************************************************************/
/******************************************************************************/

/**
 * Retorna as informações referentes à opção dada.
 *
 * As informações são organizadas em uma estrutura de árvore, utilizando um
 * objeto dicionário. Cada chave representa uma instância da opção solicitada,
 * e cada valor associado é um novo dicionário contendo as detalhes da instância.
 *
 * A atual implementação considera que há o objeto CONTESTS (dicionário), que
 * já deve ter sido criado, contendo as informações.
 *
 * @param {string}   selector    Define a fonte de informação desejada (um de SELECTORS).
 *
 * @return {object} Dicionário contendo as informações solicitadas.
 */
function fetchDataFor(selector) {
  var info = CONTESTS;
  for (let sel of SELECTORS) {
    if (isDefault(sel) || sel == selector)
      break;
    info = info[current(sel)];
  }

  return info;
}

/**
 * Retorna a informação agregada referente à opção dada.
 *
 * As informações são organizadas em uma estrutura de árvore, utilizando um
 * objeto dicionário. Cada chave representa uma instância da opção solicitada,
 * e cada valor associado é um novo dicionário contendo as detalhes da instância.
 *
 * A atual implementação considera que há o objeto AGREGGATED (dicionário), que
 * já deve ter sido criado, contendo as informações.
 *
 * @see  aggregateInfo
 *
 * @param {string}   agg         Define a forma de agregação dos valores.
 * @param {string}   forData     Define para qual tipo de dado se quer agregar.
 * @param {string}   selector    Define a fonte de informação desejada (um de SELECTORS).
 *
 * @return {Number} Valor resultante da agregação.
 */
function fetchAggregatedDataFor(agg, forData, selector) {
  var info = AGREGGATED[agg][forData];

  for (let sel of SELECTORS) {
    info = info[current(sel)];
    if (sel == selector) // || info["Value"] === undefined)
      break;
  }

  return info["Value"];
}


/**
 * Retorna valores agregados para as informações disponíveis.
 *
 * As informações são organizadas em uma estrutura de árvore, utilizando um
 * objeto dicionário. Cada chave representa uma instância da opção solicitada,
 * e cada valor associado é um novo dicionário contendo as detalhes da instância.
 *
 * Atualmente as funções de agregação consideradas são "count", que conta as
 * ocorrências a cada nível, e "mean", que calcula a média a cada nível.
 * Resultados de times com rank 0 são desconsiderados para agregar o valor médio
 * do rank dos times.
 *
 * @see  fetchAggregatedDataFor
 *
 * @return {object} Dicionário contendo as informações solicitadas.
 */
function aggregateInfo() {
  var teams = {}, girls = {}, meanRank = {}, validRank = {};
  var accumulators = {teams, girls, meanRank, validRank};

  for (let y in CONTESTS) {
    for (let c in accumulators)
      accumulators[c][y] = {"Value": 0};

    for (let p in CONTESTS[y]) {
      for (let c in accumulators)
        accumulators[c][y][p] = {"Value": 0};

      for (let r in CONTESTS[y][p]) {
        for (let c in accumulators)
          accumulators[c][y][p][r] = {"Value": 0};

        for (let u in CONTESTS[y][p][r]) {
          for (let c in accumulators)
            accumulators[c][y][p][r][u] = {"Value": 0};

          for (let i in CONTESTS[y][p][r][u]) {
            for (let c in accumulators)
              accumulators[c][y][p][r][u][i] = {"Value": 0};

            teams[y][p][r][u][i] = {"Value": Object.keys(CONTESTS[y][p][r][u][i]).length};

            for (let t in CONTESTS[y][p][r][u][i]) {
              for (let sex of CONTESTS[y][p][r][u][i][t]["Sex"]) {
                if (sex == 'Female')
                  girls[y][p][r][u][i]["Value"] += 1;
              }

              if (CONTESTS[y][p][r][u][i][t]["Rank"]) {
                meanRank[y][p][r][u][i]["Value"] += CONTESTS[y][p][r][u][i][t]["Rank"];
                validRank[y][p][r][u][i]["Value"] += 1;
              }
            }

            for (let c in accumulators)
              accumulators[c][y][p][r][u]["Value"] += accumulators[c][y][p][r][u][i]["Value"];

            meanRank[y][p][r][u][i]["Value"] /= validRank[y][p][r][u][i]["Value"];
          }
          for (let c in accumulators)
            accumulators[c][y][p][r]["Value"] += accumulators[c][y][p][r][u]["Value"];

          meanRank[y][p][r][u]["Value"] /= validRank[y][p][r][u]["Value"];
        }
        for (let c in accumulators)
          accumulators[c][y][p]["Value"] += accumulators[c][y][p][r]["Value"];

        meanRank[y][p][r]["Value"] /= validRank[y][p][r]["Value"];
      }

      for (let c in accumulators)
        accumulators[c][y]["Value"] += accumulators[c][y][p]["Value"];

      meanRank[y][p]["Value"] /= validRank[y][p]["Value"];
    }

    for (let c in accumulators)
      accumulators[c]["Value"] += accumulators[c][y]["Value"];

    meanRank[y]["Value"] /= validRank[y]["Value"];
  }

  return {"count": {"Teams": teams, "Girls": girls},
          "mean": {"Rank": meanRank}};
}
/******************************************************************************/
/******************************************************************************/

/***********
 * Funções *
 ***********/

/* Funções associadas às opções. */
function current(selector) {
  return document.getElementById(`${selector}Selector`).value;
}

function isDefault(selector) { // Indica se o valor é o padrão
  return (current(selector) == DEFAULT_NAME[selector]);
}

function followingSelectors(selector, reverse=false) {
  if (reverse)
    return SELECTORS.slice(SELECTORS.indexOf(selector) + 1).reverse();
  return SELECTORS.slice(SELECTORS.indexOf(selector) + 1);
}

function previousSelectors(selector, reverse=false) {
  if (reverse)
    return SELECTORS.slice(0, SELECTORS.indexOf(selector)).reverse();
  SELECTORS.slice(0, SELECTORS.indexOf(selector));
}

function defaultAggregatedStats(selector) {
  var competidoras = fetchAggregatedDataFor("count", "Girls", selector),
      times = fetchAggregatedDataFor("count", "Teams", selector),
      percCompetidoras = 100 * competidoras / (3 * times);

  return `Times inscritos: ${times}` +
         `, <span class="sbc-contestant Female">Competidoras: ${competidoras} (${percCompetidoras.toFixed(1)}%)</span>`;
}

function addSelectorOptions(selector, options) {
  var e = document.getElementById(`${selector}Selector`);
  for (let text of options) {
    var option = document.createElement("option");
    option.text = text;
    e.add(option);
  }
}

function removeSelectorOptions(selector, minimum=1) {
  var selectorList = selector.constructor === Array ? selector : [selector];
  for (let s of selectorList)
    while (s.options.length > minimum)
      s.remove(s.options.length - 1);
}

function includeSelectorsHTML() {
  function selectorHTML(selector) {
    return `
        <select id="${selector}Selector" onchange="selectorChanged('${selector}')" class="sbc-sel-${selector}">
          <option>${DEFAULT_NAME[selector]}</option>
        </select>`;
  }

  for (let sel of SELECTORS)
    selectors.innerHTML += selectorHTML(sel);

  addSelectorOptions(SELECTORS[0], Object.keys(fetchDataFor(SELECTORS[0])).sort());
}

function includeStatisticsHTML() {
  function statisticHTML(selector) {
    return `<div id="stat-${selector}" class="card mb-3" style="display: none;">
          <div class="row g-0">
            <div id="stat-${selector}-img-div" class="col-md-1">
            </div>
            <div class="col-md-8">
              <div id="stat-${selector}-header" class="card-header"></div>
              <div class="card-body">
                <div id="stat-${selector}-body" class="card-text"></div>
                <div id="stat-${selector}-footer" class="card-text"></div>
              </div>
            </div>
          </div>
        </div>`;
  }

  for (let sel of SELECTORS.slice().reverse())
    statistics.innerHTML += statisticHTML(sel);
}

function imgHTML(selector, src) {
    return `<img id="stat-${selector}-img" class="card-img" src="${src}" onerror="this.onerror=null; this.src='${DEFAULT_IMG}'">`;
}

function selectorChanged(selector) {
  // Remove options for followingSelectors selectors.
  for (let sel of followingSelectors(selector, true))
    removeSelectorOptions(document.getElementById(`${sel}Selector`));

  // Update options for the followingSelectors selector.
  if (!isDefault(selector) && selector != "team") {
    var next = followingSelectors(selector)[0];
    addSelectorOptions(next,
                       Object.keys(fetchDataFor(next)).sort(
                        function(a, b) { return a.localeCompare(b, 'pt-br', { sensitivity: 'base' }); }));
  }

  // Show/hide stats, as appropriate.
  toggleStatsDisplay(showAllCheckbox.checked);

  // Update statistics for selection.
  if (!isDefault(selector)) {
    var stats = window[`${selector}Changed`]();

    if (selector != "team") { // Team selector has no AGREGGATED results.
      if (stats["footer"] == undefined)
        stats["footer"] = "";
      stats["footer"] += defaultAggregatedStats(selector);
    }

    for (let s in stats)
      document.getElementById(`stat-${selector}-${s}`).innerHTML = stats[s];
  }
}

function yearChanged() {
  return {"header": `Estatísticas do Ano ${current("year")}`,
      "img-div": imgHTML("year", `img/${current("year")}/poster.jpg`)};
}

function phaseChanged() {
  return {"header": `Estatísticas da Fase ${current("phase")}`};
}

function regionChanged() {
  return {"header": `Estatísticas da Região ${current("region")}`,
          "footer": `Rank Médio: ${fetchAggregatedDataFor("mean", "Rank", "region").toFixed(0)}, `,
          "img-div": imgHTML("region", `img/map/${current("region")}.png`)};
}

function ufChanged() {
  return {"header": `Estatísticas da UF ${UF[current("uf")]}`,
          "footer": `Rank Médio: ${fetchAggregatedDataFor("mean", "Rank", "uf").toFixed(0)}, `,
          "img-div": imgHTML("uf", `img/map/${current("uf")}.png`)};
}

function institutionChanged() {
  var safeName = current("institution").replace(/\W/g, '').toLowerCase();

  return {"header": `Estatísticas da Instituição ${current("institution")}`,
          "footer": `Rank Médio: ${fetchAggregatedDataFor("mean", "Rank", "institution").toFixed(0)}, `,
          "img-div": imgHTML("institution", `img/institution/${safeName}.jpg`)};
}

function teamChanged() {
  function rankInstitution(site, teamRank) {
    var rank = 1,
        institutions = fetchDataFor("institution");
    for (let i in institutions)
      for (let t in institutions[i])
        if (institutions[i][t]["Institution"] == site && institutions[i][t]["Rank"] > 0 && (teamRank == 0 || institutions[i][t]["Rank"] < teamRank))
          rank += 1;

    return rank;
  }

  function createBody(contestantEntries) {
    var body = '';
    body = '<span class="contestant">';
    for (let i in teamInfo["Contestants"])
      body += `<span class="${teamInfo["Sex"][i].toLowerCase()}">${teamInfo["Contestants"][i]}</span>, `;
    return body.slice(0, -2) + ` e <span class="coach">${teamInfo["Coach"]} (coach)</span></span>`;
  }

  var teamInfo = fetchDataFor("team")[current("team")];
  if (teamInfo["LocalRank"] === undefined)
    teamInfo["LocalRank"] = rankInstitution(teamInfo["Institution"], teamInfo["Rank"]);

  return {"header": current("team"),
          "body": createBody(),
          "footer": `Rank na instituição ${teamInfo["Institution"]}: ${teamInfo["LocalRank"]}, Rank Geral: ${teamInfo["Rank"] ? teamInfo["Rank"] : '-'}`,
          "img-div": imgHTML("team", `img/${current("year")}/${current("phase")}/${teamInfo["Rank"]}.jpg`)};
}

function toggleStatsDisplay(isChecked) {
  var alreadyDisplayed = false;

  for (let sel of SELECTORS.slice().reverse()) {
    if (isDefault(sel) || (alreadyDisplayed && !isChecked)) {
      document.getElementById(`stat-${sel}`).style.display = "none";
    } else {
      document.getElementById(`stat-${sel}`).style.display = "inline";
      alreadyDisplayed = true;
    }
  }
}

/*********
 * SETUP *
 *********/
var callAggregateInfo = function() {return ``;};

if (typeof CONTESTS === "undefined") {
  showAllCheckbox.style.display = "none";
  showAllCheckboxLabel.style.display = "none";
  document.write("Erro...<br><br>Não há dados carregados!");
} else {
  callAggregateInfo = aggregateInfo;
  includeSelectorsHTML();
  includeStatisticsHTML();
}
const AGREGGATED = callAggregateInfo();