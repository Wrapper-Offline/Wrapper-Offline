<style>
#full_page_container {
	display: flex;
	flex-direction: column;
	padding: 0;
	width: 100%;
	height: 100%;
}
</style>

<script setup lang="ts">
import CCObject from "../components/CCObject.vue";
import Navbar from "../components/Navbar.vue";
import { onBeforeRouteUpdate, useRoute, useRouter } from "vue-router";
import { onMounted, type Ref, ref, useTemplateRef } from "vue";
import { useSidebar } from "../composables/useSidebar";
import useTempStorage from "../composables/useTempStorage";
import { useThemeList } from "../composables/useThemeList";
import CCThemeSelector from "../components/CCThemeSelector.vue";

type CCObjectType = InstanceType<typeof CCObject>;

const ccObject = useTemplateRef<CCObjectType>("cc-object");
const router = useRouter();
const sidebar = useSidebar();
const tempStorage = useTempStorage();

const baseNavbarEntry = {
	path: "/characters_old",
	title: "Characters"
};
const showDlButton = ref(false);
const showObject = ref(false);
const showSelector = ref(false);

/**
 * initializes cc object
 * @param id theme id
 */
function initObject(id:string) {
	// themeId = id;
	// showSelector.value = false;
	// showObject.value = true;
	// const xml = tempStorage.retrieve("charXmlData") as string | void;
	// if (typeof xml != "undefined") {
	// 	ccObject.value.uploadCharacter(themeId, xml);
	// 	return;
	// }
	// ccObject.value.displayBrowser(themeId);
}

function ccEntered() {
	
	showDlButton.value = true;
}

/**
 * called when download button in navbar is clicked
 */
function charDownload() {
	const xml = ccObject.value.getXml();
	const elem = document.createElement("a");
	elem.href = "data:text/xml," + xml;
	elem.download = "character.xml";
	elem.click();
	elem.remove();
}

/**
 * called when a character is saved, returns to char list
 */
function charSaved() {
	router.push({ name:"char_list" });
}

/**
 * called when a theme has been clicked in the theme selector
 * @param themeId theme id
 * @param bsId bodyshape
 */
function themeSelector_themeClick(themeId:string, bsId:string) {
	ccObject.value.createCharacter(themeId, bsId);
	showSelector.value = false;
	showObject.value = true;
}

sidebar.setRouteState({
	slideMode: true
});

const route = useRoute();
const themeId = route.params.themeId as string | void;
const bs = route.params.bs as string | void;
if (themeId) {
	themeSelector_themeClick(themeId, bs || "default");
} else {
	showSelector.value = true;
	showObject.value = false;
}
</script>

<template>
	<div id="full_page_container">
		<Navbar
			:supported="{ download:showDlButton, save:true }"
			state="cc"
			@download-click="charDownload"/>
		
		<div class="page_contents">
			<CCThemeSelector
				v-if="showSelector"
				cc-filter
				@theme-click="themeSelector_themeClick"
			/>
			<CCObject v-show="showObject" ref="cc-object" @cc-enter="ccEntered" @char-saved="charSaved"/>
		</div>
	</div>
</template>
