<template>
  <div
    class="cell-content"
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
  emits: ["cell-click", "cell-mouse-enter", "cell-mouse-leave"],
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

  isMobile = window.innerWidth <= 768;

  mounted() {
    window.addEventListener("resize", this.handleResize);
  }

  beforeDestroy() {
    window.removeEventListener("resize", this.handleResize);
  }

  handleResize() {
    this.isMobile = window.innerWidth <= 768;
  }

  get style(): CSSProperties {
    const cellStyle = this.cellData.getCellStyle();
    const scaleFactor = this.isMobile ? 0.75 : 1;

    return {
      display: this.cellData.isUnlocked() ? "inline-block" : "none",
      height: `calc(${cellStyle.height} * ${scaleFactor})`,
      width: `calc(${cellStyle.width} * ${scaleFactor})`,
      ...(cellStyle.background
        ? {
            backgroundImage: `conic-gradient(${this.cellData.getColor()}, ${this.cellData.getColor()}), url(${cellStyle.background})`,
            backgroundSize: "cover",
          }
        : {
            border: cellStyle.border,
            borderImage: `url('${this.cellData.getCellStyle().borderImage}') 6 round`,
          }),
    };
  }
}
export default toNative(CellComponent)
</script>

<style scoped></style>
