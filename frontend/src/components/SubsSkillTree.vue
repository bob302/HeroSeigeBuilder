<template>
  <div class="skill-tree-wrapper" @click.self="close">
    <p class="skill-tree-name">{{ skillTree.name }}</p>
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
        @learn-skill="learnSkill"
      />
    </div>
    <div class="bottom-container">
      <div class="subskill-points">
        <p :style="`color: var(--color-text-secondary)`">Points Left: </p><p>{{ skillTree.points }}</p>
      </div>
      <button class="reset-btn" @click.stop="onResetButtonClick">Reset</button>
    </div>
  </div>
</template>

<script lang="ts">
import { Component, Prop, toNative, Vue } from "vue-facing-decorator";
import SubSkillTree from "../models/SubSkillTree";
import SubSkillNodeComponent from "./SubSkillNodeComponent.vue";
import type SubSkillNode from "../models/SubskillNode";

@Component({
  components: {
    SubSkillNodeComponent,
  },
  emits: ["close"],
})
class SubSkillTreeComponent extends Vue {
  @Prop({ type: Object, required: true }) skillTree!: SubSkillTree;
  skillNodes: SubSkillNode[] = [];
  skillConnections: { from: SubSkillNode; to: SubSkillNode }[] = [];

  onResetButtonClick() {
    this.skillTree.reset()
  }

  mounted() {
    this.buildTree();
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
    return {
      "grid-template-columns": `repeat(${this.maxX + 1}, 25px)`,
      "grid-template-rows": `repeat(${this.maxY + 1}, 25px)`,
      width: `${(this.maxX + 1) * 50 + 25}px`,
      height: `${(this.maxY + 1) * 50}px`,
    };
  }

  getLineStyle(connection: { from: SubSkillNode; to: SubSkillNode }) {
    const fromX = (connection.from.position?.x ?? 0) * 50 + 12.5;
    const fromY = (connection.from.position?.y ?? 0) * 50 + 12.5;
    const toX = (connection.to.position?.x ?? 0) * 50 + 12.5;
    const toY = (connection.to.position?.y ?? 0) * 50 + 12.5;

    const dx = toX - fromX;
    const dy = toY - fromY;
    const length = Math.sqrt(dx * dx + dy * dy);
    const angle = Math.atan2(dy, dx) * (180 / Math.PI);

    return {
      left: `${fromX}px`,
      top: `${fromY}px`,
      width: `${length}px`,
      transform: `rotate(${angle}deg)`,
      background: "#888",
    };
  }
}

export default toNative(SubSkillTreeComponent)
</script>

<style scoped>
.skill-tree {
  display: grid;
  position: relative;
  border: 2px solid #ccc;
  background-color: var(--color-background);
}

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
}

.skill-line {
  position: absolute;
  height: 2px;
  background: rgba(233, 66, 0, 0.6);
  transform-origin: left center;
  pointer-events: none;
}

.skill-tree-name {
  color: var(--color-text-secondary);
  font-size: 2rem;
  font-weight: 400;
}

.bottom-container {
  display: flex;
  justify-content: space-around;
  align-items: center;
  width: 30%;
}

.reset-btn {
  background: #611300;
  color: var(--color-text-secondary);
  border-radius: 5%;
  border: 2px thick;
  border-color: silver;
  font-weight: bolder;
  cursor: pointer;
  height: 1.5rem;
}

.subskill-points {
  display: flex;
  flex-direction: row;
}
</style>
