/*
set dark mode
*/
if (localStorage.getItem("DARK_MODE") == "true") {
	toggleDarkMode();
}

function toggleDarkMode() {
	const html = document.documentElement;
	if (html.classList.contains("dark")) {
		html.classList.remove("dark");
		return;
	}
	html.classList.add("dark");
}

/**
 * Called whenever a sidebar link is clicked
 * @param {Event} e 
 */
function toggleSidebar(e) {
	const sidebar = document.getElementById("wo_sidebar");
	sidebar.classList.toggle("collapsed")
}

/**
 * Called whenever a sidebar link is clicked
 * @param {Event} e 
 * @param {string} loc
 */
function onPageSwitch(e, loc) {
	const eExists = e != null && typeof e != "undefined";
	eExists && e.preventDefault();
	eExists && e.stopPropagation();
	eExists && (loc = e.currentTarget.href);

	const main = document.getElementById("wo_page");
	main.innerHTML = "<marquee>Loading...</marquee>";
	Page = null;

	const links = document.getElementsByClassName("sidebar_link");
	for (let i = 0; i < links.length; i++) {
		const link = links[i];
		if (link.classList.contains("sel")) {
			link.classList.remove("sel");
		}
	}
	eExists && e.currentTarget.classList.add("sel");

	eExists && history.pushState({}, "", loc);
	$.get(loc)
		.done((data) => {
			main.innerHTML = data;
			const scripts = main.getElementsByTagName("script");
			for (let i = 0; i < scripts.length; i++) {
				const script = scripts[i];
				const clone = document.createElement("script");
				if (script.src) clone.src = script.src;
				clone.innerHTML = script.innerHTML;
				script.parentElement.replaceChild(clone, script);
			}
			Page();
			initEvents();
		})
		.fail((data) => {
			main.innerText = "An error has occured trying to load this page.";
		});
}

window.addEventListener("popstate", (e) => onPageSwitch(null, window.location.href));

function initEvents() {
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
}

/*
tabs
*/
window.addEventListener("load", () => {
	Page();
	initEvents();
	const links = document.getElementsByClassName("sidebar_link");
	for (let i = 0; i < links.length; i++) {
		const link = links[i];
		console.log(link, i, links, links.length)
		if (link.getAttribute("data-ignore") !== null) {
			continue;
		}
		if (link.getAttribute("data-toggle") !== null) {
			link.addEventListener("click", toggleSidebar);
			continue;
		}
		link.addEventListener("click", onPageSwitch);
	}
});

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
