/**
 * block-tooltips.js - Descrições dos blocos para exibição em tooltips
 * Cada bloco tem uma mensagem explicativa sobre sua funcionalidade
 * Comentários em português do Brasil conforme AGENTS.md
 */

const BLOCK_TOOLTIPS = {
  "block--start":
    "Bloco inicial obrigatório. Todo programa começa aqui. Arraste blocos de Mover, Pular ou Repetir dentro dele para criar sua sequência de comandos.",
  "block--move":
    "Faz o personagem andar uma casa na direção escolhida. Use com os blocos de Direção (→ ← ↑ ↓) para definir o caminho.",
  "block--jump":
    "Faz o personagem pular uma casa. Útil para passar por cima de buracos, espinhos e fogo sem sofrer dano.",
  "block--direction":
    "Define a direção do movimento ou pulo. Pode ser: Direita (→), Esquerda (←), Cima (↑) ou Baixo (↓).",
  "block--repeat":
    "Repete os blocos internos várias vezes seguidas. Economiza blocos e simplifica o código. Ajuste a quantidade com os botões + e -.",
};

export default BLOCK_TOOLTIPS;
export { BLOCK_TOOLTIPS };
