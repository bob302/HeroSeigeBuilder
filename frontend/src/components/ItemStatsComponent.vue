<template>
  <div class="tooltip" :style="{ left: `${x}px`, top: `${y}px`, borderColor: borderColor }">
    <p :class="nameClass">{{ name }}</p>
    <p class="text-regular">{{ combinedItemType }}</p>
    <ul class="stats-list">
      <li v-for="stat in stats" :key="stat.name" v-html="formatStat(stat)"></li>
    </ul>
    <div v-if="type === 'Weapon' && subtype !== ''" class="weapon-container">
      <p class="text-regular">[{{ subtype }}]</p>
      <p class="text-regular">{{ oneHanded ? '[1-Handed]' : '[2-Handed]'}}</p>
    </div>
    <div class="bottom-container">
      <div class="level-container">
        <p class="text-regular" style="padding-right: 0.3em;">Level Req. </p>
        <p class="text-regular"> {{ level }}</p>
      </div>
      <div class="tier-container">
        <p class="text-regular" style="padding-right: 0.3em;">Tier: </p>
        <p :class="tierClass"> {{ tier }}</p>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { defineProps, computed } from 'vue'
import { StatParser } from '@/services/StatParser'
import { Stat } from '@/models/Equipment'

const formatStat = (stat : Stat) => StatParser.parseStat(stat.raw, stat.special).html

const props = defineProps<{
  name: string
  type: string
  subtype: string
  oneHanded: boolean
  combinedItemType: string
  rarity: string
  stats: Stat[]
  tier: string
  level: string
  x: number
  y: number
}>()

const borderColor = computed(() => {
  switch (props.rarity) {
    case 'Satanic': return '#c81717' // Red for Satanic
    case 'Angelic': return '#fdfea5' // Light yellow for Angelic
    case 'Unholy': return '#c73664' // Pink for Unholy
    case 'Heroic': return '#00e19a' // Green for Heroic
    case 'SatanicSet': return '#0bb01a' // Dark green for SatanicSet
    default: return '#ffffff' // Default white
  }
})

const nameClass = computed(() => {
  switch (props.rarity) {
    case 'Satanic': return 'name-satanic'
    case 'Angelic': return 'name-angelic'
    case 'Unholy': return 'name-unholy'
    case 'Heroic': return 'name-heroic'
    case 'SatanicSet': return 'name-satanic-set'
    default: return ''
  }
})

const tierClass = computed(() => {
  switch (props.tier) {
    case 'SS': return 'tier-ss'
    case 'S': return 'tier-s'
    case 'A': return 'tier-a'
    case 'B': return 'tier-b'
    case 'C': return 'tier-c'
    case 'D': return 'tier-d'
    default: return ''
  }
})
</script>

<style scoped>
@font-face {
  font-family: "Fenris";
  font-weight: 400;
  font-style: normal;
  font-display: auto;
  unicode-range: U+000-5FF;
  src: url('~@/assets/fonts/fenris.woff') format("woff"), url('~@/assets/fonts/fenris.woff2') format("woff2");
  }

.name-satanic { color: #c81717; font-weight: 600; font-family: 'Fenris'; font-size: 1.2rem; }
.name-angelic { color: #fdfea5; font-weight: 600; font-family: 'Fenris'; font-size: 1.2rem; }
.name-unholy { color: #c73664; font-weight: 600; font-family: 'Fenris'; font-size: 1.2rem; }
.name-heroic { color: #00e19a; font-weight: 600; font-family: 'Fenris'; font-size: 1.2rem; }
.name-satanic-set { color: #0bb01a; font-weight: 600; font-family: 'Fenris'; font-size: 1.2rem; }

.tier-ss { color: #fdfea5; font-weight: 600; font-family: 'Fenris'; }
.tier-s { color: #f3c632; font-weight: 600; font-family: 'Fenris'; }
.tier-a { color: #e69650; font-weight: 600; font-family: 'Fenris'; }
.tier-b { color: #bb6234; font-weight: 600; font-family: 'Fenris'; }
.tier-c { color: #82251c; font-weight: 600; font-family: 'Fenris'; }
.tier-d { color: #5a1c14; font-weight: 600; font-family: 'Fenris'; }

::v-deep(.stat-value) { color: #fcff52; padding-right: 0.2rem; padding-left: 0.2rem; font-family: 'Fenris';}
::v-deep(.stat-description) { color: #8383df; font-family: 'Fenris';}
::v-deep(.stat-special) { color: #f34500; font-family: 'Fenris';}
::v-deep(.stat-gem-level) { color: #c7b377; font-family: 'Fenris';}
::v-deep(.stat-unbreakable) { color: #cd2494; font-family: 'Fenris';}
::v-deep(.stat-range) {color: #00ff00; padding-left: 0.3rem; font-family: 'Fenris';}
::v-deep(.stat-error) {color: #ff0000; font-family: 'Fenris';}
::v-deep(.stat-allskills) { color: #c7b377; font-family: 'Fenris';}

::v-deep(.stat-container) {
  display: flex;
  flex-direction: row;
  justify-content: center;
  margin-top: -1.3rem;
}

.text-regular {color: white; font-weight: 600; font-family: 'Fenris';}

.tooltip {
  position: fixed;
  background: rgba(0, 0, 0, 0.8);
  color: white;
  padding: 10px;
  border-radius: 5px;
  border: 2px solid;
  white-space: nowrap;
  z-index: 1000;
  box-shadow: 0px 0px 10px rgba(255, 255, 255, 0.2);
}

.item-name {
  font-weight: bold;
  font-size: 14px;
}

.rarity {
  color: #ffcc00;
}

.tier-container {
  display: flex;
  flex-direction: row;
  justify-content: end;
}

.level-container {
  display: flex;
  flex-direction: row;
  justify-content: start;
}

.bottom-container {
  display: flex;
  flex-direction: row;
  justify-content: space-around;
}

.weapon-container {
  display: flex;
  flex-direction: row;
  justify-content: space-around;
}

.stats-list {
  list-style: none;
  padding: 0;
  margin: 5px 0 0;
}
</style>
