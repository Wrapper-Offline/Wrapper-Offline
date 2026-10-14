<style scoped>
img {
	object-fit: contain;
	width: 100%;
	height: 100%;
}
/* play button for previewable assets */
.audio_play {
	transition: 0.2s var(--button-anim);
	cursor: pointer;
	position: absolute;
	width: 160px;
	height: 170px;
}
.audio_play .play_icon {
	background: #0007;
	color: #fff;
	border-radius: 100%;
	display: none;
	padding: 8px 13px;
	margin: 65px auto 0;
	width: 40px;
	height: 40px;
}
.audio_play:hover {
	background: #0002;
	border-radius: 4px;
	transition: none;
}
.audio_play:hover .play_icon {
	display: block;
}
</style>

<script setup lang="ts">
import { apiServer } from "../utils/AppInit";
import type { Asset } from "../interfaces/Asset";
import { ref, useTemplateRef } from "vue";

const props = defineProps<{
	asset: Asset,
	playable?: boolean
}>();
const audio = useTemplateRef<HTMLAudioElement>("audio");

const playing = ref(props.playable ? false : null);

function containerClicked() {
	if (props.playable && props.asset.type == "sound") {
		playing.value = !playing.value;
		if (playing.value == true) {
			audio.value.play();
			return;
		}
		audio.value.pause();
		audio.value.currentTime = 0;
	}
}
</script>

<template>
	<div @click="containerClicked">
		<div v-if="playable && asset.type == 'sound'" class="audio_play">
			<div v-if="playing" class="play_icon"><i class="ico pause"></i></div>
			<div v-else class="play_icon"><i class="ico play"></i></div>
		</div>

		<img v-if="asset.id.endsWith('swf')" src="/img/importer/flash.svg"/>

		<img v-else-if="asset.type == 'sound'" src="/img/importer/sound.svg"/>

		<img v-else-if="asset.type == 'prop' && asset.subtype == 'video'"
			:src="`${apiServer}/assets/${asset.id.slice(0, -4)}.png`"/>

		<img v-else :src="`${apiServer}/assets/${asset.id}`"/>

		<audio
			v-if="asset.type == 'sound'"
			:src="`${apiServer}/assets/${asset.id}`"
			preload="none"
			@ended="playing = false"
			ref="audio">
		</audio>
	</div>
</template>
