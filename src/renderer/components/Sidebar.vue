<script setup lang="ts">
import { apiServer } from "../utils/AppInit";
import AppInfoModal from "./AppInfoModal.vue";
import Dropdown from "./controls/DropdownMenu.vue";
import DropdownItem from "./controls/DropdownItem.vue";
import DropdownSeparator from "./controls/DropdownSeparator.vue";
import extractCharThemeId from "../utils/extractCharThemeId";
import { onBeforeRouteLeave, useRouter } from "vue-router";
import openPlayerWindow from "../utils/openPlayerWindow";
import { ref, toValue, useTemplateRef } from "vue";
import SettingsModal from "./SettingsModal.vue";
import { useSidebar } from "../composables/useSidebar";
import useTempStorage from "../composables/useTempStorage";
import { wrapperVer } from "../utils/AppInit";
import { useStorage } from "@vueuse/core";
import CogIcon from "./icons/CogIcon.vue";
import PeopleIcon from "./icons/PeopleIcon.vue";
import FilmIcon from "./icons/FilmIcon.vue";
import FilmPuzzleIcon from "./icons/FilmPuzzleIcon.vue";
import ImageIcon from "./icons/ImageIcon.vue";
import FolderIcon from "./icons/FolderIcon.vue";
import DiscordIcon from "./icons/DiscordIcon.vue";
import QuestionIcon from "./icons/QuestionIcon.vue";
import PlusIcon from "./icons/PlusIcon.vue";

const charInput = useTemplateRef("char-input");
const movieInput = useTemplateRef("movie-input");
const router = useRouter();
const sidebar = useSidebar();
const tempStorage = useTempStorage();

const collapsed = ref(false);
const displayAppInfo = ref(false);
const displaySettings = ref(false);
const inResize = ref(false);
const logoCollapsed = ref(false);
const movieUploadType = ref("starter");
const onMovieUpload = useStorage("onMovieUpload", "edit");
const width = ref(250);

/**
 * sets the sidebar width
 * @param newWidth new width in px
 */
function setWidth(newWidth:number) {
	if (newWidth <= 93) { // min
		if (newWidth <= 46) {
			width.value = 56;
		} else {
			width.value = 93;
		}
	} else {
		width.value = Math.min(newWidth, 590);
	}
	collapsed.value = toValue(width) <= 56;
	logoCollapsed.value = toValue(width) <= 200;
}

/**
 * called when a character xml has been selected
 * @param e input event
 */
async function charInput_input(e:Event) {
	const target = e.currentTarget as HTMLInputElement;
	if (!target.files) {
		return;
	}
	const xmlData = await target.files[0].text();
	tempStorage.store("charXmlData", xmlData);
	const themeId = extractCharThemeId(xmlData);
	router.push("/characters/" + themeId);
	// todo fix upload button on same theme routes
}

/**
 * called when a movie zip has been selected
 * @param e input event
 */
async function movieInput_input(e:Event) {
	const target = e.currentTarget as HTMLInputElement;
	if (!target.files) {
		return;
	}
	const zipFile = target.files[0];
	const isStarter = movieUploadType.value == "starter";
	const body = new FormData();
	body.append("import", zipFile);
	if (isStarter) {
		body.append("is_starter", "");
	}
	const res = await fetch(apiServer + "/api/movie/upload", {
		method: "POST",
		body
	});
	const json = await res.json();
	switch (onMovieUpload.value) {
		case "edit":
			router.push("/movies/edit/" + json.id);
			break;
		case "play":
			openPlayerWindow(json.id);
			break;
		case "none":
		default:
			// pendingRefresh.set(true);
	}
}

/**
 * called when char upload button is clicked
 */
function charUpload_click() {
	if (!charInput.value) {
		return;
	}
	charInput.value.click();
}

/**
 * called when movie upload button is clicked
 */
function movieUpload_click() {
	if (!movieInput.value) {
		return;
	}
	movieUploadType.value = "movie";
	movieInput.value.click();
}

/**
 * called when starter upload button is clicked
 */
function starterUpload_click() {
	if (!movieInput.value) {
		return;
	}
	movieUploadType.value = "starter";
	movieInput.value.click();
}

