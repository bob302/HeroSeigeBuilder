import { Item } from "./Item";

export class Slot {
  item: Item | null;
  onCursor = false;

  constructor(item: Item | null = null) {
    this.item = item;
  }

  equals(other: Slot): boolean {
    if (!other) return false;

    if (this.item && other.item) {
      return this.item.uniqueId === other.item.uniqueId;
    }

    return false;
  }

  clone(): Slot {
    return new Slot(this.item?.copy());
  }

  // ───── Serialization Methods ─────

  serialize(): any {
    return {
      item: this.item ? this.item.serialize() : null,
    };
  }

  static async deserialize(data: any): Promise<Slot> {
    const item = data.item ? await Item.deserialize(data.item) : null;
    const slot = new Slot(item);
  
    return slot;
  }
}
