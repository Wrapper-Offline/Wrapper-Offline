<style>
.popup_container.asset_preview .contents {
	min-width: 400px;
	max-width: 450px;
}
.asset_info {
	display: flex;
}
/* asset preview */
.asset_info .asset_info_left {
	flex-shrink: 0;
	margin-right: 8px;
	width: 160px;
	height: 170px;
}
.asset_info .asset_info_left .image_container {
	user-select: none;
	display: block;
	width: 160px;
	height: 170px;
}
/* information column */
.asset_info .asset_info_right h3 {
	margin: 0 0 4px 3px;
	overflow: hidden;
	text-overflow: ellipsis;
	white-space: nowrap;
	width: 250px;
}
.asset_info .asset_info_right table {
	margin: 0 0 4px;
}
.asset_info .asset_info_right table tr>td {
	padding: 1px 6px;
}
.asset_info .asset_info_right table tr>td:nth-child(1) {
	font-weight: bold;
	text-align: right;
	padding-right: 4px;
	min-width: 60px;
}
.asset_info .asset_info_right table tr>td:nth-child(2) {
	padding-left: 4px;
}
.asset_info .asset_info_right table tr>td:hover {
	background: #e3e2e9;
	cursor: default;
}
</style>

<script setup lang="ts">
import { apiServer } from "../utils/AppInit";
import type { Asset } from "../interfaces/Asset";
import AssetImage from "./AssetImage.vue";
import Button from "./controls/Button.vue";
import { flattenAssetType } from "../utils/flattenAssetType";
import { formatDur } from "../utils/formatDur";
import locale from "../locale/en_US";
import Popup from "./Popup.vue";
import { ref, useTemplateRef } from "vue";

const emit = defineEmits<{
	closeClicked: [],
	update: [Partial<Asset>]
}>();

let popupKey = ref("ok");
const props = defineProps<{
	asset: Asset
}>();
const isConfirmCancel = ref(false);
const isEditing = ref(false);
const titleBox = useTemplateRef<HTMLHeadingElement>("title_box");

/**
 * flattens the props type and returns its name
 * type: prop, subtype: video -> Video
 */
function flattenedTypeName() {
	const flatType = flattenAssetType(
		props.asset.type,
		props.asset.subtype,
		props.asset.ptype
	);
	return locale.asset.flat_type_map[flatType];
}

function confirmCancel(response:boolean) {
	isConfirmCancel.value = false;
	if (response) {
		isEditing.value = false;
		popupKey.value = null;
		popupKey.value = "asssetinfo" + props.asset.id;
	}
}

/**
 * called when the finish editing button is clicked
 * @param save should the edits be saved
 */
function editFinished() {
	isEditing.value = false;
	const title = titleBox.value.innerText.trim();
	updateAssetInfo({ name: title });
}

function updateAssetInfo(newInfo:Partial<Asset>) {
	const xhttp = new XMLHttpRequest();
	xhttp.onreadystatechange = () => {
		emit("update", newInfo);
	};
	xhttp.open("POST", apiServer + "/api_v2/asset/update/");
	xhttp.setRequestHeader("Content-Type", "application/json");
	xhttp.send(JSON.stringify({
		data: {
			id: props.asset.id,
			title: newInfo.name,
		}
	}));
}
</script>

<template>
	<Popup :key="popupKey" class="asset_preview">
		<template #small-heading>Your Library</template>
		<template #large-heading>Asset information</template>

		<div v-show="!isConfirmCancel" class="asset_info">
			<div class="asset_info_left">
				<AssetImage class="image_container" :asset="asset" playable/>
			</div>
			<div class="asset_info_right">
				<h3
					:title="asset.name.length > 25 ? asset.name : ''"
					:contenteditable="isEditing"
					ref="title_box">
					{{ asset.name }}
				</h3>
				<table>
					<tbody>
						<tr>
							<td>ID:</td>
							<td>{{ asset.id }}</td>
						</tr>
						<tr>
							<td>Type:</td>
							<td>{{ flattenedTypeName() }}</td>
						</tr>
						<tr v-if="asset.type == 'sound'">
							<td>Duration:</td>
							<td>{{ formatDur(asset.duration) }}</td>
						</tr>
						<template v-if="asset.subtype == 'video'">
							<tr>
								<td>Width:</td>
								<td>{{ asset.width }}px</td>
							</tr>
							<tr>
								<td>Height:</td>
								<td>{{ asset.height }}px</td>
							</tr>
						</template>
					</tbody>
				</table>
			</div>
		</div>
		<div v-show="isConfirmCancel" class="confirm_cancel">
			<h3>Cancel edit</h3>
			<p>Are you sure you would like to cancel your pending changes?<br/>
				They will not be saved!</p>
		</div>

		<template #foot>
			<template v-if="isConfirmCancel">
				<Button @click="confirmCancel(true)">Yes</Button>
				<Button primary @click="confirmCancel(false)">No</Button>
			</template>
			<template v-else-if="isEditing">
				<Button @click="isConfirmCancel = true">Cancel</Button>
				<Button primary @click="editFinished">Save changes</Button>
			</template>
			<template v-else>
				<Button @click="isEditing = true">Edit</Button>
				<Button primary @click="$emit('closeClicked')">Close</Button>
			</template>
		</template>
	</Popup>
</template>
