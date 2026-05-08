/**
 * config.js - Constantes e configurações centralizadas
 * Contém levelConfig, chaves de LocalStorage e valores padrão
 * Comentários em português do Brasil
 */

const CONFIG = {
  STORAGE_KEYS: {
    CURRENT_LEVEL: "alphaBlockingGame_currentLevel",
    STARS: "alphaBlockingGame_stars",
    USER_NAME: "alphaBlockingGame_userName",
    USERS: "alphaBlockingGame_users",
    WORKSPACE_BLOCKS: "alphaBlockingGame_workspaceBlocks"
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
    10: { maxBlocks: 26 },
    11: { maxBlocks: 28 },
    12: { maxBlocks: 30 },
    13: { maxBlocks: 32 },
    14: { maxBlocks: 34 },
    15: { maxBlocks: 36 },
    16: { maxBlocks: 38 },
    17: { maxBlocks: 40 },
    18: { maxBlocks: 42 },
    19: { maxBlocks: 44 },
    20: { maxBlocks: 46 }
  },

  DEFAULTS: {
    CURRENT_LEVEL: 1,
    TOTAL_LEVELS: 20,
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