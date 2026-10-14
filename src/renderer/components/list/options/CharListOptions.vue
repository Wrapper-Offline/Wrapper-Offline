<style src="./data_list_options.css"/>

<script setup lang="ts">
import { apiServer } from "../../../utils/AppInit";
import en_US from "../../../locale/en_US";
import type { Char } from "../../../interfaces/Asset";

const emit = defineEmits<{
	entryDelete: [string[]]
}>();
const props = defineProps<{
	entry: Char | string[]
}>();

const isSingular = !Array.isArray(props.entry);

/**
 * called when delete button is clicked
 */
async function deleteBtn_click() {
	const msg = isSingular ?
		en_US.list.actions.movie_delete_confirm.sing :
		en_US.list.actions.movie_delete_confirm.plr;
	if (!confirm(msg)) {
		return;	
	}

	const idField = Array.isArray(props.entry) ?
		props.entry.join(",") :
		props.entry.id;
	const body = new FormData();
	body.append("id", idField);
	const res = await fetch(apiServer + "/api/movie/delete", {
		method: "POST",
		body
	});
	if (!res.ok) {
		alert("Failed to delete movie");
		return;
	}
	emit("entryDelete", idField.split(","));
}

/**
 * returns array of entry ids
 */
function idsAsArray() {
	return Array.isArray(props.entry) ?
		props.entry :
		[ props.entry.id ];
}
</script>

<template>
	<div class="data_list_options">
		<RouterLink
			v-show="isSingular"
			class="option"
			:to="`/movies/edit/${(entry as Char).id}`"
			v-tooltip="'Edit'"
			@click.stop>
			<i class="ico brush"></i>
		</RouterLink>
		<a
			class="option"
			:href="`${apiServer}/file/movie/file/${idsAsArray().join(',')}`"
			download="download.zip"
			v-tooltip="'Download project files'"
			@click.stop>
			<i class="ico download"></i>
		</a>
		<a class="option" href="javascript:;" v-tooltip="'Delete'" @click.stop.prevent="deleteBtn_click">
			<i class="ico trash"></i>
		</a>
	</div>
</template>
