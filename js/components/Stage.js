/**
 * Stage.js - Gerencia a posição e rotação do ator no grid 10x10
 * Grid: 400x400px (40px por célula)
 * Direções: 0=cima, 1=direita, 2=baixo, 3=esquerda
 */

export class Stage {
  constructor() {
    // Elementos do DOM
    this.stageGrid = document.querySelector('.stageGrid')
    this.actor = document.querySelector('.actor')
    this.stageCells = document.querySelectorAll('.stageCell')
    
    // Configurações do grid
    this.gridSize = 10
    this.cellSize = 40 // 400px / 10 células
    
    // Estado inicial do ator (sempre começa em 0,0 conforme decisão)
    this.reset()
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
