<template>
  <div class="slot-container" :style="style" @mouseenter="onMouseEnter" @mouseleave="onMouseLeave">
    <div v-if="!slotData.onCursor" class="slot-content">
      <ItemComponent
        v-if="slotData.item?.data"
        :equipment="slotData.item?.data"
        :showSockets="true"
        :pointerEvents="true"
        @item-click="onClick"
      />
    </div>
  </div>
</template>

<script lang="ts">
import { Component, Prop, toNative, Vue } from "vue-facing-decorator";
import { Slot } from "../models/Slot";
import type { CSSProperties } from "vue";
import ItemComponent from "./ItemComponent.vue";

@Component({
  components: {
    ItemComponent,
  },
  emits: ["slot-item-click", "slot-mouse-enter", "slot-mouse-leave"],
})
class SlotComponent extends Vue {
  @Prop({ type: Slot, required: true }) slotData!: Slot;

  onClick() {
    if (!this.slotData) return;
      this.$emit("slot-item-click", this.slotData);
  }

  onMouseEnter(): void {
    this.$emit("slot-mouse-enter", this.slotData);
  }

  onMouseLeave(): void {
    this.$emit("slot-mouse-leave");
  }

  get style(): CSSProperties {
    if (this.slotData.item === null || this.slotData.item.data === null) {
      return {
        border: "none",
      };
    } else {
      return {
        boxSizing: "border-box",
        borderWidth: "0.3rem",
        borderStyle: "inherit",
        borderImage: this.slotData.item?.rarityToBackgroundImage()
          ? `url(${this.slotData.item.rarityToBackgroundImage()}) 50 50 50 50 repeat`
          : "none",
        borderImageWidth: "96px",
        borderImageSlice: "64",
      };
    }
  }
}

export default toNative(SlotComponent)
</script>

<style scoped>
.slot-container {
  display: flex;
  align-items: center;
  justify-content: center;
}

.slot-content {
  pointer-events: all;
}
</style>
