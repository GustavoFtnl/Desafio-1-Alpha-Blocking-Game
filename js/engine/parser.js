/**
 * parser.js - Lê a árvore DOM no workspace e converte em array de instruções JS
 * Suporta blocos aninhados (repeat, conditional)
 * Mapeia classes CSS para comandos executáveis
 */

export class Parser {
  constructor() {
    this.workspace = document.querySelector('.workspaceArea')
  }

  /**
   * Parseia o workspace e retorna array de instruções
   * @returns {Array} Array de instruções para o runner
   */
  parse() {
    const instructions = []
    const processedBlocks = new Set()
    
    // Primeiro, processa blocos em blockContainers (com filhos)
    const blockContainers = this.workspace.querySelectorAll('.blockContainer')
    blockContainers.forEach(container => {
      const mainBlock = container.querySelector(':scope > .block:not(.block--direction)')
      if (!mainBlock || processedBlocks.has(mainBlock)) return
      
      processedBlocks.add(mainBlock)
      const instruction = this.parseBlock(mainBlock)
      if (!instruction) return
      
      // Verifica blocos de direção para Move
      const blockSlot = container.querySelector(':scope > .blockSlot')
      if (blockSlot) {
        const directionBlocks = blockSlot.querySelectorAll(':scope > .block--direction')
        if (directionBlocks.length > 0) {
          instruction.directions = Array.from(directionBlocks).map(dirBlock => this.getDirectionType(dirBlock))
        }
        
        // Verifica blocos filhos para Repeat/Se (corpo do loop/condição)
        if (mainBlock.classList.contains('block--repeat') || mainBlock.classList.contains('block--conditional')) {
          const childBlocks = blockSlot.querySelectorAll(':scope > .block:not(.block--direction)')
          instruction.body = Array.from(childBlocks).map(child => this.parseBlock(child)).filter(Boolean)
        }
      }
      
      instructions.push(instruction)
    })
    
    // Depois, processa blocos em blockStacks (sem filhos)
    const blockStacks = this.workspace.querySelectorAll('.blockStack')
    blockStacks.forEach(stack => {
      const blocks = stack.querySelectorAll(':scope > .block:not(.block--direction)')
      blocks.forEach(block => {
        if (processedBlocks.has(block)) return
        const instruction = this.parseBlock(block)
        if (instruction) {
          instructions.push(instruction)
        }
      })
    })
    
    return instructions
  }

  /**
   * Parseia um bloco individual retornando a instrução correspondente
   * @param {HTMLElement} block - Elemento do bloco
   * @returns {Object|null} Instrução parseada
   */
  parseBlock(block) {
    if (block.classList.contains('block--repeat')) {
      const blockText = block.querySelector('.block_text')
      const textContent = blockText ? blockText.textContent : ''
      let repeatCount = 2
      const match = textContent.match(/\((\d+)x\)/)
      if (match) {
        repeatCount = parseInt(match[1])
      }
      return {
        type: 'repeat',
        count: repeatCount,
        body: [],
        blockElement: block
      }
    }
    
    if (block.classList.contains('block--conditional')) {
      return {
        type: 'if',
        condition: 'default',
        body: [],
        blockElement: block
      }
    }
    
    const instruction = {
      type: this.getBlockType(block),
      blockElement: block,
      directions: []
    }
    
    return instruction
  }

  /**
   * Parseia um bloco de repetição e seu corpo aninhado
   * @param {HTMLElement} repeatBlock - Bloco de repetição
   * @param {HTMLElement} stack - Pilha contendo o bloco
   * @returns {Object|null} Instrução de repetição com corpo
   */
  parseRepeatBlock(repeatBlock, stack) {
    const blockText = repeatBlock.querySelector('.block_text')
    const textContent = blockText ? blockText.textContent : ''
    
    // Extrai o número de repetições (formato: "Repetir (Nx)")
    let repeatCount = 2 // Padrão
    const match = textContent.match(/\((\d+)x\)/)
    if (match) {
      repeatCount = parseInt(match[1])
    }
    
    // Coleta blocos no corpo (próximos blocos na pilha até outro controle)
    const body = this.getBlockBody(repeatBlock, stack)
    
    return {
      type: 'repeat',
      count: repeatCount,
      body: body,
      blockElement: repeatBlock
    }
  }

  /**
   * Parseia um bloco condicional e seu corpo aninhado
   * @param {HTMLElement} conditionalBlock - Bloco condicional
   * @param {HTMLElement} stack - Pilha contendo o bloco
   * @returns {Object|null} Instrução condicional com corpo
   */
  parseConditionalBlock(conditionalBlock, stack) {
    // Coleta blocos no corpo (próximos blocos na pilha)
    const body = this.getBlockBody(conditionalBlock, stack)
    
    return {
      type: 'if',
      condition: 'default', // Simplificado para MVP
      body: body,
      blockElement: conditionalBlock
    }
  }

  /**
   * Obtém o corpo de um bloco aninhado (blocos seguintes até próximo controle)
   * @param {HTMLElement} controlBlock - Bloco de controle (repeat/conditional)
   * @param {HTMLElement} stack - Pilha contendo o bloco
   * @returns {Array} Array de instruções do corpo
   */
  getBlockBody(controlBlock, stack) {
    const body = []
    let currentElement = controlBlock.nextElementSibling
    
    while (currentElement) {
      // Para se encontrar outro bloco de controle
      if (currentElement.classList && 
          (currentElement.classList.contains('block--repeat') || 
           currentElement.classList.contains('block--conditional'))) {
        break
      }
      
      // Adiciona bloco simples ao corpo
      if (currentElement.classList && currentElement.classList.contains('block')) {
        const instruction = this.parseBlock(currentElement)
        if (instruction) {
          body.push(instruction)
        }
      }
      
      currentElement = currentElement.nextElementSibling
    }
    
    return body
  }

  /**
   * Extrai o tipo de bloco baseado nas classes CSS
   * @param {HTMLElement} block - Elemento do bloco
   * @returns {string} Tipo do bloco para execução
   */
  getBlockType(block) {
    if (block.classList.contains('block--move')) {
      return 'move'
    } else if (block.classList.contains('block--rotate')) {
      return 'turnRight'
    } else if (block.classList.contains('block--repeat')) {
      return 'repeat'
    } else if (block.classList.contains('block--conditional')) {
      return 'if'
    } else if (block.classList.contains('block--action')) {
      return 'action'
    } else if (block.classList.contains('block--control')) {
      return 'stop'
    }
    
    return 'unknown'
  }

  /**
   * Conta o número total de blocos no workspace (para cálculo de estrelas)
   * @returns {number} Total de blocos
   */
  countBlocks() {
    return this.workspace.querySelectorAll('.block').length
  }
}
