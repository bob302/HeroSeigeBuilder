import SubSkillNode from "./SubskillNode";

export default class SubSkillTree {
  public nodes: Map<number, SubSkillNode>;
  public name?: string;
  public points: number = 20

  static readonly graph: Record<
    number,
    {
      connections: number[];
      position: { x: number; y: number };
      primary: boolean;
    }
  > = {
      1: { connections: [2, 3], position: { x: 4.5, y: 8.5 }, primary: true },
      2: { connections: [6, 1], position: { x: 3.75, y: 6.5 }, primary: false },
      3: { connections: [8, 1], position: { x: 5.25, y: 6.5 }, primary: false },
      4: { connections: [5, 11], position: { x: 1, y: 5 }, primary: true },
      5: { connections: [6, 4], position: { x: 2.125, y: 5 }, primary: false },
      6: {
        connections: [7, 11, 5, 2],
        position: { x: 3.25, y: 5 },
        primary: false,
      },
      7: { connections: [6, 8], position: { x: 4.5, y: 5 }, primary: false },
      8: {
        connections: [7, 12, 9, 3],
        position: { x: 5.75, y: 5 },
        primary: false,
      },
      9: { connections: [10, 8], position: { x: 6.875, y: 5 },
        primary: false },
      10: { connections: [12, 9], position: { x: 8, y: 5 }, primary: true },
      11: {
        connections: [4, 14, 6, 13],
        position: { x: 2.875, y: 3.75 },
        primary: false,
      },
      12: {
        connections: [8, 13, 15, 10],
        position: { x: 6.125, y: 3.75 },
        primary: false,
      },
      13: {
        connections: [11, 12, 14, 15],
        position: { x: 4.5, y: 2.5 },
        primary: false,
      },
      14: {
        connections: [11, 13],
        position: { x: 2.125, y: 1.25 },
        primary: true,
      },
      15: {
        connections: [13, 12],
        position: { x: 6.875, y: 1.25 },
        primary: true,
      },
    };
  /**
   * If a treeData object is passed, then for each node in the graph
   * we try to find the corresponding name by its id (key as a string).
   *
   * @param treeData An object with keys id and values-node names.
   */
  constructor(name?: string, treeData?: Record<string, any>) {
    this.nodes = new Map();
    this.name = name;

    for (const [id, data] of Object.entries(SubSkillTree.graph)) {
      const nodeId = Number(id);
      const { connections, position, primary } = data;

      if (!this.nodes.has(nodeId)) {
        const node = new SubSkillNode(nodeId, position.x, position.y, primary);
        if (nodeId === 1) {
          node.setInitial(true);
        }

        if (treeData) {
          if (nodeId === 1) {
            node.name = name;
          } else {
            const nodeInfo = treeData.find((entry: any) => entry.id === nodeId);
            node.name = nodeInfo.name;
            node.description = nodeInfo.description;
          }
        }

        this.nodes.set(nodeId, node);
      }

      connections.forEach((connId) => {
        if (!this.nodes.has(connId)) {
          const connData = SubSkillTree.graph[connId];
          const node = new SubSkillNode(
            connId,
            connData.position.x,
            connData.position.y,
            connData.primary,
          );
          if (treeData) {
            const nodeInfo = treeData.find((entry: any) => entry.id === connId);
            node.name = nodeInfo.name;
            node.description = nodeInfo.description;
          }
          this.nodes.set(connId, node);
        }
        this.nodes.get(nodeId)?.addConnection(connId);
      });
    }
  }

  canLearnSkill(nodeId: number): [boolean, string] {
    if (nodeId === 1 || nodeId === 2 || nodeId === 3) {
        return [true, "This is an Initial Node"];
    }

    
    const node = this.nodes.get(nodeId);

    if (!node || node.level >= node.maxLevel) return [false, "This none is already at its maximum level."];

    if (!node) {
        return [false, "Node not found"];
    }

    if (node.isPrimary()) {
        const hasPrimaryNodeLeveled = Array.from(this.nodes.values()).some(
            (n) => n.isPrimary() && !n.isInitial() && n.id !== nodeId && n.level > 0
        );

        if (hasPrimaryNodeLeveled) {
            return [false, "Another primary node is already leveled"];
        }
    }

    const hasConnectedNode = Array.from(node.connections).some(
        (connId) => this.nodes.get(connId)!.level >= 2
    );

    if (!hasConnectedNode) {
        return [false, "No connected node with required level"];
    }

    return [true, "Can learn skill"];
  }


  learnSkill(nodeId: number): boolean {
    const node = this.nodes.get(nodeId);
    if (this.points <= 0) return false;
    if (!this.canLearnSkill(nodeId)[0]) return false;

    node!.level++;
    this.points--;
    return true;
  }

  reset() {
    this.nodes.forEach(node => {
      if (!node.isInitial()) node.level = 0
    })

    this.points = 20
  }

  /**
   * Serializes the current tree state into an object containing binary masks.
   *
   * We create:
   * - `levelMasks`: an array of 5 numbers. For each threshold (levels 1 to 5), the bit for node (id-1)
   *   is set if node.level >= threshold.
   * - `primaryMask`: a bit mask for nodes that are currently marked as primary.
   * - `initialMask`: a bit mask for nodes that are marked as initial.
   */
  serialize(): any {
    let hasLearnedSkills = false;
    const levelMasks = [0, 0, 0, 0, 0];
    let primaryMask = 0;
    let initialMask = 0;
    const points = this.points;

    for (const node of this.nodes.values()) {
      if (node.level > 0 && !node.isInitial()) hasLearnedSkills = true;
      const bit = 1 << (node.id - 1);
      for (let lvl = 1; lvl <= 5; lvl++) {
        if (node.level >= lvl) {
          levelMasks[lvl - 1] |= bit;
        }
      }
      if (node.isPrimary()) primaryMask |= bit;
      if (node.isInitial()) initialMask |= bit;
    }

    return hasLearnedSkills ? { levelMasks, primaryMask, initialMask, points } : null;
  }

  /**
   * Reconstructs a SubSkillTree from a serialized state.
   *
   * It creates a new SubSkillTree (which already builds the fixed graph) and then
   * applies the saved levels and flags based on the provided binary masks.
   */
  static deserialize(data: any): SubSkillTree {
    const tree = new SubSkillTree();
    const { levelMasks, primaryMask, initialMask, points } = data;

    tree.points = points
    
    for (const node of tree.nodes.values()) {
      const bit = 1 << (node.id - 1);
      let level = 0;

      for (let i = 0; i < levelMasks.length; i++) {
        if (levelMasks[i] & bit) {
          level = i + 1;
        }
      }

      if (initialMask & bit) {
        node.setInitial(true);
      } else {
        node.level = level;
        // Update primary flag based on the saved mask.
        const isPrimary = (primaryMask & bit) !== 0;
        node.setPrimary(isPrimary);
        // Also update maxLevel (unless the node is initial) according to our rules.
        node.maxLevel = node.isPrimary() ? 3 : 5;
      }
    }
    return tree;
  }
}
