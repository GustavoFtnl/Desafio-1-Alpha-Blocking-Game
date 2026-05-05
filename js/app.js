/**
 * app.js - Inicialização e listeners de botões principais
 * Integra Stage, DragDrop, Parser e Runner
 * Gerencia estado do jogo, níveis, estrelas e localStorage
 */

import { Stage } from './components/Stage.js'
import { DragDrop } from './components/DragDrop.js'
import { Parser } from './engine/parser.js'
import { Runner } from './engine/runner.js'

class App {
  constructor() {
    // Configurações dos níveis (maxBlocks por nível)
    this.levelConfig = {
      1: { maxBlocks: 8 },
      2: { maxBlocks: 10 },
      3: { maxBlocks: 12 },
      4: { maxBlocks: 14 },
      5: { maxBlocks: 16 },
      6: { maxBlocks: 18 },
      7: { maxBlocks: 20 },
      8: { maxBlocks: 22 },
      9: { maxBlocks: 24 },
      10: { maxBlocks: 26 }
    }
    
    // Estado do jogo
    this.currentLevel = 1
    this.stars = {} // {level: starCount}
    
    // Inicializa módulos
    this.stage = new Stage()
    this.dragDrop = new DragDrop()
    this.parser = new Parser()
    this.runner = new Runner(this.stage)
    
    this.init()
  }

  /**
   * Inicializa a aplicação
   */
  init() {
    this.loadGameState()
    this.setupEventListeners()
    this.updateUI()
  }

  /**
   * Carrega estado do jogo do localStorage
   */
  loadGameState() {
    try {
      const savedLevel = localStorage.getItem('alphaBlockingGame_currentLevel')
      const savedStars = localStorage.getItem('alphaBlockingGame_stars')
      
      if (savedLevel !== null) {
        this.currentLevel = parseInt(savedLevel)
      }
      
      if (savedStars !== null) {
        this.stars = JSON.parse(savedStars)
      }
    } catch (error) {
      console.error('Erro ao carregar estado do jogo:', error)
      // Mantém valores padrão
    }
  }

  /**
   * Salva estado do jogo no localStorage
   */
  saveGameState() {
    try {
      localStorage.setItem('alphaBlockingGame_currentLevel', this.currentLevel.toString())
      localStorage.setItem('alphaBlockingGame_stars', JSON.stringify(this.stars))
    } catch (error) {
      console.error('Erro ao salvar estado do jogo:', error)
    }
  }

  /**
   * Configura os event listeners principais
   */
  setupEventListeners() {
    // Botão Executar
    const runButton = document.querySelector('.btn--run')
    if (runButton) {
      runButton.addEventListener('click', () => this.runCode())
    }
    
    // Botão Pausar
    const pauseButton = document.querySelector('.btn--pause')
    if (pauseButton) {
      pauseButton.addEventListener('click', () => this.togglePause())
    }
    
    // Botão Limpar
    const clearButton = document.querySelector('.btn--clear')
    if (clearButton) {
      clearButton.addEventListener('click', () => this.clearWorkspace())
    }
    
    // Evento de conclusão de nível
    document.addEventListener('levelComplete', (e) => {
      if (e.detail.success) {
        this.handleLevelComplete()
      }
    })
  }

  /**
   * Executa o código montado no workspace
   */
  async runCode() {
    // Para execução anterior se houver
    if (this.runner.running) {
      this.runner.stop()
      await new Promise(resolve => setTimeout(resolve, 100)) // Pequeno delay
    }
    
    // Reseta o stage para posição inicial
    this.stage.reset()
    
    // Parseia o workspace
    const instructions = this.parser.parse()
    
    if (instructions.length === 0) {
      alert('Adicione blocos ao workspace antes de executar!')
      return
    }
    
    // Executa as instruções
    await this.runner.run(instructions)
  }

  /**
   * Alterna entre pausar e retomar execução
   */
  togglePause() {
    if (this.runner.paused) {
      this.runner.resume()
    } else {
      this.runner.pause()
    }
  }

  /**
   * Limpa o workspace e reseta o stage
   */
  clearWorkspace() {
    // Para execução se estiver rodando
    if (this.runner.running) {
      this.runner.stop()
    }
    
    // Limpa workspace via DragDrop
    this.dragDrop.clearWorkspace()
    
    // Reseta stage
    this.stage.reset()
  }

  /**
   * Trata a conclusão de um nível
   */
  handleLevelComplete() {
    const totalBlocks = this.parser.countBlocks()
    const maxBlocks = this.levelConfig[this.currentLevel]?.maxBlocks || 8
    
    // Calcula estrelas baseado na quantidade de blocos usados
    const stars = this.calculateStars(totalBlocks, maxBlocks)
    
    // Salva estrelas do nível
    this.stars[this.currentLevel] = stars
    
    // Verifica se zerou o jogo (completou nível 10)
    if (this.currentLevel >= 10) {
      this.showGameCompleteModal(stars)
    } else {
      this.showLevelCompleteModal(stars, maxBlocks, totalBlocks)
    }
    
    this.saveGameState()
  }

