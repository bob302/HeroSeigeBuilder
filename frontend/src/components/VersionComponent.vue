<template>
  <div v-if="version">
    <p>Version: {{ version }}</p>
  </div>
</template>

<script lang="ts">
import { Component, toNative, Vue } from "vue-facing-decorator";

@Component
class VersionComponent extends Vue {
  public version: string = "";

  async mounted() {
    const res = await fetch(import.meta.env.BASE_URL + "version.json");
    const data = await res.json();
    this.version = data.version;
  }
}

export default toNative(VersionComponent)
</script>