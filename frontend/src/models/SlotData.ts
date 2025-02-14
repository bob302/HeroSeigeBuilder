import type { Inventory } from "./Inventory";
import { Item } from "./Item";

export class SlotData {
  item: Item | null;
  onCursor = false;
  parent!: Inventory

  constructor(item: Item | null = null) {
    this.item = item;
  }


  equals(other: SlotData): boolean {
    if (!other) return false;

    if (this.item && other.item) {
      return this.item.uniqueId === other.item.uniqueId;
    }
    
    return false;
  }

  clone(): SlotData {
    return new SlotData(this.item?.copy());
  }
}
