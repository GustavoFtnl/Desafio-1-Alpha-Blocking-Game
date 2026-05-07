/**
 * config-levels.js - Configuração dos 20 níveis do jogo
 * Cada nível contém: start, trophy, walls, traps e maxBlocks
 * Grid 10x10: coordenadas de (0,0) até (9,9)
 * Comentários em português do Brasil
 */

const CONFIG_LEVELS = [
  // Nível 1: Corredor Central
  {
    id: 1,
    name: "Corredor Central",
    start: { x: 0, y: 4 },
    trophy: { x: 9, y: 4 },

    holes: [
      { x: 0, y: 0 }
    ],

    walls: [
      // Linha superior
      { x: 0, y: 3 },
      { x: 1, y: 3 },
      { x: 2, y: 3 },
      { x: 3, y: 3 },
      { x: 4, y: 3 },
      { x: 5, y: 3 },
      { x: 6, y: 3 },
      { x: 7, y: 3 },
      { x: 8, y: 3 },
      { x: 9, y: 3 },

      // Linha inferior
      { x: 0, y: 5 },
      { x: 1, y: 5 },
      { x: 2, y: 5 },
      { x: 3, y: 5 },
      { x: 4, y: 5 },
      { x: 5, y: 5 },
      { x: 6, y: 5 },
      { x: 7, y: 5 },
      { x: 8, y: 5 },
      { x: 9, y: 5 },
    ],

    traps: [],

    maxBlocks: 12,
  },

  // Nível 2: Primeira Parede
  {
    id: 2,
    name: "Primeira Parede",
    start: { x: 0, y: 0 },
    trophy: { x: 3, y: 0 },
    walls: [{ x: 1, y: 0 }],
    traps: [],
    maxBlocks: 10,
  },

  // Nível 3: Primeira Armadilha
  {
    id: 3,
    name: "Primeira Armadilha",
    start: { x: 0, y: 0 },
    trophy: { x: 3, y: 0 },
    walls: [
      { x: 1, y: 0 },
      { x: 2, y: 0 },
    ],
    traps: [{ x: 1, y: 1 }],
    maxBlocks: 12,
  },

  // Nível 4: Desvio Simples
  {
    id: 4,
    name: "Desvio Simples",
    start: { x: 0, y: 0 },
    trophy: { x: 4, y: 1 },
    walls: [
      { x: 1, y: 0 },
      { x: 2, y: 0 },
      { x: 3, y: 0 },
    ],
    traps: [],
    maxBlocks: 14,
  },

  // Nível 5: Armadilha e Parede
  {
    id: 5,
    name: "Armadilha e Parede",
    start: { x: 0, y: 0 },
    trophy: { x: 4, y: 1 },
    walls: [
      { x: 1, y: 0 },
      { x: 2, y: 0 },
    ],
    traps: [
      { x: 2, y: 1 },
      { x: 3, y: 1 },
    ],
    maxBlocks: 16,
  },

  // Nível 6: Labirinto Simples
  {
    id: 6,
    name: "Labirinto Simples",
    start: { x: 0, y: 0 },
    trophy: { x: 5, y: 2 },
    walls: [
      { x: 1, y: 0 },
      { x: 2, y: 0 },
      { x: 1, y: 1 },
      { x: 2, y: 1 },
      { x: 1, y: 2 },
    ],
    traps: [{ x: 3, y: 1 }],
    maxBlocks: 18,
  },

  // Nível 7: Caminho Alternativo
  {
    id: 7,
    name: "Caminho Alternativo",
    start: { x: 0, y: 0 },
    trophy: { x: 5, y: 2 },
    walls: [
      { x: 1, y: 0 },
      { x: 2, y: 0 },
      { x: 3, y: 0 },
      { x: 1, y: 1 },
      { x: 2, y: 1 },
      { x: 3, y: 1 },
    ],
    traps: [
      { x: 1, y: 2 },
      { x: 2, y: 2 },
    ],
    maxBlocks: 20,
  },

  // Nível 8: Armadilhas em Linha
  {
    id: 8,
    name: "Armadilhas em Linha",
    start: { x: 0, y: 0 },
    trophy: { x: 6, y: 0 },
    walls: [{ x: 3, y: 0 }],
    traps: [
      { x: 1, y: 0 },
      { x: 2, y: 0 },
      { x: 4, y: 0 },
      { x: 5, y: 0 },
    ],
    maxBlocks: 22,
  },

  // Nível 9: Sala de Troféu
  {
    id: 9,
    name: "Sala de Troféu",
    start: { x: 0, y: 0 },
    trophy: { x: 7, y: 3 },
    walls: [
      { x: 5, y: 2 },
      { x: 6, y: 2 },
      { x: 5, y: 3 },
      { x: 6, y: 3 },
      { x: 5, y: 4 },
      { x: 6, y: 4 },
    ],
    traps: [
      { x: 5, y: 1 },
      { x: 6, y: 1 },
    ],
    maxBlocks: 24,
  },

  // Nível 10: Zigzag
  {
    id: 10,
    name: "Zigzag",
    start: { x: 0, y: 0 },
    trophy: { x: 9, y: 0 },
    walls: [
      { x: 2, y: 0 },
      { x: 2, y: 1 },
      { x: 4, y: 1 },
      { x: 4, y: 2 },
      { x: 6, y: 2 },
      { x: 6, y: 3 },
    ],
    traps: [
      { x: 1, y: 1 },
      { x: 3, y: 2 },
      { x: 5, y: 3 },
    ],
    maxBlocks: 26,
  },

  // Nível 11: Corredor
  {
    id: 11,
    name: "Corredor",
    start: { x: 0, y: 0 },
    trophy: { x: 9, y: 4 },
    walls: [
      { x: 1, y: 2 },
      { x: 2, y: 2 },
      { x: 3, y: 2 },
      { x: 1, y: 3 },
      { x: 2, y: 3 },
      { x: 3, y: 3 },
    ],
    traps: [
      { x: 1, y: 1 },
      { x: 5, y: 2 },
      { x: 3, y: 4 },
    ],
    maxBlocks: 28,
  },

  // Nível 12: Ilha
  {
    id: 12,
    name: "Ilha",
    start: { x: 5, y: 5 },
    trophy: { x: 5, y: 5 },
    walls: [
      { x: 3, y: 4 },
      { x: 4, y: 4 },
      { x: 6, y: 4 },
      { x: 7, y: 4 },
      { x: 3, y: 5 },
      { x: 7, y: 5 },
      { x: 3, y: 6 },
      { x: 4, y: 6 },
      { x: 6, y: 6 },
      { x: 7, y: 6 },
    ],
    traps: [],
    maxBlocks: 30,
  },

  // Nível 13: Ponte
  {
    id: 13,
    name: "Ponte",
    start: { x: 0, y: 0 },
    trophy: { x: 9, y: 5 },
    walls: [
      { x: 2, y: 2 },
      { x: 3, y: 2 },
      { x: 2, y: 3 },
      { x: 3, y: 3 },
      { x: 2, y: 4 },
      { x: 3, y: 4 },
      { x: 6, y: 2 },
      { x: 7, y: 2 },
      { x: 6, y: 3 },
      { x: 7, y: 3 },
      { x: 6, y: 4 },
      { x: 7, y: 4 },
    ],
    traps: [
      { x: 4, y: 2 },
      { x: 5, y: 3 },
      { x: 4, y: 4 },
    ],
    maxBlocks: 32,
  },

  // Nível 14: Labirinto Médio
  {
    id: 14,
    name: "Labirinto Médio",
    start: { x: 0, y: 0 },
    trophy: { x: 8, y: 8 },
    walls: [
      { x: 1, y: 0 },
      { x: 2, y: 0 },
      { x: 3, y: 0 },
      { x: 1, y: 1 },
      { x: 3, y: 1 },
      { x: 1, y: 2 },
      { x: 2, y: 2 },
      { x: 5, y: 1 },
      { x: 5, y: 2 },
      { x: 5, y: 3 },
      { x: 7, y: 0 },
      { x: 7, y: 1 },
    ],
    traps: [
      { x: 2, y: 1 },
      { x: 4, y: 2 },
      { x: 6, y: 1 },
    ],
    maxBlocks: 34,
  },

  // Nível 15: Espiral
  {
    id: 15,
    name: "Espiral",
    start: { x: 0, y: 0 },
    trophy: { x: 4, y: 4 },
    walls: [
      { x: 1, y: 1 },
      { x: 2, y: 1 },
      { x: 3, y: 1 },
      { x: 4, y: 1 },
      { x: 1, y: 2 },
      { x: 4, y: 2 },
      { x: 1, y: 3 },
      { x: 2, y: 3 },
      { x: 3, y: 3 },
      { x: 4, y: 3 },
    ],
    traps: [
      { x: 2, y: 2 },
      { x: 3, y: 2 },
    ],
    maxBlocks: 36,
  },

  // Nível 16: Campo Minado
  {
    id: 16,
    name: "Campo Minado",
    start: { x: 0, y: 0 },
    trophy: { x: 9, y: 9 },
    walls: [],
    traps: [
      { x: 1, y: 1 },
      { x: 2, y: 2 },
      { x: 3, y: 3 },
      { x: 4, y: 4 },
      { x: 5, y: 5 },
      { x: 6, y: 6 },
      { x: 7, y: 7 },
      { x: 3, y: 1 },
      { x: 5, y: 3 },
      { x: 7, y: 5 },
      { x: 8, y: 6 },
    ],
    maxBlocks: 38,
  },

  // Nível 17: Fortaleza
  {
    id: 17,
    name: "Fortaleza",
    start: { x: 0, y: 0 },
    trophy: { x: 8, y: 5 },
    walls: [
      { x: 1, y: 1 },
      { x: 2, y: 1 },
      { x: 3, y: 1 },
      { x: 4, y: 1 },
      { x: 5, y: 1 },
      { x: 1, y: 2 },
      { x: 5, y: 2 },
      { x: 1, y: 3 },
      { x: 5, y: 3 },
      { x: 1, y: 4 },
      { x: 2, y: 4 },
      { x: 3, y: 4 },
      { x: 4, y: 4 },
      { x: 5, y: 4 },
    ],
    traps: [
      { x: 2, y: 2 },
      { x: 3, y: 2 },
      { x: 4, y: 2 },
      { x: 2, y: 3 },
      { x: 3, y: 3 },
      { x: 4, y: 3 },
    ],
    maxBlocks: 40,
  },

  // Nível 18: Caos
  {
    id: 18,
    name: "Caos",
    start: { x: 0, y: 0 },
    trophy: { x: 9, y: 9 },
    walls: [
      { x: 0, y: 2 },
      { x: 2, y: 0 },
      { x: 2, y: 3 },
      { x: 4, y: 0 },
      { x: 4, y: 4 },
      { x: 6, y: 2 },
      { x: 6, y: 5 },
      { x: 8, y: 3 },
    ],
    traps: [
      { x: 1, y: 1 },
      { x: 2, y: 1 },
      { x: 3, y: 2 },
      { x: 5, y: 1 },
      { x: 5, y: 3 },
      { x: 5, y: 5 },
      { x: 7, y: 1 },
      { x: 7, y: 4 },
      { x: 7, y: 5 },
    ],
    maxBlocks: 42,
  },

  // Nível 19: Labirinto Grande
  {
    id: 19,
    name: "Labirinto Grande",
    start: { x: 0, y: 0 },
    trophy: { x: 9, y: 9 },
    walls: [
      { x: 1, y: 1 },
      { x: 2, y: 1 },
      { x: 3, y: 1 },
      { x: 1, y: 2 },
      { x: 5, y: 1 },
      { x: 6, y: 1 },
      { x: 1, y: 3 },
      { x: 3, y: 3 },
      { x: 4, y: 3 },
      { x: 1, y: 4 },
      { x: 2, y: 4 },
      { x: 3, y: 4 },
      { x: 5, y: 3 },
      { x: 5, y: 4 },
      { x: 5, y: 5 },
      { x: 7, y: 3 },
      { x: 7, y: 4 },
      { x: 7, y: 5 },
      { x: 8, y: 5 },
    ],
    traps: [
      { x: 2, y: 2 },
      { x: 4, y: 2 },
      { x: 6, y: 3 },
      { x: 6, y: 4 },
      { x: 8, y: 4 },
    ],
    maxBlocks: 44,
  },

  // Nível 20: Desafio Final
  {
    id: 20,
    name: "Desafio Final",
    start: { x: 0, y: 0 },
    trophy: { x: 9, y: 9 },
    walls: [
      { x: 1, y: 0 },
      { x: 2, y: 0 },
      { x: 3, y: 0 },
      { x: 1, y: 1 },
      { x: 4, y: 1 },
      { x: 1, y: 2 },
      { x: 4, y: 2 },
      { x: 1, y: 3 },
      { x: 2, y: 3 },
      { x: 3, y: 3 },
      { x: 6, y: 0 },
      { x: 7, y: 0 },
      { x: 8, y: 0 },
      { x: 6, y: 1 },
      { x: 7, y: 1 },
      { x: 6, y: 2 },
      { x: 9, y: 2 },
      { x: 8, y: 3 },
      { x: 9, y: 3 },
      { x: 6, y: 4 },
      { x: 7, y: 4 },
      { x: 3, y: 5 },
      { x: 4, y: 5 },
      { x: 5, y: 6 },
      { x: 6, y: 6 },
    ],
    traps: [
      { x: 1, y: 4 },
      { x: 2, y: 4 },
      { x: 5, y: 0 },
      { x: 5, y: 1 },
      { x: 5, y: 2 },
      { x: 8, y: 1 },
      { x: 9, y: 1 },
      { x: 7, y: 2 },
      { x: 8, y: 2 },
      { x: 5, y: 3 },
      { x: 6, y: 3 },
      { x: 3, y: 4 },
      { x: 4, y: 4 },
      { x: 4, y: 6 },
      { x: 5, y: 7 },
      { x: 7, y: 7 },
      { x: 8, y: 7 },
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
 * Obtém todos os níveis disponíveis
 * @returns {Array} Array com todas as configurações de nível
 */
function getAllLevels() {
  return CONFIG_LEVELS;
}

export default CONFIG_LEVELS;
export { getLevelConfig, getAllLevels };
