/**
 * Stage.js - Gerencia a posição e rotação do ator no grid 10x10
 * Renderiza dinamicamente o grid, ator e controles
 * Direções: 0=cima, 1=direita, 2=baixo, 3=esquerda
 * Comentários em português do Brasil conforme AGENTS.md
 */

import { Toast } from "./Toast.js";
import * as stageHelpers from "../utils/stageHelpers.js";
import { ELEMENT_TYPES, GRID_LENGTH } from "../utils/elementTypes.js";

export class Stage {
  /**
   * Construtor do Stage
   * @param {HTMLElement} container - Elemento section.stageContainer do DOM
   */
  constructor(container) {
    this.container = container;

    // Configurações do grid
    this.gridSize = 10;
    this.cellSize = 40; // será calculado baseado no tamanho

    // Estado inicial do ator
    this.x = 0; // Canto superior esquerdo (0,0)
    this.y = 0;

    this.maxBlocks = 8;
    this.currentLevel = 1;

    // Elementos do nível
    this.currentLevelConfig = null;
    this.start = { x: 0, y: 0 };
    this.walls = [];
    this.holes = [];
    this.doors = [];
    this.keys = [];
    this.doorOpen = false;
    this.traps = [];
    this.fireTraps = [];
    this.fireTrapActive = false;
    this.trophy = { x: 0, y: 0 };

    this.stageGrid = null;
    this.actor = null;
    this.stageCells = null;
    this.controlsArea = null;

    this.render();
  }

  /**
   * Renderiza toda a estrutura do Stage dinamicamente
   */
  render() {
    this.container.innerHTML = "";

    const stageContent = document.createElement("div");
    stageContent.className = "stageContent";

    // Header com título e contador de blocos
    const stageHeader = document.createElement("div");
    stageHeader.className = "stageHeader";

    const stageTitle = document.createElement("h3");
    stageTitle.className = "stageTitle";
    stageTitle.textContent = "Nível " + this.currentLevel;
    this.stageTitleElement = stageTitle;

    const blockCounter = document.createElement("span");
    blockCounter.className = "stageBlockCounter";
    blockCounter.textContent = `0 blocos`;
    this.blockCounterElement = blockCounter;

    stageHeader.appendChild(stageTitle);
    stageHeader.appendChild(blockCounter);
    stageContent.appendChild(stageHeader);

    // Grid 10x10
    this.stageGrid = document.createElement("div");
    this.stageGrid.className = "stageGrid";
    this.stageGrid.setAttribute("role", "grid");
    this.stageGrid.setAttribute("aria-label", "Grade 10x10 do palco");

    // Cria 100 células do grid
    this.stageCells = [];
    for (let i = 0; i < this.gridSize * this.gridSize; i++) {
      const cell = document.createElement("div");
      cell.className = "stageCell";
      cell.setAttribute("role", "gridcell");
      
      // Posiciona o ator no canto superior esquerdo (0,0)
      if (i === 0) {
        cell.innerHTML = '<span class="actorIcon">🤠</span>';
        cell.classList.add("actorCell");
      }
      
      this.stageGrid.appendChild(cell);
      this.stageCells.push(cell);
    }

    stageContent.appendChild(this.stageGrid);

    // Controles de Execução
    this.controlsArea = document.createElement("div");
    this.controlsArea.className = "controlsArea";
    this.controlsArea.setAttribute("role", "toolbar");
    this.controlsArea.setAttribute("aria-label", "Controles de execução do código");

    // Botão Executar (verde)
    const runBtn = document.createElement("button");
    runBtn.className = "btn btn--run";
    runBtn.setAttribute("aria-label", "Executar código");
    runBtn.innerHTML = `
      <span class="material-symbols-outlined">play_circle</span>
      EXECUTAR
    `;

    // Botões Pausar e Limpar (grid 2 colunas)
    const controlsRow = document.createElement("div");
    controlsRow.className = "controlsRowDual";

    const pauseBtn = document.createElement("button");
    pauseBtn.className = "btn btn--pause btn--disabled";
    pauseBtn.disabled = true;
    pauseBtn.setAttribute("aria-label", "Pausar execução");
    pauseBtn.innerHTML = `
      <span class="material-symbols-outlined">pause</span>
      Pausar
    `;

    const clearBtn = document.createElement("button");
    clearBtn.className = "btn btn--clear";
    clearBtn.setAttribute("aria-label", "Limpar workspace");
    clearBtn.innerHTML = `
      <span class="material-symbols-outlined">delete</span>
      Limpar
    `;

    controlsRow.appendChild(pauseBtn);
    controlsRow.appendChild(clearBtn);

    this.controlsArea.appendChild(runBtn);
    this.controlsArea.appendChild(controlsRow);

    stageContent.appendChild(this.controlsArea);

    // Scenario illustration (opcional - ignorado conforme pedido)

    this.container.appendChild(stageContent);

    this.setupControlListeners();
  }

