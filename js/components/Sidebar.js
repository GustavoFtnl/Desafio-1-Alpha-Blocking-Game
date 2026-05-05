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
       { type: 'block--move', text: 'Mover' },
       { type: 'block--rotate', text: 'Girar' },
       { type: 'block--repeat', text: 'Repetir' },
       { type: 'block--conditional', text: 'Se' },
       { type: 'block--action', text: 'Ação' },
       { type: 'block--control', text: 'Controle' }
     ]
    
    this.render()
  }

  /**
   * Renderiza a sidebar com título e paleta de blocos
   */
  render() {
    this.container.innerHTML = `
       <h2 class="sidebar_title">Ações</h2>
       <div class="blockPalette">
         ${this.blockTypes.map(block => `
           <div class="block ${block.type}" draggable="true" 
                aria-label="Bloco de comando: ${block.text}" 
                aria-grabbed="false">
             <span class="block_text" style="text-align: center; width: 100%;">${block.text}</span>
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
