<template>
  <div class="dragged-slot" :style="dragStyle()">
    <ItemComponent
      v-if="editorContext.getItemOnCursor()?.item?.data"
      :equipment="editorContext.getItemOnCursor()!.item!.data"
      :showSockets="true"
      :pointerEvents="false"
    />
  </div>
</template>

<script lang="ts">
import { Vue, Component, Inject } from "vue-facing-decorator";
import type { CSSProperties } from "vue";
import type EditorContext from "../models/EditorContext";
import { toNative } from "vue-facing-decorator";
import ItemComponent from "./ItemComponent.vue";

@Component({
  components: { ItemComponent },
})
class DraggedSlot extends Vue {
  @Inject({ from: "editorContext" })
  readonly editorContext!: EditorContext;

  dragStyle(): CSSProperties {
    return {
      position: "fixed",
      top: `${this.editorContext.mousePosition.y}px`,
      left: `${this.editorContext.mousePosition.x}px`,
      transform: "translate(-50%, -50%)",
      zIndex: 1000,
    };
  }
}

export default toNative(DraggedSlot)
</script>

<style scoped>
.dragged-slot {
  pointer-events: none;
  transition: transform 0.3s ease-out;
  will-change: transform;
}
</style>
