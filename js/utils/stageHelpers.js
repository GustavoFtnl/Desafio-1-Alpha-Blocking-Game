/**
 * stageHelpers.js - Funções utilitárias para manipulação do grid do Stage
 * AJuda a reduzir código repetitivo em Stage.js
 * Comentários em português do Brasil conforme AGENTS.md
 */

/**
 * Limpa todas as classes e conteúdo das células do grid
 * @param {Array} cells - Array de elementos de células
 * @param {Array} classNames - Array de nomes de classes para remover
 */
export function clearGridCells(cells, classNames) {
  cells.forEach(cell => {
    cell.innerHTML = "";
    cell.classList.remove(...classNames);
  });
}

/**
 * Renderiza elementos genéricos no grid (walls, holes, traps, keys, doors)
 * @param {Array} cells - Array de elementos de células
 * @param {Array} elements - Array de elementos {x, y} para renderizar
 * @param {string} className - Classe CSS a ser adicionada
 * @param {number} gridSize - Tamanho do grid
 */
export function renderElementsToGrid(cells, elements, className, gridSize) {
  elements.forEach(element => {
    const index = element.y * gridSize + element.x;
    const cell = cells[index];
    if (cell) {
      cell.classList.add(className);
    }
  });
}

/**
 * Renderiza elementos que precisam de estado (fogo ativo/inativo)
 * @param {Array} cells - Array de elementos de células
 * @param {Array} elements - Array de elementos {x, y} para renderizar
 * @param {string} className - Classe CSS base
 * @param {number} gridSize - Tamanho do grid
 * @param {boolean} isActive - Se o elemento está ativo
 * @param {string} activeClass - Classe para estado ativo
 */
export function renderElementWithState(cells, elements, className, gridSize, isActive, activeClass) {
  elements.forEach(element => {
    const index = element.y * gridSize + element.x;
    const cell = cells[index];
    if (cell) {
      cell.classList.add(className);
      if (isActive) {
        cell.classList.add(activeClass);
      } else {
        cell.classList.remove(activeClass);
      }
    }
  });
}

/**
 * Calcula o índice da célula a partir de coordenadas x, y
 * @param {number} x - Coordenada X
 * @param {number} y - Coordenada Y
 * @param {number} gridSize - Tamanho do grid
 * @returns {number} Índice da célula
 */
export function getCellIndex(x, y, gridSize) {
  return y * gridSize + x;
}

/**
 * Renderiza o ator em uma célula específica
 * @param {Array} cells - Array de elementos de células
 * @param {number} x - Coordenada X do ator
 * @param {number} y - Coordenada Y do ator
 * @param {number} gridSize - Tamanho do grid
 * @param {string} actorIcon - Emoji ou HTML do ícone do ator
 */
export function renderActor(cells, x, y, gridSize, actorIcon = '<span class="actorIcon">🤠</span>') {
  const index = getCellIndex(x, y, gridSize);
  const cell = cells[index];
  if (cell) {
    cell.classList.add("actorCell", "visited", "current");
    cell.innerHTML = actorIcon;
  }
}

/**
 * Limpa a marcação de ator de todas as células
 * @param {Array} cells - Array de elementos de células
 */
export function clearActorFromCells(cells) {
  cells.forEach(cell => {
    if (cell.classList.contains("actorCell")) {
      cell.innerHTML = "";
      cell.classList.remove("actorCell");
    }
  });
}

/**
 * Limpa a marcação 'current' de uma célula específica
 * @param {Array} cells - Array de elementos de células
 * @param {number} x - Coordenada X
 * @param {number} y - Coordenada Y
 * @param {number} gridSize - Tamanho do grid
 */
export function clearCurrentFromCell(cells, x, y, gridSize) {
  const index = getCellIndex(x, y, gridSize);
  const cell = cells[index];
  if (cell) {
    cell.classList.remove("current");
  }
}

/**
 * Renderiza o troféu no grid
 * @param {Array} cells - Array de elementos de células
 * @param {Object} trophy - Objeto {x, y} com posição do troféu
 * @param {number} gridSize - Tamanho do grid
 */
export function renderTrophy(cells, trophy, gridSize) {
  const index = getCellIndex(trophy.x, trophy.y, gridSize);
  const cell = cells[index];
  if (cell) {
    cell.classList.add("hasTrophy");
    cell.innerHTML = '<span class="cellIcon">🏆</span>';
  }
}

/**
 * Classes CSS para limpar o grid
 */
export const GRID_CLEAR_CLASSES = [
  "hasWall", "hasHole", "hasDoor", "hasKey", "hasTrap", "hasFireTrap", "hasTrophy", 
  "actorCell", "visited", "current", "open"
];