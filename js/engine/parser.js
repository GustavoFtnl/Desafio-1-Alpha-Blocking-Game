/**
 * parser.js - Lê a árvore DOM no workspace e converte em array de instruções planas
 * Traduz "Mover + Direction" → moveUp/Down/Left/Right
 * Traduz "Mover sem Direction" → forward
 * Expande Repeat Nx em repeat com contagem e corpo de instruções
 * Comentários em português do Brasil conforme AGENTS.md
 */

export class Parser {
  constructor() {
    this.workspace = document.querySelector(".workspaceArea");
  }

  /**
   * Parseia o workspace e retorna array de instruções planas
   * @returns {Array} Array de instruções para o runner
   */
  parse() {
    const instructions = []
    const processedElements = new Set()

    // Primeiro, procura o bloco Início como raiz
    const startContainer = this.workspace.querySelector(".blockContainer[data-type='start']")
    
    if (startContainer) {
      // Processa filhos diretos do Início
      const slot = startContainer.querySelector(".blockSlot")
      if (slot) {
        Array.from(slot.children).forEach(element => {
          if (processedElements.has(element)) return
          processedElements.add(element)

          const parsed = this.parseElement(element)
          if (parsed) {
            if (Array.isArray(parsed)) {
              instructions.push(...parsed)
            } else {
              instructions.push(parsed)
            }
          }
        })
      }
      
      return instructions
    }

    // Fallback: comportamento original se não houver bloco Início
    // Primeiro, pega blocos dentro de .blockStack
    const blockStacks = this.workspace.querySelectorAll(".blockStack")

    blockStacks.forEach(stack => {
      const directChildren = stack.children

      Array.from(directChildren).forEach(element => {
        if (processedElements.has(element)) return
        processedElements.add(element)

        const parsed = this.parseElement(element)
        if (parsed) {
          if (Array.isArray(parsed)) {
            instructions.push(...parsed)
          } else {
            instructions.push(parsed)
          }
        }
      })
    })

    // Depois, verifica blocos diretos no workspaceContent (sem stack)
    const workspaceContent = this.workspace.querySelector(".workspaceContent")
    if (workspaceContent) {
      Array.from(workspaceContent.children).forEach(element => {
        if (element.classList.contains("blockStack")) return
        if (processedElements.has(element)) return
        processedElements.add(element)

        const parsed = this.parseElement(element)
        if (parsed) {
          if (Array.isArray(parsed)) {
            instructions.push(...parsed)
          } else {
            instructions.push(parsed)
          }
        }
      })
    }

    return instructions
  }

  /**
   * Parseia um elemento (block ou blockContainer)
   * @param {HTMLElement} element - Elemento do workspace
   * @returns {Object|Array|null} Instrução ou array de instruções
   */
  parseElement(element) {
    if (element.classList.contains("blockContainer")) {
      return this.parseBlockContainer(element);
    }

    if (element.classList.contains("block")) {
      return this.parseBlock(element);
    }

    return null;
  }

  /**
   * Parseia um blockContainer (bloco com slot para filhos)
   * @param {HTMLElement} container - Elemento .blockContainer
   * @returns {Object|Array|null} Instrução ou null
   */
  parseBlockContainer(container) {
    const mainBlock = container.querySelector(":scope > .block");
    if (!mainBlock) return null;

    if (mainBlock.classList.contains("block--start")) {
      return this.parseStartBlock(mainBlock, container);
    }

    if (mainBlock.classList.contains("block--repeat")) {
      return this.parseRepeatBlock(mainBlock, container);
    }

    if (mainBlock.classList.contains("block--move")) {
      return this.parseMoveBlock(mainBlock, container);
    }

    if (mainBlock.classList.contains("block--jump")) {
      return this.parseJumpBlock(mainBlock, container);
    }

    return null;
  }

  parseStartBlock(block, container) {
    const slot = container.querySelector(".blockSlot");
    let childInstructions = [];

    if (slot) {
      const childElements = slot.querySelectorAll(":scope > .block, :scope > .blockContainer");
      childElements.forEach(element => {
        const parsed = this.parseElement(element);
        if (parsed) {
          if (Array.isArray(parsed)) {
            childInstructions.push(...parsed);
          } else {
            childInstructions.push(parsed);
          }
        }
      });
    }

    return {
      type: "start",
      body: childInstructions,
      blockElement: block
    };
  }

