/**
 * app.js - Orquestrador central da SPA
 * Comentários em português do Brasil
 */

import { TopBar } from './components/TopBar.js'
import { Sidebar } from './components/Sidebar.js'
import { Workspace } from './components/Workspace.js'
import { Stage } from './components/Stage.js'
import { DragDrop } from './components/DragDrop.js'
import { Modal } from './components/Modal.js'
import { Parser } from './engine/parser.js'
import { Runner } from './engine/runner.js'

class App {
  constructor() {
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
    
    this.currentLevel = 1
    this.stars = {}
    
    this.initComponents()
    this.loadGameState()
    this.setupEventListeners()
    this.updateUI()
  }

  initComponents() {
    const topBarContainer = document.querySelector('.topBar')
    const sidebarContainer = document.querySelector('.sidebar')
    const workspaceContainer = document.querySelector('.workspaceArea')
    const stageContainer = document.querySelector('.stageContainer')
    
    this.topBar = new TopBar(topBarContainer)
    this.sidebar = new Sidebar(sidebarContainer)
    this.workspace = new Workspace(workspaceContainer)
    this.stage = new Stage(stageContainer)
    this.modal = new Modal()
    
    this.parser = new Parser()
    this.runner = new Runner(this.stage)
    
    this.dragDrop = new DragDrop(
      this.sidebar.getPaletteElement(),
      this.workspace.getWorkspaceElement()
    )
  }

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
    }
  }

  saveGameState() {
    try {
      localStorage.setItem('alphaBlockingGame_currentLevel', this.currentLevel.toString())
      localStorage.setItem('alphaBlockingGame_stars', JSON.stringify(this.stars))
    } catch (error) {
      console.error('Erro ao salvar estado do jogo:', error)
    }
  }

  setupEventListeners() {
    const workspaceContainer = document.querySelector('.workspaceArea')
    workspaceContainer.addEventListener('blockCountChanged', (e) => {
      const maxBlocks = this.levelConfig[this.currentLevel]?.maxBlocks || 8
      this.topBar.updateBlockCounter(e.detail.count, maxBlocks)
    })
    
    const stageContainer = document.querySelector('.stageContainer')
    stageContainer.addEventListener('stageRun', () => this.runCode())
    stageContainer.addEventListener('stagePause', () => this.togglePause())
    stageContainer.addEventListener('stageClear', () => this.clearWorkspace())
    
    document.addEventListener('levelComplete', (e) => {
      if (e.detail.success) {
        this.handleLevelComplete()
      }
    })
  }

  async runCode() {
    const totalBlocks = this.parser.countBlocks()
    const maxBlocks = this.levelConfig[this.currentLevel]?.maxBlocks || 8
    
    if (totalBlocks > maxBlocks) {
      alert('Você excedeu o limite de blocos! Máximo: ' + maxBlocks + ', usados: ' + totalBlocks + '.')
    }
    
    if (this.runner.running) {
      this.runner.stop()
      await new Promise(resolve => setTimeout(resolve, 100))
    }
    
    this.stage.reset()
    
    const instructions = this.parser.parse()
    
    if (instructions.length === 0) {
      alert('Adicione blocos ao workspace antes de executar!')
      return
    }
    
    await this.runner.run(instructions)
  }

  togglePause() {
    if (this.runner.paused) {
      this.runner.resume()
    } else {
      this.runner.pause()
    }
  }

  clearWorkspace() {
    if (this.runner.running) {
      this.runner.stop()
    }
    
    this.workspace.clear()
    this.stage.reset()
  }

  handleLevelComplete() {
    const totalBlocks = this.parser.countBlocks()
    const maxBlocks = this.levelConfig[this.currentLevel]?.maxBlocks || 8
    const stars = this.calculateStars(totalBlocks, maxBlocks)
    
    this.stars[this.currentLevel] = stars
    
    if (this.currentLevel >= 10) {
      this.showGameCompleteModal(stars)
    } else {
      this.showLevelCompleteModal(stars, maxBlocks, totalBlocks)
    }
    
    this.saveGameState()
  }

  calculateStars(usedBlocks, maxBlocks) {
    if (usedBlocks <= maxBlocks) {
      const percentage = usedBlocks / maxBlocks
      if (percentage <= 0.7) {
        return 3
      } else if (percentage <= 1.0) {
        return 2
      }
    }
    return 1
  }

  async showLevelCompleteModal(stars, maxBlocks, usedBlocks) {
    const contentHtml = Modal.createLevelCompleteHtml(stars, maxBlocks, usedBlocks)
    await this.modal.open(contentHtml)
    
    const nextLevelBtn = this.modal.modalElement.querySelector('#nextLevelBtn')
    nextLevelBtn.addEventListener('click', () => {
      this.modal.close()
      this.currentLevel++
      this.updateUI()
      this.clearWorkspace()
    })
  }

  async showGameCompleteModal(finalStars) {
    const contentHtml = Modal.createGameCompleteHtml(finalStars)
    await this.modal.open(contentHtml)
    
    const restartBtn = this.modal.modalElement.querySelector('#restartCareerBtn')
    restartBtn.addEventListener('click', () => {
      this.modal.close()
      this.restartCareer()
    })
  }

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

  updateUI() {
    this.topBar.updateLevel(this.currentLevel, 10)
    
    const currentStars = this.stars[this.currentLevel] || 0
    this.topBar.updateStars(currentStars)
    
    const progress = (this.currentLevel - 1) / 10 * 100
    this.topBar.updateProgress(progress)
    
    const maxBlocks = this.levelConfig[this.currentLevel]?.maxBlocks || 8
    const totalBlocks = this.parser.countBlocks()
    this.topBar.updateBlockCounter(totalBlocks, maxBlocks)
  }
}

document.addEventListener('DOMContentLoaded', () => {
  new App()
})
