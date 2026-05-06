# Lógica dos Níveis - Code Blocks Game

## Visão Geral

O sistema de níveis do jogo consiste em um grid 10x10 onde o jogador deve navegar para alcançar o troféu, evitando armadilhas e paredes.

## Estrutura de Dados de um Nível

Cada nível é um objeto com a seguinte estrutura:

```javascript
{
  id: 1,
  name: "Nível 1",
  trophy: { x: 5, y: 5 },
  walls: [{ x: 1, y: 0 }, { x: 1, y: 1 }],
  traps: []
}
```

### Properties

| Property | Tipo | Descrição |
|----------|------|----------|
| `id` | number | Identificador único do nível |
| `name` | string | Nome/título exibido do nível |
| `trophy` | object | Coordenadas {x, y} do troféu |
| `walls` | array | Array de coordenadas das paredes |
| `traps` | array | Array de coordenadas das armadilhas |

## Posicionamento do Jogador

- O jogador sempre nasce na posição `(0, 0)` do grid
- Coordenadas seguem o padrão: `x` (coluna), `y` (linha)
- Grid é 10x10, válido de `[0,0]` até `[9,9]`

## Interações

### Parede (🧱)

- **Descrição**: Obstáculo sólido que bloqueia movimento
- **Comportamento**: O movimento é bloqueado ANTES de executar
- **Resultado**: O bloco "mover" não executa movimento se houver parede na direção
- **Visualização**: Emoji 🧱 na posição da parede no grid

### Armadilha (💣)

- **Descrição**: Obstáculo mortal que faz a execução falhar
- **Comportamento**: Verificação ocorre APÓS mover para a célula
- **Resultado**: Execução mostra erro (alert) e é interrompida
- **Visualização**: Emoji 💣 na posição da armadilha no grid

### Troféu (🏆)

- **Descrição**: Objetivo final do nível
- **Comportamento**: Verificação ocorre APÓS mover para a célula
- **Resultado**: Nível é concluído com sucesso
- **Visualização**: Emoji 🏆 na posição do troféu no grid

## Fluxo de Execução

```
1. Jogador posiciona bloco(s) de movimento no workspace
2. Ao clicar "Executar":
   a. Para cada bloco de movimento:
      - Verificar se há parede na direção alvo
      - Se há parede: bloco não executa, próximo bloco
      - Se não há parede: mover jogador
      - Após mover:
        * Se armadilha: falha (alert), interromper execução
        * Se troféu: nível concluído, continuar normalmente
   b. Se não há mais blocos: execução termina
```

## Detecção de Colisão

### Ordem de verificação

1. **Parede**: Verificada ANTES do movimento
2. **Armadilha**: Verificada APÓS movimento
3. **Troféu**: Verificado APÓS movimento

### Definição de "encostar"

"Encostar" significa o jogador estar na **célula atual** após executar o movimento.

## Sistema de Estrelas

- Usar a quantidade exata ou mínima de blocos: **3 estrelas**
- Usar até 70% dos blocos permitidos: **2 estrelas**
- Exceder limite: **1 estrela**

## Níveis Iniciais

### Nível 1: Introdução

- Objetivo: Ensinar movimento básico
- Parede: Nenhuma
- Armadilha: Nenhuma
- Troféu: Posição acessível diretamente

### Nível 2: Primeira Parede

- Objetivo: Ensinar desvio de parede
- Parede: Uma parede como obstáculo
- Armadilha: Nenhuma
- Troféu: Atrás da parede

### Nível 3: Primeira Armadilha

- Objetivo: Ensinar a evitar armadilhas
- Parede: Alguma(s) paredes
- Armadilha: Armadilha no caminho
- Troféu: Após desviar armadilha

## Histórico de Alterações

- **v1.0** (2025-05-06): Versão inicial com sistema de níveis manuelleados e 3 níveis