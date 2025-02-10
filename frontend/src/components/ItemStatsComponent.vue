<template>
  <div
    ref="tooltipRef"
    class="tooltip"
    :style="tooltipStyle"
  >
    <p :class="nameClass">{{ item.name }}</p>
    <p class="text-regular">{{ combinedType(item) }}</p>
    <ul class="stats-list">
      <li v-for="stat in item.stats" :key="stat.name" v-html="formatStat(stat)"></li>
    </ul>
    <div v-if="isWeapon(item)" class="weapon-container">
      <p class="text-regular">[{{ item.subtype }}]</p>
      <p class="text-regular">{{ item.weaponStats.oneHanded ? '[1-Handed]' : '[2-Handed]' }}</p>
    </div>
    <div class="bottom-container">
      <div class="level-container">
        <p class="text-regular" style="padding-right: 0.3em;">Level Req. </p>
        <p class="text-regular"> {{ item.level }}</p>
      </div>
      <div class="tier-container">
        <p class="text-regular" style="padding-right: 0.3em;">Tier: </p>
        <p :class="tierClass"> {{ item.tier }}</p>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { defineProps, ref, computed, onMounted, watch, nextTick } from 'vue'
import { StatParser } from '../services/StatParser'
import { Equipment, isWeapon, type Stat } from '../models/Equipment'

const formatStat = (stat: Stat) => StatParser.parseStat(stat.raw, stat.special).html

const props = defineProps<{
  item: Equipment
  pos: {x: number, y: number}
}>()

const tooltipRef = ref<HTMLElement | null>(null)

const screenWidth = window.innerWidth
const screenHeight = window.innerHeight

const tooltipSize = ref<{ width: number, height: number }>({ width: 0, height: 0 })

const tooltipPosition = ref({ x: 0, y: 0 })

onMounted(() => {
  nextTick(() => {
    if (tooltipRef.value) {
      const rect = tooltipRef.value.getBoundingClientRect()
      tooltipSize.value = { width: rect.width, height: rect.height }
      updateTooltipPosition()
    }
  })
})

watch(() => props.pos, () => {
  updateTooltipPosition()
})

const updateTooltipPosition = () => {
  let x = props.pos.x
  let y = props.pos.y

  // Mobile
  if (screenWidth < 768) {
    x = (screenWidth - tooltipSize.value.width) / 2
    y = (screenHeight - tooltipSize.value.height) / 2

    if (tooltipSize.value.width * 2 > screenWidth || tooltipSize.value.height * 2 > screenHeight) {
      x = 0
      y = 0
    }
  } else {
    if (tooltipSize.value.width > 0 && props.pos.x > screenWidth / 2) {
      x = props.pos.x - tooltipSize.value.width
    }
    if (tooltipSize.value.height > 0 && props.pos.y > screenHeight / 2) {
      y = props.pos.y - tooltipSize.value.height * 1.05
    }
  }

  tooltipPosition.value = {
    x,
    y
  }
}

const tooltipStyle = computed(() => {
  if (screenWidth < 768) {
    return {
      transform: `translate(${tooltipPosition.value.x}px, ${tooltipPosition.value.y}px)`,
      borderColor: borderColor.value,
      touchAction: 'none' // Блокировка браузерных жестов
    };
  } else {
    return {
      left: `${tooltipPosition.value.x}px`,
      top: `${tooltipPosition.value.y}px`,
      borderColor: borderColor.value
    };
  }
});

const combinedType = (item: Equipment) => {
  return `${item.rarity} ${item.subtype}`
}

const borderColor = computed(() => {
  switch (props.item.rarity) {
    case 'Satanic': return '#c81717'
    case 'Angelic': return '#fdfea5'
    case 'Unholy': return '#c73664'
    case 'Heroic': return '#00e19a'
    case 'Set': return '#0bb01a'
    default: return '#ffffff'
  }
})

const nameClass = computed(() => {
  switch (props.item.rarity) {
    case 'Satanic': return 'name-satanic'
    case 'Angelic': return 'name-angelic'
    case 'Unholy': return 'name-unholy'
    case 'Heroic': return 'name-heroic'
    case 'Set': return 'name-satanic-set'
    default: return ''
  }
})

const tierClass = computed(() => {
  switch (props.item.tier) {
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

::v-deep(.stat-description) { color: #8383df; font-family: 'Fenris'; font-weight: 600; padding-left: 0.15rem; padding-right: 0.15rem; }
::v-deep(.stat-special) { color: #f34500; font-family: 'Fenris'; font-weight: 600; }
::v-deep(.stat-gem-level) { color: #c7b377; font-family: 'Fenris'; font-weight: 600; }
::v-deep(.stat-unbreakable) { color: #cd2494; font-family: 'Fenris'; font-weight: 600; }
::v-deep(.stat-unholy) { color: #c73664; font-family: 'Fenris'; font-weight: 600; }
::v-deep(.stat-range) {color: #00ff00; font-family: 'Fenris'; font-weight: 600; }
::v-deep(.stat-error) {color: #ff0000; font-family: 'Fenris'; font-weight: 600; }
::v-deep(.stat-allskills) { color: #c7b377; font-family: 'Fenris'; font-weight: 600; }
::v-deep(.stat-to-arcane) { color: #853bf9; font-family: 'Fenris'; font-weight: 600; }
::v-deep(.stat-to-fire) { color: #fc4a28; font-family: 'Fenris'; font-weight: 600; }
::v-deep(.stat-to-cold) { color: #39ddfb; font-family: 'Fenris'; font-weight: 600; }
::v-deep(.stat-to-poison) { color: #44de00; font-family: 'Fenris'; font-weight: 600; }
::v-deep(.stat-to-physical) { color: #c68a59; font-family: 'Fenris'; font-weight: 600; }
::v-deep(.stat-to-lightning) { color: #6eedb6; font-family: 'Fenris'; font-weight: 600; }


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
  padding: 0.8rem;
  border-radius: 5px;
  border: 2px solid;
  white-space: nowrap;
  z-index: 5;
  backdrop-filter: blur(8px);
  max-width: 90vw;
  pointer-events: none;
}


.item-name {
  font-weight: bold;
  font-size: 1rem;
}

.rarity {
  color: #ffcc00;
}

.tier-container {
  display: flex;
  flex-direction: row;
  justify-content: end;
  padding-left: 1em;
}

.level-container {
  display: flex;
  flex-direction: row;
  justify-content: start;
  padding-right: 1em;
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
  margin: 2rem 0 0;
}

@media (max-width: 768px) {
  ::v-deep(.stat-container) {
    margin-top: -2rem;
  }
  .tooltip {
    padding: 0rem;
  }
  .stats-list {
      margin: 0;
  }
  .tier-container .level-container {
    padding-left: 0em;
    padding-right: 0em;
  }

}
</style>
