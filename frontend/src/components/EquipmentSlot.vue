<template>
  <div class="equipment-slot" v-if="isInitialized">
  <CellComponent
    :cellData="cell"
    @cell-click="onClickOnCell"
    @cell-mouse-enter="onCellHover"
    @cell-mouse-leave="onCellMouseLeave"
  />


  <SlotComponent
    :slot-data="slot"
    @slot-click="onSlotClick"
    @slot-mouse-enter="onSlotHover"
    @slot-mouse-leave="onSlotMouseLeave"
  />
  </div>
</template>


<script lang="ts">
import { Component, Prop, Vue, Watch } from 'vue-facing-decorator';
import { SlotData } from '../models/SlotData';
import { CellData, HightLightCellState, type CellStyle } from '../models/CellData';
import CellComponent from './CellComponent.vue';
import SlotComponent from './SlotComponent.vue';
import type GameContext from '../models/GameContext';
import { Equipment, EquipmentType } from '../models/Equipment';
import { Point2D } from '../models/Point2D';
import { Item } from '../models/Item';
import { Inventory } from '../models/Inventory';

@Component({
  components: {
    SlotComponent,
    CellComponent,
}, emits: ['slot-mouse-enter', 'slot-mouse-leave']})
export default class EquipmentSlot extends Vue {
  @Prop({type: Object, required: true}) context!: GameContext;
  @Prop({type: Equipment, required: true}) equipment!: Equipment;
  @Prop({required: false}) cellStyle!: CellStyle;
  @Prop({required: false}) background!: string;
  cell!: CellData;
  slot!: SlotData;
  isInitialized = false;

  mounted() {
    this.initializeComponents();
  }

  @Watch('equipment')
  onEquipmentChanged() {
    this.initializeComponents();
  }

  private initializeComponents() {
    this.cell = new CellData(new Point2D(1, 1));
    this.cell.setCellStyle(this.cellStyle)
    
    if (this.background !== '') {
      this.cell.getCellStyle().background = this.background
    }

    this.slot = new SlotData(
      new Item(this.equipment, new Point2D(1, 1))
    );
    this.slot.parent = new Inventory(this.context, new Point2D(1, 1))
    this.isInitialized = true;
  }

  private updateHighlight(state: HightLightCellState) {
    this.cell.setHighlightState(state);
  }

  private resetCellHighlights() {
    this.cell.setHighlightState(HightLightCellState.None)
  }

  isTypeValid(type: EquipmentType) {
    return this.equipment.type === type ? HightLightCellState.ValidPlacement : HightLightCellState.InvalidPlacement
  }

  pickupItem() {
    if (this.context.itemOnCursor !== null) return
    this.context.itemOnCursor = this.slot.clone()
    this.slot.onCursor = true
    this.slot.item = null

  }

  placeItem() {
    if (this.context.itemOnCursor === null) return
    const copy = this.context.itemOnCursor.clone()
    this.slot = copy
    this.context.itemOnCursor = null
    
  }

  swapItem() {
    if (this.context.itemOnCursor === null) return
    const copy = this.slot.clone()
    const cursor = this.context.itemOnCursor.clone()
    cursor.onCursor = false
    copy.onCursor = true
    this.slot = cursor
    this.context.itemOnCursor = copy

  }

  onClickOnCell() {
    if (this.context.itemOnCursor === null) {
      this.placeItem();
    } else {
      this.swapItem()
    }
  }

   // ПЕРЕПИСАТЬ
   onSlotClick() {
    if (this.context.itemOnCursor !== null && this.slot.item !== null) {
      this.swapItem()
    } else {
      if (this.slot.item) {
        this.pickupItem()
      } else {
        this.placeItem()
      }

      this.onSlotMouseLeave()
    }
  }

  onSlotHover(data: {slot: SlotData, pos: {x: number, y: number}}) {
    if (!data.slot.item) return

    this.$emit('slot-mouse-enter', {equipment: data.slot.item.data, pos: {x: data.pos.x, y: data.pos.y}})

    this.onCellHover()
  }

  onSlotMouseLeave() {
    this.$emit('slot-mouse-leave')
    this.onCellMouseLeave()
  }


  onCellHover() {
    if (!this.context.itemOnCursor?.item) return;
    
    const state = this.isTypeValid(this.context.itemOnCursor?.item.data.type)
    this.updateHighlight(state);
  }

  onCellMouseLeave() {
    if (!this.context.itemOnCursor?.item) return;
    this.resetCellHighlights();
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
.equipment-slot {
  position: relative;
  width: 100%;
  height: 100%;
}

.equipment-slot .slot-container {
  position: absolute;
  width: 100%;
  height: 100%;
  top: 0%;
  left: 0%;
}

</style>
