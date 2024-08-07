const Page = {
	appName: "Wrapper: Offline",
	sidebarLinks: [
		{
			location: "/videos",
			name: "Videos",
			icon: "film",
			default: true
		},
		{
			location: "/starters",
			name: "Starters",
			icon: "briefcase"
		},
		{
			location: "/videos",
			name: "Characters",
			icon: "person"
		}
	],

	init() {
		if (localStorage.getItem("DARK_MODE") == "true") {
			Page.toggleDarkMode();
		}
		Page.initEvents();
		Sidebar.instance;
		Page.runAfter();
	},

	initEvents: () => {
		window.addEventListener("popstate", (e) => switchTo(window.location.pathname));
		$(".tab_navigation .tab").on("click", (event) => {
			const clicked = $(event.target);
			const num = clicked.attr("data-triggers");
			if (num) {
				// get siblings
				const buttons = clicked.siblings("a");
				const pages = clicked.parent().siblings();
				// toggle button
				buttons.removeClass("selected");
				clicked.addClass("selected");
				// hide other pages and show current one
				pages.hide()
				$(pages[num]).show();
			}
		});
	},

	toggleDarkMode: () => {
		const html = document.documentElement;
		html.classList.toggle("dark");
	},

	setTitle: (title) => {
		document.title = title + " - " + Page.appName;
	},

	/**
	 * Called whenever a sidebar link is clicked
	 * @param {string} loc
	 */
	switchTo: (loc) => {
		const main = document.getElementById("wo_page");
		main.innerHTML = "<marquee>Loading...</marquee>";
		this.runAfter = null;

		const links = document.getElementsByClassName("sidebar_link");
		for (const link of links) {
			if (link.classList.contains("sel")) {
				link.classList.remove("sel");
			}
			if (link.href == window.location.href) {
				link.classList.add("sel");
			}
		}

		$.get(loc)
			.done((data) => {
				main.innerHTML = data;
				const scripts = main.getElementsByTagName("script");
				for (let i = 0; i < scripts.length; i++) {
					const script = scripts[i];
					const clone = document.createElement("script");
					if (script.src)
						clone.src = script.src;
					clone.innerHTML = script.innerHTML;
					script.parentElement.replaceChild(clone, script);
				}
				Page.runAfter();
				Page.initEvents();
			})
			.fail((data) => {
				main.innerText = "An error has occured trying to load this page.";
			});
	},

	/**
	 * Contains page-specific functions and is replaced whenever
	 * a new page is loaded.
	 */
	runAfter: () => null
};

class Sidebar {
	constructor() {
		this.elem = document.getElementById("wo_sidebar");
		this.sectionPop = document.getElementById("sidebar_populate");	
		this.addLinks();
		this.listenEvents();
	}

	static get instance() {
		if (typeof this._instance == "undefined")
			this._instance = new Sidebar();
		return this._instance;
	}

	/**
	 * Adds link elements to the populate section of the sidebar.
	 */
	addLinks() {
		for (const link of Page.sidebarLinks) {
			const elem = this.createLinkElement(link);
			this.sectionPop.appendChild(elem);
		}
	}

	/**
	 * Adds event listeners for all link elements that require them.
	 */
	listenEvents() {
		const links = document.getElementsByClassName("sidebar_link");
		for (const link of links) {
			if (link.getAttribute("data-ignore") !== null) {
				continue;
			}
			if (link.getAttribute("data-toggle") !== null) {
				link.addEventListener("click", () => this.onMenuClick());
				continue;
			}
			link.addEventListener("click", this.onLinkClick);
		}
	}

	/**
	 * Creates an element from a link object.
	 * @param {object} link 
	 * @returns {HTMLAnchorElement}
	 */
	createLinkElement(link) {
		const elem = document.createElement("a");
		elem.classList.add("sidebar_link");
		elem.href = link.location;
		const icon = document.createElement("i");
		icon.classList.add("ico", link.icon);
		elem.appendChild(icon);
		const text = document.createElement("div");
		text.classList.add("sb_link_text");
		text.innerText = link.name;
		elem.appendChild(text);
		return elem;
	}

	/**
	 * Called whenever a sidebar link is clicked.
	 * @param {Event} e 
	 * @param {string} loc
	 */
	onLinkClick(e) {
		e.preventDefault();
		e.stopPropagation();
		history.pushState({}, "", e.currentTarget.href);
		Page.switchTo(e.currentTarget.href);
	}

	/**
	 * Called whenever the collapse button is clicked. 
	 */
	onMenuClick() {
		this.elem.classList.toggle("collapsed");
	}
}

window.addEventListener("load", Page.init);

/*
check for updates
*/
function checkForUpdates() {
	$.get("/api/settings/get_updates")
		.done((res) => {
			if (res.updates_available) {
				const go = confirm("Updates are available! Would you like to visit the release page?");
				if (go) {
					window.open("https://github.com/Wrapper-Offline/Wrapper-Offline/releases/tag/" + res.tag_name);
				}
			} else {
				alert("No updates available. Check again later.");
			}
		})
		.fail(() => alert("Error getting updates. Try again later."));
}
