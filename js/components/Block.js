/**
 * Block.js - Componente reutilizável para blocos de programação
 * Renderiza um bloco com ícone, texto e tipo específicos
 * Comentários em português do Brasil conforme AGENTS.md
 */

export class Block {
  /**
   * Cria uma instância de elemento DOM para o bloco
   * @param {string} text - Texto exibido no bloco
   * @param {string} icon - Ícone do bloco (nome do ícone ou símbolo)
   * @param {string} type - Tipo do bloco (classe CSS)
   * @returns {HTMLElement} Elemento div.block
   */
  static createElement(text, icon, type) {
    if (!text || typeof text !== "string") {
      throw new Error("Parâmetro 'text' é obrigatório e deve ser uma string");
    }
    if (!type || typeof type !== "string") {
      throw new Error("Parâmetro 'type' é obrigatório e deve ser uma string");
    }

    const block = document.createElement("div");
    block.className = `block ${type}`;
    block.setAttribute("draggable", "true");
    block.setAttribute("aria-label", `Bloco de comando: ${text}`);
    block.setAttribute("aria-grabbed", "false");

    if (type === "block--repeat") {
      const iconSpan = document.createElement("span");
      iconSpan.className = "material-symbols-outlined blockIcon";
      iconSpan.textContent = icon || "loop";

      const textSpan = document.createElement("span");
      textSpan.className = "block_text";
      textSpan.textContent = text;

      const inputWrapper = document.createElement("div");
      inputWrapper.className = "blockRepeatInputWrapper";

      const decrementBtn = document.createElement("button");
      decrementBtn.type = "button";
      decrementBtn.className = "blockRepeatBtn blockRepeatBtn--decrement";
      decrementBtn.textContent = "-";
      decrementBtn.setAttribute("aria-label", "Diminuir");

      const input = document.createElement("input");
      input.type = "number";
      input.className = "blockRepeatInput";
      input.value = 1;
      input.min = 1;
      input.max = 10;
      input.setAttribute("aria-label", "Quantidade de repetições");

      const incrementBtn = document.createElement("button");
      incrementBtn.type = "button";
      incrementBtn.className = "blockRepeatBtn blockRepeatBtn--increment";
      incrementBtn.textContent = "+";
      incrementBtn.setAttribute("aria-label", "Aumentar");

      inputWrapper.appendChild(decrementBtn);
      inputWrapper.appendChild(input);
      inputWrapper.appendChild(incrementBtn);

      block.appendChild(iconSpan);
      block.appendChild(textSpan);
      block.appendChild(inputWrapper);
    } else {
      const isSymbol = icon && icon.length <= 2 && !/^move_|loop|play_/.test(icon);
      if (isSymbol) {
        block.textContent = `${icon}${text}`;
      } else {
        const iconSpan = document.createElement("span");
        iconSpan.className = "material-symbols-outlined blockIcon";
        iconSpan.textContent = icon || "";
        const textSpan = document.createElement("span");
        textSpan.className = "block_text";
        textSpan.textContent = text;
        block.appendChild(iconSpan);
        block.appendChild(textSpan);
      }
    }

    return block;
  }

  static setupRepeatInputListeners(block) {
    const input = block.querySelector(".blockRepeatInput");
    const decrementBtn = block.querySelector(".blockRepeatBtn--decrement");
    const incrementBtn = block.querySelector(".blockRepeatBtn--increment");

    if (!input || !decrementBtn || !incrementBtn) return;

    if (block.dataset.listenersSetup === "true") return;
    block.dataset.listenersSetup = "true";

    decrementBtn.addEventListener("click", (e) => {
      e.stopPropagation();
      let value = parseInt(input.value, 10);
      if (value > 1) {
        input.value = value - 1;
      }
    });

    incrementBtn.addEventListener("click", (e) => {
      e.stopPropagation();
      let value = parseInt(input.value, 10);
      if (value < 10) {
        input.value = value + 1;
      }
    });

    input.addEventListener("click", (e) => {
      e.stopPropagation();
    });

    input.addEventListener("change", (e) => {
      let value = parseInt(input.value, 10);
      if (isNaN(value) || value < 1) {
        input.value = 1;
      } else if (value > 10) {
        input.value = 10;
      }
    });
  }

