
/**
 * movie parsing
 * if you don't know what's going on here, look at the lvm's code
 * ffdec does a great job with that
 */
// modules
const fs = require("fs");
const nodezip = require("node-zip");
const path = require("path");
const xmldoc = require("xmldoc");
// vars
const themeFolder = process.env.THEME_FOLDER;
const source = path.join(__dirname, "../../server", process.env.CLIENT_URL);
const store = path.join(__dirname, "../../server", process.env.STORE_URL);
const header = process.env.XML_HEADER;
// stuff
const char = require("../character/main");
const get = require("../request/get");
const fUtil = require("../fileUtil");
const asset = require("../asset/main");

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
		case "":
		case null:
			return '';
		default:
			return `FontFile${font.replace(/\s/g, '')}`;
	}
}

module.exports =  {
	/**
	 * Parses a movie XML by adding files to a ZIP.
	 * @param {Buffer} xmlBuffer 
	 * @returns {Promise<Buffer>}
	 */
	async pack(xmlBuffer) {
		if (xmlBuffer.length == 0) throw null;

		const zip = nodezip.create();
		const themes = { common: true };
		var ugc = `${header}<theme id="ugc" name="ugc">`;
		fUtil.addToZip(zip, "movie.xml", xmlBuffer);

		// this is common in this file
		async function basicParse(file, type, subtype) {
			const pieces = file.split(".");
			const themeId = pieces[0];

			// add the extension to the last key
			const ext = pieces.pop();
			pieces[pieces.length - 1] += "." + ext;
			// add the type to the filename
			pieces.splice(1, 0, type);

			const filename = pieces.join(".");
			if (themeId == "ugc") {
				const id = pieces[2];
				try {
					const buffer = asset.load(id);

					// add asset meta
					ugc += asset.meta2Xml(asset.meta(id));
					// and add the file
					fUtil.addToZip(zip, filename, buffer);

					// add video thumbnails
					if (type == "prop" && subtype == "video") {
						pieces[2] = pieces[2].slice(0, -3) + "png";
						const filename = pieces.join(".")
						const buffer = asset.load(pieces[2]);
						fUtil.addToZip(zip, filename, buffer);
					}
				} catch (e) {
					console.error(`WARNING: Couldn't find asset ${id}:`, e);
					return;
				}
			} else {
				const filepath = `${store}/${pieces.join("/")}`;

				// add the file to the zip
				fUtil.addToZip(zip, filename, fs.readFileSync(filepath));
			}

			themes[themeId] = true;
		}

		// begin parsing the movie xml
		const film = new xmldoc.XmlDocument(xmlBuffer);
		for (const eI in film.children) {
			const elem = film.children[eI];

			switch (elem.name) {
				case "sound": {
					const file = elem.childNamed("sfile")?.val;
					if (!file) continue;
					
					await basicParse(file, elem.name)
					break;
				}

				case "scene": {
					for (const e2I in elem.children) {
						const elem2 = elem.children[e2I];

						let tag = elem2.name;
						// change the tag to the one in the store folder
						if (tag == "effectAsset") tag = "effect";

						switch (tag) {
							case "durationSetting":
							case "trans":
								break;
							case "bg":
							case "effect":
							case "prop": {
								const file = elem2.childNamed("file")?.val;
								if (!file) continue;
								
								await basicParse(file, tag, elem2.attr.subtype);
								break;
							}
							
							case "char": {
								let file = elem2.childNamed("action")?.val;
								if (!file) continue;
								const pieces = file.split(".");
								const themeId = pieces[0];

								const ext = pieces.pop();
								pieces[pieces.length - 1] += "." + ext;
								pieces.splice(1, 0, elem2.name);
		
								if (themeId == "ugc") {
									// remove the action from the array
									pieces.splice(3, 1);

									const id = pieces[2];
									try {
										const buffer = await char.load(id);
										const filename = pieces.join(".");

										ugc += asset.meta2Xml({
											// i can't just select the character data because of stock chars
											id: id,
											type: "char",
											themeId: char.getTheme(buffer)
										});
										fUtil.addToZip(zip, filename + ".xml", buffer);
									} catch (e) {
										console.error(`WARNING: Couldn't find asset ${id}:`, e);
										continue;
									}
								} else {
									const filepath = `${store}/${pieces.join("/")}`;
									const filename = pieces.join(".");

									fUtil.addToZip(zip, filename, fs.readFileSync(filepath));
								}

								for (const e3I in elem2.children) {
									const elem3 = elem2.children[e3I];
									if (!elem3.children) continue;

									// add props and head stuff
									file = elem3.childNamed("file")?.val;
									if (!file) continue;
									const pieces2 = file.split(".");

									// headgears and handhelds
									if (elem3.name != "head") {
										await basicParse(file, "prop");
									} else { // heads
										if (pieces2[0] == "ugc") continue;
										pieces2.pop(), pieces2.splice(1, 0, "char");
										const filepath = `${store}/${pieces2.join("/")}.swf`;

										pieces2.splice(1, 1, "prop");
										const filename = `${pieces2.join(".")}.swf`;
										fUtil.addToZip(zip, filename, fs.readFileSync(filepath));
									}

									themes[pieces2[0]] = true;
								}

								themes[themeId] = true;
								break;
							}

							case 'bubbleAsset': {
								const bubble = elem2.childNamed("bubble");
								const text = bubble.childNamed("text");

								// arial doesn't need to be added
								if (text.attr.font == "Arial") continue;

								const filename = `${name2Font(text.attr.font)}.swf`;
								const filepath = `${source}/go/font/${filename}`;
								fUtil.addToZip(zip, filename, fs.readFileSync(filepath));
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
	 * Removed non-existent assets from a movie XML. This is useful for fixing movies that won't load due to an asset deletion.
	 * @param {Buffer} xmlBuffer 
	 * @returns {Buffer}
	 */
	async repair(xmlBuffer) {
		if (xmlBuffer.length == 0) throw null;

		function basicParse(file, tag) {
			const pieces = file.split(".");
			const themeId = pieces[0];

			let ext;
			if (tag != "char") {
				ext = pieces.pop();
				pieces[pieces.length - 1] += "." + ext;
			} else pieces.splice(2, 2);

			switch (themeId) {
				case "ugc": {
					const id = pieces[1];
					if (!asset.exists(id)) {
						console.error(`${id} doesn't exist, removing from XML...`);
						return false;
					}
					break;
				} default: break;
			}
			return true;
		}

		// begin parsing the movie xml
		const film = new xmldoc.XmlDocument(xmlBuffer);
		for (const eI in film.children) {
			const elem = film.children[eI];

			switch (elem.name) {
				case "sound": {
					const file = elem.childNamed("sfile")?.val;
					if (!file) continue;
					
					if (!basicParse(file)) film.children.splice(eI, 1);;
					break;
				} case "scene": {
					for (const e2I in elem.children) {
						const elem2 = elem.children[e2I];
						const tag = elem2.name;

						switch (tag) {
							case "bg":
							case "char":
							case "effectAsset":
							case "prop": {
								const file = elem2.childNamed(tag != "char" ? "file" : "action")?.val;
								if (!file) continue;
								
								if (!basicParse(file, tag)) elem.children.splice(e2I, 1);
								break;
							} default: break;
						}
					}
					break;
				}
			}
		}

		return film.toString({ compressed: true });
	}
};
