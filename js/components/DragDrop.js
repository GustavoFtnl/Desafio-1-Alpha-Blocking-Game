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
      e.dataTransfer.dropEffect = this.isFromPalette ? "copy" : "move";
      this.workspace.classList.add("dragover");
    });

    this.workspace.addEventListener("dragleave", (e) => {
      if (!this.workspace.contains(e.relatedTarget)) {
        this.workspace.classList.remove("dragover");
      }
    });

    this.workspace.addEventListener("drop", (e) => {
      e.preventDefault();
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

      const placeholder = this.workspace.querySelector(".workspacePlaceholder");
      if (placeholder) {
        placeholder.style.display = "none";
      }

      this.addBlockToWorkspace(blockToInsert);
      this.dispatchBlockCountChanged();
    });

    this.workspace.addEventListener("dragstart", (e) => {
      const block = e.target.closest(".block");
      if (!block) return;
      if (this.palette.contains(block)) return;
      this.draggedBlock = block;
      this.isFromPalette = false;
      e.dataTransfer.effectAllowed = "move";
      block.classList.add("dragging");
      block.setAttribute("aria-grabbed", "true");
    });

    this.workspace.addEventListener("dragend", (e) => {
      const block = e.target.closest(".block");
      if (!block) return;

      block.classList.remove("dragging");
      block.setAttribute("aria-grabbed", "false");

      if (this.draggedBlock) {
        const workspaceRect = this.workspace.getBoundingClientRect();
        const isOutsideWorkspace =
          e.clientX < workspaceRect.left ||
          e.clientX > workspaceRect.right ||
          e.clientY < workspaceRect.top ||
          e.clientY > workspaceRect.bottom;

        if (isOutsideWorkspace) {
          this.draggedBlock.remove();

          const placeholder = this.workspace.querySelector(
            ".workspacePlaceholder",
          );
          if (placeholder) {
            const hasBlocks =
              this.workspace.querySelectorAll(".block").length > 0;
            placeholder.style.display = hasBlocks ? "none" : "";
          }

          this.dispatchBlockCountChanged();
        }
      }

      this.draggedBlock = null;
    });
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

    targetStack.appendChild(block);

    block.classList.add("snapping");
    setTimeout(() => {
      block.classList.remove("snapping");
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
    const placeholder = this.workspace.querySelector(".workspacePlaceholder");
    if (placeholder) {
      placeholder.style.display = "";
    }
    this.dispatchBlockCountChanged();
  }
}