/**
 * Stage.js - Gerencia a posição e rotação do ator no grid 10x10
 * Renderiza dinamicamente o grid, ator e controles
 * Direções: 0=cima, 1=direita, 2=baixo, 3=esquerda
 * Comentários em português do Brasil conforme AGENTS.md
 */

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
    this.traps = [];
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
    blockCounter.textContent = `0/${this.maxBlocks} blocos`;
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
        cell.innerHTML = '<span style="font-size: 24px;">🤠</span>';
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
    pauseBtn.className = "btn btn--pause";
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
      this.blockCounterElement.textContent = `${used}/${this.maxBlocks} blocos`;
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

    // Redesenha todos os elementos do nível (limpa e renderiza ator, walls, traps, trophy)
    this.renderLevelElements();
  }

  /**
   * Marca a célula atual como visitada e atual
   */
  markCurrentCell() {
    // Remove ator de todas as células
    this.stageCells.forEach(cell => {
      if (cell.classList.contains("actorCell")) {
        cell.innerHTML = "";
        cell.classList.remove("actorCell");
      }
    });

    const cellIndex = this.y * this.gridSize + this.x;
    const cell = this.stageCells[cellIndex];

    if (cell) {
      cell.classList.add("visited", "current", "actorCell");
      cell.innerHTML = '<span style="font-size: 24px;">🤠</span>';
    }
  }

  /**
   * Remove a marcação de célula atual (mantém visitada)
   */
  clearCurrentCell() {
    const cellIndex = this.y * this.gridSize + this.x;
    const cell = this.stageCells[cellIndex];

    if (cell) {
      cell.classList.remove("current");
    }
  }

  /**
   * Define a configuração do nível atual
   * @param {Object} levelConfig - Configuração do nível (start, trophy, walls, traps)
   */
  setLevelConfig(levelConfig) {
    this.currentLevelConfig = levelConfig;
    this.start = levelConfig.start || { x: 0, y: 0 };
    this.walls = levelConfig.walls || [];
    this.traps = levelConfig.traps || [];
    this.trophy = levelConfig.trophy || { x: 0, y: 0 };
    this.maxBlocks = levelConfig.maxBlocks || this.maxBlocks;
    
    // Define posição inicial do ator
    this.x = this.start.x;
    this.y = this.start.y;

    // Renderiza todos os elementos (walls, traps, trophy, ator)
    this.renderLevelElements();
  }

  /**
   * Renderiza os elementos do nível no grid (walls, traps, trophy, ator)
   */
  renderLevelElements() {
    if (!this.stageCells || !this.stageGrid) return;

    // Limpa células (remove ator também)
    this.stageCells.forEach(cell => {
      cell.innerHTML = "";
      cell.classList.remove("hasWall", "hasTrap", "hasTrophy", "actorCell", "visited", "current");
    });

    // Renderiza paredes
    this.walls.forEach(wall => {
      const index = wall.y * this.gridSize + wall.x;
      const cell = this.stageCells[index];
      if (cell) {
        cell.classList.add("hasWall");
      }
    });

    // Renderiza armadilhas
    this.traps.forEach(trap => {
      const index = trap.y * this.gridSize + trap.x;
      const cell = this.stageCells[index];
      if (cell) {
        cell.classList.add("hasTrap");
        cell.innerHTML = '<span class="cellIcon">💣</span>';
      }
    });

    // Renderiza troféu
    const trophyIndex = this.trophy.y * this.gridSize + this.trophy.x;
    const trophyCell = this.stageCells[trophyIndex];
    if (trophyCell) {
      trophyCell.classList.add("hasTrophy");
      trophyCell.innerHTML = '<span class="cellIcon">🏆</span>';
    }

    // Renderiza ator na posição inicial
    this.renderActor();
  }

  /**
   * Renderiza o ator na posição atual
   */
  renderActor() {
    const cellIndex = this.y * this.gridSize + this.x;
    const cell = this.stageCells[cellIndex];

    if (cell) {
      cell.classList.add("actorCell", "visited", "current");
      cell.innerHTML = '<span style="font-size: 24px;">🤠</span>';
    }
  }

  /**
   * Verifica colisão com uma posição específica
   * @param {number} x - Coordenada X
   * @param {number} y - Coordenada Y
   * @returns {string} Tipo de elemento: "wall", "trap", "trophy" ou null
   */
  checkCollision(x, y) {
    // Verifica parede
    if (this.walls.some(w => w.x === x && w.y === y)) {
      return "wall";
    }
    // Verifica armadilha
    if (this.traps.some(t => t.x === x && t.y === y)) {
      return "trap";
    }
    // Verifica troféu
    if (this.trophy.x === x && this.trophy.y === y) {
      return "trophy";
    }
    return null;
  }

  /**
   * Verifica se há parede em uma posição específica
   * @param {number} x - Coordenada X
   * @param {number} y - Coordenada Y
   * @returns {boolean} true se houver parede na posição
   */
  hasWallAt(x, y) {
    return this.walls.some(w => w.x === x && w.y === y);
  }

  /**
   * Move o ator para cima (absoluto)
   * @returns {Object} {moved: boolean, reason: string}
   */
  moveUp() {
    const nextY = this.y - 1;

    if (this.hasWallAt(this.x, nextY)) {
      return {moved: false, reason: "wall"};
    }

    if (nextY < 0) {
      return {moved: false, reason: "border"};
    }

    this.clearCurrentCell();
    this.y = nextY;
    this.markCurrentCell();

    return {moved: true};
  }

  /**
   * Move o ator para baixo (absoluto)
   * @returns {Object} {moved: boolean, reason: string}
   */
  moveDown() {
    const nextY = this.y + 1;

    if (this.hasWallAt(this.x, nextY)) {
      return {moved: false, reason: "wall"};
    }

    if (nextY >= this.gridSize) {
      return {moved: false, reason: "border"};
    }

    this.clearCurrentCell();
    this.y = nextY;
    this.markCurrentCell();

    return {moved: true};
  }

  /**
   * Move o ator para esquerda (absoluto)
   * @returns {Object} {moved: boolean, reason: string}
   */
  moveLeft() {
    const nextX = this.x - 1;

    if (this.hasWallAt(nextX, this.y)) {
      return {moved: false, reason: "wall"};
    }

    if (nextX < 0) {
      return {moved: false, reason: "border"};
    }

    this.clearCurrentCell();
    this.x = nextX;
    this.markCurrentCell();

    return {moved: true};
  }

  /**
   * Move o ator para direita (absoluto)
   * @returns {Object} {moved: boolean, reason: string}
   */
  moveRight() {
    const nextX = this.x + 1;

    if (this.hasWallAt(nextX, this.y)) {
      return {moved: false, reason: "wall"};
    }

    if (nextX >= this.gridSize) {
      return {moved: false, reason: "border"};
    }

    this.clearCurrentCell();
    this.x = nextX;
    this.markCurrentCell();

    return {moved: true};
  }

  /**
   * Verifica se há armadilha na posição atual do ator
   * @returns {boolean} true se houver armadilha
   */
  isTrapAtCurrentPosition() {
    return this.traps.some(t => t.x === this.x && t.y === this.y);
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
    if (this.isTrapAtCurrentPosition()) {
      return "trap";
    }
    if (this.isTrophyAtCurrentPosition()) {
      return "trophy";
    }
    return null;
  }

  }