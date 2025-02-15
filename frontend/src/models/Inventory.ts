import { CellData, CellState, HightLightCellState } from "./CellData";
import { Socketable, type Equipment } from "./Equipment";
import type GameContext from "./GameContext";
import { Item } from "./Item";
import { Point2D } from "./Point2D"
import { SlotData } from "./SlotData";
// TODO it's working but need to review
export type ItemConstructor = new (data: Equipment, size: Point2D) => Item;

export class Inventory {
  gridSize!: Point2D;
  cellsData: CellData[] = [];
  slots: SlotData[] = [];
  parent: GameContext
  onInventoryUpdated: (() => void)[] = [];
  
  constructor(parent: GameContext, gridSize: Point2D) {
    this.parent = parent
    this.gridSize = gridSize;
    this.cellsData = [];
    this.slots = [];
    this.initGrid();
  }

  clear() {
    this.slots = []
    this.updateAllCellsAfterRemoval()
    this.handleInventoryUpdate();
  }

  setIsUnlockedCell(coordinates: Point2D, isUnlocked: boolean) {
    const cell = this.getCell(coordinates)
    if (!cell) return
    const item = this.getItemInCell(coordinates)
    if (item) {
      this.removeItem(item)
    }
    cell.setIsUnlocked(isUnlocked)
    this.handleInventoryUpdate()
  }
  
  initGrid() {
    this.cellsData = [];
    for (let x = 0; x < this.gridSize.x; x++) {
      for (let y = 0; y < this.gridSize.y; y++) {
        const coords = new Point2D(x, y);
        const data = new CellData(coords)

        if (x === this.gridSize.x - 1) {
          data.getCellStyle().isEdge = true
        }

        this.cellsData.push(data);
      }
    }
  }

  getCell(coordinates: Point2D): CellData | undefined {
    return this.cellsData.find(cell => cell.coordinates.equals(coordinates));
  }

  setCellState(coordinates: Point2D, state: CellState): void {
    const cell = this.getCell(coordinates);
    if (cell) cell.setState(state);
  }

  setCellHighlightState(coordinates: Point2D, state: HightLightCellState): void {
    const cell = this.getCell(coordinates);
    if (cell) cell.setHighlightState(state);
  }

  isWithinBoundaries(coordinates: Point2D): boolean {
    return coordinates.x >= 0 && 
           coordinates.y >= 0 && 
           coordinates.x < this.gridSize.x && 
           coordinates.y < this.gridSize.y;
  }

  getItemInCell(coordinates: Point2D): Item | null {
    // Проходим по всем слотам инвентаря
    for (const slot of this.slots) {
      // Если в слоте отсутствует предмет или он на курсоре – пропускаем
      if (!slot.item || slot.onCursor) continue;
      
      // Получаем начальные координаты предмета
      const start = slot.item.getStartCoordinates();
      // Получаем смещения ячеек, которые занимает предмет
      const sizeOffsets = slot.item.getSizeInCells() as Point2D[];
      
      // Проверяем, занимает ли предмет ячейку с координатами `coordinates`
      const occupiesCell = sizeOffsets.some(offset => start.add(offset).equals(coordinates));
      
      if (occupiesCell) {
        return slot.item;
      }
    }
    // Если ни один предмет не найден – возвращаем null
    return null;
  }
  
  isFree(coordinates: Point2D): boolean {
    if (!this.isWithinBoundaries(coordinates)) return false;
    const cell = this.getCell(coordinates);
    return !!cell && cell.getState() === CellState.Free && cell.isUnlocked();
  }

  doesItemFit(sizeInCells: Point2D[], coordinates: Point2D, swap = false): HightLightCellState {
    const conflicts = new Set<Item>();
  
    for (const offset of sizeInCells) {
      const targetCoords = coordinates.add(offset);
      
      // Если координаты вне границ, то размещение невозможно
      if (!this.isWithinBoundaries(targetCoords)) {
        return HightLightCellState.InvalidPlacement;
      }
      
      const cell = this.getCell(targetCoords);
      if (!cell || cell.isUnlocked() === false) {
        return HightLightCellState.InvalidPlacement;
      }
      
      // Если ячейка занята, пытаемся получить предмет в этой ячейке
      if (cell.getState() === CellState.Occupied) {
        const occupyingItem = this.getItemInCell(targetCoords);
        if (occupyingItem) {
          conflicts.add(occupyingItem);
        }
      }
    }
    
    // Если конфликтов нет – размещение валидно
    if (conflicts.size === 0) {
      return HightLightCellState.ValidPlacement;
    }
    
    // Если конфликт ровно один, проверяем возможность замены
    if (conflicts.size === 1 && !swap) {

      return HightLightCellState.Replacement;
    }
    
    // В остальных случаях размещение недопустимо
    return HightLightCellState.InvalidPlacement;
  }

