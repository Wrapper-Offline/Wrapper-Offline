
/***
 * movie parsing
 * if you don't know what's going on here, look at the lvm's code
 * ffdec does a great job with that
 */
const themeFolder = process.env.THEME_FOLDER;
const char = require('../character/main');
const source = process.env.CLIENT_URL;
const header = process.env.XML_HEADER;
const get = require('../request/get');
const fUtil = require('../fileUtil');
const nodezip = require('node-zip');
const store = process.env.STORE_URL;
const xmldoc = require('xmldoc');
const fs = require('fs');
const asset = require('../asset/main');

function name2Font(font) {
	switch (font) {
		case "Blambot Casual":
			return "FontFileCasual";
		case "BadaBoom BB":
			return "FontFileBoom";
		case "Entrails BB":
			return "FontFileEntrails";
		case "Tokyo Robot Intl BB":
			return "FontFileTokyo";
		case "Accidental Presidency":
			return "FontFileAccidental";
		case "Budmo Jiggler":
			return "FontFileBJiggler";
		case "Budmo Jigglish":
			return "FontFileBJigglish";
		case "Existence Light":
			return "FontFileExistence";
		case "HeartlandRegular":
			return "FontFileHeartland";
		case "Honey Script":
			return "FontFileHoney";
		case "I hate Comic Sans":
			return "FontFileIHate";
		case "loco tv":
			return "FontFileLocotv";
		case "Mail Ray Stuff":
			return "FontFileMailRay";
		case "Mia\'s Scribblings ~":
			return "FontFileMia";
		case "Coming Soon":
			return "FontFileCSoon";
		case "Lilita One":
			return "FontFileLOne";
		case "Telex Regular":
			return "FontFileTelex";
		case '':
		case null:
			return '';
		default:
			return `FontFile${font.replace(/\s/g, '')}`;
	}
}

function meta2Xml(v) {
	var response;
	switch (v.type) {
		case "char": {
			response = `<char id="${v.id}" enc_asset_id="${v.id}" name="Untitled" cc_theme_id="${v.themeId}" thumbnail_url="char_default.png" copyable="Y"><tags/></char>`;
			break;
		}
		case "bg": {
			response = `<background subtype="0" id="${v.id}" enc_asset_id="${v.id}" name="${v.title}" enable="Y" asset_url="/assets/${v.id}"/>`
			break;
		}
		case "movie": {
			response = `<movie id="${v.id}" enc_asset_id="${v.id}" path="/_SAVED/${v.id}" numScene="1" title="${v.name}" thumbnail_url="/assets/${v.id}.png"><tags></tags></movie>`;
			break;
		}
		case "prop": {
			if (v.subtype == "video") {
				response = `<prop subtype="video" id="${v.id}" enc_asset_id="${v.id}" name="${v.title}" enable="Y" holdable="0" headable="0" placeable="1" facing="left" width="0" height="0" asset_url="/api_v2/assets/${v.file}"/>`;
			} else {
				response = `<prop subtype="0" id="${v.id}" enc_asset_id="${v.id}" name="${v.title}" enable="Y" holdable="0" headable="0" placeable="1" facing="left" width="0" height="0" asset_url="/api_v2/assets/${v.file}"/>`;
			}
			break;
		}
		case "sound": {
			response = `<sound subtype="${v.subtype}" id="${v.id}" enc_asset_id="${v.id}" name="${v.title}" enable="Y" duration="${v.duration}" downloadtype="progressive"/>`;
			break;
		}
	};
	return response;
}

