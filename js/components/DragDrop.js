/**
 * DragDrop.js - Gerencia eventos drag-and-drop nativos
 * Comentários em português do Brasil
 */

import { Block } from "./Block.js";

export class DragDrop {
  constructor(paletteElement, workspaceElement, workspaceInstance) {
    this.palette = paletteElement;
    this.workspace = workspaceElement;
    this.workspaceInstance = workspaceInstance;
    this.draggedBlock = null;
    this.isFromPalette = false;
    this.maxBlocks = null;
    this.wasInContainer = false;
    this.isDraggingFree = false;
    this.dragOffsetX = 0;
    this.dragOffsetY = 0;
    this.draggedElement = null;
    this.trashZone = null;
    
    // Configuração de sensibilidade para snap
    this.SNAP_THRESHOLD = 40;

    this.handleMouseMove = this.handleMouseMove.bind(this);
    this.handleMouseUp = this.handleMouseUp.bind(this);

    this.init();
  }

  init() {
    this.trashZone = this.workspace.querySelector(".trashZone");
    this.setupPaletteListeners();
    this.setupWorkspaceListeners();
    this.setupFreeDragListeners();
  }

  /**
   * Ativa a lixeira (mostra quando começa arrastar)
   */
  activateTrashZone() {
    if (this.trashZone) {
      this.trashZone.classList.add("active");
    }
  }

  /**
   * Desativa a lixeira
   */
  deactivateTrashZone() {
    if (this.trashZone) {
      this.trashZone.classList.remove("active");
      this.trashZone.classList.remove("dragover");
    }
  }

  /**
   * Verifica se o cursor está sobre a lixeira
   * @param {number} clientX - Posição X do cursor
   * @param {number} clientY - Posição Y do cursor
   * @returns {boolean} True se está sobre a lixeira
   */
  isOverTrashZone(clientX, clientY) {
    if (!this.trashZone) return false;
    
    const rect = this.trashZone.getBoundingClientRect();
    return (
      clientX >= rect.left &&
      clientX <= rect.right &&
      clientY >= rect.top &&
      clientY <= rect.bottom
    );
  }

  /**
   * Atualiza o estado de dragover na lixeira
   * @param {boolean} isOver - Se o cursor está sobre a lixeira
   */
  updateTrashZoneDragOver(isOver) {
    if (!this.trashZone) return;
    
    if (isOver) {
      this.trashZone.classList.add("dragover");
    } else {
      this.trashZone.classList.remove("dragover");
    }
  }

  findTargetSlot(target) {
    let slot = target.closest(".blockSlot");

    if (!slot) {
      const block = target.closest(".block");
      if (block) {
        const container = block.closest(".blockContainer");
        if (container) {
          slot = container.querySelector(".blockSlot");
        }
      }
    }

    return slot;
  }

