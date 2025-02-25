export default class BaseSkill {
  public name: string;
  public description: string;
  public maxLevel: number;
  public level: number;

  constructor(name: string, description: string, maxLevel: number) {
    this.name = name;
    this.description = description;
    this.maxLevel = maxLevel;
    this.level = 0;
  }
}
