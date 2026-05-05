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
      <div style="display: flex; align-items: center; gap: var(--space-lg);">
        <h1 class="topBar_title">Code Blocks Game</h1>
        <div class="topBar_progress" style="display: none;">
          <div class="topBar_progressLabel">
            <span>Progresso</span>
            <span class="progressPercent">0%</span>
          </div>
          <div class="topBar_progressBar">
            <div class="topBar_progressFill" style="width: 0%"></div>
          </div>
        </div>
      </div>
      <div style="display: flex; align-items: center; gap: var(--space-md);">
        <span class="topBar_levelText">Nível 1/10</span>
        <div class="starRating" aria-label="Progresso de estrelas: 0 de 3">
          <span class="star star--empty material-symbols-outlined">star</span>
          <span class="star star--empty material-symbols-outlined">star</span>
          <span class="star star--empty material-symbols-outlined">star</span>
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
    const progressFill = this.container.querySelector('.topBar_progressFill')
    const progressPercent = this.container.querySelector('.progressPercent')
    const progressContainer = this.container.querySelector('.topBar_progress')
    
    if (progressContainer) {
      progressContainer.style.display = 'flex'
    }
    
    if (progressFill) {
      progressFill.style.width = `${percent}%`
    }
    
    if (progressPercent) {
      progressPercent.textContent = `${Math.round(percent)}%`
    }
  }

  /**
   * Atualiza o contador de blocos
   * @param {number} used - Blocos usados
   * @param {number} max - Máximo permitido
   */
  updateBlockCounter(used, max) {
    // Este método não é usado no TopBar do exemplo
    // O contador de blocos está no Stage
  }
}