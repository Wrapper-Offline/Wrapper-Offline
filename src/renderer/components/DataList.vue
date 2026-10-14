<script setup lang="ts" generic="Entry extends DataListEntry">
import CheckboxInput from "./controls/CheckboxInput.vue";
import {
	type Component,
	type ComponentInstance,
	computed,
	inject,
	onMounted,
	reactive,
	ref,
	type ShallowRef,
	useTemplateRef,
	shallowRef,
	watch
} from "vue";
import {
	type Columns,
	type DataListEntry,
	type EntryKey,
	Flow,
	type Folder
} from "../interfaces/DataList";
import locale from "../locale/en_US";
import { useScreenWidth } from "../composables/useScreenWidth";
import DataListFolder from "./DataListFolder.vue";
import { useElementBounding } from "@vueuse/core";

const emit = defineEmits<{
	/** emitted when a column has been resized. [id, new width] */
	columnResize: [EntryKey<Entry>, number],
	/** id of the new entry field to sort by */
	sortChange: [EntryKey<Entry>]
}>();
const props = defineProps<{
	data: ShallowRef<{
		folders: Folder[],
		entries: Entry[]
	}>,
	columns: Columns<Entry>,
	/** [key to sort by, descending] */
	sort: [EntryKey<Entry>, boolean],
	dataComponent: Component,
	optionsComponent: Component
}>();

const listRows = useTemplateRef<ComponentInstance<Component>[]>("list-row");
const selection = reactive<{
	anchor: number,
	entries: string[]
}>({
	anchor: 0,
	entries: []
});
const allSelected = computed(() => 
	selection.entries.length == props.data.value.entries.length && 
	props.data.value.entries.length > 0);

/**
 * resets list of selected entries
 */
function resetSelection() {
	selection.anchor = 0;
	selection.entries = [];
}

/** resets if everything is selected, otherwise selects all */
function selectAll_click() {
	if (allSelected.value) {
		resetSelection();
	} else {
		selection.entries = props.data.value.entries.map(v => v.id);
	}
}

/**
 * called when folder is clicked, navigates to it
 * @param folderId folder id
 */
// function folder_click(folderId:string) {
// 	router.push({
// 		name: route.name,
// 		params: {
// 			folderId
// 		}
// 	});
// }

/**
 * called when a movie is deleted, removes it from list
 * @param ids movie ids
 */
function entry_delete(ids:string[]) {
	for (const id of ids) {
		const entryI = props.data.value.entries.findIndex((v) => v.id == id);
		props.data.value.entries.splice(entryI, 1);
		const selI = selection.entries.findIndex((v) => v == id);
		selection.entries.splice(selI, 1);
	}
}

/**
 * clears previous selection and selects the entry
 * @param id entry id
 */
function entry_click(id:string) {
	selection.anchor = 0;
	selection.entries = [id];
}

/**
 * removes/adds an entry to the selection
 * @param id entry id
 */
function entry_ctrlClick(id:string) {
	const oI = selection.entries.indexOf(id);
	if (oI > -1) { // already selected
		selection.entries.splice(oI, 1);
		if (oI - 1 < selection.entries.length - 1) {
			selection.anchor = 0;
		} else {
			selection.anchor = oI - 1;
		}
	} else {
		selection.entries.push(id);
		selection.anchor = selection.entries.length - 1;
	}
}

/**
 * clears selection
 */
function entry_dblClick() {
	resetSelection();
}

/**
 * selects anything between the entry and the anchored selection
 * @param id entry id
 */
