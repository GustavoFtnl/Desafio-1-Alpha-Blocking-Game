/**
 * Game.js - Página principal do jogo
 * Renderiza o layout do jogo (Sidebar, Workspace, Stage) e gerencia execução
 * Comentários em português do Brasil
 */

import { gameState } from "../state.js";
import DOM from "../dom.js";
import { getLevelConfig } from "../utils/configLevels.js";
import LEVEL_HINTS from "../utils/levelHints.js";

import { TopBar } from "../components/TopBar.js";
import { Sidebar } from "../components/Sidebar.js";
import { Workspace } from "../components/Workspace.js";
import { Stage } from "../components/Stage.js";
import { DragDrop } from "../components/DragDrop.js";
import { Modal } from "../components/Modal.js";
import { Parser } from "../engine/parser.js";
import { Runner } from "../engine/runner.js";
import { Toast } from "../components/Toast.js";

const Game = function (container) {
  this.container = container;
  this.isMobileStageOpen = false;
  this.levelCompleteHandled = false;
  this.lastLevelCompleteTime = 0;
  this.render();
};

Game.prototype.render = function () {
  DOM.renderAppLayout();
  this.initComponents();
  this.setupListeners();
  DOM.updateUIFromState();
};

Game.prototype.initComponents = function () {
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
    this.workspace,
  );

  this.dragDrop.setMaxBlocks(gameState.getMaxBlocks());

  topBarContainer.componentInstance = this.topBar;
  sidebarContainer.componentInstance = this.sidebar;
  workspaceContainer.componentInstance = this.workspace;
  stageContainer.componentInstance = this.stage;

  // Carrega configuração do nível atual
  this.loadLevelConfig();
};

Game.prototype.setupListeners = function () {
  const self = this;
  const workspaceContainer = DOM.getWorkspaceContainer();

  // Listener para mudança de nível
  document.addEventListener("levelSelected", function (e) {
    self.handleLevelSelected(e.detail.level);
  });

  workspaceContainer.addEventListener("blockCountChanged", function (e) {
    const maxBlocks = gameState.getMaxBlocks();
    self.stage.updateBlockCounter(e.detail.count);
  });

  document.addEventListener("levelComplete", function (e) {
    if (e.detail.success) {
      self.handleLevelComplete();
    }
  });

  document.addEventListener("levelFailed", function (e) {
    if (e.detail.reason === "trap") {
      self.handleLevelFailed();
    }
  });

  document.addEventListener("executionComplete", function (e) {
    if (e.detail.reachedEnd) {
      self.handleExecutionComplete();
    }
  });

  document.addEventListener("saveWorkspace", function () {
    self.saveWorkspaceBlocks();
  });

  document.addEventListener("loadWorkspace", function () {
    self.loadWorkspaceBlocks();
  });

  // Sidebar mobile
  const floatingBtn = document.getElementById("floatingSidebarBtn");
  if (floatingBtn) {
    floatingBtn.addEventListener("click", function () {
      self.openMobileSidebar();
    });
  }

  // Stage mobile
  const floatingStageBtn = document.getElementById("floatingStageBtn");
  if (floatingStageBtn) {
    floatingStageBtn.addEventListener("click", function () {
      self.openMobileStage();
    });
  }

  // Eventos globais para controles do stage (funciona com stageClone também)
  document.addEventListener("stageRun", function () {
    self.runCode();
  });
  document.addEventListener("stagePause", function () {
    self.togglePause();
  });
  document.addEventListener("stageClear", function () {
    self.clearWorkspace();
  });

  // Atualizar stage ao redimensionar para desktop
  window.addEventListener("resize", function () {
    if (window.innerWidth >= 769) {
      self.moveStageContentBack();
    }
  });
};

Game.prototype.saveWorkspaceBlocks = function () {
  if (this.workspace) {
    const blocksData = this.workspace.exportBlocks();
    gameState.saveWorkspaceBlocks(blocksData);
  }
};

Game.prototype.loadWorkspaceBlocks = function () {
  if (this.workspace) {
    const blocksData = gameState.getWorkspaceBlocks();
    if (blocksData && blocksData.length > 0) {
      this.workspace.importBlocks(blocksData);
    }
  }
};

