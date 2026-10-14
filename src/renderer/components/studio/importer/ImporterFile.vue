<style>
.importer_asset {
	background: #f7f7f8;
	border-bottom: 1px solid #bfb9da;
	box-shadow: 0 0 1px #0009;
	border-radius: 3px;
	margin: 6px 7px;
	padding: 4px 6px 0;
}
.importer_asset .asset_metadata {
	display: flex;
}
.importer_asset .asset_metadata .asset_preview {
	margin: 4px;
	margin-right: 8px;
	object-fit: contain;
	width: 40px;
	height: 40px;
}
.importer_asset .asset_metadata .asset_title {
	background: #e9e9ec;
	border: 1px solid #c1bbd3;
	color: #444;
	border-radius: 3px;
	font-weight: bold;
	line-height: 18px;
	margin: 0;
	margin-top: 3px;
	padding: 2px 4px;
}
.importer_asset .asset_metadata .asset_subtype {
	color: #858e95;
	font-size: 12px;
	margin: 0 0 4px;
}

/**
asset buttons
**/
.importer_asset .asset_btns {
	background: #fff;
	border: 1px solid #e0dde9;
	border-radius: 3px;
	margin-bottom: 6px;
}
.importer_asset .asset_btns button {
	background: #0000;
	border: none;
	border-bottom: 1px solid #e0dde9;
	transition: background 0.2s var(--button-anim);
	color: #505969;
	cursor: pointer;
	text-align: left;
	font-weight: bold;
	display: block;
	padding: 6px 12px;
	width: 100%;
}
.importer_asset .asset_btns button.cancel {
	color: #c70000;
	font-weight: normal;
}
.importer_asset .asset_btns button:last-of-type {
	border: none;
}
.importer_asset .asset_btns button:focus {
	outline: none
}
.importer_asset .asset_btns button:hover {
	background: #0000000a;
	transition: none;
}

/**
upload status
**/
.loading_bar {
	margin-bottom: 6px;
}
.loading_track {
	background: #e9e9ec;
	border: 2px solid #d4d4d4;
	height: 14px;
	border-radius: 999px;
	overflow: hidden;
}
.loading_thumb {
	background: #ff3888;
	border: 1px solid #dedee3;
	border-radius: 99px;
	animation: 3s linear infinite trackmove;
	margin-left: -27px;
	width: 140px;
	height: 10px;
}
@keyframes trackmove {
	0%   { margin-left: -140px; }
	100% { margin-left: 320px }
}

/**
enter animation
**/
.slide-enter-active {
	animation: slide 0.15s var(--slide-anim);
}
@keyframes slide {
	0%   { transform: translateX(-500px) }
	100% { transform: translateX(0) }
}
</style>

<script setup lang="ts">
import { apiServer } from "../../../utils/AppInit";
import locale from "../../../locale/en_US";
import { type PendingFile } from "./AssetImporter.vue";
import { type Ref, ref, toValue, useTemplateRef, watch } from "vue";

export type AssetStatus = "await_type" | "await_ptype" | "uploading" | "error" | "finished";

const emit = defineEmits<{
	cancelClicked: [],
	statusUpdated: [AssetStatus],
	uploadFail: [string],
	uploadSuccess: [string, string, Record<string, string>],
	addToScene: [string, string],
}>();
const props = defineProps<{
	file: PendingFile
}>();

let baseType = ref("");
let flatType = "";
/** ["type", "subtype", "ptype"?] */
let assetType:string[] = ["", ""];
let assetId = "";
const status:Ref<AssetStatus> = ref("await_type");
/* icon next to the asset name and size */
const thumbUrl = ref("");
/* user-editable title */
const titleElement = useTemplateRef("asset-title");
const errorText = ref("");

// emit status updates to the studio page so it can update the icon
watch(status, (newStatus:AssetStatus) => emit("statusUpdated", newStatus));

/* util functions */

/**
 * returns the proper name of a flat type from its ID
 * @param type flat type id
 */
function flatTypeName(type:string): string {
	return locale.asset.flat_type_map[type];
}

/**
 * converts a flat type to the "type"/"subtype" format the LVM prefers
 * @param type user-selected flat type
 */
function lvmTypesFromflatType(type:string): [string, string] {
	switch (type) {
		case "bgmusic":
		case "soundeffect":
		case "voiceover":
			return ["sound", type];
		case "video":
			return ["prop", type];
		default:
			return [type, "0"];
	}
}

/**
 * picks a "basic" type to use based on the file's extension
 * this is later used to allow the user to select a type the lvm uses
 * @param ext file extension
 */
function basicTypeFromExt(ext:string) {
	switch (ext) {
		case "flac":
		case "ogg":
		case "m4a":
		case "mp3":
		case "wav":
		case "wma":
			return "sound";
		case "gif":
		case "jpeg":
		case "jpg":
		case "png":
		case "swf":
		case "tiff":
		case "tif":
		case "webp":
			return "image";
		case "avi":
		case "mkv":
		case "mov":
		case "mp4":
		case "webm":
		case "wmv":
			return "video";
	}
}

/**
 * switches to the error state, updates message
 * @param msg error message
 */
function displayError(msg:string) {
	status.value = "error";
	thumbUrl.value = "/img/importer/error.svg";
	errorText.value = msg;
	emit("uploadFail", msg);
}

/* events */

function videoAsSound() {
	baseType.value = "sound";
	thumbUrl.value = `/img/importer/${baseType.value}.svg`;
}

/**
 * called when the user clicks on an asset subtype
 * either goes ahead with the upload or awaits the prop type if applicable
 * @param selected flat type
 */
function typeSelected(selected:string) {
	flatType = selected;
	assetType = lvmTypesFromflatType(selected);
	if (assetType[0] == "prop" && assetType[1] != "video") {
		status.value = "await_ptype";
		return;
	}
	beginUpload();
}

