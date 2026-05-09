/**
 * elementTypes.js - Enumeração dos tipos de elementos do grid
 * Cada número representa um elemento específico na grade 10x10
 * Comentários em português do Brasil conforme AGENTS.md
 */

export const ELEMENT_TYPES = {
  EMPTY: 0,
  START: 1,
  WALL: 2,
  HOLE: 3,
  TRAP: 4,
  KEY: 5,
  DOOR: 6,
  FIRE: 7,
  TROPHY: 10
};

export const GRID_SIZE = 10;
export const GRID_LENGTH = GRID_SIZE * GRID_SIZE;