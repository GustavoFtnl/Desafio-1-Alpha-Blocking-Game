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
    this.container = container
    
    // Configurações do grid
    this.gridSize = 10
    this.cellSize = 40 // 400px / 10 células
    
    // Estado inicial do ator (sempre começa em 0,0 conforme decisão)
    this.x = 0
    this.y = 0
    this.direction = 0 // 0=cima
    
    // Elementos do DOM (serão criados no render)
    this.stageGrid = null
    this.actor = null
    this.stageCells = null
    this.controlsArea = null
    
    this.render()
  }

  /**
   * Renderiza toda a estrutura do Stage dinamicamente
   */
  render() {
    // Limpa o container
    this.container.innerHTML = ''
    
    // Título
    const title = document.createElement('h2')
    title.className = 'sidebar_title'
    title.textContent = 'Palco (Stage)'
    this.container.appendChild(title)
    
    // Grid 10x10
    this.stageGrid = document.createElement('div')
    this.stageGrid.className = 'stageGrid'
    this.stageGrid.setAttribute('role', 'grid')
    this.stageGrid.setAttribute('aria-label', 'Grade 10x10 do palco')
    
    // Cria 100 células do grid
    this.stageCells = []
    for (let i = 0; i < this.gridSize * this.gridSize; i++) {
      const cell = document.createElement('div')
      cell.className = 'stageCell'
      cell.setAttribute('role', 'gridcell')
      this.stageGrid.appendChild(cell)
      this.stageCells.push(cell)
    }
    
    this.container.appendChild(this.stageGrid)
    
    // Ator (Personagem) - Apenas o emoji 🤖
    this.actor = document.createElement('div')
    this.actor.className = 'actor'
    this.actor.setAttribute('aria-label', 'Personagem do jogo: Robô')
    this.actor.textContent = '🤖'
    this.stageGrid.appendChild(this.actor)
    
    // Controles de Execução
    this.controlsArea = document.createElement('div')
    this.controlsArea.className = 'controlsArea'
    this.controlsArea.setAttribute('role', 'toolbar')
    this.controlsArea.setAttribute('aria-label', 'Controles de execução do código')
    
    this.controlsArea.innerHTML = `
      <button class="btn btn--run" aria-label="Executar código montado">
        Executar
      </button>
      <button class="btn btn--pause" aria-label="Pausar execução">
        Pausar
      </button>
      <button class="btn btn--clear" aria-label="Limpar workspace">
        Limpar
      </button>
    `
    
    this.container.appendChild(this.controlsArea)
    
    // Configura event listeners dos botões
    this.setupControlListeners()
    
    // Posiciona o ator inicial
    this.updateActorPosition()
    this.updateActorRotation()
    this.markCurrentCell()
  }

  /**
   * Configura os event listeners dos botões de controle
   */
  setupControlListeners() {
    const runButton = this.controlsArea.querySelector('.btn--run')
    const pauseButton = this.controlsArea.querySelector('.btn--pause')
    const clearButton = this.controlsArea.querySelector('.btn--clear')
    
    if (runButton) {
      runButton.addEventListener('click', () => {
        const event = new CustomEvent('stageRun', { bubbles: true })
        this.container.dispatchEvent(event)
      })
    }
    
    if (pauseButton) {
      pauseButton.addEventListener('click', () => {
        const event = new CustomEvent('stagePause', { bubbles: true })
        this.container.dispatchEvent(event)
      })
    }
    
    if (clearButton) {
      clearButton.addEventListener('click', () => {
        const event = new CustomEvent('stageClear', { bubbles: true })
        this.container.dispatchEvent(event)
      })
    }
  }

  /**
   * Reseta o ator para a posição inicial (0,0) e direção padrão
   */
  reset() {
    this.x = 0
    this.y = 0
    this.direction = 0 // 0=cima
    
    // Limpa células visitadas
    this.stageCells.forEach(cell => {
      cell.classList.remove('visited', 'current')
    })
    
    // Marca posição inicial
    this.updateActorPosition()
    this.updateActorRotation()
    this.markCurrentCell()
  }

  /**
   * Atualiza a posição visual do ator via CSS left/top
   */
  updateActorPosition() {
    const left = this.x * this.cellSize
    const top = this.y * this.cellSize
    
    this.actor.style.left = `${left}px`
    this.actor.style.top = `${top}px`
  }

  /**
   * Atualiza a rotação visual do ator baseada na direção
   */
  updateActorRotation() {
    // Mapeamento: 0=cima=0deg, 1=direita=90deg, 2=baixo=180deg, 3=esquerda=270deg
    const rotationMap = [0, 90, 180, 270]
    this.actor.style.transform = `rotate(${rotationMap[this.direction]}deg)`
  }

  /**
   * Marca a célula atual como visitada e atual
   */
  markCurrentCell() {
    const cellIndex = this.y * this.gridSize + this.x
    const cell = this.stageCells[cellIndex]
    
    if (cell) {
      cell.classList.add('visited', 'current')
    }
  }

  /**
   * Remove a marcação de célula atual
   */
  clearCurrentCell() {
    const cellIndex = this.y * this.gridSize + this.x
    const cell = this.stageCells[cellIndex]
    
    if (cell) {
      cell.classList.remove('current')
    }
  }

  /**
   * Move o ator na direção atual
   * @returns {boolean} true se moveu com sucesso, false se houve colisão
   */
  move() {
    // Calcula nova posição baseada na direção
    let newX = this.x
    let newY = this.y
    
    switch (this.direction) {
      case 0: // cima
        newY--
        break
      case 1: // direita
        newX++
        break
      case 2: // baixo
        newY++
        break
      case 3: // esquerda
        newX--
        break
    }
    
    // Verifica colisão com as bordas do grid (0-9)
    if (newX < 0 || newX >= this.gridSize || newY < 0 || newY >= this.gridSize) {
      return false // Colisão detectada
    }
    
    // Atualiza posição
    this.clearCurrentCell()
    this.x = newX
    this.y = newY
    
    this.updateActorPosition()
    this.markCurrentCell()
    
    return true
  }

  /**
   * Gira o ator 90 graus para a direita
   */
  turnRight() {
    this.direction = (this.direction + 1) % 4
    this.updateActorRotation()
  }

  /**
   * Gira o ator 90 graus para a esquerda
   */
  turnLeft() {
    this.direction = (this.direction + 3) % 4 // +3 equivale a -1 no módulo 4
    this.updateActorRotation()
  }

  /**
   * Verifica se uma posição está dentro dos limites do grid
   * @param {number} x - Coordenada X
   * @param {number} y - Coordenada Y
   * @returns {boolean} true se dentro dos limites
   */
  isWithinBounds(x, y) {
    return x >= 0 && x < this.gridSize && y >= 0 && y < this.gridSize
  }
}
