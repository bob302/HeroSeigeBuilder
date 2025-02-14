<template>
  <div class="charm-inventory-container">
    <!-- Cell Grid -->
    <div class="cell-grid" :style="getGridStyle()">
      <CellComponent
        v-for="(cell, index) in inventory.cellsData"
        :key="`cell-${cell.coordinates.x}-${cell.coordinates.y}`"
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
        v-for="(slotData, index) in inventory.slots"
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
import { Component, Prop, Vue } from 'vue-facing-decorator';
import { Inventory } from '../models/Inventory';
import { SlotData } from '../models/SlotData';
import { CellData, CellState, HightLightCellState } from '../models/CellData';
import { Point2D } from '../models/Point2D';
import CellComponent from './CellComponent.vue';
import SlotComponent from './SlotComponent.vue';
import DraggedSlot from './DraggedSlot.vue';
import type { Equipment } from '../models/Equipment';

@Component({
  components: {
    SlotComponent,
    CellComponent,
    DraggedSlot
}, emits: ['slot-mouse-enter', 'slot-mouse-leave']})
export default class CharmGrid extends Vue {
  @Prop({type: Inventory, required: true}) inventory!: Inventory
  @Prop({type: Number, required: false}) cellSize: number = 2.9

  private updateHighlight(base: Point2D, state: HightLightCellState) {
    this.inventory.parent.itemOnCursor!.item!.getSizeInCells().forEach(offset => {
      const coord = base.add(offset);
      const cell = this.inventory.getCell(coord)
      if (cell) {
        cell.setHighlightState(state);
        }
      });
  }


  private resetCellHighlights() {
    this.inventory.cellsData.forEach(cell => {
        cell.setHighlightState(HightLightCellState.None)
    }
  );
  }

  private placeItem(coords: Point2D) {
    this.inventory.placeItemOnCursor(coords)
  }

  onClickOnCell(cellData: CellData) {
    if (!this.inventory.parent.itemOnCursor?.item) return;

    const isValid = this.inventory.doesItemFit(this.inventory.parent.itemOnCursor.item.getSizeInCells() as Point2D[], cellData.coordinates);
    if (isValid === HightLightCellState.ValidPlacement || isValid === HightLightCellState.Replacement) {
      this.placeItem(cellData.coordinates);
    }
  }

   // ПЕРЕПИСАТЬ
   onSlotClick(slotData: SlotData) {
    if (this.inventory.parent.itemOnCursor || !slotData.item) {
      this.placeItem(slotData.item?.startCoordinates!)
    } else {
    //this.inventory.removeItemBySlot(slotData)
    this.inventory.pickupItem(slotData.item)
    this.onSlotMouseLeave()
    }
  }

  onSlotHover(data: {slot: SlotData, pos: {x: number, y: number}}) {
    if (!data.slot.item) return
    const cell = this.inventory.getCell(data.slot.item?.getStartCoordinates())
    if (!cell) return
    this.$emit('slot-mouse-enter', {equipment: data.slot.item.data, pos: {x: data.pos.x, y: data.pos.y}})

    this.onCellHover(cell)
  }

  onSlotMouseLeave() {
    this.$emit('slot-mouse-leave')
    this.onCellMouseLeave()
  }


  onCellHover(cell: CellData) {
    if (!this.inventory.parent.itemOnCursor?.item) return;
    
    const state = this.inventory.doesItemFit(this.inventory.parent.itemOnCursor.item.getSizeInCells() as Point2D[], cell.coordinates);
    this.updateHighlight(cell.coordinates, state);
  }

  onCellMouseLeave() {
    if (!this.inventory.parent.itemOnCursor?.item) return;
    this.resetCellHighlights();
  }

  getCellIndex(inCoordinates: Point2D): number {
    for (let i = 0; i < this.inventory.cellsData.length; i++) {
      if (this.inventory.cellsData[i].coordinates.equals(inCoordinates)) {
        return i
      }
    }

    return -1
  }

  getGridStyle() {
    const { x, y } = this.inventory.gridSize;
    return {
      display: 'grid',
      gridTemplateColumns: `repeat(${x}, 1fr)`,
      gridTemplateRows: `repeat(${y}, 1fr)`,
      maxWidth: `${x * this.cellSize}rem`,
      maxHeight: `${y * this.cellSize}rem`,
    };
  }

  private getCellPositionStyle(cell: CellData) {
    return {
      gridColumn: cell.coordinates.x + 1,
      gridRow: cell.coordinates.y + 1,
      backgroundImage: `linear-gradient(135deg, ${cell.getColor()}, rgba(0, 0, 0, 0.2)), url("/img/editor/item-background.png")`
    };
  }



  private getSlotStyle(slot: SlotData) {
    const start = slot.item?.getStartCoordinates();
    if (!start) return {};
    
    const size = slot.item?.size ?? { x: 1, y: 1 };
    return {
      gridColumn: `${start.x + 1} / span ${size.x}`,
      gridRow: `${start.y + 1} / span ${size.y}`,
    };
  }

onCellCreated(cell: CellData): void {

}

onSlotCreated(slot: SlotData): void {
  
}

onSlotRemoved(slot: SlotData): void {

}
}
</script>

<style scoped>
/* Общий контейнер для слоев */
.charm-inventory-container {
  display: grid;
  position: relative;
  width: 100%;
  height: 100%;
}

/* Слой ячеек */
.cell-grid {
  grid-row: 1;
  grid-column: 1;
  z-index: 1; /* Низкий z-index, чтобы быть ниже слотов */
}

/* Слой слотов */
.slot-grid {
  pointer-events: none;
  grid-row: 1;
  grid-column: 1;
  z-index: 2; /* Высокий z-index, чтобы отображаться поверх ячеек */
}
</style>
