import { HightLightCellState } from "./Cell";
import Charapter from "./Charapter";
import type { BaseItem, EquipmentSubtype } from "./Equipment";
import { EquipmentSlot } from "./EquipmentSlot";
import { Inventory } from "./Inventory";
import type { Item } from "./Item";
import { Point2D } from "./Point2D";
import { Slot } from "./Slot";
import type SubSkillTree from "./SubSkillTree";

export enum EditorViewState {
  None = "none",
  Catalog = "catalog",
  Tooltip = "tooltip",
  SubSkillTree = "subSkillTree",
  Info = "info",
  Restrictions = "restrictions",
  Confirmation = "confirmation"
}

export default class EditorContext {
  private itemOnCursor: Slot | null = null;
  lookingAt: BaseItem | null = null;
  mousePosition: { x: number; y: number } = { x: -1000, y: -1000 };
  private inventories: Map<string, Inventory> = new Map();
  equipmentSlots: Map<string, EquipmentSlot> = new Map();
  public currentView: EditorViewState = EditorViewState.None;
  public activeSubSkillTree: SubSkillTree | null = null;

  private selectedCharapter: Charapter | null = null;
  private skillPoints: number = 100;
  private attributePoints: number = 400;

  public strength: number = 0;
  public dexterity: number = 0;
  public intelligence: number = 0;
  public energy: number = 0;
  public armor: number = 0;
  public vitality: number = 0;

  public onDeserialization: (() => void) | null = null;

  private topSlotUnlocked = false;
  private bottomSlotUnlocked = false;

  confirmationResolver: ((result: boolean) => void) | null = null;
  confirmationMessage = "";

  private scaleFactor = 1;

  private editorSlot: EquipmentSlot | null = null

  constructor() { }

  public getInventories() {
    return this.inventories
  }

  public getEditorSlot(): EquipmentSlot | null {
    return this.editorSlot
  }

  public setEditorSlot(es: EquipmentSlot) {
    this.editorSlot = es
  }

  public getScaleFactor(): number {
    return this.scaleFactor
  }

  public setScaleFactor(scaleFactor: number) {
    this.scaleFactor = scaleFactor
  }

  showConfirm(message: string): Promise<boolean> {
    this.confirmationMessage = message;
    this.currentView = EditorViewState.Confirmation;

    return new Promise((resolve) => {
      this.confirmationResolver = resolve;
    });
  }

  resolveConfirmation(result: boolean) {
    if (this.confirmationResolver) {
      this.confirmationResolver(result);
      this.confirmationResolver = null;
      this.confirmationMessage = "";
      this.currentView = EditorViewState.None;
    }
  }

  public isTopSlotUnlocked() {
    return this.topSlotUnlocked
  }

  public isBottomSlotUnlocked() {
    return this.bottomSlotUnlocked
  }

  unlockCharmTopSlot() {
    this.topSlotUnlocked = !this.topSlotUnlocked;

    this.charmInventory.setIsUnlockedCell(
      new Point2D(0, 3),
      this.topSlotUnlocked,
    );
  }

  unlockCharmBottomSLot() {
    this.bottomSlotUnlocked = !this.bottomSlotUnlocked;

    this.charmInventory.setIsUnlockedCell(
      new Point2D(2, 7),
      this.bottomSlotUnlocked,
    );
  }

  public getSelectedCharapter(): Charapter | null {
    return this.selectedCharapter
  }

  public selectCharapter(charapter: Charapter): void {
    this.selectedCharapter = charapter
    this.updateRestrictions("weapon", charapter.restrictions, charapter.isBlackList())
  }

  updateRestrictions(slotName: string, restrictions: Set<EquipmentSubtype>, blacklist = false) {
    const equipmentSlot: EquipmentSlot | undefined = this.equipmentSlots.get(slotName)

    if (equipmentSlot) {
      equipmentSlot.setRestrictions(restrictions, blacklist)
      const item = equipmentSlot.slot.item
      if (item) {
        if (equipmentSlot.isRestricted(undefined, item?.data?.subtype)) {
          this.mainInventory.addItem(item)
          equipmentSlot.slot.item = null
          equipmentSlot.cell.setHighlightState(HightLightCellState.None);
        }
      }
    }
  }

  public removeSlotFromCursor(): boolean {
    if (this.itemOnCursor === null) {
      console.error("There is no item on the cursor!")
      return false
    }

    this.itemOnCursor = null

    return true
  }

