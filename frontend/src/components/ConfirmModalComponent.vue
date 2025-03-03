<template>
  <TextModalComponent :isVisible="isVisible" @close="onCancel">
    <div class="confirmation-content">
      <slot></slot>
      <div class="confirmation-buttons">
        <button class="confirm-button" @click="onConfirm">Confirm</button>
        <button class="cancel-button" @click="onCancel">Cancel</button>
      </div>
    </div>
  </TextModalComponent>
</template>

<script lang="ts">
import { Component, Emit, toNative } from "vue-facing-decorator";
import { TextModalComponent } from "./TextModalComponent.vue";

@Component({ 
  name: "ConfirmModalComponent", 
  emits: ["confirm", "close"] ,
  components: {TextModalComponent}
})
class ConfirmModalComponent extends TextModalComponent {

  @Emit("confirm")
  onConfirm() {}

  @Emit("close")
  onCancel() {}
}

export default toNative(ConfirmModalComponent);
</script>

<style scoped>
.confirmation-buttons {
  margin-top: 4vh;
  display: flex;
  justify-content: center;
  gap: var(--spacing-md);
}

.confirm-button,
.cancel-button {
  background: var(--color-button);
  border: 1px solid var(--color-border);
  color: var(--color-text-primary);
  padding: var(--spacing-sm) var(--spacing-md);
  font-size: var(--font-size-base);
  cursor: pointer;
  transition: background 0.3s;
}

.confirm-button:hover {
  background: var(--color-heroic);
}

.cancel-button:hover {
  background: var(--color-satanic);
}
</style>
