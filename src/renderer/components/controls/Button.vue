<script setup lang="ts">
const props = defineProps<{
	primary?: boolean,
	icon?: boolean
}>();

</script>

<template>
	<div class="btn" :class="{ primary: props.primary, ico:props.icon }">
		<slot></slot>
	</div>
</template>

<style>
.btn {
	background: hsl(213deg 92% 56%);
	color: #fff;
	border-radius: 4px;
	border: none;
	user-select: none;
	font-size: 14px;
	font-weight: bold;
	text-decoration: none;
	transition: opacity 0.2s var(--button-anim);
	display: inline-block;
	padding: 4px 10px;
	margin: 9px 5px;
}
.btn.ico {
	border-radius: 100%;
	font-weight: normal;
	padding: 2px 6px 1px 7px;
}
.btn a {
	color: #fff;
	text-decoration: none;
}
.btn:hover {
	opacity: 0.8;
	transition: none;
	cursor: pointer;
}
.btn.primary {
	background: hsl(344 97% 65%);
}

html.dark .btn {
	background: #42404f;
}
html.dark .btn.primary {
	background: hsl(343 78% 59%);
}

</style>
