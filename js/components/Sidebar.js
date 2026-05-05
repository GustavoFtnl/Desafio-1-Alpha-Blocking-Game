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
    this.container = container
    
    // Configuração dos tipos de blocos disponíveis
    this.blockTypes = [
      { type: 'block--move', icon: '↕', text: 'Mover' },
      { type: 'block--direction', icon: '→', text: 'Direita' },
      { type: 'block--direction', icon: '←', text: 'Esquerda' },
      { type: 'block--direction', icon: '↑', text: 'Cima' },
      { type: 'block--direction', icon: '↓', text: 'Baixo' },
      { type: 'block--repeat', icon: '⟳', text: 'Repetir' },
      { type: 'block--conditional', icon: '?', text: 'Se' },
      { type: 'block--action', icon: '!', text: 'Ação' }
    ]
    
    this.render()
  }

  /**
   * Renderiza a sidebar com título e paleta de blocos
   */
  render() {
    this.container.innerHTML = `
      <h2 class="sidebar_title">Blocos</h2>
      <div class="blockPalette">
        ${this.blockTypes.map(block => `
          <div class="block ${block.type}" draggable="true" 
               aria-label="Bloco de comando: ${block.text}" 
               aria-grabbed="false">
            <span class="block_icon">${block.icon}</span>
            <span class="block_text">${block.text}</span>
          </div>
        `).join('')}
      </div>
    `
    
    // Armazena referência ao palette para o DragDrop usar
    this.paletteElement = this.container.querySelector('.blockPalette')
  }

  /**
   * Retorna o elemento da paleta de blocos
   * @returns {HTMLElement} Elemento .blockPalette
   */
  getPaletteElement() {
    return this.paletteElement
  }
}
