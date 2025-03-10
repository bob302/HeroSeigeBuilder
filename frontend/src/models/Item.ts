import ColorUtils from "../util/ColorUtils";
import { deserialize, type BaseItem, type Equipment } from "./Equipment";
import { Point2D } from "./Point2D";
import { v4 as uuidv4 } from "uuid";

export class Item {
  data!: BaseItem;
  size!: Point2D;
  startCoordinates: Point2D = new Point2D(0, 0);
  sizeInCells: Point2D[];
  cachedSize: Point2D;
  cachedSizeInCells: Point2D[];
  uniqueId!: string;

  constructor(data: BaseItem, size = new Point2D(1, 1)) {
    this.size = size;
    this.data = data;
    this.sizeInCells = this.calcItemSize();
    this.cachedSize = this.size;
    this.cachedSizeInCells = [...this.sizeInCells];
    this.uniqueId = uuidv4();
  }

  rarityToBackgroundImage() {
    return ColorUtils.rarityToBackground(this.data.rarity);
  }

  setSize(size: Point2D): void {
    this.size = size;
    this.sizeInCells = this.calcItemSize();
    this.cachedSize = this.size;
    this.cachedSizeInCells = [...this.sizeInCells];
  }

  setData(data: Equipment): void {
    this.data = data;
  }

  setSizeInCells(sizeInCells: Point2D[]): void {
    this.sizeInCells = sizeInCells;
  }

  getSizeInCells(): readonly Point2D[] {
    return this.cachedSizeInCells;
  }

  getStartCoordinates(): Point2D {
    return this.startCoordinates;
  }

  setStartCoordinates(coordinates: Point2D): void {
    this.startCoordinates = coordinates;
  }

  calcItemSize(): Point2D[] {
    const itemSize: Point2D[] = [];
    for (let x = 0; x < this.size.x; x++) {
      for (let y = 0; y < this.size.y; y++) {
        itemSize.push(new Point2D(x, y));
      }
    }
    return itemSize;
  }

  copy(): Item {
    const item = new Item(this.data, this.size);
    item.setStartCoordinates(this.getStartCoordinates());
    return item;
  }

  // ───── Serialization Methods ─────

  /**
   * Returns a plain object representing this Item,
   * suitable for JSON serialization.
   */
  serialize(): any {
    return {
      data:
        this.data && typeof (this.data as any).serialize === "function"
          ? (this.data as any).serialize()
          : this.data,

      size: { x: this.size.x, y: this.size.y },
      startCoordinates: {
        x: this.startCoordinates.x,
        y: this.startCoordinates.y,
      }
    };
  }

  /**
   * Reconstructs an Item instance from the serialized data.
   */
  static async deserialize(serialized: any): Promise<Item> {
    // Deserialize the equipment data.
    const equipment = deserialize(serialized.data);

    const size = new Point2D(serialized.size.x, serialized.size.y);
    const item = new Item(await equipment, size);
    item.setStartCoordinates(
      new Point2D(serialized.startCoordinates.x, serialized.startCoordinates.y),
    );

    return item;
  }
}
