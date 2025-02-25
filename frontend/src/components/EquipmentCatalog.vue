<template>
  <div class="catalog">
    <ItemDisplay
      v-for="item in catalogItems"
      :showSockets="showSockets"
      :key="item.uuid"
      :equipment="item"
      :src="itemBackgroundSrc"
      @click="handleItemClick(item)"
    />
  </div>
</template>

<script lang="ts">
import { Component, Inject, Prop, toNative, Vue } from "vue-facing-decorator";
import ItemDisplay from "./ItemDisplay.vue";
import { BaseItem, CharmEquipment } from "../models/Equipment";
import type EditorContext from "../models/EditorContext";
import { Item } from "../models/Item";
import { Point2D } from "../models/Point2D";

@Component({
  components: { ItemDisplay },
})
class EquipmentCatalog extends Vue {
  @Inject({ from: "editorContext" })
  readonly editorContext!: EditorContext;
  @Prop({ type: Array, required: true }) catalogItems!: BaseItem[];
  @Prop({ type: String, required: false }) itemBackgroundSrc: string =
    "/img/editor/item-background.png";
  @Prop({ type: Boolean, required: false }) showSockets: boolean = false;

  handleItemClick(equipment: BaseItem) {
    const targetInventory =
      equipment instanceof CharmEquipment
        ? this.editorContext.charmInventory
        : this.editorContext.mainInventory;

    if (
      !targetInventory.addItem(
        new Item(
          equipment.clone(),
          new Point2D(equipment.size.width, equipment.size.height),
        ),
      )
    ) {
      this.editorContext.mainInventory.addItem(
        new Item(
          equipment.clone(),
          new Point2D(equipment.size.width, equipment.size.height),
        ),
      );
      this.$emit("item-added");
    }
  }
}

export default toNative(EquipmentCatalog)
</script>

<style>
.catalog {
  display: grid;
  align-content: flex-start;
  grid-template-columns: 1fr repeat(10, 1fr) 1fr;
  width: 100%;
  max-width: 100%;
  max-height: 100%;
  min-width: 38rem;
  overflow-y: auto;
  overflow-x: hidden;
  gap: 0.2rem;
}

.catalog > * {
  scale: 0.65;
  margin: -1.8rem -0.9rem -1.8rem -0.9rem;
}
</style>
