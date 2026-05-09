/**
 * Modal.js - Componente reutilizável para modais
 * Usado para nível concluído e jogo zerado
 * Comentários em português do Brasil conforme AGENTS.md
 */

export class Modal {
  constructor() {
    this.modalElement = null
    this.overlayElement = null
    this.resolvePromise = null
    this.previousActiveElement = null
    this.isOpen = false
    this.boundKeyHandler = null
  }

  /**
   * Abre o modal com conteúdo HTML
   * @param {string} contentHtml - HTML do conteúdo do modal
   * @returns {Promise} Resolve quando o modal for fechado
   */
  open(contentHtml) {
    if (this.isOpen) {
      this.close()
    }

    return new Promise((resolve) => {
      this.resolvePromise = resolve
      this.previousActiveElement = document.activeElement
      this.isOpen = true

      this.createOverlay()
      this.createModal(contentHtml)
      this.attachEventListeners()

      document.body.appendChild(this.overlayElement)
      this.overlayElement.appendChild(this.modalElement)

      setTimeout(() => {
        this.modalElement.focus()
      }, 10)
    })
  }

  /**
   * Cria o elemento de overlay (fundo escurecido)
   */
  createOverlay() {
    this.overlayElement = document.createElement("div")
    this.overlayElement.className = "modalOverlay"
    this.overlayElement.setAttribute("role", "presentation")
    this.overlayElement.setAttribute("aria-hidden", "true")
  }

  /**
   * Cria o elemento do modal
   * @param {string} contentHtml - HTML do conteúdo
   */
  createModal(contentHtml) {
    this.modalElement = document.createElement("div")
    this.modalElement.className = "modal"
    this.modalElement.setAttribute("role", "dialog")
    this.modalElement.setAttribute("aria-modal", "true")
    this.modalElement.setAttribute("aria-label", "Diálogo do modal")
    this.modalElement.setAttribute("tabindex", "-1")

    const uniqueId = "modal-" + Date.now()

    this.modalElement.innerHTML = `
      <button class="modal_close" aria-label="Fechar modal">
        <span class="material-symbols-outlined">close</span>
      </button>
      <div class="modal_content" id="${uniqueId}_content">
        ${contentHtml}
      </div>
    `
  }

  /**
   * Configura os event listeners
   */
  attachEventListeners() {
    this.boundKeyHandler = this.handleKeyDown.bind(this)
    document.addEventListener("keydown", this.boundKeyHandler)

    const closeBtn = this.modalElement.querySelector(".modal_close")
    if (closeBtn) {
      closeBtn.addEventListener("click", () => this.close())
    }

    this.overlayElement.addEventListener("click", (e) => {
      if (e.target === this.overlayElement) {
        this.close()
      }
    })
  }

  /**
   * Handler para tecla ESC
   * @param {KeyboardEvent} event
   */
  handleKeyDown(event) {
    if (event.key === "Escape" && this.isOpen) {
      this.close()
    }

    if (event.key === "Tab" && this.modalElement) {
      const focusableElements = this.modalElement.querySelectorAll(
        'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'
      )
      const firstElement = focusableElements[0]
      const lastElement = focusableElements[focusableElements.length - 1]

      if (event.shiftKey && document.activeElement === firstElement) {
        event.preventDefault()
        lastElement.focus()
      } else if (!event.shiftKey && document.activeElement === lastElement) {
        event.preventDefault()
        firstElement.focus()
      }
    }
  }

  /**
   * Remove os event listeners
   */
  removeEventListeners() {
    if (this.boundKeyHandler) {
      document.removeEventListener("keydown", this.boundKeyHandler)
      this.boundKeyHandler = null
    }
  }

  /**
   * Fecha o modal e remove do DOM
   */
  close() {
    if (!this.isOpen) return

    this.isOpen = false
    this.removeEventListeners()

    if (this.modalElement) {
      this.modalElement.remove()
      this.modalElement = null
    }

    if (this.overlayElement) {
      this.overlayElement.remove()
      this.overlayElement = null
    }

    if (this.previousActiveElement) {
      this.previousActiveElement.focus()
      this.previousActiveElement = null
    }

    if (this.resolvePromise) {
      this.resolvePromise()
      this.resolvePromise = null
    }
  }

  /**
   * Verifica se o modal está aberto
   * @returns {boolean}
   */
  get isModalOpen() {
    return this.isOpen
  }

  /**
   * Gera HTML para o modal de nível concluído
   * @param {number} stars - Estrelas recebidas (1-3)
   * @param {number} maxBlocks - Limite do nível
   * @param {number} usedBlocks - Blocos usados
   * @returns {string} HTML do modal
   */
  static createLevelCompleteHtml(stars, maxBlocks, usedBlocks) {
    const starsHtml = Modal.generateStarsHtml(stars)
    const uniqueId = "nextLevelBtn-" + Date.now()

    return `
      <h2 class="modal_title">Nível Concluído!</h2>
      <div class="modal_stars">${starsHtml}</div>
      <div class="modal_actions">
        <button class="btn btn--run" id="${uniqueId}" aria-label="Avançar para próximo nível">
          Próximo Nível
        </button>
      </div>
    `
  }

  /**
   * Gera HTML para o modal de jogo zerado
   * @param {number} finalStars - Estrelas do último nível
   * @returns {string} HTML do modal
   */
  static createGameCompleteHtml(finalStars) {
    const starsHtml = Modal.generateStarsHtml(finalStars)
    const uniqueId = "restartCareerBtn-" + Date.now()

    return `
      <h2 class="modal_title">Parabéns! Jogo Zerado!</h2>
      <div class="modal_stars">${starsHtml}</div>
      <p>Você completou todos os 10 níveis!</p>
      <button class="btn btn--run" id="${uniqueId}" aria-label="Reiniciar carreira">
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
    let html = ""
    for (let i = 0; i < 3; i++) {
      if (i < starCount) {
        html += '<span class="star star--filled">★</span>'
      } else {
        html += '<span class="star star--empty">★</span>'
      }
    }
    return html
  }

  /**
   * Gera HTML para o modal de nível falhou (atingiu armadilha)
   * @returns {string} HTML do modal
   */
  static createLevelFailedHtml() {
    const uniqueId = "retryBtn-" + Date.now()

    return `
      <h2 class="modal_title modal_title--danger">Ops! 😵</h2>
      <p>Você atingiu uma armadilha!</p>
      <p>Volte a posição inicial e tente outro caminho.</p>
      <div class="modal_actions">
        <button class="btn btn--run" id="${uniqueId}" aria-label="Tentar novamente">
          Tentar Novamente
        </button>
      </div>
    `
  }

  /**
   * Gera HTML para o modal de nível incompleto (não alcançou o troféu)
   * @returns {string} HTML do modal
   */
  static createLevelIncompleteHtml() {
    const uniqueId = "retryIncompleteBtn-" + Date.now()

    return `
      <h2 class="modal_title">Código encerrado! 🏁</h2>
      <p>Você não alcançou o troféu.</p>
      <p>Seu código terminou antes de chegar ao objetivo.</p>
      <div class="modal_actions">
        <button class="btn btn--run" id="${uniqueId}" aria-label="Tentar novamente">
          Tentar Novamente
        </button>
      </div>
    `
  }
}