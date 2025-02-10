import { Item } from "./Item";

export class SlotData {
  item: Item | null;
  slotSize!: number;
  onCursor = false;

  constructor(item: Item | null = null, slotSize: number) {
    this.item = item;
    this.slotSize = slotSize
  }

  setSlotSize(slotSize: number) {
    this.slotSize = slotSize
  }

  equals(other: SlotData): boolean {
    if (!other) return false;

    if (this.item && other.item) {
      return this.item.uniqueId === other.item.uniqueId;
    }
    
    return false;
  }

  clone(): SlotData {
    return new SlotData(this.item?.copy(), this.slotSize);
  }
}