  updateCellsForItem(coordinates: Point2D, size: Point2D[], state: CellState): void {
    size.forEach(offset => {
      const targetCoords = coordinates.add(offset);
      if (this.getCell(targetCoords)?.getState() !== CellState.Occupied) {
        this.setCellState(targetCoords, state);
      }
      
      this.setCellHighlightState(targetCoords, HightLightCellState.None);
    });
  }

  addItem(item: Item): boolean {
    const itemInstance = this.createItem(item);
    const coordinates = this.findFreeSpaceForItem(itemInstance.getSizeInCells() as Point2D[]);
    if (coordinates.isValid()) {
      itemInstance.setStartCoordinates(coordinates);
      this.slots.push(new SlotData(itemInstance));
      this.updateCellsForItem(coordinates, itemInstance.getSizeInCells() as Point2D[], CellState.Occupied);
      this.handleInventoryUpdate();
      return true;
    }
    return false;
  }

  setItem(item: Item, destination: Point2D): boolean {
    if (destination.isValid()) {
      item.setStartCoordinates(destination);
      const data = new SlotData(item);
      data.onCursor = false;
      this.slots.push(data);
      this.updateCellsForItem(destination, item.getSizeInCells() as Point2D[], CellState.Occupied);
      this.handleInventoryUpdate();
      return true;
    }
    return false;
  }

  pickupItem(item: Item) {
    // Находим слот с предметом
    const slot = this.slots.find(s => s.item?.uniqueId === item.uniqueId);
    if (!slot) return;
    
    // Запоминаем текущие координаты
    const currentCoords = item.getStartCoordinates();
    
    // Удаляем предмет из инвентаря
    this.removeItem(item);
    
    // Используем оригинальный экземпляр и сохраняем его вместе с координатами
    // Если требуется, можно создать новый SlotData, сохраняя переданные координаты
    this.parent.itemOnCursor = new SlotData(item);
    // При необходимости можно восстановить координаты
    item.setStartCoordinates(currentCoords);
    
    this.parent.itemOnCursor.onCursor = true;
  }
  

  moveItem(slot: SlotData, destination: Point2D): void {
    const item = slot.item;
    if (!item) return;

    // Освобождаем старые ячейки
    this.updateCellsForItem(item.getStartCoordinates(), item.getSizeInCells() as Point2D[], CellState.Free);

    // Если перемещаем предмет с курсора – добавляем его в слоты
    if (item.uniqueId === this.parent.itemOnCursor?.item?.uniqueId) {
      this.slots.push(new SlotData(item));
      this.parent.itemOnCursor = null;
    }

    // Обновляем координаты предмета
    item.setStartCoordinates(destination);
    
    // Отмечаем новые ячейки как занятые
    this.updateCellsForItem(destination, item.getSizeInCells() as Point2D[], CellState.Occupied);

    this.handleInventoryUpdate();
  }

  private findFreeSpaceForItem(sizeInCells: Point2D[]): Point2D {
    return this.cellsData.find(cell => 
      cell.getState() === CellState.Free && 
      (this.doesItemFit(sizeInCells, cell.coordinates, true) === HightLightCellState.ValidPlacement
    || this.doesItemFit(sizeInCells, cell.coordinates, true) === HightLightCellState.Replacement)
    )?.coordinates || new Point2D(-1, -1);
  }

  createItem(item: Item): Item {
    item.setOwningInventory(this);
    return item;
  }

  private getConflictingItems(position: Point2D, item: Item): Set<Item> {
    const conflicts = new Set<Item>();
    const itemCells = item.getSizeInCells().map(offset => position.add(offset));
    
    itemCells.forEach(coords => {
      const itemInCell = this.getItemInCell(coords);
      if (itemInCell) {
        conflicts.add(itemInCell);
      }
    });
    
    return conflicts;
  }