  /**
   * Calcula quantidade de estrelas (1-3)
   * @param {number} usedBlocks - Blocos usados
   * @param {number} maxBlocks - Máximo de blocos permitido
   * @returns {number} Quantidade de estrelas (1-3)
   */
  calculateStars(usedBlocks, maxBlocks) {
    if (usedBlocks <= maxBlocks) {
      // Usou menos ou igual ao máximo: 3 estrelas se <= 70%, 2 se <= 100%
      const percentage = usedBlocks / maxBlocks
      if (percentage <= 0.7) {
        return 3
      } else if (percentage <= 1.0) {
        return 2
      }
    }
    
    // Excedeu o limite: 1 estrela
    return 1
  }

  /**
   * Exibe modal de nível concluído
   * @param {number} stars - Estrelas recebidas
   * @param {number} maxBlocks - Limite do nível
   * @param {number} usedBlocks - Blocos usados
   */
  showLevelCompleteModal(stars, maxBlocks, usedBlocks) {
    const modal = document.createElement('div')
    modal.className = 'modal'
    modal.setAttribute('role', 'dialog')
    modal.setAttribute('aria-label', 'Nível concluído')
    modal.setAttribute('aria-hidden', 'false')
    
    const starsHtml = this.generateStarsHtml(stars)
    
    modal.innerHTML = `
      <div class="modal_content">
        <h2 class="modal_title">Nível Concluído! *</h2>
        <div class="modal_stars">${starsHtml}</div>
        <p>Você usou ${usedBlocks} blocos (limite: ${maxBlocks}).</p>
        <button class="btn btn--run" id="nextLevelBtn" aria-label="Avançar para próximo nível">
          Próximo Nível
        </button>
      </div>
    `
    
    document.body.appendChild(modal)
    
    // Listener para próximo nível
    const nextLevelBtn = modal.querySelector('#nextLevelBtn')
    nextLevelBtn.addEventListener('click', () => {
      modal.remove()
      this.currentLevel++
      this.updateUI()
      this.clearWorkspace()
    })
  }

  /**
   * Exibe modal de jogo zerado
   * @param {number} finalStars - Estrelas do último nível
   */
  showGameCompleteModal(finalStars) {
    const modal = document.createElement('div')
    modal.className = 'modal'
    modal.setAttribute('role', 'dialog')
    modal.setAttribute('aria-label', 'Jogo concluído')
    modal.setAttribute('aria-hidden', 'false')
    
    const starsHtml = this.generateStarsHtml(finalStars)
    
    modal.innerHTML = `
      <div class="modal_content">
        <h2 class="modal_title">Parabéns! Jogo Zerado! *</h2>
        <div class="modal_stars">${starsHtml}</div>
        <p>Você completou todos os 10 níveis!</p>
        <button class="btn btn--run" id="restartCareerBtn" aria-label="Reiniciar carreira">
          Reiniciar Carreira
        </button>
      </div>
    `
    
    document.body.appendChild(modal)
    
    // Listener para reiniciar carreira
    const restartBtn = modal.querySelector('#restartCareerBtn')
    restartBtn.addEventListener('click', () => {
      modal.remove()
      this.restartCareer()
    })
  }

  /**
   * Reinicia a carreira (limpa localStorage)
   */
  restartCareer() {
    try {
      localStorage.removeItem('alphaBlockingGame_currentLevel')
      localStorage.removeItem('alphaBlockingGame_stars')
    } catch (error) {
      console.error('Erro ao limpar localStorage:', error)
    }
    
    this.currentLevel = 1
    this.stars = {}
    this.updateUI()
    this.clearWorkspace()
  }

  /**
   * Gera HTML das estrelas para o modal
   * @param {number} starCount - Quantidade de estrelas preenchidas
   * @returns {string} HTML das estrelas
   */
  generateStarsHtml(starCount) {
    let html = ''
    for (let i = 0; i < 3; i++) {
      if (i < starCount) {
        html += '<span class="star star--filled">*</span>'
      } else {
        html += '<span class="star star--empty">*</span>'
      }
    }
    return html
  }

  /**
   * Atualiza a UI com base no estado atual
   */
  updateUI() {
    // Atualiza texto do nível
    const levelText = document.querySelector('.topBar_levelText')
    if (levelText) {
      levelText.textContent = `Nível ${this.currentLevel}/10`
    }
    
    // Atualiza estrelas na topBar
    const starRating = document.querySelector('.starRating')
    if (starRating) {
      const currentStars = this.stars[this.currentLevel] || 0
      starRating.innerHTML = this.generateStarsHtml(currentStars)
      starRating.setAttribute('aria-label', `Progresso de estrelas: ${currentStars} de 3`)
    }
    
    // Atualiza barra de progresso
    const progressFill = document.querySelector('.progressBar_fill')
    if (progressFill) {
      const progress = (this.currentLevel - 1) / 10 * 100
      progressFill.style.width = `${progress}%`
      progressFill.parentElement?.setAttribute('aria-label', `Progresso do jogo: ${progress}%`)
    }
    
    // Atualiza contador de blocos no topBar
    const blockCounter = document.querySelector('.blockCounter')
    if (blockCounter) {
      const maxBlocks = this.levelConfig[this.currentLevel]?.maxBlocks || 8
      blockCounter.innerHTML = `<span>Blocos: 0/${maxBlocks}</span>`
    }
    
    this.dragDrop.updateBlockCounter()
  }
}

// Inicializa a aplicação quando o DOM estiver pronto
document.addEventListener('DOMContentLoaded', () => {
  new App()
})
