<script setup lang="ts">
const emit = defineEmits<{
	clickOutside: []
}>();
const { class: classList, show = true } = defineProps<{
	class?: string,
	show?: boolean
}>();

</script>

<template>
	<div>
		<Teleport to="body">
			<div
				class="modal_container"
				:class="classList"
				v-show="typeof show != undefined ? show !== false : true"
				@click.self="emit('clickOutside')">
				<div class="modal">
					<div class="modal_head">
						<div class="head_left"><slot name="head-left"></slot></div>
						<div class="head_center">
							<span v-if="$slots.subheading" class="small"><slot name=subheading></slot></span>
							<span v-if="$slots.heading" class="main"><slot name="heading"></slot></span>
						</div>
						<div class="head_right"><slot name="head-right"></slot></div>
					</div>
					<div class="contents"><slot></slot></div>
					<div class="modal_foot">
						<slot name="foot"></slot>
					</div>
				</div>
			</div>
		</Teleport>
	</div>
</template>

<style lang="css">
.modal_container {
	background: hsl(245 6% 3% / 0.62);
	backdrop-filter: blur(1px);
	animation: 0.1s modal_container_fade forwards ease-out;
	z-index: 9;
	display: flex;
	position: absolute;
	top: 0;
	left: 0;
	width: 100%;
	height: 100%;
}

.modal {
	border-radius: 3px;
	box-shadow: 0 2px 5px #0004;
	animation: 0.2s modal_expand forwards cubic-bezier(0, 1.1, 0.4, 0.96);
	overflow: hidden;
	display: flex;
	flex-direction: column;
	margin: auto;
	height: auto;
	max-height: calc(100% - 50px);
}
.modal .modal_head {
	background: #dbd9e4;
	user-select: none;
	font-size: 20px;
	font-weight: 700;
	display: flex;
	margin: 0;
	padding: 6px 25px;
	height: 49px;
}
.modal .modal_head .btn {
	margin-top: 0;
	margin-bottom: 0;
}

.modal .modal_head .head_left {
	opacity: 0.7;
	font-size: 13px;
	flex: 1;
    align-self: center;
}
.modal .modal_head .head_center {
	text-align: center;
}
.modal .modal_head .head_center .small {
	color: #84899a;
	font-size: 10px;
	display: block;
    line-height: 0;
    margin-top: 6px;
}
.modal .modal_head .head_center .main {
	font-size: 17px;
}
.modal .modal_head .head_right {
	text-align: right;
	flex: 1;
}

.modal .modal_head small {
	color: #bbb;
}

.modal .close_btn {
	background: #0000;
	border: none;
	color: #fff;
	cursor: pointer;
	font-size: 30px;
	position: absolute;
	top: 20px;
	right: 30px;
}
.modal .close_btn:focus {
	outline: none;
}

.modal .contents {
	background: hsl(252deg 16% 94%);
	overflow: auto;
	padding: 15px 25px;
}

.modal .modal_foot {
	background: #dbd9e4;
	display: flex;
	justify-content: flex-end;
	padding: 2px 20px;
	max-height: 56px;
}

html.dark .modal .modal_head,
html.dark .modal .modal_foot {
	background: hsl(250deg 11% 14%);
}
html.dark .modal .contents {
	background: hsl(250deg 11% 17%);
}


/**
modal animations
**/
@keyframes modal_container_fade {
	0% {
		opacity: 0.5;
	}
	100% {
		opacity: 1;
	}
}
@keyframes modal_expand {
	0% {
		opacity: 0.5;
		transform: scaleY(0.25);
	}
	100% {
		opacity: 1;
		transform: none;
	}
}

</style>
