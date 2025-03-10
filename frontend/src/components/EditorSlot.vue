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
import { Component, toNative, Watch} from "vue-facing-decorator";
import { EquipmentSlot, type SlotConfig } from "../models/EquipmentSlot";
import { EquipmentSlotComponent } from "./EquipmentSlot.vue";
import type { Item } from "../models/Item";

@Component({
  components: {
    EquipmentSlotComponent,
  }, emits: ['item-updated']
})
class EditorSlot extends EquipmentSlotComponent {
  override get config(): SlotConfig {
    return EquipmentSlot.editorSlotConfig();
  }

  // Whatever...
  override get equipmentSlot(): EquipmentSlot {
    const editorSlot = this.editorContext.getEditorSlot();
    if (!editorSlot) {
      const slot = new EquipmentSlot(
      EquipmentSlot.editorSlotConfig().style,
      EquipmentSlot.editorSlotConfig().slotName,

    );
    this.editorContext.setEditorSlot(slot);
    }
    return this.editorContext.getEditorSlot()!;
  }

  @Watch('equipmentSlot.slot.item')
  onSlotItemChange(newItem: Item): void {
    if (newItem && newItem.data) {
      this.emitItemUpdated(newItem);
    }
  }

  emitItemUpdated(item: Item): Item {
    this.$emit('item-updated', item)
    return item;
  }
  
}
export default toNative(EditorSlot)
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
