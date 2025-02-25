<template>
  <div class="dragged-slot" :style="dragStyle()">
    <Item
      v-if="editorContext.itemOnCursor?.item?.data"
      :equipment="editorContext.itemOnCursor.item.data"
      :showSockets="true"
      :pointerEvents="false"
    />
  </div>
</template>

<script lang="ts">
import { Vue, Component, Inject } from "vue-facing-decorator";
import Item from "./ItemComponent.vue";
import type { CSSProperties } from "vue";
import type EditorContext from "../models/EditorContext";

@Component({
  components: { Item },
})
export default class DraggedSlot extends Vue {
  @Inject({ from: "editorContext" })
  readonly editorContext!: EditorContext;

  mouseX: number = -1000;
  mouseY: number = -1000;

  dragStyle(): CSSProperties {
    return {
      position: "fixed",
      top: `${this.mouseY}px`,
      left: `${this.mouseX}px`,
      transform: "translate(-50%, -50%)",
      zIndex: 1000,
    };
  }

  handleMouseMove(e: MouseEvent) {
    this.mouseX = e.clientX;
    this.mouseY = e.clientY;
  }

  mounted() {
    document.addEventListener("mousemove", this.handleMouseMove);
  }

  beforeDestroy() {
    document.removeEventListener("mousemove", this.handleMouseMove);
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
