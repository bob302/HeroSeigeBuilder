import ColorUtils from "../util/ColorUtils";
import type { Equipment } from "./Equipment";
import type { Inventory } from "./Inventory";
import { Point2D } from "./Point2D";
import { v4 as uuidv4 } from 'uuid';

export class Item {
  data!: Equipment
  size!: Point2D;
  startCoordinates: Point2D = new Point2D(0, 0);
  sizeInCells: Point2D[];
  cachedSize: Point2D;
  cachedSizeInCells: Point2D[];
  isRotated: boolean = false;
  uniqueId!: string;
  ownerInventory: Inventory | null = null;
  
  constructor(data: Equipment, size: Point2D) {
    this.size = size
    this.data = data
    this.sizeInCells = this.calcItemSize();
    this.cachedSize = this.size;
    this.cachedSizeInCells = [...this.sizeInCells];
    this.isRotated = false;
    this.uniqueId = uuidv4()
  }

  rarityToBackgroundImage() {
    return ColorUtils.rarityToBackground(this.data.rarity)
  }

  setSize(size: Point2D): void {
    this.size = size
    this.sizeInCells = this.calcItemSize();
    this.cachedSize = this.size;
    this.cachedSizeInCells = [...this.sizeInCells];
  }

  setData(data: Equipment): void {
    this.data = data
  }

  setSizeInCells(sizeInCells: Point2D[]): void {
    this.sizeInCells = sizeInCells
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

  setOwningInventory(newInventory: Inventory | null): void {
    this.ownerInventory = newInventory;
  }

  copy(): Item {
    const item = new Item(this.data, this.size)
    item.setStartCoordinates(this.getStartCoordinates())
    return item
  }

}