function entry_shiftClick(id:string) {
	if (!listRows.value) {
		return;
	}

	const anchoredId = selection.entries[selection.anchor];
	if (typeof anchoredId == "undefined") { // nothing is selected
		selection.entries = [id];
		selection.anchor = 0;
		return;
	}
	selection.entries = [anchoredId];
	selection.anchor = 0;
	const indices:number[] = [];
	for (let i = 0; i < listRows.value.length; i++) {
		const elem = listRows.value[i];
		if (!elem) {
			continue;
		}
		if (elem.id == anchoredId) {
			indices[0] = i;
		}
		if (elem.id == id) {
			indices[1] = i;
		}
	}
	if (
		typeof indices[0] == "undefined" ||
		typeof indices[1] == "undefined"
	) {
		return;
	}
	indices.sort((a, b) => a - b);
	for (let i = indices[0]; i <= indices[1]; i++) {
		const id = listRows.value[i]?.id;
		if (typeof id == "undefined" || id == anchoredId) continue;
		selection.entries.push(id);
	}
}

/**
 * selects all on Ctrl+A, inverts selection on Ctrl+Shift+A 
 * @param e keyboard event
 */
function ctrlADown(e:KeyboardEvent) {
	if (!e.ctrlKey || e.key.toLowerCase() != "a" || !listRows.value) {
		return;
	}
	e.preventDefault();
	e.stopPropagation();
	const invert = e.shiftKey;
	if (invert) {
		const entries = [];
		for (const elem of listRows.value) {
			if (!elem) {
				return;
			}
			if (!selection.entries.includes(elem.id)) {
				entries.push(elem.id);
			}
		}
		selection.anchor = 0;
		selection.entries = entries;
	} else {
		if (!allSelected.value) {
			selection.entries = props.data.value.entries.map(v => v.id);
		}
	}
}

function addListeners() {
	document.addEventListener("keydown", ctrlADown);
}

function removeListeners() {
	document.removeEventListener("keydown", ctrlADown);
}

const columnKeys = inject<EntryKey<Entry>[]>("columnKeys", []);
const { flow } = inject("flow", { flow:ref(Flow.List) });
const { scale } = inject("scale", { scale:ref(60) });

const screenWidth = useScreenWidth();
const columnWidths = computed(() => {
	const widths:Columns<Entry> = {};
	const isGrid = flow.value == Flow.Grid;
	for (const k in props.columns) {
		const width = props.columns[k as keyof Columns<Entry>] as number;
		widths[k as keyof Columns<Entry>] = isGrid ?
			150 : calculateWidth(width);
	}
	return widths;
});

/**
 * calculates the width of a column based on the screen width
 * if the screen is wider than 1200px, the column will be adjusted
 * to take up more space
 */
function calculateWidth(width:number) {
	return (screenWidth.value > 1200) ? 
		~~(width * screenWidth.value / 1200) : width;
}

/**
 * emits an event requesting the parent to resort the list
 * @param key entry key to sort by
 */
function column_click(key:EntryKey<Entry>) {
	emit("sortChange", key);
}

/**
 * resizes the columns on mousemove and emits the resize
 * event on mouseup
 * @param e mouse event
 * @param key column key
 */
function dragger_down(e:MouseEvent, key:EntryKey<Entry>) {
	const dragger = e.currentTarget as HTMLDivElement | null;
	const column = dragger?.parentElement;
	const startX = e.clientX;
	const startWidth = props.columns[key];
	if (!dragger || !column || !startWidth) {
		// this shouldn't even be possible but TS nags me if i don't check
		return;
	}
	document.body.classList.add("col_resize");
	dragger.classList.add("active");
	let width = startWidth;
	const moveCb = (moveE2:MouseEvent) => {
		let dx = moveE2.clientX - startX;
		if (screenWidth.value > 1200) {
			dx = ~~(dx / (screenWidth.value / 1200));
		}
		width = startWidth + dx;
		width = Math.max(startWidth + dx, 90);
		width = Math.min(width, 400);
		const tmi = calculateWidth(width);
		column.style.width = tmi + "px";
		dragger.style.marginLeft = (tmi - 10) + "px";
	};
	window.addEventListener("mousemove", moveCb);
	window.addEventListener("mouseup", () => {
		window.removeEventListener("mousemove", moveCb);
		document.body.classList.remove("col_resize");
		dragger.classList.remove("active");
		emit("columnResize", key, width);
	});
}

