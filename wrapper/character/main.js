const xNumWidth = process.env.XML_NUM_WIDTH;
const baseUrl = process.env.CHAR_BASE_URL;
const folder = process.env.SAVED_FOLDER;
const header = process.env.XML_HEADER;
const fXml = process.env.FAILURE_XML;
const fUtil = require('../fileUtil');
const fw = process.env.FILE_WIDTH;
const get = require('../request/get');
const fs = require('fs');
const themes = {};
const StreamZip = require('node-stream-zip');

function addTheme(id, buffer) {
	const beg = buffer.indexOf(`theme_id="`) + 10;
	const end = buffer.indexOf(`"`, beg);
	const theme = buffer.subarray(beg, end).toString();
	return themes[id] = theme;
}

function save(id, data) {
	fs.writeFileSync(fUtil.getFileIndex('char-', '.xml', id), data);
	addTheme(id, data);
	return id;
}

fUtil.getValidFileIndicies('char-', '.xml').map(n => {
	return addTheme(`c-${n}`, fs.readFileSync(fUtil.getFileIndex('char-', '.xml', n)));
});

module.exports = {
	/**
	 * @param {string} id
	 * @returns {Promise<string>}
	 */
	getTheme(id) {
		return new Promise((res, rej) => {
			if (themes[id]) res(themes[id]);
			this.load(id).then(b => res(addTheme(id, b))).catch(rej);
		});
	},
	/**
	 * @param {string} id
	 * @returns {Promise<Buffer>}
	 */
	load(id) {
		return new Promise((res, rej) => {
			const i = id.indexOf('-');
			const prefix = id.substr(0, i);
			const suffix = id.substr(i + 1);

			switch (prefix) {
				case 'c':
					fs.readFile(fUtil.getFileIndex('char-', '.xml', suffix),
						(e, b) => e ? rej(Buffer.from(fXml)) : res(b));
					break;

				case 'C':
					fs.readFile(fUtil.getFileString('char-', '.xml', suffix),
						(e, b) => e ? rej(Buffer.from(fXml)) : res(b));
					break;

				case 'a':
				case '': // Blank prefix is left for compatibility purposes.
				{
					const nId = Number.parseInt(suffix);
					const xmlSubId = nId % fw, fileId = nId - xmlSubId;
					const lnNum = fUtil.padZero(xmlSubId, xNumWidth);
					const idPad0 = fUtil.padZero(fileId);
					const url = `${baseUrl}/${idPad0}.txt`;
					//check if txt exists
					if (fs.existsSync(`../server/characters/${idPad0}.txt`)) {
						get(url).then(b => {
							var line = b.toString('utf8').split('\n').find(v => v.substr(0, xNumWidth) == lnNum);
							line ? res(Buffer.from(line.substr(xNumWidth))) : rej(Buffer.from(fXml));
						}).catch(e => rej(Buffer.from(fXml)));
					} else if (fs.existsSync(`../server/characters/${idPad0}.zip`)) {
						const charZip = new StreamZip({
							file: `../server/characters/${idPad0}.zip`,
							storeEntries: true
						});
						function unzipChar() {
							return promise = new Promise((resolve, reject) => {
								charZip.on('ready', () => {
									charZip.extract(null, '../server/characters/', (err) => {
											console.log(err ? 'Unzipping error...' && reject() : 'Character unzipped.');
											charZip.close();
											resolve()
									});
								});
							});
						}
						async function retryChar() {
							await unzipChar()
							get(url).then(b => {
								var line = b.toString('utf8').split('\n').find(v => v.substr(0, xNumWidth) == lnNum);
								line ? res(Buffer.from(line.substr(xNumWidth))) : rej(Buffer.from(fXml));
							}).catch(e => rej(Buffer.from(fXml)));
						}
						
						retryChar()
					} else {rej()}
				}
			}
		});
	},
	/** 
	 * @param {Buffer} data
	 * @param {string} id
	 * @returns {Promise<string>}
	 */
	save(data, id) {
		return new Promise((res, rej) => {
			if (id) {
				const i = id.indexOf('-');
				const prefix = id.substr(0, i);
				const suffix = id.substr(i + 1);
				switch (prefix) {
					case 'c':
						return fs.writeFile(fUtil.getFileIndex('char-', '.xml', suffix), data, e => e ? rej() : res(id));
					case 'C':
						return fs.writeFile(fUtil.getFileString('char-', '.xml', suffix), data, e => e ? rej() : res(id));
					default:
						return res(save(id, data));
				}
			}
			else {
				saveId = fUtil.getNextFileId('char-', '.xml');
				res(save(saveId, data));
			};
		});
	},
}