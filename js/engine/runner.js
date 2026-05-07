/**
 * runner.js - Executa o array de instruções sequencialmente
 * Usa async/await e delays para cadenciar a execução
 * Controla estados: play, pause, stop
 * Detecta colisão com armadilhas (falha) e troféu (vitória)
 * Comentários em português do Brasil conforme AGENTS.md
 */

export class Runner {
  constructor(stage) {
    this.stage = stage;
    this.instructions = [];
    this.currentIndex = 0;
    this.isRunning = false;
    this.isPaused = false;
    this.pausePromise = null;
    this.pauseResolve = null;

    this.commandDelay = 300;
  }

  /**
   * Executa uma lista de instruções sequencialmente
   * @param {Array} instructions - Array de instruções do parser
   * @returns {Promise} Resolve quando todas as instruções forem executadas
   */
  async run(instructions) {
    if (this.isRunning) {
      return;
    }

    this.instructions = instructions;
    this.currentIndex = 0;
    this.isRunning = true;
    this.isPaused = false;

    try {
      for (const instruction of this.instructions) {
        if (!this.isRunning) break;

        if (this.isPaused) {
          await this.waitForResume();
        }

        if (!this.isRunning) break;

        this.setBlockExecuting(instruction.blockElement, true);

        const result = await this.executeAction(instruction);

        if (result.moved) {
          const collision = this.stage.checkCollisionAtCurrentPosition();

          if (collision === "trap") {
            this.handleTrapHit();
            return;
          }

          if (collision === "trophy") {
            this.handleVictory();
            return;
          }
        }

        this.setBlockExecuting(instruction.blockElement, false);

        await this.delay(this.commandDelay);
      }

      if (this.isRunning && !this.isPaused) {
        this.dispatchExecutionCompleteEvent();
      }
    } catch (error) {
      console.error("Erro durante execução:", error);
    } finally {
      this.isRunning = false;
      this.isPaused = false;
    }
  }

  /**
   * Executa uma ação baseada no tipo de instrução
   * @param {Object} instruction - Instrução a ser executada
   * @returns {Promise<{moved: boolean}>} Resultado do movimento
   */
  async executeAction(instruction) {
    switch (instruction.type) {
      case "moveUp":
        return this.stage.moveUp();

      case "moveDown":
        return this.stage.moveDown();

      case "moveLeft":
        return this.stage.moveLeft();

      case "moveRight":
        return this.stage.moveRight();

      case "repeat":
        return await this.handleRepeat(instruction.count, instruction.body);

      default:
        console.warn(`Tipo de instrução desconhecido: ${instruction.type}`);
        return {moved: false};
    }
  }

  /**
   * Executa um bloco de repetição
   * @param {number} count - Número de repetições
   * @param {Array} body - Array de instruções do corpo
   * @returns {Promise<{moved: boolean}>} Resultado
   */
  async handleRepeat(count, body) {
    if (!body || body.length === 0) {
      return {moved: false};
    }

    let anyMoved = false;

    for (let i = 0; i < count; i++) {
      if (!this.isRunning) break;

      if (this.isPaused) {
        await this.waitForResume();
      }

      for (const subInstruction of body) {
        if (!this.isRunning) break;

        if (this.isPaused) {
          await this.waitForResume();
        }

        this.setBlockExecuting(subInstruction.blockElement, true);

        const result = await this.executeAction(subInstruction);

        if (result.moved) {
          anyMoved = true;

          const collision = this.stage.checkCollisionAtCurrentPosition();

          if (collision === "trap") {
            this.handleTrapHit();
            return {moved: false};
          }

          if (collision === "trophy") {
            this.handleVictory();
            return {moved: false};
          }
        }

        this.setBlockExecuting(subInstruction.blockElement, false);

        await this.delay(this.commandDelay);
      }
    }

    return {moved: anyMoved};
  }

  /**
   * Trata hit em armadilha - falha do nível
   */
  handleTrapHit() {
    this.isRunning = false;
    this.isPaused = false;

    this.instructions.forEach(instruction => {
      this.setBlockExecuting(instruction.blockElement, false);
    });

    this.dispatchFailedEvent("trap");
  }

  /**
   * Trata vitória - atingiu o troféu
   */
  handleVictory() {
    this.dispatchCompleteEvent();
  }

  /**
   * Define se um bloco está em estado de execução (classe CSS)
   * @param {HTMLElement} blockElement - Elemento do bloco
   * @param {boolean} executing - Se está executando ou não
   */
  setBlockExecuting(blockElement, executing) {
    if (blockElement) {
      if (executing) {
        blockElement.classList.add("executing");
      } else {
        blockElement.classList.remove("executing");
      }
    }
  }

  /**
   * Pausa a execução
   */
  pause() {
    if (this.isRunning && !this.isPaused) {
      this.isPaused = true;
    }
  }

  /**
   * Retoma a execução pausada
   */
  resume() {
    if (this.isRunning && this.isPaused) {
      this.isPaused = false;
      if (this.pauseResolve) {
        this.pauseResolve();
        this.pauseResolve = null;
      }
    }
  }

  /**
   * Para completamente a execução
   */
  stop() {
    this.isRunning = false;
    this.isPaused = false;

    this.instructions.forEach(instruction => {
      this.setBlockExecuting(instruction.blockElement, false);
    });

    if (this.pauseResolve) {
      this.pauseResolve();
      this.pauseResolve = null;
    }
  }

  /**
   * Aguarda o resume quando pausado
   * @returns {Promise} Resolve quando resume
   */
  waitForResume() {
    return new Promise(resolve => {
      this.pauseResolve = resolve;
    });
  }

  /**
   * Cria um delay (Promise com setTimeout)
   * @param {number} ms - Milissegundos
   * @returns {Promise} Resolve após o delay
   */
  delay(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
  }

  /**
   * Dispara evento customizado de conclusão de nível (vitória)
   */
  dispatchCompleteEvent() {
    const event = new CustomEvent("levelComplete", {
      bubbles: true,
      detail: {
        success: true
      }
    });
    document.dispatchEvent(event);
  }

  /**
   * Dispara evento de falha do nível (armadilha)
   * @param {string} reason - Razão da falha
   */
  dispatchFailedEvent(reason) {
    const event = new CustomEvent("levelFailed", {
      bubbles: true,
      detail: {
        success: false,
        reason: reason
      }
    });
    document.dispatchEvent(event);
  }

  /**
   * Dispara evento de nível incompleto (não alcançou o troféu)
   */
  dispatchIncompleteEvent() {
    const event = new CustomEvent("levelIncomplete", {
      bubbles: true,
      detail: {
        success: false,
        reason: "incomplete"
      }
    });
    document.dispatchEvent(event);
  }

  /**
   * Dispara evento de execução concluída (sem vitória, sem armadilha)
   */
  dispatchExecutionCompleteEvent() {
    const event = new CustomEvent("executionComplete", {
      bubbles: true,
      detail: {
        reachedEnd: true
      }
    });
    document.dispatchEvent(event);
  }

  /**
   * Verifica se está executando
   * @returns {boolean} Estado de execução
   */
  get running() {
    return this.isRunning;
  }

  /**
   * Verifica se está pausado
   * @returns {boolean} Estado de pausa
   */
  get paused() {
    return this.isPaused;
  }
}