<script setup lang="ts">
import { apiServer } from "../utils/AppInit";
import CheckboxInput from "./controls/CheckboxInput.vue";
import { Flow, type EntryKey } from "../interfaces/DataList";
import { inject, ref } from "vue";
import type { Movie } from "../interfaces/Movie";
import MovieListOptions from "./MovieListOptions.vue";
import openPlayerWindow from "../utils/openPlayerWindow";
import { useRouter } from "vue-router";
import { useStorage } from "@vueuse/core";

const emit = defineEmits<{
	entryDelete: [],
	entryClick: [],
	entryCtrlClick: [],
	entryDblClick: [],
	entryShiftClick: [],
}>();
const props = defineProps<{
	checked: boolean,
	entry: Movie
}>();
defineExpose({ id:props.entry.id });

const columns = inject<EntryKey<Movie>[]>("columnKeys", []);
const { flow } = inject("flow", { flow:ref(Flow.List) });
const onMovieDblclick = useStorage("onMovieDblclick", "play");
const router = useRouter();

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
	switch (onMovieDblclick.value) {
		case "edit": {
			router.push(`/movies/edit/${props.entry.id}`);
			break;
		}
		case "play": {
			openPlayerWindow(props.entry.id);
			break;
		}
		case "none":
		default:
			break;
	}
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
function entryInfo(key:EntryKey<Movie>) {
	switch (key) {
		case "index": {
			return "0";
		}
		case "date": {
			const date = new Date(props.entry[key]);
			const now = new Date();
			const todayMatch = date.getDate() == now.getDate();
			const yestMatch = date.getDate() == (now.getDate() - 1);
			if (
				(todayMatch || yestMatch) &&
				date.getMonth() == now.getMonth() &&
				date.getFullYear() == now.getFullYear()
			) {
				const start = todayMatch ? "Today at " : "Yesterday at ";
				return start + date.toLocaleTimeString(undefined, {
					timeStyle: "short"
				});
			}
			return date.toLocaleDateString() + " at " + date.toLocaleTimeString(undefined, {
				timeStyle: "short",
			})
		}
		default: return props.entry[key];
	}
}
</script>

<template>
	<div
		v-if="flow == Flow.Grid"
		class="dl_cell movie"
		:class="{ checked }"
		draggable="true"
		@dblclick="entryElem_dblClick"
		@click.ctrl.exact="entryElem_ctrlClick"
		@click.shift.exact="entryElem_shiftClick"
		@click.exact="entryElem_click">
			<div class="img_row">
				<img
					:src="`${apiServer}/file/movie/thumb/${entryInfo('id')}`"
					alt="thumbnail"/>
				<span class="duration">{{ entryInfo('duration') }}</span>
				<div class="actions hidden">
					<MovieListOptions :entry="entry" @entry-delete="deleteBtn_click"/>
				</div>
			</div>
			<div class="text_row">
				<span :title="entryInfo('title')" v-html="entryInfo('title')"></span>
				<span>{{ entryInfo('date') }}</span>
			</div>
	</div>

	<tr
		v-else
		class="dl_row movie"
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
			<img
				v-if="columnId == 'title'"
				:src="`${apiServer}/file/movie/thumb/${entryInfo('id')}`"
				alt="thumbnail"/>
			<span :title="entryInfo(columnId)" v-html="entryInfo(columnId)"></span>
		</td>
		<td class="actions hidden" @click.stop>
			<MovieListOptions :entry="entry" @entry-delete="deleteBtn_click"/>
		</td>
	</tr>
</template>

<style scoped>
@import url(../css/data_list_data.css);

.dl_row.movie td.title img {
	width: initial;
}

</style>
