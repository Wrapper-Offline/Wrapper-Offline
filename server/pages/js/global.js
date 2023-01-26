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
	$(".tab_buttons a").on("click", (event) => {
		const clicked = $(event.target);
		const num = clicked.attr("data-triggers");
		// get siblings
		const buttons = clicked.siblings("a");
		const pages = clicked.parent().siblings();
		// toggle button
		buttons.removeClass("selected");
		clicked.addClass("selected");
		// hide other pages and show current one
		pages.hide()
		$(pages[num]).show();
	});
});


/*
movie uploading
*/
$("#file").on("change", (event) => {
	event.preventDefault();
	const file = event.target.files[0];
	/** @type {Element} */
	const isStarter = event.target.nextElementSibling.checked;
	if (file.type !== "application/x-zip-compressed") {
		alert("Bastard");
		return;
	}

	let b = new FormData();
	b.append("import", file);
	b.append("is_starter", isStarter);
	$.ajax({
		url: "/api/movie/upload",
		method: "POST",
		data: b,
		processData: false,
		contentType: false,
		dataType: "json"
	})
		.done((res) => window.location.href = "/go_full?movieId=" + res.id)
		.fail(() => {
			alert("Movie upload failed. See the console for more details.");
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
