/**
 * Workspace.js - Componente da área de montagem de blocos
 * Gerencia pilhas de blocos e zona de drop
 * Comentários em português do Brasil conforme AGENTS.md
 */

export class Workspace {
  /**
   * Construtor do Workspace
   * @param {HTMLElement} container - Elemento main.workspaceArea do DOM
   */
  constructor(container) {
    this.container = container
    this.render()
  }

  /**
   * Renderiza o workspace com placeholder
   */
  render() {
    this.container.innerHTML = `
      <div class="workspacePlaceholder">
        <span class="material-symbols-outlined workspacePlaceholderIcon">drag_pan</span>
        <p class="workspacePlaceholderText">Arraste blocos aqui</p>
      </div>
    `
    
    this.workspaceElement = this.container
  }

  /**
   * Retorna o elemento do workspace
   * @returns {HTMLElement} Elemento .workspaceArea
   */
  getWorkspaceElement() {
    return this.workspaceElement
  }

  /**
   * Adiciona uma pilha de blocos ao workspace
   * @param {HTMLElement} blockStack - Elemento .blockStack para adicionar
   */
  addBlockStack(blockStack) {
    const placeholder = this.container.querySelector('.workspacePlaceholder')
    if (placeholder) {
      placeholder.style.display = 'none'
    }
    
    this.container.appendChild(blockStack)
  }

  /**
   * Limpa todas as pilhas do workspace
   */
  clear() {
    const stacks = this.container.querySelectorAll('.blockStack')
    stacks.forEach(stack => stack.remove())

    const containers = this.container.querySelectorAll('.blockContainer')
    containers.forEach(container => container.remove())

    const placeholder = this.container.querySelector('.workspacePlaceholder')
    if (placeholder) {
      placeholder.style.display = ''
    }

    this.dispatchBlockCountChanged()
  }

  /**
   * Retorna a quantidade total de blocos no workspace
   * @returns {number} Total de blocos
   */
  getBlockCount() {
    return this.container.querySelectorAll('.block').length
  }

  /**
   * Dispara evento customizado de mudança na quantidade de blocos
   */
  dispatchBlockCountChanged() {
    const event = new CustomEvent('blockCountChanged', {
      bubbles: true,
      detail: {
        count: this.getBlockCount()
      }
    })
    this.container.dispatchEvent(event)
  }
}