  // Novo método para detectar se deve inserir no final ou no meio de uma pilha
  getInsertionPoint(clientX, clientY) {
    const workspaceContent = this.workspace.querySelector(".workspaceContent");
    const stacks = workspaceContent.querySelectorAll(".blockStack");
    const allBlocks = workspaceContent.querySelectorAll(".block, .blockContainer");

    let nearestStack = null;
    let minDistance = this.SNAP_THRESHOLD;

    // 1. Tenta achar uma pilha que esteja muito próxima ao cursor
    for (const stack of stacks) {
      const rect = stack.getBoundingClientRect();
      // Margem de tolerância horizontal e vertical para considerar "dentro" da pilha
      if (clientX >= rect.left - 20 && clientX <= rect.right + 20) {
        if (clientY >= rect.top - 20 && clientY <= rect.bottom + 20) {
          nearestStack = stack;
          break;
        }
        // Calcula proximidade da base da pilha (caso queira adicionar ao final)
        const distance = Math.abs(clientY - rect.bottom);
        if (distance < minDistance) {
          minDistance = distance;
          nearestStack = stack;
        }
      }
    }

    // 2. Fallback: Procura blocos avulsos próximos
    if (!nearestStack) {
      for (const block of allBlocks) {
        const rect = block.getBoundingClientRect();
        if (clientX >= rect.left - 20 && clientX <= rect.right + 20) {
          const distanceTop = Math.abs(clientY - rect.top);
          const distanceBottom = Math.abs(clientY - rect.bottom);
          const distance = Math.min(distanceTop, distanceBottom);

          if (distance < minDistance) {
            minDistance = distance;
            const parentStack = block.closest(".blockStack");
            if (parentStack) nearestStack = parentStack;
          }
        }
      }
    }

    if (!nearestStack) return null;

    // 3. Define em qual posição da pilha o bloco será inserido (referenceNode)
    const children = nearestStack.querySelectorAll(":scope > .block, :scope > .blockContainer");
    let referenceNode = null;

    for (const child of children) {
      const rect = child.getBoundingClientRect();
      // Se o mouse estiver acima da metade deste bloco, insere ANTES dele
      if (clientY < rect.top + rect.height / 2) {
        referenceNode = child;
        break;
      }
    }

    return { stack: nearestStack, referenceNode };
  }

  findBlockSlotAtPosition(clientX, clientY, draggedElement) {
    const allElements = document.elementsFromPoint(clientX, clientY);

    for (let el of allElements) {
      if (
        el === draggedElement ||
        (draggedElement && draggedElement.contains(el))
      ) {
        continue;
      }

      if (el.classList && el.classList.contains("blockSlot")) {
        const rect = el.getBoundingClientRect();
        if (
          clientX >= rect.left &&
          clientX <= rect.right &&
          clientY >= rect.top &&
          clientY <= rect.bottom
        ) {
          return el;
        }
      }

      if (el.classList && el.classList.contains("block")) {
        const container = el.closest(".blockContainer");
        if (container) {
          const slot = container.querySelector(".blockSlot");
          if (slot) {
            const rect = slot.getBoundingClientRect();
            if (
              clientX >= rect.left &&
              clientX <= rect.right &&
              clientY >= rect.top &&
              clientY <= rect.bottom
            ) {
              return slot;
            }
          }
        }
      }
    }

    return null;
  }

  handleMouseMove(e) {
    if (!this.isDraggingFree || !this.draggedElement) return;

    const workspaceContent = this.workspace.querySelector(".workspaceContent");
    const contentRect = workspaceContent.getBoundingClientRect();
    const newX = e.clientX - contentRect.left - this.dragOffsetX;
    const newY = e.clientY - contentRect.top - this.dragOffsetY;

    this.draggedElement.style.left = newX + "px";
    this.draggedElement.style.top = newY + "px";

    // Verifica se está sobre a lixeira
    const overTrash = this.isOverTrashZone(e.clientX, e.clientY);
    this.updateTrashZoneDragOver(overTrash);
  }

