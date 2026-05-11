# Temple Blocks — Programação Visual

## 📋 Descrição

**Temple Blocks** é um jogo educativo que ensina lógica de programação através de um ambiente de programação visual drag-and-drop. O jogador arrasta blocos de comando (mover, pular, repetir) para formar sequências lógicas que controlam um personagem em um grid 10x10, com o objetivo de alcançar o troféu desvendando obstáculos como paredes, buracos, armadilhas e portas.

O projeto é um **MVP funcional** desenvolvido inteiramente com HTML, CSS e JavaScript puro (vanilla), sem dependências externas — incluindo sons sintetizados via Web Audio API.

### 🎯 Objetivo

Ensinar conceitos fundamentais de programação como:

- **Sequenciamento**: ordenar blocos de comando
- **Loops**: usar blocos de repetição
- **Condicionais implícitas**: desviar de obstáculos
- **Depuração**: testar, errar e corrigir sequências

## 🚀 Tecnologias

- **HTML5** — Estrutura semântica e acessível (ARIA labels)
- **CSS3** — Design System completo com variáveis CSS, Flexbox, Grid, animações e abordagem mobile-first
- **JavaScript ES6+ (Módulos)** — Arquitetura modular com `import`/`export`, orientação a objetos, async/await e eventos customizados
- **Web Audio API** — Síntese programática de efeitos sonoros (sem arquivos de áudio)

## 📂 Estrutura do Projeto

```
├── index.html              # Ponto de entrada HTML
├── AGENTS.md               # Especificação técnica do projeto
├── logicaNiveis.md         # Documentação da lógica dos níveis
├── js/
│   ├── app.js              # Orquestrador principal (App)
│   ├── config.js           # Constantes centralizadas
│   ├── dom.js              # Helpers de manipulação DOM
│   ├── state.js            # Estado global (usuários, progresso, localStorage)
│   ├── engine/
│   │   ├── parser.js       # Converte blocos do workspace em instruções
│   │   └── runner.js       # Executa instruções assincronamente
│   ├── pages/
│   │   ├── Home.js         # Tela inicial (login/registro)
│   │   ├── Game.js         # Página principal do jogo
│   │   └── Ranking.js      # Tela de ranking entre jogadores
│   ├── components/
│   │   ├── Block.js        # Fábrica e validação de blocos
│   │   ├── BlockFactory.js # Criação de blocos no workspace
│   │   ├── ContainerManager.js # Gerenciamento de containers/stack
│   │   ├── DragDrop.js     # Drag-and-drop nativo + free drag mouse
│   │   ├── DragStateManager.js # Estado do drag
│   │   ├── Modal.js        # Modal de nível/vitória
│   │   ├── PositionCalculator.js # Cálculo de posições de drop
│   │   ├── Sidebar.js      # Paleta de blocos (sidebar)
│   │   ├── Stage.js        # Grid 10x10, ator, controles
│   │   ├── Toast.js        # Notificações toast
│   │   ├── TopBar.js       # Barra superior com progresso
│   │   ├── TrashZoneManager.js # Gerenciamento da lixeira
│   │   └── Workspace.js    # Área de montagem dos blocos
│   └── utils/
│       ├── blockTooltips.js    # Textos de ajuda dos blocos
│       ├── configLevels.js     # Configuração dos 10 níveis
│       ├── domHelpers.js       # Utilitários DOM
│       ├── elementTypes.js     # Enum dos tipos de elemento do grid
│       ├── levelHints.js       # Dicas para cada nível
│       ├── SoundManager.js     # Síntese de áudio via Web Audio API
│       └── stageHelpers.js     # Renderização do grid
├── styles/
│   ├── variables.css       # Design System (cores, fontes, espaçamentos)
│   ├── reset.css           # Reset CSS
│   ├── base.css            # Estilos base
│   ├── layout.css          # Grid do layout principal
│   ├── components.css      # Estilos dos componentes (blocos, stage, etc.)
│   └── utilities.css       # Classes utilitárias
└── stitch-spec.json        # Especificação de design Stitch
```

## 🧩 Sistema de Blocos

