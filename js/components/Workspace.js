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
    this.isPanning = false
    this.startX = 0
    this.startY = 0
    this.panX = 0
    this.panY = 0
    this.render()
    this.setupPanListeners()
  }

  /**
   * Configura listeners para pan estilo Excalidraw
   */
  setupPanListeners() {
    this.container.addEventListener("mousedown", (e) => {
      const target = e.target
      const withinWorkspace = this.container.contains(target)

      if (withinWorkspace) {
        const hasBlocks = this.container.querySelectorAll(".block").length > 0

        if (hasBlocks) {
          const isBlock = target.closest(".block")
          const isBlockSlot = target.closest(".blockSlot")

          if (!isBlock && !isBlockSlot) {
            this.isPanning = true
            this.startX = e.clientX
            this.startY = e.clientY
            e.preventDefault()
          }
        }
      }
    })

    document.addEventListener("mousemove", (e) => {
      if (!this.isPanning) return
      e.preventDefault()

      const dx = e.clientX - this.startX
      const dy = e.clientY - this.startY

      this.panX += dx
      this.panY += dy

      this.startX = e.clientX
      this.startY = e.clientY

      this.updatePanPosition()
    })

    document.addEventListener("mouseup", () => {
      this.isPanning = false
    })
  }

  /**
   * Atualiza a posição dos elementos com base no pan
   */
  updatePanPosition() {
    const workspaceContent = this.container.querySelector(".workspaceContent")
    if (workspaceContent) {
      workspaceContent.style.transform = `translate(${this.panX}px, ${this.panY}px)`
    }
  }

  /**
   * Renderiza o workspace com placeholder
   */
  render() {
    this.container.innerHTML = `
      <div class="workspaceContent" style="transform: translate(0px, 0px);">
        <div class="workspacePlaceholder">
          <span class="material-symbols-outlined workspacePlaceholderIcon">drag_pan</span>
          <p class="workspacePlaceholderText">Arraste blocos aqui</p>
        </div>
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

    const workspaceContent = this.container.querySelector(".workspaceContent")
    if (workspaceContent) {
      workspaceContent.appendChild(blockStack)
    } else {
      this.container.appendChild(blockStack)
    }
  }

  /**
   * Limpa todas as pilhas do workspace
   */
  clear() {
    const stacks = this.container.querySelectorAll('.blockStack')
    stacks.forEach(stack => stack.remove())

    const containers = this.container.querySelectorAll('.blockContainer')
    containers.forEach(container => container.remove())

    this.panX = 0
    this.panY = 0
    this.updatePanPosition()
    this.centerPlaceholder()

    this.dispatchBlockCountChanged()
  }

  /**
   * Verifica se há blocos e centraliza placeholder se não houver
   */
  checkBlocks() {
    const blockCount = this.getBlockCount()
    if (blockCount === 0) {
      this.centerPlaceholder()
    }
  }

  /**
   * Centraliza o placeholder no centro da tela
   */
  centerPlaceholder() {
    this.panX = 0
    this.panY = 0
    this.updatePanPosition()

    const placeholder = this.container.querySelector('.workspacePlaceholder')
    if (placeholder) {
      placeholder.style.display = ''
    }
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