const LIST_OVERSCAN = 5;
const GRID_X_MARGIN = 25;
const GRID_Y_MARGIN = 20;

const scrollableParent = ref<HTMLElement | null>(null);
const { top:spTop, height:spHeight } = useElementBounding(scrollableParent);

const tbody = useTemplateRef("dl-tbody");
const { top:tbodyTop, width:tbodyWidth } = useElementBounding(tbody);

const sampleCell = useTemplateRef("sample-cell")
const rowHeight = computed(() => {
	if (flow.value == Flow.Grid) {
		if (!sampleCell.value?.$el) {
			return 1;
		}
		return sampleCell.value.$el.offsetHeight + GRID_Y_MARGIN;
	} else {
		return scale.value;
	}
});

const maxVisibleRows = computed(() => {
	return Math.ceil(spHeight.value / rowHeight.value);
});
const numColumns = computed(() => {
	return flow.value == Flow.Grid ?
		Math.floor((tbodyWidth.value - GRID_X_MARGIN) / (4 * scale.value + GRID_X_MARGIN)) :
		1;
});

const topMargin = ref(0);
const bottomMargin = ref(0);
const visibleData = shallowRef<{
	folders: Folder[],
	entries: Entry[]
}>({
	folders: [],
	entries: []
});

function refreshVisibleData() {
	if (!tbody.value || !parent) {
		return;
	}
	const numFolders = props.data.value.folders.length;
	const numEntries = props.data.value.entries.length;
	const numItems = numFolders + numEntries;
	const numRows = numItems / numColumns.value;

	const offsetTop = tbodyTop.value - spTop.value;
	const topmostRow = Math.floor(-offsetTop / rowHeight.value);
	const firstVisibleRow = Math.max(0, topmostRow - LIST_OVERSCAN);
	const lastVisibleRow = Math.min(numItems, topmostRow + maxVisibleRows.value + LIST_OVERSCAN);
	const firstVisibleEntry = firstVisibleRow * numColumns.value;
	const lastVisibleEntry = (lastVisibleRow + 1) * numColumns.value - 1;

	let folderStart = 0, folderEnd = 0;
	let entryStart = 0, entryEnd = 0
	if (firstVisibleEntry < numFolders) {
		folderStart = firstVisibleEntry;
	} else {
		folderStart = numFolders;
		entryStart = firstVisibleEntry - numFolders;
	}
	if (lastVisibleEntry < numFolders) {
		folderEnd = lastVisibleEntry;
	} else {
		folderEnd = numFolders;
		entryEnd = lastVisibleEntry;
	}

	topMargin.value = firstVisibleRow * rowHeight.value;
	bottomMargin.value = (numRows - lastVisibleRow) * rowHeight.value;
	visibleData.value.folders = props.data.value.folders.slice(folderStart, folderEnd);
	visibleData.value.entries = props.data.value.entries.slice(entryStart, entryEnd);
}

function findScrollableParent(element:HTMLElement): HTMLElement | null {
	if (element.scrollHeight > element.clientHeight) {
		return element;
	} else if (element.parentElement) {
		return findScrollableParent(element.parentElement)
	}
	return null;
}

watch(
	[
		props.data,
		tbodyTop,
		spHeight
	],
	refreshVisibleData
);

const container = useTemplateRef("dl-container");
onMounted(() => {
	if (!container.value) {
		return null;
	}
	scrollableParent.value = findScrollableParent(container.value);
});

defineExpose({ resetSelection });

</script>

