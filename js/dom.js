/**
 * dom.js - Gerenciador de DOM e renderização visual
 * Centraliza toda a criação de elementos HTML e atualizações visuais
 * Comentários em português do Brasil
 */

import CONFIG from "./config.js";
import { gameState } from "./state.js";

const DOM = {
  init: function() {
    this.ensureRootElement();
    this.renderAppLayout();
  },

  ensureRootElement: function() {
    let root = document.getElementById(CONFIG.DOM_IDS.ROOT);
    if (!root) {
      root = document.createElement("div");
      root.id = CONFIG.DOM_IDS.ROOT;
      document.body.appendChild(root);
    }
    return root;
  },

  renderAppLayout: function() {
    const root = document.getElementById(CONFIG.DOM_IDS.ROOT);
    if (!root) return;

    root.innerHTML = "<header class=\"" + CONFIG.DOM_IDS.TOP_BAR + "\"></header>" +
      "<main class=\"" + CONFIG.DOM_CLASSES.APP_LAYOUT + "\">" +
      "<aside class=\"" + CONFIG.DOM_IDS.SIDEBAR + "\"></aside>" +
      "<section class=\"" + CONFIG.DOM_IDS.WORKSPACE + "\"></section>" +
      "<aside class=\"" + CONFIG.DOM_IDS.STAGE + "\"></aside>" +
      "</main>";
  },

  getElement: function(id) {
    if (id.startsWith(".")) {
      return document.querySelector(id);
    }
    return document.getElementById(id) || document.querySelector(id);
  },

  getTopBarContainer: function() {
    return document.querySelector("." + CONFIG.DOM_IDS.TOP_BAR);
  },

  getSidebarContainer: function() {
    return document.querySelector("." + CONFIG.DOM_IDS.SIDEBAR);
  },

  getWorkspaceContainer: function() {
    return document.querySelector("." + CONFIG.DOM_IDS.WORKSPACE);
  },

  getStageContainer: function() {
    return document.querySelector("." + CONFIG.DOM_IDS.STAGE);
  },

  updateUIFromState: function() {
    const topBar = this.getTopBarContainer();
    if (topBar && topBar.componentInstance) {
      topBar.componentInstance.updateLevel(gameState.getCurrentLevel(), gameState.getTotalLevels());
      topBar.componentInstance.updateStars(gameState.getStarsForLevel(gameState.getCurrentLevel()));
      topBar.componentInstance.updateProgress(gameState.getProgressPercent());
    }

    const stage = this.getStageContainer();
    if (stage && stage.componentInstance) {
      stage.componentInstance.setMaxBlocks(gameState.getMaxBlocks());
      stage.componentInstance.updateTitle(gameState.getCurrentLevel());
    }
  },

  clearWorkspaceVisual: function() {
    const workspace = this.getWorkspaceContainer();
    if (!workspace) return;

    const placeholder = workspace.querySelector("." + CONFIG.DOM_CLASSES.WORKSPACE_PLACEHOLDER);
    if (placeholder) {
      placeholder.style.display = "none";
    }

    const stacks = workspace.querySelectorAll("." + CONFIG.DOM_CLASSES.BLOCK_STACK);
    stacks.forEach(function(stack) { stack.remove(); });
  },

  restoreWorkspacePlaceholder: function() {
    const workspace = this.getWorkspaceContainer();
    if (!workspace) return;

    const blocks = workspace.querySelectorAll(".block");
    const placeholder = workspace.querySelector("." + CONFIG.DOM_CLASSES.WORKSPACE_PLACEHOLDER);
    if (placeholder && blocks.length === 0) {
      placeholder.style.display = "";
    }
  },

  setData: function(key, value) {
    const root = document.getElementById(CONFIG.DOM_IDS.ROOT);
    if (root) {
      root.dataset[key] = value;
    }
  },

  getData: function(key) {
    const root = document.getElementById(CONFIG.DOM_IDS.ROOT);
    return root ? root.dataset[key] : null;
  }
};

export default DOM;
export { DOM };