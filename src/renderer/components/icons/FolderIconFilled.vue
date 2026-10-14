
<script setup lang="ts">
defineProps<{
	color: number
}>();
</script>
<template>
	<svg
	class="folder_icon"
	version="1.1"
	id="svg1"
	width="30"
	height="30"
	viewBox="0 0 30 30"
	xml:space="preserve"
	xmlns="http://www.w3.org/2000/svg"
	xmlns:svg="http://www.w3.org/2000/svg"><defs
		id="defs1" /><g
		id="g4" :style="{ fill: '#' + color.toString(16) }"><path
		id="rect1"
		style="stroke-width:1.14576;stroke-linecap:square"
		d="m 20.94548,9.247644 -2.36025,2.114102 H 0 L 0.92017479,28.373477 H 28.948699 L 30,9.247644 Z" /><path
		id="path4"
		style="stroke-width:1.12571;stroke-linecap:square"
		d="M 1.2966171,1.626523 V 8.7121415 H 17.633092 l 2.300849,-2.0612708 h 8.769442 V 3.6877938 H 11.413117 L 9.1122689,1.626523 Z" /></g></svg>
</template>