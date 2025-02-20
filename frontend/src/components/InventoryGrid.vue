<template>
  <div class="inventory-grid-wrapper">
    <!-- Cell Grid -->
    <div class="cell-grid" :style="getGridStyle()">
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
    <div class="slot-grid" :style="getGridStyle()">
      <SlotComponent
        v-for="(slotData, index) in getInventory().slots"
        :key="'slot-' + index"
        :slot-data="slotData"
        :style="getSlotStyle(slotData)"
        :cell-size="cellSize"
        @slot-click="onSlotClick"
        @slot-mouse-enter="onSlotHover"
        @slot-mouse-leave="onSlotMouseLeave"
      />
    </div>
  </div>
</template>


<script lang="ts">
import { Component, Inject, Prop, Vue, Watch } from 'vue-facing-decorator';
import { Inventory } from '../models/Inventory';
import { Slot } from '../models/Slot';
import { Cell, HightLightCellState } from '../models/Cell';
import { Point2D } from '../models/Point2D';
import CellComponent from './CellComponent.vue';
import SlotComponent from './SlotComponent.vue';
import type EditorContext from '../models/EditorContext';

@Component({
  components: {
    SlotComponent,
    CellComponent
}, emits: ['slot-mouse-enter', 'slot-mouse-leave']})
export default class InventoryGrid extends Vue {
  @Inject({from: 'editorContext'}) 
  readonly editorContext!: EditorContext;
  
  @Prop({type: String, required: true}) inventoryName!: 'main' | 'charm'
  @Prop({type: Number, required: false}) cellSize: number = 2.5 

  getInventory(): Inventory {
    return this.editorContext.inventories.get(this.inventoryName)!;
  }
  

  private updateHighlight(base: Point2D, state: HightLightCellState) {
    this.editorContext.itemOnCursor!.item!.getSizeInCells().forEach(offset => {
      const coord = base.add(offset);
      const cell = this.getInventory().getCell(coord)
      if (cell) {
        cell.setHighlightState(state);
        }
      });
  }


  private resetCellHighlights() {
    this.getInventory().cellsData.forEach(cell => {
        cell.setHighlightState(HightLightCellState.None)
    }
  );
  }

  private placeItem(coords: Point2D) {
    this.getInventory().placeItemOnCursor(coords)
  }

  onClickOnCell(cellData: Cell) {
    if (!this.editorContext.itemOnCursor?.item) return;

    const isValid = this.getInventory().doesItemFit(this.editorContext.itemOnCursor.item.getSizeInCells() as Point2D[], cellData.coordinates);
    if (isValid === HightLightCellState.ValidPlacement || isValid === HightLightCellState.Replacement) {
      this.placeItem(cellData.coordinates);
    }
  }
  
   // ПЕРЕПИСАТЬ
   onSlotClick(slotData: Slot) {
    if (this.editorContext.itemOnCursor || !slotData.item) {
      this.placeItem(slotData.item?.startCoordinates!)
    } else {
    this.getInventory().pickupItem(slotData.item)
    this.onSlotMouseLeave()
    }
  }

  onSlotHover(data: {slot: Slot, pos: {x: number, y: number}}) {
    if (!data.slot.item) return
    const cell = this.getInventory().getCell(data.slot.item?.getStartCoordinates())
    if (!cell) return
    this.$emit('slot-mouse-enter', {equipment: data.slot.item.data, pos: {x: data.pos.x, y: data.pos.y}})

    this.onCellHover(cell)
  }

  onSlotMouseLeave() {
    this.$emit('slot-mouse-leave')
    this.onCellMouseLeave()
  }


  onCellHover(cell: Cell) {
    if (!this.editorContext.itemOnCursor?.item) return;
    
    const state = this.getInventory().doesItemFit(this.editorContext.itemOnCursor.item.getSizeInCells() as Point2D[], cell.coordinates);
    this.updateHighlight(cell.coordinates, state);
  }

  onCellMouseLeave() {
    if (!this.editorContext.itemOnCursor?.item) return;
    this.resetCellHighlights();
  }

  getCellIndex(inCoordinates: Point2D): number {
    for (let i = 0; i < this.getInventory().cellsData.length; i++) {
      if (this.getInventory().cellsData[i].coordinates.equals(inCoordinates)) {
        return i
      }
    }

    return -1
  }

  getGridStyle() {
    const { x, y } = this.getInventory().gridSize;
    return {
      display: 'grid',
      gridTemplateColumns: `repeat(${x}, 1fr)`,
      gridTemplateRows: `repeat(${y}, 1fr)`,
      maxWidth: `${x * this.cellSize}rem`,
      maxHeight: `${y * this.cellSize}rem`,
    };
  }

  private getCellPositionStyle(cell: Cell) {
    return {
      gridColumn: cell.coordinates.x + 1,
      gridRow: cell.coordinates.y + 1,
      backgroundImage: `linear-gradient(135deg, ${cell.getColor()}, rgba(0, 0, 0, 0.2)), url("/img/editor/item-background.png")`
    };
  }



  private getSlotStyle(slot: Slot) {
    const start = slot.item?.getStartCoordinates();
    if (!start) return {};
    
    const size = slot.item?.size ?? { x: 1, y: 1 };
    return {
      gridColumn: `${start.x + 1} / span ${size.x}`,
      gridRow: `${start.y + 1} / span ${size.y}`,
    };
  }

onCellCreated(cell: Cell): void {

}

onSlotCreated(slot: Slot): void {
  
}

onSlotRemoved(slot: Slot): void {

}
}
</script>

<style scoped>
.inventory-grid-wrapper {
  max-height: 38rem;
  display: grid;
  position: relative;
}

.cell-grid {
  grid-row: 1;
  grid-column: 1;
  z-index: 1;
}

.slot-grid {
  pointer-events: none;
  grid-row: 1;
  grid-column: 1;
  z-index: 2;
}
</style>
