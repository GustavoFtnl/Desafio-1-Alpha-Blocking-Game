/**
 * TrashZoneManager.js - Gerenciamento da lixeira
 * Comentários em português do Brasil
 */

import { domHelpers } from "../utils/domHelpers.js";

export class TrashZoneManager {
  constructor(workspace, workspaceInstance = null) {
    this.workspace = workspace;
    this.workspaceInstance = workspaceInstance;
    this.trashZone = this.workspace.querySelector(".trashZone");
  }

  activate() {
    if (this.trashZone) {
      this.trashZone.classList.add("active");
    }
  }

  deactivate() {
    if (this.trashZone) {
      this.trashZone.classList.remove("active");
      this.trashZone.classList.remove("dragover");
    }
  }

  isOver(clientX, clientY) {
    if (!this.trashZone) return false;

    const rect = this.trashZone.getBoundingClientRect();
    return (
      clientX >= rect.left &&
      clientX <= rect.right &&
      clientY >= rect.top &&
      clientY <= rect.bottom
    );
  }

  updateDragOver(isOver) {
    if (!this.trashZone) return;

    if (isOver) {
      this.trashZone.classList.add("dragover");
    } else {
      this.trashZone.classList.remove("dragover");
    }
  }

  handleDrop(element) {
    if (!this.isOver(element.getBoundingClientRect().left + 10, element.getBoundingClientRect().top + 10)) {
      return false;
    }

    element.remove();
    domHelpers.notifyBlockChanged(this.workspace, this.workspaceInstance, true);
    this.deactivate();
    return true;
  }

  refresh() {
    this.trashZone = this.workspace.querySelector(".trashZone");
  }
}