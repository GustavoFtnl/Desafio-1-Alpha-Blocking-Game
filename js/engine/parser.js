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
    const stacks = this.workspace.querySelectorAll('.blockStack')
    
    stacks.forEach(stack => {
      const blocks = stack.querySelectorAll('.block:not(.block--repeat):not(.block--conditional)')
      const repeatBlocks = stack.querySelectorAll('.block--repeat')
      const conditionalBlocks = stack.querySelectorAll('.block--conditional')
      
      // Processa blocos simples primeiro
      blocks.forEach(block => {
        const instruction = this.parseBlock(block)
        if (instruction) {
          instructions.push(instruction)
        }
      })
      
      // Processa blocos de repetição (estrutura aninhada)
      repeatBlocks.forEach(block => {
        const instruction = this.parseRepeatBlock(block, stack)
        if (instruction) {
          instructions.push(instruction)
        }
      })
      
      // Processa blocos condicionais (estrutura aninhada)
      conditionalBlocks.forEach(block => {
        const instruction = this.parseConditionalBlock(block, stack)
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
    if (block.classList.contains('block--repeat') || 
        block.classList.contains('block--conditional')) {
      return null // Estes são processados separadamente
    }
    
    const instruction = {
      type: this.getBlockType(block),
      blockElement: block
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
    } else if (block.classList.contains('block--action')) {
      return 'action'
    } else if (block.classList.contains('block--control')) {
      return 'control'
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
