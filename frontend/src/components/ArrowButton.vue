<template>
    <div class="close" @click="click">
      <svg width="24" height="8" viewBox="0 0 16 8" fill="none" xmlns="http://www.w3.org/2000/svg" class="arrow-icon">
        <path d="M15 4H4V1" stroke="white"/>
        <path d="M14.5 4H3.5H0" stroke="white"/>
        <path d="M15.8536 4.35355C16.0488 4.15829 16.0488 3.84171 15.8536 3.64645L12.6716 0.464466C12.4763 0.269204 12.1597 0.269204 11.9645 0.464466C11.7692 0.659728 11.7692 0.976311 11.9645 1.17157L14.7929 4L11.9645 6.82843C11.7692 7.02369 11.7692 7.34027 11.9645 7.53553C12.1597 7.7308 12.4763 7.7308 12.6716 7.53553L15.8536 4.35355ZM15 4.5L15.5 4.5L15.5 3.5L15 3.5L15 4.5Z" fill="white"/>
      </svg>
    </div>
</template>

<script lang="ts">
import { Component, Vue } from 'vue-facing-decorator';

@Component({
  emits: ['click']
})
export default class ArrowButton extends Vue {
  click() {
    this.$emit('click')
  }
}
</script>

<style>
svg {
	width: 50px;
	height: auto;
}

.arrow-icon {
	path:nth-child(2) {
		d: path('M14.5 4H3.5H4');
	}
	
	path {
		transition: 0.25s ease;
	}
	
	&:hover {
		path:nth-child(1) {
			d: path('M15 4H4V4');
		}
		
		path:nth-child(2) {
			d: path('M14.5 4H3.5H0');
			transform: translateX(4px);
		}
		
		path:nth-child(3) {
			transform: translateX(4px);
		}
	}
}
</style>
