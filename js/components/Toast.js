/**
 * Toast.js - Componente reutilizável para exibir mensagens toast
 * Pode ser usado para hints de nível, avisos, notificações, etc.
 * Posicionamento: absolute, canto superior direito do workspace
 * Comentários em português do Brasil conforme AGENTS.md
 */

export class Toast {
  static currentTimeout = null;

  /**
   * Exibe uma mensagem toast
   * @param {string} message - Mensagem a ser exibida
   * @param {number} duration - Tempo em ms para o toast desaparecer (padrão: 15000). Use 0 para manter infinito
   * @param {string} icon - Emoji ou class de ícone opcional
   * @param {string} type - Tipo de toast: "info" (padrão), "success", "warning", "key"
   */
  static show(message, duration = 15000, icon = null, type = "info") {
    Toast.hide();

    const workspace = document.querySelector(".workspaceArea");
    if (!workspace) return;

    const toast = document.createElement("div");
    let className = `toast toast--${type}`;
    if (type === "key") {
      className += " keyToast";
    }
    toast.className = className;

    if (icon) {
      if (icon.startsWith(".") || icon.includes(" ")) {
        toast.innerHTML = `<span class="${icon}"></span>`;
      } else {
        toast.innerHTML = `<span class="toast__icon">${icon}</span>`;
      }
    }

    const textSpan = document.createElement("span");
    textSpan.className = "toast__text";
    textSpan.textContent = message;
    toast.appendChild(textSpan);

    workspace.appendChild(toast);

    requestAnimationFrame(() => {
      toast.classList.add("show");
    });

    // Só define timeout se duration > 0
    if (duration > 0) {
      Toast.currentTimeout = setTimeout(() => {
        Toast.hide();
      }, duration);
    }
  }

  /**
   * Oculta toasts
   * @param {boolean} includeKey - Se true, remove também toasts de chave (padrão: false)
   */
  static hide(includeKey = false) {
    if (Toast.currentTimeout) {
      clearTimeout(Toast.currentTimeout);
      Toast.currentTimeout = null;
    }

    const toasts = document.querySelectorAll(".toast");
    toasts.forEach(toast => {
      if (includeKey || !toast.classList.contains("keyToast")) {
        toast.remove();
      }
    });
  }
}

export default Toast;