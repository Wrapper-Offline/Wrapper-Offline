<script setup lang="ts">
import { Flow } from "../interfaces/DataList";
import { inject, type Ref } from "vue";

const emit = defineEmits<{
	newFolderClick: [void]
}>();

const props = defineProps<{
	newFolder?: boolean
}>();

const flowInject = inject<{
	flow: Ref<Flow>,
	updateFlow: (value:Flow) => void
}>("flow");
const scaleInject = inject<{
	scale: Ref<number>,
	updateScale: (value:number) => void
}>("scale");

function scaleRange_input(e:Event) {
	const target = e.currentTarget as HTMLInputElement | null;
	if (!target) {
		return;
	}
	scaleInject?.updateScale(Number(target.value));
}

</script>

<template>
	<div
		v-if="props.newFolder"
		class="nav_btn"
		v-tooltip="'New folder'"
		@click="emit('newFolderClick')">
		<i class="ico newfolder"></i>
	</div>
	<template v-if="(typeof scaleInject) !== 'undefined'">
		<input type="range" min="42" max="70" :value="scaleInject.scale.value" @input="scaleRange_input"/>
	</template>
	<template v-if="(typeof flowInject) !== 'undefined'">
		<div
			v-if="flowInject.flow.value == Flow.List"
			class="nav_btn"
			v-tooltip="'Display as grid'"
			@click="flowInject.updateFlow(Flow.Grid)">
			<i class="ico grid"></i>
		</div>
		<div
			v-else
			class="nav_btn"
			v-tooltip="'Display as list'"
			@click="flowInject.updateFlow(Flow.List)">
			<i class="ico blist"></i>
		</div>
	</template>
</template>

<style>


</style>
