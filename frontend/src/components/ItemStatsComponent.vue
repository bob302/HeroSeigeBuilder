<template>
  <div class="tooltip" :style="{ left: `${x}px`, top: `${y}px`, borderColor: borderColor }">
    <p :class="nameClass">{{ name }}</p>
    <p>{{ combinedItemType }}</p>
    <ul class="stats-list">
      <li v-for="stat in stats" :key="stat.name" v-html="formatStat(stat)"></li>
    </ul>
    <div class="tier-container">
      <p class="text-regular" style="padding-right: 0.3em;">Tier: </p>
      <p :class="tierClass"> {{ tier }}</p>
    </div>
  </div>
</template>

<script setup lang="ts">
import { Stat } from '@/models/Stat'
import { defineProps, computed } from 'vue'
import { StatParser } from '@/services/StatParser'

const formatStat = (stat : Stat) => StatParser.parseStat(stat.raw, stat.special).html

const props = defineProps<{
  name: string
  combinedItemType: string
  rarity: string
  stats: Stat[]
  tier: string
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
.name-satanic { color: #c81717; font-weight: 600; }
.name-angelic { color: #fdfea5; font-weight: 600; }
.name-unholy { color: #c73664; font-weight: 600; }
.name-heroic { color: #00e19a; font-weight: 600; }
.name-satanic-set { color: #0bb01a; font-weight: 600; }

.tier-ss { color: #fdfea5; font-weight: 600; }
.tier-s { color: #f3c632; font-weight: 600; }
.tier-a { color: #e69650; font-weight: 600; }
.tier-b { color: #bb6234; font-weight: 600; }
.tier-c { color: #82251c; font-weight: 600; }
.tier-d { color: #5a1c14; font-weight: 600; }

::v-deep(.stat-value) { color: #fcff52; padding-right: 0.2rem; padding-left: 0.2rem; }
::v-deep(.stat-description) { color: #8383df; }
::v-deep(.stat-special) { color: #f34500; }
::v-deep(.stat-gem-level) { color: #c7b377; }
::v-deep(.stat-unbreakable) { color: #cd2494; }
::v-deep(.stat-range) {color: #00ff00; padding-left: 0.3rem;}
::v-deep(.stat-error) {color: #ff0000;}
::v-deep(.stat-allskills) { color: #c7b377;}

::v-deep(.stat-container) {
  display: flex;
  flex-direction: row;
  justify-content: center;
  margin-top: -1rem;
}

.text-regular {color: white; font-weight: 600;}

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
  position: relative;
}

.stats-list {
  list-style: none;
  padding: 0;
  margin: 5px 0 0;
}

.stat-name {
  font-weight: bold;
}

.stat-value {
  color: #00ff00;
}
</style>
