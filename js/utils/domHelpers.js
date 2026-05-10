/**
 * domHelpers.js - Utilitários de manipulação DOM
 * Comentários em português do Brasil
 */

export const domHelpers = {
  updatePlaceholder(workspace) {
    const placeholder = workspace.querySelector(".workspacePlaceholder");
    if (!placeholder) return;

    const stacks = workspace.querySelectorAll(".blockStack");
    const containers = workspace.querySelectorAll(".blockContainer");
    const workspaceContent = workspace.querySelector(".workspaceContent");

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
  },

  isStartBlock(element) {
    return element.classList.contains("block--start");
  },

  getBlockCountWithoutStart(workspace) {
    const allBlocks = workspace.querySelectorAll(".block");
    return Array.from(allBlocks).filter((block) => !domHelpers.isStartBlock(block)).length;
  },

  dispatchBlockCountChanged(workspace, forceScan = false) {
    let count;
    if (forceScan) {
      count = domHelpers.getBlockCountWithoutStart(workspace);
    } else {
      const currentCount = domHelpers.getBlockCountWithoutStart(workspace);
      count = currentCount;
    }
    const event = new CustomEvent("blockCountChanged", {
      bubbles: true,
      detail: { count },
    });
    workspace.dispatchEvent(event);
  },

  clearAllDragOverClasses(workspace) {
    const allSlots = workspace.querySelectorAll(".blockSlot");
    allSlots.forEach((slot) => {
      slot.classList.remove("dragover", "dragover--valid", "dragover--invalid");
    });
  },

  clearWorkspace(workspace) {
    const stacks = workspace.querySelectorAll(".blockStack");
    stacks.forEach((stack) => stack.remove());

    const containers = workspace.querySelectorAll(".blockContainer");
    containers.forEach((container) => container.remove());

    const workspaceContent = workspace.querySelector(".workspaceContent");
    if (workspaceContent) {
      const absoluteBlocks = workspaceContent.querySelectorAll(
        ".block[style*='position: absolute']",
      );
      absoluteBlocks.forEach((block) => block.remove());

      const absoluteContainers = workspaceContent.querySelectorAll(
        ".blockContainer[style*='position: absolute']",
      );
      absoluteContainers.forEach((container) => container.remove());
    }

    domHelpers.updatePlaceholder(workspace);
    domHelpers.dispatchBlockCountChanged(workspace);
  },

  notifyBlockChanged(workspace, workspaceInstance, isDeletion = false) {
    domHelpers.updatePlaceholder(workspace);
    domHelpers.dispatchBlockCountChanged(workspace, isDeletion);
    if (workspaceInstance) {
      workspaceInstance.checkBlocks();
    }
  },
};
