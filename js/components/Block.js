/**
 * Block.js - Componente reutilizável para blocos de programação
 * Renderiza um bloco com ícone, texto e tipo específicos
 * Comentários em português do Brasil conforme AGENTS.md
 */

export class Block {
  /**
   * Cria uma instância de elemento DOM para o bloco
   * @param {string} text - Texto exibido no bloco
   * @param {string} icon - Ícone do bloco (nome do ícone ou símbolo)
   * @param {string} type - Tipo do bloco (classe CSS)
   * @returns {HTMLElement} Elemento div.block
   */
  static createElement(text, icon, type) {
    const block = document.createElement("div");
    block.className = `block ${type}`;
    block.setAttribute("draggable", "true");
    block.setAttribute("aria-label", `Bloco de comando: ${text}`);
    block.setAttribute("aria-grabbed", "false");

    const isSymbol = icon.length <= 2;
    const iconHtml = isSymbol
      ? icon
      : `<span class="material-symbols-outlined blockIcon">${icon}</span>`;

    block.innerHTML = `${iconHtml}<span class="block_text">${text}</span>`;

    return block;
  }

  /**
   * Clona um bloco existente mantendo suas propriedades
   * @param {HTMLElement} originalBlock - Bloco original a ser clonado
   * @returns {HTMLElement} Clone do bloco
   */
  static clone(originalBlock) {
    const clone = originalBlock.cloneNode(true);
    clone.classList.remove("dragging");
    clone.setAttribute("aria-grabbed", "false");
    clone.setAttribute("draggable", "true");
    return clone;
  }

  /**
   * Extrai o tipo do bloco a partir do elemento
   * @param {HTMLElement} block - Elemento do bloco
   * @returns {string} Tipo do bloco (classe block--*)
   */
  static getType(block) {
    const classes = block.className.split(" ");
    for (const cls of classes) {
      if (cls.startsWith("block--")) {
        return cls;
      }
    }
    return "block--move";
  }

  /**
   * Define as configurações padrão dos blocos disponíveis
   * @returns {Array} Array de objetos com type, icon e text
   */
  static getConfigs() {
    return [
      { type: "block--move", icon: "move_up", text: "Mover" },
      { type: "block--direction", icon: "→", text: "Direita" },
      { type: "block--direction", icon: "←", text: "Esquerda" },
      { type: "block--direction", icon: "↑", text: "Cima" },
      { type: "block--direction", icon: "↓", text: "Baixo" },
      { type: "block--repeat", icon: "loop", text: "Repetir" },
      { type: "block--action", icon: "play_arrow", text: "Ação" },
    ];
  }
}