  handleMouseUp(e) {
    if (!this.isDraggingFree || !this.draggedElement) return;

    const element = this.draggedElement;
    const workspaceContent = this.workspace.querySelector(".workspaceContent");
    const contentRect = workspaceContent.getBoundingClientRect();

    // Desativa a lixeira
    this.deactivateTrashZone();

    element.classList.remove("dragging");
    element.classList.remove("freeDragging");
    element.style.zIndex = "";
    element.style.width = "";
    element.style.transition = "";

    const isBlockContainer = element.classList.contains("blockContainer");

    const finalLeft = element.offsetLeft;
    const finalTop = element.offsetTop;

    // Verifica se foi solto sobre a lixeira
    if (this.isOverTrashZone(e.clientX, e.clientY)) {
      element.remove();
      this.updatePlaceholder();
      this.dispatchBlockCountChanged();
      if (this.workspaceInstance) {
        this.workspaceInstance.checkBlocks();
      }
      
      document.removeEventListener("mousemove", this.handleMouseMove);
      document.removeEventListener("mouseup", this.handleMouseUp);

      this.draggedElement = null;
      this.isDraggingFree = false;
      return;
    }

// Se não caiu em um slot, prepara para o Root Snapping
    element.style.position = "absolute";
    element.style.left = finalLeft + "px";
    element.style.top = finalTop + "px";

    if (element.parentElement !== workspaceContent) {
      workspaceContent.appendChild(element);
    }

    // Procura ponto de inserção no meio de outras pilhas na raiz
    const insertionPoint = this.getInsertionPoint(e.clientX, e.clientY);

    if (insertionPoint) {
      element.style.position = "";
      element.style.left = "";
      element.style.top = "";
      this.insertIntoStackWithSnapping(insertionPoint.stack, element, insertionPoint.referenceNode);
    } else {
      this.cleanupFreeDraggedElement(element, isBlockContainer);
      let hasChildren = false;
      let blockType = Block.getType(element);

      if (!blockType && element.classList.contains("blockContainer")) {
        const innerBlock = element.querySelector(":scope > .block");
        if (innerBlock) {
          blockType = Block.getType(innerBlock);
          hasChildren = Block.hasSlot(innerBlock);
        }
      }

      const isDirection = blockType === "block--direction";
      const canHaveChildren =
        blockType === "block--repeat" || blockType === "block--move";

      // Verifica encaixe em Slots
      if (isDirection || (canHaveChildren && hasChildren)) {
        const targetSlot = this.findBlockSlotAtPosition(
          e.clientX,
          e.clientY,
          element,
        );

        if (targetSlot) {
          const parentBlock = targetSlot.previousElementSibling;
          let canAccept = false;

          if (parentBlock) {
            canAccept = Block.canAccept(parentBlock, blockType);
          }

          if (!canAccept && isDirection) {
            canAccept = parentBlock && Block.canAccept(parentBlock, blockType);
          }

          if (canAccept) {
            element.style.position = "";
            element.style.left = "";
            element.style.top = "";
            element.style.zIndex = "";

            // Verifica posição exata no slot para inserir no meio de blocos aninhados
            let slotReferenceNode = null;
            const slotChildren = targetSlot.querySelectorAll(":scope > .block, :scope > .blockContainer");
            for (const child of slotChildren) {
              const childRect = child.getBoundingClientRect();
              if (e.clientY < childRect.top + childRect.height / 2) {
                slotReferenceNode = child;
                break;
              }
            }

            if (slotReferenceNode) {
              targetSlot.insertBefore(element, slotReferenceNode);
            } else {
              targetSlot.appendChild(element);
            }

            this.updatePlaceholder();
            this.dispatchBlockCountChanged();
            if (this.workspaceInstance) {
              this.workspaceInstance.checkBlocks();
            }

            this.draggedElement = null;
            this.isDraggingFree = false;
            
            document.removeEventListener("mousemove", this.handleMouseMove);
            document.removeEventListener("mouseup", this.handleMouseUp);
            return;
          }
        }
      }

      // Se não caiu em um slot, prepara para o Root Snapping
      element.style.position = "absolute";
      element.style.left = finalLeft + "px";
      element.style.top = finalTop + "px";

      if (element.parentElement !== workspaceContent) {
        workspaceContent.appendChild(element);
      }

      // Procura ponto de inserção no meio de outras pilhas na raiz
      const insertionPoint = this.getInsertionPoint(e.clientX, e.clientY);

      if (insertionPoint) {
        element.style.position = "";
        element.style.left = "";
        element.style.top = "";
        this.insertIntoStackWithSnapping(insertionPoint.stack, element, insertionPoint.referenceNode);
      } else {
        this.cleanupFreeDraggedElement(element, isBlockContainer);
      }
    }

    document.removeEventListener("mousemove", this.handleMouseMove);
    document.removeEventListener("mouseup", this.handleMouseUp);

    this.draggedElement = null;
    this.isDraggingFree = false;
  }

