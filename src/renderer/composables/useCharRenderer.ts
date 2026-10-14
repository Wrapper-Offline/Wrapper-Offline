import { onUnmounted, type ShallowRef } from "vue";

type ThumbRenderedCallback = (bytes:string) => any;

let crReady = false;
let charRenderer:Readonly<ShallowRef<HTMLObjectElement>>;
let queue:string[][] = [];
let callbacks:Record<string, ThumbRenderedCallback> = {};

let chunks:string[] = [];

export function initCR(elem:Readonly<ShallowRef<HTMLObjectElement>>) {
	charRenderer = elem;
	//@ts-ignore
	window.pushThumbChunk = function (bytes:string) {
		chunks.push[bytes];
	}
	//@ts-ignore
	window.pushFinalThumbChunk = function (charId:string, bytes:string) {
		chunks.push(bytes);
		callbacks[charId](chunks.join(""));
		chunks = []
		delete callbacks[charId];
	};
	//@ts-ignore
	window.rendererReady = function () {
		crReady = true;
		for (const [charId, themeId] of queue) {
			//@ts-ignore
			charRenderer.value.addToQueue(charId, themeId);
		}
		queue = null;
	};
	onUnmounted(() => {
		//@ts-ignore
		delete window.charThumbRendered;
		//@ts-ignore
		delete window.charThumbRendered;
		charRenderer = null;
	});
};

/**
 * resets the sidebar state to default
 * @param charId character id
 * @param themeId character theme
 */
export function renderThumb(charId:string, themeId:string, callback:ThumbRenderedCallback) {
	if (!charRenderer) {
		throw new Error("char_renderer not initialized");
	}
	callbacks[charId] = callback;
	if (crReady) {
		//@ts-ignore
		charRenderer.value.addToQueue(charId, themeId);
	} else {
		queue.push([charId, themeId]);
	}
};

export default function useCharRenderer() { 
	return {
		renderThumb
	};
};