| Bloco              | Tipo      | Função                                              |
| ------------------ | --------- | --------------------------------------------------- |
| **Início**         | Controle  | Ponto de partida da execução                        |
| **Mover**          | Movimento | Move o personagem 1 casa na direção escolhida       |
| **Pular**          | Movimento | Pula 2 casas (ignora armadilhas no meio do caminho) |
| **Direção (→←↑↓)** | Direção   | Especifica direção do movimento/pulo                |
| **Repetir**        | Controle  | Repete blocos internos N vezes (1-10)               |

## 🎮 Mecânicas do Jogo

### Grid 10x10

- Personagem começa na posição **start** (verde)
- Objetivo: chegar no **troféu** (🏆)
- **Paredes (🧱)**: bloqueiam movimento — verificadas antes de executar
- **Buracos (🕳️)**: bloqueiam movimento e pulo
- **Armadilhas (💣)**: causam falha se o personagem pisar — verificadas após movimento
- **Armadilhas de Fogo (🔥)**: alternam entre ativo/inativo a cada ação
- **Portas e Chaves (🚪🗝️)**: portas são destrancadas ao coletar a chave

### Execução

- Clique em **EXECUTAR** para rodar a sequência de blocos
- A execução é **assíncrona e cadenciada** (um comando por vez, com delay visual)
- Botões de **Pausar/Retomar** e **Limpar**
- Blocos em execução ganham destaque visual (classe `executing`)

### Sistema de Estrelas ⭐

- **3 estrelas**: usar ≤ `maxBlocks` blocos
- **2 estrelas**: usar até 1.5× `maxBlocks`
- **1 estrela**: exceder o limite

## 🧠 Níveis

São **10 níveis** crescentes em dificuldade:

1. **Arena Central** — Introdução ao movimento
2. **Corredor Interno** — Primeiras paredes
3. **Escada Diagonal** — Caminho diagonal
4. **Coluna de Buracos** — Introdução a buracos
5. **Labirinto de Buracos** — Labirinto com muitos buracos
6. **Chave do Corredor** — Mecânica de chave e porta
7. **Porta e Chave** — Múltiplas chaves e portas
8. **Campo de Fogo** — Armadilhas de fogo alternadas introduzidas
9. **Corredor em Chamas** — Fogo em corredor estreito
10. **Fortaleza Final** — Nível desafiador combinando todos os elementos

## 💾 Persistência

- `localStorage` armazena: usuários, nível atual, estrelas, blocos usados e estado do workspace
- O jogo carrega automaticamente o progresso do último usuário
- Suporte a **múltiplos usuários** com ranking

## 📱 Responsividade

- **Mobile-first**: suporte mínimo a iPhone SE (375×667)
- Layout adaptável: sidebar como overlay em mobile, stage em tela cheia
- Botões flutuantes para acessar sidebar e stage em dispositivos móveis

## 🎨 Design System

- **Cores**: tema escuro com detalhes em laranja/âmbar (`#ff9f1c`)
- **Tipografia**: Inter (Google Fonts)
- **Micro-animações**: transições suaves em blocos, drag-and-drop, execução
- **Blocos estilo puzzle**: bordas arredondadas no topo (1rem) e retas na base (0.25rem)
- **Sons**: feedback auditivo para cada ação (movimento, colisão, vitória, etc.)

## 🕹️ Como Jogar

1. Abra `index.html` em um servidor HTTP local (necessário para módulos ES6)
2. Crie ou selecione um usuário
3. Arraste blocos da biblioteca lateral para o workspace
4. Encaixe blocos de direção dentro de blocos de mover/pular
5. Use o bloco **Repetir** para loops
6. Clique em **EXECUTAR** e veja o personagem se movimentar
7. Complete o nível alcançando o troféu
8. Avance para o próximo nível e colete estrelas!

## 📦 Pré-requisitos

- Navegador web moderno (Chrome 80+, Firefox 80+, Edge 80+, Safari 14+)
- Servidor HTTP local ou Live Server do VS Code — necessário para módulos ES6

## 🔧 Como Executar

```bash
# Opção 1: VS Code Live Server
# Clique com botão direito no index.html → "Open with Live Server"

# Opção 2: Node.js (npx)
npx serve .

# Opção 3: Python
python3 -m http.server 8000
```

Depois abra `http://localhost:8000` no navegador.
