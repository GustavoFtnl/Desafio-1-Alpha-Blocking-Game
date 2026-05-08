/**
 * TopBar.js - Componente da barra superior gamificada
 * Renderiza: título, nível, estrelas, progresso, botões ranking e sair
 * Comentários em português do Brasil conforme AGENTS.md
 */

import { gameState } from "../state.js";
import { LevelsModal } from "./LevelsModal.js";

var TopBar = function (container) {
  this.container = container;
  this.levelsModal = new LevelsModal();
  this.render();
};

TopBar.prototype.render = function () {
  var userName = gameState.getUserName() || "";
  var currentLevel = gameState.getCurrentLevel();
  var currentStars = gameState.getStarsForLevel(currentLevel);

  this.container.innerHTML =
    '<div style="display: flex; align-items: center; gap: var(--space-lg);">' +
    '<h1 class="topBar_title">Code Blocks Game</h1>' +
    (userName
      ? '<span class="topBar_userName">' + this.escapeHtml(userName) + "</span>"
      : "") +
    '<div class="topBar_progress" style="display: none;">' +
    '<div class="topBar_progressLabel">' +
    "<span>Progresso</span>" +
    '<span class="progressPercent">0%</span>' +
    "</div>" +
    '<div class="topBar_progressBar">' +
    '<div class="topBar_progressFill" style="width: 0%"></div>' +
    "</div>" +
    "</div>" +
    "</div>" +
    '<div style="display: flex; align-items: center; gap: var(--space-md);">' +
    '<button class="btn btn--levelSelect" id="levelSelectBtn" aria-label="Selecionar nível">' +
    '<span class="levelSelectText">Nível ' +
    currentLevel +
    "</span>" +
    '<div class="levelSelectStars">' +
    this.generateStarsHtml(currentStars) +
    "</div>" +
    "</button>" +
    '<button class="btn btn--rankingTop" id="rankingBtn" aria-label="Ver ranking">' +
    '<span class="material-symbols-outlined">leaderboard</span>' +
    "</button>" +
    '<button class="btn btn--exit" id="exitBtn" aria-label="Sair do jogo">' +
    '<span class="material-symbols-outlined">logout</span>' +
    "Sair" +
    "</button>" +
    "</div>";

  this.setupListeners();
};

TopBar.prototype.generateStarsHtml = function (starCount) {
  var filledColor = "#fbbf24";
  var emptyColor = "#d1d5db";
  var html = "";

  for (var i = 0; i < 3; i++) {
    var color = i < starCount ? filledColor : emptyColor;
    html +=
      '<svg class="starSvg" viewBox="0 0 24 24" width="16" height="16">' +
      '<path fill="' +
      color +
      '" d="M12 17.27L18.18 21l-1.64-7.03L22 9.24l-7.19-.61L12 2 9.19 8.63 2 9.24l5.46 4.73L5.82 21z"/>' +
      "</svg>";
  }
  return html;
};

TopBar.prototype.setupListeners = function () {
  var self = this;

  var exitBtn = this.container.querySelector("#exitBtn");
  if (exitBtn) {
    exitBtn.addEventListener("click", function () {
      var event = new CustomEvent("exitToHome", { bubbles: true });
      self.container.dispatchEvent(event);
    });
  }

  var rankingBtn = this.container.querySelector("#rankingBtn");
  if (rankingBtn) {
    rankingBtn.addEventListener("click", function () {
      var event = new CustomEvent("showRanking", { bubbles: true });
      self.container.dispatchEvent(event);
    });
  }

  var levelSelectBtn = this.container.querySelector("#levelSelectBtn");
  if (levelSelectBtn) {
    levelSelectBtn.addEventListener("click", function () {
      self.openLevelSelectModal();
    });
  }
};

TopBar.prototype.escapeHtml = function (text) {
  var div = document.createElement("div");
  div.textContent = text;
  return div.innerHTML;
};

TopBar.prototype.openLevelSelectModal = function () {
  var self = this;
  var currentLevel = gameState.getCurrentLevel();

  this.levelsModal
    .open(currentLevel, function (level) {
      return gameState.getStarsForLevel(level);
    })
    .then(function (selectedLevel) {
      if (selectedLevel) {
        gameState.setCurrentLevel(selectedLevel);
        self.updateLevelButton(selectedLevel);

        var event = new CustomEvent("levelSelected", {
          bubbles: true,
          detail: { level: selectedLevel },
        });
        self.container.dispatchEvent(event);
      }
    });
};

TopBar.prototype.updateLevelButton = function (level) {
  var levelText = this.container.querySelector(".levelSelectText");
  var starsContainer = this.container.querySelector(".levelSelectStars");

  if (levelText) {
    levelText.textContent = "Nível " + level;
  }

  if (starsContainer) {
    var stars = gameState.getStarsForLevel(level);
    starsContainer.innerHTML = this.generateStarsHtml(stars);
  }
};

TopBar.prototype.updateLevel = function (level, total) {
  this.updateLevelButton(level);
};

TopBar.prototype.updateStars = function (count) {
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

  starRating.setAttribute(
    "aria-label",
    "Progresso de estrelas: " + count + " de 3",
  );
};

TopBar.prototype.updateProgress = function (percent) {
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

TopBar.prototype.updateUserName = function (name) {
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

TopBar.prototype.updateBlockCounter = function (used, max) {
  // Este método não é usado no TopBar do exemplo
};

export default TopBar;
export { TopBar };