/**
 * called when the user selects a prop type to upload as
 * begins the file upload
 * @param type prop type
 */
function propTypeSelected(type:string) {
	assetType[2] = type;
	beginUpload();
}

/**
 * uploads the asset to the server
 */
async function beginUpload() {
	let title = titleElement.value.innerText;
	if (title == "") {
		title = "unnamed" + Math.random().toString().substring(2, 8);
	}

	status.value = "uploading";

	let b = new FormData();
	b.append("import", props.file.file);
	b.append("name", title)
	b.append("type", assetType[0]);
	b.append("subtype", assetType[1]);
	if (assetType[0] == "prop" && assetType[1] == "0") {
		b.append("ptype", assetType[2] || "");
	}

	const response = await fetch(`${apiServer}/api/asset/upload`, {
		method: "POST",
		body: b
	});
	if (!response.ok) {
		status.value = "finished";
		displayError("An unknown error occurred");
		return;
	}

	const responseData = await response.json();
	uploadComplete(responseData);
	// for some reason this never gets garbage collected
	b = null;
	props.file.file = null;
}

/**
 * called when an asset has been successfully uploaded
 * emits an event with an object that'll be passed to the LVM
 * @param responseJson json response from the server
 */
function uploadComplete(responseJson:any): void {
	status.value = "finished";

	assetId = responseJson.id;
	const title = responseJson.title;
	let lvmObject:Record<string, string> = {
		file: assetId,
		enc_asset_id: assetId,
		title: title,
		tags: "",
		type: assetType[0],
		subtype: assetType[1],
	};

	const importType = assetType[1] == "video" ? "video" : assetType[0];
	switch (importType) {
		case "prop":
			lvmObject.ptype = assetType[2];
		case "bg": {
			if (assetId.endsWith("swf")) {
				thumbUrl.value = "/img/importer/flash.svg";
			} else {
				thumbUrl.value = `${apiServer}/assets/${assetId}`;
			}
			break;
		}
		case "sound": {
			lvmObject.duration = responseJson.duration;
			lvmObject.downloadtype = "progressive";
			break;
		}
		case "video": {
			thumbUrl.value = `${apiServer}/assets/${assetId.slice(0, -3) + "png"}`;
			lvmObject.thumbnail = toValue(thumbUrl);
			lvmObject.width = responseJson.width;
			lvmObject.height = responseJson.height;
			break;
		}
	}

	emit("uploadSuccess", importType, assetId, lvmObject)
}

function addToScene() {
	const importType = assetType[1] == "video" ? "video" : assetType[0];
	emit("addToScene", importType, assetId);
}

baseType.value = basicTypeFromExt(props.file.ext);
thumbUrl.value = `/img/importer/${baseType.value}.svg`;
</script>

<template>
	<div>
		<Transition appear name="slide">
			<div class="importer_asset">
				<div class="asset_metadata">
					<img class="asset_preview" :src="thumbUrl"/>
					<div>
						<h4 contenteditable spellcheck="false" class="asset_title" ref="asset-title">
							{{ props.file.name }}
						</h4>
						<p class="asset_subtype">
							{{ props.file.size }} - 
							{{ status == "await_type" ?
								"Import as..." :
								status != 'error' ? flatTypeName(flatType) : errorText }}
						</p>
					</div>
				</div>
				<!-- step 1: asset type -->
				<div v-if="status == 'await_type' && baseType == 'sound'" class="asset_btns">
					<button @click="typeSelected('bgmusic')">{{ flatTypeName("bgmusic") }}</button>
					<button @click="typeSelected('soundeffect')">{{ flatTypeName("soundeffect") }}</button>
					<button @click="typeSelected('voiceover')">{{ flatTypeName("voiceover") }}</button>
					<button @click="$emit('cancelClicked')" class="cancel">Cancel</button>
				</div>
				<div v-if="status == 'await_type' && baseType == 'image'" class="asset_btns">
					<button @click="typeSelected('bg')">{{ flatTypeName("bg") }}</button>
					<button @click="typeSelected('prop')">{{ flatTypeName("prop") }}</button>
					<button @click="$emit('cancelClicked')" class="cancel">Cancel</button>
				</div>
				<div v-if="status == 'await_type' && baseType == 'video'" class="asset_btns">
					<button @click="typeSelected('video')">Import</button>
					<button @click="videoAsSound">Import as sound</button>
					<button @click="$emit('cancelClicked')" class="cancel">Cancel</button>
				</div>
				<!-- step 2: prop type (if applicable) -->
				<div v-if="status == 'await_ptype'" class="asset_btns">
					<button @click="propTypeSelected('placeable')">{{ flatTypeName("placeable") }}</button>
					<button @click="propTypeSelected('holdable')">{{ flatTypeName("holdable") }}</button>
					<button @click="propTypeSelected('wearable')">{{ flatTypeName("wearable") }}</button>
					<button @click="$emit('cancelClicked')" class="cancel">Cancel</button>
				</div>
				<!-- step 3: uploading text -->
				<div v-if="status == 'uploading'" class="loading_bar">
					<div class="loading_track"><div class="loading_thumb"></div></div>
				</div>
				<!-- step 4: error or success -->
				<div v-if="status == 'error'" class="asset_btns">
					<button @click="$emit('cancelClicked')">Close</button>
				</div>
				<div v-if="status == 'finished'" class="asset_btns">
					<button
						v-if="assetType[2] ? assetType[2] == 'placeable' : true"
						@click="addToScene">
						Add to scene
					</button>
					<button @click="$emit('cancelClicked')">Close</button>
				</div>
			</div>
		</Transition>
	</div>
</template>
