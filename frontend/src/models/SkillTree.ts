import ColorUtils from "../util/ColorUtils";
import CharapterSkill from "./CharapterSkill";
import type Skill from "./CharapterSkill";
import type EditorContext from "./EditorContext";
import { Point2D } from "./Point2D";

export default class SkillTree {
  public name: string
  public skills: CharapterSkill[] = []

  constructor(name: string) {
    this.name = name
  }

  addSkill(skill: CharapterSkill): void {
    if (skill.position.y < 0 || skill.position.y >= 5 || 
        skill.position.x < 0 || skill.position.x >= 3) {
      throw new Error("Skill position is out of grid bounds (5 rows, 3 columns)");
    }
    
    if (this.skills.some(s => s.position.equals(skill.position))) {
      throw new Error(`Position (${skill.position.x}, ${skill.position.y}) is already occupied`);
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
    this.skills.forEach(skill => {
      skill.reset()
    });
  }

  canLearn(skill: CharapterSkill): boolean {
    if (!this.skills.includes(skill)) return false;
   
    // Skills in the first row can always be learned
    if (skill.requiredSkills[0] === "None") return true

    // Other skills require all dependencies to be learned
    return skill.requiredSkills.length > 0 && skill.requiredSkills.every(req =>
      this.skills.find(s => s.name === req)?.learned)
  }

  learnSkill(skill: CharapterSkill, context: EditorContext): boolean {
    if (!context.canSpendSkillPoint()) return false
    if (!this.skills.includes(skill)) {
      throw new Error("Skill is not part of the skill tree.");
    }
    
    if (this.canLearn(skill)) {
      if (!skill.learned) {
        skill.learned = true;
        skill.level = 1;
       context.spendSkillPoint()
        return true
      } else {
        if (skill.level < skill.maxLevel) {
          skill.level++;
          context.spendSkillPoint()
          return true
        } else {
          return false
        }
      }
    } else {
      return false
    }
  }

  /**
   * Serializes the SkillTree instance into a JSON‑friendly plain object.
   */
  serialize(): any {
    return {
      name: this.name,
      // Serialize each skill using its own serialize() method
      skills: this.skills.map(skill => skill.serialize())
    };
  }

  /**
   * Deserializes the plain object into a SkillTree instance.
   */
  static deserialize(data: any): SkillTree {
    const skillTree = new SkillTree(data.name);
    if (data.skills && Array.isArray(data.skills)) {
      skillTree.skills = data.skills.map((skillData: any) =>
        CharapterSkill.deserialize(skillData)
      );
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
static async parseSkillTree(className: string, treeName: string): Promise<SkillTree> {
  const treeDir = `/classes/${className}/${treeName}/`;
  let jsonFiles: string[];
  const treeNameFormated = ColorUtils.formatString(treeName)

  try {
    const treeResponce = await fetch(treeDir + 'tree.json');
    if (!treeResponce.ok) {
      throw new Error(`Failed to load tree.json from ${treeDir}`);
    }
    jsonFiles = await treeResponce.json();
    
  } catch (error) {
    console.error('Error loading tree.json:', error, treeDir);
    return new SkillTree(treeNameFormated);
  } finally {}

  const skillTree = new SkillTree(treeNameFormated);
  const skillMap: Map<string, CharapterSkill> = new Map();

  const skillPromises = jsonFiles.map(async (file, index) => {
    const filePath = treeDir + file
    try {
      const fileResponse = await fetch(filePath);
  
      
      if (!fileResponse.ok) {
        throw new Error(`Failed to load skill data from ${file}`);
      }
      const data = await fileResponse.json();
 
      const pos: Point2D = data.Position && typeof data.Position.x === 'number' && typeof data.Position.y === 'number'
        ? new Point2D(data.Position.x, data.Position.y)
        : new Point2D(Math.floor(index / 3), index % 3);
        
        const skill = new CharapterSkill(
          data.Name,
          "",
          20,
          pos,
          `${treeDir}/${data.Icon}`,
          data["Required Level"] ? parseInt(data["Required Level"], 10) : 0
        );
        
        if (data["Required Skill(s)"]) {
          data["Required Skill(s)"]
            .split(',')
            .map((s: string) => s.trim())
            .forEach((reqSkill: string) => skill.addRequiredSkill(reqSkill));
        }

      skillMap.set(skill.name, skill);
      return skill;
    } catch (error) {
      console.error(`Error processing file ${file}:`, error);
      return null;
    }
  });

  const skills = await Promise.all(skillPromises);
  skills.forEach(skill => {
    if (skill) {
      skillTree.addSkill(skill);
    }
  });

  skillTree.skills.forEach(skill => {
    skill.requiredSkills.forEach(reqSkill => {
      
      const parentSkill = skillMap.get(reqSkill);
      if (parentSkill) {
        try {
          skillTree.addDependency(parentSkill, skill);
        } catch (error) {
          console.error(`Error adding dependency for ${skill.name}:`, error);
        }
      } else {
        if (reqSkill === "None") return
        console.warn(`Dependency "${reqSkill}" not found for skill "${skill.name}"`);
      }
    });
  });

  return skillTree;
}


}

