/**
 * Modal.js - Componente reutilizável para modais
 * Usado para nível concluído e jogo zerado
 * Comentários em português do Brasil conforme AGENTS.md
 */

export class Modal {
  constructor() {
    this.modalElement = null
  }

  /**
   * Abre o modal com conteúdo HTML
   * @param {string} contentHtml - HTML do conteúdo do modal
   * @returns {Promise} Resolve quando o modal for fechado
   */
  open(contentHtml) {
    return new Promise((resolve) => {
      // Cria o modal
      this.modalElement = document.createElement('div')
      this.modalElement.className = 'modal'
      this.modalElement.setAttribute('role', 'dialog')
      this.modalElement.setAttribute('aria-label', 'Modal')
      this.modalElement.setAttribute('aria-hidden', 'false')
      
      // Adiciona o conteúdo
      this.modalElement.innerHTML = `
        <div class="modal_content">
          ${contentHtml}
        </div>
      `
      
      // Adiciona ao body
      document.body.appendChild(this.modalElement)
      
      // Foca no modal para acessibilidade
      this.modalElement.focus()
      
      // Resolve a promise quando o modal for fechado
      this.resolvePromise = resolve
    })
  }

  /**
   * Fecha o modal e remove do DOM
   */
  close() {
    if (this.modalElement) {
      this.modalElement.remove()
      this.modalElement = null
      
      // Resolve a promise se existir
      if (this.resolvePromise) {
        this.resolvePromise()
        this.resolvePromise = null
      }
    }
  }

  /**
   * Cria HTML para o modal de nível concluído
   * @param {number} stars - Estrelas recebidas (1-3)
   * @param {number} maxBlocks - Limite do nível
   * @param {number} usedBlocks - Blocos usados
   * @returns {string} HTML do modal
   */
  static createLevelCompleteHtml(stars, maxBlocks, usedBlocks) {
    const starsHtml = Modal.generateStarsHtml(stars)
    
    return `
      <h2 class="modal_title">Nível Concluído! *</h2>
      <div class="modal_stars">${starsHtml}</div>
      <p>Você usou ${usedBlocks} blocos (limite: ${maxBlocks}).</p>
      <button class="btn btn--run" id="nextLevelBtn" aria-label="Avançar para próximo nível">
        Próximo Nível
      </button>
    `
  }

  /**
   * Cria HTML para o modal de jogo zerado
   * @param {number} finalStars - Estrelas do último nível
   * @returns {string} HTML do modal
   */
  static createGameCompleteHtml(finalStars) {
    const starsHtml = Modal.generateStarsHtml(finalStars)
    
    return `
      <h2 class="modal_title">Parabéns! Jogo Zerado! *</h2>
      <div class="modal_stars">${starsHtml}</div>
      <p>Você completou todos os 20 níveis!</p>
      <button class="btn btn--run" id="restartCareerBtn" aria-label="Reiniciar carreira">
        Reiniciar Carreira
      </button>
    `
  }

  /**
   * Gera HTML das estrelas
   * @param {number} starCount - Quantidade de estrelas preenchidas
   * @returns {string} HTML das estrelas
   */
  static generateStarsHtml(starCount) {
    let html = ''
    for (let i = 0; i < 3; i++) {
      if (i < starCount) {
        html += '<span class="star star--filled">*</span>'
      } else {
        html += '<span class="star star--empty">*</span>'
      }
    }
    return html
  }

  /**
   * Cria HTML para o modal de nível falhou (atingiu armadilha)
   * @returns {string} HTML do modal
   */
  static createLevelFailedHtml() {
    return `
      <h2 class="modal_title" style="color: var(--color-danger);">Ops! *
        <span style="font-size: 48px;">💥</span>
      </h2>
      <p>Você atingiu uma armadilha!</p>
      <p>Volte a posição inicial e tente outro caminho.</p>
      <button class="btn btn--run" id="retryBtn" aria-label="Tentar novamente">
        Tentar Novamente
      </button>
    `
  }

  /**
   * Cria HTML para o modal de nível incompleto (não alcançou o troféu)
   * @returns {string} HTML do modal
   */
  static createLevelIncompleteHtml() {
    return `
      <h2 class="modal_title">Código encerrado! *
        <span style="font-size: 48px;">🏁</span>
      </h2>
      <p>Você não alcançou o troféu.</p>
      <p>Seu código terminou antes de chegar ao objetivo.</p>
      <button class="btn btn--run" id="retryBtn" aria-label="Tentar novamente">
        Tentar Novamente
      </button>
    `
  }
}
