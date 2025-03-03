<template>
  <div class="display-container" :class="{ saved: isSaved }" >
    <div class="item">
      <ItemComponent :equipment="equipment" :showSockets="showSockets" :pointerEvents="true" @item-click="onItemClick"/>
    </div>
    <div class="frame"
      :style="`background: radial-gradient(circle at center, ${ColorUtils.rarityToColorRGBA(equipment.rarity)}, var(--color-background) 40% 100%);`">
    </div>
  </div>
</template>

<script lang="ts">
import { Component, Prop, toNative } from "vue-facing-decorator";
import { ItemComponent } from "./ItemComponent.vue";
import ColorUtils from "../util/ColorUtils";

@Component({
  name: "CatalogItem",
  components: { ItemComponent }
})
class CatalogItem extends ItemComponent {
  @Prop({ type: String, required: false }) src!: string;

  pointerEvents: boolean = false;
  isSaved = false;

  ColorUtils = ColorUtils
}

export default toNative(CatalogItem);
</script>

<style scoped>
.display-container {
  width: 7.6rem;
  height: 11.32rem;
  max-width: 7.6rem;
  max-height: 11.32rem;
  pointer-events: none;
  overflow: hidden;
  display: flex;
  justify-content: center;
  align-items: center;
}

.frame {
  min-width: 98%;
  min-height: 98%;
  position: absolute;
  top: 0;
  left: 0;
  z-index: 9;
  user-select: none;
  border: 2px solid var(--color-border);
}

.item {
  z-index: 10;
}

.display-container:hover {
  overflow: visible;
}
</style>
