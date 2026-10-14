<script setup lang="ts">
import CheckboxInput from "./controls/CheckboxInput.vue";
import { Flow, type Folder } from "../interfaces/DataList";
import { inject, ref } from "vue";
import FolderIconFilled from "./icons/FolderIconFilled.vue";

const emit = defineEmits<{
	entryDelete: [],
	entryClick: [],
	entryCtrlClick: [],
	entryDblClick: [],
	entryShiftClick: [],
}>();
const props = defineProps<{
	checked: boolean,
	entry: Folder
}>();
defineExpose({ id:props.entry.id });

const columns = inject<string[]>("columnKeys", []);
const { flow } = inject("flow", { flow:ref(Flow.List) });

/**
 * called when the entry element is clicked, emits event to parent
 */
function entryElem_click() {
	emit("entryClick");
}

/**
 * called when the entry element is clicked and ctrl is held down
 * flips selection state and emits event
 */
function entryElem_ctrlClick() {
	emit("entryCtrlClick");
}

/**
 * called when the entry element is clicked
 * does user action and emits event
 */
function entryElem_dblClick() {
	emit("entryDblClick");
}

/**
 * called when the entry element is clicked as shift is held down
 * flips selection state and emits event
 */
function entryElem_shiftClick() {
	emit("entryShiftClick");
}

/**
 * called when the entry has been deleted
 */
function deleteBtn_click() {
	emit("entryDelete");
}

/**
 * returns a fixed date string for a movie
 * @param entry movie object
 */
function entryInfo(key:string) {
	switch (key) {
		default:
			return (props.entry as any)[key] || "";
	}
}

</script>

<template>
	<div
		v-if="flow == Flow.Grid"
		class="dl_cell folder"
		:class="{ checked }"
		draggable="true"
		@dblclick="entryElem_dblClick"
		@click.ctrl.exact="entryElem_ctrlClick"
		@click.shift.exact="entryElem_shiftClick"
		@click.exact="entryElem_click">
		<div class="img_row">
			<FolderIconFilled :color="entry.color"/>
			<div class="actions hidden">
				<template v-if="entry.folder != 'api'">
					gfys
				</template>
			</div>
		</div>
		<div class="text_row">
			<span :title="entryInfo('name')" v-html="entryInfo('name')"></span>
			<span>{{ entryInfo('size') }} items</span>
		</div>
	</div>

	<tr
		v-else
		class="dl_row folder"
		:class="{ checked }"
		draggable="true"
		@dblclick="entryElem_dblClick"
		@click.ctrl.exact="entryElem_ctrlClick"
		@click.shift.exact="entryElem_shiftClick"
		@click.exact="entryElem_click">
		<td class="hidden">
			<CheckboxInput
				v-bind:model-value="checked"
				@update:model-value="entryElem_ctrlClick"
				@dblclick.stop
				@click.stop/>
		</td>
		<td v-for="columnId in columns" :class="{ title:columnId == 'title' }">
			<template v-if="columnId == 'title' || columnId == 'name'">
				<FolderIconFilled :color="entry.color"/>
				<span :title="entryInfo('name')">{{ entryInfo("name") }}</span>
			</template>
			<span v-else>{{ entryInfo(columnId) }}</span>
		</td>
		<td class="actions hidden" @click.stop>
			
		</td>
	</tr>
</template>

<style scoped>
@import url(../css/data_list_data.css);

.dl_row.folder td.title svg {
	height: calc(var(--scale) - 20px);
}

.dl_cell.folder svg {
	padding: 10px;
	width: 100%;
}

</style>