  /**
   * Configura os event listeners dos botões de controle
   */
  setupControlListeners() {
    const runButton = this.controlsArea.querySelector(".btn--run");
    const pauseButton = this.controlsArea.querySelector(".btn--pause");
    const clearButton = this.controlsArea.querySelector(".btn--clear");

    if (runButton) {
      runButton.addEventListener("click", () => {
        const event = new CustomEvent("stageRun", { bubbles: true });
        this.container.dispatchEvent(event);
      });
    }

    if (pauseButton) {
      pauseButton.addEventListener("click", () => {
        const event = new CustomEvent("stagePause", { bubbles: true });
        this.container.dispatchEvent(event);
      });
    }

    if (clearButton) {
      clearButton.addEventListener("click", () => {
        const event = new CustomEvent("stageClear", { bubbles: true });
        this.container.dispatchEvent(event);
      });
    }
  }

  /**
   * Atualiza o estado do botão de pausa
   * @param {string} state - Estado: "disabled", "enabled", "resume", "pause"
   */
  updatePauseButton(state) {
    const pauseButton = this.controlsArea.querySelector(".btn--pause");
    if (!pauseButton) return;

    const icons = { pause: "pause", resume: "play_arrow" };
    const texts = { pause: "Pausar", resume: "Retomar" };

    switch (state) {
      case "disabled":
        pauseButton.disabled = true;
        pauseButton.classList.add("btn--disabled");
        pauseButton.innerHTML = `<span class="material-symbols-outlined">${icons.pause}</span> ${texts.pause}`;
        break;
      case "enabled":
        pauseButton.disabled = false;
        pauseButton.classList.remove("btn--disabled");
        break;
      case "resume":
        pauseButton.innerHTML = `<span class="material-symbols-outlined">${icons.resume}</span> ${texts.resume}`;
        break;
      case "pause":
        pauseButton.innerHTML = `<span class="material-symbols-outlined">${icons.pause}</span> ${texts.pause}`;
        break;
    }
  }

  // Aliases para compatibilidade
  disablePauseButton() { this.updatePauseButton("disabled"); }
  enablePauseButton() { this.updatePauseButton("enabled"); }
  setPauseToResume() { this.updatePauseButton("resume"); }
  setResumeToPause() { this.updatePauseButton("pause"); }

  /**
   * Atualiza o título do stage com o nível atual
   * @param {number} level - Nível atual do jogo
   */
  updateTitle(level) {
    this.currentLevel = level;
    if (this.stageTitleElement) {
      this.stageTitleElement.textContent = "Nível " + level;
    }
  }

  /**
   * Atualiza o contador de blocos
   * @param {number} used - Blocos usados
   */
  updateBlockCounter(used) {
    if (this.blockCounterElement) {
      this.blockCounterElement.textContent = `${used} blocos`;
    }
  }

  /**
   * Define o limite máximo de blocos
   * @param {number} max - Máximo de blocos permitidos
   */
  setMaxBlocks(max) {
    this.maxBlocks = max;
    this.updateBlockCounter(0);
  }

