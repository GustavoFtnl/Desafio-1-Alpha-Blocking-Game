/**
 * DragDrop.js - Gerencia eventos drag-and-drop nativos
 * Comentários em português do Brasil
 */

export class DragDrop {
  static blockConfigs = [
    { type: 'block--move', icon: '↕', text: 'Mover' },
    { type: 'block--direction', icon: '→', text: 'Direita' },
    { type: 'block--direction', icon: '←', text: 'Esquerda' },
    { type: 'block--direction', icon: '↑', text: 'Cima' },
    { type: 'block--direction', icon: '↓', text: 'Baixo' },
    { type: 'block--repeat', icon: '⟳', text: 'Repetir' },
    { type: 'block--conditional', icon: '?', text: 'Se' },
    { type: 'block--action', icon: '!', text: 'Ação' }
  ]

  constructor(paletteElement, workspaceElement) {
    this.palette = paletteElement
    this.workspace = workspaceElement
    this.snapTolerance = 50
    this.draggedBlock = null
    this.isFromPalette = false
    this.sourceBlockSlot = null
    this.init()
  }

  init() {
    this.setupPaletteListeners()
    this.setupWorkspaceListeners()
  }

  setupPaletteListeners() {
    this.palette.addEventListener('dragstart', (e) => {
      const block = e.target.closest('.block')
      if (!block) return
      this.draggedBlock = block
      this.isFromPalette = true
      const blockType = this.getBlockType(block)
      e.dataTransfer.setData('text/plain', blockType)
      e.dataTransfer.effectAllowed = 'copy'
      block.classList.add('dragging')
      block.setAttribute('aria-grabbed', 'true')
    })

    this.palette.addEventListener('dragend', (e) => {
      const block = e.target.closest('.block')
      if (!block) return
      block.classList.remove('dragging')
      block.setAttribute('aria-grabbed', 'false')
      this.draggedBlock = null
      this.isFromPalette = false
    })
  }