<template>
	<div
		ref="dl-container"
		class="dl_container"
		:class="[{
			select_mode: selection.entries.length > 0
		}, flow == Flow.List ? 'list' : 'grid']"
		@click.self="resetSelection"
		@mouseover="addListeners"
		@mouseout="removeListeners">
		<div class="select_mode_options">
			<div class="side_padding">
				<CheckboxInput
					ref="select-all-box"
					v-bind:model-value="allSelected"
					@update:model-value="selectAll_click"/>
			</div>
			{{ selection.entries.length }} selected
			<component
				:is="optionsComponent"
				:entry="selection.entries"
				@entry-delete="entry_delete"/>
		</div>

		<table class="data_list">
			<thead class="list_head">
				<tr>
					<th class="space side_padding"></th>
					<th
						v-for="key of columnKeys" 
						:key="key"
						class="sort_option"
						:class="{
							active: sort[0] == key,
							desc: sort[1]
						}"
						:style="{
							width: columnWidths[key] + 'px'
						}"
						@click.self="column_click(key as EntryKey<Entry>)">
						{{ locale.list.column_name?.[key as keyof typeof locale.list.column_name] ?? key }}
						<div
							v-if="flow == Flow.List"
							class="dragger"
							:style="{ marginLeft: (columnWidths[key] || 0) - 10 + 'px' }"
							@click.prevent.stop.self
							@mousedown.stop.prevent="(e) => dragger_down(e, key as EntryKey<Entry>)">
						</div>
					</th>
					<th class="space"></th>
				</tr>
			</thead>

			<tbody ref="dl-tbody">
				<div class="spacer" :style="{
					gridColumn: '1 / span ' + numColumns,
					height: topMargin + 'px'
				}"></div>

				<DataListFolder
					v-for="folder in visibleData.folders"
					:key="folder.id"
					:entry="folder"
					:checked="false"/>

				<component :is="dataComponent"
					v-for="entry in visibleData.entries"
					:key="entry.id"
					:entry="entry"
					:checked="selection.entries.includes(entry.id)"
					ref="list-row"
					@entry-delete="entry_delete([ entry.id ])"
					@entry-click="entry_click(entry.id)"
					@entry-ctrl-click="entry_ctrlClick(entry.id)"
					@entry-dbl-click="entry_dblClick()"
					@entry-shift-click="entry_shiftClick(entry.id)"/>

				<!-- sample cell used to get the row height on grid views -->
				<DataListFolder
					ref="sample-cell"
					:entry="{
						id: 'sample',
						name: 'hot damn',
						color: 20200418,
						size: 43,
					}"
					:checked="false"
					:style="{
						position: 'absolute',
						visibility: 'hidden',
						pointerEvents: 'none'
					}"/>

				<div class="spacer" :style="{
					gridColumn: '1 / span ' + numColumns,
					height: bottomMargin + 'px'
				}"></div>
			</tbody>
		</table>		
	</div>
</template>

<style scoped>
.dl_container {
	background: repeating-linear-gradient(
		#0000 0,
		#0000 v-bind("scale + 'px'"),
		hsl(257deg 14% 96.5%) v-bind("scale + 'px'"),
		hsl(257deg 14% 96.5%) calc(v-bind("scale + 'px'") * 2)
	) 0 36px;
	overflow-x: auto;
	min-height: 100%;
}

/***
list view
***/

.data_list {
	--scale: v-bind("scale + 'px'");
	border-collapse: collapse;
	border-spacing: 0;
	table-layout: fixed;
	width: 100%;
}

.data_list tbody {
	transition: 0.08s var(--slide-anim);
	height: 100%;
}
/* extra space at the bottom */
.data_list tbody::after {
	content: "";
	display: block;
	height: 30px;
}

/* loading */
.dl_container.load_state tbody {
	transition: none;
	transform: translateX(-40px);
	opacity: 0;
}

/**
select mode
**/
.select_mode_options {
	background-color: hsl(252deg 16% 94%);
	opacity: 0;
	pointer-events: none;
	transition: none;
	transform: translateX(-15px);
	display: flex;
	height: 0;
}
.select_mode_options .side_padding {
	margin-right: 6px;
	padding: 1px 6px;
}
.dl_container.select_mode .data_list {
	margin-top: -2px;
}
.dl_container.select_mode thead.list_head {
	border: none;
	visibility: hidden;
}
.dl_container.select_mode thead.list_head .sort_option {
	line-height: 0;
	padding: 0 6px;
}
.dl_container.select_mode .select_mode_options {
	opacity: 1;
	pointer-events: all;
	padding: 5px 0;
	transition: transform 0.1s var(--slide-anim);
	transform: none;
	position: relative;
	width: 100%;
	height: 35px;
}
.dl_container.select_mode .select_mode_options::after {
	content: "";
	height: 1px;
	width: 100%;
	display: block;
	background-color: hsl(240 12% 76% / 1);
	position: absolute;
    margin-top: 30px;
}


