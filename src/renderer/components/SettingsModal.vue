<script setup lang="ts">
import { apiServer } from "../utils/AppInit.js";
import BaseModal from "./BaseModal.vue";
import Button from "./controls/Button.vue";
import CheckboxInput from "./controls/CheckboxInput.vue";
import { computed, ref, watch } from "vue";
import en_US from "../locale/en_US.js";
import SelectInput from "./controls/SelectInput.vue";
import SettingsModalWatermarks from "./SettingsModalWatermarks.vue";
import useServerSetting from "../composables/useServerSettings.js";
import { useStorage } from "@vueuse/core";
import TextInput from "./controls/TextInput.vue";

enum Tab {
	Behavior,
	Appearance,
	TTS,
	Watermarks
}
type VfStatus = {
	status: "success",
	legacyAllowed: boolean,
	nextResetDate: string,
	tier: "fan_voice" | "premium" | "publisher",
	synthesisUsed: number,
	synthesisLimit: number
} | {
	status: "failure"
} | {
	status: "no_account"
};

const emit = defineEmits<{
	userClose: []
}>();

const assetThumbColor = useStorage("assetThumbColor", "dynamic");
const enableMenuBar = useServerSetting("enableMenuBar");
const fullComponentRotation = useStorage("fullComponentRotation", false);
const onMovieDblclick = useStorage("onMovieDblclick", "play");
const onMovieUpload = useStorage("onMovieUpload", "edit");
const pollyService = useServerSetting("pollyService");
const previewAssetOnHover = useStorage("previewAssetOnHover", true);
const saveLogFiles = useServerSetting("saveLogFiles");
const showWaveforms = useStorage("showWaveforms", true);
const theme = useStorage("theme", "auto");
const truncatedThemeList = useServerSetting("truncatedThemeList");
const vfEmail = ref("");
const vfPassword = ref("");
const vfStatus = ref<VfStatus | null>(null);
const widescreen = useStorage("widescreen", true);

const currentTab = ref(Tab.Behavior);
const onBehaviorTab = computed(() => currentTab.value == Tab.Behavior);
const onAppearanceTab = computed(() => currentTab.value == Tab.Appearance);
const onTTSTab = computed(() => currentTab.value == Tab.TTS);
const onWatermarksTab = computed(() => currentTab.value == Tab.Watermarks);
const vfButtonTextOverride = ref("");
const vfButtonText = computed(() => {
	if (vfButtonTextOverride.value) {
		return vfButtonTextOverride.value;
	}
	return (vfEmail.value == "" || vfPassword.value == "") ?
		en_US.settings.vf.reset : en_US.settings.vf.save;
});

/**
 * switches the currently displayed tab
 * @param switchTo tab to be displayed
 */
function switchTab(switchTo:Tab) {
	currentTab.value = switchTo;
}

async function updateVfStatus() {
	const res = await fetch(apiServer + "/api/tts/voiceforge/status");
	if (res.ok) {
		const json = await res.json() as VfStatus;
		vfStatus.value = json;
	}	
}

/**
 * forwards voiceforge credentials to the server
 * @param event mouse event
 */
async function vfCreds_update(event:MouseEvent) {
	const target = event.currentTarget as HTMLElement | null;
	vfButtonTextOverride.value = "...";
	const body = new FormData();
	body.set("email", vfEmail.value);
	body.set("password", vfPassword.value);
	const res = await fetch(apiServer + "/api/tts/voiceforge/sign_in", {
		method: "POST",
		body
	});
	if (res.ok) {
		await updateVfStatus();
		if (!target) {
			return;
		}
		vfButtonTextOverride.value = en_US.settings.vf.save_success;
		target.classList.add("green");
		setTimeout(() => {
			vfButtonTextOverride.value = "";
			target.classList.remove("green");
		}, 1200);
	} else {
		vfStatus.value = { status:"failure" };
		if (!target) {
			return;
		}
		vfButtonTextOverride.value = en_US.settings.vf.save_failure;
		target.classList.add("red");
		setTimeout(() => {
			vfButtonTextOverride.value = "";
			target.classList.remove("red");
		}, 1200);
	}
}

const unwatch = watch(onTTSTab, () => {
	updateVfStatus();
	unwatch();
});
</script>

