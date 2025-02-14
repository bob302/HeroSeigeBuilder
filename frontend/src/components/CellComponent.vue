<template>
  <div class="cell-content"
    :style="style"
    @mouseenter="this.onMouseEnter"
    @mouseleave="this.onMouseLeave"
    @click="this.onClick"
    @dragover.prevent
  >
  </div>
</template>

<script lang="ts">
import { Component, Prop, Vue } from 'vue-facing-decorator';
import { CellData, type CellStyle } from '../models/CellData';
import type { CSSProperties } from 'vue';

@Component({
  emits: ["cell-click", "cell-mouse-enter", "cell-mouse-leave"]
})
export default class CellComponent extends Vue {
  @Prop({type: CellData, required: true}) cellData!: CellData
  @Prop({required: false}) cellStyle!: CellStyle

  mounted() {
    this.cellData.setCellStyle(this.cellStyle) 
  }

  onMouseEnter(): void {
    this.$emit('cell-mouse-enter', this.cellData)
  }

  onMouseLeave(): void {
    this.$emit('cell-mouse-leave', this.cellData)
  }

  onClick(): void {
    this.$emit('cell-click', this.cellData)
  }

  get style(): CSSProperties {
    if (this.cellData.getCellStyle().background !== '') {
      return {
        display: this.cellData.isUnlocked() ? 'inline-block' : 'none',
        height: this.cellData.getCellStyle().height,
        width: this.cellData.getCellStyle().width,
        backgroundImage: `url(${this.cellData.getCellStyle().background})`,
        backgroundSize: 'cover'
      }
    } else {
      return {
      display: this.cellData.isUnlocked() ? 'inline-block' : 'none',
      height: this.cellData.getCellStyle().height,
      width: this.cellData.getCellStyle().width,
      border: this.cellData.getCellStyle().border,
      borderImage: this.cellData.getCellStyle().isEdge
        ? "url('/img/editor/cell-background-edge.png') 6 round"
        : "url('/img/editor/cell-background.png') 6 round"
    };
    }
    
  }
}
</script>

<style scoped>
</style>