  /**
   * Parseia um bloco Mover com direção opcional
   * @param {HTMLElement} block - Bloco .block--move
   * @param {HTMLElement} container - Container do bloco
   * @returns {Object} Instrução: moveUp/Down/Left/Right ou forward
   */
  parseMoveBlock(block, container) {
    const slot = container.querySelector(".blockSlot");
    let directions = [];

    if (slot) {
      const directionBlocks = slot.querySelectorAll(".block--direction");
      directionBlocks.forEach(directionBlock => {
        const direction = this.getDirectionFromBlock(directionBlock);
        if (direction) {
          directions.push(direction);
        }
      });
    }

    if (directions.length > 0) {
      return directions.map(direction => ({
        type: direction,
        blockElement: block
      }));
    }

    return null;
  }

  /**
   * Parseia um bloco Pular com direção
   * @param {HTMLElement} block - Bloco .block--jump
   * @param {HTMLElement} container - Container do bloco
   * @returns {Object|Array|null} Instrução jumpUp/Down/Left/Right ou array de instruções
   */
  parseJumpBlock(block, container) {
    const slot = container.querySelector(".blockSlot");
    let directions = [];

    if (slot) {
      const directionBlocks = slot.querySelectorAll(".block--direction");
      directionBlocks.forEach(directionBlock => {
        const direction = this.getDirectionFromBlock(directionBlock);
        if (direction) {
          directions.push(direction);
        }
      });
    }

    if (directions.length > 0) {
      return directions.map(direction => {
        const jumpType = "jump" + direction.substring(4);
        return {
          type: jumpType,
          blockElement: block
        };
      });
    }

    return null;
  }

  /**
   * Extrai a direção de um bloco direction
   * @param {HTMLElement} directionBlock - Bloco .block--direction
   * @returns {string} Direction: up, down, left, right
   */
  getDirectionFromBlock(directionBlock) {
    const content = directionBlock.textContent.trim()

    if (content.includes("→") || content.includes("Direita")) {
      return "moveRight"
    } else if (content.includes("←") || content.includes("Esquerda")) {
      return "moveLeft"
    } else if (content.includes("↑") || content.includes("Cima")) {
      return "moveUp"
    } else if (content.includes("↓") || content.includes("Baixo")) {
      return "moveDown"
    }

    return "moveRight"
  }

  /**
   * Parseia um bloco Repeat com seu corpo
   * @param {HTMLElement} block - Bloco .block--repeat
   * @param {HTMLElement} container - Container do bloco
   * @returns {Object} Instrução repeat com corpo
   */
  parseRepeatBlock(block, container) {
    const inputElement = block.querySelector(".blockRepeatInput");
    let repeatCount = 1;

    if (inputElement && inputElement.value) {
      repeatCount = parseInt(inputElement.value, 10);
      if (isNaN(repeatCount) || repeatCount < 1) {
        repeatCount = 1;
      } else if (repeatCount > 10) {
        repeatCount = 10;
      }
    }

    if (inputElement && !inputElement.value) {
      inputElement.value = 1;
    }

    const bodyInstructions = this.parseRepeatBody(container);

    return {
      type: "repeat",
      count: repeatCount,
      body: bodyInstructions,
      blockElement: block
    };
  }

  /**
   * Parseia o corpo de um bloco Repeat (blocos dentro do slot)
   * @param {HTMLElement} container - Container do repeat
   * @returns {Array} Array de instruções do corpo
   */
  parseRepeatBody(container) {
    const body = [];
    const slot = container.querySelector(":scope > .blockSlot");

    if (!slot) return body;

    const childElements = slot.querySelectorAll(":scope > .block, :scope > .blockContainer");
    
    childElements.forEach(element => {
      const parsed = this.parseElement(element);
      if (parsed) {
        if (Array.isArray(parsed)) {
          body.push(...parsed);
        } else {
          body.push(parsed);
        }
      }
    });

    return body;
  }

  /**
   * Parseia um bloco solto (sem container)
   * @param {HTMLElement} block - Elemento do bloco
   * @returns {Object|null} Instrução ou null
   */
  parseBlock(block) {
    if (block.classList.contains("block--move")) {
      return this.parseBlockAsMove(block);
    }

    return null;
  }

  /**
   * Parseia um bloco Mover solto (sem container)
   * Blocos Mover sem direção são ignorados
   * @param {HTMLElement} block - Bloco .block--move
   * @returns {null} null (sem direção não gera instrução)
   */
  parseBlockAsMove(block) {
    return null;
  }

  /**
   * Conta o número total de blocos no workspace
   * Considera Repeat como 1 bloco + blocos do corpo
   * @returns {number} Total de blocos
   */
  countBlocks() {
    const allBlocks = this.workspace.querySelectorAll(".block--start, .block--move, .block--jump, .block--direction, .block--repeat");
    return allBlocks.length;
  }

  /**
   * Conta instruções executáveis (inclui expansão de repeat)
   * @returns {number} Total de instruções após expansão
   */
  countExecutableInstructions() {
    const instructions = this.parse();
    return instructions.length;
  }
}