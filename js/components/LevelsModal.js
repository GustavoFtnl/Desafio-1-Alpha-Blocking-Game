/**
 * LevelsModal.js - Modal de seleção de níveis
 * Lista os níveis disponíveis com estrelas e permite selecionar
 * Bloqueia níveis não concluídos (sem pelo menos 1 estrela)
 * Comentários em português do Brasil conforme AGENTS.md
 */

import CONFIG from "../config.js";

export class LevelsModal {
  constructor() {
    this.modalElement = null;
    this.overlayElement = null;
    this.resolvePromise = null;
    this.boundKeyHandler = null;
  }

  /**
   * Abre o modal de seleção de níveis
   * @param {number} currentLevel - Nível atual do jogador
   * @param {function} getStarsForLevelFn - Função que retorna estrelas de um nível
   * @returns {Promise<number>} Resolve com nível seleccionado
   */
  open(currentLevel, getStarsForLevelFn) {
    return new Promise((resolve) => {
      this.resolvePromise = resolve;
      this.render(currentLevel, getStarsForLevelFn);
    });
  }

  /**
   * Renderiza o modal com a lista de níveis
   * @param {number} currentLevel - Nível atual
   * @param {function} getStarsForLevelFn - Função para obter estrelas
   */
  render(currentLevel, getStarsForLevelFn) {
    this.overlayElement = document.createElement("div");
    this.overlayElement.className = "modalOverlay";
    this.overlayElement.setAttribute("role", "presentation");
    this.overlayElement.setAttribute("aria-hidden", "true");

    this.modalElement = document.createElement("div");
    this.modalElement.className = "modal";
    this.modalElement.setAttribute("role", "dialog");
    this.modalElement.setAttribute("aria-modal", "true");
    this.modalElement.setAttribute("aria-label", "Seleção de nível");
    this.modalElement.setAttribute("tabindex", "-1");

    const levelsList = this.generateLevelsList(
      currentLevel,
      getStarsForLevelFn,
    );

    this.modalElement.innerHTML = `
      <button class="modal_close" aria-label="Fechar modal">
        <span class="material-symbols-outlined">close</span>
      </button>
      <div class="modal_content levelsModal_content">
        <h2 class="modal_title">Selecionar Nível</h2>
        <div class="levelsGrid" role="listbox" aria-label="Lista de níveis">
          ${levelsList}
        </div>
        <button class="btn btn--cancel" id="levelsModalCloseBtn" aria-label="Fechar">
          Cancelar
        </button>
      </div>
    `;

    this.overlayElement.appendChild(this.modalElement);
    document.body.appendChild(this.overlayElement);

    setTimeout(() => {
      this.modalElement.focus();
    }, 10);

    this.setupListeners(currentLevel, getStarsForLevelFn);
  }

  /**
   * Gera o HTML da lista de níveis
   * @param {number} currentLevel - Nível atual
   * @param {function} getStarsForLevelFn - Função para obter estrelas
   * @returns {string} HTML da lista
   */
  generateLevelsList(currentLevel, getStarsForLevelFn) {
    let html = "";
    const totalLevels = CONFIG.DEFAULTS.TOTAL_LEVELS;

    for (let level = 1; level <= totalLevels; level++) {
      const stars = getStarsForLevelFn ? getStarsForLevelFn(level) : 0;

      const isUnlocked = this.isLevelUnlocked(level, getStarsForLevelFn);
      const disabledAttr = isUnlocked ? "" : "disabled";
      const lockedClass = isUnlocked ? "" : "levelItem--locked";
      const ariaLabel = isUnlocked
        ? `Nível ${level}, ${stars} estrela${stars !== 1 ? "s" : ""}`
        : `Nível ${level} bloqueado - complete o nível anterior para desbloquear`;

      const starsHtml = isUnlocked
        ? this.generateStarsSvg(stars)
        : this.generateLockedIcon();

      html += `
        <button 
          class="levelItem ${lockedClass}" 
          data-level="${level}"
          role="option"
          aria-label="${ariaLabel}"
          ${disabledAttr}
        >
          <span class="levelItem_number">Nível ${level}</span>
          <div class="levelItem_stars">${starsHtml}</div>
        </button>
      `;
    }

    return html;
  }
  /**
   * Verifica se um nível está desbloqueado
   * @param {number} level - Número do nível
   * @param {function} getStarsForLevelFn - Função para obter estrelas
   * @returns {boolean} true se o nível está desbloqueado
   */
  isLevelUnlocked(level, getStarsForLevelFn) {
    if (level === 1) return true;

    const previousLevelStars = getStarsForLevelFn
      ? getStarsForLevelFn(level - 1)
      : 0;
    return previousLevelStars >= 1;
  }