/**
list head
**/

thead.list_head {
	background-color: hsl(252deg 16% 94%);
	border-bottom: 1px solid hsl(240 12% 76% / 1);
	top: 0;
}
thead.list_head th {
	border-color: #bfbeca;
	top: 0;
}
thead.list_head .space.side_padding {
	border: none;
	width: 25px;
}
thead.list_head .sort_option {
	color: hsl(218deg 14% 24%);
	border-radius: 4px 4px 0 0;
	transition: background 0.2s var(--button-anim);
	font-weight: normal;
	text-align: left;
	line-height: 15px;
	padding: 10px 6px;
}
thead.list_head .sort_option.active {
	font-weight: bold;
}
thead.list_head .sort_option.active::after {
	content: "🞃";
	opacity: 0.7;
	float: right;
	transform: translate(-2px, 0);
}
thead.list_head .sort_option.active.desc::after {
	transform: translate(-2px, 0) rotate(180deg);
}
thead.list_head .sort_option:hover {
	background: hsl(338deg 55% 91%);
	transition: none;
}
/* resize dragger */
thead.list_head th .dragger {
	cursor: col-resize;
	position: absolute;
	float: right;
	margin-top: -23px;
	width: 6px;
	height: 32px;
}
thead.list_head th .dragger:hover,
thead.list_head th .dragger.active {
	background: #489cf7a3;
	transition: background 0.1s ease-in;
}


/***
grid view
***/
.dl_container.grid {
	background: #0000;
}
.dl_container.grid .select_mode_options .side_padding  {
	margin-left: max(0px, calc((100% - (38 * v-bind("scale + 'px'"))) / 2));
}
.dl_container.grid .data_list {
	display: block;
}
.dl_container.grid .data_list thead.list_head {
	padding: 0 max(0px, calc((100% - (38 * v-bind("scale + 'px'"))) / 2));
	display: block;
}
.dl_container.grid .data_list tbody {
	display: grid;
	grid-template-columns: repeat(auto-fill, calc(4 * v-bind("scale + 'px'")));
	column-gap: 25px;
	justify-content: space-evenly;
	margin: 0 auto;
	padding: 20px 25px 0;
	/* only allow 8 columns on the smallest possible size */
	max-width: calc(38 * v-bind("scale + 'px'"));
}


.dl_container.grid.select_mode .data_list {
	margin-top: -1px;
}


/**
dark mode reskinning
**/
html.dark .dl_container:not(.grid) {
	background: repeating-linear-gradient(
		#0000 0,
		#0000 v-bind("scale + 'px'"),
		hsl(250 8% 17.5% / 1) v-bind("scale + 'px'"),
		hsl(250 8% 17.5% / 1) calc(v-bind("scale + 'px'") * 2)
	) 0 36px;
}
html.dark .select_mode_options {
	background-color: hsl(250 9% 16% / 1);
}
html.dark .dl_container.select_mode .select_mode_options::after {
	background-color: hsl(250 9% 24% / 1);
}
html.dark thead.list_head {
	background-color: hsl(250 9% 16% / 1);
	border-color: hsl(250 9% 24% / 1);
}
html.dark thead.list_head th {
	border-color: #32313f;
}
html.dark thead.list_head .sort_option {
	color: hsl(0deg 0% 92%);
}
html.dark thead.list_head .sort_option:hover {
	background: hsl(330 26% 21% / 1);
}
html.dark .data_list tbody tr.checked {
	background: hsl(342 47% 40% / 0.45);
}

</style>
