<script setup lang="ts">
const emit = defineEmits<{
	downloadClick: [],
	newFolderClick: []
	saveClick: [],
}>();
defineProps<{
	/** specify supported features to show */
	supported?: {
		/**	displays a download button */
		download?: boolean,
		/** displays a new folder icon */
		newFolder?: boolean,
		/** display a save button */
		save?: boolean,
		/** display a search box */
		search?: boolean,
		/** display a zoom slider */
		zoom?: boolean,
	}
}>();

</script>

<template>
	<header>
		<div class="head_left">
			<slot name="left"></slot>
		</div>
		<div class="head_right">
			<slot name="right"></slot>
		</div>
	</header>
</template>

<style lang="css">
header {
	background: hsl(250 16% 87% / 1);
	border-radius: 10px 0 0;
	display: flex;
	flex-shrink: 0;
	justify-content: space-between;
	padding: 6.5px 8px;
	height: 50px;
}
header>div {
	display: flex;
	align-items: center;
	height: 100%;
}
/* navigation buttons */
header .nav_btn {
	color: hsl(211 4% 32% / 1);
	border-radius: 5px;
	transition: 0.2s var(--button-anim);
	font-size: 16px;
	margin: 0 3px 0 3px;
	padding: 2px 8px;
}
header .nav_btn i {
	transform: translateY(1px);
}
header .nav_btn:hover {
	background: hsl(211 60% 76% / .75);
	color: hsl(220 30% 25% / 1);
	transition: none;
	cursor: pointer;
}

/**
address
**/
header .link_container {
	margin-left: 2px;
	overflow: hidden;
	white-space: nowrap;
}
header .link_container .link {
	color: #454257;
	border-radius: 3px;
	transition: background 0.2s var(--button-anim);
	padding: 4px 8px;
	height: 100%;
}
header .link_container .link:hover {
	background: hsl(338deg 37% 83%);
	transition: none;
}
/* previous links */
header .link_container .parent_link {
	text-decoration: none;
	margin: 0 20px 0 0;
}
header .link_container .parent_link .caret {
	opacity: 0.6;
	pointer-events: none;
	font-size: 12px;
	position: relative;
	display: inline;
	margin-left: -16px;
	left: 24px;
}
/* current link */
header .link_container .final_link {
	user-select: none;
	font-weight: bold;
}

/**
search bar
**/
header .btn {
	margin: 0;
}
header .search_box {
	background: hsl(255 13% 90% / 1);
	border: 1px solid hsl(255 12% 73% / 1);
	border-radius: 3px;
	transition: 0.2s var(--button-anim);
	padding: 5px 6px;
}
header .search_box:focus {
	background: hsl(255 13% 91% / 1);
	border-color: #5589d8;
	outline: none;
}

/**
dark mode
**/
html.dark header {
	background: hsl(250 9% 13% / 1);
}
html.dark header .nav_btn {
	color: hsl(0deg 0% 82%);
}
html.dark header .nav_btn:hover {
	background: hsl(211 50% 30% / .75);
	color: hsl(207, 35%, 88%);
}
html.dark header .link_container .link {
	color: hsl(0deg 0% 85%);
}
html.dark header .link_container .link:hover {
	background: hsl(328 21% 21% / 1);
}
html.dark header .search_box {
	background: hsl(250 9% 16% / 1);
	border-color: hsl(250 9% 24% / 1);
	color: hsl(0deg 0% 82%);
}
html.dark header .search_box:focus {
	border-color: #5589d8;
}

</style>
