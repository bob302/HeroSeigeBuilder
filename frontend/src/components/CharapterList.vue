<template>
  <div>
    <div class="scrolling-wrapper">
      <div
        class="card"
        v-for="charapter in charapters"
        :key="charapter.name"
        @click="selectCharapter(charapter)"
      >
        <img
          class="charapter-image"
          :src="charapter.image"
          :alt="charapter.name"
        />
        <h3>{{ charapter.name }}</h3>
        <!-- <p>{{ charapter.description || 'No description available.' }}</p> -->
      </div>
    </div>
  </div>
</template>

<script lang="ts">
import { Component, Inject, toNative, Vue } from "vue-facing-decorator";
import Charapter from "../models/Charapter";
import type EditorContext from "../models/EditorContext";

@Component({
  emits: ["charapter-selected"],
})
class CharapterList extends Vue {
  @Inject({ from: "editorContext" })
  readonly editorContext!: EditorContext;
  public charapters: Charapter[] = [];

  async mounted() {
    try {
      const response = await fetch("/classes/class-names.json");

      if (!response.ok) {
        throw new Error(`Не удалось загрузить JSON: ${response.statusText}`);
      }

      const classData: Record<string, { skillTree: string[], weaponRestrictions: string[] }> = await response.json();
      const classNames = Object.keys(classData);

      const charapterPromises = classNames.map((className) =>
        Charapter.parseCharapter(className),
      );
      const results = await Promise.all(charapterPromises);

      this.charapters = results.filter((c): c is Charapter => c !== undefined);

      this.selectCharapter(this.charapters[0]);
    } catch (error) {
      console.error("Error loading charapter names:", error);
    }
  }

  selectCharapter(charapter: Charapter) {
    charapter.reset();
    this.editorContext.selectCharapter(charapter)
    this.editorContext.resetSkillPoints();
    this.$emit("charapter-selected");
  }
}
export default toNative(CharapterList)
</script>

<style scoped>
.scrolling-wrapper {
  display: grid;
  grid-template-columns: repeat(7, 1fr);
  background-color: var(--color-background);
}

.card {
  text-align: center;
}

@media (max-width: 768px) {
  .scrolling-wrapper {
    grid-template-columns: repeat(2, 1fr);
  }
  .card {
    text-align: center;
  }
  .charapter-image {
    display: none;
  }
}
</style>
