/**
 * app.js - Ponto de entrada principal da aplicação
 * Orquestra entre páginas Home e Game
 * Comentários em português do Brasil
 */

import CONFIG from "./config.js";
import { gameState } from "./state.js";
import DOM from "./dom.js";

import { Home } from "./pages/Home.js";
import { Game } from "./pages/Game.js";

var App = function() {
  this.mode = "home";
  this.init();
};

App.prototype.init = function() {
  DOM.init();
  gameState.init();
  this.setupGlobalListeners();
  this.checkMode();
};

App.prototype.setupGlobalListeners = function() {
  var self = this;
  
  document.addEventListener("showGame", function() {
    self.showGameScreen();
  });

  document.addEventListener("exitToHome", function() {
    self.exitToHome();
  });
};

App.prototype.checkMode = function() {
  var hasCurrentUser = gameState.getUserName() && gameState.getUserName().length > 0;
  
  if (hasCurrentUser) {
    this.showGameScreen();
  } else {
    this.showHomeScreen();
  }
};

App.prototype.showHomeScreen = function() {
  this.mode = "home";
  var root = document.getElementById(CONFIG.DOM_IDS.ROOT);
  root.innerHTML = "<div class=\"homeScreen\"></div>";
  
  var homeContainer = root.querySelector(".homeScreen");
  this.home = new Home(homeContainer);
  this.home.setupListeners();
};

App.prototype.showGameScreen = function() {
  this.mode = "game";
  var root = document.getElementById(CONFIG.DOM_IDS.ROOT);
  root.innerHTML = "<div class=\"gameScreen\"></div>";
  
  var gameContainer = root.querySelector(".gameScreen");
  this.game = new Game(gameContainer);
};

App.prototype.exitToHome = function() {
  if (confirm("Tem certeza que deseja sair? Seu progresso será salvo.")) {
    this.showHomeScreen();
  }
};

document.addEventListener("DOMContentLoaded", function() {
  new App();
});