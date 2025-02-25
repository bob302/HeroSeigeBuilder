import BaseSkill from "./BaseSkill";
import { Point2D } from "./Point2D";
import SubSkillTree from "./SubSkillTree";

export default class CharapterSkill extends BaseSkill {
  public subSkillTree: SubSkillTree | null = null;
  public learned: boolean = false;
  public readonly requiredSkills: string[] = [];
  public readonly requiredLevel: number;
  public readonly position: Point2D;
  public readonly image: string;

  constructor(
    name: string,
    desctiption: string,
    maxLevel: number,
    position: Point2D,
    image: string,
    requiredLevel: number,
  ) {
    super(name, desctiption, maxLevel);
    this.position = position;
    this.image = image;
    this.requiredLevel = requiredLevel;
  }

  hasSubskillTree() {
    return this.subSkillTree !== null;
  }

  setSubSkillTree(subSkillTree: SubSkillTree) {
    this.subSkillTree = subSkillTree;
  }

  addRequiredSkill(skill: string) {
    this.requiredSkills.push(skill);
  }

  reset() {
    this.level = 0;
    this.learned = false;
  }

  /**
   * Creates a CharapterSkill instance from data loaded from a file.
   *
   * @param data Data retrieved from a JSON file.
   * @param index Skill index (for calculating position if position is missing).
   * @param TreeDir Directory for icons.
   */
  static fromFileData(
    data: any,
    index: number,
    treeDir: string,
  ): CharapterSkill {
    const pos: Point2D =
      data.Position &&
      typeof data.Position.x === "number" &&
      typeof data.Position.y === "number"
        ? new Point2D(data.Position.x, data.Position.y)
        : new Point2D(Math.floor(index / 3), index % 3);

    const skill = new CharapterSkill(
      data.Name,
      "",
      20,
      pos,
      `${treeDir}/${data.Icon}`,
      data["Required Level"] ? parseInt(data["Required Level"], 10) : 0,
    );

    if (data["Required Skill(s)"]) {
      data["Required Skill(s)"]
        .split(",")
        .map((s: string) => s.trim())
        .forEach((reqSkill: string) => skill.addRequiredSkill(reqSkill));
    }

    if (data.Subskills) {
      const subSkillTree = new SubSkillTree(data.Name, data.Subskills);
      skill.setSubSkillTree(subSkillTree);
    }

    return skill;
  }

  /**
   * Обновляет динамическое состояние навыка из сохранённых данных.
   * Ожидается, что state может содержать: { learned, level, subSkillTree }
   */
  applyState(state: any): void {
    if (typeof state.learned === "boolean") {
      this.learned = state.learned;
    }
    if (typeof state.level === "number") {
      this.level = state.level;
    }
    if (state.subSkillTree) {
      this.subSkillTree = SubSkillTree.deserialize(state.subSkillTree);
    }
  }

  /**
   * Сериализует динамическое состояние навыка.
   * Если навык не изучен и его уровень равен 0, сохраняется только имя.
   */
  serialize(): any {
    if (!this.learned && this.level === 0) {
      return { name: this.name };
    }
    return {
      name: this.name,
      learned: this.learned,
      level: this.level,
      subSkillTree: this.subSkillTree ? this.subSkillTree.serialize() : null,
    };
  }
}
