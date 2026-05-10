/**
 * BlockFactory.js - Criação e gerenciamento de blocos
 * Comentários em português do Brasil
 */

import { Block } from "./Block.js";

export class BlockFactory {
  constructor(workspace) {
    this.workspace = workspace;
  }

  createBlock(type) {
    const configs = Block.getConfigs();
    const config = configs.find((c) => c.type === type);
    if (!config) return null;

    return Block.createElement(config.text, config.icon, config.type);
  }

  cloneBlock(block) {
    return Block.clone(block);
  }

  hasSlot(element) {
    return Block.hasSlot(element);
  }

  canAccept(parentBlock, blockType) {
    return Block.canAccept(parentBlock, blockType);
  }
}