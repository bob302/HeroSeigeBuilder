<template>
  <div class="socket-wrapper">
    <div class="socket-body">
      <div v-if="!prismatic"class="normal socket"><img src="/img/editor/socket-normal.png"/></div>
      <div v-else class="prismatic socket"></div>
    </div>
    <img
    v-if="socketable"
    :src="socketable.image"
    class="socketable-image socket"
    draggable="false"
    />
  </div>
</template>

<script lang="ts">
import { Component, Vue, Prop, toNative } from "vue-facing-decorator";
import type { Socketable } from "../models/Equipment";

@Component({
  emits: [],
})
class Socket extends Vue {
  @Prop({ type: Object, required: false }) socketable!: Socketable;
  @Prop({ type: Boolean, required: true }) prismatic!: boolean;

}

export default toNative(Socket)
</script>

<style scoped>
.socket-wrapper {
  position: relative;
  width: 100%;
  height: 100%;
}

.socket {
  width: 19px;
  height: 19px;
  scale: 1.8;
  position: relative;
  z-index: 1;
}

.socketable-image {
  position: absolute;
  top: 0%;
  left: 0%;
  image-rendering: pixelated;
  z-index: 2;
}

.socket-wrapper:has(.socketable-image) .socket-body {
  opacity: 0;
  visibility: hidden;
}

.prismatic {
  background-image: url("/img/editor/socket-prismatic-spritesheet.png");
  position: relative;
  animation: playv 1s steps(4) infinite, playh 1s steps(3) infinite;
  image-rendering: pixelated;
  transition: scale 0.3s ease-in-out, filter 0.3s ease-in-out;
}

@keyframes playv {
  0% {
    background-position-y: 0px;
  }
  100% {
    background-position-y: -76px;
  }
}

@keyframes playh {
  0% {
    background-position-x: 0px;
  }
  100% {
    background-position-x: -114px;
  }
}
</style>