<template>
	<BaseModal class="settings_container" @click-outside="emit('userClose')">
		<template #heading>Settings</template>

		<div class="tab_col">
			<div role="button" class="tab_btn" :class="{ sel:onBehaviorTab }" @click="switchTab(Tab.Behavior)">
				Behavior
			</div>
			<div role="button" class="tab_btn" :class="{ sel:onAppearanceTab }" @click="switchTab(Tab.Appearance)">
				Appearance
			</div>
			<div role="button" class="tab_btn" :class="{ sel:onTTSTab }" @click="switchTab(Tab.TTS)">
				Text-to-speech
			</div>
			<div role="button" class="tab_btn" :class="{ sel:onWatermarksTab }" @click="switchTab(Tab.Watermarks)">
				Watermarks
			</div>
		</div>

		<div v-if="onBehaviorTab" class="tab">
			<h2>Videos</h2>

			<div class="setting_row">
				<div class="title">
					<h3>When double clicking a video</h3>
					<SelectInput
						align="right"
						:options="{
							'edit': 'Open video editor',
							'play': 'Open video player',
							'none': 'Do nothing'
						}"
						v-model="onMovieDblclick"
					/>
				</div>
			</div>

			<div class="setting_row">
				<div class="title">
					<h3>After uploading a video</h3>
					<SelectInput
						align="right"
						:options="{
							'edit': 'Open video editor',
							'play': 'Open video player',
							'none': 'Do nothing'
						}"
						v-model="onMovieUpload"
					/>
				</div>
			</div>

			<h2>Character editor</h2>

			<div class="setting_row binary" @click="fullComponentRotation = !fullComponentRotation">
				<div class="title">
					<h3>Enable continuous rotation</h3>
					<CheckboxInput v-model="fullComponentRotation"/>
				</div>
				<p class="info">This controls whether rotation of components locks out at 180 degrees.</p>
			</div>

			<div class="setting_row binary" @click="previewAssetOnHover = !previewAssetOnHover">
				<div class="title">
					<h3>Preview assets on hover</h3>
					<CheckboxInput v-model="previewAssetOnHover"/>
				</div>
				<p class="info">This controls whether assets show up on the preview while a thumbnail is hovered.</p>
			</div>

			<h2>Program</h2>

			<div class="setting_row binary" @click="enableMenuBar = !enableMenuBar">
				<div class="title">
					<h3>Enable menu bar</h3>
					<CheckboxInput v-model="enableMenuBar"/>
				</div>
				<p class="info">While enabled, the menu bar can be toggled on or off using the Alt key.</p>
			</div>

			<div class="setting_row binary" @click="saveLogFiles = !saveLogFiles">
				<div class="title">
					<h3>Save log files</h3>
					<CheckboxInput v-model="saveLogFiles"/>
				</div>
				<p class="info">Saves everything in the console to the _LOGS folder. This may take up a lot of space if left on.<br/>
					<i>Applies on next restart.</i></p>
			</div>
		</div>
		<div v-if="onAppearanceTab" class="tab">
			<h2>Program</h2>

			<div class="setting_row">
				<div class="title">
					<h3>Theme</h3>
					<SelectInput
						align="right"
						:options="{
							auto: 'Follow system',
							light: 'Light',
							dark: 'Dark'
						}"
						v-model="theme"
					/>
				</div>
				<p class="info"><i>This does not apply in the video editor.</i></p>
			</div>

			<div class="setting_row binary" @click="truncatedThemeList = !truncatedThemeList">
				<div class="title">
					<h3>Truncated themelist</h3>
					<CheckboxInput v-model="truncatedThemeList"/>
				</div>
				<p class="info">Shows a limited selection of themes.</p>
			</div>

			<h2>Character editor</h2>

			<div class="setting_row">
				<div class="title">
					<h3>Thumbnail colorization</h3>
					<SelectInput
						align="right"
						:options="{
							dynamic: 'Dynamic',
							fixed: 'Fixed',
							classic: 'Classic'
						}"
						v-model="assetThumbColor"
					/>
				</div>
				<p class="info">This controls how asset thumbnails are colored.</p>
			</div>

			<h2>Video editor</h2>

			<div class="setting_row">
				<div class="title">
					<h3>Aspect ratio</h3>
					<SelectInput
						align="right"
						:options="{
							true: '16:9',
							false: '14:9'
						}"
						v-model="widescreen"
					/>
				</div>
			</div>

			<div class="setting_row binary" @click="showWaveforms = !showWaveforms">
				<div class="title">
					<h3>Show waveforms</h3>
					<CheckboxInput v-model="showWaveforms"/>
				</div>
				<p class="info">Turning this off will show audio info by default,
					which could potentially boost performance.</p>
			</div>
		</div>
		<div v-if="onTTSTab" class="tab">
			<div class="setting_row">
				<div class="title">
					<h3>Preferred service for Polly voices</h3>
					<SelectInput
						align="right"
						:options="{
							both: 'List both',
							rl: 'ReadLoud only',
							sl: 'Streamlabs only'
						}"
						v-model="pollyService"
					/>
				</div>
			</div>

			<div class="setting_row">
				<div class="title">
					<h3>VoiceForge</h3>
					<div v-if="vfStatus" class="flex">
						<TextInput type="email" placeholder="Email" v-model="vfEmail"/>
						<TextInput type="password" placeholder="Password" v-model="vfPassword"/>
						<Button style="width:60px" @click="vfCreds_update">{{ vfButtonText }}</Button>
					</div>
				</div>
				<p class="info">If you paid for a <a href="javascript:window.appWindow.openVoiceforge()">VoiceForge</a> subscription, you may enter
					your credentials here to access their voices inside the video editor.
					This is encrypted and not shared with anybody.</p>
				<ul v-if="vfStatus" class="info">
					<li>Status: {{ en_US.settings.vf.status[vfStatus.status] }}</li>
					<template v-if="vfStatus.status == 'success'">
						<li>Can use legacy voices: {{ vfStatus.legacyAllowed ? en_US.yes : en_US.no }}</li>
						<li>Tier: {{ en_US.settings.vf.plan_names[vfStatus.tier] }}</li>
						<li>Syntheses used: {{ vfStatus.synthesisUsed }} / {{ vfStatus.synthesisLimit }}</li>
						<li>Resets at {{ vfStatus.nextResetDate }}</li>
					</template>
				</ul>
			</div>
		</div>
		<div v-if="onWatermarksTab" class="tab">
			<SettingsModalWatermarks/>
		</div>

		<template #foot>
			<Button @click="$emit('userClose')">Close</Button>
		</template>
	</BaseModal>
