<!-- EquipmentSockets.vue -->
<template>
  <div class="runes-section">
    <div class="runes-content">
      <p class="text-regular socketables-title">Socketed Runes:</p>
      <ul class="socketables-list">
        <li
          v-for="(socket, index) in sockets"
          :key="index"
          class="socketable-item"
        >
          <img
            v-if="socket.socketable"
            :src="socket.socketable.image"
            class="socketable-icon"
          />
          <div class="socketable-info">
            <p class="socketable-name" :class="socket.prismatic === true ? 'prismatic' : 'normal'">{{ socket.socketable?.name }}</p>
          </div>
        </li>
      </ul>
    </div>
  </div>
</template>

<script lang="ts">
import { defineComponent } from "vue";
import type { PropType } from "vue";
import type { Socket } from "../models/Equipment";

export default defineComponent({
  props: {
    sockets: {
      type: Array as PropType<Socket[]>,
      required: true,
    },
  },
});
</script>

<style scoped>
.socketables-title {
  text-align: center;
}
.runes-section {
  position: relative;
  padding-left: 1rem;
  min-width: 150px;
}

.socketables-list {
  flex: 1;
  overflow-y: auto;
  padding-right: 0.5rem;
}

.socketable-item {
  display: flex;
  align-items: flex-start;
  justify-content: center;
  align-items: center;
  margin-bottom: 0.5rem;
}

.socketable-icon {
  width: 2rem;
  height: 2rem;
  image-rendering: pixelated;
}

.socketable-info {
  flex: 1;
}

.prismatic {
  color: #32edf3;
}

.normal {
  color: #f3c632;
}

.socketable-name {
  font-family: "Fenris";
  font-size: 1.1rem;
}

.socketable-stats {
  list-style: none;
  padding: 0 0 0 0;
  margin: 0;
}

.socketable-stats li {
  font-size: 0.8rem;
  line-height: 1.3;
  color: #ffffff;
}
</style>
