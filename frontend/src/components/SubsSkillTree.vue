<template>
  <div class="skill-tree-wrapper" @click.self="close">
    <p class="skill-tree-name">{{ skillTree.name }}</p>
    <div class="tree-container">
      <div class="skill-tree" :style="gridStyles">
        <div
          v-for="(line, index) in skillConnections"
          :key="'line-' + index"
          class="skill-line"
          :style="getLineStyle(line)"
        />

        <SubSkillNodeComponent
          v-for="(skill, index) in skillNodes"
          :key="index"
          :skill="skill"
          :tree="skillTree"
          :nodeSize="nodeSize"
          :skipConfirmation="skipConfirmation"
          @learn-skill="learnSkill"
        />
      </div>
    </div>
    <div class="bottom-container">
      <div class="subskill-points">
        <p :style="`color: var(--color-text-primary)`">Points Left: </p><p>{{ skillTree.points }}</p>
      </div>
      
      <div class="settings-section">
        <div class="toggle-option">
          <label for="skip-confirmation" class="toggle-label">Disable Confirmation:</label>
          <input 
            type="checkbox" 
            id="skip-confirmation" 
            v-model="skipConfirmation"
            class="toggle-checkbox"
          />
        </div>
        <button class="reset-btn" @click.stop="showResetConfirmation">Reset</button>
      </div>
    </div>
    
    <ConfirmModalComponent 
      :isVisible="showResetModal"
      @confirm="confirmReset"
      @close="showResetModal = false"
    >
      <div class="confirmation-message">
        <p>Are you sure you want to reset all skills?</p>
        <p>This action cannot be undone.</p>
        <p>All skill points will be returned.</p>
      </div>
    </ConfirmModalComponent>
  </div>
</template>

<script lang="ts">
import { Component, Prop, toNative, Vue, Watch } from "vue-facing-decorator";
import SubSkillTree from "../models/SubSkillTree";
import SubSkillNodeComponent from "./SubSkillNodeComponent.vue";
import ConfirmModalComponent from "./ConfirmModalComponent.vue";
import type SubSkillNode from "../models/SubskillNode";

@Component({
  components: {
    SubSkillNodeComponent,
    ConfirmModalComponent
  },
  emits: ["close"],
})
class SubSkillTreeComponent extends Vue {
  @Prop({ type: Object, required: true }) skillTree!: SubSkillTree;
  skillNodes: SubSkillNode[] = [];
  skillConnections: { from: SubSkillNode; to: SubSkillNode }[] = [];
  nodeSize = 50;
  skipConfirmation = false;
  showResetModal = false;

  showResetConfirmation() {
    this.showResetModal = true;
  }

  confirmReset() {
    this.skillTree.reset();
    this.showResetModal = false;
  }

  mounted() {
    this.buildTree();
    this.checkScreenSize();
    window.addEventListener('resize', this.checkScreenSize);

    const savedSkipConfirmation = localStorage.getItem('skipConfirmation');

    if (savedSkipConfirmation !== null) {
      this.skipConfirmation = savedSkipConfirmation === 'true';
    }
  }

  beforeUnmount() {
    window.removeEventListener('resize', this.checkScreenSize);
  }

  @Watch('skipConfirmation')
  onSkipConfirmation(newValue: boolean) {
    localStorage.setItem('skipConfirmation', String(newValue));
  }

  checkScreenSize() {
    const width = window.innerWidth;
    // Adjust node size based on screen width
    if (width <= 480) {
      this.nodeSize = 30; // Very small screens
    } else if (width <= 768) {
      this.nodeSize = 40; // Other mobile screens
    } else {
      this.nodeSize = 50; // Default size on desktop
    }
  }

  learnSkill(id: number) {
    this.skillTree.learnSkill(id);
  }

  buildTree() {
    this.skillNodes = Array.from(this.skillTree.nodes.values());
    this.createConnections();
  }

  createConnections() {
    this.skillConnections = [];
    for (const node of this.skillNodes) {
      for (const connId of node.connections) {
        const targetNode = this.skillTree.nodes.get(connId);
        if (targetNode) {
          this.skillConnections.push({ from: node, to: targetNode });
        }
      }
    }
  }