  setupFreeDragListeners() {
    this.workspace.addEventListener("mousedown", (e) => {
      const clickedElement = e.target;
      const block = clickedElement.closest(".block");

      if (!block) return;
      if (this.palette.contains(block)) return;

      e.preventDefault();
      e.stopPropagation();

      let elementToDrag = block;

      const container = block.closest(".blockContainer");
      const workspaceContent =
        this.workspace.querySelector(".workspaceContent");

      if (container) {
        const blockInside = container.querySelector(":scope > .block");
        const blockType = Block.getType(block);

        if (blockType === "block--direction") {
          elementToDrag = block;
        } else if (blockInside && Block.hasSlot(blockInside)) {
          elementToDrag = container;
        }
      } else if (
        block.parentElement &&
        block.parentElement.classList &&
        block.parentElement.classList.contains("blockStack")
      ) {
        elementToDrag = block;
      } else if (block.parentElement === workspaceContent) {
        elementToDrag = block;
      }

      const rect = elementToDrag.getBoundingClientRect();

      this.draggedElement = elementToDrag;
      this.isDraggingFree = true;

      this.dragOffsetX = e.clientX - rect.left;
      this.dragOffsetY = e.clientY - rect.top;

      this.dragStartLeft = rect.left;
      this.dragStartTop = rect.top;

      elementToDrag.style.position = "absolute";
      elementToDrag.style.zIndex = "10000";
      elementToDrag.style.transition = "none";
      elementToDrag.style.filter = "none";
      elementToDrag.style.transform = "none";

      if (elementToDrag.parentElement !== workspaceContent) {
        workspaceContent.appendChild(elementToDrag);
      }

      elementToDrag.style.left =
        rect.left - workspaceContent.getBoundingClientRect().left + "px";
      elementToDrag.style.top =
        rect.top - workspaceContent.getBoundingClientRect().top + "px";

      elementToDrag.classList.add("dragging");
      elementToDrag.classList.add("freeDragging");

      // Ativa a lixeira quando começa a arrastar
      this.activateTrashZone();

      document.addEventListener("mousemove", this.handleMouseMove);
      document.addEventListener("mouseup", this.handleMouseUp);
    });
  }

  cleanupFreeDraggedElement(element, isBlockContainer) {
    const workspaceContent = this.workspace.querySelector(".workspaceContent");
    const hasAbsolutePosition = element.style.position === "absolute";

    if (hasAbsolutePosition) {
      // Se possui posição absoluta, significa que não encontrou pilha e formará uma nova
      const newStack = document.createElement("div");
      newStack.className = "blockStack";
      newStack.style.position = "absolute";
      newStack.style.left = element.offsetLeft + "px";
      newStack.style.top = element.offsetTop + "px";
      
      workspaceContent.appendChild(newStack);
      newStack.appendChild(element);
      
      element.style.position = "";
      element.style.left = "";
      element.style.top = "";

      element.classList.add("snapping");
      setTimeout(() => {
        element.classList.remove("snapping");
      }, 200);

      this.updatePlaceholder();
      this.dispatchBlockCountChanged();
      if (this.workspaceInstance) {
        this.workspaceInstance.checkBlocks();
      }
    } else {
      const blockType = Block.getType(element);
      element.style.position = "";
      element.style.left = "";
      element.style.top = "";

      const parent = element.parentElement;
      if (parent && parent.classList.contains("blockSlot")) {
        return;
      }

      const isDirection = blockType === "block--direction";

      if (isBlockContainer) {
        this.ensureInStack(element);
      } else if (isDirection) {
        this.ensureInStack(element);
      } else if (Block.hasSlot(element)) {
        const container = document.createElement("div");
        container.className = "blockContainer";

        const typeName = blockType.replace("block--", "");
        container.setAttribute("data-type", typeName);

        const slot = document.createElement("div");
        slot.className = "blockSlot";

        const existingContainer = element.closest(".blockContainer");
        if (existingContainer) {
          const existingSlot = existingContainer.querySelector(".blockSlot");
          if (existingSlot && existingSlot.children.length > 0) {
            while (existingSlot.children.length > 0) {
              slot.appendChild(existingSlot.children[0]);
            }
          }
        }

        container.appendChild(element);
        container.appendChild(slot);

        this.ensureInStack(container);
      } else {
        this.ensureInStack(element);
      }
    }

    this.updatePlaceholder();
    this.dispatchBlockCountChanged();
    if (this.workspaceInstance) {
      this.workspaceInstance.checkBlocks();
    }
  }

