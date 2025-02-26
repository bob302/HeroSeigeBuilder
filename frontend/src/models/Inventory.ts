import { Cell, CellState, HightLightCellState, type CellStyle } from "./Cell";
import { Equipment, Socketable, type EquipmentSubtype } from "./Equipment";
import type EditorContext from "./EditorContext";
import { Item } from "./Item";
import { Point2D } from "./Point2D";
import { Slot } from "./Slot";
// TODO it's working but need to review
export type ItemConstructor = new (data: Equipment, size: Point2D) => Item;

export interface SerializedInventory {
  gridSize: [x: number, y: number];
  cellsData: {
    uFalse: string; // Сжатые координаты, например: "0,3;0,7;2,3;2,7"
    mask: string; // Битовая строка, например: "1110100111..."
  };
  slots: any[];
  style: CellStyle;
}

export class Inventory {
  gridSize!: Point2D;
  cellsData: Cell[] = [];
  slots: Slot[] = [];
  editorContext: EditorContext;
  public readonly cellStyle: CellStyle;
  onInventoryUpdated: (() => void)[] = [];
  needToBeSerialized: boolean = false;

  private restrictions: Set<EquipmentSubtype> = new Set()
  isBlacklist: boolean = false; 

  constructor(parent: EditorContext, gridSize: Point2D, cellStyle: CellStyle) {
    this.editorContext = parent;
    this.gridSize = gridSize;
    this.cellStyle = cellStyle;
    this.cellsData = [];
    this.slots = [];
    this.initGrid();
    this.applyCellStyle();
  }

  private isRestricted(subtype: EquipmentSubtype): boolean {
    if (this.restrictions.size === 0) return false;
    return this.isBlacklist
      ? this.restrictions.has(subtype) // Blacklist mode: block listed items
      : !this.restrictions.has(subtype); // Whitelist mode: allow only listed items
  }

  getRestrictions() {
    return this.restrictions
  }

  setRestrictions(restrictions: Set<EquipmentSubtype>) {
    this.restrictions = restrictions;
  }

  applyCellStyle() {
    this.cellsData.forEach((cell) => {
      cell.setCellStyle(this.cellStyle);
    });
  }

  clear() {
    this.slots = [];
    this.updateAllCellsAfterRemoval();
    this.handleInventoryUpdate();
  }

  setIsUnlockedCell(coordinates: Point2D, isUnlocked: boolean) {
    const cell = this.getCell(coordinates);
    if (!cell) return;
    const item = this.getItemInCell(coordinates);
    if (item) {
      this.removeItem(item);
    }
    cell.setIsUnlocked(isUnlocked);
    this.handleInventoryUpdate();
  }

  initGrid() {
    this.cellsData = [];

    for (let x = 0; x < this.gridSize.x; x++) {
      for (let y = 0; y < this.gridSize.y; y++) {
        const coords = new Point2D(x, y);
        const data = new Cell(coords);

        this.cellsData.push(data);
      }
    }
  }

  getCell(coordinates: Point2D): Cell | undefined {
    return this.cellsData.find((cell) => cell.coordinates.equals(coordinates));
  }

  setCellState(coordinates: Point2D, state: CellState): void {
    const cell = this.getCell(coordinates);
    if (cell) cell.setState(state);
  }

  setCellHighlightState(
    coordinates: Point2D,
    state: HightLightCellState,
  ): void {
    const cell = this.getCell(coordinates);
    if (cell) cell.setHighlightState(state);
  }

  isWithinBoundaries(coordinates: Point2D): boolean {
    return (
      coordinates.x >= 0 &&
      coordinates.y >= 0 &&
      coordinates.x < this.gridSize.x &&
      coordinates.y < this.gridSize.y
    );
  }

  getItemInCell(coordinates: Point2D): Item | null {
    for (const slot of this.slots) {
      if (!slot.item || slot.onCursor) continue;

      const start = slot.item.getStartCoordinates();

      const sizeOffsets = slot.item.getSizeInCells() as Point2D[];

      const occupiesCell = sizeOffsets.some((offset) =>
        start.add(offset).equals(coordinates),
      );

      if (occupiesCell) {
        return slot.item;
      }
    }

    return null;
  }

  isFree(coordinates: Point2D): boolean {
    if (!this.isWithinBoundaries(coordinates)) return false;
    const cell = this.getCell(coordinates);
    return !!cell && cell.getState() === CellState.Free && cell.isUnlocked();
  }

  doesItemFitWithType(
    sizeInCells: Point2D[],
    coordinates: Point2D,
    subType: EquipmentSubtype,
    swap = false
  ): HightLightCellState {
    const baseCheck = this.doesItemFit(sizeInCells, coordinates, swap);
  
    if (baseCheck !== HightLightCellState.ValidPlacement) {
      return baseCheck;
    }
  
    return this.isRestricted(subType)
      ? HightLightCellState.InvalidPlacement
      : HightLightCellState.ValidPlacement;
  }
  

