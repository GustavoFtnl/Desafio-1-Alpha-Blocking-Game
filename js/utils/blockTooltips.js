/**
 * blockTooltips.js - Descrições dos blocos para exibição em tooltips
 * Cada bloco tem uma mensagem explicativa sobre sua funcionalidade
 * descrições genéricas da i.a, passível de mudança.
 */

const BLOCK_TOOLTIPS = {
  "block--start":
    "Bloco inicial obrigatório. Todo programa começa aqui. Arraste blocos de Mover, Pular ou Repetir dentro dele para criar sua sequência de comandos.",
  "block--move":
    "Faz o personagem andar uma casa na direção escolhida. Use com os blocos de Direção (→ ← ↑ ↓) para definir o caminho.",
  "block--jump":
    "Faz o personagem pular uma casa. Útil para passar por cima de buracos, espinhos e fogo sem sofrer dano.",
  "block--direction": "Define a direção do movimento ou pulo.",
  "block--repeat":
    "Repete os blocos internos várias vezes seguidas. Ajuste a quantidade com +/-. Bom para poupar blocos na construção de sequências longas e repetitivas.",
};

export default BLOCK_TOOLTIPS;
export { BLOCK_TOOLTIPS };