  ensureInStack(element, dropX, dropY) {
    let stack = this.workspace.querySelector(".blockStack");
    if (!stack) {
      stack = document.createElement("div");
      stack.className = "blockStack";

      const workspaceContent = this.workspace.querySelector(".workspaceContent");
      if (workspaceContent) {
        workspaceContent.appendChild(stack);
      } else {
        this.workspace.appendChild(stack);
      }
    }

    if (dropX !== undefined && dropY !== undefined) {
      stack.style.position = "absolute";
      stack.style.left = dropX + "px";
      stack.style.top = dropY + "px";
    }

    stack.appendChild(element);
  }

  clearAllDragOverClasses() {
    const allSlots = this.workspace.querySelectorAll(".blockSlot");
    allSlots.forEach((slot) => {
      slot.classList.remove("dragover", "dragover--valid", "dragover--invalid");
    });
  }

  setupPaletteListeners() {
    this.palette.addEventListener("dragstart", (e) => {
      const block = e.target.closest(".block");
      if (!block) return;
      this.draggedBlock = block;
      this.isFromPalette = true;
      const blockType = Block.getType(block);
      e.dataTransfer.setData("text/plain", blockType);
      e.dataTransfer.effectAllowed = "copy";
      block.classList.add("dragging");
      block.setAttribute("aria-grabbed", "true");
    });

    this.palette.addEventListener("dragend", (e) => {
      const block = e.target.closest(".block");
      if (!block) return;
      block.classList.remove("dragging");
      block.setAttribute("aria-grabbed", "false");
      this.draggedBlock = null;
      this.isFromPalette = false;
    });
  }

