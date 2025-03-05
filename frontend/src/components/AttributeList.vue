<template>
  <div class="attributes-list-wrapper">
    <div v-for="attr in attributes" :key="attr.key" class="attribute">
      <p class="attribute-text">{{ attr.label }}:</p>
      <p class="attribute-amount">{{ editorContext[attr.key] }}</p>
      <div class="buttons">
        <button
          @click="increaseAttribute(attr.key, 1)"
          :disabled="editorContext.getAttributePoints() < 1"
        >
          +1
        </button>
        <button
          @click="increaseAttribute(attr.key, 5)"
          :disabled="editorContext.getAttributePoints() < 5"
        >
          +5
        </button>
        <button class="max-button"
          @click="maximizeAttribute(attr.key)"
          :disabled="editorContext.getAttributePoints() === 0"
        >
          Max
        </button>
      </div>
    </div>

    <div class="points-wrapper">
      <p>Points Left:</p>
      <p class="points-left">{{ editorContext.getAttributePoints() }}</p>
    </div>

    <div class="action-buttons">
      <button
        class="distribute-button"
        @click="spreadEvenly"
        :disabled="editorContext.getAttributePoints() === 0"
      >
        Distribute Evenly
      </button>
      <button class="reset-button" @click="editorContext.resetAttributes()">
        Reset
      </button>
    </div>
  </div>
</template>

<script lang="ts">
import { Component, Inject, toNative, Vue } from "vue-facing-decorator";
import type EditorContext from "../models/EditorContext";

@Component
class AttributeList extends Vue {
  @Inject({ from: "editorContext" })
  readonly editorContext!: EditorContext;

  attributes: {
    key: "strength" | "dexterity" | "intelligence" | "energy" | "vitality";
    label: string;
  }[] = [
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

  increaseAttribute(
    attribute:
      | "strength"
      | "dexterity"
      | "intelligence"
      | "energy"
      | "vitality",
    amount: number,
  ) {
    this.editorContext.increaseAttribute(attribute, amount);
  }

  maximizeAttribute(
    attribute:
      | "strength"
      | "dexterity"
      | "intelligence"
      | "energy"
      | "vitality",
  ) {
    this.increaseAttribute(attribute, this.editorContext.getAttributePoints());
  }
}

export default toNative(AttributeList)
</script>

<style scoped>
.attributes-list-wrapper {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 1rem;
}

.attribute {
  display: grid;
  grid-template-columns: 1fr auto auto;
  gap: 1rem;
  width: 100%;
  align-items: center;
}

.buttons {
  display: flex;
  flex-direction: row;
  gap: 5px;
}

.buttons button {
  aspect-ratio: 1;
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
  gap: 1rem;
  align-items: center;
}

.points-left {
  font-weight: bold;
}

.action-buttons {
  display: flex;
  gap: 10%
}

.spread-button,
.max-button,
.reset-button {
  width: 100%;
  cursor: pointer;
}

.distribute-button {
  background: #5bc0de;
  color: white;
}

.distribute-button:hover {
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
