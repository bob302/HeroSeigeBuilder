<template>
  <div
    class="skill-node"
    :style="nodeStyle"
    @click="learnSkill"
    @mouseenter="hover = true"
    @mouseleave="hover = false"
  >
    <p v-if="!skill.isInitial()" class="level">
      {{ `${skill.level}/${skill.maxLevel}` }}
    </p>
  </div>

  <div
    class="node-tooltip"
    v-if="hover"
    :style="{
      top: editorContext.mousePosition.y + 10 + 'px',
      left: editorContext.mousePosition.x + 10 + 'px',
    }"
  >
    <p class="node-name">{{ skill.name }}</p>
    <p class="node-description">{{ skill.description }}</p>
  </div>
</template>

<script lang="ts">
import { Component, Inject, Prop, Vue } from "vue-facing-decorator";
import type SubSkillNode from "../models/SubskillNode";
import type SubSkillTree from "../models/SubSkillTree";
import type EditorContext from "../models/EditorContext";

@Component({emits: ['learn-skill']})
export default class SubSkillNodeComponent extends Vue {
  @Inject({ from: "editorContext" })
  readonly editorContext!: EditorContext;

  @Prop({ type: Object, required: true }) skill!: SubSkillNode;
  @Prop({ type: Object, required: true }) tree!: SubSkillTree;

  hover = false;

  get nodeStyle() {
    const scale = this.skill.isPrimary() ? 1.5 : 1;
    const size = 25 * scale;
    let bgColor = "gray";

    if (this.skill.level > 0) {
      bgColor = "#2ecc71";
    } else if (this.tree.canLearnSkill(this.skill.id)) {
      bgColor = "#3498db";
    }

    if (this.skill.isMaxed()) {
      bgColor = "#ff7f00";
    }

    return {
      left: `${(this.skill.position?.x ?? 0) * 50}px`,
      top: `${(this.skill.position?.y ?? 0) * 50}px`,
      width: `${size}px`,
      height: `${size}px`,
      fontSize: `${1.2 * scale}rem`,
      transform: this.skill.isPrimary()
        ? `translate(${-size / 6.5}px, ${-size / 6.5}px)`
        : "none",
      backgroundColor: bgColor,
    };
  }

  learnSkill() {
    this.$emit("learn-skill", this.skill.id);
  }
}
</script>

<style scoped>
.skill-node {
  position: absolute;
  color: white;
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: 50%;
  font-weight: bold;
  cursor: pointer;
}

.level {
  font-weight: 400;
  font-size: 1rem;
}

.node-tooltip {
  position: fixed;
  background: var(--color-background);
  color: white;
  border-color: var(--color-border);
  border: 1px thick;
  border-radius: 5px;
  font-size: 1rem;
  pointer-events: none;
  z-index: 1000;
  max-width: 20rem;
}

.node-name {
  color: var(--color-subskill-name)
}

.node-description {
  word-break: break-word;
  color: var(--color-primary)
}
</style>