  setupWorkspaceListeners() {
    this.workspace.addEventListener("dragover", (e) => {
      e.preventDefault();

      let slot = this.findTargetSlot(e.target);

      if (slot) {
        e.stopPropagation();
        slot.classList.add("dragover");

        let blockType = e.dataTransfer.getData("text/plain");
        if (!blockType && this.draggedBlock) {
          blockType = Block.getType(this.draggedBlock);
        }

        let parentBlock = slot.previousElementSibling;

        if (!parentBlock) {
          const slotContainer = slot.closest(".blockContainer");
          if (slotContainer) {
            parentBlock = slotContainer.querySelector(":scope > .block");
          }
        }

        let canAccept = false;
        if (parentBlock) {
          canAccept = Block.canAccept(parentBlock, blockType);
        }

        if (canAccept) {
          slot.classList.add("dragover--valid");
          slot.classList.remove("dragover--invalid");
          e.dataTransfer.dropEffect = this.isFromPalette ? "copy" : "move";
        } else {
          slot.classList.add("dragover--invalid");
          slot.classList.remove("dragover--valid");
          e.dataTransfer.dropEffect = "none";
        }
        return;
      }

      e.dataTransfer.dropEffect = this.isFromPalette ? "copy" : "move";
      this.workspace.classList.add("dragover");
    });

    this.workspace.addEventListener("dragleave", (e) => {
      let slot = this.findTargetSlot(e.target);

      if (slot) {
        if (!slot.contains(e.relatedTarget)) {
          slot.classList.remove(
            "dragover",
            "dragover--valid",
            "dragover--invalid",
          );
        }
        return;
      }

      if (!this.workspace.contains(e.relatedTarget)) {
        this.workspace.classList.remove("dragover");
      }
    });

    this.workspace.addEventListener("drop", (e) => {
      e.preventDefault();

      let slot = this.findTargetSlot(e.target);

      if (slot) {
        e.stopPropagation();
        slot.classList.remove(
          "dragover",
          "dragover--valid",
          "dragover--invalid",
        );

        let blockType = e.dataTransfer.getData("text/plain");
        if (!blockType && this.draggedBlock) {
          blockType = Block.getType(this.draggedBlock);
        }

        let parentBlock = slot.previousElementSibling;

        if (!parentBlock) {
          const slotContainer = slot.closest(".blockContainer");
          if (slotContainer) {
            parentBlock = slotContainer.querySelector(":scope > .block");
          }
        }

        let canAccept = false;
        if (parentBlock) {
          canAccept = Block.canAccept(parentBlock, blockType);
        }

        if (!canAccept) {
          return;
        }

        let blockToInsert = null;

        if (this.isFromPalette) {
          if (this.draggedBlock) {
            blockToInsert = Block.clone(this.draggedBlock);
          } else if (blockType) {
            blockToInsert = this.createBlock(blockType);
          }
        } else {
          blockToInsert = this.draggedBlock;
        }

        if (!blockToInsert) {
          return;
        }

        // Passa o eixo Y para calcular o ponto exato de inserção dentro do slot
        this.addBlockToSlot(slot, blockToInsert, e.clientY);
        this.updatePlaceholder();
        this.dispatchBlockCountChanged();
        this.draggedBlock = null;

        this.clearAllDragOverClasses();
        return;
      }

      this.workspace.classList.remove("dragover");

      const blockType = e.dataTransfer.getData("text/plain");
      let blockToInsert = null;

      if (this.isFromPalette) {
        if (this.draggedBlock) {
          blockToInsert = Block.clone(this.draggedBlock);
        } else if (blockType) {
          blockToInsert = this.createBlock(blockType);
        }
      } else {
        blockToInsert = this.draggedBlock;
      }

      if (!blockToInsert) {
        console.error("Nenhum bloco válido para inserir");
        return;
      }

      if (this.isFromPalette && this.maxBlocks !== null) {
        const currentCount = this.getRootBlockCount();
        if (currentCount >= this.maxBlocks) {
          console.warn("Limite de blocos atingido");
          return;
        }
      }

      this.updatePlaceholder();

      const workspaceRect = this.workspace.getBoundingClientRect();
      const dropX = e.clientX - workspaceRect.left;
      const dropY = e.clientY - workspaceRect.top;

      const insertionPoint = this.getInsertionPoint(e.clientX, e.clientY);
      this.addBlockToWorkspace(blockToInsert, dropX, dropY, insertionPoint);
      
      this.dispatchBlockCountChanged();
      this.clearAllDragOverClasses();
    });

    this.workspace.addEventListener("dragstart", (e) => {
      const block = e.target.closest(".block");
      if (!block) return;
      if (this.palette.contains(block)) return;

      let blockToDrag = block;

      const blockType = Block.getType(block);

      if (blockType === "block--direction") {
        blockToDrag = block;
      } else {
        const parentContainer = block.closest(".blockContainer");
        if (parentContainer) {
          const containerParent = parentContainer.parentElement;
          if (
            containerParent &&
            containerParent.classList.contains("blockStack")
          ) {
            const parentBlock =
              parentContainer.querySelector(":scope > .block");
            if (parentBlock && Block.hasSlot(parentBlock)) {
              blockToDrag = parentContainer;
            }
          }
        }
      }

      this.draggedBlock = blockToDrag;
      this.isFromPalette = false;

      const parentContainerCheck = blockToDrag.closest(".blockContainer");
      this.wasInContainer = parentContainerCheck !== null;

      const finalBlockType = Block.getType(
        blockToDrag.querySelector
          ? blockToDrag.querySelector(".block")
          : blockToDrag,
      );
      if (finalBlockType) {
        e.dataTransfer.setData("text/plain", finalBlockType);
      }
      e.dataTransfer.effectAllowed = "move";
      blockToDrag.classList.add("dragging");
      blockToDrag.setAttribute("aria-grabbed", "true");
    });

    this.workspace.addEventListener("dragend", (e) => {
      const block = e.target.closest(".block");
      if (!block) return;

      block.classList.remove("dragging");
      block.setAttribute("aria-grabbed", "false");

      if (this.draggedBlock && this.workspace.contains(this.draggedBlock)) {
        this.cleanupEmptyContainers();
        this.updatePlaceholder();
        this.dispatchBlockCountChanged();
        if (this.workspaceInstance) {
          this.workspaceInstance.checkBlocks();
        }
      }

      this.clearAllDragOverClasses();
      this.draggedBlock = null;
      this.wasInContainer = false;
    });
  }

