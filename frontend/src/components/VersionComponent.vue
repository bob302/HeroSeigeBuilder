<template>
  <div v-if="version">
    <p>Builder Version.: {{ version }}</p>
    <p>Up to date for Game Version: {{ gameVersion }}</p>
  </div>
</template>

<script lang="ts">
import { Component, toNative, Vue } from "vue-facing-decorator";

@Component
class VersionComponent extends Vue {
  public version: string = "";
  public gameVersion: string = "";

  async mounted() {
    const res = await fetch(import.meta.env.BASE_URL + "version.json");
    const data = await res.json();
    this.version = data.version;
    this.gameVersion = data.gameVersion;
  }
}

export default toNative(VersionComponent)
</script>