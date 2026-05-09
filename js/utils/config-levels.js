/**
 * config-levels.js - Configuração dos 20 níveis do jogo
 * Cada nível contém: id, name, grid (array numérico 100 elementos), maxBlocks
 * Grid 10x10: índices de 0 a 99 (y * 10 + x)
 * Comentários em português do Brasil
 */

import { ELEMENT_TYPES } from "./elementTypes.js";

const CONFIG_LEVELS = [
  // Nível 1: Corredor Central
  {
    id: 1,
    name: "Corredor Central",
    grid: [
      2, 2, 2, 2, 2, 2, 2, 2, 2, 2,
      2, 0, 0, 0, 0, 0, 0, 0, 0, 2,
      2, 0, 0, 0, 0, 0, 0, 0, 0, 2,
      2, 0, 0, 1, 0, 0, 0, 0, 0, 2,
      2, 0, 0, 10, 0, 0, 0, 0, 0, 2,
      2, 0, 0, 0, 0, 0, 0, 0, 0, 2,
      2, 0, 0, 0, 0, 0, 0, 0, 0, 2,
      2, 0, 0, 0, 0, 0, 0, 0, 0, 2,
      2, 0, 0, 0, 0, 0, 0, 0, 0, 2,
      2, 2, 2, 2, 2, 2, 2, 2, 2, 2,
    ],
    maxBlocks: 12,
  },

  // Nível 2: Caminho Tortuoso
  {
    id: 2,
    name: "Caminho Tortuoso",
    grid: [
      2, 2, 2, 2, 2, 2, 2, 2, 2, 2,
      2, 0, 0, 0, 0, 0, 0, 0, 0, 2,
      2, 0, 0, 0, 0, 0, 0, 0, 0, 2,
      2, 0, 2, 2, 2, 3, 2, 2, 2, 2,
      2, 0, 2, 2, 2, 0, 0, 2, 2, 2,
      2, 0, 2, 2, 2, 2, 2, 2, 2, 2,
      2, 0, 2, 2, 2, 2, 2, 2, 0, 10,
      2, 2, 2, 2, 2, 2, 2, 2, 2, 2,
      2, 0, 0, 0, 0, 0, 0, 0, 0, 2,
      2, 1, 0, 0, 0, 0, 0, 0, 0, 2,
    ],
    maxBlocks: 25,
  },

  // Nível 3: Descida Perigosa
  {
    id: 3,
    name: "Descida Perigosa",
    grid: [
      2, 4, 4, 0, 2, 2, 2, 2, 2, 2,
      2, 4, 4, 0, 2, 0, 2, 2, 2, 2,
      2, 4, 0, 0, 2, 0, 2, 2, 2, 2,
      2, 2, 2, 2, 2, 2, 2, 2, 2, 2,
      2, 0, 0, 2, 2, 2, 0, 2, 2, 2,
      2, 0, 0, 0, 2, 0, 0, 2, 2, 2,
      2, 0, 2, 2, 2, 0, 2, 2, 10, 2,
      2, 0, 2, 0, 2, 3, 2, 2, 2, 2,
      2, 0, 2, 2, 2, 2, 2, 2, 2, 2,
      2, 2, 2, 2, 2, 2, 2, 2, 2, 2,
    ],
    maxBlocks: 35,
  },

  // Nível 4: Fortaleza Explosiva
  {
    id: 4,
    name: "Fortaleza Explosiva",
    grid: [
      2, 4, 4, 2, 2, 2, 2, 2, 2, 2,
      2, 4, 4, 2, 2, 2, 2, 2, 2, 2,
      2, 4, 4, 2, 2, 2, 2, 2, 2, 2,
      2, 4, 4, 2, 2, 2, 2, 2, 2, 2,
      2, 4, 4, 2, 2, 2, 2, 2, 2, 2,
      2, 4, 4, 2, 2, 2, 2, 2, 2, 2,
      2, 0, 0, 0, 4, 0, 4, 0, 0, 2,
      2, 0, 0, 0, 4, 0, 4, 0, 10, 2,
      2, 0, 0, 0, 4, 0, 4, 0, 0, 2,
      2, 2, 2, 2, 2, 2, 2, 2, 2, 2,
    ],
    maxBlocks: 30,
  },

  // Nível 5: Trilha Explosiva e Bloqueada
  {
    id: 5,
    name: "Trilha Explosiva e Bloqueada",
    grid: [
      2, 2, 2, 2, 2, 2, 2, 2, 2, 3,
      2, 0, 0, 0, 0, 0, 0, 0, 0, 3,
      2, 0, 2, 2, 0, 3, 0, 2, 0, 3,
      2, 3, 0, 2, 2, 3, 3, 0, 0, 3,
      2, 3, 2, 0, 5, 0, 0, 2, 0, 3,
      2, 4, 4, 4, 4, 4, 4, 4, 4, 4,
      2, 3, 2, 0, 2, 0, 2, 0, 3, 3,
      2, 2, 2, 0, 2, 0, 2, 6, 2, 2,
      2, 0, 0, 0, 0, 0, 0, 0, 0, 2,
      2, 2, 2, 2, 2, 2, 2, 2, 10, 2,
    ],
    maxBlocks: 40,
  },

  // Nível 6: Labirinto Simples
  {
    id: 6,
    name: "Labirinto Simples",
    grid: [
      2, 2, 2, 0, 0, 0, 0, 0, 0, 0,
      2, 2, 2, 0, 4, 0, 0, 0, 0, 0,
      2, 2, 2, 2, 2, 2, 7, 0, 0, 0,
      2, 0, 0, 0, 0, 0, 0, 0, 0, 0,
      2, 0, 0, 0, 0, 0, 0, 0, 0, 0,
      2, 0, 0, 0, 0, 0, 0, 0, 0, 0,
      2, 0, 0, 0, 0, 0, 0, 0, 0, 0,
      2, 0, 0, 0, 0, 0, 0, 0, 0, 0,
      2, 0, 0, 0, 0, 0, 0, 0, 0, 0,
      2, 0, 0, 0, 0, 0, 0, 0, 10, 0,
    ],
    maxBlocks: 18,
  },

  // Nível 7: Caminho Alternativo
  {
    id: 7,
    name: "Caminho Alternativo",
    grid: [
      2, 2, 2, 2, 0, 0, 0, 0, 0, 0,
      2, 2, 2, 2, 0, 4, 4, 0, 0, 0,
      2, 2, 2, 2, 0, 4, 4, 0, 10, 0,
      2, 0, 0, 0, 0, 0, 0, 0, 0, 0,
      2, 0, 0, 0, 0, 0, 0, 0, 0, 0,
      2, 0, 0, 0, 0, 0, 0, 0, 0, 0,
      2, 0, 0, 0, 0, 0, 0, 0, 0, 0,
      2, 0, 0, 0, 0, 0, 0, 0, 0, 0,
      2, 0, 0, 0, 0, 0, 0, 0, 0, 0,
      2, 1, 0, 0, 0, 0, 0, 0, 0, 0,
    ],
    maxBlocks: 20,
  },

  // Nível 8: Armadilhas em Linha
  {
    id: 8,
    name: "Armadilhas em Linha",
    grid: [
      2, 4, 4, 2, 4, 4, 0, 0, 0, 10,
      2, 0, 0, 2, 0, 0, 0, 0, 0, 0,
      2, 0, 0, 2, 0, 0, 0, 0, 0, 0,
      2, 0, 0, 2, 0, 0, 0, 0, 0, 0,
      2, 0, 0, 2, 0, 0, 0, 0, 0, 0,
      2, 0, 0, 2, 0, 0, 0, 0, 0, 0,
      2, 0, 0, 2, 0, 0, 0, 0, 0, 0,
      2, 0, 0, 2, 0, 0, 0, 0, 0, 0,
      2, 0, 0, 2, 0, 0, 0, 0, 0, 0,
      2, 1, 0, 2, 0, 0, 0, 0, 0, 0,
    ],
    maxBlocks: 22,
  },

  // Nível 9: Sala de Troféu
  {
    id: 9,
    name: "Sala de Troféu",
    grid: [
      2, 0, 0, 0, 0, 0, 0, 0, 0, 0,
      2, 0, 0, 0, 0, 4, 4, 0, 0, 0,
      2, 0, 0, 0, 0, 2, 2, 0, 0, 0,
      2, 0, 0, 0, 0, 2, 2, 10, 0, 0,
      2, 0, 0, 0, 0, 2, 2, 0, 0, 0,
      2, 0, 0, 0, 0, 0, 0, 0, 0, 0,
      2, 0, 0, 0, 0, 0, 0, 0, 0, 0,
      2, 0, 0, 0, 0, 0, 0, 0, 0, 0,
      2, 0, 0, 0, 0, 0, 0, 0, 0, 0,
      2, 1, 0, 0, 0, 0, 0, 0, 0, 0,
    ],
    maxBlocks: 24,
  },

  // Nível 10: Zigzag
  {
    id: 10,
    name: "Zigzag",
    grid: [
      2, 4, 2, 0, 0, 0, 2, 0, 0, 10,
      2, 0, 2, 0, 4, 0, 2, 0, 0, 0,
      2, 0, 2, 2, 0, 0, 2, 0, 0, 0,
      2, 0, 0, 2, 0, 4, 2, 0, 0, 0,
      2, 0, 0, 2, 2, 0, 2, 0, 0, 0,
      2, 0, 0, 0, 2, 0, 0, 0, 0, 0,
      2, 0, 0, 0, 2, 0, 0, 0, 0, 0,
      2, 0, 0, 0, 2, 0, 0, 0, 0, 0,
      2, 0, 0, 0, 2, 0, 0, 0, 0, 0,
      2, 1, 0, 0, 2, 0, 0, 0, 0, 0,
    ],
    maxBlocks: 26,
  },

  // Nível 11: Corredor
  {
    id: 11,
    name: "Corredor",
    grid: [
      2, 0, 0, 0, 0, 0, 0, 0, 0, 0,
      2, 0, 4, 0, 0, 0, 0, 0, 0, 0,
      2, 2, 2, 2, 0, 4, 2, 2, 2, 2,
      2, 2, 2, 2, 0, 0, 2, 2, 2, 2,
      2, 0, 0, 0, 0, 4, 0, 0, 0, 10,
      2, 0, 0, 0, 0, 0, 0, 0, 0, 0,
      2, 0, 0, 0, 0, 0, 0, 0, 0, 0,
      2, 0, 0, 0, 0, 0, 0, 0, 0, 0,
      2, 0, 0, 0, 0, 0, 0, 0, 0, 0,
      2, 1, 0, 0, 0, 0, 0, 0, 0, 0,
    ],
    maxBlocks: 28,
  },

  // Nível 12: Ilha
  {
    id: 12,
    name: "Ilha",
    grid: [
      2, 2, 2, 2, 2, 2, 2, 2, 2, 2,
      2, 0, 0, 0, 0, 0, 0, 0, 0, 2,
      2, 0, 2, 2, 0, 0, 2, 2, 0, 2,
      2, 0, 2, 0, 0, 0, 0, 2, 0, 2,
      2, 0, 2, 0, 10, 0, 0, 2, 0, 2,
      2, 0, 2, 0, 1, 0, 0, 2, 0, 2,
      2, 0, 2, 2, 0, 0, 2, 2, 0, 2,
      2, 0, 0, 0, 0, 0, 0, 0, 0, 2,
      2, 0, 0, 0, 0, 0, 0, 0, 0, 2,
      2, 2, 2, 2, 2, 2, 2, 2, 2, 2,
    ],
    maxBlocks: 30,
  },

  // Nível 13: Ponte
  {
    id: 13,
    name: "Ponte",
    grid: [
      2, 0, 0, 0, 0, 0, 0, 0, 0, 0,
      2, 0, 2, 2, 0, 0, 2, 2, 0, 0,
      2, 0, 2, 2, 0, 4, 2, 2, 0, 0,
      2, 0, 2, 2, 4, 0, 2, 2, 0, 0,
      2, 0, 2, 2, 0, 4, 2, 2, 0, 0,
      2, 0, 0, 0, 0, 0, 0, 0, 0, 10,
      2, 0, 0, 0, 0, 0, 0, 0, 0, 0,
      2, 0, 0, 0, 0, 0, 0, 0, 0, 0,
      2, 0, 0, 0, 0, 0, 0, 0, 0, 0,
      2, 1, 0, 0, 0, 0, 0, 0, 0, 0,
    ],
    maxBlocks: 32,
  },

  // Nível 14: Labirinto Médio
  {
    id: 14,
    name: "Labirinto Médio",
    grid: [
      2, 2, 2, 2, 0, 2, 2, 2, 0, 0,
      2, 2, 2, 2, 0, 2, 2, 2, 0, 0,
      2, 2, 4, 2, 0, 2, 4, 2, 0, 0,
      2, 2, 0, 2, 0, 2, 0, 2, 0, 0,
      2, 2, 2, 2, 0, 2, 2, 2, 0, 0,
      2, 0, 0, 0, 0, 0, 0, 0, 0, 0,
      2, 0, 0, 0, 0, 0, 0, 0, 0, 0,
      2, 0, 0, 0, 0, 0, 0, 0, 0, 0,
      2, 0, 0, 0, 0, 0, 0, 0, 0, 10,
      2, 1, 0, 0, 0, 0, 0, 0, 0, 0,
    ],
    maxBlocks: 34,
  },

  // Nível 15: Espiral
  {
    id: 15,
    name: "Espiral",
    grid: [
      2, 2, 2, 2, 2, 2, 2, 2, 2, 2,
      2, 0, 0, 0, 0, 0, 0, 0, 0, 2,
      2, 0, 2, 2, 2, 2, 2, 2, 0, 2,
      2, 0, 2, 4, 4, 0, 2, 2, 0, 2,
      2, 0, 2, 2, 10, 0, 2, 2, 0, 2,
      2, 0, 2, 2, 0, 0, 2, 2, 0, 2,
      2, 0, 2, 2, 2, 2, 2, 2, 0, 2,
      2, 0, 0, 0, 0, 0, 0, 0, 0, 2,
      2, 0, 0, 0, 0, 0, 0, 0, 0, 2,
      2, 1, 2, 2, 2, 2, 2, 2, 2, 2,
    ],
    maxBlocks: 36,
  },

  // Nível 16: Campo Minado
  {
    id: 16,
    name: "Campo Minado",
    grid: [
      2, 0, 0, 0, 0, 0, 0, 0, 0, 0,
      2, 4, 0, 4, 0, 0, 0, 0, 0, 0,
      2, 0, 4, 0, 0, 4, 0, 0, 0, 0,
      2, 4, 0, 4, 0, 0, 4, 0, 0, 0,
      2, 0, 0, 0, 4, 0, 0, 4, 0, 0,
      2, 0, 0, 4, 0, 0, 4, 0, 4, 0,
      2, 0, 0, 0, 0, 4, 0, 0, 4, 0,
      2, 0, 0, 0, 4, 0, 0, 4, 0, 0,
      2, 0, 0, 0, 0, 0, 4, 0, 0, 0,
      2, 1, 0, 0, 0, 0, 0, 0, 0, 10,
    ],
    maxBlocks: 38,
  },

  // Nível 17: Fortaleza
  {
    id: 17,
    name: "Fortaleza",
    grid: [
      2, 2, 2, 2, 2, 2, 2, 2, 2, 2,
      2, 2, 4, 4, 4, 2, 0, 0, 0, 2,
      2, 2, 4, 4, 4, 2, 0, 10, 0, 2,
      2, 2, 4, 4, 4, 2, 0, 0, 0, 2,
      2, 2, 2, 2, 2, 2, 0, 0, 0, 2,
      2, 0, 0, 0, 0, 0, 0, 0, 0, 2,
      2, 0, 0, 0, 0, 0, 0, 0, 0, 2,
      2, 0, 0, 0, 0, 0, 0, 0, 0, 2,
      2, 0, 0, 0, 0, 0, 0, 0, 0, 2,
      2, 1, 0, 0, 0, 0, 0, 0, 0, 2,
    ],
    maxBlocks: 40,
  },

  // Nível 18: Caos
  {
    id: 18,
    name: "Caos",
    grid: [
      2, 0, 2, 0, 2, 0, 2, 0, 2, 0,
      2, 4, 2, 4, 2, 4, 2, 4, 2, 0,
      2, 0, 2, 0, 2, 0, 2, 0, 2, 0,
      2, 4, 0, 4, 2, 4, 0, 4, 2, 0,
      2, 0, 2, 0, 2, 0, 2, 0, 2, 0,
      2, 4, 2, 4, 2, 4, 2, 4, 2, 0,
      2, 0, 0, 0, 2, 0, 2, 0, 2, 0,
      2, 4, 0, 4, 0, 4, 0, 4, 2, 0,
      2, 0, 2, 0, 2, 0, 0, 0, 0, 10,
      2, 1, 2, 0, 2, 0, 2, 0, 2, 0,
    ],
    maxBlocks: 42,
  },

  // Nível 19: Labirinto Grande
  {
    id: 19,
    name: "Labirinto Grande",
    grid: [
      2, 2, 2, 2, 0, 2, 2, 2, 0, 0,
      2, 2, 4, 2, 0, 2, 2, 2, 0, 0,
      2, 2, 0, 2, 4, 2, 0, 2, 0, 0,
      2, 2, 2, 2, 0, 2, 4, 2, 0, 0,
      2, 2, 4, 4, 0, 2, 2, 2, 4, 0,
      2, 0, 0, 0, 0, 2, 2, 2, 0, 0,
      2, 0, 0, 0, 0, 2, 2, 2, 0, 0,
      2, 0, 0, 0, 0, 2, 2, 2, 0, 0,
      2, 0, 0, 0, 0, 0, 0, 0, 0, 10,
      2, 1, 0, 0, 0, 0, 0, 0, 0, 0,
    ],
    maxBlocks: 44,
  },

  // Nível 20: Desafio Final
  {
    id: 20,
    name: "Desafio Final",
    grid: [
      2, 2, 2, 2, 4, 2, 2, 2, 2, 0,
      2, 2, 2, 4, 4, 2, 2, 2, 4, 4,
      2, 2, 2, 4, 4, 2, 2, 4, 4, 2,
      2, 2, 2, 2, 4, 2, 2, 4, 2, 2,
      2, 4, 4, 2, 2, 2, 2, 2, 2, 2,
      2, 2, 2, 2, 2, 0, 2, 2, 2, 2,
      2, 0, 0, 0, 0, 4, 2, 4, 0, 0,
      2, 0, 0, 0, 0, 0, 2, 0, 4, 4,
      2, 0, 0, 0, 0, 0, 2, 0, 0, 0,
      2, 1, 0, 0, 0, 0, 2, 0, 0, 10,
    ],
    maxBlocks: 46,
  },
];

/**
 * Obtém a configuração de um nível específico
 * @param {number} levelId - ID do nível (1-20)
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
    maxBlocks: level.maxBlocks,
    ...parseGridToElements(level.grid),
  };
}

export default CONFIG_LEVELS;
export { getLevelConfig, getLevelConfigOriginal, parseGridToElements };
export { ELEMENT_TYPES, GRID_SIZE, GRID_LENGTH } from "./elementTypes.js";