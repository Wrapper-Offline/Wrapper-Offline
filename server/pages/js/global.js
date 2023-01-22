/***
 * this file has the general page stuff
 */

/**
 * set dark mode
 */
if (localStorage.getItem("DARK_MODE") == "true") {
	toggleDarkMode();
}

function toggleDarkMode() {
	if ($("html").hasClass("dark")) 
		$("html").removeClass("dark");
	else
		$("html").addClass("dark");
}


/**
 * tabs
 */
window.addEventListener('load', event => {
	$(".tab_buttons a").on("click", event => {
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
})