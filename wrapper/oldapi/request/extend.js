module.exports = {
	/**
	 * Turns an error message into an LVM error.
	 * @param {string} msg 
	 * @returns {string}
	 */
	xmlFail(msg = "Something broke and got grounded.") {
		return `<error><code>ERR_ASSET_404</code><message>${msg}</message><text></text></error>`;
	},
};
