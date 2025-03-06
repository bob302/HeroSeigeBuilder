<template>
  <div class="equipment-slot" v-if="equipmentSlot">
    <CellComponent
      class ="equipment-slot-cell"
      :cellData="equipmentSlot.cell"
      @cell-click="onClickOnCell"
      @cell-mouse-enter="onCellHover"
      @cell-mouse-leave="onCellMouseLeave"
    />

    <SlotComponent
      v-if="equipmentSlot.slot.item !== null"
      class="equipment-slot-slot"
      :slot-data="equipmentSlot.slot"
      @slot-item-click="onSlotClick"
      @slot-mouse-enter="onSlotHover"
      @slot-mouse-leave="onSlotMouseLeave"
      @touchend.prevent
    />
  </div>
</template>

<script lang="ts">
import { Component, Inject, Prop, toNative, Vue, Watch } from "vue-facing-decorator";
import { Slot } from "../models/Slot";
import { Cell, HightLightCellState, type CellStyle } from "../models/Cell";
import CellComponent from "./CellComponent.vue";
import SlotComponent from "./SlotComponent.vue";
import type EditorContext from "../models/EditorContext";
import { Point2D } from "../models/Point2D";
import { Item } from "../models/Item";
import { EquipmentSlot } from "../models/EquipmentSlot";

@Component({
  components: {
    SlotComponent,
    CellComponent,
  }
})
class EquipmentSlotComponent extends Vue {
  @Inject({ from: "editorContext" })
  readonly editorContext!: EditorContext;

  @Prop({ type: String, required: true })
  readonly slotName!: string;

  @Prop({ required: false })
  readonly cellStyle!: CellStyle;

  get equipmentSlot(): EquipmentSlot {
    return this.editorContext.equipmentSlots.get(this.slotName)!;
  }

  isInitialized = true;

  mounted() {
    this.initializeComponents();
  }

  @Watch("equipment")
  onEquipmentChanged() {
    this.initializeComponents();
  }

  private initializeComponents() {
    this.equipmentSlot.cell = new Cell(new Point2D(1, 1));
    this.equipmentSlot.cell.setCellStyle(this.cellStyle);

    if (this.equipmentSlot.style.background !== "") {
      this.equipmentSlot.cell.getCellStyle().background =
        this.equipmentSlot.style.background;
    }

    this.equipmentSlot.slot = new Slot(
      new Item(this.equipmentSlot.equipment, new Point2D(1, 1)),
    );

    this.equipmentSlot.slot.item = null;
    this.isInitialized = true;
  }

  private updateHighlight(state: HightLightCellState) {
    this.equipmentSlot.cell.setHighlightState(state);
  }

  private resetCellHighlights() {
    this.equipmentSlot.cell.setHighlightState(HightLightCellState.None);
  }

  pickupItem() {
    if (this.editorContext.isItemOnCursor()) return
    this.editorContext.pickupSlotOnCursor(this.equipmentSlot.slot);
  }

  placeItem() {
    const onCursor = this.editorContext.getItemOnCursor(); 
    if (onCursor === null || !onCursor.item) return
    
    if (this.equipmentSlot.isRestricted(undefined, onCursor.item?.data.subtype)) return
    
    this.editorContext.putItemInEquipmentSlot(this.equipmentSlot, onCursor.item)
  }

  swapItem() {
    if (!this.editorContext.isItemOnCursor()) return

    const onCursor = this.editorContext.getItemOnCursor(); 

    if (!onCursor) return

    if (this.equipmentSlot.isRestricted(undefined, onCursor.item?.data.subtype)) return

    const slotCopy = this.equipmentSlot.slot.clone()
    if (this.editorContext.putItemInEquipmentSlot(this.equipmentSlot, onCursor.item!)) {
      this.editorContext.pickupSlotOnCursor(slotCopy)
    }
    
  }

  onClickOnCell() {
    const item = this.editorContext.getItemOnCursor(); 
    if (item !== null) {
      if (this.equipmentSlot.isRestricted(undefined, item.item?.data.subtype)) return
      this.placeItem();
    }
  }

  onSlotClick() {
    if (this.editorContext.isItemOnCursor() && this.equipmentSlot.slot.item !== null) {
      const item = this.editorContext.getItemOnCursor(); 
      
      if (!item?.item) return
      
      this.swapItem();
    } else {
      if (this.equipmentSlot.slot.item !== null) {
        this.pickupItem();
      } else {
        this.placeItem();
      }

      this.onSlotMouseLeave();
    }
  }

  onSlotHover() {
    this.onCellHover();
  }

  onSlotMouseLeave() {
    this.onCellMouseLeave();
  }

  onCellHover() {
    const item = this.editorContext.getItemOnCursor(); 
    if (!item) return;

    const state = this.equipmentSlot.isRestricted(undefined, item.item?.data.subtype) ? HightLightCellState.InvalidPlacement : HightLightCellState.ValidPlacement

    this.updateHighlight(state);
  }

  onCellMouseLeave() {
    if (!this.editorContext.getItemOnCursor()?.item) return;
    this.resetCellHighlights();
  }

  onCellCreated(): void {}

  onSlotCreated(): void {}

  onSlotRemoved(): void {}
}

export default toNative(EquipmentSlotComponent)
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
