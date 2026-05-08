/**
 * PositionCalculator.js - Cálculo de posição e snap
 * Comentários em português do Brasil
 */

export class PositionCalculator {
  constructor(workspace, SNAP_THRESHOLD = 40) {
    this.workspace = workspace;
    this.SNAP_THRESHOLD = SNAP_THRESHOLD;
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

  getInsertionPoint(clientX, clientY) {
    const workspaceContent = this.workspace.querySelector(".workspaceContent");
    if (!workspaceContent) return null;

    const stacks = workspaceContent.querySelectorAll(".blockStack");
    const allBlocks = workspaceContent.querySelectorAll(".block, .blockContainer");

    let nearestStack = null;
    let minDistance = this.SNAP_THRESHOLD;

    for (const stack of stacks) {
      const rect = stack.getBoundingClientRect();
      if (clientX >= rect.left - 20 && clientX <= rect.right + 20) {
        if (clientY >= rect.top - 20 && clientY <= rect.bottom + 20) {
          nearestStack = stack;
          break;
        }
        const distance = Math.abs(clientY - rect.bottom);
        if (distance < minDistance) {
          minDistance = distance;
          nearestStack = stack;
        }
      }
    }

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

    const children = nearestStack.querySelectorAll(
      ":scope > .block, :scope > .blockContainer",
    );
    let referenceNode = null;

    for (const child of children) {
      const rect = child.getBoundingClientRect();
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

  getClientCoordinatesRelativeToWorkspace(clientX, clientY) {
    const workspaceContent = this.workspace.querySelector(".workspaceContent");
    if (!workspaceContent) return { x: 0, y: 0 };

    const contentRect = workspaceContent.getBoundingClientRect();
    return {
      x: clientX - contentRect.left,
      y: clientY - contentRect.top,
    };
  }
}