<script setup lang="ts">
import { apiServer } from "../utils/AppInit";
import type { Asset } from "../interfaces/Asset";
import AssetListOptions from "../components/AssetListOptions.vue";
import AssetListData from "../components/AssetListData.vue";
import { type Columns, Flow, type EntryKey } from "../interfaces/DataList";
import { flattenAssetType } from "../utils/flattenAssetType";
import DataList from "../components/DataList.vue";
import Navbar from "../components/Navbar.vue";
import {
	computed,
	onMounted,
	provide,
	ref,
	shallowRef,
	triggerRef,
	useTemplateRef,
} from "vue";
import { useStorage } from "@vueuse/core";
import NavbarDataListSettings from "../components/NavbarDataListSettings.vue";

const listTree = useTemplateRef("list-tree");

const columns = useStorage<Columns<Asset>>("assetListColumns", {
	"name": 280,
	"id": 120,
	"type": 150
});
const columnKeys = computed(() => Object.keys(columns.value));
const flow = useStorage("movieListFlow", Flow.List);
const scale = useStorage("assetListScale", 60);
/** [key, descending] */
const sort = useStorage<[EntryKey<Asset>, boolean]>("assetListSort", ["name", true]);

const isLoading = ref(true);
const data = shallowRef<{
	folders: [],
	entries: Asset[]
}>({
	folders: [],
	entries: [],
});
const filteredData = computed(() => data);

provide("columnKeys", columnKeys);
provide("flow", {
	flow,
	updateFlow(value:Flow) {
		flow.value = value;
	}
});
provide("scale", {
	scale,
	updateScale(value:number) {
		scale.value = value;
	}
});

function resetList() {
	data.value = {
		folders: [],
		entries: [],
	};
}

/**
 * compares entry using the current sort setting
 * @param entry1 entry 1
 * @param entry2 entry 2
 */
function compareEntries(entry1:Asset, entry2:Asset): number {
	const sortBy = sort.value[0];
	const co = sort.value[1] ? 1 : -1;
	switch (sortBy) {
		case "type": {
			const type1 = flattenAssetType(entry1);
			const type2 = flattenAssetType(entry2);
			return type1.localeCompare(type2) * co;
		}
		case "index": {
			return 0;
		}
		default: {
			const compare1 = (entry1[sortBy] || "").toString();
			const compare2 = (entry2[sortBy] || "").toString();
			return compare1.localeCompare(compare2) * co;
		}
	}
}

function resizeColumn(key:EntryKey<Asset>, newWidth:number) {
	columns.value[key] = newWidth;
}

/** updates the sort setting and resorts the list */
function changeSort(key:EntryKey<Asset>) {
	if (sort.value[0] == key) {
		sort.value[1] = !sort.value[1];
	} else {
		sort.value = [key, true];
	}
	data.value.entries = data.value.entries.sort(compareEntries);
}

/**
 * initializes the list by loading assets
 */
async function getAssetList(): Promise<Asset[]> {
	const url = `${apiServer}/api/asset/list`;
	const res = await fetch(url);
	if (!res.ok) {
		return [];
	}
	const json = await res.json();
	return json;
}

/**
 * loads the movie/starter list along with the relevant navbar entries
 */
async function loadAssetList() {
	const response = await getAssetList();
	data.value.entries = response;
	data.value.entries = data.value.entries.sort(compareEntries);
	triggerRef(data);
	setTimeout(() => { // wait for thumbs to load
		isLoading.value = false;
	}, 20);
}

onMounted(async () => {
	if (!listTree.value) {
		return;
	}
	listTree.value.resetSelection();
	resetList()
	isLoading.value = true;
	loadAssetList();
});

</script>

<template>
	<div>
		<Navbar>
			<template #right>
				<NavbarDataListSettings/>
			</template>
		</Navbar>

		<div class="page_contents">
			Filter by [Type]
			<DataList
				ref="list-tree"
				:class="{ load_state:isLoading }"
				:data="filteredData"
				:columns
				:sort
				:data-component="AssetListData"
				:options-component="AssetListOptions"
				@column-resize="resizeColumn"
				@sort-change="changeSort"/>
		</div>
	</div>
</template>

<style lang="css" scoped>
:deep(.dl_row.asset) td.title img {
	display: block;
	margin-right: 7px;
	width: calc(var(--scale) - 20px);
	height: calc(var(--scale) - 20px);
}

.page_contents {
	overflow: auto;
}

</style>
