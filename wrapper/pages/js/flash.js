if ($("html").hasClass("dark")) {
	const oldAttr = $("#obj").attr("data");
	$("#obj").attr("data", oldAttr + "-dark");
}