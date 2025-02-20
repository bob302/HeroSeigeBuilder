import ColorUtils from "../util/ColorUtils";
import type { EquipmentSubtype } from "./Equipment";
import SkillTree from "./SkillTree";

export default class Charapter {
  public name: string
  public image: string
  public description: string
  public skillTrees: SkillTree[] = []
  public restrictions: Set<EquipmentSubtype> = new Set();

  constructor(name: string, description: string, image: string) {
    this.name = name;
    this.description = description
    this.image = image
  }

  addSkillTree(skillTree: SkillTree) {
    this.skillTrees.push(skillTree)
  }

  reset() {
    this.skillTrees.forEach(tree => {
      tree.reset()
    });
  }

  setWeaponRestrictions(restrictions: Set<EquipmentSubtype>) {
    this.restrictions = restrictions
  }

  public canEquip(subtype: EquipmentSubtype): boolean {
    return this.restrictions.has(subtype);
  }

  /**
   * Serializes the Charapter instance into a plain object.
   */
  serialize(): any {
    return {
      name: this.name,
      image: this.image,
      description: this.description,
      // Serialize each SkillTree
      skillTrees: this.skillTrees.map(tree => tree.serialize()),
      // Serialize the restrictions as an array
      restrictions: Array.from(this.restrictions)
    };
  }

  /**
   * Deserializes a plain object into a Charapter instance.
   * Assumes that SkillTree.deserialize() is available.
   */
  static deserialize(data: any): Charapter {
    const char = new Charapter(data.name, data.description, data.image);
    // Rebuild the skill trees from their serialized form
    char.skillTrees = data.skillTrees.map((treeData: any) => SkillTree.deserialize(treeData));
    // Reconstruct the restrictions set
    char.restrictions = new Set<EquipmentSubtype>(data.restrictions);
    return char;
  }

  static async parseCharapter(className: string): Promise<Charapter | undefined> {
    const imagePath = `/classes/${className}/icon.webp`;
    const jsonPath = `/classes/class-names.json`;
    const formattedClassName = ColorUtils.formatString(className)

    try {
        const response = await fetch(jsonPath);
        if (!response.ok) {
            throw new Error(`Не удалось загрузить JSON: ${response.statusText}`);
        }

        const classData: Record<string, string[]> = await response.json();

        const treesNames = classData[className];

        if (!treesNames) {
            console.warn(`Класс ${className} не найден.`);
            return undefined;
        }

        const char = new Charapter(formattedClassName, "", imagePath);

        const treePromises = treesNames.map(async (treeName) => {
            const skillTree = await SkillTree.parseSkillTree(className, treeName);
            char.addSkillTree(skillTree);
        });

        await Promise.all(treePromises);

        return char;
    } catch (error) {
        console.error(`Ошибка при загрузке ${formattedClassName}:`, error);
        return undefined;
    }
}




  
}