/**
 * DragDrop.js - Gerencia eventos drag-and-drop nativos do HTML5
 * Suporta: Paleta → Workspace e Workspace → Workspace (reorganização)
 * Implementa snap visual (blocos se alinham em pilhas)
 */

export class DragDrop {
  constructor() {
    // Elementos do DOM
    this.palette = document.querySelector('.blockPalette')
    this.workspace = document.querySelector('.workspaceArea')
    this.blockCounter = document.querySelector('.blockCounter')
    
    // Tolerância para snap (distância máxima para encaixe)
    this.snapTolerance = 50
    
    // Armazena dados do bloco sendo arrastado
    this.draggedBlock = null
    this.isFromPalette = false
    
    this.init()
  }

  /**
   * Inicializa os event listeners para drag-and-drop
   */
  init() {
    this.setupPaletteListeners()
    this.setupWorkspaceListeners()
  }

  /**
   * Configura listeners da paleta de blocos (origem)
   */
  setupPaletteListeners() {
    // Usa event delegation para blocos na paleta
    this.palette.addEventListener('dragstart', (e) => {
      const block = e.target.closest('.block')
      if (!block) return
      
      this.draggedBlock = block
      this.isFromPalette = true
      
      // Define dados para transferência
      const blockType = this.getBlockType(block)
      e.dataTransfer.setData('text/plain', blockType)
      e.dataTransfer.effectAllowed = 'copy'
      
      // Aplica classe visual de arrasto
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

  /**
   * Configura listeners do workspace (destino e reorganização)
   */
  setupWorkspaceListeners() {
    // Dragover: permite soltar e aplica feedback visual
    this.workspace.addEventListener('dragover', (e) => {
      e.preventDefault()
      e.dataTransfer.dropEffect = 'move'
      
      this.workspace.classList.add('dragover')
    })
    
    // Dragleave: remove feedback visual
    this.workspace.addEventListener('dragleave', (e) => {
      // Só remove se saiu do workspace (não entrou em um filho)
      if (!this.workspace.contains(e.relatedTarget)) {
        this.workspace.classList.remove('dragover')
      }
    })
    
    // Drop: processa o bloco solto
    this.workspace.addEventListener('drop', (e) => {
      e.preventDefault()
      this.workspace.classList.remove('dragover')
      
      if (!this.draggedBlock && !this.isFromPalette) {
        // Tenta recuperar da transferência (caso seja de outra origem)
        const blockType = e.dataTransfer.getData('text/plain')
        if (!blockType) return
      }
      
      // Oculta placeholder se existir
      const placeholder = this.workspace.querySelector('.workspacePlaceholder')
      if (placeholder) {
        placeholder.style.display = 'none'
      }
      
      let blockToInsert
      
      if (this.isFromPalette) {
        // Clona o bloco da paleta
        blockToInsert = this.cloneBlock(this.draggedBlock)
      } else {
        // Bloco já existe (reorganização no workspace)
        blockToInsert = this.draggedBlock
      }
      
      // Encontra posição de snap e insere o bloco
      this.snapBlockToWorkspace(blockToInsert, e.clientX, e.clientY)
      
      // Atualiza contador de blocos
      this.updateBlockCounter()
    })
    
    // Reorganização: dragstart em blocos do workspace
    this.workspace.addEventListener('dragstart', (e) => {
      const block = e.target.closest('.block')
      if (!block) return
      
      // Evita capturar eventos da paleta
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

  /**
   * Clona um bloco da paleta preservando classes e conteúdo
   * @param {HTMLElement} originalBlock - Bloco original da paleta
   * @returns {HTMLElement} Clone do bloco
   */
  cloneBlock(originalBlock) {
    const clone = originalBlock.cloneNode(true)
    
    // Remove estado de arrasto se houver
    clone.classList.remove('dragging')
    clone.setAttribute('aria-grabbed', 'false')
    
    // Torna o clone arrastável
    clone.setAttribute('draggable', 'true')
    
    return clone
  }

  /**
   * Encontra o bloco mais próximo na posição do drop e insere com snap
   * @param {HTMLElement} block - Bloco a ser inserido
   * @param {number} clientX - Posição X do mouse
   * @param {number} clientY - Posição Y do mouse
   */
  snapBlockToWorkspace(block, clientX, clientY) {
    const existingStacks = this.workspace.querySelectorAll('.blockStack')
    
    let nearestStack = null
    let nearestDistance = Infinity
    
    // Procura pela pilha mais próxima
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
      // Encontra posição de inserção baseada na posição Y do mouse
      const afterBlock = this.findInsertionPoint(nearestStack, clientY)
      
      if (afterBlock) {
        afterBlock.insertAdjacentElement('afterend', block)
      } else {
        nearestStack.appendChild(block)
      }
    } else {
      // Cria nova pilha
      const newStack = document.createElement('div')
      newStack.className = 'blockStack'
      newStack.appendChild(block)
      this.workspace.appendChild(newStack)
    }
    
    // Aplica animação de snap
    block.classList.add('snapping')
    setTimeout(() => {
      block.classList.remove('snapping')
    }, 200)
  }

  /**
   * Encontra o ponto de inserção correto na pilha baseado na posição Y
   * @param {HTMLElement} stack - Pilha de blocos
   * @param {number} clientY - Posição Y do mouse
   * @returns {HTMLElement|null} Bloco após o qual inserir, ou null para inserir no final
   */
  findInsertionPoint(stack, clientY) {
    const blocks = stack.querySelectorAll('.block')
    
    for (let i = 0; i < blocks.length; i++) {
      const rect = blocks[i].getBoundingClientRect()
      const blockCenterY = rect.top + rect.height / 2
      
      if (clientY < blockCenterY) {
        return blocks[i].previousElementSibling
      }
    }
    
    return null // Inserir no final
  }

  /**
   * Extrai o tipo do bloco baseado nas classes CSS
   * @param {HTMLElement} block - Elemento do bloco
   * @returns {string} Tipo do bloco (ex: 'block--move')
   */
  getBlockType(block) {
    const classes = block.className.split(' ')
    
    for (const cls of classes) {
      if (cls.startsWith('block--')) {
        return cls
      }
    }
    
    return 'block--move' // Fallback
  }

  /**
   * Atualiza o contador de blocos na UI
   */
  updateBlockCounter() {
    const totalBlocks = this.workspace.querySelectorAll('.block').length
    
    if (this.blockCounter) {
      // Extrai o limite atual do texto (formato: "Blocos: X/Y")
      const currentText = this.blockCounter.textContent
      const match = currentText.match(/\/(\d+)/)
      const maxBlocks = match ? parseInt(match[1]) : '?'
      
      this.blockCounter.innerHTML = `<span>Blocos: ${totalBlocks}/${maxBlocks}</span>`
      
      // Aplica classes de aviso baseado no limite
      this.blockCounter.classList.remove('warning', 'danger')
      
      if (maxBlocks !== '?' && totalBlocks > maxBlocks) {
        this.blockCounter.classList.add('danger')
      } else if (maxBlocks !== '?' && totalBlocks === maxBlocks) {
        this.blockCounter.classList.add('warning')
      }
    }
  }

  /**
   * Limpa todos os blocos do workspace
   */
  clearWorkspace() {
    const stacks = this.workspace.querySelectorAll('.blockStack')
    stacks.forEach(stack => stack.remove())
    
    // Mostra placeholder novamente
    const placeholder = this.workspace.querySelector('.workspacePlaceholder')
    if (placeholder) {
      placeholder.style.display = ''
    }
    
    this.updateBlockCounter()
  }
}
