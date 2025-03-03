<template>
  <div ref="tooltipRoot" class="equipment-tooltip" :style="tooltipPositionStyles">
    <div class="tooltip-content">
      <button v-if="isMobile" class="mobile-close-button" @click="$emit('close')">
        ×
      </button>

      <div class="equipment-main">
        <div class="equipment-header">
          <p :class="nameColorClass">{{ item.name }}</p>
          <p class="equipment-type">{{ combinedType }}</p>
        </div>

        <div class="equipment-stats">
          <ul class="stats-list">
            <li v-for="stat in item.stats" :key="stat.name" v-html="formatStat(stat) " />

            <div v-if="isWeapon" class="weapon-details">
              <p class="equipment-subtype">[{{ item.subtype }}]</p>
              <p class="equipment-handles">
                {{ weaponHandlesText }}
              </p>
            </div>

            <div class="requirements-container">
              <div class="level-requirement">
                <p class="requirement-label">Level Req.</p>
                <p class="requirement-value">{{ item.level }}</p>
              </div>
              <div class="tier-display">
                <p class="requirement-label">Tier:</p>
                <p :class="tierColorClass">{{ item.tier }}</p>
              </div>
            </div>
          </ul>
        </div>
      </div>

      <EquipmentSocketsTooltip v-if="hasSocketables" :sockets="(item as Equipment).sockets.list" />
    </div>
  </div>
</template>

<script lang="ts">
import { Component, Prop, Ref, toNative, Vue, Watch } from "vue-facing-decorator";
import {
  BaseItem,
  Equipment,
  WeaponEquipment,
  type Stat,
} from "../models/Equipment";
import { StatParser } from "../parser/StatParser";
import EquipmentSocketsTooltip from "./EquipmentSocketsTooltip.vue";

@Component({
  components: { EquipmentSocketsTooltip },
})
class ItemTooltip extends Vue {
  @Prop({ required: true }) item!: BaseItem;
  @Prop({ required: true }) pos!: { x: number; y: number };

  @Ref("tooltipRoot") tooltipRoot!: HTMLElement;
  tooltipDimensions = { width: 0, height: 0 };
  calculatedPosition = { x: 0, y: 0 };

  readonly screenWidth = window.innerWidth;
  readonly screenHeight = window.innerHeight;

  mounted() {
    this.initTooltip();
  }

  get isWeapon() {
    return this.item instanceof WeaponEquipment;
  }

  get weaponHandlesText() {
    return this.isWeapon
      ? `[${(this.item as WeaponEquipment).weaponStats.twoHanded ? "2-Handed" : "1-Handed"}]`
      : "";
  }

  get hasSocketables() {
    if (!(this.item instanceof Equipment)) return false;

    return (this.item as Equipment).sockets.list.some(
      (socket) => socket.socketable,
    );
  }

  get combinedType() {
    return `${this.item.rarity} ${this.item.subtype}`;
  }

  get tooltipPositionStyles() {
    return {
      borderColor: this.borderColor,
      left: this.desktopX, 
      top: this.desktopY
    }
  }

  get borderColor() {
    const colorMap = {
      Common: "#d6ac2f",
      Satanic: "#c81717",
      Angelic: "#fdfea5",
      Unholy: "#c73664",
      Heroic: "#00e19a",
      "Satanic Set": "#0bb01a",
      Mythic: "#4F2395",
    };
    return colorMap[this.item.rarity] || "#ffffff";
  }

  get nameColorClass() {
    return `name-${this.item.rarity.toLowerCase().replace(" ", "-")}`;
  }

  get tierColorClass() {
    return `tier-${this.item.tier.toLowerCase()}`;
  }

  get isMobile() {
    return this.screenWidth < 768;
  }

  get desktopX() {
    return `${this.calculatedPosition.x}px`;
  }

  get desktopY() {
    return `${this.calculatedPosition.y}px`;
  }

  formatStat(stat: Stat) {
    return StatParser.parseStat(stat.raw, stat.special).html;
  }

  async initTooltip() {
    if (this.tooltipRoot) {
      const rect = this.tooltipRoot.getBoundingClientRect();
      this.tooltipDimensions = { width: rect.width, height: rect.height };
      this.updatePosition();
    }
  }

  @Watch("pos")
  onPositionChange() {
    this.updatePosition();
  }

  updatePosition() {
  if (this.isMobile) {
    this.calculatedPosition = { x: 0, y: 0 };
    return;
  }

  let x = this.pos.x;
  let y = 50;
  
  if (this.posExceedsHalfScreen) {
    x -= this.tooltipDimensions.width * 1.15;
  }
  
  this.calculatedPosition = { x, y };
}

  get posExceedsHalfScreen() {
    return (
      this.tooltipDimensions.width > 0 && this.pos.x > this.screenWidth / 2
    );
  }

