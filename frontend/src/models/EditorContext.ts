import Charapter from "./Charapter";
import { EquipmentSlot } from "./EquipmentSlot";
import { Inventory } from "./Inventory";
import { Slot } from "./Slot";
import { v4 as uuidv4 } from 'uuid';

export default class EditorContext {
  itemOnCursor: Slot | null = null;
  inventories: Map<string, Inventory> = new Map();
  equipmentSlots: Map<string, EquipmentSlot> = new Map();

  selectedCharapter: Charapter | null = null
  private skillPoints: number = 100
  private attributePoints: number = 400

  public strength: number = 0
  public dexterity: number = 0
  public intelligence: number = 0
  public energy: number = 0
  public armor: number = 0
  public vitality: number = 0

  public onDeserialization: (() => void) | null = null;

  constructor() {

  }

  getAttributePoints() {
    return this.attributePoints
  }

  increaseAttribute(attribute: "strength" | "dexterity" | "intelligence" | "energy" | "vitality", amount: number) {
    if (this.canSpendAttributePoint(amount)) {
      this[attribute] += amount;
      this.spendAttributePoint(amount);
    }
  }
  
  spendAttributePoint(amount: number) {
    this.attributePoints -= amount;
  }

  canSpendAttributePoint(amount: number = 1): boolean {
    return this.attributePoints >= amount;
  }

  resetAttributes() {
    this.strength = 0
    this.dexterity = 0
    this.intelligence = 0
    this.energy = 0
    this.vitality = 0
    this.attributePoints = 400
  }

  getSkillPoints() {
    return this.skillPoints
  }
  canSpendSkillPoint(): boolean {
    return this.skillPoints >= 1
  }
  spendSkillPoint() {
    this.skillPoints--
  }
  resetSkillPoints() {
    this.skillPoints = 100
  }

  get charmInventory(): Inventory {
    return this.inventories.get('charm')!;
  }

  get mainInventory(): Inventory {
    return this.inventories.get('main')!;
  }

  public updateFrom(other: EditorContext) {
    Object.assign(this, other);
  }

  // ─────────── Serialization Methods ───────────

  /**
   * Converts the current EditorContext into a plain object suitable for JSON serialization.
   */
  serialize(): any {
    return {
      itemOnCursor : null,
      inventories: Array.from(this.inventories.entries()).map(([key, inv]) => [
        key,
        inv.serialize(), // ← теперь сериализуем корректно
      ]),
      selectedCharapter: this.selectedCharapter ? Charapter.prototype.serialize.call(this.selectedCharapter) : null,
      skillPoints: this.skillPoints,
      attributePoints: this.attributePoints,
      strength: this.strength,
      dexterity: this.dexterity,
      intelligence: this.intelligence,
      energy: this.energy,
      armor: this.armor,
      vitality: this.vitality,
      equipmentSlots: Array.from(this.equipmentSlots.entries()).map(([key, slot]) => [
        key,
        slot.serialize(), // ← теперь сериализуем корректно
      ]),
    };
  }

  /**
   * Recreates an EditorContext instance from its serialized form.
   * Note: The static deserialize methods for Slot, Cell, Inventory, and Charapter are assumed to be available.
   */
  static deserialize(data: any): EditorContext {
    const context = new EditorContext();

    context.selectedCharapter = data.selectedCharapter
    ? Charapter.deserialize(data.selectedCharapter)
    : null;

    if (data.inventories) {
      context.inventories = new Map(
        data.inventories.map(([key, invData]: [string, any]) => [
          key, 
          Inventory.deserialize(invData, context)
        ])
      );
    }

    if (data.equipmentSlots) {
      context.equipmentSlots = new Map(
        data.equipmentSlots.map(([key, slotData]: [string, any]) => [
          key,
          EquipmentSlot.deserialize(slotData)
        ])
      );
    }
    
    context.itemOnCursor = null
    
    context.skillPoints = data.skillPoints;
    context.attributePoints = data.attributePoints;
    context.strength = data.strength;
    context.dexterity = data.dexterity;
    context.intelligence = data.intelligence;
    context.energy = data.energy;
    context.armor = data.armor;
    context.vitality = data.vitality;

    return context;
  }
}