</template>

<style>
.settings_container .contents {
	display: flex;
	overflow: hidden;
	padding: 0;
	width: 776px;
	height: 400px;
}

.settings_container .tab_col {
	border-right: 1px solid hsl(254 16% 86% / 1);
	flex-shrink: 0;
	padding: 15px;
	width: 185px;
}
.settings_container .tab_col .tab_btn {
	background: #0000;
	border-radius: 4px;
	transition: background 0.2s var(--button-anim);
	user-select: none;
	display: block;
	margin: 0 0 1px;
	padding: 4px 10px;
	font-size: 15px;
	font-weight: normal;
}
.settings_container .tab_col .tab_btn:hover {
	background: hsl(346 65% 91%);
	color: hsl(338 20% 42%);
	transition: none;
	cursor: pointer;
}
.settings_container .tab_col .tab_btn.sel {
	background: hsl(344 97% 65%);
	color: #fff;
	cursor: default;
	font-weight: bold;
}

.settings_container .tab {
	flex-grow: 1;
	overflow-y: scroll;
	padding: 15px 20px;
}
.settings_container .tab h2 {
	opacity: 0.75;
	user-select: none;
	font-size: 20px;
	font-weight: normal;
	line-height: 2.2;
	margin: 35px 0 10px;
}
.settings_container .tab h2:first-of-type {
	margin-top: 0;
}
.settings_container .tab .setting_row {
	border-bottom: 1px solid hsl(254 16% 86% / 1);
	user-select: none;
	justify-content: space-between;
	margin: auto;
	padding: 0 0 12px;
	margin-bottom: 11px;
}
.settings_container .tab .setting_row .title {
	display: flex;
	align-items: center;
	justify-content: space-between;
	min-height: 32px;
}
.settings_container .tab .setting_row .title .dropdown {
	min-width: 90px;
}
.settings_container .tab .setting_row .title .text_input,
.settings_container .tab .setting_row .title .btn {
	margin: 0 0 0 5px;
}
.settings_container .tab .setting_row .title .btn {
	transition: 0.2s var(--button-anim);
	text-align: center;
}
.settings_container .tab .setting_row .title .btn.green {
	background: #41a569;
	color: #e1fde7;
}
.settings_container .tab .setting_row .title .btn.red {
	background: #da4153;
	color: #fde6e5;
}
.settings_container .tab .setting_row .title div.flex {
	display: flex;
}
.settings_container .tab .setting_row h3 {
	margin: 0;
	font-size: 15px;
}
.settings_container .tab .setting_row p {
	color: hsl(0deg 0% 60%);
	margin: 0;
	font-size: 13px;
	line-height: 22px;
}
.settings_container .tab .setting_row.binary {
	cursor: pointer;
}

html.dark .settings_container .tab_col {
	border-color: hsl(250deg 11% 21%);
}
html.dark .settings_container .tab_col .tab_btn:hover {
	background: hsl(250deg 11% 21%);
}
html.dark .settings_container .tab_col .tab_btn.sel {
	background: hsl(343 78% 59%);
}
html.dark .settings_container .tab .setting_row {
	border-color: hsl(250deg 11% 21%);
}

@media (min-height: 800px) {
	.settings_container .contents {
		height: 600px;
	}
}

</style>
