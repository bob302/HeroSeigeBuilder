<template>
  <div
    class="skill"
    :class="{
      'skill-locked': !skill.learned,
    }"
    :style="gridPosition"
    @click="onSkillClick"
    @mouseenter="hover = true"
    @mouseleave="hover = false"
  >
    <img
      :src="skill.image"
      :alt="skill.name"
      class="skill-icon"
      draggable="false"
    />
    <p class="skill-level" :class="skill.level >= skill.maxLevel ? 'skill-maxed' : ''">
      {{ `${skill.level}/${skill.maxLevel}` }}
    </p>
    <!-- SubSkills -->
    <div v-if="skill.hasSubskillTree()" class="subskills">
      <button class="subskill-btn" @click.stop="onSubskillButtonClick">
        +
      </button>
    </div>
  </div>

  <div
    class="skill-tooltip"
    v-if="hover"
    :style="{
      top: editorContext.mousePosition.y + 10 + 'px',
      left: editorContext.mousePosition.x + 10 + 'px',
    }"
  >
    {{ skill.name }}
  </div>
</template>

<script lang="ts">
import { Component, Inject, Prop, toNative, Vue } from "vue-facing-decorator";
import CharapterSkill from "../models/CharapterSkill";
import SkillTree from "../models/SkillTree";
import type EditorContext from "../models/EditorContext";

@Component({
  emits: ["skill-learned", "toggle-subskills"],
})
class CharapterSkillComponent extends Vue {
  @Inject({ from: "editorContext" })
  readonly editorContext!: EditorContext;

  @Prop({ required: true }) skill!: CharapterSkill;
  @Prop({ required: true }) skillTree!: SkillTree;

  hover = false;

  get gridPosition() {
    return {
      "grid-column-start": this.skill.position.x + 1,
      "grid-row-start": this.skill.position.y + 1,
    };
  }

  onSkillClick() {
    if (this.skillTree.learnSkill(this.skill, this.editorContext)) {
      this.$emit("skill-learned", this.skill);
    }
  }

  onSubskillButtonClick() {
    if (!this.skill.learned) return;
    this.$emit("toggle-subskills", this.skill);
  }
}

export default toNative(CharapterSkillComponent)
</script>

<style scoped>
.skill-tooltip {
  position: fixed;
  background: var(--color-background);
  color: var(--color-text-primary);
  padding: 5px 10px;
  border-radius: 5px;
  white-space: nowrap;
  font-size: 12px;
  pointer-events: none;
  z-index: 1000;
}

.skill {
  position: relative;
  width: 4.5rem;
  height: 4.5rem;
  background: var(--color-background);
  color: var(--color-text-primary);
  display: flex;
  align-items: center;
  justify-content: center;
  text-align: center;
  border: 1px solid var(--color-border);
  cursor: pointer;
  transition: opacity 0.3s;
  margin: auto;
}

.skill-locked {
  opacity: 0.5;
  background-color: black;
}

.skill-maxed {
  color: var(--color-skill-maxed) !important;
}

.skill-icon {
  width: 4rem;
  height: 4rem;
  user-select: none;
}

.skill-level {
  position: absolute;
  top: 50%;
  left: 0;
  user-select: none;
  color: var(--color-text-secondary);
}

.subskills {
  position: absolute;
  top: -15%;
  right: -15%;
}

.subskill-btn {
  background: #611300;
  color: rgb(255, 208, 0);
  width: 1.5rem;
  height: 1.5rem;
  border-radius: 5%;
  border: 2px thick;
  border-color: silver;
  font-size: 1.5rem;
  line-height: 0.5rem;
  font-weight: bolder;
  cursor: pointer;
  padding: 0 0 0 5%;
}
</style>
