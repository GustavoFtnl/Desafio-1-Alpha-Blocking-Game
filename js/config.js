/**
 * config.js - Constantes e configurações centralizadas
 * Contém levelConfig, chaves de LocalStorage e valores padrão
 * Comentários em português do Brasil
 */

var CONFIG = {
  STORAGE_KEYS: {
    CURRENT_LEVEL: "alphaBlockingGame_currentLevel",
    STARS: "alphaBlockingGame_stars"
  },

  LEVEL_CONFIG: {
    1: { maxBlocks: 8 },
    2: { maxBlocks: 10 },
    3: { maxBlocks: 12 },
    4: { maxBlocks: 14 },
    5: { maxBlocks: 16 },
    6: { maxBlocks: 18 },
    7: { maxBlocks: 20 },
    8: { maxBlocks: 22 },
    9: { maxBlocks: 24 },
    10: { maxBlocks: 26 }
  },

  DEFAULTS: {
    CURRENT_LEVEL: 1,
    TOTAL_LEVELS: 10,
    INITIAL_STARS: 0,
    COMMAND_DELAY: 300,
    ACTOR_START_X: 4,
    ACTOR_START_Y: 4,
    ACTOR_START_DIRECTION: 0
  },

  DOM_IDS: {
    ROOT: "root",
    TOP_BAR: "topBar",
    SIDEBAR: "sidebar",
    WORKSPACE: "workspaceArea",
    STAGE: "stageContainer"
  },

  DOM_CLASSES: {
    APP_LAYOUT: "appLayout",
    BLOCK_PALETTE: "blockPalette",
    BLOCK_STACK: "blockStack",
    WORKSPACE_PLACEHOLDER: "workspacePlaceholder"
  }
};

export default CONFIG;
export { CONFIG };