  getRootBlockCount() {
    const rootBlocks = this.workspace.querySelectorAll(
      ".blockStack > .block, .blockStack > .blockContainer > .block",
    );
    return rootBlocks.length;
  }

  updatePlaceholder() {
    const placeholder = this.workspace.querySelector(".workspacePlaceholder");
    if (!placeholder) return;

    const stacks = this.workspace.querySelectorAll(".blockStack");
    const containers = this.workspace.querySelectorAll(".blockContainer");
    const workspaceContent = this.workspace.querySelector(".workspaceContent");

    let hasContent = false;

    stacks.forEach((stack) => {
      if (stack.children.length > 0) {
        hasContent = true;
      }
    });

    containers.forEach((container) => {
      if (container.children.length > 0) {
        hasContent = true;
      }
    });

    if (workspaceContent) {
      const directBlocks = workspaceContent.querySelectorAll(":scope > .block");
      if (directBlocks.length > 0) {
        hasContent = true;
      }
    }

    if (hasContent) {
      placeholder.classList.add("hidden");
    } else {
      placeholder.classList.remove("hidden");
    }
  }

  cleanupEmptyContainers() {
    const containers = this.workspace.querySelectorAll(".blockContainer");
    const stacks = this.workspace.querySelectorAll(".blockStack");

    containers.forEach((container) => {
      const hasBlocks = container.querySelector(".block") !== null;
      if (!hasBlocks) {
        container.remove();
      }
    });

    stacks.forEach((stack) => {
      const hasBlocks = stack.querySelector(".block, .blockContainer") !== null;
      if (!hasBlocks) {
        stack.remove();
      }
    });
  }

  // Editado: Adicionado clientY para saber onde inserir (meio ou final)
  addBlockToSlot(slot, block, clientY) {
    let elementToInsert = block;

    // Se é bloco estrutural e não está embalado, cria o container
    if (!block.classList.contains("blockContainer") && Block.hasSlot(block)) {
      const container = document.createElement("div");
      container.className = "blockContainer";

      const blockType = Block.getType(block);
      const typeName = blockType.replace("block--", "");
      container.setAttribute("data-type", typeName);

      const innerSlot = document.createElement("div");
      innerSlot.className = "blockSlot";

      container.appendChild(block);
      container.appendChild(innerSlot);
      elementToInsert = container;
    }

    // Calcula se insere antes ou no final baseado no mouse
    let referenceNode = null;
    if (clientY !== undefined) {
      const children = slot.querySelectorAll(":scope > .block, :scope > .blockContainer");
      for (const child of children) {
        const rect = child.getBoundingClientRect();
        if (clientY < rect.top + rect.height / 2) {
          referenceNode = child;
          break;
        }
      }
    }

    if (referenceNode) {
      slot.insertBefore(elementToInsert, referenceNode);
    } else {
      slot.appendChild(elementToInsert);
    }

    elementToInsert.classList.add("snapping");
    setTimeout(() => {
      elementToInsert.classList.remove("snapping");
    }, 200);

    const realBlock = elementToInsert.classList.contains("blockContainer") ? elementToInsert.querySelector(".block") : elementToInsert;
    if (realBlock && realBlock.classList.contains("block--repeat")) {
      const input = realBlock.querySelector(".blockRepeatInput");
      if (input) {
        if (!input.value || input.value === "") {
          input.value = 1;
        }
      }
      Block.setupRepeatInputListeners(realBlock);
    }

    this.ensureBlockContainer(slot);
  }