  doesItemFit(
    sizeInCells: Point2D[],
    coordinates: Point2D,
    swap = false,
  ): HightLightCellState {
    const conflicts = new Set<Item>();

    for (const offset of sizeInCells) {
      const targetCoords = coordinates.add(offset);

      if (!this.isWithinBoundaries(targetCoords)) {
        return HightLightCellState.InvalidPlacement;
      }

      const cell = this.getCell(targetCoords);
      if (!cell || cell.isUnlocked() === false) {
        return HightLightCellState.InvalidPlacement;
      }

      if (cell.getState() === CellState.Occupied) {
        const occupyingItem = this.getItemInCell(targetCoords);
        if (occupyingItem) {
          conflicts.add(occupyingItem);
        }
      }
    }

    if (conflicts.size === 0) {
      return HightLightCellState.ValidPlacement;
    }

    if (conflicts.size === 1 && !swap) {
      return HightLightCellState.Replacement;
    }

    return HightLightCellState.InvalidPlacement;
  }

  updateCellsForItem(
    coordinates: Point2D,
    size: Point2D[],
    state: CellState,
  ): void {
    size.forEach((offset) => {
      const targetCoords = coordinates.add(offset);
      if (this.getCell(targetCoords)?.getState() !== CellState.Occupied) {
        this.setCellState(targetCoords, state);
      }

      this.setCellHighlightState(targetCoords, HightLightCellState.None);
    });
  }

  addItem(item: Item): boolean {
    if (this.isRestricted(item.data.subtype)) return false;

    const coordinates = this.findFreeSpaceForItem(
      item.getSizeInCells() as Point2D[],
    );
    if (coordinates.isValid()) {
      item.setStartCoordinates(coordinates);
      this.slots.push(new Slot(item));
      this.updateCellsForItem(
        coordinates,
        item.getSizeInCells() as Point2D[],
        CellState.Occupied,
      );
      this.handleInventoryUpdate();
      return true;
    }
    return false;
  }

  setItem(item: Item, destination: Point2D): boolean {
    if (this.isRestricted(item.data.subtype)) return false;

    if (destination.isValid()) {
      item.setStartCoordinates(destination);
      const data = new Slot(item);
      data.onCursor = false;
      this.slots.push(data);
      this.updateCellsForItem(
        destination,
        item.getSizeInCells() as Point2D[],
        CellState.Occupied,
      );
      this.handleInventoryUpdate();
      return true;
    }
    return false;
  }

  pickupItem(item: Item) {
    const slot = this.slots.find((s) => s.item?.uniqueId === item.uniqueId);
    if (!slot) return;

    const currentCoords = item.getStartCoordinates();

    this.removeItem(item);

    this.editorContext.pickupSlotOnCursor(new Slot(item));

    item.setStartCoordinates(currentCoords);
  }

  moveItem(slot: Slot, destination: Point2D): void {
    const item = slot.item;
    if (!item) return;

    if (this.isRestricted(item.data.subtype)) return;

    this.updateCellsForItem(
      item.getStartCoordinates(),
      item.getSizeInCells() as Point2D[],
      CellState.Free,
    );

    if (item.uniqueId === this.editorContext.getItemOnCursor()?.item?.uniqueId) {
      this.slots.push(new Slot(item));
      this.editorContext.removeSlotFromCursor();
    }

    item.setStartCoordinates(destination);

    this.updateCellsForItem(
      destination,
      item.getSizeInCells() as Point2D[],
      CellState.Occupied,
    );

    this.handleInventoryUpdate();
  }

  private findFreeSpaceForItem(sizeInCells: Point2D[]): Point2D {
    for (const cell of this.cellsData) {
      if (cell.getState() === CellState.Free) {
        const fitState = this.doesItemFit(sizeInCells, cell.coordinates, true);
        if (fitState === HightLightCellState.ValidPlacement || fitState === HightLightCellState.Replacement) {
          return cell.coordinates;
        }
      }
    }
    return new Point2D(-1, -1);
  }

  private getConflictingItems(position: Point2D, item: Item): Set<Item> {
    const conflicts = new Set<Item>();
    const itemCells = item
      .getSizeInCells()
      .map((offset) => position.add(offset));

    itemCells.forEach((coords) => {
      const itemInCell = this.getItemInCell(coords);
      if (itemInCell) {
        conflicts.add(itemInCell);
      }
    });

    return conflicts;
  }

  private updateAllCellsAfterRemoval(): void {
    this.cellsData.forEach((cell) => {
      this.setCellState(cell.coordinates, CellState.Free);
    });
  }

  private updateCellsAfterRemoval(
    itemPosition: Point2D,
    size: Point2D[],
  ): void {
    size.forEach((offset) => {
      const targetCoords = itemPosition.add(offset);

      if (this.getItemInCell(targetCoords)) {
        this.setCellState(targetCoords, CellState.Occupied);
      } else {
        this.setCellState(targetCoords, CellState.Free);
      }
      this.setCellHighlightState(targetCoords, HightLightCellState.None);
    });
  }

