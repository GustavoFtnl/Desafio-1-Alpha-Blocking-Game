/**
 * runner.js - Executa o array de instruções sequencialmente
 * Usa async/await e delays para cadenciar a execução
 * Controla estados: play, pause, stop
 */

export class Runner {
  constructor(stage) {
    this.stage = stage
    this.instructions = []
    this.currentIndex = 0
    this.isRunning = false
    this.isPaused = false
    this.pausePromise = null
    this.pauseResolve = null
    
    // Delay entre comandos (compatível com CSS --transition-actor-move: 300ms)
    this.commandDelay = 300
  }

  /**
   * Executa uma lista de instruções sequencialmente
   * @param {Array} instructions - Array de instruções do parser
   * @returns {Promise} Resolve quando todas as instruções forem executadas
   */
  async run(instructions) {
    if (this.isRunning) {
      return // Já está executando
    }
    
    this.instructions = instructions
    this.currentIndex = 0
    this.isRunning = true
    this.isPaused = false
    
    try {
      for (const instruction of this.instructions) {
        if (!this.isRunning) break
        
        // Verifica se está pausado
        if (this.isPaused) {
          await this.waitForResume()
        }
        
        if (!this.isRunning) break // Foi parado
        
        // Adiciona classe de execução no bloco principal
        this.setBlockExecuting(instruction, true)
        
        // Executa a instrução (pode ser aninhada)
        await this.executeInstruction(instruction)
        
        // Remove classe de execução
        this.setBlockExecuting(instruction, false)
        
        // Delay entre comandos principais
        await this.delay(this.commandDelay)
      }
    } catch (error) {
      console.error('Erro durante execução:', error)
    } finally {
      this.isRunning = false
      this.isPaused = false
      
      // Dispara evento de conclusão
      this.dispatchCompleteEvent()
    }
  }

  /**
   * Executa uma única instrução
   * @param {Object} instruction - Instrução a ser executada
   */
  async executeInstruction(instruction) {
    switch (instruction.type) {
      case 'move':
        this.stage.move()
        // Executa direções aninhadas se houver
        if (instruction.directions && instruction.directions.length > 0) {
          for (const dir of instruction.directions) {
            await this.executeDirection(dir)
          }
        }
        break
        
      case 'turnRight':
        this.stage.turnRight()
        break
        
      case 'turnLeft':
        this.stage.turnLeft()
        break
        
      case 'moveUp':
        // Temporariamente vira para cima e move
        const savedDir = this.stage.direction
        this.stage.direction = 0 // cima
        this.stage.updateActorRotation()
        this.stage.move()
        this.stage.direction = savedDir
        this.stage.updateActorRotation()
        break
        
      case 'moveDown':
        // Temporariamente vira para baixo e move
        const savedDir2 = this.stage.direction
        this.stage.direction = 2 // baixo
        this.stage.updateActorRotation()
        this.stage.move()
        this.stage.direction = savedDir2
        this.stage.updateActorRotation()
        break
        
      case 'action':
        await this.delay(this.commandDelay)
        break
        
      case 'stop':
        this.isRunning = false
        break
        
      case 'repeat':
        await this.executeRepeat(instruction)
        break
        
      case 'if':
        await this.executeConditional(instruction)
        break
        
      default:
        console.warn(`Tipo de instrução desconhecido: ${instruction.type}`)
    }
  }
  
  async executeDirection(dirType) {
    switch (dirType) {
      case 'turnRight':
        this.stage.turnRight()
        break
      case 'turnLeft':
        this.stage.turnLeft()
        break
      case 'moveUp':
        const savedDir = this.stage.direction
        this.stage.direction = 0
        this.stage.updateActorRotation()
        this.stage.move()
        this.stage.direction = savedDir
        this.stage.updateActorRotation()
        break
      case 'moveDown':
        const savedDir2 = this.stage.direction
        this.stage.direction = 2
        this.stage.updateActorRotation()
        this.stage.move()
        this.stage.direction = savedDir2
        this.stage.updateActorRotation()
        break
    }
    await this.delay(this.commandDelay)
  }

  /**
   * Executa um bloco de repetição
   * @param {Object} instruction - Instrução de repetição
   */
  async executeRepeat(instruction) {
    const count = instruction.count || 2
    const body = instruction.body || []
    
    for (let i = 0; i < count; i++) {
      if (!this.isRunning) break
      
      // Verifica pause
      if (this.isPaused) {
        await this.waitForResume()
      }
      
      // Executa corpo da repetição
      for (const subInstruction of body) {
        if (!this.isRunning) break
        
        if (this.isPaused) {
          await this.waitForResume()
        }
        
        this.setBlockExecuting(subInstruction, true)
        await this.executeInstruction(subInstruction)
        this.setBlockExecuting(subInstruction, false)
        
        await this.delay(this.commandDelay)
      }
    }
  }

  /**
   * Executa um bloco condicional
   * @param {Object} instruction - Instrução condicional
   */
  async executeConditional(instruction) {
    // Simplificado para MVP: sempre executa o corpo
    const body = instruction.body || []
    
    for (const subInstruction of body) {
      if (!this.isRunning) break
      
      if (this.isPaused) {
        await this.waitForResume()
      }
      
      this.setBlockExecuting(subInstruction, true)
      await this.executeInstruction(subInstruction)
      this.setBlockExecuting(subInstruction, false)
      
      await this.delay(this.commandDelay)
    }
  }

  /**
   * Define se um bloco está em estado de execução (classe CSS)
   * @param {Object} instruction - Instrução com blockElement
   * @param {boolean} executing - Se está executando ou não
   */
  setBlockExecuting(instruction, executing) {
    if (instruction && instruction.blockElement) {
      if (executing) {
        instruction.blockElement.classList.add('executing')
      } else {
        instruction.blockElement.classList.remove('executing')
      }
    }
  }

  /**
   * Pausa a execução
   */
  pause() {
    if (this.isRunning && !this.isPaused) {
      this.isPaused = true
    }
  }

  /**
   * Retoma a execução pausada
   */
  resume() {
    if (this.isRunning && this.isPaused) {
      this.isPaused = false
      if (this.pauseResolve) {
        this.pauseResolve()
        this.pauseResolve = null
      }
    }
  }

  /**
   * Para completamente a execução
   */
  stop() {
    this.isRunning = false
    this.isPaused = false
    
    // Limpa classes de execução de todas as instruções
    this.instructions.forEach(instruction => {
      this.setBlockExecuting(instruction, false)
    })
    
    if (this.pauseResolve) {
      this.pauseResolve()
      this.pauseResolve = null
    }
  }

  /**
   * Aguarda o resume quando pausado
   * @returns {Promise} Resolve quando resume
   */
  waitForResume() {
    return new Promise(resolve => {
      this.pauseResolve = resolve
    })
  }

  /**
   * Cria um delay (Promise com setTimeout)
   * @param {number} ms - Milissegundos
   * @returns {Promise} Resolve após o delay
   */
  delay(ms) {
    return new Promise(resolve => setTimeout(resolve, ms))
  }

  /**
   * Dispara evento customizado de conclusão de nível
   */
  dispatchCompleteEvent() {
    const event = new CustomEvent('levelComplete', {
      bubbles: true,
      detail: {
        success: true
      }
    })
    document.dispatchEvent(event)
  }

  /**
   * Verifica se está executando
   * @returns {boolean} Estado de execução
   */
  get running() {
    return this.isRunning
  }

  /**
   * Verifica se está pausado
   * @returns {boolean} Estado de pausa
   */
  get paused() {
    return this.isPaused
  }
}
