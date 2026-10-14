<style>
.data_list_container.grid table.data_list tbody div.dl_cell.char {
	width: 92px;
}
.data_list_container.grid table.data_list tbody div.dl_cell.char div.thumb {
	display: flex;
	width: 90px;
	height: 100px;
}
.data_list_container.grid table.data_list tbody div.dl_cell.char div.thumb img {
	background: hsl(257deg 14% 96.5%);
	padding: 10px;
	border: none;
	animation: .25s thumb_fade;
	object-fit: scale-down;
	height: 100%;
}
.data_list_container.grid table.data_list tbody div.dl_cell.char div.thumb img.hide {
	visibility: hidden;
}
.data_list_container.grid table.data_list tbody div.dl_cell.char div.thumb img[src*="load_circle.svg"] {
	background: none !important;
	animation: .8s spinner infinite linear;
	margin: auto;
	height: auto;
	width: auto;
}
.data_list_container.grid table.data_list tbody div.dl_cell.char div.actions {
	top: calc(-30px);
}
.data_list_container.grid table.data_list tbody div.dl_cell.char div.data {
	padding: 6px 8px 7px;
}

html.dark .data_list_container.grid table.data_list tbody div.dl_cell.char div.thumb {
	border-color: hsl(250 9% 24% / 1);
}
html.dark .data_list_container.grid table.data_list tbody div.dl_cell.char div.thumb img {
	background-color: hsl(250 8% 17.5% / 1);
}
html.dark .data_list_container.grid table.data_list tbody div.dl_cell.char div.thumb img[src*="load_circle.svg"] {
	filter: invert();
}

@media (min-width: 700px) {
	.data_list_container.grid table.data_list tbody div.dl_cell.char {
		width: 146px;
	}
	.data_list_container.grid table.data_list tbody div.dl_cell.char div.thumb {
		width: 144px;
		height: 160px;
	}
	.data_list_container.grid table.data_list tbody div.dl_cell.char div.actions {
		top: calc(-60px);
	}
}

@media (min-width: 1000px) {
	.data_list_container.grid table.data_list tbody div.dl_cell.char {
		width: 164px;
	}
	.data_list_container.grid table.data_list tbody div.dl_cell.char div.thumb {
		width: 162px;
		height: 180px;
	}
	.data_list_container.grid table.data_list tbody div.dl_cell.char div.actions {
		top: calc(-70px);
	}
}

@media (min-width: 1270px) {
	.data_list_container.grid table.data_list tbody div.dl_cell.char {
		width: 182px;
	}
	.data_list_container.grid table.data_list tbody div.dl_cell.char div.thumb {
		width: 180px;
		height: 200px;
	}
	.data_list_container.grid table.data_list tbody div.dl_cell.char div.actions {
		top: calc(-80px);
	}
}

@keyframes thumb_fade {
	0%   { opacity: 0 }
	100% { opacity: 1 }
}
@keyframes spinner {
	0%      { transform: rotate(0) }
	8.329%  { transform: rotate(0) }
	8.33%   { transform: rotate(30deg) }
	16.659% { transform: rotate(30deg) }
	16.66%  { transform: rotate(60deg) }
	24.999% { transform: rotate(60deg) }
	25%     { transform: rotate(90deg) }
	33.329% { transform: rotate(90deg) }
	33.33%  { transform: rotate(120deg) }
	41.659% { transform: rotate(120deg) }
	41.66%  { transform: rotate(150deg) }
	49.999% { transform: rotate(150deg) }
	50%     { transform: rotate(180deg) }
	58.329% { transform: rotate(180deg) }
	58.33%  { transform: rotate(210deg) }
	66.659% { transform: rotate(210deg) }
	66.66%  { transform: rotate(240deg) }
	74.999% { transform: rotate(240deg) }
	75%     { transform: rotate(270deg) }
	83.329% { transform: rotate(270deg) }
	83.33%  { transform: rotate(300deg) }
	91.659% { transform: rotate(300deg) }
	91.66%  { transform: rotate(330deg) }
	99.999% { transform: rotate(330deg) }
	100%    { transform: rotate(360deg) }
}
</style>

<script lang="ts">
export default {
	optionsComponent: CharListOptions
};
</script>

<script setup lang="ts">
import { ref } from "vue";
import CharListOptions from "../options/CharListOptions.vue";
import type { Char } from "../../../interfaces/Asset";
import useCharRenderer from "../../../composables/useCharRenderer";

const emit = defineEmits<{
	entryDelete: [],
	entryClick: [],
	entryCtrlClick: [],
	entryDblClick: [],
	entryShiftClick: [],
}>();
const props = defineProps<{
	checked: boolean,
	entry: Char
}>();
defineExpose({ id:props.entry.id });

const cr = useCharRenderer();
const src = ref(props.entry.thumbnail);

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
 * unhides image when loaded successfully
 */
function load(e:Event) {
	const elem = e.target as HTMLImageElement;
	elem.classList.remove("hide");
}

/**
 * called when the thumbnail fails to load, renders character
 * sends image to server
 * @param e event
 */
function fail(e:Event) {
	src.value = "/img/load_circle.svg";
	const elem = e.target as HTMLImageElement;
	elem.classList.remove("hide");
	cr.renderThumb(props.entry.id, props.entry.theme, (bytes:string) => {
		src.value = "data:image/png;base64," + bytes;
	});
}
</script>

<template>
	<div
		:class="{
			checked,
			dl_cell: true,
			char: true
		}"
		@dblclick="entryElem_dblClick"
		@click.ctrl.exact="entryElem_ctrlClick"
		@click.shift.exact="entryElem_shiftClick"
		@click.exact="entryElem_click"
	>
		<div class="thumb">
			<img class="hide" :src="src" @load="load" @error="fail"/>
		</div>
		<div class="actions hidden">
			<CharListOptions :entry="entry"/>
		</div>
		<div class="data">
			<span :title="entry.name">{{ entry.name }}</span>
		</div>
	</div>
</template>