  /**
   * Clona um bloco existente mantendo suas propriedades
   * @param {HTMLElement} originalBlock - Bloco original a ser clonado
   * @returns {HTMLElement} Clone do bloco
   */
  static clone(originalBlock) {
    if (!originalBlock || !(originalBlock instanceof HTMLElement)) {
      throw new Error("Parâmetro 'originalBlock' deve ser um elemento HTMLElement");
    }

    const clone = originalBlock.cloneNode(true);
    const stateClasses = ["dragging", "snapping", "selected"];
    stateClasses.forEach((cls) => clone.classList.remove(cls));
    clone.setAttribute("aria-grabbed", "false");
    clone.setAttribute("draggable", "true");

    const originalInput = originalBlock.querySelector('.blockRepeatInput');
    if (originalInput) {
      const cloneInput = clone.querySelector('.blockRepeatInput');
      if (cloneInput) {
        cloneInput.value = originalInput.value;
      }
    }

    return clone;
  }

  /**
   * Extrai o tipo do bloco a partir do elemento
   * @param {HTMLElement} block - Elemento do bloco
   * @returns {string} Tipo do bloco (classe block--*)
   */
  static getType(block) {
    if (!block || !(block instanceof HTMLElement)) {
      throw new Error("Parâmetro 'block' deve ser um elemento HTMLElement");
    }

    const classes = block.className.split(" ");
    for (const cls of classes) {
      if (cls.startsWith("block--")) {
        return cls;
      }
    }
    return null;
  }

  /**
   * Define as configurações padrão dos blocos disponíveis
   * @returns {Array} Array de objetos com type, icon e text
   */
  static getConfigs() {
    return [
      { type: "block--move", icon: "move_up", text: "Mover" },
      { type: "block--direction", icon: "→", text: "Direita" },
      { type: "block--direction", icon: "←", text: "Esquerda" },
      { type: "block--direction", icon: "↑", text: "Cima" },
      { type: "block--direction", icon: "↓", text: "Baixo" },
      { type: "block--repeat", icon: "loop", text: "Repetir" },
    ];
  }

  static validateConfig(config) {
    return (
      config &&
      typeof config.type === "string" &&
      typeof config.text === "string"
    );
  }

  /**
   * Retorna os tipos de filhos aceitos por cada tipo de bloco pai
   * @param {string} parentType - Tipo do bloco pai (block--*)
   * @returns {Array} Array de tipos aceitos
   */
  static getAcceptedChildTypes(parentType) {
    const accepts = {
      "block--repeat": ["block--move"],
      "block--move": ["block--direction"],
    };
    return accepts[parentType] || [];
  }

  /**
   * Verifica se um bloco pode aceitar um filho de determinado tipo
   * @param {HTMLElement} parentBlock - Bloco pai
   * @param {string} childType - Tipo do bloco filho
   * @returns {boolean} True se pode aceitar
   */
  static canAccept(parentBlock, childType) {
    if (!parentBlock || !(parentBlock instanceof HTMLElement)) {
      return false;
    }
    if (!childType || typeof childType !== "string") {
      return false;
    }

    const parentType = Block.getType(parentBlock);
    if (!parentType) return false;

    const acceptedTypes = Block.getAcceptedChildTypes(parentType);
    if (!acceptedTypes.includes(childType)) {
      return false;
    }

    if (parentType === "block--repeat") {
      return true;
    }

    const parentContainer = parentBlock.closest(".blockContainer");
    if (parentContainer) {
      const slot = parentContainer.querySelector(".blockSlot");
      if (slot) {
        const existingBlocks = slot.querySelectorAll(".block");
        if (parentType === "block--move") {
          return existingBlocks.length < 4; // Limite de 4 direções (cima, baixo, esquerda, direita)
        }
      }
    }

    return true;
  }

  /**
   * Verifica se um bloco aceita filhos (tem slot)
   * @param {HTMLElement} block - Bloco a verificar
   * @returns {boolean} True se tem slot
   */
  static hasSlot(block) {
    if (!block || !(block instanceof HTMLElement)) {
      return false;
    }
    const type = Block.getType(block);
    return type === "block--repeat" || type === "block--move";
  }

  /**
   * Verifica se um bloco é um tipo filho (direction ou move)
   * @param {HTMLElement} block - Bloco a verificar
   * @returns {boolean} True se é bloco filho
   */
  static isChildType(block) {
    if (!block || !(block instanceof HTMLElement)) {
      return false;
    }
    const type = Block.getType(block);
    return type === "block--direction" || type === "block--move";
  }

  /**
   * Cria um container com bloco pai e slot para filhos
   * @param {string} text - Texto do bloco
   * @param {string} icon - Ícone do bloco
   * @param {string} type - Tipo do bloco
   * @returns {HTMLElement} Elemento div.blockContainer com slot
   */
  static createWithSlot(text, icon, type) {
    const container = document.createElement("div");
    container.className = "blockContainer";

    const block = Block.createElement(text, icon, type);
    container.appendChild(block);

    const slot = document.createElement("div");
    slot.className = "blockSlot";
    container.appendChild(slot);

    return container;
  }
}