import BaseSkill from "./BaseSkill";
import { Point2D } from "./Point2D";
import SubSkillTree from "./SubSkillTree";

export default class CharapterSkill extends BaseSkill {
  public subSkillTree: SubSkillTree | null = null
  public learned: boolean = false;
  public readonly requiredSkills: string[] = [];
  public readonly requiredLevel: number
  public readonly position: Point2D
  public readonly image: string

  constructor(name: string, desctiption: string, maxLevel: number, position: Point2D, image: string, requiredLevel: number) {
    super(name, desctiption, maxLevel)
    this.position = position
    this.image = image
    this.requiredLevel = requiredLevel
  }

  setSubSkillTree(subSkillTree: SubSkillTree) {
    this.subSkillTree = subSkillTree
  }

  addRequiredSkill(skill: string) {
    this.requiredSkills.push(skill)
  }

  reset() {
    this.level = 0
    this.learned = false
  }

   /**
   * Serializes this skill into a plain object suitable for JSON.
   */
   serialize(): any {
    return {
      // BaseSkill properties
      name: this.name,
      description: this.description,
      maxLevel: this.maxLevel,
      level: this.level,
      // CharapterSkill properties
      learned: this.learned,
      requiredLevel: this.requiredLevel,
      position: { x: this.position.x, y: this.position.y },
      image: this.image,
      requiredSkills: this.requiredSkills,
      // Serialize the sub-skill tree if available
      subSkillTree: this.subSkillTree ? this.subSkillTree.serialize() : null,
    };
  }

  /**
   * Deserializes a plain object into a CharapterSkill instance.
   * Assumes that SubSkillTree provides a static deserialize() method.
   */
  static deserialize(data: any): CharapterSkill {
    const position = new Point2D(data.position.x, data.position.y);
    const skill = new CharapterSkill(
      data.name,
      data.description,
      data.maxLevel,
      position,
      data.image,
      data.requiredLevel
    );
    // Restore base properties
    skill.level = data.level;
    skill.learned = data.learned;
    // Restore required skills (pushing into the readonly array)
    data.requiredSkills.forEach((req: string) => skill.addRequiredSkill(req));
    // Restore the subSkillTree if available
    if (data.subSkillTree) {
      skill.subSkillTree = (data.subSkillTree && typeof data.subSkillTree === 'object') 
        ? (SubSkillTree as any).deserialize(data.subSkillTree)
        : null;
    }
    return skill;
  }
}