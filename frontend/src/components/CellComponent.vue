<template>
  <div
    class="cell-container"
    :style="style"
    @mouseenter="onMouseEnter"
    @mouseleave="onMouseLeave"
    @click="onClick"
    @dragover.prevent
  ></div>
</template>

<script lang="ts">
import { Component, Prop, toNative, Vue } from "vue-facing-decorator";
import { Cell } from "../models/Cell";
import type { CSSProperties } from "vue";

@Component({
  emits: ["cell-click", "cell-mouse-enter", "cell-mouse-leave"]
})
class CellComponent extends Vue {
  @Prop({ type: Cell, required: true }) cellData!: Cell;

  onMouseEnter(): void {
    this.$emit("cell-mouse-enter", this.cellData);
  }

  onMouseLeave(): void {
    this.$emit("cell-mouse-leave", this.cellData);
  }

  onClick(): void {
    this.$emit("cell-click", this.cellData);
  }

  get style(): CSSProperties {
    const cellStyle = this.cellData.getCellStyle();
    
    return {
      display: this.cellData.isUnlocked() ? "inline-block" : "none",
      height: `100%`,
      width: `100%`,
      ...(cellStyle.background
        ? {
            backgroundImage: `conic-gradient(${this.cellData.getColor()}, ${this.cellData.getColor()}), url(${cellStyle.background})`,
            backgroundSize: "cover",
            imageRendering: "pixelated"
          }
        : {
            border: cellStyle.border,
            borderImage: `url('${this.cellData.getCellStyle().borderImage}') 6 round`,
            imageRendering: "pixelated"
          }),
    };
  }
}
export default toNative(CellComponent)
</script>

<style scoped>
</style>
