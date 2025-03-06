<template>
  <div class="catalog">
    <CatalogItem
      v-for="item in catalogItems"
      :showSockets="showSockets"
      :key="item.uuid"
      :equipment="item"
      :src="itemBackgroundSrc"
      :highlighted="item.uuid === highlightedItem"
      @item-click="handleItemClick(item)"
    />
  </div>
</template>

<script lang="ts">
import { Component, Inject, Prop, toNative, Vue } from "vue-facing-decorator";
import CatalogItem from "./CatalogItem.vue";
import { BaseItem, CharmEquipment } from "../models/Equipment";
import type EditorContext from "../models/EditorContext";
import { Item } from "../models/Item";
import { Point2D } from "../models/Point2D";

@Component({
  components: { CatalogItem },
  emits: ['item-added']
})
class EquipmentCatalog extends Vue {
  @Inject({ from: "editorContext" })
  readonly editorContext!: EditorContext;
  @Prop({ type: Array, required: true }) catalogItems!: BaseItem[];
  @Prop({ type: String, required: false }) itemBackgroundSrc: string =
    "/img/editor/item-background.png";
  @Prop({ type: Boolean, required: false }) showSockets: boolean = false;

  highlightedItem: string | null = null

  handleItemClick(equipment: BaseItem) {
  const targetInventory =
    equipment instanceof CharmEquipment
      ? this.editorContext.charmInventory
      : this.editorContext.mainInventory;

  const clone = equipment.clone();
  const item = new Item(clone, new Point2D(equipment.size.width, equipment.size.height));

  const added = targetInventory.addItem(item) || this.editorContext.mainInventory.addItem(item);

  if (added) {
    this.hightlight(equipment.uuid);
  }
}

private hightlight(uuid: string) {
  this.$emit("item-added");

    this.highlightedItem = uuid;
    setTimeout(() => {
      this.highlightedItem = null;
    }, 300);
}

}

export { EquipmentCatalog }
export default toNative(EquipmentCatalog)
</script>

<style>
.catalog {
  display: grid;
  align-content: flex-start;
  grid-template-columns: repeat( auto-fit, minmax(6rem, 1fr) );
  width: 100%;
  max-width: 100%;
  max-height: 100%;
  min-width: 38rem;
  overflow-y: auto;
  overflow-x: hidden;
  gap: 0.2rem;
  background-color: var(--color-background);
}

.catalog > * {
  scale: 0.65;
  margin: -1.8rem -0.9rem -1.8rem -0.9rem;
}

@media (max-width: 768px) {
  .catalog {
    grid-template-columns: repeat(3, 1fr);
    min-width: 0;
    overflow-x: auto;
    padding: 0;
    grid-gap: 1rcap;
    -webkit-overflow-scrolling: touch;
  }

  .catalog > * {
    scale: 0.75;
  }
}
</style>