  /**
   * Gera HTML do ícone de bloqueio
   * @returns {string} HTML do ícone
   */
  generateLockedIcon() {
    return `
      <svg class="lockIcon" viewBox="0 0 24 24" width="28" height="28">
        <path fill="#9ca3af" d="M18 8h-1V6c0-2.76-2.24-5-5-5S7 3.24 7 6v2H6c-1.1 0-2 .9-2 2v10c0 1.1.9 2 2 2h12c1.1 0 2-.9 2-2V10c0-1.1-.9-2-2-2zm-6 9c-1.1 0-2-.9-2-2s.9-2 2-2 2 .9 2 2-.9 2-2 2zm3.1-9H8.9V6c0-1.71 1.39-3.1 3.1-3.1 1.71 0 3.1 1.39 3.1 3.1v2z"/>
      </svg>
    `;
  }

  /**
   * Gera HTML das estrelas em SVG
   * @param {number} starCount - Quantidade de estrelas preenchidas
   * @returns {string} HTML das estrelas
   */
  generateStarsSvg(starCount) {
    let html = "";
    const filledColor = "#fbbf24";
    const emptyColor = "#d1d5db";

    for (let i = 0; i < 3; i++) {
      const color = i < starCount ? filledColor : emptyColor;
      html += `
        <svg class="starSvg" viewBox="0 0 24 24" width="36" height="36">
          <path fill="${color}" d="M12 17.27L18.18 21l-1.64-7.03L22 9.24l-7.19-.61L12 2 9.19 8.63 2 9.24l5.46 4.73L5.82 21z"/>
        </svg>
      `;
    }
    return html;
  }

  /**
   * Configura os event listeners
   * @param {number} currentLevel - Nível atual
   * @param {function} getStarsForLevelFn - Função para obter estrelas
   */
  setupListeners(currentLevel, getStarsForLevelFn) {
    const self = this;

    this.boundKeyHandler = (event) => {
      if (event.key === "Escape") {
        self.close();
      }
    };
    document.addEventListener("keydown", this.boundKeyHandler);

    const closeBtn = this.modalElement.querySelector(".modal_close");
    if (closeBtn) {
      closeBtn.addEventListener("click", () => self.close());
    }

    const cancelBtn = this.modalElement.querySelector("#levelsModalCloseBtn");
    if (cancelBtn) {
      cancelBtn.addEventListener("click", () => self.close());
    }

    this.overlayElement.addEventListener("click", (e) => {
      if (e.target === this.overlayElement) {
        self.close();
      }
    });

    const levelItems = this.modalElement.querySelectorAll(".levelItem");
    levelItems.forEach((item) => {
      item.addEventListener("click", () => {
        const level = parseInt(item.dataset.level, 10);
        if (self.resolvePromise) {
          self.resolvePromise(level);
          self.resolvePromise = null;
        }
        self.close();
      });
    });
  }

  /**
   * Remove os event listeners
   */
  removeEventListeners() {
    if (this.boundKeyHandler) {
      document.removeEventListener("keydown", this.boundKeyHandler);
      this.boundKeyHandler = null;
    }
  }

  /**
   * Fecha o modal
   */
  close() {
    this.removeEventListeners();

    if (this.modalElement) {
      this.modalElement.remove();
      this.modalElement = null;
    }

    if (this.overlayElement) {
      this.overlayElement.remove();
      this.overlayElement = null;
    }

    if (this.resolvePromise) {
      this.resolvePromise(null);
      this.resolvePromise = null;
    }
  }
}