  /**
   * Reseta o ator para a posição inicial do nível
   */
  reset() {
    this.x = this.start.x;
    this.y = this.start.y;
    this.doorOpen = false;
    this.fireTrapActive = false;

    // Restaura chaves do nível original
    if (this.currentLevelConfig && this.currentLevelConfig.keys) {
      this.keys = [...this.currentLevelConfig.keys];
    }

    // Restaura fogos do nível original
    if (this.currentLevelConfig && this.currentLevelConfig.fireTraps) {
      this.fireTraps = [...this.currentLevelConfig.fireTraps];
    }

    // Redesenha todos os elementos do nível (limpa e renderiza ator, walls, traps, trophy)
    this.renderLevelElements();
  }

  /**
   * Marca a célula atual como visitada e atual
   */
  markCurrentCell() {
    stageHelpers.clearActorFromCells(this.stageCells);
    stageHelpers.renderActor(this.stageCells, this.x, this.y, this.gridSize);
  }

  /**
   * Remove a marcação de célula atual (mantém visitada)
   */
  clearCurrentCell() {
    stageHelpers.clearCurrentFromCell(this.stageCells, this.x, this.y, this.gridSize);
  }

  /**
   * Define a configuração do nível atual
   * @param {Object} levelConfig - Configuração do nível (grid array numérico ou formato original)
   */
  setLevelConfig(levelConfig) {
    this.currentLevelConfig = levelConfig;
    this.maxBlocks = levelConfig.maxBlocks || this.maxBlocks;
    this.doorOpen = false;
    this.fireTrapActive = false;

    // Verifica se o nível tem o novo formato de grid numérico
    if (levelConfig.grid && Array.isArray(levelConfig.grid)) {
      const elements = this.parseGridToElements(levelConfig.grid);
      this.start = elements.start;
      this.trophy = elements.trophy;
      this.walls = elements.walls;
      this.holes = elements.holes;
      this.traps = elements.traps;
      this.keys = elements.keys;
      this.doors = elements.doors;
      this.fireTraps = elements.fireTraps;
    } else {
      // Compatibilidade com formato original (arrays de coordenadas)
      this.start = levelConfig.start || { x: 0, y: 0 };
      this.walls = levelConfig.walls || [];
      this.holes = levelConfig.holes || [];
      this.doors = levelConfig.doors || [];
      this.keys = levelConfig.keys || [];
      this.traps = levelConfig.traps || [];
      this.fireTraps = levelConfig.fireTraps || [];
      this.trophy = levelConfig.trophy || { x: 0, y: 0 };
    }

    // Define posição inicial do ator
    this.x = this.start.x;
    this.y = this.start.y;

    // Renderiza todos os elementos (walls, holes, traps, trophy, ator)
    this.renderLevelElements();
  }

  /**
   * Converte o grid numérico para objetos de elementos
   * @param {number[]} grid - Array numérico do nível (100 elementos)
   * @returns {Object} Objeto com arrays de coordenadas
   */
  parseGridToElements(grid) {
    const elements = {
      start: { x: 0, y: 0 },
      trophy: { x: 0, y: 0 },
      walls: [],
      holes: [],
      traps: [],
      keys: [],
      doors: [],
      fireTraps: [],
    };

    for (let i = 0; i < GRID_LENGTH; i++) {
      const x = i % this.gridSize;
      const y = Math.floor(i / this.gridSize);
      const cellType = grid[i];

      switch (cellType) {
        case ELEMENT_TYPES.START:
          elements.start = { x, y };
          break;
        case ELEMENT_TYPES.TROPHY:
          elements.trophy = { x, y };
          break;
        case ELEMENT_TYPES.WALL:
          elements.walls.push({ x, y });
          break;
        case ELEMENT_TYPES.HOLE:
          elements.holes.push({ x, y });
          break;
        case ELEMENT_TYPES.TRAP:
          elements.traps.push({ x, y });
          break;
        case ELEMENT_TYPES.KEY:
          elements.keys.push({ x, y });
          break;
        case ELEMENT_TYPES.DOOR:
          elements.doors.push({ x, y });
          break;
        case ELEMENT_TYPES.FIRE:
          elements.fireTraps.push({ x, y });
          break;
      }
    }

    return elements;
  }

/**
   * Renderiza os elementos do nível no grid (walls, holes, traps, trophy, ator)
   */
  renderLevelElements() {
    if (!this.stageCells || !this.stageGrid) return;

    // Limpa células (remove ator também)
    stageHelpers.clearGridCells(this.stageCells, stageHelpers.GRID_CLEAR_CLASSES);

    // Renderiza elementos usando helpers
    stageHelpers.renderElementsToGrid(this.stageCells, this.walls, "hasWall", this.gridSize);
    stageHelpers.renderElementsToGrid(this.stageCells, this.holes, "hasHole", this.gridSize);
    stageHelpers.renderElementsToGrid(this.stageCells, this.keys, "hasKey", this.gridSize);
    stageHelpers.renderElementsToGrid(this.stageCells, this.traps, "hasTrap", this.gridSize);

    // Renderiza portas (com estado)
    stageHelpers.renderDoors(this.stageCells, this.doors, this.gridSize, this.doorOpen);

    // Renderiza fogos (com estado ativo/inativo)
    stageHelpers.renderElementWithState(
      this.stageCells, this.fireTraps, "hasFireTrap", this.gridSize, this.fireTrapActive, "active"
    );

    // Renderiza troféu
    stageHelpers.renderTrophy(this.stageCells, this.trophy, this.gridSize);

    // Renderiza ator na posição inicial
    this.renderActor();
  }

