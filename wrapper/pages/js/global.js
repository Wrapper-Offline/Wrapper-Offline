/***
 * this file has the general page stuff
 */

/**
 * set dark mode
 */
if (localStorage.getItem("darkmode")) {
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
		// get parent/siblings
		const tabPanel = clicked.parents(".tabs_contain");
		console.log(tabPanel);
		const buttons = tabPanel.find(".tab_buttons").children("a");
		const navs = tabPanel.children("nav");
		// get clicked
		const trig = clicked.attr("data-triggers");
		const triggered = tabPanel.find(`[data-trigger=${trig}]`);
		// toggle button
		buttons.removeClass("selected");
		clicked.addClass("selected");
		// show nav
		navs.hide();
		triggered.show();
	});
})