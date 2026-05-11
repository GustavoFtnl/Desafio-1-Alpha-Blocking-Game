/**
 * DragDrop.js - Gerencia eventos drag-and-drop nativos
 * Comentários em português do Brasil
 */

import { Block } from "./Block.js";
import { PositionCalculator } from "./PositionCalculator.js";
import { ContainerManager } from "./ContainerManager.js";
import { TrashZoneManager } from "./TrashZoneManager.js";
import { BlockFactory } from "./BlockFactory.js";
import { DragStateManager } from "./DragStateManager.js";
import { domHelpers } from "../utils/domHelpers.js";

export class DragDrop {
  constructor(paletteElement, workspaceElement, workspaceInstance) {
    this.palette = paletteElement;
    this.workspace = workspaceElement;
    this.workspaceInstance = workspaceInstance;
    this.mobileSidebarCloseCallback = null;

    this.state = new DragStateManager();
    this.positionCalculator = new PositionCalculator(workspaceElement);
    this.containerManager = new ContainerManager(workspaceElement, workspaceInstance);
    this.trashZoneManager = new TrashZoneManager(workspaceElement, workspaceInstance);
    this.blockFactory = new BlockFactory(workspaceElement);

    this.handleMouseMove = this.handleMouseMove.bind(this);
    this.handleMouseUp = this.handleMouseUp.bind(this);

    this.init();
  }

  init() {
    this.setupPaletteListeners();
    this.setupWorkspaceListeners();
    this.setupFreeDragListeners();
  }

  setMaxBlocks(maxBlocks) {
    this.state.setMaxBlocks(maxBlocks);
  }

  clearWorkspace() {
    domHelpers.clearWorkspace(this.workspace);
  }

  setupPaletteListeners() {
    this.palette.addEventListener("dragstart", (e) => {
      const block = e.target.closest(".block");
      if (!block) return;

      this.state.setDraggedBlock(block);
      this.state.setFromPalette(true);

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

      this.state.setDraggedBlock(null);
      this.state.setFromPalette(false);
    });
  }

  setupWorkspaceListeners() {
    this.workspace.addEventListener("dragover", (e) => {
      e.preventDefault();

      let slot = this.positionCalculator.findTargetSlot(e.target);

      if (slot) {
        e.stopPropagation();
        slot.classList.add("dragover");

        let blockType = e.dataTransfer.getData("text/plain");
        if (!blockType && this.state.getDraggedBlock()) {
          blockType = Block.getType(this.state.getDraggedBlock());
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
          canAccept = this.blockFactory.canAccept(parentBlock, blockType);
        }

        if (canAccept) {
          slot.classList.add("dragover--valid");
          slot.classList.remove("dragover--invalid");
          e.dataTransfer.dropEffect = this.state.getIsFromPalette() ? "copy" : "move";
        } else {
          slot.classList.add("dragover--invalid");
          slot.classList.remove("dragover--valid");
          e.dataTransfer.dropEffect = "none";
        }
        return;
      }

      e.dataTransfer.dropEffect = this.state.getIsFromPalette() ? "copy" : "move";
      this.workspace.classList.add("dragover");
    });

    this.workspace.addEventListener("dragleave", (e) => {
      let slot = this.positionCalculator.findTargetSlot(e.target);

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

      let slot = this.positionCalculator.findTargetSlot(e.target);

      if (slot) {
        e.stopPropagation();
        slot.classList.remove("dragover", "dragover--valid", "dragover--invalid");

        let blockType = e.dataTransfer.getData("text/plain");
        if (!blockType && this.state.getDraggedBlock()) {
          blockType = Block.getType(this.state.getDraggedBlock());
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
          canAccept = this.blockFactory.canAccept(parentBlock, blockType);
        }

        if (!canAccept) {
          return;
        }

        let blockToInsert = null;

        if (this.state.getIsFromPalette()) {
          if (this.state.getDraggedBlock()) {
            blockToInsert = this.blockFactory.cloneBlock(this.state.getDraggedBlock());
          } else if (blockType) {
            blockToInsert = this.blockFactory.createBlock(blockType);
          }
        } else {
          blockToInsert = this.state.getDraggedBlock();
        }

        if (!blockToInsert) {
          return;
        }

        this.containerManager.addBlockToSlot(slot, blockToInsert, e.clientY);
        this.state.setDraggedBlock(null);

        domHelpers.clearAllDragOverClasses(this.workspace);
        return;
      }

      this.workspace.classList.remove("dragover");

      const blockType = e.dataTransfer.getData("text/plain");
      let blockToInsert = null;

      if (this.state.getIsFromPalette()) {
        if (this.state.getDraggedBlock()) {
          blockToInsert = this.blockFactory.cloneBlock(this.state.getDraggedBlock());
        } else if (blockType) {
          blockToInsert = this.blockFactory.createBlock(blockType);
        }
      } else {
        blockToInsert = this.state.getDraggedBlock();
      }

      if (!blockToInsert) {
        console.error("Nenhum bloco válido para inserir");
        return;
      }

      const maxBlocks = this.state.getMaxBlocks();
      if (this.state.getIsFromPalette() && maxBlocks !== null) {
        const currentCount = domHelpers.getBlockCountWithoutStart(this.workspace);
        if (currentCount >= maxBlocks) {
          console.warn("Limite de blocos atingido");
          return;
        }
      }

      const workspaceRect = this.workspace.getBoundingClientRect();
      const dropX = e.clientX - workspaceRect.left;
      const dropY = e.clientY - workspaceRect.top;

      const insertionPoint = this.positionCalculator.getInsertionPoint(e.clientX, e.clientY);
      this.containerManager.addBlockToWorkspace(blockToInsert, dropX, dropY, insertionPoint);

      if (this.state.getIsFromPalette() && !domHelpers.isStartBlock(blockToInsert)) {
        domHelpers.dispatchBlockCountChanged(this.workspace);
      }

      domHelpers.clearAllDragOverClasses(this.workspace);
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
          if (containerParent && containerParent.classList.contains("blockStack")) {
            const parentBlock = parentContainer.querySelector(":scope > .block");
            if (parentBlock && Block.hasSlot(parentBlock)) {
              blockToDrag = parentContainer;
            }
          }
        }
      }

      this.state.setDraggedBlock(blockToDrag);
      this.state.setFromPalette(false);

      const parentContainerCheck = blockToDrag.closest(".blockContainer");
      this.state.setWasInContainer(parentContainerCheck !== null);

      const finalBlockType = Block.getType(
        blockToDrag.querySelector ? blockToDrag.querySelector(".block") : blockToDrag,
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

      if (this.state.getDraggedBlock() && this.workspace.contains(this.state.getDraggedBlock())) {
        this.containerManager.cleanupEmptyContainers();
        domHelpers.updatePlaceholder(this.workspace);
        if (this.workspaceInstance) {
          this.workspaceInstance.checkBlocks();
        }
      }

      domHelpers.clearAllDragOverClasses(this.workspace);
      this.state.setDraggedBlock(null);
      this.state.setWasInContainer(false);
    });
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

