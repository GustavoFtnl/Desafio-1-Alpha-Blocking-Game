/**
 * Sidebar.js - Componente da barra lateral com paleta de blocos
 * Renderiza dinamicamente os blocos arrastáveis
 * Comentários em português do Brasil conforme AGENTS.md
 */

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
    const blockTypes = [
      { type: "block--move", icon: "move_up", text: "Mover para frente" },
      { type: "block--rotate", icon: "rotate_right", text: "Girar 90°" },
      { type: "block--repeat", icon: "loop", text: "Repetir 3x" },
      { type: "block--conditional", icon: "question_mark", text: "Se obstáculo..." },
      { type: "block--action", icon: "play_arrow", text: "Coletar Item" },
      { type: "block--control", icon: "stop", text: "Parar Execução" },
    ];

    this.container.innerHTML = `
      <div class="sidebar_content">
        <div class="sidebar_title">
          <span class="material-symbols-outlined sidebar_titleIcon">psychology</span>
          <h2 style="font-size: var(--font-h2-size); font-weight: var(--font-h2-weight); font-weight: 700;">Biblioteca</h2>
        </div>
        <p class="sidebar_subtitle">Arraste os blocos</p>
        <div class="blockPalette">
          ${blockTypes
            .map(
              (block) => `
            <div class="block ${block.type}" draggable="true" 
                 aria-label="Bloco de comando: ${block.text}" 
                 aria-grabbed="false">
              <span class="material-symbols-outlined blockIcon">${block.icon}</span>
              <span class="block_text">${block.text}</span>
            </div>
          `,
            )
            .join("")}
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