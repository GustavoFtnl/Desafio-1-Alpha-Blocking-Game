/**
 * DragStateManager.js - Gerenciamento de estado de drag
 * Comentários em português do Brasil
 */

export class DragStateManager {
  constructor() {
    this.draggedBlock = null;
    this.isFromPalette = false;
    this.maxBlocks = null;
    this.wasInContainer = false;
    this.isDraggingFree = false;
    this.dragOffsetX = 0;
    this.dragOffsetY = 0;
    this.draggedElement = null;
  }

  setDraggedBlock(block) {
    this.draggedBlock = block;
  }

  getDraggedBlock() {
    return this.draggedBlock;
  }

  setFromPalette(isFromPalette) {
    this.isFromPalette = isFromPalette;
  }

  getIsFromPalette() {
    return this.isFromPalette;
  }

  setMaxBlocks(maxBlocks) {
    this.maxBlocks = maxBlocks;
  }

  getMaxBlocks() {
    return this.maxBlocks;
  }

  setWasInContainer(wasInContainer) {
    this.wasInContainer = wasInContainer;
  }

  getWasInContainer() {
    return this.wasInContainer;
  }

  setIsDraggingFree(isDraggingFree) {
    this.isDraggingFree = isDraggingFree;
  }

  getIsDraggingFree() {
    return this.isDraggingFree;
  }

  setDragOffset(x, y) {
    this.dragOffsetX = x;
    this.dragOffsetY = y;
  }

  getDragOffset() {
    return { x: this.dragOffsetX, y: this.dragOffsetY };
  }

  setDraggedElement(element) {
    this.draggedElement = element;
  }

  getDraggedElement() {
    return this.draggedElement;
  }

  reset() {
    this.draggedBlock = null;
    this.isFromPalette = false;
    this.isDraggingFree = false;
    this.dragOffsetX = 0;
    this.dragOffsetY = 0;
    this.draggedElement = null;
  }

  isDragging() {
    return this.draggedBlock !== null || this.isDraggingFree;
  }
}