Game.prototype.runCode = function () {
  const self = this;
  const stageContainer = DOM.getStageContainer();
  const runButton = stageContainer.querySelector(".btn--run");

  if (runButton && runButton.dataset.retryMode === "true") {
    this.resetStageFromRetry();
    return;
  }

  // Se está pausado, apenas retoma a execução sem resetar o stage
  if (this.runner.paused) {
    this.runner.resume();
    this.stage.setResumeToPause();
    this.disableExecutionButtons();
    return;
  }

  if (this.runner.running) {
    this.runner.stop();
    setTimeout(function () {
      self.executeInstructions();
    }, 100);
  } else {
    this.executeInstructions();
  }
};

Game.prototype.executeInstructions = function () {
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

Game.prototype.disableExecutionButtons = function () {
  const stageContainer = DOM.getStageContainer();
  const mobileContent = document.querySelector(".stageMobileContent");
  const runButton =
    stageContainer.querySelector(".btn--run") ||
    mobileContent?.querySelector(".btn--run");
  const clearButton =
    stageContainer.querySelector(".btn--clear") ||
    mobileContent?.querySelector(".btn--clear");

  if (runButton) {
    runButton.classList.add("btn--disabled");
    runButton.disabled = true;
  }

  if (clearButton) {
    clearButton.classList.add("btn--disabled");
    clearButton.disabled = true;
  }
};

Game.prototype.enableExecutionButtons = function () {
  const stageContainer = DOM.getStageContainer();
  const mobileContent = document.querySelector(".stageMobileContent");
  const runButton =
    stageContainer.querySelector(".btn--run") ||
    mobileContent?.querySelector(".btn--run");
  const clearButton =
    stageContainer.querySelector(".btn--clear") ||
    mobileContent?.querySelector(".btn--clear");

  if (runButton) {
    runButton.classList.remove("btn--disabled");
    runButton.disabled = false;
  }

  if (clearButton) {
    clearButton.classList.remove("btn--disabled");
    clearButton.disabled = false;
  }
};

Game.prototype.togglePause = function () {
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

Game.prototype.handleLevelFailed = function () {
  this.levelCompleteHandled = false;
  this.lastLevelCompleteTime = 0;
  this.clearExecutingBlocks();
  this.enableExecutionButtons();
  this.stage.disablePauseButton();

  const self = this;
  const contentHtml = Modal.createLevelFailedHtml();

  const modalOpened = this.modal.open(contentHtml);

  const retryBtn = this.modal.modalElement.querySelector(".btn");
  if (retryBtn) {
    retryBtn.addEventListener("click", function () {
      self.modal.close();
      self.stage.reset();
      self.setRetryButtonToRun();
    });
  }

  this.setRunButtonToRetry();
};

Game.prototype.handleExecutionComplete = function () {
  this.enableExecutionButtons();
  this.stage.disablePauseButton();
  this.setRunButtonToRetry();
};

Game.prototype.setRunButtonToRetry = function () {
  const stageContainer = DOM.getStageContainer();
  const runButton = stageContainer.querySelector(".btn--run");

  if (runButton) {
    runButton.innerHTML =
      '<span class="material-symbols-outlined">replay</span> Tentar Novamente';
    runButton.dataset.retryMode = "true";
  }
};

Game.prototype.setRetryButtonToRun = function () {
  const stageContainer = DOM.getStageContainer();
  const runButton = stageContainer.querySelector(".btn--run");

  if (runButton) {
    runButton.innerHTML =
      '<span class="material-symbols-outlined">play_circle</span> EXECUTAR';
    runButton.dataset.retryMode = "false";
  }
};

Game.prototype.resetStageFromRetry = function () {
  this.levelCompleteHandled = false;
  this.lastLevelCompleteTime = 0;
  this.stage.reset();
  this.setRetryButtonToRun();
  Toast.hide(true);
};

Game.prototype.clearWorkspace = function () {
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

Game.prototype.handleLevelComplete = function () {
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

Game.prototype.clearExecutingBlocks = function () {
  const workspaceContainer = DOM.getWorkspaceContainer();
  const executingBlocks = workspaceContainer.querySelectorAll(".executing");
  executingBlocks.forEach(function (block) {
    block.classList.remove("executing");
  });
};

Game.prototype.showLevelCompleteModal = function (
  stars,
  maxBlocks,
  usedBlocks,
) {
  const self = this;
  const contentHtml = Modal.createLevelCompleteHtml(
    stars,
    maxBlocks,
    usedBlocks,
  );

  this.modal.open(contentHtml);

  const nextLevelBtn = this.modal.modalElement.querySelector(".btn");
  if (nextLevelBtn) {
    nextLevelBtn.addEventListener("click", function () {
      self.modal.close();
      gameState.advanceLevel();
      self.clearWorkspace();
      self.loadLevelConfig();
      self.updateUI();
    });
  }

  this.setRunButtonToRetry();
};

Game.prototype.showGameCompleteModal = function (finalStars) {
  const self = this;
  const contentHtml = Modal.createGameCompleteHtml(finalStars);

  this.modal.open(contentHtml);

  const restartBtn = this.modal.modalElement.querySelector(".btn");
  if (restartBtn) {
    restartBtn.addEventListener("click", function () {
      self.modal.close();
      self.restartCareer();
    });
  }

  this.setRunButtonToRetry();
};

Game.prototype.restartCareer = function () {
  gameState.resetCareer();
  DOM.clearWorkspaceVisual();
  this.clearWorkspace();
  this.loadLevelConfig();
  this.updateUI();
};

Game.prototype.handleLevelSelected = function (level) {
  gameState.setCurrentLevel(level);
  this.clearWorkspace();
  this.loadLevelConfig();
  this.updateUI();
};

Game.prototype.updateUI = function () {
  this.topBar.updateLevel(
    gameState.getCurrentLevel(),
    gameState.getTotalLevels(),
  );
  this.topBar.updateStars(
    gameState.getStarsForLevel(gameState.getCurrentLevel()),
  );
  this.topBar.updateProgress(gameState.getProgressPercent());
  this.stage.updateTitle(gameState.getCurrentLevel());
};

Game.prototype.openMobileSidebar = function () {
  let overlay = document.querySelector(".sidebarOverlay");
  let mobileSidebar = document.querySelector(".sidebarMobile");

  if (!overlay) {
    const root = document.getElementById("root");
    root.insertAdjacentHTML(
      "beforeend",
      '<div class="sidebarOverlay" id="sidebarOverlay">' +
        '<div class="sidebarMobile">' +
        '<div class="sidebarMobileHeader">' +
        '<h2 class="sidebarMobileTitle">Biblioteca</h2>' +
        '<button class="sidebarMobileClose" aria-label="Fechar">' +
        '<span class="material-symbols-outlined">close</span>' +
        "</button>" +
        "</div>" +
        '<div class="sidebarMobileContent"></div>' +
        "</div>" +
        "</div>",
    );
    overlay = document.getElementById("sidebarOverlay");
    mobileSidebar = document.querySelector(".sidebarMobile");
  }

  const content = mobileSidebar.querySelector(".sidebarMobileContent");
  if (content) {
    const blockConfigs = this.sidebar.getBlockConfigs();
    const blocksHtml = blockConfigs
      .map(function (config) {
        const block = document.createElement("div");
        block.className = "block " + config.type;
        block.setAttribute("draggable", "true");
        block.setAttribute("aria-label", "Bloco de comando: " + config.text);
        block.setAttribute("aria-grabbed", "false");

        const iconSpan = document.createElement("span");
        iconSpan.className = "material-symbols-outlined blockIcon";
        iconSpan.textContent = config.icon || "";

        const textSpan = document.createElement("span");
        textSpan.className = "block_text";
        textSpan.textContent = config.text;

        block.appendChild(iconSpan);
        block.appendChild(textSpan);

        if (config.type === "block--repeat") {
          const inputWrapper = document.createElement("div");
          inputWrapper.className = "blockRepeatInputWrapper";

          const decrementBtn = document.createElement("button");
          decrementBtn.type = "button";
          decrementBtn.className = "blockRepeatBtn blockRepeatBtn--decrement";
          decrementBtn.textContent = "-";
          decrementBtn.setAttribute("aria-label", "Diminuir");
          decrementBtn.disabled = true;

          const input = document.createElement("input");
          input.type = "number";
          input.className = "blockRepeatInput";
          input.value = 1;
          input.min = 1;
          input.max = 10;
          input.disabled = true;
          input.setAttribute("aria-label", "Quantidade de repetições");

          const incrementBtn = document.createElement("button");
          incrementBtn.type = "button";
          incrementBtn.className = "blockRepeatBtn blockRepeatBtn--increment";
          incrementBtn.textContent = "+";
          incrementBtn.setAttribute("aria-label", "Aumentar");
          incrementBtn.disabled = true;

          inputWrapper.appendChild(decrementBtn);
          inputWrapper.appendChild(input);
          inputWrapper.appendChild(incrementBtn);
          block.appendChild(inputWrapper);
        }

        return block.outerHTML;
      })
      .join("");

    content.innerHTML =
      '<div class="sidebar_title">' +
      '<span class="material-symbols-outlined sidebar_titleIcon">psychology</span>' +
      '<h2 class="sidebar_titleText">Biblioteca</h2>' +
      "</div>" +
      '<p class="sidebar_subtitle">Arraste os blocos</p>' +
      '<div class="blockPalette">' +
      blocksHtml +
      "</div>";

    const palette = content.querySelector(".blockPalette");
    if (palette) {
      this.dragDrop.setupMobilePalette(palette);
      this.dragDrop.setMobileSidebarCloseCallback(
        this.closeMobileSidebar.bind(this),
      );
    }
  }

  overlay.classList.add("active");

  const closeBtn = overlay.querySelector(".sidebarMobileClose");
  if (closeBtn) {
    closeBtn.addEventListener("click", this.closeMobileSidebar.bind(this));
  }

  overlay.addEventListener(
    "click",
    function (e) {
      if (e.target === overlay) {
        this.closeMobileSidebar();
      }
    }.bind(this),
  );
};

Game.prototype.closeMobileSidebar = function () {
  const overlay = document.querySelector(".sidebarOverlay");
  if (overlay) {
    overlay.classList.remove("active");
  }
};

Game.prototype.openMobileStage = function () {
  let overlay = document.querySelector(".stageOverlay");
  let mobileStage = document.querySelector(".stageMobile");

  if (!overlay) {
    const root = document.getElementById("root");
    root.insertAdjacentHTML(
      "beforeend",
      '<div class="stageOverlay" id="stageOverlay">' +
        '<div class="stageMobile">' +
        '<div class="stageMobileHeader">' +
        '<h2 class="stageMobileTitle">Mapa do Jogo</h2>' +
        '<button class="stageMobileClose" aria-label="Fechar">' +
        '<span class="material-symbols-outlined">close</span>' +
        "</button>" +
        "</div>" +
        '<div class="stageMobileContent"></div>' +
        "</div>" +
        "</div>",
    );
    overlay = document.getElementById("stageOverlay");
    mobileStage = document.querySelector(".stageMobile");
  }

  const content = mobileStage.querySelector(".stageMobileContent");
  if (content) {
    const stageContent = this.stage.container.querySelector(".stageContent");
    if (stageContent && stageContent.parentElement !== content) {
      content.innerHTML = "";
      content.appendChild(stageContent);
    }
  }

  overlay.classList.add("active");
  this.bindMobileStageButtons();
};

Game.prototype.bindMobileStageButtons = function () {
  const self = this;
  const overlay = document.querySelector(".stageOverlay");
  const closeBtn = overlay ? overlay.querySelector(".stageMobileClose") : null;

  if (closeBtn) {
    closeBtn.onclick = function () {
      self.closeMobileStage();
    };
  }

  if (overlay) {
    overlay.onclick = function (e) {
      if (e.target === overlay) {
        self.closeMobileStage();
      }
    };
  }
};

Game.prototype.closeMobileStage = function () {
  const overlay = document.querySelector(".stageOverlay");
  if (overlay) {
    overlay.classList.remove("active");
  }
};

Game.prototype.moveStageContentBack = function () {
  const mobileContent = document.querySelector(".stageMobileContent");
  const stageContent = mobileContent
    ? mobileContent.querySelector(".stageContent")
    : null;
  const stageContainer = this.stage ? this.stage.container : null;

  if (
    stageContent &&
    stageContainer &&
    !stageContainer.contains(stageContent)
  ) {
    stageContainer.appendChild(stageContent);
  }
};

Game.prototype.closeMobileStage = function () {
  this.isMobileStageOpen = false;
  const overlay = document.querySelector(".stageOverlay");
  if (overlay) {
    overlay.classList.remove("active");
  }
};

export default Game;
export { Game };

/**
 * Carrega a configuração do nível atual e aplica no Stage
 */
Game.prototype.loadLevelConfig = function () {
  this.levelCompleteHandled = false;
  this.lastLevelCompleteTime = 0;
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
