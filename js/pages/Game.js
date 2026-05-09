/**
 * Game.js - Página principal do jogo
 * Renderiza o layout do jogo (Sidebar, Workspace, Stage) e gerencia execução
 * Comentários em português do Brasil
 */

import { gameState } from "../state.js";
import DOM from "../dom.js";
import { getLevelConfig } from "../config-levels.js";
import LEVEL_HINTS from "../data/level-hints.js";

import { TopBar } from "../components/TopBar.js";
import { Sidebar } from "../components/Sidebar.js";
import { Workspace } from "../components/Workspace.js";
import { Stage } from "../components/Stage.js";
import { DragDrop } from "../components/DragDrop.js";
import { Modal } from "../components/Modal.js";
import { Parser } from "../engine/parser.js";
import { Runner } from "../engine/runner.js";
import { Toast } from "../components/Toast.js";

const Game = function(container) {
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
  const topBarContainer = DOM.getTopBarContainer();
  const sidebarContainer = DOM.getSidebarContainer();
  const workspaceContainer = DOM.getWorkspaceContainer();
  const stageContainer = DOM.getStageContainer();

  this.topBar = new TopBar(topBarContainer);
  this.sidebar = new Sidebar(sidebarContainer);
  this.workspace = new Workspace(workspaceContainer);
  this.stage = new Stage(stageContainer);
  this.modal = new Modal();
  this.parser = new Parser(this.workspace.getWorkspaceElement());
  this.runner = new Runner(this.stage);

  this.dragDrop = new DragDrop(
    this.sidebar.getPaletteElement(),
    this.workspace.getWorkspaceElement(),
    this.workspace
  );

  this.dragDrop.setMaxBlocks(gameState.getMaxBlocks());

  topBarContainer.componentInstance = this.topBar;
  sidebarContainer.componentInstance = this.sidebar;
  workspaceContainer.componentInstance = this.workspace;
  stageContainer.componentInstance = this.stage;

  // Carrega configuração do nível atual
  this.loadLevelConfig();
};

Game.prototype.setupListeners = function() {
  const self = this;
  const workspaceContainer = DOM.getWorkspaceContainer();

  // Listener para mudança de nível
  document.addEventListener("levelSelected", function(e) {
    self.handleLevelSelected(e.detail.level);
  });

  workspaceContainer.addEventListener("blockCountChanged", function(e) {
    const maxBlocks = gameState.getMaxBlocks();
    self.stage.updateBlockCounter(e.detail.count);
  });

  const stageContainer = DOM.getStageContainer();
  stageContainer.addEventListener("stageRun", function() { self.runCode(); });
  stageContainer.addEventListener("stagePause", function() { self.togglePause(); });
  stageContainer.addEventListener("stageClear", function() { self.clearWorkspace(); });

  document.addEventListener("levelComplete", function(e) {
    if (e.detail.success) {
      self.handleLevelComplete();
    }
  });

  document.addEventListener("levelFailed", function(e) {
    if (e.detail.reason === "trap") {
      self.handleLevelFailed();
    }
  });

  document.addEventListener("executionComplete", function(e) {
    if (e.detail.reachedEnd) {
      self.handleExecutionComplete();
    }
  });

  document.addEventListener("saveWorkspace", function() {
    self.saveWorkspaceBlocks();
  });

  document.addEventListener("loadWorkspace", function() {
    self.loadWorkspaceBlocks();
  });
};

Game.prototype.saveWorkspaceBlocks = function() {
  if (this.workspace) {
    const blocksData = this.workspace.exportBlocks();
    gameState.saveWorkspaceBlocks(blocksData);
  }
};

Game.prototype.loadWorkspaceBlocks = function() {
  if (this.workspace) {
    const blocksData = gameState.getWorkspaceBlocks();
    if (blocksData && blocksData.length > 0) {
      this.workspace.importBlocks(blocksData);
    }
  }
};

Game.prototype.runCode = function() {
  const self = this;
  const stageContainer = DOM.getStageContainer();
  const runButton = stageContainer.querySelector(".btn--run");

  if (runButton && runButton.dataset.retryMode === "true") {
    this.resetStageFromRetry();
    return;
  }

  const totalBlocks = this.parser.countBlocks();
  const maxBlocks = gameState.getMaxBlocks();

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
  const instructions = this.parser.parse();

  if (instructions.length === 0) {
    alert("Adicione blocos ao workspace antes de executar!");
    return;
  }

  this.disableExecutionButtons();
  this.stage.enablePauseButton();
  this.stage.setResumeToPause();
  this.stage.reset();
  this.runner.run(instructions);
};

Game.prototype.disableExecutionButtons = function() {
  const stageContainer = DOM.getStageContainer();
  const runButton = stageContainer.querySelector(".btn--run");
  const clearButton = stageContainer.querySelector(".btn--clear");

  if (runButton) {
    runButton.classList.add("btn--disabled");
    runButton.disabled = true;
  }

  if (clearButton) {
    clearButton.classList.add("btn--disabled");
    clearButton.disabled = true;
  }
};

