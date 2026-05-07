/**
 * Game.js - Página principal do jogo
 * Renderiza o layout do jogo (Sidebar, Workspace, Stage) e gerencia execução
 * Comentários em português do Brasil
 */

import { gameState } from "../state.js";
import DOM from "../dom.js";
import { getLevelConfig } from "../config-levels.js";

import { TopBar } from "../components/TopBar.js";
import { Sidebar } from "../components/Sidebar.js";
import { Workspace } from "../components/Workspace.js";
import { Stage } from "../components/Stage.js";
import { DragDrop } from "../components/DragDrop.js";
import { Modal } from "../components/Modal.js";
import { Parser } from "../engine/parser.js";
import { Runner } from "../engine/runner.js";

var Game = function(container) {
  this.container = container;
  this.render();
};

Game.prototype.render = function() {
  DOM.renderAppLayout();
  this.initComponents();
  this.setupListeners();
  DOM.updateUIFromState();
};

Game.prototype.initComponents = function() {
  var topBarContainer = DOM.getTopBarContainer();
  var sidebarContainer = DOM.getSidebarContainer();
  var workspaceContainer = DOM.getWorkspaceContainer();
  var stageContainer = DOM.getStageContainer();

  this.topBar = new TopBar(topBarContainer);
  this.sidebar = new Sidebar(sidebarContainer);
  this.workspace = new Workspace(workspaceContainer);
  this.stage = new Stage(stageContainer);
  this.modal = new Modal();
  this.parser = new Parser();
  this.runner = new Runner(this.stage);

  this.dragDrop = new DragDrop(
    this.sidebar.getPaletteElement(),
    this.workspace.getWorkspaceElement(),
    this.workspace
  );

  topBarContainer.componentInstance = this.topBar;
  sidebarContainer.componentInstance = this.sidebar;
  workspaceContainer.componentInstance = this.workspace;
  stageContainer.componentInstance = this.stage;

  // Carrega configuração do nível atual
  this.loadLevelConfig();
};

Game.prototype.setupListeners = function() {
  var self = this;
  var workspaceContainer = DOM.getWorkspaceContainer();

  // Listener para mudança de nível
  document.addEventListener("levelSelected", function(e) {
    self.handleLevelSelected(e.detail.level);
  });

  workspaceContainer.addEventListener("blockCountChanged", function(e) {
    var maxBlocks = gameState.getMaxBlocks();
    self.stage.updateBlockCounter(e.detail.count);
  });

  var stageContainer = DOM.getStageContainer();
  stageContainer.addEventListener("stageRun", function() { self.runCode(); });
  stageContainer.addEventListener("stagePause", function() { self.togglePause(); });
  stageContainer.addEventListener("stageClear", function() { self.clearWorkspace(); });

  document.addEventListener("levelComplete", function(e) {
    if (e.detail.success) {
      self.handleLevelComplete();
    }
  });
};

Game.prototype.runCode = function() {
  var self = this;
  var totalBlocks = this.parser.countBlocks();
  var maxBlocks = gameState.getMaxBlocks();

  if (totalBlocks > maxBlocks) {
    alert("Você excedeu o limite de blocos! Máximo: " + maxBlocks + ", usados: " + totalBlocks + ".");
  }

  if (this.runner.running) {
    this.runner.stop();
    setTimeout(function() {
      self.executeInstructions();
    }, 100);
  } else {
    this.executeInstructions();
  }
};

Game.prototype.executeInstructions = function() {
  var instructions = this.parser.parse();

  if (instructions.length === 0) {
    alert("Adicione blocos ao workspace antes de executar!");
    return;
  }

  this.stage.reset();
  this.runner.run(instructions);
};

Game.prototype.togglePause = function() {
  if (this.runner.paused) {
    this.runner.resume();
  } else {
    this.runner.pause();
  }
};

Game.prototype.clearWorkspace = function() {
  if (this.runner.running) {
    this.runner.stop();
  }

  this.workspace.clear();
  if (this.dragDrop) {
    this.dragDrop.clearWorkspace();
  }
  this.stage.reset();
};

Game.prototype.handleLevelComplete = function() {
  var totalBlocks = this.parser.countBlocks();
  var maxBlocks = gameState.getMaxBlocks();

  var stars = gameState.completeLevel(totalBlocks);

  if (gameState.getCurrentLevel() >= gameState.getTotalLevels()) {
    this.showGameCompleteModal(stars);
  } else {
    this.showLevelCompleteModal(stars, maxBlocks, totalBlocks);
  }
};

Game.prototype.showLevelCompleteModal = function(stars, maxBlocks, usedBlocks) {
  var self = this;
  var contentHtml = Modal.createLevelCompleteHtml(stars, maxBlocks, usedBlocks);

  this.modal.open(contentHtml).then(function() {
    var nextLevelBtn = self.modal.modalElement.querySelector("#nextLevelBtn");
    if (nextLevelBtn) {
      nextLevelBtn.addEventListener("click", function() {
        self.modal.close();
        gameState.advanceLevel();
        self.clearWorkspace();
      });
    }
  });
};

Game.prototype.showGameCompleteModal = function(finalStars) {
  var self = this;
  var contentHtml = Modal.createGameCompleteHtml(finalStars);

  this.modal.open(contentHtml).then(function() {
    var restartBtn = self.modal.modalElement.querySelector("#restartCareerBtn");
    if (restartBtn) {
      restartBtn.addEventListener("click", function() {
        self.modal.close();
        self.restartCareer();
      });
    }
  });
};

Game.prototype.restartCareer = function() {
  gameState.resetCareer();
  DOM.clearWorkspaceVisual();
  this.clearWorkspace();
};

Game.prototype.handleLevelSelected = function(level) {
  gameState.setCurrentLevel(level);
  this.clearWorkspace();
  this.loadLevelConfig();
  this.updateUI();
};

Game.prototype.updateUI = function() {
  this.topBar.updateLevel(gameState.getCurrentLevel(), gameState.getTotalLevels());
  this.topBar.updateStars(gameState.getStarsForLevel(gameState.getCurrentLevel()));
  this.topBar.updateProgress(gameState.getProgressPercent());
  this.stage.updateTitle(gameState.getCurrentLevel());
  this.loadLevelConfig();
};

export default Game;
export { Game };

/**
 * Carrega a configuração do nível atual e aplica no Stage
 */
Game.prototype.loadLevelConfig = function() {
  var currentLevel = gameState.getCurrentLevel();
  var levelConfig = getLevelConfig(currentLevel);
  
  if (levelConfig) {
    this.stage.setLevelConfig(levelConfig);
    this.stage.updateTitle(currentLevel);
    this.stage.updateBlockCounter(0);
  }
};