/**
 * called when the logo button is clicked, opens app info
 */
function openAppInfo() {
	displayAppInfo.value = true;
}
function closeAppInfo() {
	displayAppInfo.value = false;
}

/**
 * called when the settings button is clicked, opens settings menu
 */
function openSettings() {
	displaySettings.value = true;
}
function closeSettings() {
	displaySettings.value = false;
}

/**
 * called when the user clicks on the size dragger,
 * listens for mousemove and mouseup events
 */
function draggerDown(e:MouseEvent) {
	inResize.value = true;
	document.body.classList.add("col_resize");
	const startX = e.clientX;
	const startWidth = width.value;
	const moveCb = (moveE2:MouseEvent) => {
		const newWidth = startWidth - startX + moveE2.clientX;
		setWidth(newWidth);
	};
	window.addEventListener("mousemove", moveCb);
	window.addEventListener("mouseup", () => {
		window.removeEventListener("mousemove", moveCb);
		inResize.value = false;
		document.body.classList.remove("col_resize");
	});
}

onBeforeRouteLeave(() => {
	sidebar.resetState();
});

defineExpose({ width });
</script>

<template>
	<div class="app_sidebar" :class="{
		collapsed,
		logo_collapsed: logoCollapsed,
		resize: inResize
	}" :style="{
		width: width + 'px'
	}">
		<div id="logo_container" :style="{ width:width + 'px' }">
			<div class="logo_btn" @click="openAppInfo" title="About Wrapper: Offline">
				<img id="logo_icon" src="/img/logo_icon.svg" alt="Candy"/>
				<img id="logo_wordmark" src="/img/logo_wordmark.svg" alt="Wrapper: Offline"/>
			</div>
		</div>
		<ul>
			<Dropdown>
				<template #toggle>
					<li class="link create">
						<button>
							<PlusIcon/>
							<div class="link_text">New</div>
						</button>
					</li>
				</template>
				<RouterLink to="/characters/create" class="dropdown_item">Create a character</RouterLink>
				<RouterLink to="/movies/create" class="dropdown_item">Create a video</RouterLink>
				<DropdownSeparator/>
				<DropdownItem @click="charUpload_click()">Upload a character</DropdownItem>
				<DropdownItem @click="movieUpload_click()">Upload a video</DropdownItem>
				<DropdownItem @click="starterUpload_click()">Upload a starter</DropdownItem>
			</Dropdown>
		</ul>
		<ul class="links">
			<h3>Folders</h3>
			<li class="link" :class="{sel:router.currentRoute.value.name == 'char_list'}">
				<RouterLink to="/characters">
					<PeopleIcon/>
					<div class="link_text">Characters</div>
				</RouterLink>
			</li>
			<li class="link" :class="{sel:router.currentRoute.value.name == 'movie_list' && !router.currentRoute.value.params.folderId}">
				<RouterLink to="/movies">
					<FilmIcon/>
					<div class="link_text">Videos</div>
				</RouterLink>
			</li>
			<li class="link" :class="{sel:router.currentRoute.value.name == 'movie_list' && router.currentRoute.value.params.folderId == 'starters'}">
				<RouterLink to="/movies/starters">
					<FilmPuzzleIcon/>
					<div class="link_text">Starters</div>
				</RouterLink>
			</li>
			<li class="link" :class="{sel:router.currentRoute.value.name == 'asset_list'}">
				<RouterLink to="/assets">
					<ImageIcon/>
					<div class="link_text">Your Library</div>
				</RouterLink>
			</li>

			<div class="spacer"></div>

			<h3>Starred</h3>
			<li class="link">
				<RouterLink to="/fgdf">
					<FolderIcon/>
					<div class="link_text">Example folder</div>
				</RouterLink>
			</li>
			<li class="link">
				<RouterLink to="/">
					<FilmIcon/>
					<div class="link_text">Example movie</div>
				</RouterLink>
			</li>
			<li class="link">
				<RouterLink to="/">
					<FilmIcon/>
					<div class="link_text">Example movie</div>
				</RouterLink>
			</li>
			<li class="link">
				<RouterLink to="/">
					<FolderIcon/>
					<div class="link_text">Example folder</div>
				</RouterLink>
			</li>
			<li class="link">
				<RouterLink to="/">
					<FilmIcon/>
					<div class="link_text">Example movie</div>
				</RouterLink>
			</li>
			<li class="link">
				<RouterLink to="/">
					<FilmIcon/>
					<div class="link_text">Example movie</div>
				</RouterLink>
			</li>
			<li class="link">
				<RouterLink to="/">
					<FolderIcon/>
					<div class="link_text">Example folder</div>
				</RouterLink>
			</li>
			<li class="link">
				<RouterLink to="/">
					<FilmIcon/>
					<div class="link_text">Example movie</div>
				</RouterLink>
			</li>
			<li class="link">
				<RouterLink to="/">
					<FilmIcon/>
					<div class="link_text">Example movie</div>
				</RouterLink>
			</li>
			<li class="link">
				<RouterLink to="/">
					<FolderIcon/>
					<div class="link_text">Example folder</div>
				</RouterLink>
			</li>
			<li class="link">
				<RouterLink to="/">
					<FilmIcon/>
					<div class="link_text">Example movie</div>
				</RouterLink>
			</li>
			<li class="link">
				<RouterLink to="/">
					<FilmIcon/>
					<div class="link_text">Example movie</div>
				</RouterLink>
			</li>
			<li class="link">
				<RouterLink to="/">
					<FolderIcon/>
					<div class="link_text">Example folder</div>
				</RouterLink>
			</li>
			<li class="link">
				<RouterLink to="/">
					<FilmIcon/>
					<div class="link_text">Example movie</div>
				</RouterLink>
			</li>
			<li class="link">
				<RouterLink to="/">
					<FilmIcon/>
					<div class="link_text">Example movie</div>
				</RouterLink>
			</li>
		</ul>
		<ul>
			<li class="group">
				<ul>
					<li class="link" title="Get answers to various questions you may have">
						<a href="javascript:window.appWindow.openFAQ();">
							<QuestionIcon/>
							<div class="link_text">FAQ</div>
						</a>
					</li>
					<div class="divider"></div>
					<li class="link" title="Need help with Wrapper? Chat with our community on Discord!">
						<a href="javascript:window.appWindow.openDiscord();">
							<DiscordIcon/>
							<div class="link_text">Discord</div>
						</a>
					</li>
				</ul>
			</li>
			<li class="link" title="Configure Wrapper">
				<button @click="openSettings">
					<CogIcon/>
					<div class="link_text">Settings</div>
				</button>
			</li>
			<span id="wrapper_ver">{{ wrapperVer }}</span>
		</ul>
		<div
			class="dragger"
			:style="{ left:width - 3 + 'px' }"
			@mousedown="draggerDown"></div>
		<AppInfoModal v-if="displayAppInfo" @user-close="closeAppInfo"/>
		<SettingsModal v-if="displaySettings" @user-close="closeSettings"/>
		<input type="file" ref="char-input" accept=".xml" @input="charInput_input"/>
		<input type="file" ref="movie-input" accept=".zip" @input="movieInput_input"/>
	</div>
