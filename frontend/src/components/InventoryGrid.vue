<template>
  <div class="inventory-grid-wrapper">
    <!-- Cell Grid -->
    <div class="cell-grid" :style="[getGridStyle, { pointerEvents: cellClickCooldown ? 'none' : 'auto' }]">
      <CellComponent
        v-for="(cell, index) in getInventory().cellsData"
        :key="'cell-' + index"
        :cellData="cell"
        :style="getCellPositionStyle(cell)"
        @cell-click="onClickOnCell"
        @cell-mouse-enter="onCellHover"
        @cell-mouse-leave="onCellMouseLeave"
      />
    </div>

    <!-- Slot Grid -->
    <div class="slot-grid" :style="getGridStyle">
      <SlotComponent
        v-for="(slotData, index) in getInventory().slots"
        :key="'slot-' + index"
        :slot-data="slotData"
        :style="getSlotStyle(slotData)"
        :cell-size="cellSize"
        @slot-item-click="onSlotClick"
        @slot-mouse-enter="onSlotHover"
        @slot-mouse-leave="onSlotMouseLeave"
      />
    </div>
  </div>
</template>

<script lang="ts">
import { Component, Inject, Prop, toNative, Vue } from "vue-facing-decorator";
import { Inventory } from "../models/Inventory";
import { Slot } from "../models/Slot";
import { Cell, HightLightCellState } from "../models/Cell";
import { Point2D } from "../models/Point2D";
import CellComponent from "./CellComponent.vue";
import SlotComponent from "./SlotComponent.vue";
import type EditorContext from "../models/EditorContext";
import type { CSSProperties } from "vue";

enum GridType {
  cell,
  slot
}

@Component({
  components: {
    SlotComponent,
    CellComponent,
  },
  emits: ["slot-mouse-enter", "slot-mouse-leave"],
})
class InventoryGrid extends Vue {
  @Inject({ from: "editorContext" })
  readonly editorContext!: EditorContext;

  @Prop({ type: String, required: true }) inventoryName!: "main" | "charm";

  GridType = GridType

  public cellClickCooldown = false;

  cellSize() : number {
    const size = this.getInventory().cellStyle.size
    if (!size) {
      throw new Error(`Inventory cell size ${this.inventoryName} not set in config`)
    }
    return size
  }

  getInventory(): Inventory {
    return this.editorContext.getInventories().get(this.inventoryName)!;
  }

  private updateHighlight(base: Point2D, state: HightLightCellState) {
    this.editorContext
      .getItemOnCursor()!.item!.getSizeInCells()
      .forEach((offset) => {
        const coord = base.add(offset);
        const cell = this.getInventory().getCell(coord);
        if (cell) {
          cell.setHighlightState(state);
        }
      });
  }

  private resetCellHighlights() {
    this.getInventory().cellsData.forEach((cell) => {
      cell.setHighlightState(HightLightCellState.None);
    });
  }

  private placeItem(coords: Point2D) {
    this.getInventory().placeItemOnCursor(coords);
  }

  onClickOnCell(cellData: Cell) {
    const onCursor = this.editorContext.getItemOnCursor()
    if (!onCursor?.item) return;

    const isValid = this.getInventory().doesItemFit(
      onCursor.item.getSizeInCells() as Point2D[],
      cellData.coordinates,
    );
    if (
      isValid === HightLightCellState.ValidPlacement ||
      isValid === HightLightCellState.Replacement
    ) {
      this.placeItem(cellData.coordinates);
    }
  }

  onSlotClick(slotData: Slot) {
    if (this.editorContext.getItemOnCursor() || !slotData.item) {
      this.placeItem(slotData.item?.startCoordinates!);
    } else {
      this.getInventory().pickupItem(slotData.item);
      this.onSlotMouseLeave();
    }

    this.cellClickCooldown = true;
    setTimeout(() => {
      this.cellClickCooldown = false;
    }, 300);
  }

  onSlotHover(slot: Slot) {
    if (!slot.item) return;

    const cell = this.getInventory().getCell(slot.item?.getStartCoordinates());

    if (!cell) return;
    this.$emit("slot-mouse-enter", slot.item.data);

    this.onCellHover(cell);
  }

  onSlotMouseLeave() {
    this.$emit("slot-mouse-leave");
    this.onCellMouseLeave();
  }

  onCellHover(cell: Cell) {
    const onCursor = this.editorContext.getItemOnCursor();
    if (!onCursor?.item) return;
    const state = this.getInventory().doesItemFitWithType(
      onCursor.item.getSizeInCells() as Point2D[],
      cell.coordinates, onCursor.item.data.subtype
    );
    this.updateHighlight(cell.coordinates, state);
  }

  onCellMouseLeave() {
    if (!this.editorContext.getItemOnCursor()?.item) return;
    this.resetCellHighlights();
  }

  getCellIndex(inCoordinates: Point2D): number {
    for (let i = 0; i < this.getInventory().cellsData.length; i++) {
      if (this.getInventory().cellsData[i].coordinates.equals(inCoordinates)) {
        return i;
      }
    }

    return -1;
  }

  get getGridStyle(): CSSProperties {
    const { x, y } = this.getInventory().gridSize;
    const scaleFactor = this.editorContext.getScaleFactor()
    
    return {
      display: "grid",
      gridTemplateColumns: `repeat(${x}, 1fr)`,
      gridTemplateRows: `repeat(${y}, 1fr)`,
      width: `${x * this.cellSize() * scaleFactor}rem`,
      height: `${y * this.cellSize() * scaleFactor}rem`
    };
  }

  getCellPositionStyle(cell: Cell) {
    return {
      gridColumn: cell.coordinates.x + 1,
      gridRow: cell.coordinates.y + 1
    };
  }

  getSlotStyle(slot: Slot) {
    const start = slot.item?.getStartCoordinates();
    if (!start) return {};

    const size = slot.item?.size ?? { x: 1, y: 1 };
    return {
      gridColumn: `${start.x + 1} / span ${size.x}`,
      gridRow: `${start.y + 1} / span ${size.y}`,
    };
  }

  onCellCreated(): void {}

  onSlotCreated(): void {}

  onSlotRemoved(): void {}
}

export default toNative(InventoryGrid)
</script>

<style scoped>
.inventory-grid-wrapper {
  display: grid;
  position: relative;
  max-width: 90%;
}

.cell-grid {
  grid-row: 1;
  grid-column: 1;
  z-index: 1;
}

.slot-grid {
  grid-row: 1;
  grid-column: 1;
  z-index: 2;
  pointer-events: none;
}
</style>
