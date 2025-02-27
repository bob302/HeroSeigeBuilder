import ColorUtils from "../util/ColorUtils";
import type { EquipmentSubtype } from "./Equipment";
import SkillTree from "./SkillTree";

export default class Charapter {
  public name: string;
  public image: string;
  public description: string;
  public skillTrees: SkillTree[] = [];
  public restrictions: Set<EquipmentSubtype> = new Set();

  constructor(name: string, description: string, image: string) {
    this.name = name;
    this.description = description;
    this.image = image;
  }

  addSkillTree(skillTree: SkillTree) {
    this.skillTrees.push(skillTree);
  }

  reset() {
    this.skillTrees.forEach((tree) => {
      tree.reset();
    });
  }

  addWeaponRestrictions(...restrictions: Array<EquipmentSubtype>) {
    restrictions.forEach(restriction => {
      this.restrictions.add(restriction)
    })
  }

  public canEquip(subtype: EquipmentSubtype): boolean {
    return this.restrictions.has(subtype);
  }
  /**
  * Serializes a Charapter instance into a flat object.
  * Saves the dynamic state of each skill tree.
  */
  serialize(): any {
    return {
      name: this.name,
      image: this.image,
      description: this.description,
      // Save the dynamic state of each SkillTree
      skillTrees: this.skillTrees.map((tree) => tree.serialize()),
      // Serialize the restrictions as an array
      restrictions: Array.from(this.restrictions),
    };
  }
  /**
  * Asynchronously loads the Character from the assets and applies the saved dynamic state,
  * if it was passed.
  *
  * @param className The class name (e.g. "amazon")
  * @param savedState (Optional) The data previously saved via serialization.
  * @returns Promise<Charapter | undefined> The loaded Chapter with the restored dynamic state.
  */
  static async loadWithState(
    className: string,
    savedState?: any
  ): Promise<Charapter | null> {
    className = ColorUtils.unformatString(className);
    const char = await Charapter.parseCharapter(className);
    if (!char) return null;

    if (savedState?.skillTrees && Array.isArray(savedState.skillTrees)) {
      for (const tree of char.skillTrees) {
        const treeSavedState = savedState.skillTrees.find(
          (t: any) => t.name === tree.name
        );
        if (treeSavedState) {
          await tree.applyState(treeSavedState);
        }
      }
    }

    if (savedState?.restrictions && Array.isArray(savedState.restrictions)) {
      char.restrictions = new Set(savedState.restrictions);
    }

    return char;
  }


  static async parseCharapter(className: string): Promise<Charapter | undefined> {
    const imagePath = `/classes/${className}/icon.webp`;
    const jsonPath = `/classes/class-names.json`;
    const formattedClassName = ColorUtils.formatString(className);

    try {
      const response = await fetch(jsonPath);
      if (!response.ok) {
        throw new Error(`Не удалось загрузить JSON: ${response.statusText}`);
      }

      const classData: Record<string, { skillTree: string[], weaponRestrictions: string[] }> = await response.json();

      const classInfo = classData[className];
      if (!classInfo) {
        console.warn(`Class ${className} not found.`);
      }

      const { skillTree, weaponRestrictions } = classInfo;

      const char = new Charapter(formattedClassName, "", imagePath);

      const treePromises = skillTree.map(async (treeName) => {
        const skillTreeInstance = await SkillTree.parseSkillTree(className, treeName);
        char.addSkillTree(skillTreeInstance);
      });

      if (weaponRestrictions.length === 0) {
        char.addWeaponRestrictions('Shield');
      }

      const weaponRestrictionPromises = weaponRestrictions.map(async (restriction) => {
        char.addWeaponRestrictions(restriction);
      });

      await Promise.all([...treePromises, ...weaponRestrictionPromises]);

      return char;
    } catch (error) {
      console.error(`Ошибка при загрузке ${formattedClassName}:`, error);
      return undefined;
    }
  }
}

