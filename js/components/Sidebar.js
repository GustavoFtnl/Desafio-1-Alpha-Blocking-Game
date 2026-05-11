/**
 * Sidebar.js - Componente da barra lateral com paleta de blocos
 * Renderiza dinamicamente os blocos arrastáveis
 * Comentários em português do Brasil conforme AGENTS.md
 */

import { Block } from "./Block.js";

export class Sidebar {
  /**
   * Construtor do Sidebar
   * @param {HTMLElement} container - Elemento aside.sidebar do DOM
   */
  constructor(container) {
    this.container = container;

    this.render();
  }

  /**
   * Renderiza a sidebar com título e paleta de blocos
   */
  render() {
    const categories = Block.getCategories();
    const configsByCategory = Block.getConfigsByCategory();

    const categoriesHtml = categories
      .map((category) => {
        const blocks = configsByCategory[category.id] || [];
        const blocksHtml = blocks
          .map((config) => {
            const blockElement = Block.createElement(
              config.text,
              config.icon,
              config.type,
            );
            return blockElement.outerHTML;
          })
          .join("");

        return `
          <div class="blockCategory" data-category="${category.id}">
            <button class="blockCategoryHeader" aria-expanded="true" aria-controls="blocks-${category.id}">
              <span class="material-symbols-outlined blockCategoryIcon">${category.icon}</span>
              <span class="blockCategoryName">${category.name}</span>
              <span class="material-symbols-outlined blockCategoryToggle">expand_more</span>
            </button>
            <div class="blockCategoryBlocks" id="blocks-${category.id}">
              ${blocksHtml}
            </div>
          </div>
        `;
      })
      .join("");

    this.container.innerHTML = `
      <div class="sidebar_content">
        <div class="sidebar_title">
          <span class="material-symbols-outlined sidebar_titleIcon">psychology</span>
          <h2 class="sidebar_titleText">Biblioteca</h2>
        </div>
        <p class="sidebar_subtitle">Arraste os blocos</p>
        <div class="blockPalette">
          ${categoriesHtml}
        </div>
      </div>
    `;

    this.paletteElement = this.container.querySelector(".blockPalette");

    this.setupTooltipListeners();
    this.setupCategoryToggle();
  }

  setupCategoryToggle() {
    const headers = this.paletteElement.querySelectorAll(".blockCategoryHeader");
    headers.forEach((header) => {
      header.addEventListener("click", () => {
        const category = header.closest(".blockCategory");
        const isExpanded = header.getAttribute("aria-expanded") === "true";
        const blocks = category.querySelector(".blockCategoryBlocks");
        const toggle = header.querySelector(".blockCategoryToggle");

        if (isExpanded) {
          header.setAttribute("aria-expanded", "false");
          blocks.style.display = "none";
          toggle.textContent = "chevron_right";
        } else {
          header.setAttribute("aria-expanded", "true");
          blocks.style.display = "flex";
          toggle.textContent = "expand_more";
        }
      });
    });
  }

  setupTooltipListeners() {
    this.paletteElement.addEventListener("mousedown", (e) => {
      if (e.target.closest(".blockTooltipTrigger")) {
        e.stopPropagation();
      }
    });

    this.paletteElement.addEventListener("click", (e) => {
      if (e.target.closest(".blockTooltipTrigger")) {
        e.stopPropagation();
      }
    });
  }

  /**
   * Retorna o elemento da paleta de blocos
   * @returns {HTMLElement} Elemento .blockPalette
   */
  getPaletteElement() {
    return this.paletteElement;
  }

  getBlockConfigs() {
    return Block.getConfigs();
  }
}