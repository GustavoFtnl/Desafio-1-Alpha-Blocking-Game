/**
 * configLevels.js - Configuração dos 10 níveis do jogo
 * Cada nível contém: id, name, grid (array numérico 100 elementos)
 * Grid 10x10: índices de 0 a 99 (y * 10 + x)
 * Comentários em português do Brasil
 */

import { ELEMENT_TYPES } from "./elementTypes.js";

const CONFIG_LEVELS = [
  // Nível 1: Corredor Central
  {
    id: 1,
    name: "Arena Central",

    grid: [
      2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2,
      2, 2, 2, 2, 2, 2, 0, 0, 0, 0, 0, 0, 0, 0, 2, 2, 0, 0, 0, 0, 0, 0, 0, 0, 2,
      2, 0, 1, 0, 0, 0, 0, 10, 0, 2, 2, 0, 0, 0, 0, 0, 0, 0, 0, 2, 2, 2, 2, 2,
      2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2,
      2,
    ],
  },

  // Nível 2: Caminho Tortuoso
  {
    id: 2,
    name: "Corredor Interno",

    grid: [
      2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 0, 0, 0, 1, 0, 0, 2, 2, 2, 2, 0, 0, 0,
      0, 0, 0, 2, 2, 2, 2, 0, 2, 2, 2, 2, 2, 2, 2, 2, 2, 0, 0, 0, 0, 0, 0, 2, 2,
      2, 2, 0, 0, 0, 0, 0, 0, 2, 2, 2, 2, 0, 0, 0, 0, 10, 0, 2, 2, 2, 2, 0, 0,
      0, 0, 0, 0, 2, 2, 2, 2, 0, 0, 0, 0, 0, 0, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2,
      2,
    ],
  },

  // Nível 3: Descida Perigosa
  {
    id: 3,
    name: "Escada Diagonal",

    grid: [
      2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 1, 0, 2, 2, 2, 2, 2, 2, 2, 2, 0, 0, 0, 2,
      2, 2, 2, 2, 2, 2, 2, 0, 0, 0, 2, 2, 2, 2, 2, 2, 2, 2, 0, 0, 0, 2, 2, 2, 2,
      2, 2, 2, 2, 0, 0, 0, 2, 2, 2, 2, 2, 2, 2, 2, 0, 0, 0, 2, 2, 2, 2, 2, 2, 2,
      2, 0, 0, 0, 2, 2, 2, 2, 2, 2, 2, 2, 0, 10, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2,
      2,
    ],
  },

  // Nível 4: Fortaleza Explosiva
  {
    id: 4,
    name: "Coluna de Buracos",

    grid: [
      2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2,
      2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2,

      2, 0, 0, 0, 3, 0, 0, 0, 0, 2, 2, 0, 1, 0, 3, 0, 0, 10, 0, 2, 2, 0, 0, 0,
      3, 0, 0, 0, 0, 2,

      2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2,
      2, 2, 2, 2, 2,
    ],
  },

  // Nível 5: Trilha Explosiva e Bloqueada
  {
    id: 5,
    name: "Labirinto de Buracos",

    grid: [
      2, 2, 2, 2, 2, 3, 0, 3, 0, 10, 2, 2, 2, 2, 2, 3, 3, 3, 3, 0, 2, 2, 2, 2,
      2, 3, 0, 0, 3, 2, 2, 2, 2, 2, 2, 3, 3, 3, 3, 2, 2, 2, 2, 2, 2, 3, 3, 0, 0,
      2, 2, 2, 2, 2, 2, 3, 3, 3, 3, 2, 2, 3, 3, 3, 3, 3, 0, 3, 0, 2, 2, 3, 3, 3,
      0, 3, 0, 3, 3, 2, 3, 3, 0, 3, 0, 3, 3, 3, 3, 2, 1, 3, 0, 3, 3, 3, 2, 2, 2,
      2,
    ],
  },

  // Nível 6: Caminho Alternativo
  {
    id: 6,
    name: "Porta e Chave",

    grid: [
      2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2,
      2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2,

      2, 2, 2, 5, 2, 2, 2, 2, 2, 2, 2, 1, 0, 0, 0, 0, 6, 0, 10, 2,

      2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2,
      2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2,
    ],
  },

  // Nível 7 Sala de Troféu
  {
    id: 7,
    name: "Chave do Corredor",

    grid: [
      2, 2, 2, 2, 2, 2, 2, 2, 2, 2,

      2, 1, 6, 10, 2, 5, 0, 0, 2, 2,

      2, 0, 2, 2, 2, 2, 2, 0, 0, 2, 2, 0, 6, 0, 0, 0, 0, 6, 0, 2, 2, 0, 2, 2, 2,
      2, 2, 0, 0, 2, 2, 0, 2, 2, 2, 2, 2, 0, 2, 2,

      2, 0, 2, 2, 2, 2, 2, 0, 0, 2, 2, 0, 2, 2, 2, 2, 2, 2, 0, 2,

      2, 0, 3, 0, 3, 0, 3, 0, 0, 2,

      2, 2, 2, 2, 2, 2, 2, 2, 2, 2,
    ],

    maxBlocks: 26,
  },

  // Nível 8: Armadilhas em Linha
  {
    id: 8,
    name: "Corredor em Chamas",

    grid: [
      2, 2, 2, 2, 2, 2, 2, 2, 2, 2,

      2, 7, 7, 7, 0, 0, 0, 7, 10, 2,

      2, 7, 7, 7, 0, 7, 7, 7, 7, 2,

      2, 7, 7, 7, 0, 7, 7, 7, 7, 2,

      2, 7, 7, 7, 0, 7, 7, 7, 7, 2,

      2, 7, 7, 7, 0, 7, 7, 7, 7, 2,

      2, 7, 7, 7, 0, 7, 7, 7, 7, 2,

      2, 7, 7, 7, 0, 7, 7, 7, 7, 2,

      2, 1, 0, 0, 0, 7, 7, 7, 7, 2,

      2, 2, 2, 2, 2, 2, 2, 2, 2, 2,
    ],

    maxBlocks: 28,
  },

  // Nível 9: Labirinto Simples
  {
    id: 9,
    name: "Campo de Fogo",

    grid: [
      2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 7, 7, 7, 7, 7, 7, 2, 2, 2, 7, 7, 7, 7,
      7, 10, 7, 7, 2, 2, 7, 7, 7, 7, 7, 0, 7, 7, 2, 2, 7, 7, 7, 7, 7, 7, 7, 7,
      2, 2, 7, 7, 7, 7, 7, 7, 7, 7, 2, 2, 7, 0, 0, 0, 7, 0, 7, 7, 2, 2, 1, 0, 7,
      0, 0, 0, 7, 7, 2, 2, 2, 7, 7, 7, 7, 7, 7, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2,
      2,
    ],
  },

  // Nível 10: Zigzag
  {
    id: 10,
    name: "Fortaleza Final",

    grid: [
      // y = 0
      2, 2, 2, 2, 2, 2, 2, 2, 2, 2,

      // y = 1
      2, 1, 0, 7, 7, 0, 0, 0, 5, 2,

      // y = 2
      2, 3, 0, 2, 2, 2, 7, 2, 2, 2,

      // y = 3
      2, 0, 0, 0, 4, 0, 7, 2, 0, 2,

      // y = 4
      2, 7, 2, 0, 2, 0, 0, 7, 7, 2,

      // y = 5
      2, 0, 2, 0, 2, 2, 2, 2, 7, 2,

      // y = 6
      2, 0, 2, 7, 0, 0, 0, 2, 7, 2,

      // y = 7
      2, 0, 2, 2, 2, 7, 2, 2, 6, 2,

      // y = 8
      2, 0, 3, 3, 0, 7, 7, 7, 10, 2,

      // y = 9
      2, 2, 2, 2, 2, 2, 2, 2, 2, 2,
    ],

    maxBlocks: 42,
  },
];

