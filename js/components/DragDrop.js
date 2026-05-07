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
    this.init();
  }

  init() {
    this.setupPaletteListeners();
    this.setupWorkspaceListeners();
    this.setupFreeDragListeners();
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
      const workspaceContent = this.workspace.querySelector(".workspaceContent");
      
      if (container) {
        const blockInside = container.querySelector(":scope > .block");
        
        if (blockInside && Block.hasSlot(blockInside)) {
          elementToDrag = container;
        }
      } else if (block.parentElement && block.parentElement.classList && block.parentElement.classList.contains("blockStack")) {
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
      
      elementToDrag.style.left = (rect.left - workspaceContent.getBoundingClientRect().left) + "px";
      elementToDrag.style.top = (rect.top - workspaceContent.getBoundingClientRect().top) + "px";

      elementToDrag.classList.add("dragging");
      elementToDrag.classList.add("freeDragging");
    });

    document.addEventListener("mousemove", (e) => {
      if (!this.isDraggingFree || !this.draggedElement) return;
      
      const workspaceContent = this.workspace.querySelector(".workspaceContent");
      const contentRect = workspaceContent.getBoundingClientRect();
      const newX = e.clientX - contentRect.left - this.dragOffsetX;
      const newY = e.clientY - contentRect.top - this.dragOffsetY;
      
      this.draggedElement.style.left = newX + "px";
      this.draggedElement.style.top = newY + "px";
    });

    document.addEventListener("mouseup", (e) => {
      if (!this.isDraggingFree || !this.draggedElement) return;
      
      const element = this.draggedElement;
      const workspaceContent = this.workspace.querySelector(".workspaceContent");
      const contentRect = workspaceContent.getBoundingClientRect();

      element.classList.remove("dragging");
      element.classList.remove("freeDragging");
      element.style.zIndex = "";
      element.style.width = "";
      element.style.transition = "";

      const isBlockContainer = element.classList.contains("blockContainer");

      const finalLeft = element.offsetLeft;
      const finalTop = element.offsetTop;

      if (finalLeft < -50 || finalTop < -50 || 
          finalLeft > contentRect.width + 50 || 
          finalTop > contentRect.height + 50) {
        element.remove();
        this.updatePlaceholder();
        this.dispatchBlockCountChanged();
        if (this.workspaceInstance) {
          this.workspaceInstance.checkBlocks();
        }
      } else {
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
        const canHaveChildren = blockType === "block--repeat" || blockType === "block--move";
        
        if (isDirection || (canHaveChildren && hasChildren)) {
          const targetSlot = this.findBlockSlotAtPosition(e.clientX, e.clientY, element);
          
          if (targetSlot) {
            const parentBlock = targetSlot.previousElementSibling;
            let canAccept = false;
            
            if (parentBlock) {
              const parentType = Block.getType(parentBlock);
              if (parentType === "block--repeat") {
                canAccept = true;
              }
            }
            
            if (!canAccept && isDirection) {
              canAccept = parentBlock && Block.canAccept(parentBlock, blockType);
            }
            
            if (canAccept) {
              element.style.position = "";
              element.style.left = "";
              element.style.top = "";
              element.style.zIndex = "";
              
              targetSlot.appendChild(element);
              
              this.updatePlaceholder();
              this.dispatchBlockCountChanged();
              if (this.workspaceInstance) {
                this.workspaceInstance.checkBlocks();
              }
              
              this.draggedElement = null;
              this.isDraggingFree = false;
              return;
            }
          }
        }
        
        element.style.position = "absolute";
        element.style.left = finalLeft + "px";
        element.style.top = finalTop + "px";

        if (element.parentElement !== workspaceContent) {
          workspaceContent.appendChild(element);
        }

        this.cleanupFreeDraggedElement(element, isBlockContainer);
      }

      this.draggedElement = null;
      this.isDraggingFree = false;
    });
    
    this.findBlockSlotAtPosition = function(clientX, clientY, draggedElement) {
      const allElements = document.elementsFromPoint(clientX, clientY);
      
      for (let el of allElements) {
        if (el === draggedElement || (draggedElement && draggedElement.contains(el))) {
          continue;
        }
        
        if (el.classList && el.classList.contains("blockSlot")) {
          const rect = el.getBoundingClientRect();
          if (clientX >= rect.left && clientX <= rect.right &&
              clientY >= rect.top && clientY <= rect.bottom) {
            return el;
          }
        }
        
        if (el.classList && el.classList.contains("block")) {
          const container = el.closest(".blockContainer");
          if (container) {
            const slot = container.querySelector(".blockSlot");
            if (slot) {
              const rect = slot.getBoundingClientRect();
              if (clientX >= rect.left && clientX <= rect.right &&
                  clientY >= rect.top && clientY <= rect.bottom) {
                return slot;
              }
            }
          }
        }
      }
      
      return null;
    };
  }

  cleanupFreeDraggedElement(element, isBlockContainer) {
    const workspaceContent = this.workspace.querySelector(".workspaceContent");
    const hasAbsolutePosition = element.style.position === "absolute";

    if (hasAbsolutePosition) {
      element.style.position = "absolute";
      
      if (element.parentElement !== workspaceContent) {
        workspaceContent.appendChild(element);
      }

      this.updatePlaceholder();
      this.dispatchBlockCountChanged();
      if (this.workspaceInstance) {
        this.workspaceInstance.checkBlocks();
      }
    } else {
      element.style.position = "";
      element.style.left = "";
      element.style.top = "";

      const parent = element.parentElement;
      if (parent && parent.classList.contains("blockSlot")) {
        return;
      }

      if (isBlockContainer) {
        this.ensureInStack(element);
      } else {
        const blockType = Block.getType(element);
        if (Block.hasSlot(element)) {
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
  }

  ensureInStack(element) {
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
    stack.appendChild(element);
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

      let slot = e.target.closest(".blockSlot");

      if (!slot) {
        const block = e.target.closest(".block");
        if (block) {
          const container = block.closest(".blockContainer");
          if (container) {
            slot = container.querySelector(".blockSlot");
          }
        }
      }

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

        if (blockType === "block--move" || this.draggedBlock?.classList?.contains("block--move")) {
          const slotContainer = slot.closest(".blockContainer");
          if (slotContainer) {
            const slotParent = slotContainer.querySelector(":scope > .block");
            if (slotParent && slotParent.classList.contains("block--repeat")) {
              canAccept = true;
            }
          }
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
      let slot = e.target.closest(".blockSlot");
      if (!slot) {
        const block = e.target.closest(".block");
        if (block) {
          const container = block.closest(".blockContainer");
          if (container) {
            slot = container.querySelector(".blockSlot");
          }
        }
      }

      if (slot) {
        if (!slot.contains(e.relatedTarget)) {
          slot.classList.remove("dragover", "dragover--valid", "dragover--invalid");
        }
        return;
      }

      if (!this.workspace.contains(e.relatedTarget)) {
        this.workspace.classList.remove("dragover");
      }
    });

    this.workspace.addEventListener("drop", (e) => {
      e.preventDefault();

      let slot = e.target.closest(".blockSlot");

      if (!slot) {
        const block = e.target.closest(".block");
        if (block) {
          const container = block.closest(".blockContainer");
          if (container) {
            slot = container.querySelector(".blockSlot");
          }
        }
      }

      if (slot) {
        e.stopPropagation();
        slot.classList.remove("dragover", "dragover--valid", "dragover--invalid");

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

        if (blockType === "block--move" || this.draggedBlock?.classList?.contains("block--move")) {
          const slotContainer = slot.closest(".blockContainer");
          if (slotContainer) {
            const slotParent = slotContainer.querySelector(":scope > .block");
            if (slotParent && slotParent.classList.contains("block--repeat")) {
              canAccept = true;
            }
          }
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

        this.addBlockToSlot(slot, blockToInsert);
        this.updatePlaceholder();
        this.dispatchBlockCountChanged();
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

      this.addBlockToWorkspace(blockToInsert, dropX, dropY);
      this.dispatchBlockCountChanged();
    });

    this.workspace.addEventListener("dragstart", (e) => {
      const block = e.target.closest(".block");
      if (!block) return;
      if (this.palette.contains(block)) return;

      let blockToDrag = block;

      const parentContainer = block.closest(".blockContainer");
      if (parentContainer) {
        const containerParent = parentContainer.parentElement;
        if (containerParent && containerParent.classList.contains("blockStack")) {
          const parentBlock = parentContainer.querySelector(":scope > .block");
          if (parentBlock && Block.hasSlot(parentBlock)) {
            blockToDrag = parentContainer;
          }
        }
      }

      this.draggedBlock = blockToDrag;
      this.isFromPalette = false;

      const parentContainerCheck = blockToDrag.closest(".blockContainer");
      this.wasInContainer = parentContainerCheck !== null;

      const blockType = Block.getType(blockToDrag.querySelector ? blockToDrag.querySelector(".block") : blockToDrag);
      if (blockType) {
        e.dataTransfer.setData("text/plain", blockType);
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
        const workspaceRect = this.workspace.getBoundingClientRect();
        const isOutsideWorkspace =
          e.clientX < workspaceRect.left ||
          e.clientX > workspaceRect.right ||
          e.clientY < workspaceRect.top ||
          e.clientY > workspaceRect.bottom;

        if (isOutsideWorkspace) {
          const container = this.draggedBlock.closest(".blockContainer");
          if (container) {
            container.remove();
          } else {
            this.draggedBlock.remove();
          }
          this.updatePlaceholder();
          this.dispatchBlockCountChanged();
          if (this.workspaceInstance) {
            this.workspaceInstance.checkBlocks();
          }
        } else {
          this.cleanupEmptyContainers();
          this.updatePlaceholder();
          this.dispatchBlockCountChanged();
          if (this.workspaceInstance) {
            this.workspaceInstance.checkBlocks();
          }
        }
      }

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

    let hasContent = false;

    stacks.forEach(stack => {
      if (stack.children.length > 0) {
        hasContent = true;
      }
    });

    containers.forEach(container => {
      if (container.children.length > 0) {
        hasContent = true;
      }
    });

    if (hasContent) {
      placeholder.classList.add("hidden");
    } else {
      placeholder.classList.remove("hidden");
    }
  }

  cleanupEmptyContainers() {
    const containers = this.workspace.querySelectorAll(".blockContainer");
    const stacks = this.workspace.querySelectorAll(".blockStack");

    containers.forEach(container => {
      const hasBlocks = container.querySelector(".block") !== null;
      if (!hasBlocks) {
        container.remove();
      }
    });

    stacks.forEach(stack => {
      const hasBlocks = stack.querySelector(".block, .blockContainer") !== null;
      if (!hasBlocks) {
        stack.remove();
      }
    });
  }

  addBlockToSlot(slot, block) {
    if (Block.hasSlot(block)) {
      const container = document.createElement("div");
      container.className = "blockContainer";

      const blockType = Block.getType(block);
      const typeName = blockType.replace("block--", "");
      container.setAttribute("data-type", typeName);

      const innerSlot = document.createElement("div");
      innerSlot.className = "blockSlot";

      container.appendChild(block);
      container.appendChild(innerSlot);
      slot.appendChild(container);

      block.classList.add("snapping");
      setTimeout(() => {
        block.classList.remove("snapping");
      }, 200);
    } else {
      slot.appendChild(block);

      block.classList.add("snapping");
      setTimeout(() => {
        block.classList.remove("snapping");
      }, 200);
    }

    if (block.classList.contains("block--repeat")) {
      const input = block.querySelector(".blockRepeatInput");
      if (input) {
        if (!input.value || input.value === "") {
          input.value = 1;
        }
      }
      Block.setupRepeatInputListeners(block);
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

  addBlockToWorkspace(block, dropX, dropY) {
    const workspaceContent = this.workspace.querySelector(".workspaceContent");

    if (Block.hasSlot(block)) {
      const container = document.createElement("div");
      container.className = "blockContainer";

      const blockType = Block.getType(block);
      const typeName = blockType.replace("block--", "");
      container.setAttribute("data-type", typeName);

      const slot = document.createElement("div");
      slot.className = "blockSlot";

      container.appendChild(block);
      container.appendChild(slot);

      if (dropX !== undefined && dropY !== undefined) {
        container.style.position = "absolute";
        container.style.left = dropX + "px";
        container.style.top = dropY + "px";
        workspaceContent.appendChild(container);
      } else {
        const stacks = this.workspace.querySelectorAll(".blockStack");
        let targetStack = null;

        if (stacks.length > 0) {
          targetStack = stacks[stacks.length - 1];
        } else {
          targetStack = document.createElement("div");
          targetStack.className = "blockStack";
          workspaceContent.appendChild(targetStack);
        }
        targetStack.appendChild(container);
      }
    } else {
      if (dropX !== undefined && dropY !== undefined) {
        block.style.position = "absolute";
        block.style.left = dropX + "px";
        block.style.top = dropY + "px";
        workspaceContent.appendChild(block);
      } else {
        const stacks = this.workspace.querySelectorAll(".blockStack");
        let targetStack = null;

        if (stacks.length > 0) {
          targetStack = stacks[stacks.length - 1];
        } else {
          targetStack = document.createElement("div");
          targetStack.className = "blockStack";
          workspaceContent.appendChild(targetStack);
        }
        targetStack.appendChild(block);
      }
    }

    if (block.classList.contains("block--repeat")) {
      const input = block.querySelector(".blockRepeatInput");
      if (input) {
        if (!input.value || input.value === "") {
          input.value = 1;
        }
      }
      Block.setupRepeatInputListeners(block);
    }

    block.classList.add("snapping");
    setTimeout(() => {
      block.classList.remove("snapping");
    }, 200);

    this.updatePlaceholder();
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
    const absoluteBlocks = workspaceContent.querySelectorAll(".block[style*='position: absolute']");
    absoluteBlocks.forEach((block) => block.remove());
    
    const absoluteContainers = workspaceContent.querySelectorAll(".blockContainer[style*='position: absolute']");
    absoluteContainers.forEach((container) => container.remove());
    
    this.updatePlaceholder();
    this.dispatchBlockCountChanged();
  }
}