</template>

<style>
.app_sidebar {
	background: hsl(240deg 18% 26%);
	z-index: 8;
	user-select: none;
	display: flex;
	flex-direction: column;
	flex-shrink: 0;
}

/**
logo container
**/
.app_sidebar #logo_container {
	background: hsl(240deg 18% 13%);
	padding: 4px 8px;
	transform: translateX(0);
	height: 50px;
}
.app_sidebar #logo_container .logo_btn {
	border-radius: 3px;
	transition: 0.2s var(--button-anim);
	cursor: pointer;
	width: 100%;
	height: 100%;
}
.app_sidebar #logo_container .logo_btn:hover {
	transition: none;
	background: hsl(240deg 16% 18%);
}
.app_sidebar #logo_container #logo_icon {
	transition: 0.205s var(--slide-anim);
	pointer-events: none;
	position: absolute;
	left: calc(50% - calc(175px / 2));
	height: 41px;
}
.app_sidebar #logo_container #logo_wordmark {
	transition: 0.205s var(--slide-anim);
	pointer-events: none;
	position: absolute;
	left: calc(50% - calc(175px / 2));
	height: 41px;
}

/**
sidebar sections *OR* grouped link containers
**/
.app_sidebar ul {
	list-style: none;
	margin: 0 0;
	padding: 4px 8px;
}
/* sections */
.app_sidebar>ul.links {
	padding-right: 0;
	flex-grow: 1;
	overflow-y: scroll;
}
.app_sidebar>ul.links::-webkit-scrollbar {
	width: 13px;
}
.app_sidebar>ul.links::-webkit-scrollbar-thumb {
	background: hsl(240deg 10% 73% / 0.8);
	border-color: hsl(240deg 18% 26%);
	opacity: 0.9;
}
.app_sidebar>ul.links::-webkit-scrollbar-thumb:hover {
	background: hsl(240deg 10% 73%);
}
.app_sidebar>ul:last-of-type {
	border-top: 1px solid hsl(240 14% 32% / 1);
	margin-top: auto;
	margin-bottom: 0;
	padding-bottom: 8px;
}
/* grouped links (faq & discord) */
.app_sidebar .group>ul {
	display: flex;
	justify-content: space-between;
	padding: 0;
}
.app_sidebar .group>ul>.link {
	margin-bottom: 0;
	width: calc(50% - 2.5px);
}
.app_sidebar .group>ul>.divider {
	background: hsl(240 14% 32% / 1);
	margin: 7px 0 5px;
	width: 1px;
}

