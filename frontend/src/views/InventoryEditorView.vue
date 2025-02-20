<template>
  <div class="container">
    <!-- Левая навигация -->
    <nav class="side-nav">
      <button @click="scrollToSection('characters')">Characters</button>
      <button @click="scrollToSection('skills')">Skills</button>
      <button @click="scrollToSection('inventory')">Inventory</button>
    </nav>

    <!-- Секция персонажей -->
    <div ref="charactersSection">
      <CharapterList 
        @charapter-selected="scrollToSection('skills')"
      />
    </div>

    <!-- Секция навыков -->
    <div class="loading" v-if="!editorContext.selectedCharapter"></div>
    <div 
      class="skill-trees-wrapper" 
      ref="skillsSection" 
      v-else
    >
      <AttributeList />

      <p>{{ `Points Left: ${editorContext.getSkillPoints()}` }}</p>
      
      <SkillTreeComponent
        v-for="(skillTree, index) in editorContext.selectedCharapter.skillTrees"
        :key="index"
        :skillTree="skillTree"
      />
    </div>

    <!-- Секция инвентаря -->
    <div ref="inventorySection">
      <TheInventory />
    </div>

    <!-- Serialization Test Section -->
    <div class="serialization-test">
      <h2>Serialization Test</h2>
      <div class="serialization-buttons">
        <button @click="serializeContext">Serialize</button>
        <button @click="deserializeContext">Deserialize</button>
      </div>
      <textarea
        v-model="serializationData"
        placeholder="Serialized JSON will appear here or paste JSON to load"
        rows="10"
        cols="50"
      ></textarea>
    </div>
  </div>
</template>

<script lang="ts">
import { Component, Provide, Vue } from 'vue-facing-decorator';
import TheInventory from '../components/TheInventory.vue';
import SkillTreeComponent from '../components/SkillTree.vue';
import CharapterList from '../components/ClassSelection.vue';
import AttributeList from '../components/AttributeList.vue';
import EditorContext from '../models/EditorContext';
import type { Reactive } from 'vue';
import EditorContextProvider from '../models/EditorContextProvider';

@Component({
  components: {
    TheInventory, SkillTreeComponent, CharapterList, AttributeList
  }
})
export default class InventoryEditorView extends Vue {
  @Provide()
  editorContext: Reactive<EditorContext> = EditorContextProvider.getContext();
  serializationData: string = '';

  scrollToSection(section: 'characters' | 'skills' | 'inventory') {
    this.$nextTick(() => {
      const element = this.$refs[`${section}Section`] as HTMLElement;
      if (element) {
        element.scrollIntoView({ 
          behavior: 'smooth', 
          block: 'start' 
        });
      }
    });
  }

  serializeContext() {
    try {
      const serialized = this.editorContext.serialize();
      this.serializationData = JSON.stringify(serialized, null, 2);
    } catch (error) {
      console.error('Serialization error:', error);
      this.serializationData = 'Error during serialization';
    }
  }

  deserializeContext() {
    try {
      const parsed = JSON.parse(this.serializationData);
      const newContext = EditorContext.deserialize(parsed);
      
      // Обновляем реактивный контекст вместо замены ссылки
      EditorContextProvider.setContext(newContext);
      this.editorContext = EditorContextProvider.getContext();
      
      alert('Deserialization successful!');
    } catch (error) {
      console.error('Deserialization error:', error);
      alert('Error during deserialization. Check console for details.');
    }
  }
}
</script>

<style scoped>
.skill-trees-wrapper {
  display: flex;
  flex-direction: row;
  justify-content: space-around;
  align-items: center;
  height: 60rem;
  background-color: rgba(0, 0, 0, 0.5);
}

.side-nav {
  position: fixed;
  left: 20px;
  top: 50%;
  transform: translateY(-50%);
  display: flex;
  flex-direction: column;
  gap: 5px;
  z-index: 1000;
  background: rgba(40, 35, 30, 0.616);
  border-radius: 8px;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.3);
}

.side-nav button {
  padding: 0.8rem 1rem;
  background: #58483a7e;
  border: 2px solid #7a6857;
  color: #f0e6d2;
  cursor: pointer;
  border-radius: 1px;
  font-weight: bold;
  transition: all 0.3s ease;
}

.side-nav button:hover {
  background: #7a6857;
  transform: translateX(5px);
}

.container {
  margin-left: 10rem; /* Отступ для навигации */
  min-height: 100vh;
  padding: 1rem;
  box-sizing: border-box;
  background-image: url('/img/editor/background.png');
  background-size: cover;
}

.serialization-test {
  margin-top: 2rem;
  padding: 1rem;
  background: rgba(255, 255, 255, 0.1);
  border: 1px solid #ccc;
  border-radius: 8px;
}

.serialization-buttons {
  display: flex;
  gap: 1rem;
  margin-bottom: 1rem;
}

.serialization-test textarea {
  width: 100%;
  font-family: monospace;
  padding: 0.5rem;
}
</style>