  setupWorkspaceListeners() {
    this.workspace.addEventListener('dragover', (e) => {
      e.preventDefault()
      e.dataTransfer.dropEffect = this.isFromPalette ? 'copy' : 'move'
      this.workspace.classList.add('dragover')
      
      // Verifica se está sobre um blockSlot
      const blockSlot = e.target.closest('.blockSlot')
      if (blockSlot) {
        blockSlot.classList.add('dragover')
      }
    })

    this.workspace.addEventListener('dragleave', (e) => {
      if (!this.workspace.contains(e.relatedTarget)) {
        this.workspace.classList.remove('dragover')
      }
      
      const blockSlot = e.target.closest('.blockSlot')
      if (blockSlot && !blockSlot.contains(e.relatedTarget)) {
        blockSlot.classList.remove('dragover')
      }
    })

    this.workspace.addEventListener('drop', (e) => {
      e.preventDefault()
      this.workspace.classList.remove('dragover')

      const blockType = e.dataTransfer.getData('text/plain')
      let blockToInsert = null

      if (this.isFromPalette) {
        if (this.draggedBlock) {
          blockToInsert = this.cloneBlock(this.draggedBlock)
        } else if (blockType) {
          blockToInsert = this.createBlock(blockType)
        }
      } else {
        blockToInsert = this.draggedBlock
      }

      if (!blockToInsert) {
        console.error('Nenhum bloco válido para inserir')
        return
      }

      const placeholder = this.workspace.querySelector('.workspacePlaceholder')
      if (placeholder) {
        placeholder.style.display = 'none'
      }

      this.snapBlockToWorkspace(blockToInsert, e.clientX, e.clientY)
      this.dispatchBlockCountChanged()
    })

    this.workspace.addEventListener('dragstart', (e) => {
      const block = e.target.closest('.block')
      if (!block) return
      if (this.palette.contains(block)) return
      this.draggedBlock = block
      this.isFromPalette = false
      this.sourceBlockSlot = block.closest('.blockSlot')
      e.dataTransfer.effectAllowed = 'move'
      block.classList.add('dragging')
      block.setAttribute('aria-grabbed', 'true')
    })

    this.workspace.addEventListener('dragend', (e) => {
      const block = e.target.closest('.block')
      if (!block) return
      
      block.classList.remove('dragging')
      block.setAttribute('aria-grabbed', 'false')
      
      // Limpa blockContainer vazio se o bloco veio de um blockSlot
      if (this.sourceBlockSlot && this.sourceBlockSlot.parentElement) {
        if (this.sourceBlockSlot.children.length === 0) {
          const blockContainer = this.sourceBlockSlot.closest('.blockContainer')
          if (blockContainer) {
            const mainBlock = blockContainer.querySelector(':scope > .block')
            if (mainBlock) {
              mainBlock.classList.remove('hasChildren')
              // Coloca o bloco principal de volta no stack
              blockContainer.parentElement.insertBefore(mainBlock, blockContainer)
              blockContainer.remove()
            }
          }
        }
      }
      this.sourceBlockSlot = null
      
      // Verifica se o drop foi fora do workspace (para esquerda ou direita)
      if (this.draggedBlock) {
        const workspaceRect = this.workspace.getBoundingClientRect()
        const isOutsideWorkspace = e.clientX < workspaceRect.left || 
                                   e.clientX > workspaceRect.right || 
                                   e.clientY < workspaceRect.top || 
                                   e.clientY > workspaceRect.bottom
        
        if (isOutsideWorkspace) {
          // Remove o bloco do workspace
          const stack = this.draggedBlock.closest('.blockStack')
          // Se estava em um blockSlot, limpa a estrutura
          const blockSlot = this.draggedBlock.closest('.blockSlot')
          if (blockSlot) {
            const blockContainer = blockSlot.closest('.blockContainer')
            if (blockContainer) {
              const mainBlock = blockContainer.querySelector(':scope > .block')
              if (mainBlock) {
                mainBlock.classList.remove('hasChildren')
                blockContainer.parentElement.insertBefore(mainBlock, blockContainer)
                blockContainer.remove()
              }
            }
          } else {
            this.draggedBlock.remove()
            // Se a pilha ficou vazia, remove ela também
            if (stack && stack.children.length === 0) {
              stack.remove()
            }
          }
          
          // Atualiza visibilidade do placeholder
          const placeholder = this.workspace.querySelector('.workspacePlaceholder')
          if (placeholder) {
            const hasBlocks = this.workspace.querySelectorAll('.block').length > 0
            placeholder.style.display = hasBlocks ? 'none' : ''
          }
          
          this.dispatchBlockCountChanged()
        }
      }
      
      this.draggedBlock = null
    })
  }

  cloneBlock(originalBlock) {
    const clone = originalBlock.cloneNode(true)
    clone.classList.remove('dragging')
    clone.setAttribute('aria-grabbed', 'false')
    clone.setAttribute('draggable', 'true')
    return clone
  }

  createBlock(type) {
    const config = DragDrop.blockConfigs.find(c => c.type === type)
    if (!config) return null

    const block = document.createElement('div')
    block.className = 'block ' + config.type
    block.setAttribute('draggable', 'true')
    block.setAttribute('aria-label', 'Bloco de comando: ' + config.text)
    block.setAttribute('aria-grabbed', 'false')
    block.innerHTML = '<span class="block_icon">' + config.icon + '</span><span class="block_text">' + config.text + '</span>'
    return block
  }