/* icons */
.app_sidebar i {
	margin-top: 0;
	margin-right: 7px;
}

/* headings */
.app_sidebar h3 {
	color: #918fa0;
	font-size: 15px;
	font-weight: normal;
	margin: 0px 0;
	padding: 0px 8px;
}

/* version string */
.app_sidebar #wrapper_ver {
	color: #909090;
	display: block;
	font-size: 13px;
	text-align: center;
}

/**
links
**/
.app_sidebar .link {
	border-radius: 4px;
	transition: 0.2s var(--button-anim);
	overflow: hidden;
	display: flex;
	margin: 3px 0;
	height: 35px;
}
.app_sidebar .link>a {
	color: #fff;
	text-decoration: none;
	-webkit-user-drag: none;
	display: flex;
	padding: 5px 6px;
	height: 100%;
	width: calc(100% - 14px);
}
.app_sidebar .link>button {
	background: #0000;
	border: none;
	color: #fff;
	cursor: pointer;
	display: flex;
	align-items: center;
	padding: 5px 6px;
	width: calc(100% - 14px);
}
/* remove ugly button styling */
.app_sidebar .link>button:focus {
	outline: none;
}
.app_sidebar .link .ico_svg {
	color: hsl(242 12% 85%);
	margin-right: 4px;
	height: 100%;
}
.app_sidebar .link::after {
	content: "";
	background: linear-gradient(90deg, #0000 0, hsl(240deg 18% 26%) 10px);
	width: 14px;
	height: 100%;
}
/* states */
.app_sidebar .link:hover {
	background: hsl(240 18% 29% / 1);
	transition: none;
}
.app_sidebar .link:hover::after {
	background: linear-gradient(90deg, #0000 0, hsl(240 18% 29% / 1) 10px);
}
.app_sidebar .link.sel {
	background: hsl(238deg 18% 36%);
}
.app_sidebar .link.sel::after {
	background: linear-gradient(90deg, #0000 0, hsl(238deg 18% 36%) 10px);
}


/**
create button
**/
.app_sidebar .link.create {
	background: hsl(344deg 97% 65%);
	border-bottom-color: #ac0633;
}
.app_sidebar .link.create>button,
.app_sidebar .link.create>button .ico_svg {
	color: #fff!important;
}
.app_sidebar .link.create::after {
	content: "";
	background: linear-gradient(90deg, #0000 0, hsl(344deg 97% 65%) 10px);
	width: 14px;
	height: 100%;
}


/* spacer */
.app_sidebar .spacer {
	margin-bottom: 7px;
}


/**
dragger
**/
.app_sidebar .dragger {
	cursor: col-resize;
	position: absolute;
	top: 50px;
	float: right;
	width: 6px;
	height: calc(100% - 50px);
}
.app_sidebar .dragger:hover {
	background: #489cf7a3;
	transition: 0.08s ease-in;
	transition-delay: 0.18s;
}

.app_sidebar input {
	display: none;
}

/***
dark mode recoloring
***/
html.dark .app_sidebar {
	background: hsl(250 10% 13% / 1);
}
html.dark .app_sidebar #logo_container {
	background: hsl(250 10% 9% / 1);
	border-color: hsl(250 10% 22% / 1);
}
html.dark .app_sidebar #logo_container .logo_btn:hover {
	background: #1b1924;
}
/* sections */
html.dark .app_sidebar>ul:first-of-type {
	border-color: hsl(250deg 14% 23%);
}
html.dark .app_sidebar>ul::-webkit-scrollbar {
	width: 13px;
}
html.dark .app_sidebar>ul::-webkit-scrollbar-thumb {
	background: hsl(250 10% 40% / 0.8);
	border-color: hsl(250 10% 13%);
}
html.dark .app_sidebar>ul::-webkit-scrollbar-thumb:hover {
	background: hsl(250 10% 40% / 1);
}
html.dark .app_sidebar>ul:last-of-type {
	border-color: hsl(250deg 14% 23%);
}
/* grouped links */
html.dark  .app_sidebar .group>ul>.divider {
	background: hsl(250deg 14% 23%);
	margin: 7px 0 5px;
	width: 1px;
}
/* links */
html.dark .app_sidebar .link>a,
html.dark .app_sidebar .link>button {
	color: #ddd;
}
html.dark .app_sidebar .link::after {
	background: linear-gradient(90deg, #0000 0, hsl(250 11% 13% / 1) 10px);
}
html.dark .app_sidebar .link:hover {
	background: hsl(250 10% 18% / 1);
}
html.dark .app_sidebar .link:hover::after {
	background: linear-gradient(90deg, #0000 0, hsl(250 10% 18% / 1) 10px);
}
html.dark .app_sidebar .link.sel {
	background: hsl(250 10% 23% / 1);
}
html.dark .app_sidebar .link.sel::after {
	background: linear-gradient(90deg, #0000 0, hsl(250 10% 23% / 1) 10px);
}
/* create button */
html.dark .app_sidebar .link.create {
	background: hsl(342deg 58% 54%);
	border-bottom-color: #732137;
}
html.dark .app_sidebar .link.create button,
html.dark .app_sidebar .link.create i {
	color: #eee;
}
html.dark .app_sidebar .link.create::after {
	background: linear-gradient(90deg, #0000 0, hsl(342deg 58% 54%) 10px);
}
html.dark .app_sidebar .user_custom .link>button:hover {
	background: #573344;
}
html.dark .app_sidebar #wrapper_ver {
	color: #bbb;
}

/**
width below 200px
**/
/* hide the logo wordmark */
.app_sidebar.logo_collapsed #logo_container {
	width: 62px;
}
.app_sidebar.logo_collapsed #logo_container #logo_icon {
	left: calc(50% - calc(41px / 2));
}
.app_sidebar.logo_collapsed #logo_container #logo_wordmark {
	opacity: 0;
}

/**
collapsed
**/
/* display groups vertically */
.app_sidebar.collapsed .group>ul {
	display: block;	
}
.app_sidebar.collapsed .group>ul>.link {
	width: 100%;
}
.app_sidebar.collapsed .link>a {
	padding: 5px 12.5px;
}
.app_sidebar.collapsed .link>button {
	padding: 8px 12.5px;
}
.app_sidebar.collapsed .link::after {
	content: none;
}
/* flip the collapse button and hide link text */
.app_sidebar.collapsed .link[data-toggle] i.ico::before {
	transform: scale(1);
}
.app_sidebar.collapsed .link_text {
	display: none;
}

/**
resize state
**/
.app_sidebar.resize {
	filter: brightness(0.95);
	transition: none;
}
.app_sidebar.resize #logo_container {
	transition: none;
}
.app_sidebar.resize .dragger {
	background: #5298d6;
}

</style>