module.exports = {
	xml2caché(buffer) {
		const xml = new xmldoc.XmlDocument(buffer);
		const cachéRef = {}, elements = xml.children;
		for (const eK in elements) {
			var element = elements[eK];
			if (element.name == 'asset')
				cachéRef[element.attr.id] =
					Buffer.from(element.val, 'base64');
		}
		return cachéRef;
	},
	/**
	 * 
	 * @param {Buffer} xmlBuffer 
	 * @param {string} mId
	 * @returns {Promise<Buffer>}
	 */
	async packXml(xmlBuffer) {
		if (xmlBuffer.length == 0) throw null;

		const zip = nodezip.create();
		const themes = { common: true };
		var ugc = `${header}<theme id="ugc" name="ugc">`;
		fUtil.addToZip(zip, 'movie.xml', xmlBuffer);

		// begin parsing the movie xml
		const film = new xmldoc.XmlDocument(xmlBuffer);
		for (const eI in film.children) {
			var elem = film.children[eI];

			switch (elem.name) {
				case 'sound': {
					const val = elem.childNamed('sfile').val;

					var pieces = val.split(".");
					if (val.endsWith('.swf')) {
						const pieces = val.split('.');
						const theme = pieces[0], name = pieces[1];
						const url = `${store}/${theme}/sound/${name}.swf`;
						const fileName = `${theme}.sound.${name}.swf`;
						const buffer = await get(url);
						fUtil.addToZip(zip, fileName, buffer);
					}
					else if (val.startsWith('ugc.')) {
						var ext = pieces.pop();
						pieces.splice(1, 0, elem.name)
						pieces[pieces.length - 1] += `.${ext}`;

						var fileName = pieces.join(".");
						console.log(pieces);
						if (!zip[fileName]) {
							var buff = asset.load(pieces[2]);
							var meta = asset.meta(pieces[2]);
							fUtil.addToZip(zip, fileName, buff);
							ugc += meta2Xml(meta);
							themes[pieces[0]] = true;
						}
					}
					break;
				}

				case "scene": {
					for (var e2I in elem.children) {
						var elem2 = elem.children[e2I];

						var tag = elem2.name;
						// change the tag to the one in the store folder
						if (tag == "effectAsset") tag = "effect";

						switch (tag) {
							case "durationSetting":
							case "trans":
								break;
							case "bg":
							case "effect":
							case "prop": {
								var file = elem2.childNamed("file");
								if (!file) continue;
								var val = file.val;
								// fix the file name for the lvm
								var pieces = val.split(".");
								var ext = pieces.pop();
								pieces.splice(1, 0, tag);
								pieces[pieces.length - 1] += `.${ext}`;

								if (pieces[0] == "ugc") {
									try {
										console.log(pieces)
										var fileName = pieces.join(".");
										console.log(fileName)
										if (!zip[fileName]) {
											var buff = asset.load(pieces[2]);
											var meta = asset.meta(pieces[2]);
											fUtil.addToZip(zip, fileName, buff);
											ugc += meta2Xml(meta);
											themes[pieces[0]] = true;
										}
									} catch (err) {
										if (process.env.NODE_ENV == "dev") throw err;
										console.error("Error getting asset: " + err);
									}
								} else {
									// add extension to filename

									var fileName = pieces.join(".");
									console.log(fileName)
									if (!zip[fileName]) {
										var buff = await get(`${store}/${pieces.join("/")}`);
										fUtil.addToZip(zip, fileName, buff);
										themes[pieces[0]] = true;
									}
								}
								break;
							}
							case "char": {
								console.log("char pasre");
								const file = elem2.childNamed("action")?.val;
								if (!file) throw new Error("Invalid movie XML.");
								const pieces = file.split(".");
								const themeId = pieces[0];
								const id = pieces[1];
		
								// fix the file name
								// remove the action part (if it's a custom char)
								if (themeId == "ugc") pieces.splice(2, 1);
								// add the extension to the last key
								const ext = pieces.pop();
								pieces[pieces.length - 1] += "." + ext;
								pieces.splice(1, 0, elem2.name);
		
								switch (themeId) {
									case "ugc": {
										const filename = pieces.join(".");
										const buffer = await char.load(id);
		
										// add character meta
										// i can't just select the character data because of stock chars
										ugc += meta2Xml({
											id: id,
											type: "char",
											themeId: char.getTheme(buffer)
										});
										// and add the character file
										fUtil.addToZip(zip, filename, buffer);
										break;
									}
									default: {
										const filename = pieces.join(".");
		
										
										// and add the character file
										fUtil.addToZip(zip, filename, char.load(id));
										break;
									}
								}
								break;
							}
							case 'bubbleAsset': {
								const bubble = elem2.childNamed('bubble');
								const text = bubble.childNamed('text');
								const font = `${name2Font(text.attr.font)}.swf`;
								const fontSrc = `${source}/go/font/${font}`;
								fUtil.addToZip(zip, font, await get(fontSrc));
								break;
							}
						}
					}
					break;
				}
			}
		}

		if (themes.family) {
			delete themes.family;
			themes.custom = true;
		}

		if (themes.cc2) {
			delete themes.cc2;
			themes.action = true;
		}

		const themeKs = Object.keys(themes);
		themeKs.forEach(t => {
			if (t == 'ugc') return;
			const file = fs.readFileSync(`${themeFolder}/${t}.xml`);
			fUtil.addToZip(zip, `${t}.xml`, file);
		});

		fUtil.addToZip(zip, 'themelist.xml', Buffer.from(`${header}<themes>${
			themeKs.map(t => `<theme>${t}</theme>`).join('')}</themes>`));
		fUtil.addToZip(zip, 'ugc.xml', Buffer.from(ugc + `</theme>`));
		fs.writeFileSync("die.zip", await zip.zip());
		return await zip.zip();
	},
	/**
	 * 
	 * @param {{[aId:string]:Buffer}} buffers
	 * @param {Buffer} thumb
	 * @param {string} movieId
	 * @returns {Promise<Buffer>}
	 */
	async unpackZip(zip, thumb = null, movieId) {
		return new Promise(res => {

			const pieces = [];
			const stream = zip['movie.xml'].toReadStream();
			stream.on('data', b => pieces.push(b));
			stream.on('end', async () => {
				const time = new Date() - 0;
				const main = Buffer.concat(pieces).slice(0, -7);
				const xmlBuffers = [], assetHash = {};
				const charMap = {}, charBuffers = {};
				for (let c = 0, end; ; c = main.indexOf('ugc.', c) + 4) {

					if (c == 0) continue; else if (c == 3) {
						xmlBuffers.push(main.subarray(end));
						break;
					}

					xmlBuffers.push(main.subarray(end, c));
					const assetId = main.subarray(c, end =
						main.indexOf('<', c + 1)).toString();
					const index = assetId.indexOf('-');
					const prefix = assetId.substr(0, index);
					switch (prefix) {
						case 'c':
						case 'C': {
							const dot = assetId.indexOf('.');
							const charId = assetId.substr(0, dot);
							const saveId = charMap[charId] =
								charMap[charId] || `C-${c}-${time}`;
							const remainder = assetId.substr(dot);
							xmlBuffers.push(Buffer.from(saveId + remainder));
							try {
								charBuffers[saveId] = await char.load(charId);
							} catch (e) { };
							break;
						}
						default: {
							xmlBuffers.push(Buffer.from(assetId));
							assetHash[assetId] = true;
						}
					}
				}

				for (const id in charBuffers) {
					const buff = charBuffers[id];
					var start = header.length + 9;;
					if (buff.includes('file_name'))
						start = buff.indexOf('.xml', start) + 6;
					const element = buff.subarray(start);
					xmlBuffers.push(Buffer.from(`<cc_char file_name='ugc.char.${id}.xml' ${element}`));
				}

				if (thumb) {
					const thumbString = thumb.toString('base64');
					xmlBuffers.push(Buffer.from(`<thumb>${thumbString}</thumb>`));
				}

				xmlBuffers.push(Buffer.from(`</film>`));
				res(Buffer.concat(xmlBuffers));
			});
		});
	},
	/**
	 * 
	 * @param {Buffer} xml 
	 * @param {number} id 
	 */
	async unpackXml(xml, id) {
		const beg = xml.lastIndexOf('<thumb>');
		const end = xml.lastIndexOf('</thumb>');
		if (beg > -1 && end > -1) {
			const sub = Buffer.from(xml.subarray(beg + 7, end).toString(), 'base64');
			fs.writeFileSync(fUtil.getFileIndex('thumb-', '.png', id), sub);
		}
		fs.writeFileSync(fUtil.getFileIndex('movie-', '.xml', id), xml);
	},
	async unpackCharXml(xml, id) {
		fs.writeFileSync(fUtil.getFileIndex('char-', '.xml', id), xml);
	},
}
