const crypto = require("crypto");

module.exports = {
    /**
	 * @summary generates a random id
	 * @returns {string}
	 */
    generateId() {
        return crypto.randomBytes(4).toString("hex");
    },

    /**
     * @summary returns an error xml
     * @param {number} code 
     * @param {string} msg 
     * @returns {string}
     */
    xmlError(code, msg) {
        return `1<error><code>${code}<code/><message>${msg}</message></error>`;
    }
};