/**
 * Obtém a configuração de um nível específico
 * @param {number} levelId - ID do nível (1-10)
 * @returns {Object|null} Configuração do nível ou null se não existir
 */
function getLevelConfig(levelId) {
  return CONFIG_LEVELS.find((level) => level.id === levelId) || null;
}

/**
 * Converte o grid numérico para formato de objetos (usado internamente)
 * @param {number[]} grid - Array numérico do nível
 * @returns {Object} Objeto com arrays de coordenadas para cada tipo de elemento
 */
function parseGridToElements(grid) {
  const elements = {
    start: { x: 0, y: 0 },
    trophy: { x: 0, y: 0 },
    walls: [],
    holes: [],
    traps: [],
    keys: [],
    doors: [],
    fireTraps: [],
  };

  for (let i = 0; i < grid.length; i++) {
    const x = i % 10;
    const y = Math.floor(i / 10);
    const cellType = grid[i];

    switch (cellType) {
      case ELEMENT_TYPES.START:
        elements.start = { x, y };
        break;
      case ELEMENT_TYPES.TROPHY:
        elements.trophy = { x, y };
        break;
      case ELEMENT_TYPES.WALL:
        elements.walls.push({ x, y });
        break;
      case ELEMENT_TYPES.HOLE:
        elements.holes.push({ x, y });
        break;
      case ELEMENT_TYPES.TRAP:
        elements.traps.push({ x, y });
        break;
      case ELEMENT_TYPES.KEY:
        elements.keys.push({ x, y });
        break;
      case ELEMENT_TYPES.DOOR:
        elements.doors.push({ x, y });
        break;
      case ELEMENT_TYPES.FIRE:
        elements.fireTraps.push({ x, y });
        break;
    }
  }

  return elements;
}

/**
 * Obtém a configuração do nível no formato original (compatibilidade)
 * @param {number} levelId - ID do nível
 * @returns {Object|null} Configuração no formato original com start, trophy, walls, etc.
 */
function getLevelConfigOriginal(levelId) {
  const level = getLevelConfig(levelId);
  if (!level) return null;

  return {
    id: level.id,
    name: level.name,
    ...parseGridToElements(level.grid),
  };
}

export default CONFIG_LEVELS;
export { getLevelConfig, getLevelConfigOriginal, parseGridToElements };
export { ELEMENT_TYPES, GRID_SIZE, GRID_LENGTH } from "./elementTypes.js";
