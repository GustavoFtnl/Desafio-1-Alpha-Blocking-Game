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
    this.x = 4; // Centro do grid (5,5 em 1-indexed = 4,4 em 0-indexed)
    this.y = 4;
    this.direction = 0; // 0=cima

    this.maxBlocks = 8;

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
    stageTitle.textContent = "Execução";

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
      
      // Posiciona o ator no centro (4,4 = índice 44)
      if (i === 44) {
        cell.innerHTML = '<span style="font-size: 24px;">🤖</span>';
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
   * @param {number} totalLevels - Total de níveis no jogo
   */
  updateTitle(level, totalLevels) {
    // O título é fixo "Execução" no exemplo
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
   * Reseta o ator para a posição inicial (4,4) e direção padrão
   */
  reset() {
    this.x = 4;
    this.y = 4;
    this.direction = 0;

    // Limpa células visitadas
    this.stageCells.forEach((cell) => {
      cell.classList.remove("visited", "current");
    });

    // Marca posição inicial
    this.markCurrentCell();
  }

  /**
   * Marca a célula atual como visitada e atual
   */
  markCurrentCell() {
    const cellIndex = this.y * this.gridSize + this.x;
    const cell = this.stageCells[cellIndex];

    if (cell) {
      cell.classList.add("visited", "current");
    }
  }

  /**
   * Remove a marcação de célula atual
   */
  clearCurrentCell() {
    const cellIndex = this.y * this.gridSize + this.x;
    const cell = this.stageCells[cellIndex];

    if (cell) {
      cell.classList.remove("current");
    }
  }

  /**
   * Move o ator na direção atual
   * @returns {boolean} true se moveu com sucesso, false se houve colisão
   */
  move() {
    let newX = this.x;
    let newY = this.y;

    switch (this.direction) {
      case 0: // cima
        newY--;
        break;
      case 1: // direita
        newX++;
        break;
      case 2: // baixo
        newY++;
        break;
      case 3: // esquerda
        newX--;
        break;
    }

    // Verifica colisão com as bordas do grid (0-9)
    if (
      newX < 0 ||
      newX >= this.gridSize ||
      newY < 0 ||
      newY >= this.gridSize
    ) {
      return false;
    }

    this.clearCurrentCell();
    this.x = newX;
    this.y = newY;

    this.markCurrentCell();

    return true;
  }

  /**
   * Gira o ator 90 graus para a direita
   */
  turnRight() {
    this.direction = (this.direction + 1) % 4;
  }

  /**
   * Gira o ator 90 graus para a esquerda
   */
  turnLeft() {
    this.direction = (this.direction + 3) % 4;
  }

  /**
   * Verifica se uma posição está dentro dos limites do grid
   * @param {number} x - Coordenada X
   * @param {number} y - Coordenada Y
   * @returns {boolean} true se dentro dos limites
   */
  isWithinBounds(x, y) {
    return x >= 0 && x < this.gridSize && y >= 0 && y < this.gridSize;
  }
}