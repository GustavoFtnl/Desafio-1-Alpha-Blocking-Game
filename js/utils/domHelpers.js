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

  dispatchBlockCountChanged(workspace) {
    const event = new CustomEvent("blockCountChanged", {
      bubbles: true,
      detail: {
        count: workspace.querySelectorAll(".block").length,
      },
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

  notifyBlockChanged(workspace, workspaceInstance) {
    domHelpers.updatePlaceholder(workspace);
    domHelpers.dispatchBlockCountChanged(workspace);
    if (workspaceInstance) {
      workspaceInstance.checkBlocks();
    }
  },
};
