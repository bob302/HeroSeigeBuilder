<template>
  <div class="socket-wrapper">
    <img :src="socketImage" class="socket" />
    <div class="socketable">
      <img v-if="socketable" :src="socketable.image" class="socketable-image" draggable="false">
    </div>
  </div>
</template>

<script lang="ts">
import { Component, Vue, Prop } from 'vue-facing-decorator';
import type { Socketable } from '../models/Equipment';

@Component({
  emits: []
})
export default class Socket extends Vue {
  @Prop({type: Object, required: false}) socketable!: Socketable
  @Prop({type: Boolean, required: true}) prismatic!: boolean

  get socketImage() {
    return this.prismatic ? '/img/editor/socket-prismatic.png' : '/img/editor/socket-normal.png'
  }
}
</script>

<style scoped>
.socket-wrapper {
  position: relative;
  width: 100%;
  height: 100%;
}

.socket {
  width: 2.3rem;
  height: 2.3rem;
  position: relative;
  z-index: 1;
}

.socketable {
  position: absolute;
  top: 60%;
  left: 60%;
  transform: translate(-50%, -50%);
  scale: 1.6;
  z-index: 2;
  pointer-events: none;
}

.socketable-image {
  width: 1.5rem;
  height: 1.5rem;
  image-rendering: pixelated;
}
</style>
