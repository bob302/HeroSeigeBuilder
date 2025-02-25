export default class SubSkillNode {
  id: number;
  connections: Set<number>;
  position: { x: number; y: number };
  private primary: boolean;
  level!: number;
  maxLevel!: number;
  private initial: boolean = false;
  name?: string;
  description?: string;

  constructor(
    id: number,
    x: number,
    y: number,
    primary: boolean,
    name?: string,
    description?: string,
  ) {
    this.id = id;
    this.connections = new Set();
    this.position = { x, y };
    this.level = 0;
    this.primary = primary;
    this.maxLevel = this.primary ? 3 : 5;
    this.name = name;
    this.description = description;
  }

  isMaxed() {
    return this.level === this.maxLevel;
  }

  isInitial() {
    return this.initial;
  }

  setInitial(bool: boolean) {
    this.initial = bool;
    this.maxLevel = 1;
    this.level = 1;
  }

  isPrimary() {
    return this.primary;
  }

  setPrimary(bool: boolean) {
    this.primary = bool;
  }

  addConnection(nodeId: number) {
    this.connections.add(nodeId);
  }

  removeConnection(nodeId: number) {
    this.connections.delete(nodeId);
  }
}
