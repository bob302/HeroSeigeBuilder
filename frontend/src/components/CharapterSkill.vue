<template>
  <div
    class="skill"
    :class="{
      'skill-locked': !skill.learned,
      'skill-maxed': skill.level >= skill.maxLevel,
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
    <div class="skill-level">
      {{ `${skill.level}/${skill.maxLevel}` }}
    </div>
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
import { Component, Inject, Prop, Vue } from "vue-facing-decorator";
import CharapterSkill from "../models/CharapterSkill";
import SkillTree from "../models/SkillTree";
import type EditorContext from "../models/EditorContext";

@Component({
  emits: ["skill-learned", "toggle-subskills"],
})
export default class CharacterSkill extends Vue {
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
</script>

<style scoped>
.skill-tooltip {
  position: fixed;
  background: rgba(0, 0, 0, 0.8);
  color: white;
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
  background: rgba(0, 0, 0, 0.7);
  color: white;
  display: flex;
  align-items: center;
  justify-content: center;
  text-align: center;
  font-size: 14px;
  border: 1px solid white;
  cursor: pointer;
  transition: opacity 0.3s;
  margin: auto;
}

.skill-locked {
  opacity: 0.3;
}

.skill-maxed {
  color: orangered;
}

.skill-icon {
  width: 4rem;
  height: 4rem;
  user-select: none;
}

.skill-level {
  position: absolute;
  top: 75%;
  left: 0;
  user-select: none;
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