  public pickupSlotOnCursor(slot: Slot): boolean {
    if (this.itemOnCursor !== null) {
      console.error("The item is already on the cursor!")
      return false
    }

    this.itemOnCursor = slot.clone();
    this.itemOnCursor.onCursor = true
    //@ts-ignore
    for (const [key, eq] of this.equipmentSlots) {
      const toRemove = eq.slot.item?.uniqueId === slot.item?.uniqueId;
      if (toRemove) {
        eq.slot.item = null;
        return true
      }
    }

    //@ts-ignore
    for (const [key, inv] of this.inventories) {
      const toRemove = inv.slots.find(s => slot.item?.uniqueId === s.item?.uniqueId)
      if (toRemove) {
        inv.removeItemBySlot(toRemove)
        return true
      }
    }

    return false
  }

  public putItemInEquipmentSlot(es: EquipmentSlot, item: Item): boolean {
    if (item.uniqueId === this.itemOnCursor?.item?.uniqueId) {
      es.slot.item = item.copy()
      this.removeSlotFromCursor()
      return true
    }
    return false
  }

  isItemOnCursor(): boolean {
    return this.itemOnCursor !== null
  }

  getItemOnCursor(): Slot | null {
    return this.itemOnCursor
  }

  public setView(view: EditorViewState, payload?: any) {
    if (this.currentView === view) {
      this.resetView()
      return
    }
    this.currentView = view;
    if (view === EditorViewState.SubSkillTree && payload) {
      this.activeSubSkillTree = payload;
    } else {
      this.activeSubSkillTree = null;
    }
  }

  public resetView() {
    this.currentView = EditorViewState.None;
    this.activeSubSkillTree = null;
  }

  get tooltipPosition() {
    return { x: this.mousePosition.x + 30, y: this.mousePosition.y };
  }

  clearEquipment() {
    this.equipmentSlots.forEach((slot) => {
      slot.clear()
    });
  }

  updateStatDisplay(item: BaseItem): void {
    if (!this) {
      console.error("EditorContext is undefined");
      return;
    }

    this.lookingAt = item;
  }

  resetStatDisplay(): void {
    this.lookingAt = null;
  }

  getAttributePoints() {
    return this.attributePoints;
  }

  increaseAttribute(
    attribute:
      | "strength"
      | "dexterity"
      | "intelligence"
      | "energy"
      | "vitality",
    amount: number,
  ) {
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
    this.strength = 0;
    this.dexterity = 0;
    this.intelligence = 0;
    this.energy = 0;
    this.vitality = 0;
    this.attributePoints = 400;
  }

  getSkillPoints() {
    return this.skillPoints;
  }
  canSpendSkillPoint(): boolean {
    return this.skillPoints >= 1;
  }
  spendSkillPoint() {
    this.skillPoints--;
  }
  resetSkillPoints() {
    this.skillPoints = 100;
  }

  get charmInventory(): Inventory {
    return this.inventories.get("charm")!;
  }

  get mainInventory(): Inventory {
    return this.inventories.get("main")!;
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
      inventories: Array.from(this.inventories.entries()).map(([key, inv]) => [
        key,
        inv.serialize(),
      ]),

      selectedCharapter: this.selectedCharapter
        ? this.selectedCharapter.serialize()
        : null,
      skillPoints: this.skillPoints,
      attributePoints: this.attributePoints,
      strength: this.strength,
      dexterity: this.dexterity,
      intelligence: this.intelligence,
      energy: this.energy,
      armor: this.armor,
      vitality: this.vitality,
      equipmentSlots: Array.from(this.equipmentSlots.entries()).map(
        ([key, slot]) => [key, slot.serialize()],
      ),
    };
  }

  /*
  * Recreates an EditorContext instance from serialized data.
  */
  static async deserialize(data: any): Promise<EditorContext> {
    const context = new EditorContext();
    if (data.equipmentSlots) {
      context.equipmentSlots = new Map();

      await Promise.all(data.equipmentSlots.map(async ([key, slotData]: [string, any]) => {
        if (key !== slotData.slotName) {
          throw new Error(`Key mismatch: expected '${key}', but name = '${slotData.slotName}}'`);
        }
        const slot = await EquipmentSlot.deserialize(slotData);
        context.equipmentSlots.set(key, slot);
      }));
    }


    
    if (data.inventories) {
      context.inventories = new Map();
      
      await Promise.all(data.inventories.map(async ([key, invData]: [string, any]) => {
        if (key !== invData.name) {
          throw new Error(`Key mismatch: expected '${key}', but name = '${invData.name}'`);
        }
        const inventory = await Inventory.deserialize(invData, context);
        context.inventories.set(key, inventory);
      }));
    }

    if (data.selectedCharapter) {
      const className = data.selectedCharapter.name;
      const charapter = await Charapter.loadWithState(
        className,
        data.selectedCharapter,
      );

      if (charapter) {
        context.selectedCharapter = charapter
        context.updateRestrictions("weapon", charapter.restrictions, charapter.isBlackList())
      }

    } else {
      context.selectedCharapter = null;
    }

    context.itemOnCursor = null;

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
