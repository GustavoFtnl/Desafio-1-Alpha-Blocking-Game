/**
 * state.js - Gerenciador de estado global da aplicação
 * Gerencia currentLevel, stars e persistência no LocalStorage
 * Implementa padrão Observer para notificar mudanças
 * Comentários em português do Brasil
 */

import CONFIG from "./config.js";

var GameState = function() {
  this.currentLevel = CONFIG.DEFAULTS.CURRENT_LEVEL;
  this.stars = {};
  this._listeners = [];
};

GameState.prototype.init = function() {
  this.loadFromStorage();
};

GameState.prototype.loadFromStorage = function() {
  try {
    var savedLevel = localStorage.getItem(CONFIG.STORAGE_KEYS.CURRENT_LEVEL);
    var savedStars = localStorage.getItem(CONFIG.STORAGE_KEYS.STARS);

    if (savedLevel !== null) {
      this.currentLevel = parseInt(savedLevel, 10);
    }

    if (savedStars !== null) {
      this.stars = JSON.parse(savedStars);
    }
  } catch (error) {
    console.error("Erro ao carregar estado do jogo:", error);
  }
};

GameState.prototype.saveToStorage = function() {
  try {
    localStorage.setItem(CONFIG.STORAGE_KEYS.CURRENT_LEVEL, this.currentLevel.toString());
    localStorage.setItem(CONFIG.STORAGE_KEYS.STARS, JSON.stringify(this.stars));
  } catch (error) {
    console.error("Erro ao salvar estado do jogo:", error);
  }
};

GameState.prototype.getCurrentLevel = function() {
  return this.currentLevel;
};

GameState.prototype.getMaxBlocks = function() {
  var levelConfig = CONFIG.LEVEL_CONFIG[this.currentLevel];
  return levelConfig ? levelConfig.maxBlocks : CONFIG.DEFAULTS.CURRENT_LEVEL * 2 + 6;
};

GameState.prototype.getTotalLevels = function() {
  return CONFIG.DEFAULTS.TOTAL_LEVELS;
};

GameState.prototype.getStarsForLevel = function(level) {
  return this.stars[level] || CONFIG.DEFAULTS.INITIAL_STARS;
};

GameState.prototype.getAllStars = function() {
  var result = {};
  for (var key in this.stars) {
    if (this.stars.hasOwnProperty(key)) {
      result[key] = this.stars[key];
    }
  }
  return result;
};

GameState.prototype.setCurrentLevel = function(level) {
  this.currentLevel = level;
  this.saveToStorage();
  this._notifyListeners("levelChanged", { level: level });
};

GameState.prototype.advanceLevel = function() {
  if (this.currentLevel < CONFIG.DEFAULTS.TOTAL_LEVELS) {
    this.currentLevel++;
    this.saveToStorage();
    this._notifyListeners("levelChanged", { level: this.currentLevel });
  }
};

GameState.prototype.setStarsForLevel = function(level, stars) {
  this.stars[level] = stars;
  this.saveToStorage();
  this._notifyListeners("starsChanged", { level: level, stars: stars });
};

GameState.prototype.calculateStars = function(usedBlocks) {
  var maxBlocks = this.getMaxBlocks();

  if (usedBlocks <= maxBlocks) {
    var percentage = usedBlocks / maxBlocks;
    if (percentage <= 0.7) {
      return 3;
    } else if (percentage <= 1.0) {
      return 2;
    }
  }
  return 1;
};

GameState.prototype.completeLevel = function(usedBlocks) {
  var stars = this.calculateStars(usedBlocks);
  this.setStarsForLevel(this.currentLevel, stars);
  return stars;
};

GameState.prototype.resetCareer = function() {
  try {
    localStorage.removeItem(CONFIG.STORAGE_KEYS.CURRENT_LEVEL);
    localStorage.removeItem(CONFIG.STORAGE_KEYS.STARS);
  } catch (error) {
    console.error("Erro ao limpar localStorage:", error);
  }

  this.currentLevel = CONFIG.DEFAULTS.CURRENT_LEVEL;
  this.stars = {};
  this._notifyListeners("careerReset", {});
};

GameState.prototype.getProgressPercent = function() {
  return ((this.currentLevel - 1) / CONFIG.DEFAULTS.TOTAL_LEVELS) * 100;
};

GameState.prototype.addListener = function(callback) {
  this._listeners.push(callback);
};

GameState.prototype.removeListener = function(callback) {
  var index = this._listeners.indexOf(callback);
  if (index > -1) {
    this._listeners.splice(index, 1);
  }
};

GameState.prototype._notifyListeners = function(event, data) {
  for (var i = 0; i < this._listeners.length; i++) {
    try {
      this._listeners[i](event, data);
    } catch (error) {
      console.error("Erro em listener:", error);
    }
  }
};

var gameState = new GameState();

export default gameState;
export { gameState, GameState };