  /**
   * Renderiza o ator na posição atual
   */
  renderActor() {
    stageHelpers.renderActor(this.stageCells, this.x, this.y, this.gridSize);
  }

  /**
   * Verifica colisão com uma posição específica
   * @param {number} x - Coordenada X
   * @param {number} y - Coordenada Y
   * @returns {string} Tipo de elemento: "wall", "trap", "trophy" ou null
   */
  checkCollision(x, y) {
    const checkers = [
      { elements: this.walls, type: "wall" },
      { elements: this.traps, type: "trap" }
    ];
    for (const { elements, type } of checkers) {
      if (elements.some(el => el.x === x && el.y === y)) return type;
    }
    if (this.trophy.x === x && this.trophy.y === y) return "trophy";
    return null;
  }

  /**
   * Verifica se há parede ou buraco em uma posição específica
   * @param {number} x - Coordenada X
   * @param {number} y - Coordenada Y
   * @returns {boolean} true se houver parede ou buraco na posição
   */
  hasWallAt(x, y) {
    const checkers = [
      { elements: this.walls },
      { elements: this.holes }
    ];
    for (const { elements } of checkers) {
      if (elements.some(el => el.x === x && el.y === y)) return true;
    }
    if (!this.doorOpen && this.doors.some(d => d.x === x && d.y === y)) return true;
    return false;
  }

  /**
   * Verifica se o ator pode pular para uma direção
   * Não pode pular se houver parede na posição intermediária ou na posição final
   * Não pode pular se houver buraco na posição final
   * Pode pular por cima de buracos e armadilhas na posição intermediária
   * @param {string} direction - Direção do pulo (up, down, left, right)
   * @returns {Object} {canJump: boolean, reason: string}
   */
  canJump(direction) {
    const deltas = {
      up: { ix: 0, iy: -1, fx: 0, fy: -2 },
      down: { ix: 0, iy: 1, fx: 0, fy: 2 },
      left: { ix: -1, iy: 0, fx: -2, fy: 0 },
      right: { ix: 1, iy: 0, fx: 2, fy: 0 }
    };
    const d = deltas[direction];
    const intermediateX = this.x + d.ix;
    const intermediateY = this.y + d.iy;
    const finalX = this.x + d.fx;
    const finalY = this.y + d.fy;

    if (intermediateX < 0 || intermediateX >= this.gridSize ||
        intermediateY < 0 || intermediateY >= this.gridSize) {
      return {canJump: false, reason: "border"};
    }
    if (finalX < 0 || finalX >= this.gridSize || finalY < 0 || finalY >= this.gridSize) {
      return {canJump: false, reason: "border"};
    }

    const checkWall = (x, y) => this.walls.some(w => w.x === x && w.y === y);
    if (checkWall(intermediateX, intermediateY) || checkWall(finalX, finalY)) {
      return {canJump: false, reason: "wall"};
    }
    if (this.holes.some(h => h.x === finalX && h.y === finalY)) {
      return {canJump: false, reason: "hole"};
    }
    const checkDoor = (x, y) => !this.doorOpen && this.doors.some(d => d.x === x && d.y === y);
    if (checkDoor(intermediateX, intermediateY) || checkDoor(finalX, finalY)) {
      return {canJump: false, reason: "door"};
    }

    return {canJump: true, reason: "ok"};
  }

