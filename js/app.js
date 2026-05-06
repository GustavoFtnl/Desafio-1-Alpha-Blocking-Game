/**
 * app.js - Ponto de entrada principal da aplicação
 * Orquestra componentes, eventos e execução
 * Comentários em português do Brasil
 */

import CONFIG from "./config.js";
import { gameState } from "./state.js";
import DOM from "./dom.js";

import { TopBar } from "./components/TopBar.js";
import { Sidebar } from "./components/Sidebar.js";
import { Workspace } from "./components/Workspace.js";
import { Stage } from "./components/Stage.js";
import { DragDrop } from "./components/DragDrop.js";
import { Modal } from "./components/Modal.js";
import { Parser } from "./engine/parser.js";
import { Runner } from "./engine/runner.js";

var App = function() {
  this.init();
};

App.prototype.init = function() {
  DOM.init();
  gameState.init();

  this.initComponents();
  this.setupEventListeners();
  DOM.updateUIFromState();
};

App.prototype.initComponents = function() {
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
    this.workspace.getWorkspaceElement()
  );

  topBarContainer.componentInstance = this.topBar;
  sidebarContainer.componentInstance = this.sidebar;
  workspaceContainer.componentInstance = this.workspace;
  stageContainer.componentInstance = this.stage;
};

App.prototype.setupEventListeners = function() {
  var workspaceContainer = DOM.getWorkspaceContainer();
  var self = this;

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

  gameState.addListener(function(event, data) {
    if (event === "levelChanged" || event === "starsChanged") {
      self.updateUIFromState();
    }
  });
};

App.prototype.runCode = function() {
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

App.prototype.executeInstructions = function() {
  var instructions = this.parser.parse();

  if (instructions.length === 0) {
    alert("Adicione blocos ao workspace antes de executar!");
    return;
  }

  this.stage.reset();
  this.runner.run(instructions);
};

App.prototype.togglePause = function() {
  if (this.runner.paused) {
    this.runner.resume();
  } else {
    this.runner.pause();
  }
};

App.prototype.clearWorkspace = function() {
  if (this.runner.running) {
    this.runner.stop();
  }

  this.workspace.clear();
  this.stage.reset();
};

App.prototype.handleLevelComplete = function() {
  var totalBlocks = this.parser.countBlocks();
  var maxBlocks = gameState.getMaxBlocks();

  var stars = gameState.completeLevel(totalBlocks);

  if (gameState.getCurrentLevel() >= gameState.getTotalLevels()) {
    this.showGameCompleteModal(stars);
  } else {
    this.showLevelCompleteModal(stars, maxBlocks, totalBlocks);
  }
};

App.prototype.showLevelCompleteModal = function(stars, maxBlocks, usedBlocks) {
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

App.prototype.showGameCompleteModal = function(finalStars) {
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

App.prototype.restartCareer = function() {
  gameState.resetCareer();
  DOM.clearWorkspaceVisual();
  this.clearWorkspace();
};

App.prototype.updateUIFromState = function() {
  this.topBar.updateLevel(gameState.getCurrentLevel(), gameState.getTotalLevels());
  this.topBar.updateStars(gameState.getStarsForLevel(gameState.getCurrentLevel()));
  this.topBar.updateProgress(gameState.getProgressPercent());
  this.stage.setMaxBlocks(gameState.getMaxBlocks());
};

document.addEventListener("DOMContentLoaded", function() {
  new App();
});