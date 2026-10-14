<style lang="css">
#right_page_container {
	flex-grow: 1;
	background: #1c1c27;
	user-select: none;
	overflow: hidden;
	display: flex;
	flex-direction: column;
}
.page_contents {
	background: hsl(252deg 16% 94%);
	overflow: auto;
	flex-grow: 1;
}

html.dark #right_page_container {
	background: hsl(250 10% 9% / 1);
}
html.dark .page_contents {
	background: hsl(250 9% 16% / 1);
}
</style>

<script setup lang="ts">
import { usePreferredDark, useStorage } from "@vueuse/core";
import Sidebar from "./components/Sidebar.vue";
import { onMounted, type Ref, watch, type WatchHandle } from "vue";

const theme = useStorage("theme", "auto");
let isSystemDark:Ref<boolean> | null = null;
let systemThemeWatcher:WatchHandle | null = null;

function updateDarkClass(value:boolean) {
	if (value) {
		document.documentElement.classList.add("dark");
	} else {
		document.documentElement.classList.remove("dark");
	}
}

function refreshTheme(newValue:string, oldValue?:string) {
	if (newValue == "auto") {
		isSystemDark = usePreferredDark();
		systemThemeWatcher = watch(isSystemDark, refreshSystemTheme);
		refreshSystemTheme();
	} else {
		updateDarkClass(newValue == "dark");
	}
	if (oldValue == "auto") {
		isSystemDark = null;
		systemThemeWatcher = null;
	}
}

function refreshSystemTheme() {
	if (isSystemDark === null) return;
	updateDarkClass(isSystemDark.value);
}

watch(theme, refreshTheme);

onMounted(() => {
	refreshTheme(theme.value);
});
</script>

<template>
	<Sidebar ref="sidebar">
		<template #page_specific>
			<slot name="hi"></slot>
		</template>
	</Sidebar>
	<RouterView id="right_page_container"/>
</template>
