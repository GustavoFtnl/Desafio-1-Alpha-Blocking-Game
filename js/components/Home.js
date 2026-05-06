/**
 * Home.js - Componente da tela inicial (home page)
 * Permite usuário informar nome para começar o jogo
 * Comentários em português do Brasil
 */

import { gameState } from "../state.js";
import DOM from "../dom.js";

var Home = function(container) {
  this.container = container;
  this.render();
};

Home.prototype.render = function() {
  var hasName = gameState.getUserName() && gameState.getUserName().length > 0;
  
  this.container.innerHTML = 
    "<div class=\"homeContainer\">" +
      "<div class=\"homeContent\">" +
        "<h1 class=\"homeTitle\">Code Blocks Game</h1>" +
        "<p class=\"homeSubtitle\">Aprenda lógica de programação com blocos!</p>" +
        
        (hasName 
          ? this.renderWithName() 
          : this.renderForm()) +
        
        "<div class=\"homeFeatures\">" +
          "<div class=\"homeFeature\">" +
            "<span class=\"material-symbols-outlined homeFeatureIcon\">drag_pan</span>" +
            "<p>Arraste blocos</p>" +
          "</div>" +
          "<div class=\"homeFeature\">" +
            "<span class=\"material-symbols-outlined homeFeatureIcon\">play_circle</span>" +
            "<p>Execute código</p>" +
          "</div>" +
          "<div class=\"homeFeature\">" +
            "<span class=\"material-symbols-outlined homeFeatureIcon\">emoji_events</span>" +
            "<p>Ganhe estrelas</p>" +
          "</div>" +
        "</div>" +
      "</div>" +
    "</div>";
};

Home.prototype.renderForm = function() {
  return "<form class=\"homeForm\" id=\"homeForm\">" +
    "<label class=\"homeLabel\" for=\"userNameInput\">Digite seu nome:</label>" +
    "<input type=\"text\" class=\"homeInput\" id=\"userNameInput\" " +
      "placeholder=\"Seu nome\" maxlength=\"20\" required aria-label=\"Seu nome\">" +
    "<button type=\"submit\" class=\"btn btn--run homeStartBtn\">" +
      "<span class=\"material-symbols-outlined\">play_arrow</span>" +
      "Começar" +
    "</button>" +
  "</form>";
};

Home.prototype.renderWithName = function() {
  var name = gameState.getUserName();
  var level = gameState.getCurrentLevel();
  var totalLevels = gameState.getTotalLevels();
  
  return "<div class=\"homeWelcome\">" +
    "<p class=\"homeWelcomeText\">Olá, <strong>" + this.escapeHtml(name) + "</strong>!</p>" +
    "<p class=\"homeLevelInfo\">Você está no nível " + level + "/" + totalLevels + "</p>" +
    "<button class=\"btn btn--run homeContinueBtn\" id=\"continueBtn\">" +
      "<span class=\"material-symbols-outlined\">play_arrow</span>" +
      "Continuar" +
    "</button>" +
    "<button class=\"btn btn--clear homeRestartBtn\" id=\"restartBtn\">" +
      "<span class=\"material-symbols-outlined\">refresh</span>" +
      "Recomeçar" +
    "</button>" +
  "</div>";
};

Home.prototype.escapeHtml = function(text) {
  var div = document.createElement("div");
  div.textContent = text;
  return div.innerHTML;
};

Home.prototype.setupListeners = function() {
  var form = this.container.querySelector("#homeForm");
  if (form) {
    form.addEventListener("submit", this.handleSubmit.bind(this));
  }
  
  var continueBtn = this.container.querySelector("#continueBtn");
  if (continueBtn) {
    continueBtn.addEventListener("click", this.handleContinue.bind(this));
  }
  
  var restartBtn = this.container.querySelector("#restartBtn");
  if (restartBtn) {
    restartBtn.addEventListener("click", this.handleRestart.bind(this));
  }
};

Home.prototype.handleSubmit = function(e) {
  e.preventDefault();
  var input = this.container.querySelector("#userNameInput");
  var name = input.value.trim();
  
  if (name.length > 0) {
    gameState.setUserName(name);
    this.showGame();
  }
};

Home.prototype.handleContinue = function() {
  this.showGame();
};

Home.prototype.handleRestart = function() {
  if (confirm("Tem certeza que deseja recomeçar do nível 1? Seu progresso será perdido.")) {
    gameState.resetCareer();
    this.render();
    this.setupListeners();
  }
};

Home.prototype.showGame = function() {
  var event = new CustomEvent("showGame", { bubbles: true });
  this.container.dispatchEvent(event);
};

Home.prototype.updateUserName = function() {
  this.render();
  this.setupListeners();
};

export default Home;
export { Home };