Game.prototype.enableExecutionButtons = function() {
  const stageContainer = DOM.getStageContainer();
  const runButton = stageContainer.querySelector(".btn--run");
  const clearButton = stageContainer.querySelector(".btn--clear");

  if (runButton) {
    runButton.classList.remove("btn--disabled");
    runButton.disabled = false;
  }

  if (clearButton) {
    clearButton.classList.remove("btn--disabled");
    clearButton.disabled = false;
  }
};

Game.prototype.togglePause = function() {
  if (this.runner.paused) {
    this.runner.resume();
    this.stage.setResumeToPause();
    this.disableExecutionButtons();
  } else {
    this.runner.pause();
    this.stage.setPauseToResume();
    this.enableExecutionButtons();
  }
};

Game.prototype.handleLevelFailed = function() {
  this.clearExecutingBlocks();
  this.enableExecutionButtons();
  this.stage.disablePauseButton();

  const self = this;
  const contentHtml = Modal.createLevelFailedHtml();

  const modalOpened = this.modal.open(contentHtml);

  const retryBtn = this.modal.modalElement.querySelector(".btn");
  if (retryBtn) {
    retryBtn.addEventListener("click", function() {
      self.modal.close();
      self.stage.reset();
      self.setRetryButtonToRun();
    });
  }

  this.setRunButtonToRetry();
};

Game.prototype.handleExecutionComplete = function() {
  this.enableExecutionButtons();
  this.stage.disablePauseButton();
  this.setRunButtonToRetry();
};

Game.prototype.setRunButtonToRetry = function() {
  const stageContainer = DOM.getStageContainer();
  const runButton = stageContainer.querySelector(".btn--run");

  if (runButton) {
    runButton.innerHTML = '<span class="material-symbols-outlined">replay</span> Tentar Novamente';
    runButton.dataset.retryMode = "true";
  }
};

Game.prototype.setRetryButtonToRun = function() {
  const stageContainer = DOM.getStageContainer();
  const runButton = stageContainer.querySelector(".btn--run");

  if (runButton) {
    runButton.innerHTML = '<span class="material-symbols-outlined">play_circle</span> EXECUTAR';
    runButton.dataset.retryMode = "false";
  }
};

Game.prototype.resetStageFromRetry = function() {
  this.stage.reset();
  this.setRetryButtonToRun();
  Toast.hide(true);
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
  gameState.clearWorkspaceBlocks();
  this.stage.disablePauseButton();
  this.setRetryButtonToRun();
  Toast.hide(true);
};

Game.prototype.handleLevelComplete = function() {
  this.clearExecutingBlocks();

  if (this.runner.running) {
    this.runner.stop();
  }

  this.enableExecutionButtons();
  this.stage.disablePauseButton();

  const totalBlocks = this.parser.countBlocks();
  const maxBlocks = gameState.getMaxBlocks();

  const stars = gameState.completeLevel(totalBlocks);

  if (gameState.getCurrentLevel() >= gameState.getTotalLevels()) {
    this.showGameCompleteModal(stars);
  } else {
    this.showLevelCompleteModal(stars, maxBlocks, totalBlocks);
  }
};

Game.prototype.clearExecutingBlocks = function() {
  const workspaceContainer = DOM.getWorkspaceContainer();
  const executingBlocks = workspaceContainer.querySelectorAll(".executing");
  executingBlocks.forEach(function(block) {
    block.classList.remove("executing");
  });
};

Game.prototype.showLevelCompleteModal = function(stars, maxBlocks, usedBlocks) {
  const self = this;
  const contentHtml = Modal.createLevelCompleteHtml(stars, maxBlocks, usedBlocks);

  this.modal.open(contentHtml);

  const nextLevelBtn = this.modal.modalElement.querySelector(".btn");
  if (nextLevelBtn) {
    nextLevelBtn.addEventListener("click", function() {
      self.modal.close();
      gameState.advanceLevel();
      self.clearWorkspace();
      self.loadLevelConfig();
      self.updateUI();
    });
  }

  this.setRunButtonToRetry();
};

Game.prototype.showGameCompleteModal = function(finalStars) {
  const self = this;
  const contentHtml = Modal.createGameCompleteHtml(finalStars);

  this.modal.open(contentHtml);

  const restartBtn = this.modal.modalElement.querySelector(".btn");
  if (restartBtn) {
    restartBtn.addEventListener("click", function() {
      self.modal.close();
      self.restartCareer();
    });
  }

  this.setRunButtonToRetry();
};

Game.prototype.restartCareer = function() {
  gameState.resetCareer();
  DOM.clearWorkspaceVisual();
  this.clearWorkspace();
  this.loadLevelConfig();
  this.updateUI();
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
};

export default Game;
export { Game };

/**
 * Carrega a configuração do nível atual e aplica no Stage
 */
Game.prototype.loadLevelConfig = function() {
  const currentLevel = gameState.getCurrentLevel();
  const levelConfig = getLevelConfig(currentLevel);
  
  if (levelConfig) {
    this.stage.setLevelConfig(levelConfig);
    this.stage.updateTitle(currentLevel);
    this.stage.updateBlockCounter(0);

    // Remove qualquer toast anterior antes de exibir o novo
    Toast.hide();

    // Exibe hint do nível
    var hint = LEVEL_HINTS[currentLevel];
    if (hint) {
      Toast.show(hint, 15000, null, "info");
    }
  }
};