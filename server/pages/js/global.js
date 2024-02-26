/*
set dark mode
*/
if (localStorage.getItem("DARK_MODE") == "true") {
	toggleDarkMode();
}

function toggleDarkMode() {
	if ($("html").hasClass("dark")) {
		$("html").removeClass("dark");
	} else {
		$("html").addClass("dark");
	}
}


/*
tabs
*/
window.addEventListener("load", () => {
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
