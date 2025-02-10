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
import { CellData } from '../models/CellData';
import type { CSSProperties } from 'vue';

@Component({
  emits: ["cell-click", "cell-mouse-enter", "cell-mouse-leave"]
})
export default class CellComponent extends Vue {
  @Prop({type: CellData, required: true}) cellData!: CellData

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
    return {
      borderImage: this.cellData.isEdge
        ? "url('/img/editor/cell-background-edge.png') 6 round"
        : "url('/img/editor/cell-background.png') 6 round",
    };
  }
}
</script>

<style scoped>
  .cell-content {
    height: 3.52rem;
    width: 3.52rem;
    border: 8px solid;
  }
</style>