  private updateAllCellsAfterRemoval(): void {
    this.cellsData.forEach(cell => {
      this.setCellState(cell.coordinates, CellState.Free);
    });
  }

  // Новый вспомогательный метод: обновляет ячейки после удаления предмета,
  // проверяя, не занята ли каждая ячейка другим предметом.
  private updateCellsAfterRemoval(itemPosition: Point2D, size: Point2D[]): void {
    size.forEach(offset => {
      const targetCoords = itemPosition.add(offset);
      // Если в ячейке обнаружен другой предмет, оставляем состояние Occupied,
      // иначе – Free.
      if (this.getItemInCell(targetCoords)) {
        this.setCellState(targetCoords, CellState.Occupied);
      } else {
        this.setCellState(targetCoords, CellState.Free);
      }
      this.setCellHighlightState(targetCoords, HightLightCellState.None);
    });
  }

  removeItemBySlot(slot: SlotData): boolean {
    const itemPosition = slot.item!.getStartCoordinates();
    const itemSize = slot.item!.getSizeInCells() as Point2D[];
    const slotIndex = this.slots.findIndex(s => s.item?.uniqueId === slot.item?.uniqueId);

    // Если предмет находится на курсоре – очищаем курсор
    if (this.parent.itemOnCursor?.item?.uniqueId === slot.item?.uniqueId) {
      this.parent.itemOnCursor = null;
    }

    // Удаляем слот из массива
    this.slots.splice(slotIndex, 1);

    // Обновляем ячейки с учётом возможных пересечений
    this.updateCellsAfterRemoval(itemPosition, itemSize);
    
    this.handleInventoryUpdate();
    
    return true;
  }

  removeItem(itemToRemove: Item): boolean {
    const slotIndex = this.slots.findIndex(slot => slot.item?.uniqueId === itemToRemove.uniqueId);
    if (slotIndex === -1) return false;

    const slot = this.slots[slotIndex];
    const itemPosition = slot.item!.getStartCoordinates();
    const itemSize = slot.item!.getSizeInCells() as Point2D[];

    // Если предмет находится на курсоре – очищаем курсор
    if (this.parent.itemOnCursor?.item?.uniqueId === itemToRemove.uniqueId) {
      this.parent.itemOnCursor = null;
    }

    // Сначала удаляем слот из массива, чтобы при проверке getItemInCell не вернуть удаляемый предмет
    this.slots.splice(slotIndex, 1);
    
    // Обновляем ячейки: если какая-то ячейка всё ещё занята другим предметом, оставляем Occupied
    this.updateCellsAfterRemoval(itemPosition, itemSize);
    
    this.handleInventoryUpdate();
    
    return true;
  }

  swapItem(item: Item, destination: Point2D) {
    if (this.parent.itemOnCursor === null) return;
    if (this.parent.itemOnCursor.item === null) return;

    // Помещаем предмет с курсора на новую позицию и обновляем ячейки
    this.setItem(this.parent.itemOnCursor.item, destination);
    // Затем поднимаем (снимаем) заменяемый предмет.
    this.pickupItem(item);
  }

  tryInsertSocketable(item: Item): boolean {
    console.log('trying', item);
    
    const socketable = this.parent.itemOnCursor?.item?.data
    console.log('trying2', socketable);
    if (socketable === null) return false
    if (socketable instanceof Socketable) {
      console.log('trying3', socketable);
      if (item.data.insertSocketable(socketable)) {
        console.log('trying4', socketable);
        return true
      }
    }
    console.log('trying5', socketable);
    return false
  }

  placeItemOnCursor(destination: Point2D) {
    if (this.parent.itemOnCursor === null) return;
    if (this.parent.itemOnCursor.item === null) return;
    const conflicts = this.getConflictingItems(destination, this.parent.itemOnCursor.item);
    
    if (conflicts.size > 1) return
    if (conflicts.size === 1) {
      const [toSwap] = conflicts;

    if (this.tryInsertSocketable(toSwap)) return

      this.swapItem(toSwap, destination);
    } else {
      this.moveItem(this.parent.itemOnCursor, destination);
    }
  }

  handleInventoryUpdate(): void {
      this.onInventoryUpdated.forEach(callback => callback());
  }

}
