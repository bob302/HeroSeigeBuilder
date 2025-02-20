<template>
  <div>
    <div class="scrolling-wrapper">
      <div class="card" v-for="charapter in charapters" :key="charapter.name">
        <img :src="charapter.image" :alt="charapter.name" @click="selectCharapter(charapter)"/>
        <h2>{{ charapter.name }}</h2>
        <!-- <p>{{ charapter.description || 'No description available.' }}</p> -->
      </div>
    </div>
  </div>
</template>

<script lang="ts">
import { Component, Inject, Prop, Vue } from 'vue-facing-decorator';
import Charapter from '../models/Charapter';
import type EditorContext from '../models/EditorContext';

@Component({
  emits:['charapter-selected']
})
export default class CharapterList extends Vue {
  @Inject({from: 'editorContext'}) 
  readonly editorContext!: EditorContext;
  public charapters: Charapter[] = [];

  async mounted() {
    try {
        const response = await fetch('/classes/class-names.json');
        
        if (!response.ok) {
            throw new Error(`Не удалось загрузить JSON: ${response.statusText}`);
        }

        const classData: Record<string, string[]> = await response.json();
        const classNames = Object.keys(classData);
        const charapterPromises = classNames.map(className => Charapter.parseCharapter(className));
        const results = await Promise.all(charapterPromises);

        this.charapters = results.filter((c): c is Charapter => c !== undefined);
    } catch (error) {
        console.error('Error loading charapter names:', error);
    }
}


  selectCharapter(charapter: Charapter) {
      charapter.reset()
      this.editorContext.selectedCharapter = charapter;
      this.editorContext.resetSkillPoints()
      this.$emit('charapter-selected')
  }
}
</script>

<style scoped>
.scrolling-wrapper {
  display: grid;
  grid-template-columns: repeat(7, 1fr);
}

.card {
  flex: 0 0 auto;
  min-width: 150px;
  padding: 10px;
  text-align: center;
}
</style>
