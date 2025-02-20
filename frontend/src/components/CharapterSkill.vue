<template>
  <div 
    class="skill" 
    :class="{ 'skill-locked': !skill.learned, 'skill-maxed': skill.level >= skill.maxLevel }"
    :style="gridPosition"
    @click="onSkillClick"
    @mouseenter="hover = true"
    @mouseleave="hover = false" 
    @mousemove="updateMousePosition"
  >
    <img :src="skill.image" :alt="skill.name" class="skill-icon" draggable="false" />
    <div class="skill-level">
      {{ `${skill.level}/${skill.maxLevel}` }}
    </div>
  </div>

  <div class="skill-tooltip" v-if="hover" :style="{ top: mouseY + 10 + 'px', left: mouseX + 10 + 'px' }">{{ skill.name }}</div>
</template>
<script lang="ts">
import { Component, Inject, Prop, Vue } from 'vue-facing-decorator';
import CharapterSkill from '../models/CharapterSkill';
import SkillTree from '../models/SkillTree';
import type EditorContext from '../models/EditorContext';

@Component({
  emits: ['skill-learned']
})
export default class CharacterSkill extends Vue {
  @Inject({from: 'editorContext'}) 
  readonly editorContext!: EditorContext;
  @Prop({ required: true }) skill!: CharapterSkill;
  @Prop({ required: true }) skillTree!: SkillTree;
  hover = false
  mouseX = 0
  mouseY = 0

  get gridPosition() {
    return {
      'grid-column-start': this.skill.position.x + 1,
      'grid-row-start': this.skill.position.y + 1,
    };
  }

  onSkillClick() {
    if (this.skillTree.learnSkill(this.skill, this.editorContext)) {
        this.$emit('skill-learned', this.skill);
    }
  }

  updateMousePosition(event: MouseEvent) {
    this.mouseX = event.clientX;
    this.mouseY = event.clientY;
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
  width: 4.0rem;
  height: 4.0rem;
  user-select: none;
}

.skill-level {
  position: absolute;
  top: 75%;
  left: 0%;
  user-select: none;
}
</style>