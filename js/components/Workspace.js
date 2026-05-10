/**
 * Workspace.js - Componente da área de montagem de blocos
 * Gerencia pilhas de blocos e zona de drop
 * Comentários em português do Brasil conforme AGENTS.md
 */

import { Block } from "./Block.js";
import { domHelpers } from "../utils/domHelpers.js";

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
      <div class="trashZone" aria-label="Lixeira" role="button" tabindex="0">
        <span class="material-symbols-outlined trashZoneIcon">delete</span>
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

    const workspaceContent = this.container.querySelector('.workspaceContent')
    if (workspaceContent) {
      const absoluteBlocks = workspaceContent.querySelectorAll('.block[style*="position: absolute"]')
      absoluteBlocks.forEach(block => block.remove())
      
      const absoluteContainers = workspaceContent.querySelectorAll('.blockContainer[style*="position: absolute"]')
      absoluteContainers.forEach(container => container.remove())
    }

    this.panX = 0
    this.panY = 0
    this.updatePanPosition()
    this.centerPlaceholder()

    domHelpers.dispatchBlockCountChanged(this.container);
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
    * Retorna a quantidade total de blocos no workspace (desconsiderando inicio)
    * @returns {number} Total de blocos
    */
  getBlockCount() {
    return domHelpers.getBlockCountWithoutStart(this.container)
  }

  /**
   * Exporta os blocos do workspace como JSON para persistência
   * @returns {Array} Array de objetos representando os blocos
   */
  exportBlocks() {
    const blocksData = []
    const stacks = this.container.querySelectorAll('.blockStack')

    stacks.forEach(stack => {
      const stackData = this.serializeStack(stack)
      if (stackData.length > 0) {
        blocksData.push(stackData)
      }
    })

    return blocksData
  }

  /**
   * Serializa uma pilha de blocos
   * @param {HTMLElement} stack - Elemento .blockStack
   * @returns {Array} Array de dados dos blocos
   */
  serializeStack(stack) {
    const blocksData = []
    const children = stack.children

    for (let i = 0; i < children.length; i++) {
      const child = children[i]
      if (child.classList.contains('blockContainer')) {
        const blockData = this.serializeBlockContainer(child)
        if (blockData) {
          blocksData.push(blockData)
        }
      } else if (child.classList.contains('block')) {
        const blockData = this.serializeBlock(child)
        if (blockData) {
          blocksData.push(blockData)
        }
      }
    }

    return blocksData
  }

  /**
   * Serializa um container de bloco (bloco com filhos)
   * @param {HTMLElement} container - Elemento .blockContainer
   * @returns {Object} Dados do bloco e seus filhos
   */
  serializeBlockContainer(container) {
    const block = container.querySelector(':scope > .block')
    if (!block) return null

    const type = Block.getType(block)
    if (!type) return null

    const blockData = {
      type: type,
      repeatCount: 1
    }

    if (type === 'block--repeat') {
      const input = block.querySelector('.blockRepeatInput')
      if (input && input.value) {
        blockData.repeatCount = parseInt(input.value, 10) || 1
      }
    }

    const slot = container.querySelector('.blockSlot')
    if (slot) {
      const children = slot.children
      for (let i = 0; i < children.length; i++) {
        const child = children[i]
        if (child.classList.contains('blockContainer')) {
          const childData = this.serializeBlockContainer(child)
          if (childData) {
            if (!blockData.children) blockData.children = []
            blockData.children.push(childData)
          }
        } else if (child.classList.contains('block')) {
          const childData = this.serializeBlock(child)
          if (childData) {
            if (!blockData.children) blockData.children = []
            blockData.children.push(childData)
          }
        }
      }
    }

    return blockData
  }

  /**
   * Serializa um bloco sem filhos
   * @param {HTMLElement} block - Elemento .block
   * @returns {Object} Dados do bloco
   */
  serializeBlock(block) {
    const type = Block.getType(block)
    if (!type) return null

    return { type: type }
  }

  /**
   * Importa blocos do workspace a partir de dados serializados
   * @param {Array} blocksData - Array de dados dos blocos
   */
  importBlocks(blocksData) {
    if (!blocksData || !Array.isArray(blocksData) || blocksData.length === 0) {
      return
    }

    const workspaceContent = this.container.querySelector('.workspaceContent')
    if (!workspaceContent) return

    blocksData.forEach(stackData => {
      const stack = document.createElement('div')
      stack.className = 'blockStack'

      stackData.forEach(blockData => {
        const blockElement = this.createBlockFromData(blockData)
        if (blockElement) {
          stack.appendChild(blockElement)
        }
      })

      if (stack.children.length > 0) {
        workspaceContent.appendChild(stack)
      }
    })

    domHelpers.updatePlaceholder(this.container);
    domHelpers.dispatchBlockCountChanged(this.container);
  }

  /**
   * Cria um elemento de bloco a partir de dados serializados
   * @param {Object} blockData - Dados do bloco
   * @returns {HTMLElement} Elemento do bloco
   */
  createBlockFromData(blockData) {
    const configs = Block.getConfigs()
    const config = configs.find(c => c.type === blockData.type)
    if (!config) return null

    let blockElement = null

    if (blockData.children && blockData.children.length > 0) {
      blockElement = this.createBlockWithChildren(blockData, config)
    } else {
      blockElement = Block.createElement(config.text, config.icon, config.type)
    }

    if (blockData.type === 'block--repeat' && blockData.repeatCount) {
      const input = blockElement.querySelector('.blockRepeatInput')
      if (input) {
        input.value = blockData.repeatCount
      }
    }

    return blockElement
  }

  /**
   * Cria um bloco com filhos (container)
   * @param {Object} blockData - Dados do bloco
   * @param {Object} config - Configuração do bloco
   * @returns {HTMLElement} Container do bloco
   */
  createBlockWithChildren(blockData, config) {
    const container = document.createElement('div')
    container.className = 'blockContainer'

    const typeName = blockData.type.replace('block--', '')
    container.setAttribute('data-type', typeName)

    const blockElement = Block.createElement(config.text, config.icon, blockData.type)
    container.appendChild(blockElement)

    const slot = document.createElement('div')
    slot.className = 'blockSlot'

    if (blockData.children) {
      blockData.children.forEach(childData => {
        const childElement = this.createBlockFromData(childData)
        if (childElement) {
          if (childData.children && childData.children.length > 0) {
            const childContainer = document.createElement('div')
            childContainer.className = 'blockContainer'

            const childTypeName = childData.type.replace('block--', '')
            childContainer.setAttribute('data-type', childTypeName)

            const childBlockElement = this.createBlockFromData(childData)
            if (childBlockElement) {
              childContainer.appendChild(childBlockElement)

              const childSlot = document.createElement('div')
              childSlot.className = 'blockSlot'
              childContainer.appendChild(childSlot)

              slot.appendChild(childContainer)
            }
          } else {
            slot.appendChild(childElement)
          }
        }
      })
    }

    container.appendChild(slot)
    return container
  }
}