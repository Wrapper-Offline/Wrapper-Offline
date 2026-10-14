<script setup lang="ts">
import { apiServer } from "../utils/AppInit";
import { type Columns, Flow, type EntryKey } from "../interfaces/DataList";
import {
	computed,
	provide,
	ref,
	shallowRef,
	triggerRef,
	useTemplateRef,
	watchEffect
} from "vue";
import DataList from "../components/DataList.vue";
import type { Movie } from "../interfaces/Movie";
import MovieListData from "../components/MovieListData.vue";
import MovieListOptions from "../components/MovieListOptions.vue";
import Navbar from "../components/Navbar.vue";
import NavbarDataListSettings from "../components/NavbarDataListSettings.vue";
import { useStorage } from "@vueuse/core";
import { useRoute } from "vue-router";

const listTree = useTemplateRef("list-tree");
const route = useRoute();

const columns = useStorage<Columns<Movie>>("movieListColumns", {
	"title": 250,
	"duration": 100,
	"date": 180
});
const columnKeys = computed(() => Object.keys(columns.value));
const flow = useStorage("movieListFlow", Flow.List);
const scale = useStorage("movieListScale", 60);
/** [key, descending] */
const sort = useStorage<[EntryKey<Movie>, boolean]>("movieListSort", ["title", true]);

const folder = ref<string>("");
const isLoading = ref(true);
const data = shallowRef<{
	folders: [],
	entries: Movie[]
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
 * converts a timestamp string to the amount of seconds
 * @param time timestamp
 */
function timestampToSeconds(time:string) {
	const nums = time.split(":").map((v) => Number(v));
	for (const index in nums) {
		if (index == (nums.length - 1).toString()) {
			return nums[index];
		}
		nums[Number(index) + 1] += nums[index] * 60;
	}
	return 0;
}

/**
 * compares entry using the current sort setting
 * @param entry1 entry 1
 * @param entry2 entry 2
 */
function compareEntries(entry1:Movie, entry2:Movie): number {
	const sortBy = sort.value[0];
	const co = sort.value[1] ? 1 : -1;
	switch (sortBy) {
		case "id":
		case "title": {
			return co * entry1[sortBy].localeCompare(entry2[sortBy]);
		}
		case "duration": {
			// hehehehehe sex
			const secs1 = timestampToSeconds(entry1.duration);
			const secs2 = timestampToSeconds(entry2.duration);
			return co * (secs1 - secs2);
		}
		case "date": {
			const date1 = new Date(entry1.date);
			const date2 = new Date(entry2.date);
			return co * (+date1 - +date2);
		}
		default: {
			return 0;
		}
	}
}

function resizeColumn(key:EntryKey<Movie>, newWidth:number) {
	columns.value[key] = newWidth;
}

/** updates the sort setting and resorts the list */
function changeSort(key:EntryKey<Movie>) {
	if (sort.value[0] == key) {
		sort.value[1] = !sort.value[1];
	} else {
		sort.value = [key, true];
	}
	data.value.entries = data.value.entries.sort(compareEntries);
}

/**
 * initializes the list using either the movie or starter list
 * if a movie list is being loaded, it allows a folder to be specified
 * @param filter should the movie or starter list be loaded
 * @param folderId folder to load
 */
async function getMovieTree(folderId:string): Promise<{
	// navbar_parent_folders: NavbarEntry[],
	navbar_parent_folders: void,
	list_data: {
		folders: [],
		entries: Movie[],
	}
}>
async function getMovieTree(folderId?:string) {
	let url = `${apiServer}/api/movie/list`;
	if (folderId && folderId.length > 0) {
		url += `?path=${folderId}`;
	}
	const res = await fetch(url);
	if (!res.ok) {
		return;
	}
	const json = await res.json();

	// let parentFolderEntries:NavbarEntry[] | void;
	let parentFolderEntries:void;
	return {
		navbar_parent_folders: parentFolderEntries,
		list_data: {
			folders: json.folders,
			entries: json.movies,
		}
	};
}

/**
 * loads the movie/starter list along with the relevant navbar entries
 */
async function loadMovieList() {
	const response = await getMovieTree(folder.value);
	data.value = response.list_data;
	data.value.entries = data.value.entries.sort(compareEntries);
	triggerRef(data);
	setTimeout(() => { // wait for thumbs to load
		isLoading.value = false;
	}, 20);
}

watchEffect(async () => {
	if (!listTree.value) {
		return;
	}
	listTree.value.resetSelection();
	resetList();
	folder.value = route.params.folderId as string || "";
	isLoading.value = true;
	await loadMovieList();
});

</script>

<template>
	<div>
		<Navbar>
			<template #right>
				<NavbarDataListSettings new-folder/>
			</template>
		</Navbar>

		<div class="page_contents">
			<br/><br/><br/>new movie, recents<br/><br/><br/><br/>
			<DataList
				ref="list-tree"
				:class="{ load_state:isLoading }"
				:data="filteredData"
				:columns
				:sort
				:data-component="MovieListData"
				:options-component="MovieListOptions"
				@column-resize="resizeColumn"
				@sort-change="changeSort"/>
		</div>
	</div>
</template>

<style lang="css" scoped>
:deep(.dl_cell.folder) svg {
	height: calc((((4 * var(--scale)) - 2px) / 16) * 9)
}

:deep(.dl_row.movie) td.title img,
:deep(.dl_row.folder) td.title svg {
	width: calc(((var(--scale) - 20px) / 9) * 16);
}

</style>
