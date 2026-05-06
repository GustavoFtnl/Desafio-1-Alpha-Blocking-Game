/**
 * state.js - Gerenciador de estado global da aplicação
 * Gerencia múltiplos usuários, currentLevel, stars e persistência no LocalStorage
 * Implementa padrão Observer para notificar mudanças
 * Comentários em português do Brasil
 */

import CONFIG from "./config.js";

var GameState = function() {
  this.currentUser = null;
  this.users = [];
  this._listeners = [];
};

GameState.prototype.init = function() {
  this.loadFromStorage();
};

GameState.prototype.loadFromStorage = function() {
  try {
    var savedUsers = localStorage.getItem(CONFIG.STORAGE_KEYS.USERS);
    var savedCurrentUser = localStorage.getItem(CONFIG.STORAGE_KEYS.USER_NAME);

    if (savedUsers !== null) {
      this.users = JSON.parse(savedUsers);
    }

    if (savedCurrentUser !== null && this.users.length > 0) {
      this.currentUser = this.findUser(savedCurrentUser);
    }
  } catch (error) {
    console.error("Erro ao carregar estado:", error);
    this.users = [];
  }
};

GameState.prototype.saveUsersToStorage = function() {
  try {
    localStorage.setItem(CONFIG.STORAGE_KEYS.USERS, JSON.stringify(this.users));
  } catch (error) {
    console.error("Erro ao salvar usuários:", error);
  }
};

GameState.prototype.findUser = function(name) {
  for (var i = 0; i < this.users.length; i++) {
    if (this.users[i].name === name) {
      return this.users[i];
    }
  }
  return null;
};

GameState.prototype.getUsers = function() {
  return this.users;
};

GameState.prototype.getUserName = function() {
  return this.currentUser ? this.currentUser.name : "";
};

GameState.prototype.hasUsers = function() {
  return this.users.length > 0;
};

GameState.prototype.switchUser = function(name) {
  var user = this.findUser(name);
  if (user) {
    this.currentUser = user;
    this.saveCurrentUser();
    this._notifyListeners("userChanged", { user: user });
    return true;
  }
  return false;
};

GameState.prototype.createUser = function(name) {
  var existing = this.findUser(name);
  if (existing) {
    alert("Usuário já existe!");
    return false;
  }

  var newUser = {
    name: name,
    level: CONFIG.DEFAULTS.CURRENT_LEVEL,
    stars: {}
  };

  this.users.push(newUser);
  this.currentUser = newUser;
  this.saveUsersToStorage();
  this.saveCurrentUser();
  this._notifyListeners("userCreated", { user: newUser });
  return true;
};

GameState.prototype.saveCurrentUser = function() {
  try {
    if (this.currentUser) {
      localStorage.setItem(CONFIG.STORAGE_KEYS.USER_NAME, this.currentUser.name);
    }
  } catch (error) {
    console.error("Erro ao salvar usuário atual:", error);
  }
};

GameState.prototype.getCurrentLevel = function() {
  return this.currentUser ? this.currentUser.level : CONFIG.DEFAULTS.CURRENT_LEVEL;
};

GameState.prototype.getMaxBlocks = function() {
  var level = this.getCurrentLevel();
  var levelConfig = CONFIG.LEVEL_CONFIG[level];
  return levelConfig ? levelConfig.maxBlocks : level * 2 + 6;
};

GameState.prototype.getTotalLevels = function() {
  return CONFIG.DEFAULTS.TOTAL_LEVELS;
};

GameState.prototype.getStarsForLevel = function(level) {
  return this.currentUser && this.currentUser.stars ? 
    (this.currentUser.stars[level] || CONFIG.DEFAULTS.INITIAL_STARS) : 
    CONFIG.DEFAULTS.INITIAL_STARS;
};

GameState.prototype.getAllStars = function() {
  return this.currentUser && this.currentUser.stars ? 
    this.currentUser.stars : {};
};

GameState.prototype.setCurrentLevel = function(level) {
  if (this.currentUser) {
    this.currentUser.level = level;
    this.saveUsersToStorage();
    this._notifyListeners("levelChanged", { level: level });
  }
};

GameState.prototype.advanceLevel = function() {
  if (this.currentUser && this.currentUser.level < CONFIG.DEFAULTS.TOTAL_LEVELS) {
    this.currentUser.level++;
    this.saveUsersToStorage();
    this._notifyListeners("levelChanged", { level: this.currentUser.level });
  }
};

GameState.prototype.setStarsForLevel = function(level, stars) {
  if (this.currentUser) {
    this.currentUser.stars[level] = stars;
    this.saveUsersToStorage();
    this._notifyListeners("starsChanged", { level: level, stars: stars });
  }
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
  this.setStarsForLevel(this.getCurrentLevel(), stars);
  return stars;
};

GameState.prototype.resetCareer = function() {
  if (this.currentUser) {
    this.currentUser.level = CONFIG.DEFAULTS.CURRENT_LEVEL;
    this.currentUser.stars = {};
    this.saveUsersToStorage();
    this._notifyListeners("careerReset", {});
  }
};

GameState.prototype.getProgressPercent = function() {
  return ((this.getCurrentLevel() - 1) / CONFIG.DEFAULTS.TOTAL_LEVELS) * 100;
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