  removeItemBySlot(slot: Slot): boolean {
    const itemPosition = slot.item!.getStartCoordinates();
    const itemSize = slot.item!.getSizeInCells() as Point2D[];
    const slotIndex = this.slots.findIndex(
      (s) => s.item?.uniqueId === slot.item?.uniqueId,
    );

    if (
      this.editorContext.getItemOnCursor()?.item?.uniqueId === slot.item?.uniqueId
    ) {
      this.editorContext.removeSlotFromCursor();
    }

    this.slots.splice(slotIndex, 1);

    this.updateCellsAfterRemoval(itemPosition, itemSize);

    this.handleInventoryUpdate();

    return true;
  }

  removeItem(itemToRemove: Item): boolean {
    const slotIndex = this.slots.findIndex(
      (slot) => slot.item?.uniqueId === itemToRemove.uniqueId,
    );
    if (slotIndex === -1) return false;

    const slot = this.slots[slotIndex];
    const itemPosition = slot.item!.getStartCoordinates();
    const itemSize = slot.item!.getSizeInCells() as Point2D[];

    if (
      this.editorContext.getItemOnCursor()?.item?.uniqueId === itemToRemove.uniqueId
    ) {
      this.editorContext.removeSlotFromCursor();
    }

    this.slots.splice(slotIndex, 1);

    this.updateCellsAfterRemoval(itemPosition, itemSize);

    this.handleInventoryUpdate();

    return true;
  }

  swapItem(item: Item, destination: Point2D) {
    if (!this.editorContext.isItemOnCursor()) return;

    const onCursor = this.editorContext.getItemOnCursor()

    if (!onCursor?.item) return

    this.setItem(onCursor.item, destination);
    this.pickupItem(item);
  }

  tryInsertSocketable(item: Item): boolean {
    const socketable = this.editorContext.getItemOnCursor()?.item?.data;

    if (socketable === null) return false;
    if (socketable instanceof Socketable && item.data instanceof Equipment) {
      if (item.data.insertSocketable(socketable)) {
        return true;
      }
    }
    return false;
  }

  placeItemOnCursor(destination: Point2D) {
    if (!this.editorContext.isItemOnCursor()) return;

    const onCursor = this.editorContext.getItemOnCursor()

    if (!onCursor?.item) return
    
    const conflicts = this.getConflictingItems(
      destination,
      onCursor.item,
    );

    if (conflicts.size > 1) return;
    if (conflicts.size === 1) {
      const [toSwap] = conflicts;

      if (this.tryInsertSocketable(toSwap)) return;

      this.swapItem(toSwap, destination);
    } else {
      this.moveItem(onCursor, destination);
    }
  }

  handleInventoryUpdate(): void {
    if (this.onInventoryUpdated.length === 0) return;
    this.onInventoryUpdated.forEach((callback) => callback());
  }

  // ──────────────── Serialization Methods ────────────────

  /**
   * Returns a JSON-serializable representation of the inventory.
   */
  serialize(): SerializedInventory {
    // Собираем данные по разблокированным ячейкам
    const unlockedCells: number[][] = [];
    const gridSize = this.gridSize.x * this.gridSize.y;
    let unlockedMask = new Array(gridSize).fill("1"); // По умолчанию все unlocked

    this.cellsData.forEach((cell) => {
      const { x, y } = cell.coordinates;
      const index = y * this.gridSize.x + x;

      if (cell.isUnlocked() === false) {
        unlockedCells.push([x, y]); // Сохраняем координаты
        unlockedMask[index] = "0"; // Обновляем битовую маску
      }
    });

    return {
      gridSize: [this.gridSize.x, this.gridSize.y],
      cellsData: {
        uFalse: unlockedCells.map((c) => c.join(",")).join(";"), // Сжатые координаты
        mask: unlockedMask.join(""), // Битовая строка
      },
      slots: this.needToBeSerialized ? this.slots.map((slot) => slot.serialize()) : [],
      style: this.cellStyle,
    };
  }

  /**
   * Reconstructs an Inventory instance from its serialized form.
   */
  static deserialize(
    data: SerializedInventory,
    parent: EditorContext,
  ): Inventory {
    const gridSize = new Point2D(data.gridSize[0], data.gridSize[1]);
    const inventory = new Inventory(parent, gridSize, data.style);

    const cellsMap = new Map<string, boolean>(); // Кеш для быстрого поиска
    if (data.cellsData?.uFalse) {
      data.cellsData.uFalse
        .split(";")
        .forEach((coord) => cellsMap.set(coord, false));
    }

    const unlockedMask = data.cellsData?.mask ?? ""; // Берем битовую строку

    // Заполняем `cellsData`
    inventory.cellsData = [];
    for (let x = 0; x < gridSize.x; x++) {
      for (let y = 0; y < gridSize.y; y++) {
        const key = `${x},${y}`;
        const index = y * gridSize.x + x;
        const isUnlocked = unlockedMask[index] !== "0"; // Читаем из битовой маски

        const cell = new Cell(new Point2D(x, y));
        cell.setIsUnlocked(cellsMap.has(key) ? false : isUnlocked);
        cell.setCellStyle(data.style);
        inventory.cellsData.push(cell);
      }
    }

    // Десериализация слотов
    inventory.slots = data.slots.map((slotData) => Slot.deserialize(slotData));
    inventory.handleInventoryUpdate();

    return inventory;
  }
}
