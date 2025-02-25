import ColorUtils from "../util/ColorUtils";
import CharapterSkill from "./CharapterSkill";
import Skill from "./CharapterSkill";
import type EditorContext from "./EditorContext";

export default class SkillTree {
  public name: string;
  public skills: CharapterSkill[] = [];

  constructor(name: string) {
    this.name = name;
  }

  addSkill(skill: CharapterSkill): void {
    if (
      skill.position.y < 0 ||
      skill.position.y >= 5 ||
      skill.position.x < 0 ||
      skill.position.x >= 3
    ) {
      throw new Error(
        "Skill position is out of grid bounds (5 rows, 3 columns)",
      );
    }

    if (this.skills.some((s) => s.position.equals(skill.position))) {
      throw new Error(
        `Position (${skill.position.x}, ${skill.position.y}) is already occupied`,
      );
    }

    this.skills.push(skill);
  }

  addDependency(parent: Skill, child: Skill): void {
    if (!this.skills.includes(parent) || !this.skills.includes(child)) {
      throw new Error("Both skills must be part of the tree");
    }

    if (parent.position.y > child.position.y) {
      console.log("Parent", parent, " Child: ", child);

      throw new Error("Parent skill must be in a previous row");
    }

    if (!child.requiredSkills.includes(parent.name)) {
      child.requiredSkills.push(parent.name);
    }
  }

  reset() {
    this.skills.forEach((skill) => {
      skill.reset();
    });
  }

  canLearn(skill: CharapterSkill): boolean {
    if (!this.skills.includes(skill)) return false;

    // Skills in the first row can always be learned
    if (skill.requiredSkills[0] === "None") return true;

    // Other skills require all dependencies to be learned
    return (
      skill.requiredSkills.length > 0 &&
      skill.requiredSkills.every(
        (req) => this.skills.find((s) => s.name === req)?.learned,
      )
    );
  }

  learnSkill(skill: CharapterSkill, context: EditorContext): boolean {
    if (!context.canSpendSkillPoint()) return false;
    if (!this.skills.includes(skill)) {
      throw new Error("Skill is not part of the skill tree.");
    }

    if (this.canLearn(skill)) {
      if (!skill.learned) {
        skill.learned = true;
        skill.level = 1;
        context.spendSkillPoint();
        return true;
      } else {
        if (skill.level < skill.maxLevel) {
          skill.level++;
          context.spendSkillPoint();
          return true;
        } else {
          return false;
        }
      }
    } else {
      return false;
    }
  }

  /**
   * Сериализует только динамическое состояние дерева.
   */
  serialize(): any {
    return {
      name: this.name,
      skills: this.skills.map((skill) => skill.serialize()),
    };
  }

  /**
   * Применяет сохранённое динамическое состояние к уже загруженному дереву.
   * Ожидается, что savedState имеет форму { skills: [{ name, learned, level, subSkillTree }, ...] }
   */
  applyState(savedState: any): void {
    if (savedState && Array.isArray(savedState.skills)) {
      savedState.skills.forEach((savedSkill: any) => {
        const skill = this.skills.find((s) => s.name === savedSkill.name);
        if (skill) {
          skill.applyState(savedSkill);
        }
      });
    }
  }

  /**
   * Загружает дерево навыков из ассетов (через parseSkillTree) и применяет к нему сохранённое динамическое состояние.
   *
   * @param className Имя класса (например, "amazon")
   * @param treeName Имя дерева (например, "huntress")
   * @param savedState (Необязательно) Данные сохранённого состояния.
   * @returns Promise<SkillTree> Полное дерево с восстановленным динамическим состоянием.
   */
  static async loadWithState(
    className: string,
    treeName: string,
    savedState?: any,
  ): Promise<SkillTree> {
    const skillTree = await SkillTree.parseSkillTree(className, treeName);
    if (savedState) {
      skillTree.applyState(savedState);
    }
    return skillTree;
  }

  /**
   * Parses the skill tree by loading JSON files from:
   * public/classes/{className}/{treeName}/
   * Expects a file "index.json" in this directory containing an array of JSON file names.
   *
   * @param className - for example, "amazon"
   * @param treeName - for example, "huntress"
   * @returns Promise<SkillTree>
   */
  static async parseSkillTree(
    className: string,
    treeName: string,
  ): Promise<SkillTree> {
    const treeDir = `/classes/${className}/${treeName}/`;
    let jsonFiles: string[];
    const treeNameFormated = ColorUtils.formatString(treeName);

    try {
      const treeResponce = await fetch(treeDir + "tree.json");
      if (!treeResponce.ok) {
        throw new Error(`Failed to load tree.json from ${treeDir}`);
      }
      jsonFiles = await treeResponce.json();
    } catch (error) {
      console.error("Error loading tree.json:", error, treeDir);
      return new SkillTree(treeNameFormated);
    } finally {
    }

    const skillTree = new SkillTree(treeNameFormated);
    const skillMap: Map<string, CharapterSkill> = new Map();

    const skillPromises = jsonFiles.map(async (file, index) => {
      const filePath = treeDir + file;
      try {
        const fileResponse = await fetch(filePath);

        if (!fileResponse.ok) {
          throw new Error(`Failed to load skill data from ${file}`);
        }
        const data = await fileResponse.json();

        const skill = Skill.fromFileData(data, index, treeDir);

        skillMap.set(skill.name, skill);
        return skill;
      } catch (error) {
        console.error(`Error processing file ${file}:`, error);
        return null;
      }
    });

    const skills = await Promise.all(skillPromises);
    skills.forEach((skill) => {
      if (skill) {
        skillTree.addSkill(skill);
      }
    });

    skillTree.skills.forEach((skill) => {
      skill.requiredSkills.forEach((reqSkill) => {
        const parentSkill = skillMap.get(reqSkill);
        if (parentSkill) {
          try {
            skillTree.addDependency(parentSkill, skill);
          } catch (error) {
            console.error(`Error adding dependency for ${skill.name}:`, error);
          }
        } else {
          if (reqSkill === "None") return;
          console.warn(
            `Dependency "${reqSkill}" not found for skill "${skill.name}"`,
          );
        }
      });
    });

    return skillTree;
  }
}
