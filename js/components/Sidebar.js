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
    const blockConfigs = Block.getConfigs();

    const blocksHtml = blockConfigs
      .map((config) => {
        const blockElement = Block.createElement(
          config.text,
          config.icon,
          config.type,
        );
        return blockElement.outerHTML;
      })
      .join("");

    this.container.innerHTML = `
      <div class="sidebar_content">
        <div class="sidebar_title">
          <span class="material-symbols-outlined sidebar_titleIcon">psychology</span>
          <h2 style="font-size: var(--font-h2-size); font-weight: var(--font-h2-weight); font-weight: 700;">Biblioteca</h2>
        </div>
        <p class="sidebar_subtitle">Arraste os blocos</p>
        <div class="blockPalette">
          ${blocksHtml}
        </div>
        <button class="sidebar_newProjectBtn">Novo Projeto</button>
      </div>
    `;

    this.paletteElement = this.container.querySelector(".blockPalette");
  }

  /**
   * Retorna o elemento da paleta de blocos
   * @returns {HTMLElement} Elemento .blockPalette
   */
  getPaletteElement() {
    return this.paletteElement;
  }
}