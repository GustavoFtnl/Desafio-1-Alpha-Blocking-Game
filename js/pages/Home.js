/**
 * Home.js - Página da tela inicial (home page)
 * Permite selecionar usuário existente ou criar novo usuário
 * Comentários em português do Brasil
 */

import { gameState } from "../state.js";

const Home = function(container) {
  this.container = container;
  this.render();
};

Home.prototype.render = function() {
  const hasUsers = gameState.hasUsers();
  const currentUser = gameState.getUserName();
  
  this.container.innerHTML = 
    "<div class=\"homeContainer\">" +
      "<div class=\"homeContent\">" +
        "<h1 class=\"homeTitle\">Code Blocks Game</h1>" +
        "<p class=\"homeSubtitle\">Aprenda lógica de programação com blocos!</p>" +
        
        (hasUsers ? this.renderUserSelection() : this.renderCreateFirstUser()) +
        
        "<div class=\"homeFeatures\">" +
          "<div class=\"homeFeature\">" +
            "<span class=\"material-symbols-outlined homeFeatureIcon\">drag_pan</span>" +
            "<p>Arraste blocos</p>" +
          "</div>" +
          "<div class=\"homeFeature\">" +
            "<span class=\"material-symbols-outlined homeFeatureIcon\">play_circle</span>" +
            "<p>Execute código</p>" +
          "</div>" +
          "<div class=\"homeFeature\">" +
            "<span class=\"material-symbols-outlined homeFeatureIcon\">emoji_events</span>" +
            "<p>Ganhe estrelas</p>" +
          "</div>" +
        "</div>" +
      "</div>" +
    "</div>";
};

Home.prototype.renderCreateFirstUser = function() {
  return "<form class=\"homeForm\" id=\"homeForm\">" +
    "<p class=\"homeWelcomeText\">Bem-vindo! Crie seu perfil para começar:</p>" +
    "<label class=\"homeLabel\" for=\"userNameInput\">Seu nome:</label>" +
    "<input type=\"text\" class=\"homeInput\" id=\"userNameInput\" " +
      "placeholder=\"Digite seu nome\" maxlength=\"20\" required aria-label=\"Seu nome\">" +
    "<button type=\"submit\" class=\"btn btn--run homeStartBtn\">" +
      "<span class=\"material-symbols-outlined\">play_arrow</span>" +
      "Começar" +
    "</button>" +
  "</form>";
};

Home.prototype.renderUserSelection = function() {
  const users = gameState.getUsers();
  const currentUser = gameState.getUserName();
  let optionsHtml = "";
  
  for (let i = 0; i < users.length; i++) {
    const user = users[i];
    const isCurrent = user.name === currentUser;
    optionsHtml += "<option value=\"" + this.escapeHtml(user.name) + "\"" + 
      (isCurrent ? " selected" : "") + ">" + 
      this.escapeHtml(user.name) + " (Nível " + user.level + ")</option>";
  }
  
  return "<div class=\"homeUserSection\">" +
    "<div class=\"homeUserSelectBox\">" +
      "<label class=\"homeLabel\" for=\"userSelect\">Selecione seu perfil:</label>" +
      "<select class=\"homeInput homeSelect\" id=\"userSelect\">" +
        optionsHtml +
      "</select>" +
      "<button class=\"btn btn--run homeSelectBtn\" id=\"selectUserBtn\">" +
        "<span class=\"material-symbols-outlined\">play_arrow</span>" +
        "Continuar" +
      "</button>" +
    "</div>" +
    
    "<div class=\"homeDivider\">" +
      "<span>ou</span>" +
    "</div>" +
    
    "<form class=\"homeForm\" id=\"newUserForm\">" +
      "<label class=\"homeLabel\" for=\"newUserNameInput\">Criar novo perfil:</label>" +
      "<input type=\"text\" class=\"homeInput\" id=\"newUserNameInput\" " +
        "placeholder=\"Novo nome\" maxlength=\"20\" required aria-label=\"Novo nome\">" +
      "<button type=\"submit\" class=\"btn btn--pause homeNewUserBtn\">" +
        "<span class=\"material-symbols-outlined\">add</span>" +
        "Criar" +
      "</button>" +
    "</form>" +
  "</div>";
};

Home.prototype.escapeHtml = function(text) {
  const div = document.createElement("div");
  div.textContent = text;
  return div.innerHTML;
};

Home.prototype.setupListeners = function() {
  const self = this;
  
  const form = this.container.querySelector("#homeForm");
  if (form) {
    form.addEventListener("submit", function(e) {
      e.preventDefault();
      self.handleCreateUser();
    });
  }
  
  const selectUserBtn = this.container.querySelector("#selectUserBtn");
  if (selectUserBtn) {
    selectUserBtn.addEventListener("click", function() {
      self.handleSelectUser();
    });
  }
  
  const newUserForm = this.container.querySelector("#newUserForm");
  if (newUserForm) {
    newUserForm.addEventListener("submit", function(e) {
      e.preventDefault();
      self.handleCreateNewUser();
    });
  }
};

Home.prototype.handleCreateUser = function() {
  const input = this.container.querySelector("#userNameInput");
  const name = input.value.trim();
  
  if (name.length > 0) {
    const success = gameState.createUser(name);
    if (success) {
      this.showGame();
    }
  }
};

Home.prototype.handleSelectUser = function() {
  const select = this.container.querySelector("#userSelect");
  const name = select.value;
  
  if (name) {
    gameState.switchUser(name);
    this.showGame();
  }
};

Home.prototype.handleCreateNewUser = function() {
  const input = this.container.querySelector("#newUserNameInput");
  const name = input.value.trim();
  
  if (name.length > 0) {
    const success = gameState.createUser(name);
    if (success) {
      this.showGame();
    }
  }
};

Home.prototype.showGame = function() {
  const event = new CustomEvent("showGame", { bubbles: true });
  this.container.dispatchEvent(event);
};

Home.prototype.updateUserName = function() {
  this.render();
  this.setupListeners();
};

export default Home;
export { Home };