  get posYExceedsHalfScreen() {
    return (
      this.tooltipDimensions.height > 0 && this.pos.y > this.screenHeight / 2
    );
  }
}

export default toNative(ItemTooltip)
</script>

<style scoped>
.equipment-tooltip {
  position: fixed;
  background: var(--color-background);
  color: var(--color-text-primary);
  padding: var(--spacing-md);
  border-radius: 5px;
  border: 2px solid var(--border-color, var(--color-border));
  z-index: 200;
  backdrop-filter: var(--blur-amount);
  font-family: var(--font-family-primary);
  max-width: 50vw;
}

.mobile-close-button {
  position: absolute;
  top: 5%;
  right: 7.5%;
  background: transparent;
  border: none;
  color: white;
  font-size: 2rem;
  cursor: pointer;
  z-index: 201;
}

.name-common {
  color: var(--color-primary);
}
.name-satanic {
  color: var(--color-satanic);
}
.name-angelic {
  color: var(--color-angelic);
}
.name-unholy {
  color: var(--color-unholy);
}
.name-heroic {
  color: var(--color-heroic);
}
.name-satanic-set {
  color: var(--color-satanic-set);
}

.tier-ss {
  color: var(--color-angelic);
}
.tier-s {
  color: var(--color-s);
}
.tier-a {
  color: var(--color-a);
}
.tier-b {
  color: var(--color-b);
}
.tier-c {
  color: var(--color-c);
}
.tier-d {
  color: var(--color-d);
}

::v-deep(.stat-description) {
  color: #8383df;
  font-family: "Fenris";
  font-weight: 600;
  padding-left: 0.15rem;
  padding-right: 0.15rem;
}
::v-deep(.stat-special) {
  color: #f34500;
  font-family: "Fenris";
  font-weight: 600;
}
::v-deep(.stat-gem-level) {
  color: #c7b377;
  font-family: "Fenris";
  font-weight: 600;
}
::v-deep(.stat-unbreakable) {
  color: #cd2494;
  font-family: "Fenris";
  font-weight: 600;
}
::v-deep(.stat-unholy) {
  color: #c73664;
  font-family: "Fenris";
  font-weight: 600;
}
::v-deep(.stat-range) {
  color: #00ff00;
  font-family: "Fenris";
  font-weight: 600;
}
::v-deep(.stat-error) {
  color: #ff0000;
  font-family: "Fenris";
  font-weight: 600;
}
::v-deep(.stat-allskills) {
  color: #c7b377;
  font-family: "Fenris";
  font-weight: 600;
}
::v-deep(.stat-to-arcane) {
  color: #853bf9;
  font-family: "Fenris";
  font-weight: 600;
}
::v-deep(.stat-to-fire) {
  color: #fc4a28;
  font-family: "Fenris";
  font-weight: 600;
}
::v-deep(.stat-to-cold) {
  color: #39ddfb;
  font-family: "Fenris";
  font-weight: 600;
}
::v-deep(.stat-to-poison) {
  color: #44de00;
  font-family: "Fenris";
  font-weight: 600;
}
::v-deep(.stat-to-physical) {
  color: #c68a59;
  font-family: "Fenris";
  font-weight: 600;
}
::v-deep(.stat-to-lightning) {
  color: #6eedb6;
  font-family: "Fenris";
  font-weight: 600;
}

::v-deep(.stat-container) {
  display: flex;
  flex-direction: row;
  justify-content: center;
  margin-top: -1.6rem;
}

.equipment-header {
  margin-bottom: 1rem;
}

.equipment-type {
  color: var(--color-text-primary);
  font-weight: 600;
}

.stats-list {
  list-style: none;
  padding: 0;
  margin: 2rem 0 0;
}

.weapon-details {
  display: flex;
  justify-content: space-around;
  margin: 1rem 0;
}

.requirements-container {
  display: flex;
  justify-content: space-between;
  margin-top: 1.5rem;
}

.level-requirement,
.tier-display {
  display: flex;
  align-items: center;
}

.requirement-label {
  padding-right: 0.3em;
}

.socketables-section {
  margin-top: 1rem;
  padding-top: 1rem;
  border-top: 1px solid rgba(255, 255, 255, 0.1);
}

.socketables-title {
  color: #c7b377;
  margin-bottom: 0.5rem;
}

.runes-content {
  height: 100%;
  display: flex;
  flex-direction: column;
}

.tooltip-content {
  display: flex;
  gap: 1rem;
}

@media (max-width: 768px) {
  .equipment-tooltip {
    max-width: 100vw;
    max-height: 100vh;
    width: 90vw;
    height: 84vh;
    border-radius: 0;
    top: 0;
    left: 0;
    overflow-y: scroll;
  }

  .tooltip {
    padding: 0rem;
  }

  .tooltip-content {
    flex-direction: column;
  }

  .equipment-stats {
    font-size: 0.9rem;
  }

}
</style>
