<template>
  <div
    class="skill-node"
    :style="nodeStyle"
    @click="handleNodeClick"
    @mouseenter="hover = true"
    @mouseleave="hover = false"
  >
    <p v-if="!skill.isInitial()" class="level">
      {{ `${skill.level}/${skill.maxLevel}` }}
    </p>
  </div>

  <div
    class="node-tooltip"
    v-if="hover && !isMobile"
    :style="tooltipStyle"
  >
    <p class="node-name">{{ skill.name }}</p>
    <p class="node-description">{{ skill.description }}</p>
  </div>

<ConfirmModalComponent
  :isVisible="showConfirmModal"
  :message="`Do you want to improve the ${skill.name} skill?`"
  @confirm="confirmSkillUpgrade"
  @close="showConfirmModal = false"
>
  <div class="confirmation-message">
    <p class="node-name">{{ skill.name }}</p>
    <p class="node-description">{{ skill.description }}</p>
    <p class="upgrade-info" v-if="!skill.isMaxed()">
      Level: {{ skill.level }} / {{ skill.maxLevel }}
    </p>
    <p class="skill-status node-description" v-if="!tree.canLearnSkill(skill.id)[0]">
      {{ tree.canLearnSkill(skill.id)[1] }}
    </p>
    <p class="skill-status node-description" v-else-if="skill.isMaxed()">
      {{ tree.canLearnSkill(skill.id)[1] }}
    </p>
  </div>
</ConfirmModalComponent>
</template>

<script lang="ts">
import { Component, Inject, Prop, toNative, Vue } from "vue-facing-decorator";
import type SubSkillNode from "../models/SubskillNode";
import type SubSkillTree from "../models/SubSkillTree";
import type EditorContext from "../models/EditorContext";
import ConfirmModalComponent from "./ConfirmModalComponent.vue";

@Component({
  components: {
    ConfirmModalComponent
  },
  emits: ['learn-skill']
})
class SubSkillNodeComponent extends Vue {
  @Inject({ from: "editorContext" })
  readonly editorContext!: EditorContext;

  @Prop({ type: Object, required: true }) skill!: SubSkillNode;
  @Prop({ type: Object, required: true }) tree!: SubSkillTree;
  @Prop({ type: Number, default: 50 }) nodeSize!: number;
  @Prop({ type: Boolean, default: false }) skipConfirmation!: boolean;

  hover = false;
  isMobile = false;
  showConfirmModal = false;

  mounted() {
    this.checkScreenSize();
    window.addEventListener('resize', this.checkScreenSize);
  }

  beforeUnmount() {
    window.removeEventListener('resize', this.checkScreenSize);
  }

  checkScreenSize() {
    this.isMobile = window.innerWidth <= 768;
  }

  get nodeStyle() {
    const isPrimary = this.skill.isPrimary();
    const scale = isPrimary ? 1.5 : 1;
    const baseSize = this.isMobile ? (this.nodeSize * 0.9) : this.nodeSize; // Slightly adjust base size for mobile
    const size = (baseSize / 2) * scale;

    let bgColor = "var(--color-node)";

    if (this.skill.level > 0) {
      bgColor = "var(--color-node-learned)";
    } else if (this.tree.canLearnSkill(this.skill.id)[0]) {
      bgColor = "var(--color-node-can-learn)";
    }

    if (this.skill.isMaxed()) {
      bgColor = "var(--color-node-maxed)";
    }

    const fontSize = this.isMobile ? `${0.8 * scale}rem` : `${1.2 * scale}rem`;
    const offsetX = isPrimary ? (-size / 6.5) : 0;
    const offsetY = isPrimary ? (-size / 6.5) : 0;

    return {
      left: `${(this.skill.position?.x ?? 0) * this.nodeSize}px`,
      top: `${(this.skill.position?.y ?? 0) * this.nodeSize}px`,
      width: `${size}px`,
      height: `${size}px`,
      fontSize: fontSize,
      transform: isPrimary ? `translate(${offsetX}px, ${offsetY}px)` : "none",
      backgroundColor: bgColor,
    };
  }

  get tooltipStyle() {
    // On mobile, tooltip is replaced by modal, so this is only for desktop
    return {
      top: this.editorContext.mousePosition.y + 10 + 'px',
      left: this.editorContext.mousePosition.x + 10 + 'px',
      maxWidth: '20rem',
    };
  }

  handleNodeClick() {
    // Если опция skipConfirmation включена или устройство не мобильное, 
    // сразу вызываем прокачку без подтверждения
    if (this.skipConfirmation || !this.isMobile) {
      this.learnSkill();
    } else {
      // На мобильных с включенным подтверждением открываем модальное окно
      this.showConfirmModal = true;
    }
  }

  confirmSkillUpgrade() {
    // Прокачиваем навык после подтверждения
    this.learnSkill();
    this.showConfirmModal = false;
  }

  learnSkill() {
    this.$emit("learn-skill", this.skill.id);
  }
}

export default toNative(SubSkillNodeComponent);
</script>

<style scoped>
.skill-node {
  position: absolute;
  color: var(--color-text-primary);
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: 50%;
  font-weight: bold;
  cursor: pointer;
  z-index: 5;
}

.level {
  font-weight: 400;
  font-size: 1rem;
  color: var(--color-text-primary);
}

.node-tooltip {
  position: fixed;
  background: var(--color-background);
  color: var(--color-text-primary);
  border-color: var(--color-border);
  border: 1px solid var(--color-border);
  border-radius: 5px;
  padding: 8px;
  font-size: 1rem;
  pointer-events: none;
  z-index: 1000;
}

.node-name {
  color: var(--color-subskill-name);
  margin: 0 0 0.25rem 0;
  font-weight: bold;
}

.node-description {
  word-break: break-word;
  color: var(--color-primary);
  margin: 0;
}

.confirmation-message {
  padding: 10px 0;
}

.upgrade-info {
  margin: 10px 0;
  font-weight: bold;
}

.skill-status {
  margin: 10px 0;
  color: var(--color-warning);
}

/* Mobile styles */
@media (max-width: 768px) {
  .level {
    font-size: 0.7rem;
  }
  
  .node-tooltip {
    font-size: 0.8rem;
    padding: 5px;
  }
}

@media (max-width: 480px) {
  .level {
    font-size: 0.6rem;
  }
}
</style>