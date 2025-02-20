<template>
  <div class="attributes-list-wrapper">
    <div v-for="attr in attributes" :key="attr.key" class="attribute">
      <p class="attribute-text">{{ attr.label }}:</p>
      <p class="attribute-amount">{{ editorContext[attr.key] }}</p>
      <div class="buttons">
        <button @click="increaseAttribute(attr.key, 1)" :disabled="editorContext.getAttributePoints() < 1">+1</button>
        <button @click="increaseAttribute(attr.key, 5)" :disabled="editorContext.getAttributePoints() < 5">+5</button>
        <button @click="maximizeAttribute(attr.key)" :disabled="editorContext.getAttributePoints() === 0">Max</button>
      </div>
    </div>

    <div class="points-wrapper">
      <p>Points Left:</p>
      <p class="points-left">{{ editorContext.getAttributePoints() }}</p>
    </div>

    <div class="action-buttons">
      <button class="spread-button" @click="spreadEvenly" :disabled="editorContext.getAttributePoints() === 0">Spread Evenly</button>
      <button class="reset-button" @click="editorContext.resetAttributes()">Reset</button>
    </div>
  </div>
</template>

<script lang="ts">
import { Component, Inject, Vue } from 'vue-facing-decorator';
import type EditorContext from '../models/EditorContext';

@Component
export default class AttributeList extends Vue {
  @Inject({from: 'editorContext'}) 
  readonly editorContext!: EditorContext;

  attributes: { key: "strength" | "dexterity" | "intelligence" | "energy" | "vitality"; label: string }[] = [
    { key: "strength", label: "Strength" },
    { key: "dexterity", label: "Dexterity" },
    { key: "intelligence", label: "Intelligence" },
    { key: "energy", label: "Energy" },
    { key: "vitality", label: "Vitality" }
  ];


  spreadEvenly() {
    const remainingPoints = this.editorContext.getAttributePoints();
    if (remainingPoints === 0) return;

    const perAttribute = Math.floor(remainingPoints / this.attributes.length);
    let extra = remainingPoints % this.attributes.length;

    this.attributes.forEach((attr) => {
      this.increaseAttribute(attr.key, perAttribute);
      if (extra > 0) {
        this.increaseAttribute(attr.key, 1);
        extra--;
      }
    });
  }

  increaseAttribute(attribute: "strength" | "dexterity" | "intelligence" | "energy" | "vitality", amount: number) {
    this.editorContext.increaseAttribute(attribute, amount);
  }

  maximizeAttribute(attribute: "strength" | "dexterity" | "intelligence" | "energy" | "vitality") {
    this.increaseAttribute(attribute, this.editorContext.getAttributePoints());
  }

}
</script>

<style scoped>
.attributes-list-wrapper {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 10px;
}

.attribute {
  display: grid;
  grid-template-columns: 1fr auto auto;
  gap: 10px;
  width: 15rem;
  align-items: center;
}

.buttons {
  display: flex;
  flex-direction: row;
  gap: 5px;
}

.buttons button {
  aspect-ratio: 1;
  max-width: 2rem;
}

.attribute-text {
  text-align: left;
}

.attribute-amount {
  text-align: right;
  font-weight: bold;
  min-width: 2rem;
}

.points-wrapper {
  display: flex;
  gap: 10px;
  align-items: center;
}

.points-left {
  font-weight: bold;
}

.action-buttons {
  display: flex;
  gap: 10px;
  margin-top: 10px;
}

.spread-button,
.max-button,
.reset-button {
  padding: 5px 10px;
  border: none;
  cursor: pointer;
  border-radius: 5px;
}

.spread-button {
  background: #5bc0de;
  color: white;
}

.spread-button:hover {
  background: #31b0d5;
}

.max-button {
  background: #5cb85c;
  color: white;
}

.max-button:hover {
  background: #449d44;
}

.reset-button {
  background: #d9534f;
  color: white;
}

.reset-button:hover {
  background: #c9302c;
}
</style>
