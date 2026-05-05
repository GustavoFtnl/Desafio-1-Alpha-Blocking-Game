/**
 * DragDrop.js - Gerencia eventos drag-and-drop nativos
 * Comentários em português do Brasil
 */

export class DragDrop {
  constructor(paletteElement, workspaceElement) {
    this.palette = paletteElement
    this.workspace = workspaceElement
    this.snapTolerance = 50
    this.draggedBlock = null
    this.isFromPalette = false
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
      e.dataTransfer.dropEffect = 'move'
      this.workspace.classList.add('dragover')
    })

    this.workspace.addEventListener('dragleave', (e) => {
      if (!this.workspace.contains(e.relatedTarget)) {
        this.workspace.classList.remove('dragover')
      }
    })

    this.workspace.addEventListener('drop', (e) => {
      e.preventDefault()
      this.workspace.classList.remove('dragover')
      
      if (!this.draggedBlock && !this.isFromPalette) {
        const blockType = e.dataTransfer.getData('text/plain')
        if (!blockType) return
      }
      
      const placeholder = this.workspace.querySelector('.workspacePlaceholder')
      if (placeholder) {
        placeholder.style.display = 'none'
      }
      
      let blockToInsert
      
      if (this.isFromPalette) {
        blockToInsert = this.cloneBlock(this.draggedBlock)
      } else {
        blockToInsert = this.draggedBlock
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
      e.dataTransfer.effectAllowed = 'move'
      block.classList.add('dragging')
      block.setAttribute('aria-grabbed', 'true')
    })

    this.workspace.addEventListener('dragend', (e) => {
      const block = e.target.closest('.block')
      if (!block) return
      block.classList.remove('dragging')
      block.setAttribute('aria-grabbed', 'false')
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

  snapBlockToWorkspace(block, clientX, clientY) {
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
      const afterBlock = this.findInsertionPoint(nearestStack, clientY)
      if (afterBlock) {
        afterBlock.insertAdjacentElement('afterend', block)
      } else {
        nearestStack.appendChild(block)
      }
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

  findInsertionPoint(stack, clientY) {
    const blocks = stack.querySelectorAll('.block')
    for (let i = 0; i < blocks.length; i++) {
      const rect = blocks[i].getBoundingClientRect()
      const blockCenterY = rect.top + rect.height / 2
      if (clientY < blockCenterY) {
        return blocks[i].previousElementSibling
      }
    }
    return null
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
