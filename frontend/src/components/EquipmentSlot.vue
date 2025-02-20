<template>
  <div class="equipment-slot" v-if="equipmentSlot">
    <CellComponent
      :cellData="equipmentSlot.cell"
      @cell-click="onClickOnCell"
      @cell-mouse-enter="onCellHover"
      @cell-mouse-leave="onCellMouseLeave"
    />

    <SlotComponent
      :slot-data="equipmentSlot.slot"
      @slot-click="onSlotClick"
      @slot-mouse-enter="onSlotHover"
      @slot-mouse-leave="onSlotMouseLeave"
    />
  </div>
</template>


<script lang="ts">
import { Component, Inject, Prop, Vue, Watch } from 'vue-facing-decorator';
import { Slot } from '../models/Slot';
import { Cell, HightLightCellState, type CellStyle } from '../models/Cell';
import CellComponent from './CellComponent.vue';
import SlotComponent from './SlotComponent.vue';
import type EditorContext from '../models/EditorContext';
import { EquipmentType } from '../models/Equipment';
import { Point2D } from '../models/Point2D';
import { Item } from '../models/Item';
import { EquipmentSlot } from '../models/EquipmentSlot';

@Component({
  components: {
    SlotComponent,
    CellComponent,
}, emits: ['slot-mouse-enter', 'slot-mouse-leave']})
export default class EquipmentSlotComponent extends Vue {
  @Inject({from: 'editorContext'}) 
  readonly editorContext!: EditorContext;
  
  @Prop({type: String, required: true}) 
  readonly slotName!: string;

  @Prop({required: false}) 
  readonly cellStyle!: CellStyle;

  get equipmentSlot(): EquipmentSlot {
    return this.editorContext.equipmentSlots.get(this.slotName)!;
  }

  isInitialized = true;

  mounted() {
    this.initializeComponents();
  }

  @Watch('equipment')
  onEquipmentChanged() {
    this.initializeComponents();
  }

  private initializeComponents() {
    this.equipmentSlot.cell = new Cell(new Point2D(1, 1));
    this.equipmentSlot.cell.setCellStyle(this.cellStyle)
    
    if (this.equipmentSlot.style.background !== '') {
      this.equipmentSlot.cell.getCellStyle().background = this.equipmentSlot.style.background
    }

    this.equipmentSlot.slot = new Slot(
      new Item(this.equipmentSlot.equipment, new Point2D(1, 1))
    );

    this.equipmentSlot.slot.item = null
    this.isInitialized = true;
  }

  private updateHighlight(state: HightLightCellState) {
    this.equipmentSlot.cell.setHighlightState(state);
  }

  private resetCellHighlights() {
    this.equipmentSlot.cell.setHighlightState(HightLightCellState.None);
  }

  isTypeValid(type: EquipmentType) {
    return this.equipmentSlot.equipment.type === type ? HightLightCellState.ValidPlacement : HightLightCellState.InvalidPlacement
  }

  pickupItem() {
    if (this.editorContext.itemOnCursor !== null) return
    this.editorContext.itemOnCursor = this.equipmentSlot.slot.clone()
    this.equipmentSlot.slot.onCursor = true
    this.equipmentSlot.slot.item = null

  }

  placeItem() {
    if (this.editorContext.itemOnCursor === null) return
    const copy = this.editorContext.itemOnCursor.clone()
    this.equipmentSlot.slot = copy
    this.editorContext.itemOnCursor = null
    
  }

  swapItem() {
    if (this.editorContext.itemOnCursor === null) return
    const copy = this.equipmentSlot.slot.clone()
    const cursor = this.editorContext.itemOnCursor.clone()
    cursor.onCursor = false
    copy.onCursor = true
    this.equipmentSlot.slot = cursor
    this.editorContext.itemOnCursor = copy
  }

  onClickOnCell() {
    if (this.editorContext.itemOnCursor === null) {
      this.placeItem();
    } else {
      this.swapItem()
    }
  }

   // ПЕРЕПИСАТЬ
   onSlotClick() {
    if (this.editorContext.itemOnCursor !== null && this.equipmentSlot.slot.item !== null) {
      this.swapItem()
    } else {
      if (this.equipmentSlot.slot.item) {
        this.pickupItem()
      } else {
        this.placeItem()
      }

      this.onSlotMouseLeave()
    }
  }

  onSlotHover(data: {slot: Slot, pos: {x: number, y: number}}) {
    if (!data.slot.item) return

    this.$emit('slot-mouse-enter', {equipment: data.slot.item.data, pos: {x: data.pos.x, y: data.pos.y}})

    this.onCellHover()
  }

  onSlotMouseLeave() {
    this.$emit('slot-mouse-leave')
    this.onCellMouseLeave()
  }


  onCellHover() {
    if (!this.editorContext.itemOnCursor?.item) return;
    
    const state = this.isTypeValid(this.editorContext.itemOnCursor?.item.data.type)
    this.updateHighlight(state);
  }

  onCellMouseLeave() {
    if (!this.editorContext.itemOnCursor?.item) return;
    this.resetCellHighlights();
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
