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
    this.resolvePromise = null;
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
    this.modalElement = document.createElement("div");
    this.modalElement.className = "modal";
    this.modalElement.setAttribute("role", "dialog");
    this.modalElement.setAttribute("aria-label", "Seleção de nível");
    this.modalElement.setAttribute("aria-hidden", "false");

    const levelsList = this.generateLevelsList(currentLevel, getStarsForLevelFn);

    this.modalElement.innerHTML = `
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

    document.body.appendChild(this.modalElement);
    this.modalElement.focus();

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
      const isCompleted = stars >= 1;
      const isLocked = !isCompleted && level > 1;

      const starsHtml = this.generateStarsSvg(stars);

      html += `
        <button 
          class="levelItem ${isLocked ? "levelItem--locked" : ""}" 
          data-level="${level}"
          role="option"
          aria-label="Nível ${level}, ${stars} estrela${stars !== 1 ? "s" : ""}"
          ${isLocked ? "disabled" : ""}
        >
          <span class="levelItem_number">Nível ${level}</span>
          <div class="levelItem_stars">${starsHtml}</div>
        </button>
      `;
    }

    return html;
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
        <svg class="starSvg" viewBox="0 0 24 24" width="20" height="20">
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
    const closeBtn = this.modalElement.querySelector("#levelsModalCloseBtn");
    if (closeBtn) {
      closeBtn.addEventListener("click", () => {
        this.close();
      });
    }

    const levelItems = this.modalElement.querySelectorAll(".levelItem:not([disabled])");
    levelItems.forEach((item) => {
      item.addEventListener("click", () => {
        const level = parseInt(item.dataset.level, 10);
        this.close();
        if (this.resolvePromise) {
          this.resolvePromise(level);
          this.resolvePromise = null;
        }
      });
    });
  }

  /**
   * Fecha o modal
   */
  close() {
    if (this.modalElement) {
      this.modalElement.remove();
      this.modalElement = null;

      if (this.resolvePromise) {
        this.resolvePromise(null);
        this.resolvePromise = null;
      }
    }
  }
}