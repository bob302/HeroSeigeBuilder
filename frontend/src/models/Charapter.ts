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
    restrictions.forEach( restriction => {
      this.restrictions.add(restriction)
    })
  }

  public canEquip(subtype: EquipmentSubtype): boolean {
    return this.restrictions.has(subtype);
  }
  /**
   * Сериализует экземпляр Charapter в плоский объект.
   * Сохраняется динамическое состояние каждого дерева навыков.
   */
  serialize(): any {
    return {
      name: this.name,
      image: this.image,
      description: this.description,
      // Сохраняем динамическое состояние каждого SkillTree
      skillTrees: this.skillTrees.map((tree) => tree.serialize()),
      // Сериализуем ограничения в виде массива
      restrictions: Array.from(this.restrictions),
    };
  }

  /**
   * Асинхронно загружает Charapter из ассетов и применяет сохранённое динамическое состояние,
   * если оно было передано.
   *
   * @param className Имя класса (например, "amazon")
   * @param savedState (Необязательно) Данные, сохранённые ранее через serialize.
   * @returns Promise<Charapter | undefined> Загруженный Charapter с восстановленным динамическим состоянием.
   */
  static async loadWithState(
    className: string,
    savedState?: any,
  ): Promise<Charapter | null> {
    className = ColorUtils.unformatString(className);
    const imagePath = `/classes/${className}/icon.webp`;
    const jsonPath = `/classes/class-names.json`;
    const formattedClassName = ColorUtils.formatString(className);

    try {
      const response = await fetch(jsonPath);
      if (!response.ok) {
        throw new Error(`Не удалось загрузить JSON: ${response.statusText}`);
      }
      const classData: Record<string, string[]> = await response.json();

      const treesNames = classData[className];

      if (!treesNames) {
        console.warn(`Класс ${className} не найден.`);
        return null;
      }

      const char = new Charapter(formattedClassName, "", imagePath);

      // Для каждого дерева навыков загружаем статическую структуру с применением сохранённого состояния (если оно есть)
      const treePromises = treesNames.map(async (treeName) => {
        let treeSavedState = undefined;
        if (savedState && Array.isArray(savedState.skillTrees)) {
          treeSavedState = savedState.skillTrees.find(
            (t: any) => t.name === ColorUtils.formatString(treeName),
          );
        }

        const skillTree = await SkillTree.loadWithState(
          className,
          treeName,
          treeSavedState,
        );
        char.addSkillTree(skillTree);
      });

      await Promise.all(treePromises);

      if (savedState && Array.isArray(savedState.restrictions)) {
        char.restrictions = new Set(savedState.restrictions);
      }

      return char;
    } catch (error) {
      console.error(`Ошибка при загрузке ${formattedClassName}:`, error);
      return null;
    }
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
  
