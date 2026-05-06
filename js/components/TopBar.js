/**
 * TopBar.js - Componente da barra superior gamificada
 * Renderiza dinamicamente: título, nível, estrelas, progresso e botão sair
 * Comentários em português do Brasil conforme AGENTS.md
 */

import { gameState } from "../state.js";

var TopBar = function(container) {
  this.container = container;
  this.render();
};

TopBar.prototype.render = function() {
  var userName = gameState.getUserName() || "";
  
  this.container.innerHTML = 
    "<div style=\"display: flex; align-items: center; gap: var(--space-lg);\">" +
      "<h1 class=\"topBar_title\">Code Blocks Game</h1>" +
      (userName ? "<span class=\"topBar_userName\">" + this.escapeHtml(userName) + "</span>" : "") +
      "<div class=\"topBar_progress\" style=\"display: none;\">" +
        "<div class=\"topBar_progressLabel\">" +
          "<span>Progresso</span>" +
          "<span class=\"progressPercent\">0%</span>" +
        "</div>" +
        "<div class=\"topBar_progressBar\">" +
          "<div class=\"topBar_progressFill\" style=\"width: 0%\"></div>" +
        "</div>" +
      "</div>" +
    "</div>" +
    "<div style=\"display: flex; align-items: center; gap: var(--space-md);\">" +
      "<span class=\"topBar_levelText\">Nível 1/10</span>" +
      "<div class=\"starRating\" aria-label=\"Progresso de estrelas: 0 de 3\">" +
        "<span class=\"star star--empty material-symbols-outlined\">star</span>" +
        "<span class=\"star star--empty material-symbols-outlined\">star</span>" +
        "<span class=\"star star--empty material-symbols-outlined\">star</span>" +
      "</div>" +
      "<button class=\"btn btn--exit\" id=\"exitBtn\" aria-label=\"Sair do jogo\">" +
        "<span class=\"material-symbols-outlined\">logout</span>" +
        "Sair" +
      "</button>" +
    "</div>";
    
  this.setupExitListener();
};

TopBar.prototype.setupExitListener = function() {
  var exitBtn = this.container.querySelector("#exitBtn");
  if (exitBtn) {
    var self = this;
    exitBtn.addEventListener("click", function() {
      var event = new CustomEvent("exitToHome", { bubbles: true });
      self.container.dispatchEvent(event);
    });
  }
};

TopBar.prototype.escapeHtml = function(text) {
  var div = document.createElement("div");
  div.textContent = text;
  return div.innerHTML;
};

TopBar.prototype.updateLevel = function(level, total) {
  total = total || 10;
  var levelText = this.container.querySelector(".topBar_levelText");
  if (levelText) {
    levelText.textContent = "Nível " + level + "/" + total;
  }
};

TopBar.prototype.updateStars = function(count) {
  var starRating = this.container.querySelector(".starRating");
  if (!starRating) return;

  var stars = starRating.querySelectorAll(".star");
  for (var i = 0; i < stars.length; i++) {
    if (i < count) {
      stars[i].classList.remove("star--empty");
      stars[i].classList.add("star--filled");
    } else {
      stars[i].classList.remove("star--filled");
      stars[i].classList.add("star--empty");
    }
  }

  starRating.setAttribute("aria-label", "Progresso de estrelas: " + count + " de 3");
};

TopBar.prototype.updateProgress = function(percent) {
  var progressFill = this.container.querySelector(".topBar_progressFill");
  var progressPercent = this.container.querySelector(".progressPercent");
  var progressContainer = this.container.querySelector(".topBar_progress");

  if (progressContainer) {
    progressContainer.style.display = "flex";
  }

  if (progressFill) {
    progressFill.style.width = percent + "%";
  }

  if (progressPercent) {
    progressPercent.textContent = Math.round(percent) + "%";
  }
};

TopBar.prototype.updateUserName = function(name) {
  var existingName = this.container.querySelector(".topBar_userName");
  
  if (existingName) {
    existingName.textContent = name;
  } else if (name) {
    var h1 = this.container.querySelector(".topBar_title");
    if (h1) {
      var nameSpan = document.createElement("span");
      nameSpan.className = "topBar_userName";
      nameSpan.textContent = name;
      h1.parentNode.insertBefore(nameSpan, h1.nextSibling);
    }
  }
};

TopBar.prototype.updateBlockCounter = function(used, max) {
  // Este método não é usado no TopBar do exemplo
};

export default TopBar;
export { TopBar };