  snapBlockToWorkspace(block, clientX, clientY) {
    const isDirectionBlock = block.classList.contains('block--direction')
    
    if (isDirectionBlock) {
      // Blocos de direção: tenta encaixar à direita de um bloco que aceite filhos (mover, repetir, se, ação)
      const targetBlock = this.findNearestBlockWithSlot(clientX, clientY)
      
      if (targetBlock) {
        this.attachDirectionToBlock(block, targetBlock)
        this.dispatchBlockCountChanged()
        return
      }
      
      console.warn('Blocos de direção devem ser anexados à direita de um bloco Mover, Repetir, Se ou Ação')
      return
    }
    
    // Blocos normais: comportamento padrão (empilhar verticalmente na workspace)
    const existingStacks = this.workspace.querySelectorAll('.blockStack')
    let nearestStack = null
    let nearestDistance = Infinity

    existingStacks.forEach(stack => {
      const rect = stack.getBoundingClientRect()
      const stackCenterX = rect.left + rect.width / 2
      const stackCenterY = rect.top + rect.height / 2
      
      const distance = Math.sqrt(
        Math.pow(clientX - stackCenterX, 2) + 
        Math.pow(clientY - stackCenterY, 2)
      )
      
      if (distance < nearestDistance && distance < this.snapTolerance) {
        nearestDistance = distance
        nearestStack = stack
      }
    })

    if (nearestStack) {
      nearestStack.appendChild(block)
    } else {
      const newStack = document.createElement('div')
      newStack.className = 'blockStack'
      newStack.appendChild(block)
      this.workspace.appendChild(newStack)
    }

    block.classList.add('snapping')
    setTimeout(() => {
      block.classList.remove('snapping')
    }, 200)
  }
  
  findNearestBlockWithSlot(clientX, clientY) {
    // Procura blocos que podem receber filhos (move, repeat, conditional, action)
    const targetBlocks = this.workspace.querySelectorAll('.block--move, .block--repeat, .block--conditional, .block--action')
    let nearest = null
    let nearestDistance = Infinity
    
    targetBlocks.forEach(targetBlock => {
      const rect = targetBlock.getBoundingClientRect()
      const blockCenterX = rect.left + rect.width / 2
      const blockCenterY = rect.top + rect.height / 2
      
      const distance = Math.sqrt(
        Math.pow(clientX - blockCenterX, 2) + 
        Math.pow(clientY - blockCenterY, 2)
      )
      
      if (distance < nearestDistance && distance < this.snapTolerance) {
        nearestDistance = distance
        nearest = targetBlock
      }
    })
    
    return nearest
  }
  
  attachDirectionToBlock(directionBlock, targetBlock) {
    let blockContainer = targetBlock.closest('.blockContainer')
    
    if (!blockContainer) {
      blockContainer = document.createElement('div')
      blockContainer.className = 'blockContainer'
      targetBlock.parentElement.insertBefore(blockContainer, targetBlock)
      blockContainer.appendChild(targetBlock)
    }
    
    let blockSlot = blockContainer.querySelector('.blockSlot')
    if (!blockSlot) {
      blockSlot = document.createElement('div')
      blockSlot.className = 'blockSlot'
      blockContainer.appendChild(blockSlot)
    }
    
    blockSlot.appendChild(directionBlock)
    targetBlock.classList.add('hasChildren')
    
    directionBlock.classList.add('snapping')
    setTimeout(() => {
      directionBlock.classList.remove('snapping')
    }, 200)
  }

  getBlockType(block) {
    const classes = block.className.split(' ')
    for (const cls of classes) {
      if (cls.startsWith('block--')) {
        return cls
      }
    }
    return 'block--move'
  }

  dispatchBlockCountChanged() {
    const event = new CustomEvent('blockCountChanged', {
      bubbles: true,
      detail: {
        count: this.workspace.querySelectorAll('.block').length
      }
    })
    this.workspace.dispatchEvent(event)
  }

  clearWorkspace() {
    const stacks = this.workspace.querySelectorAll('.blockStack')
    stacks.forEach(stack => stack.remove())
    const placeholder = this.workspace.querySelector('.workspacePlaceholder')
    if (placeholder) {
      placeholder.style.display = ''
    }
    this.dispatchBlockCountChanged()
  }
}
