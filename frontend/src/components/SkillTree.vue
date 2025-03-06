<template>
  <div class="skill-tree-wrapper">
    <p class="skill-tree-name">{{ skillTree.name }}</p>
    <div class="skill-tree" :style="gridStyles">
      <div
        v-for="(line, index) in skillConnections"
        :key="'line-' + index"
        class="skill-line"
        :style="getLineStyle(line)"
      />

      <CharapterSkillComponent
        v-for="(skill, index) in skillTree.skills"
        :key="index"
        :skill="skill"
        :skillTree="skillTree"
        @toggle-subskills="onToggleSubSkills"
      />
    </div>
  </div>
</template>

<script lang="ts">
import { Component, Inject, Prop, Vue, Watch } from "vue-facing-decorator";
import SkillTree from "../models/SkillTree";
import CharapterSkill from "../models/CharapterSkill";
import CharapterSkillComponent from "./CharapterSkillComponent.vue";
import CharapterSkillModel from "../models/CharapterSkill";
import type EditorContext from "../models/EditorContext";
import { toNative } from "vue-facing-decorator";

@Component({
  components: {
    CharapterSkillComponent,
  },
  emits: ["toggle-subskills"],
})
class SkillTreeComponent extends Vue {
  @Prop({ type: Object, required: true }) skillTree!: SkillTree;
  @Inject({ from: "editorContext" })
  readonly editorContext!: EditorContext;
  skillConnections: { from: CharapterSkillModel; to: CharapterSkillModel }[] =
    [];

  async mounted() {
    this.createConnections();
  }

  onToggleSubSkills(skill: CharapterSkill) {
    this.$emit("toggle-subskills", skill);
  }

  createConnections() {
    this.skillConnections = [];
    for (const skill of this.skillTree.skills) {
      for (const req of skill.requiredSkills) {
        const parentSkill = this.skillTree.skills.find((s) => s.name === req);
        if (parentSkill) {
          this.skillConnections.push({ from: parentSkill, to: skill });
        }
      }
    }
  }

  @Watch("skillTree")
  onSkillTreeChange() {
    this.createConnections();
  }

  updateSkill() {
    this.createConnections();
    this.$forceUpdate();
  }

  get maxX() {
    return Math.max(...this.skillTree.skills.map((s) => s.position.x), 0);
  }

  get maxY() {
    return Math.max(...this.skillTree.skills.map((s) => s.position.y), 0);
  }

  get gridStyles() {
    return {
      "grid-template-columns": `repeat(${this.maxX + 1}, 100px)`,
      "grid-template-rows": `repeat(${this.maxY + 1}, 100px)`,
      width: `${(this.maxX + 1) * 100}px`,
      height: `${(this.maxY + 1) * 100}px`,
    };
  }

  getLineStyle(connection: {
    from: CharapterSkillModel;
    to: CharapterSkillModel;
  }) {
    const fromX = (connection.from.position.x + 0.5) * 100;
    const fromY = (connection.from.position.y + 0.5) * 100;
    const toX = (connection.to.position.x + 0.5) * 100;
    const toY = (connection.to.position.y + 0.5) * 100;

    const dx = toX - fromX;
    const dy = toY - fromY;
    const length = Math.sqrt(dx * dx + dy * dy);
    const angle = Math.atan2(dy, dx) * (180 / Math.PI);

    const bothLearned = connection.from.learned && connection.to.learned;

    return {
      left: `${fromX}px`,
      top: `${fromY}px`,
      width: `${length}px`,
      transform: `rotate(${angle}deg)`,
      background: bothLearned ? "var(--color-line-learned)" : "var(--color-line)",
    };
  }
}

export default toNative(SkillTreeComponent)
</script>

<style scoped>
.skill-tree {
  display: grid;
  position: relative;
  border: 2px solid var(--color-border);
  z-index: 1;
}

.skill-line {
  position: absolute;
  height: 2px;
  background: var(--color-line);
  transform-origin: left center;
  pointer-events: none;
  z-index: -1;
}

.skill-tree-name {
  color: var(--color-text-secondary);
  font-size: 2rem;
  font-weight: 400;
}
</style>