  /**
   * Move o ator em uma direção (genérico)
   * @param {string} direction - Direção do movimento (up, down, left, right)
   * @returns {Object} {moved: boolean, reason: string}
   */
  move(direction) {
    const deltas = {
      up: { x: 0, y: -1 },
      down: { x: 0, y: 1 },
      left: { x: -1, y: 0 },
      right: { x: 1, y: 0 }
    };
    const delta = deltas[direction];
    const nextX = this.x + delta.x;
    const nextY = this.y + delta.y;

    if (nextX < 0 || nextX >= this.gridSize || nextY < 0 || nextY >= this.gridSize) {
      return {moved: false, reason: "border"};
    }
    if (this.hasWallAt(nextX, nextY)) {
      return {moved: false, reason: "wall"};
    }

    this.clearCurrentCell();
    this.x = nextX;
    this.y = nextY;
    this.markCurrentCell();
    return {moved: true};
  }

  // Aliases para compatibilidade com API existente
  moveUp() { return this.move("up"); }
  moveDown() { return this.move("down"); }
  moveLeft() { return this.move("left"); }
  moveRight() { return this.move("right"); }

  /**
   * Verifica se há armadilha na posição atual do ator
   * @returns {boolean} true se houver armadilha
   */
  isTrapAtCurrentPosition() {
    return this.isElementAtPosition(this.traps);
  }

  /**
   * Verifica se há armadilha de fogo na posição atual do ator
   * @returns {boolean} true se houver fogo
   */
  isFireTrapAtCurrentPosition() {
    return this.isElementAtPosition(this.fireTraps);
  }

  /**
   * Método genérico para verificar se há elemento na posição atual
   * @param {Array} elements - Array de elementos {x, y}
   * @returns {boolean} true se houver elemento na posição atual
   */
  isElementAtPosition(elements) {
    return elements.some(el => el.x === this.x && el.y === this.y);
  }

  /**
   * Alterna o estado da armadilha de fogo (ativo/inativo)
   */
  toggleFireTrap() {
    if (this.fireTraps.length === 0) return;
    this.fireTrapActive = !this.fireTrapActive;
    this.renderLevelElements();
  }

  /**
   * Verifica se há troféu na posição atual do ator
   * @returns {boolean} true se houver troféu
   */
  isTrophyAtCurrentPosition() {
    return this.trophy.x === this.x && this.trophy.y === this.y;
  }

  /**
   * Verifica colisão na posição atual (após movimento)
   * @returns {string|null} "trap", "trophy" ou null
   */
  checkCollisionAtCurrentPosition() {
    // Verifica armadilhas (inclui fogo ativo)
    const traps = [
      { check: () => this.isTrapAtCurrentPosition(), type: "trap" },
      { check: () => this.isFireTrapAtCurrentPosition() && this.fireTrapActive, type: "trap" }
    ];
    for (const { check, type } of traps) {
      if (check()) return type;
    }

    // Verifica troféu
    if (this.isTrophyAtCurrentPosition()) return "trophy";

    // Verifica chave (ação especial)
    if (this.isKeyAtCurrentPosition()) {
      this.doorOpen = true;
      this.keys = this.keys.filter(k => !(k.x === this.x && k.y === this.y));
      this.renderLevelElements();
      this.showKeyToast();
    }
    return null;
  }

  showKeyToast() {
    Toast.show("Chave coletada!", 0, "🗝️", "key");
  }

  isKeyAtCurrentPosition() {
    return this.isElementAtPosition(this.keys);
  }

}