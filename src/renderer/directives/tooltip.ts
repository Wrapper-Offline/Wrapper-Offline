import { type Directive } from "vue";

let map = new Map();

const tooltip:Directive = {
	mounted: (el:HTMLElement, binding) => {
		let mouseoverstill = false;
		let ttelem:HTMLDivElement;
		map.set(el, [
			() => {
				mouseoverstill = true;
				setTimeout(() => {
					if (!mouseoverstill || ttelem) {
						return;
					}
					ttelem = document.createElement("div");
					ttelem.classList.add("tooltip");
					ttelem.innerText = binding.value;
					el.appendChild(ttelem);
					const { right, bottom, left } = el.getBoundingClientRect();
					const mp = (left + right) / 2;
					ttelem.style.left = mp - (ttelem.clientWidth / 2) + "px";
					ttelem.style.top = bottom + 4 + "px";
				}, 200);
			},
			() => {
				mouseoverstill = false;
				if (ttelem) {
					ttelem.remove();
					ttelem = null;
				}
			}
		]);
		el.addEventListener("mouseenter", map.get(el)[0]);
		el.addEventListener("mouseleave", map.get(el)[1]);
	},
	unmounted: (el) => {
		el.removeEventListener("mouseenter", map.get(el)[0]);
		el.removeEventListener("mouseleave", map.get(el)[1]);
	}
};

export default tooltip;
