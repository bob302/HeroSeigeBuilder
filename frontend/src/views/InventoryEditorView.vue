<template>
  <div class="container">
    <!-- Левая навигация -->
    <nav class="side-nav">
      <button @click="scrollToSection('characters')">Characters</button>
      <button @click="scrollToSection('skills')">Skills</button>
      <button @click="scrollToSection('inventory')">Inventory</button>

      <button @click="showInfo = !showInfo">
        <i class="fas fa-exclamation-circle"></i>
      </button>
    </nav>

    <div v-if="showInfo" class="info-modal">
      <div class="info-content">
        <p>{{ infoText}}</p>
        <button class="close-button" @click="showInfo = false">×</button>
      </div>
    </div>

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
        <button @click="deserializeContext" :disabled="!isSocketablesLoaded">
          Deserialize
        </button>
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
import { ref, type Reactive } from 'vue';
import EditorContextProvider from '../models/EditorContextProvider';
import { equipmentService } from '../service/EquipmentService';

@Component({
  components: {
    TheInventory, SkillTreeComponent, CharapterList, AttributeList
  }
})
export default class InventoryEditorView extends Vue {
  @Provide()
  editorContext: Reactive<EditorContext> = EditorContextProvider.getContext();
  serializationData: string = '';

  showInfo = false;

  infoText = `All item attributes, as well as character names and their skill trees, are obtained by parsing the Herosiege wiki (https://herosiege.wiki.gg/) and may be incomplete or inaccurate.`;
  
  isSocketablesLoaded = false

  mounted() {
    equipmentService.initialize( () => {
      this.isSocketablesLoaded = true
    })
  }
  
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
  z-index: 10;
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


.info-modal {
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background: rgba(0, 0, 0, 0.7);
  display: flex;
  justify-content: center;
  align-items: center;
  z-index: 1000;
}

.info-content {
  position: relative;
  background: #2d2a28;
  padding: 2rem;
  border-radius: 8px;
  max-width: 500px;
  border: 2px solid #7a6857;
  color: #f0e6d2;
}

.language-switcher {
  margin-top: 1rem;
  display: flex;
  gap: 0.5rem;
}

.language-switcher button {
  padding: 0.3rem 0.8rem;
  background: #58483a;
  border: 1px solid #7a6857;
  color: #f0e6d2;
  cursor: pointer;
  border-radius: 3px;
}

.close-button {
  position: absolute;
  top: 0.5rem;
  right: 0.5rem;
  background: none;
  border: none;
  color: #f0e6d2;
  font-size: 1.5rem;
  cursor: pointer;
  padding: 0 0.5rem;
}

.close-button:hover {
  color: #ff4444;
}
</style>
