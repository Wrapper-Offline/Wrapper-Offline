const chars = require('../character/main');
const caché = require('../data/caché');
const fUtil = require('../fileUtil');
const info = require('./info');
const fs = require('fs');

function getFilter(prefix, idPrefix, types) {
	const typeSet = {}, files = [], ret = [];
	types.forEach(v => {
		const names = fUtil.getValidFileNames(prefix, `.${v}`);
		typeSet[v] = true, files.concat(names);
	});
	for (let c = 0; c < files.length; c++) {
		const path = files[c];
		const dot = path.lastIndexOf('.');
		const dash = path.lastIndexOf('-');
		const num = Number.parseInt(path.substr(dash + 1, dot));
		const ext = path.substr(dot + 1), id = `${idPrefix}-${num}.${ext}`;
		ret.push({ id: id, path: path, ext: ext, });
	}
	return ret;
}

module.exports = {
	loadGlobal(aId) {
		const dot = aId.indexOf('.');
		const dash = aId.indexOf('-');
		const prefix = aId.substr(0, dash);
		const num = aId.substr(dash + 1, dot);
		const suffix = aId.substr(dot);
		const path = fUtil.getFileIndex(prefix, suffix, num);
		return fs.readFileSync(path);
	},
	loadLocal(mId, aId) { return caché.load(mId, aId); },
	saveLocal(buffer, mId, suff) { return caché.saveNew(buffer, mId, suff); },
	getBackgrounds() { return getFilter('bg-', 'b', info.bg.filetypes); },
	getProps() { return getFilter('prop-', 'p', info.prop.filetypes); },
	getSounds() { return getFilter('sound-', 's', info.sound.filetypes); },
	async chars(theme) {
		switch (theme) {
			case 'custom':
				theme = 'family';
				break;
			case 'action':
			case 'animal':
			case 'space':
			case 'vietnam':
				theme = 'cc2';
				break;
		}

		const table = [];
		const ids = fUtil.getValidFileIndicies('char-', '.xml');
		for (let c = 0; c < ids.length; c++) {
			const v = ids[c];
			const id = `c-${v}`;
			if (theme == await chars.getTheme(id))
				table.unshift({ theme: theme, id: id, });
		}
		return table;
	},
};