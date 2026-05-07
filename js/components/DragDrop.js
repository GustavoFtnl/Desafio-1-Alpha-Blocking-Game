/**
 * DragDrop.js - Gerencia eventos drag-and-drop nativos
 * Comentários em português do Brasil
 */

import { Block } from "./Block.js";

export class DragDrop {
  constructor(paletteElement, workspaceElement) {
    this.palette = paletteElement;
    this.workspace = workspaceElement;
    this.draggedBlock = null;
    this.isFromPalette = false;
    this.maxBlocks = null;
    this.wasInContainer = false;
    this.init();
  }

  init() {
    this.setupPaletteListeners();
    this.setupWorkspaceListeners();
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

        const parentBlock = slot.previousElementSibling;

        if (parentBlock && Block.canAccept(parentBlock, blockType)) {
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

        const blockType = e.dataTransfer.getData("text/plain");
        const parentBlock = slot.previousElementSibling;

        if (!parentBlock || !Block.canAccept(parentBlock, blockType)) {
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
      this.addBlockToWorkspace(blockToInsert);
      this.dispatchBlockCountChanged();
    });

    this.workspace.addEventListener("dragstart", (e) => {
      const block = e.target.closest(".block");
      if (!block) return;
      if (this.palette.contains(block)) return;

      this.draggedBlock = block;
      this.isFromPalette = false;

      const parentContainer = block.closest(".blockContainer");
      this.wasInContainer = parentContainer !== null;

      const blockType = Block.getType(block);
      e.dataTransfer.setData("text/plain", blockType);
      e.dataTransfer.effectAllowed = "move";
      block.classList.add("dragging");
      block.setAttribute("aria-grabbed", "true");
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
        } else {
          this.cleanupEmptyContainers();
          this.updatePlaceholder();
          this.dispatchBlockCountChanged();
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

  addBlockToWorkspace(block) {
    const stacks = this.workspace.querySelectorAll(".blockStack");
    let targetStack = null;

    if (stacks.length > 0) {
      targetStack = stacks[stacks.length - 1];
    } else {
      targetStack = document.createElement("div");
      targetStack.className = "blockStack";
      this.workspace.appendChild(targetStack);
    }

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
      targetStack.appendChild(container);
    } else {
      targetStack.appendChild(block);
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
    this.updatePlaceholder();
    this.dispatchBlockCountChanged();
  }
}