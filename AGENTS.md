# AGENTS.md

Desenvolver um MVP funcional de um ambiente de programação visual (estilo drag-and-drop),
onde blocos lógicos podem ser encaixados para executar ações em um ambiente gameficado. Programado com HTML, CSS e JavaScript PURO

## Stack

- Apenas HTML5, CSS3, ES6+ — sem frameworks
- Aplicação em SPA, utilizando módulos JS para renderização da DOM.

## Regras Principais da aplicação

- Blocos se encaixam para formar pilhas lógicas.
- Execução é assíncrona/cadenciada (um comando por vez).
- O jogador recebe de 1 a 3 estrelas a cada nível baseado na quantidade de blocos ele usou para completar um nível.
- Cada nível tem limite de `maxBlocks` — excedeu → 1 estrela.
- `localStorage` armazena nível atual e estrelas.
- Arquitetura modular e separação de concerns (Engine vs. UI)
- Design System com feedback visual (gamificação)
- Lógica de fila de execução (assincronicidade em JS)

### Regras do Jogo

- **Limite de Blocos:** Cada nível possui um `maxBlocks`. Se o jogador usar mais blocos que o permitido, ele recebe apenas 1 estrela.
- **Persistência:** O jogo deve carregar automaticamente o nível onde o usuário parou na última sessão.
- **Condição de Vitória:** Ao completar o nível 10, o jogo exibe um modal de "Zerar" e oferece o botão "Reiniciar Carreira" (limpa o `localStorage`).

## Instruções para o agente

- Responder sempre em português do Brasil
- Comentários no código sempre em português do Brasil
- Explicar o porquê das soluções técnicas
- Priorizar JavaScript, HTML e CSS puro (vanilla)
- Não utilizar bibliotecas
- SEMPRE usar MCP quando precisar acessar arquivos e fazer a comunicação com o Stitch

## Regras Técnicas

- **Interno:** Tudo que é lógica:
  - **variáveis, funções, IDs, classes:** em **Inglês**
  - **comentários:** em**Português do Brasil (pt-BR)**
- **Externo:** Nomes de arquivos e pastas devem ser em **Inglês**.
- **Padrão de Nomenclatura:** camelCase para funções/variáveis (`calcularTotal`), kebab-case para arquivos (`arquivo-projeto`)e PascalCase para Classes (`BlocoProgramacao`).
- Código altamente modular e reutilizável.
- Separação clara de responsabilidades (UI vs. Lógica).
- Experiência do usuário (UX) premium com micro-animações e responsividade.
- Design System robusto baseado em variáveis CSS.

### JavaScript

- **Módulos:** Use `import`/`export` obrigatoriamente.
- Tente sempre fazer edições mínimas no código, e me pergunte caso for editar arquivos fora do escopo da mudança.
- **Igualdade:** SEMPRE utilize `===`.
- **Variáveis:** SEMPRE usar `const`, usar `let` quando necessário, NUNCA usar `var`.
- **Resiliência:** `try/catch` em todas as operações de I/O (API, LocalStorage).
- Separação clara entre controle de DOM (posicionamento dos blocos) e Efeitos na UI (stage rodando)
- Use aspas duplas em strings simples

### CSS

- **Variáveis CSS:** Centralize cores, fontes, espaçamentos e bordas em um arquivo `design-system.css`.
- **Mobile-first:** Inicie o estilo para telas menores e use Media Queries para expansão. Toda aplicação deve ser construída suportando a resolução mínima do **iPhone SE (375x667)**.
- Priorize o uso de display flexbox e display grid, evite usar configurações de margin.

### HTML

- NUNCA usar scripts ou style inline.
- SEMPRE fechar tags, mesmo as que não são obrigatórias.
- Usar tags semânticas.
- SEMPRE usar aria-labels para acessibilidade.
- SEMPRE usar camelCase para nomes de id's e classes.
