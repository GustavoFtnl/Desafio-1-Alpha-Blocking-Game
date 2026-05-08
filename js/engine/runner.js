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
      for (let i = 0; i < this.instructions.length; i++) {
        const instruction = this.instructions[i];
        const nextInstruction = this.instructions[i + 1];
        
        if (!this.isRunning) break;

        if (this.isPaused) {
          await this.waitForResume();
        }

        if (!this.isRunning) break;

        this.setBlockExecuting(instruction.blockElement, true);

        // Lógica do toggle do fogo
        if (this.stage.fireTraps && this.stage.fireTraps.length > 0) {
          const atorNoFogo = this.stage.isFireTrapAtCurrentPosition();
          const fogoAtivoAntes = this.stage.fireTrapActive;

          if (atorNoFogo && !fogoAtivoAntes) {
            // Se ator está em fogo desativado, executa ação primeiro, depois toggle
            const posicaoAntes = { x: this.stage.x, y: this.stage.y };
            const result = await this.executeAction(instruction);
            
            if (result.moved) {
              this.stage.toggleFireTrap();
              
              // Verifica se o ator SAIU da célula do fogo
              const fogoIndex = posicaoAntes.y * this.stage.gridSize + posicaoAntes.x;
              const atualIndex = this.stage.y * this.stage.gridSize + this.stage.x;
              
              // Só verifica colisão se o ator mudou de posição (saiu da célula do fogo)
              if (atualIndex !== fogoIndex) {
                const collision = this.stage.checkCollisionAtCurrentPosition();
                
                if (collision === "trap") {
                  this.setBlockExecuting(instruction.blockElement, false);
                  this.handleTrapHit();
                  return;
                }
                if (collision === "trophy") {
                  this.setBlockExecuting(instruction.blockElement, false);
                  this.handleVictory();
                  return;
                }
              }
            }

            // Desativa bloco e continua para o delay
            this.setBlockExecuting(instruction.blockElement, false);
            await this.delay(this.commandDelay);
            continue;
          } else {
            // Caso normal: toggle primeiro, depois verifica colisão e executa
            this.stage.toggleFireTrap();

            // Verifica se há fogo ativo na posição atual antes do movimento
            if (this.stage.isFireTrapAtCurrentPosition() && this.stage.fireTrapActive) {
              this.setBlockExecuting(instruction.blockElement, false);
              this.handleTrapHit();
              return;
            }
          }
        }

        const result = await this.executeAction(instruction);

        if (result.moved) {
          const collision = this.stage.checkCollisionAtCurrentPosition();

          if (collision === "trap") {
            this.setBlockExecuting(instruction.blockElement, false);
            this.handleTrapHit();
            return;
          }

          if (collision === "trophy") {
            this.setBlockExecuting(instruction.blockElement, false);
            this.handleVictory();
            return;
          }
        }

        // Só desativa se a próxima instrução for de um bloco diferente
        const shouldDeactivate = !nextInstruction || 
          nextInstruction.blockElement !== instruction.blockElement;
        
        if (shouldDeactivate) {
          this.setBlockExecuting(instruction.blockElement, false);
        }

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

      case "jumpUp":
        return this.executeJump("up");

      case "jumpDown":
        return this.executeJump("down");

      case "jumpLeft":
        return this.executeJump("left");

      case "jumpRight":
        return this.executeJump("right");

      case "repeat":
        return await this.handleRepeat(instruction.count, instruction.body);

      default:
        console.warn(`Tipo de instrução desconhecido: ${instruction.type}`);
        return {moved: false};
    }
  }

  /**
   * Executa um pulo do ator
   * O pulo ignora armadilhas e buracos na posição intermediária
   * Apenas verifica colisão na posição final
   * @param {string} direction - Direção do pulo (up, down, left, right)
   * @returns {Promise<{moved: boolean}>} Resultado do pulo
   */
  async executeJump(direction) {
    const canJumpResult = this.stage.canJump(direction);

    if (!canJumpResult.canJump) {
      return {moved: false, reason: canJumpResult.reason};
    }

    switch (direction) {
      case "up":
        this.stage.y -= 2;
        break;
      case "down":
        this.stage.y += 2;
        break;
      case "left":
        this.stage.x -= 2;
        break;
      case "right":
        this.stage.x += 2;
        break;
    }

    this.stage.markCurrentCell();

    const finalCollision = this.stage.checkCollisionAtCurrentPosition();
    if (finalCollision === "trap") {
      return {moved: true};
    }

    return {moved: true};
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

      for (let j = 0; j < body.length; j++) {
        const subInstruction = body[j];
        const nextSubInstruction = body[j + 1];
        
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
            this.setBlockExecuting(subInstruction.blockElement, false);
            this.handleTrapHit();
            return {moved: false};
          }

          if (collision === "trophy") {
            this.setBlockExecuting(subInstruction.blockElement, false);
            this.handleVictory();
            return {moved: false};
          }
        }

        const shouldDeactivate = !nextSubInstruction || 
          nextSubInstruction.blockElement !== subInstruction.blockElement;
        
        if (shouldDeactivate) {
          this.setBlockExecuting(subInstruction.blockElement, false);
        }

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