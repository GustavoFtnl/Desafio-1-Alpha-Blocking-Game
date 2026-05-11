/**
 * Ranking.js - Página de ranking dos jogadores
 * Exibe tabela de classificação baseada em níveis, estrelas e blocos usados
 * Comentários em português do Brasil
 */

import { gameState } from "../state.js";

const Ranking = function(container) {
  this.container = container;
  this.render();
};

Ranking.prototype.render = function() {
  const ranking = gameState.getRanking();
  let rowsHtml = "";
  
  for (let i = 0; i < ranking.length; i++) {
    const player = ranking[i];
    const position = i + 1;
    const medal = this.getMedal(position);
    
    rowsHtml += "<tr class=\"rankingRow" + (position <= 3 ? " rankingRow--top" : "") + "\">" +
      "<td class=\"rankingPosition\">" + medal + " " + position + "</td>" +
      "<td class=\"rankingName\">" + this.escapeHtml(player.name) + "</td>" +
      "<td class=\"rankingStat rankingStat--hideable\">" + player.completedLevels + "</td>" +
      "<td class=\"rankingStat\">" + player.totalStars + "</td>" +
      "<td class=\"rankingStat rankingStat--hideable\">" + player.totalBlocks + "</td>" +
    "</tr>";
  }
  
  this.container.innerHTML = 
    "<div class=\"rankingContainer\">" +
      "<div class=\"rankingContent\">" +
        "<h1 class=\"rankingTitle\">" +
          "<span class=\"material-symbols-outlined\">emoji_events</span>" +
          "Ranking" +
        "</h1>" +
        
        "<div class=\"rankingTableWrapper\">" +
          "<table class=\"rankingTable\">" +
            "<thead>" +
              "<tr>" +
                "<th>#</th>" +
                "<th>Jogador</th>" +
                "<th>Níveis</th>" +
                "<th>Estrelas</th>" +
                "<th>Blocos</th>" +
              "</tr>" +
            "</thead>" +
            "<tbody>" +
              rowsHtml +
            "</tbody>" +
          "</table>" +
        "</div>" +
        
        "<div class=\"rankingCriteria\">" +
          "<p><strong>Critérios de classificação:</strong></p>" +
          "<ol>" +
            "<li>Níveis completados (maior → menor)</li>" +
            "<li>Total de estrelas (maior → menor)</li>" +
            "<li>Blocos utilizados (menor → maior)</li>" +
          "</ol>" +
        "</div>" +
        
        "<button class=\"btn btn--run rankingBackBtn\" id=\"rankingBackBtn\">" +
          "<span class=\"material-symbols-outlined\">arrow_back</span>" +
          "Voltar ao Jogo" +
        "</button>" +
      "</div>" +
    "</div>";
    
  this.setupListeners();
};

Ranking.prototype.getMedal = function(position) {
  if (position === 1) {
    return "🥇";
  } else if (position === 2) {
    return "🥈";
  } else if (position === 3) {
    return "🥉";
  }
  return "";
};

Ranking.prototype.escapeHtml = function(text) {
  const div = document.createElement("div");
  div.textContent = text;
  return div.innerHTML;
};

Ranking.prototype.setupListeners = function() {
  const backBtn = this.container.querySelector("#rankingBackBtn");
  if (backBtn) {
    backBtn.addEventListener("click", function() {
      const event = new CustomEvent("showGame", { bubbles: true });
      this.container.dispatchEvent(event);
    }.bind(this));
  }
};

Ranking.prototype.updateRanking = function() {
  this.render();
};

export default Ranking;
export { Ranking };