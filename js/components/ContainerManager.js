/**
 * ContainerManager.js - Gerenciamento de containers e slots
 * Comentários em português do Brasil
 */

import { Block } from "./Block.js";
import { domHelpers } from "../utils/domHelpers.js";
import { SoundManager } from "../utils/SoundManager.js";

export class ContainerManager {
  constructor(workspace, workspaceInstance = null) {
    this.workspace = workspace;
    this.workspaceInstance = workspaceInstance;
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

  insertIntoStackWithSnapping(stack, element, referenceNode = null) {
    if (referenceNode) {
      stack.insertBefore(element, referenceNode);
    } else {
      stack.appendChild(element);
    }

    element.classList.add("snapping");
    SoundManager.playSnap();
    setTimeout(() => {
      element.classList.remove("snapping");
    }, 200);
  }

  addBlockToSlot(slot, block, clientY) {
    let elementToInsert = block;

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

    let referenceNode = null;
    if (clientY !== undefined) {
      const children = slot.querySelectorAll(
        ":scope > .block, :scope > .blockContainer",
      );
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
    SoundManager.playSnap();
    setTimeout(() => {
      elementToInsert.classList.remove("snapping");
    }, 200);

    const realBlock = elementToInsert.classList.contains("blockContainer")
      ? elementToInsert.querySelector(".block")
      : elementToInsert;
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
    domHelpers.notifyBlockChanged(this.workspace, this.workspaceInstance);
  }

  addBlockToWorkspace(block, dropX, dropY, insertionPoint = null) {
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
      this.insertIntoStackWithSnapping(
        insertionPoint.stack,
        elementToInsert,
        insertionPoint.referenceNode,
      );
    } else {
      this.ensureInStack(elementToInsert, dropX, dropY);
    }

    const realBlock = elementToInsert.classList.contains("blockContainer")
      ? elementToInsert.querySelector(".block")
      : elementToInsert;
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
    SoundManager.playSnap();
    setTimeout(() => {
      elementToInsert.classList.remove("snapping");
    }, 200);

    domHelpers.updatePlaceholder(this.workspace);
  }

  processFreeDraggedElement(element, isBlockContainer, insertionPoint, dropX, dropY) {
    const workspaceContent = this.workspace.querySelector(".workspaceContent");
    const hasAbsolutePosition = element.style.position === "absolute";

    if (hasAbsolutePosition) {
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
      SoundManager.playSnap();
      setTimeout(() => {
        element.classList.remove("snapping");
      }, 200);

      domHelpers.notifyBlockChanged(this.workspace, this.workspaceInstance);
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
        this.ensureInStack(element, dropX, dropY);
      } else if (isDirection) {
        this.ensureInStack(element, dropX, dropY);
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

        this.ensureInStack(container, dropX, dropY);
      } else {
        this.ensureInStack(element, dropX, dropY);
      }

      domHelpers.notifyBlockChanged(this.workspace, this.workspaceInstance);
    }
  }
}