  ensureBlockContainer(slot) {
    const container = slot.closest(".blockContainer");
    if (container) {
      const parentBlock = container.querySelector(":scope > .block");
      if (parentBlock) {
        const type = Block.getType(parentBlock);
        if (type) {
          const typeName = type.replace("block--", "");
          container.setAttribute("data-type", typeName);
        }
      }
    }
  }

  createBlock(type) {
    const configs = Block.getConfigs();
    const config = configs.find((c) => c.type === type);
    if (!config) return null;

    return Block.createElement(config.text, config.icon, config.type);
  }

  addBlockToWorkspace(block, dropX, dropY, insertionPoint = null) {
    const workspaceContent = this.workspace.querySelector(".workspaceContent");

    let elementToInsert = block;

    if (!block.classList.contains("blockContainer") && Block.hasSlot(block)) {
      const container = document.createElement("div");
      container.className = "blockContainer";

      const blockType = Block.getType(block);
      const typeName = blockType.replace("block--", "");
      container.setAttribute("data-type", typeName);

      const slot = document.createElement("div");
      slot.className = "blockSlot";

      container.appendChild(block);
      container.appendChild(slot);
      elementToInsert = container;
    }

    if (insertionPoint && insertionPoint.stack) {
      this.insertIntoStackWithSnapping(insertionPoint.stack, elementToInsert, insertionPoint.referenceNode);
    } else {
      this.ensureInStack(elementToInsert, dropX, dropY);
    }

    const realBlock = elementToInsert.classList.contains("blockContainer") ? elementToInsert.querySelector(".block") : elementToInsert;
    if (realBlock && realBlock.classList.contains("block--repeat")) {
      const input = realBlock.querySelector(".blockRepeatInput");
      if (input) {
        if (!input.value || input.value === "") {
          input.value = 1;
        }
      }
      Block.setupRepeatInputListeners(realBlock);
    }

    elementToInsert.classList.add("snapping");
    setTimeout(() => {
      elementToInsert.classList.remove("snapping");
    }, 200);
    
    this.updatePlaceholder();
  }

  // Novo método inteligente de inserção usando insertBefore
  insertIntoStackWithSnapping(stack, element, referenceNode = null) {
    if (referenceNode) {
      stack.insertBefore(element, referenceNode);
    } else {
      stack.appendChild(element);
    }

    element.classList.add("snapping");
    setTimeout(() => {
      element.classList.remove("snapping");
    }, 200);
  }

  dispatchBlockCountChanged() {
    const event = new CustomEvent("blockCountChanged", {
      bubbles: true,
      detail: {
        count: this.workspace.querySelectorAll(".block").length,
      },
    });
    this.workspace.dispatchEvent(event);
  }

  clearWorkspace() {
    const stacks = this.workspace.querySelectorAll(".blockStack");
    stacks.forEach((stack) => stack.remove());
    const containers = this.workspace.querySelectorAll(".blockContainer");
    containers.forEach((container) => container.remove());

    const workspaceContent = this.workspace.querySelector(".workspaceContent");
    const absoluteBlocks = workspaceContent.querySelectorAll(
      ".block[style*='position: absolute']",
    );
    absoluteBlocks.forEach((block) => block.remove());

    const absoluteContainers = workspaceContent.querySelectorAll(
      ".blockContainer[style*='position: absolute']",
    );
    absoluteContainers.forEach((container) => container.remove());

    this.updatePlaceholder();
    this.dispatchBlockCountChanged();
  }
}