  close() {
    this.$emit("close");
  }

  get maxX() {
    return Math.max(...this.skillNodes.map((s) => s.position?.x ?? 0), 0);
  }

  get maxY() {
    return Math.max(...this.skillNodes.map((s) => s.position?.y ?? 0), 0);
  }

  get gridStyles() {
    const halfNodeSize = this.nodeSize / 2;
    return {
      "grid-template-columns": `repeat(${this.maxX + 1}, ${halfNodeSize}px)`,
      "grid-template-rows": `repeat(${this.maxY + 1}, ${halfNodeSize}px)`,
      width: `${(this.maxX + 1) * this.nodeSize + halfNodeSize}px`,
      height: `${(this.maxY + 1) * this.nodeSize}px`,
    };
  }

  getLineStyle(connection: { from: SubSkillNode; to: SubSkillNode }) {
    const halfNodeSize = this.nodeSize / 2;
    const fromX = (connection.from.position?.x ?? 0) * this.nodeSize + halfNodeSize/2;
    const fromY = (connection.from.position?.y ?? 0) * this.nodeSize + halfNodeSize/2;
    const toX = (connection.to.position?.x ?? 0) * this.nodeSize + halfNodeSize/2;
    const toY = (connection.to.position?.y ?? 0) * this.nodeSize + halfNodeSize/2;

    const dx = toX - fromX;
    const dy = toY - fromY;
    const length = Math.sqrt(dx * dx + dy * dy);
    const angle = Math.atan2(dy, dx) * (180 / Math.PI);

    const lineThickness = window.innerWidth <= 768 ? '1px' : '2px';

    return {
      left: `${fromX}px`,
      top: `${fromY}px`,
      width: `${length}px`,
      transform: `rotate(${angle}deg)`,
      height: lineThickness,
      background: "var(--color-line)",
    };
  }
}

export default toNative(SubSkillTreeComponent);
</script>

<style scoped>
.skill-tree-wrapper {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.5);
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
  z-index: 100;
  background-color: var(--color-background);
  padding: 0.5rem;
  overflow: hidden;
}

.tree-container {
  width: 100%;
  max-width: 100%;
  overflow: auto;
  margin: 0.5rem 0;
  display: flex;
  justify-content: center;
  touch-action: pan-x pan-y; /* Enable touch scrolling */
}

.skill-tree {
  display: grid;
  position: relative;
  border: 2px solid var(--color-border);
  background-color: var(--color-background);
  margin: 0 auto;
  min-width: min-content; /* Ensure the grid doesn't shrink below content size */
}

.skill-line {
  position: absolute;
  height: 2px;
  background: var(--color-line);
  transform-origin: left center;
  pointer-events: none;
  z-index: 1;
}

.skill-tree-name {
  color: var(--color-text-primary);
  font-size: 2rem;
  font-weight: 400;
  text-align: center;
  margin: 0.5rem 0;
}

.bottom-container {
  display: flex;
  justify-content: space-around;
  align-items: center;
  width: 80%;
  max-width: 400px;
  margin-top: 0.5rem;
}

.reset-btn {
  background: #611300;
  color: var(--color-text-secondary);
  border-radius: 5%;
  border: 2px thick;
  font-weight: bolder;
  cursor: pointer;
  height: 1.5rem;
  padding: 0 1rem;
}

.subskill-points {
  display: flex;
  flex-direction: row;
  align-items: center;
}

.subskill-points p {
  margin: 0 0.25rem;
}

.toggle-option {
  display: none;
}

.settings-section {
  display: flex;
  align-items: center;
  justify-content: center;
  flex-direction: column;
}

/* Mobile styles */
@media (max-width: 768px) {
  .skill-tree-name {
    font-size: 1.5rem;
  }
  
  .bottom-container {
    width: 100%;
    flex-direction: column;
    gap: 0.5rem;
  }
  
  .reset-btn {
    width: 80%;
    max-width: 200px;
    margin-top: 0.5rem;
  }

  .toggle-option {
    display: initial;
  }
}

@media (max-width: 480px) {
  .skill-tree-name {
    font-size: 1.2rem;
  }
  
  .tree-container {
    margin: 0;
  }
}
</style>