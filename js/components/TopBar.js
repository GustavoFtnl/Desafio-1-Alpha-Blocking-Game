/**
 * TopBar.js - Componente da barra superior gamificada
 * Renderiza dinamicamente: título, nível, estrelas, progresso e contador de blocos
 * Comentários em português do Brasil conforme AGENTS.md
 */

export class TopBar {
  /**
   * Construtor do TopBar
   * @param {HTMLElement} container - Elemento header.topBar do DOM
   */
  constructor(container) {
    this.container = container
    this.render()
  }

  /**
   * Renderiza toda a estrutura da barra superior
   */
  render() {
    this.container.innerHTML = `
       <h1 class="topBar_title">Temple Blocks</h1>
      <div class="topBar_levelInfo">
        <span class="topBar_levelText">Nível 1/10</span>
        
        <!-- Sistema de estrelas (Gamificação) -->
        <div class="starRating" aria-label="Progresso de estrelas: 0 de 3">
          <span class="star star--empty">*</span>
          <span class="star star--empty">*</span>
          <span class="star star--empty">*</span>
        </div>
        
        <!-- Barra de progresso do nível -->
        <div class="progressBar" aria-label="Progresso do jogo: 0%">
          <div class="progressBar_fill" style="width: 0%"></div>
        </div>
        
        <!-- Contador de blocos usados vs máximo -->
        <div class="blockCounter">
          <span>Blocos: 0/8</span>
        </div>
      </div>
    `
  }

  /**
   * Atualiza o texto do nível
   * @param {number} level - Nível atual
   * @param {number} total - Total de níveis (padrão 10)
   */
  updateLevel(level, total = 10) {
    const levelText = this.container.querySelector('.topBar_levelText')
    if (levelText) {
      levelText.textContent = `Nível ${level}/${total}`
    }
  }

  /**
   * Atualiza o sistema de estrelas
   * @param {number} count - Quantidade de estrelas preenchidas (0-3)
   */
  updateStars(count) {
    const starRating = this.container.querySelector('.starRating')
    if (!starRating) return

    const stars = starRating.querySelectorAll('.star')
    stars.forEach((star, index) => {
      if (index < count) {
        star.classList.remove('star--empty')
        star.classList.add('star--filled')
      } else {
        star.classList.remove('star--filled')
        star.classList.add('star--empty')
      }
    })

    starRating.setAttribute('aria-label', `Progresso de estrelas: ${count} de 3`)
  }

  /**
   * Atualiza a barra de progresso do jogo
   * @param {number} percent - Porcentagem de progresso (0-100)
   */
  updateProgress(percent) {
    const progressFill = this.container.querySelector('.progressBar_fill')
    const progressBar = this.container.querySelector('.progressBar')
    
    if (progressFill) {
      progressFill.style.width = `${percent}%`
    }
    
    if (progressBar) {
      progressBar.setAttribute('aria-label', `Progresso do jogo: ${percent}%`)
    }
  }

  /**
   * Atualiza o contador de blocos
   * @param {number} used - Blocos usados
   * @param {number} max - Máximo permitido
   */
  updateBlockCounter(used, max) {
    const blockCounter = this.container.querySelector('.blockCounter')
    if (!blockCounter) return

    blockCounter.innerHTML = `<span>Blocos: ${used}/${max}</span>`
    
    // Remove classes de aviso anteriores
    blockCounter.classList.remove('warning', 'danger')
    
    // Aplica classe conforme quantidade
    if (used > max) {
      blockCounter.classList.add('danger')
    } else if (used === max) {
      blockCounter.classList.add('warning')
    }
  }
}
