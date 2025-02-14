<template>
  <div class="dragged-slot" :style="dragStyle()">
    <Item 
      v-if="slotData.item?.data" 
      :equipment="slotData.item.data" 
      :showSockets="true" 
      :pointerEvents="false"
    />
  </div>
</template>

<script lang="ts">
import { Vue, Component, Prop } from "vue-facing-decorator";
import { SlotData } from "../models/SlotData";
import Item from "./ItemComponent.vue";
import type { CSSProperties } from "vue";

@Component({
  components: { Item }
})
export default class DraggedSlot extends Vue {
  @Prop({ type: Object, required: true }) slotData!: SlotData;

  mouseX: number = -1000;
  mouseY: number = -1000;

  dragStyle(): CSSProperties {
    return {
      position: 'fixed',
      top: `${this.mouseY}px`,
      left: `${this.mouseX}px`,
      transform: 'translate(-50%, -50%)',
      zIndex: 1000
    };
  }

  handleMouseMove(e: MouseEvent) {
    this.mouseX = e.clientX;
    this.mouseY = e.clientY;
  }

  mounted() {
    document.addEventListener('mousemove', this.handleMouseMove);
  }

  beforeDestroy() {
    document.removeEventListener('mousemove', this.handleMouseMove);
  }
}
</script>

<style scoped>
.dragged-slot {
  pointer-events: none;
  transition: transform 0.3s ease-out;
  will-change: transform;
}

</style>