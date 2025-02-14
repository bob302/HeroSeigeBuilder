import type { CellData } from "./CellData";
import type { Inventory } from "./Inventory";
import type { SlotData } from "./SlotData";

export default class GameContext {
  itemOnCursor: SlotData | null = null;
  thrashCan: CellData | null = null;
  inventories: Inventory[] = []

  constructor() {

  }
}