      this.state.setDraggedElement(elementToDrag);
      this.state.setIsDraggingFree(true);

      const dragOffsetX = e.clientX - rect.left;
      const dragOffsetY = e.clientY - rect.top;
      this.state.setDragOffset(dragOffsetX, dragOffsetY);

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

      this.trashZoneManager.activate();

      document.addEventListener("mousemove", this.handleMouseMove);
      document.addEventListener("mouseup", this.handleMouseUp);
    });
  }

  handleMouseMove(e) {
    if (!this.state.getIsDraggingFree() || !this.state.getDraggedElement()) return;

    const workspaceContent = this.workspace.querySelector(".workspaceContent");
    const contentRect = workspaceContent.getBoundingClientRect();
    const offset = this.state.getDragOffset();

    const newX = e.clientX - contentRect.left - offset.x;
    const newY = e.clientY - contentRect.top - offset.y;

    this.state.getDraggedElement().style.left = newX + "px";
    this.state.getDraggedElement().style.top = newY + "px";

    const overTrash = this.trashZoneManager.isOver(e.clientX, e.clientY);
    this.trashZoneManager.updateDragOver(overTrash);

    // Limpa classes de dragover anteriores
    domHelpers.clearAllDragOverClasses(this.workspace);

    // Verifica se está sobre um slot válido (feedback visual)
    const element = this.state.getDraggedElement();
    const blockInside = element.classList.contains("block") ? element : element.querySelector(".block");
    const blockType = blockInside ? Block.getType(blockInside) : null;

    this.state.getDraggedElement().style.visibility = "hidden";
    const allElements = document.elementsFromPoint(e.clientX, e.clientY);
    this.state.getDraggedElement().style.visibility = "";

    let targetSlot = null;
    for (const el of allElements) {
      if (el === element) continue;
      if (element.contains && element.contains(el)) continue;
      if (el.classList && el.classList.contains("blockSlot")) {
        targetSlot = el;
        break;
      }
      if (el.classList && el.classList.contains("block")) {
        const container = el.closest(".blockContainer");
        if (container && container !== element) {
          const slot = container.querySelector(".blockSlot");
          if (slot) {
            targetSlot = slot;
            break;
          }
        }
      }
    }

    if (targetSlot) {
      let parentBlock = targetSlot.previousElementSibling;
      if (!parentBlock) {
        const slotContainer = targetSlot.closest(".blockContainer");
        if (slotContainer) {
          parentBlock = slotContainer.querySelector(":scope > .block");
        }
      }

      let canAccept = false;
      if (parentBlock && blockType) {
        canAccept = this.blockFactory.canAccept(parentBlock, blockType);
      }

      if (parentBlock && blockType) {
        targetSlot.classList.add("dragover");
        if (canAccept) {
          targetSlot.classList.add("dragover--valid");
        } else {
          targetSlot.classList.add("dragover--invalid");
        }
      }
    }
  }

  handleMouseUp(e) {
    if (!this.state.getIsDraggingFree() || !this.state.getDraggedElement()) return;

    const element = this.state.getDraggedElement();
    const workspaceContent = this.workspace.querySelector(".workspaceContent");

    this.trashZoneManager.deactivate();

    element.classList.remove("dragging");
    element.classList.remove("freeDragging");
    element.style.zIndex = "";
    element.style.width = "";
    element.style.transition = "";

    const isBlockContainer = element.classList.contains("blockContainer");

    const finalLeft = element.offsetLeft;
    const finalTop = element.offsetTop;

    // 1. Verifica se soltou na lixeira
    if (this.trashZoneManager.isOver(e.clientX, e.clientY)) {
      element.remove();
      domHelpers.notifyBlockChanged(this.workspace, this.workspaceInstance, true);

      if (this.workspaceInstance) {
        this.workspaceInstance.checkBlocks();
      }

      this.cleanupDrag();
      return;
    }

    // --- INÍCIO DA CORREÇÃO: Verifica se soltou dentro de um blockSlot ---
    
    // Escondemos o elemento arrastado temporariamente para que o document.elementFromPoint 
    // consiga "enxergar" o slot que está embaixo do mouse
    const currentVisibility = element.style.visibility;
    element.style.visibility = "hidden";
    const targetUnderMouse = document.elementFromPoint(e.clientX, e.clientY);
    element.style.visibility = currentVisibility; // Restaura imediatamente

    let slot = targetUnderMouse ? this.positionCalculator.findTargetSlot(targetUnderMouse) : null;

    if (slot) {
      // Pega o tipo do bloco arrastado para checar compatibilidade
      const blockInside = element.classList.contains("block") ? element : element.querySelector(".block");
      const blockType = blockInside ? Block.getType(blockInside) : null;

      let parentBlock = slot.previousElementSibling;
      if (!parentBlock) {
        const slotContainer = slot.closest(".blockContainer");
        if (slotContainer) {
          parentBlock = slotContainer.querySelector(":scope > .block");
        }
      }

      let canAccept = false;
      if (parentBlock && blockType) {
        canAccept = this.blockFactory.canAccept(parentBlock, blockType);
      }

      if (canAccept) {
        element.style.position = "";
        element.style.left = "";
        element.style.top = "";
        
        // Insere no slot, mesma lógica usada no 'drop' nativo
        this.containerManager.addBlockToSlot(slot, element, e.clientY);
        
        this.cleanupDrag();
        return;
      }
    }
    // --- FIM DA CORREÇÃO ---

    // 2. Prepara para reinserir no workspace normalmente (Free Drag ou Snap em Stack)
    element.style.position = "absolute";
    element.style.left = finalLeft + "px";
    element.style.top = finalTop + "px";

    if (element.parentElement !== workspaceContent) {
      workspaceContent.appendChild(element);
    }

    const insertionPoint = this.positionCalculator.getInsertionPoint(e.clientX, e.clientY);

    if (insertionPoint) {
      element.style.position = "";
      element.style.left = "";
      element.style.top = "";
      this.containerManager.insertIntoStackWithSnapping(insertionPoint.stack, element, insertionPoint.referenceNode);
    } else {
      this.containerManager.processFreeDraggedElement(element, isBlockContainer, insertionPoint, finalLeft, finalTop);
    }

    this.cleanupDrag();
  }

  cleanupDrag() {
    document.removeEventListener("mousemove", this.handleMouseMove);
    document.removeEventListener("mouseup", this.handleMouseUp);

    domHelpers.clearAllDragOverClasses(this.workspace);
    this.trashZoneManager.deactivate();

    this.state.setDraggedElement(null);
    this.state.setIsDraggingFree(false);
  }

  setupMobilePalette(mobilePalette) {
    const self = this;

    mobilePalette.addEventListener("dragstart", (e) => {
      const block = e.target.closest(".block");
      if (!block) return;

      this.state.setDraggedBlock(block);
      this.state.setFromPalette(true);

      const blockType = Block.getType(block);
      e.dataTransfer.setData("text/plain", blockType);
      e.dataTransfer.effectAllowed = "copy";

      block.classList.add("dragging");
      block.setAttribute("aria-grabbed", "true");

      if (self.mobileSidebarCloseCallback) {
        self.mobileSidebarCloseCallback();
      }
    });

    mobilePalette.addEventListener("dragend", (e) => {
      const block = e.target.closest(".block");
      if (!block) return;

      block.classList.remove("dragging");
      block.setAttribute("aria-grabbed", "false");

      this.state.setDraggedBlock(null);
      this.state.setFromPalette(false);
    });
  }

  setMobileSidebarCloseCallback(callback) {
    this.mobileSidebarCloseCallback = callback;
  }
}