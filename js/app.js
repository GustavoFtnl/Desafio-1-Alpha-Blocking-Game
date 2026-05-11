/**
 * app.js - Ponto de entrada principal da aplicação
 * Orquestra entre páginas Home, Game e Ranking
 * Comentários em português do Brasil
 */

import CONFIG from "./config.js";
import { gameState } from "./state.js";
import DOM from "./dom.js";

import { Home } from "./pages/Home.js";
import { Game } from "./pages/Game.js";
import { Ranking } from "./pages/Ranking.js";

const App = function() {
  this.mode = "home";
  this.gameListeners = {};
  this.init();
};

App.prototype.init = function() {
  DOM.init();
  gameState.init();
  this.setupGlobalListeners();
  this.checkMode();
};

App.prototype.setupGlobalListeners = function() {
  const self = this;
  
  this._onShowGame = function() {
    self.showGameScreen();
  };
  document.addEventListener("showGame", this._onShowGame);

  this._onShowHome = function() {
    self.showHomeScreen();
  };
  document.addEventListener("showHome", this._onShowHome);

  this._onShowRanking = function() {
    self.showRankingScreen();
  };
  document.addEventListener("showRanking", this._onShowRanking);

  this._onExitToHome = function() {
    self.exitToHome();
  };
  document.addEventListener("exitToHome", this._onExitToHome);
};

App.prototype.removeGlobalListeners = function() {
  document.removeEventListener("showGame", this._onShowGame);
  document.removeEventListener("showHome", this._onShowHome);
  document.removeEventListener("showRanking", this._onShowRanking);
  document.removeEventListener("exitToHome", this._onExitToHome);
  
  this._onShowGame = null;
  this._onShowHome = null;
  this._onShowRanking = null;
  this._onExitToHome = null;
};

App.prototype.checkMode = function() {
  const hasCurrentUser = gameState.getUserName() && gameState.getUserName().length > 0;
  
  if (hasCurrentUser) {
    this.showGameScreen();
  } else {
    this.showHomeScreen();
  }
};

App.prototype.showHomeScreen = function() {
  if (this.mode === "game" && this.game) {
    document.dispatchEvent(new CustomEvent("saveWorkspace"));
    this.game.destroy();
    this.game = null;
  }
  
this.mode = "home";
  const root = DOM.getElement(CONFIG.DOM_IDS.ROOT);
  root.innerHTML = '<div class="homeScreen"></div>';

  const homeContainer = DOM.getElement(".homeScreen");
  this.home = new Home(homeContainer);
  this.home.setupListeners();
};

App.prototype.showGameScreen = function() {
  if (this.game) {
    this.game.destroy();
    this.game = null;
  }
  
  this.mode = "game";
  const root = DOM.getElement(CONFIG.DOM_IDS.ROOT);
  root.innerHTML = '<div class="gameScreen"></div>';

  const gameContainer = DOM.getElement(".gameScreen");
  this.game = new Game(gameContainer);
  
  setTimeout(function() {
    document.dispatchEvent(new CustomEvent("loadWorkspace"));
  }, 100);
};

App.prototype.removeGameListeners = function() {
  if (this.game && typeof this.game.destroy === "function") {
    this.game.destroy();
    this.game = null;
  }
};

App.prototype.showRankingScreen = function() {
  if (this.mode === "game" && this.game) {
    document.dispatchEvent(new CustomEvent("saveWorkspace"));
    this.game.destroy();
    this.game = null;
  }
  
this.mode = "ranking";
  const root = DOM.getElement(CONFIG.DOM_IDS.ROOT);
  root.innerHTML = '<div class="rankingScreen"></div>';

  const rankingContainer = DOM.getElement(".rankingScreen");
  this.ranking = new Ranking(rankingContainer);
};

App.prototype.exitToHome = function() {
  if (confirm("Tem certeza que deseja sair? Seu progresso será salvo.")) {
    this.showHomeScreen();
  }
};

document.addEventListener("DOMContentLoaded", function() {
  new App();
});