/*
movie parsing
 if you don't know what's going on here, look at the lvm's code
 ffdec does a great job with that
*/
const fs = require("fs");
const nodezip = require("node-zip");
const path = require("path");
const xmldoc = require("xmldoc");
const database = require("../../data/database"), DB = new database();
const char = require("../models/char");
const fUtil = require("./fileUtil");
const asset = require("../models/asset");
const source = path.join(__dirname, "../../server", process.env.CLIENT_URL);
const store = path.join(__dirname, "../../server", process.env.STORE_URL);
const header = process.env.XML_HEADER;

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

/**
 * @param {ReadableStream} readStream 
 * @returns {Promise<Buffer>}
 */
function stream2Buffer(readStream) {
	return new Promise((res, rej) => {
		let buffers = [];
		readStream.on("data", (c) => buffers.push(c));
		readStream.on("end", () => res(Buffer.concat(buffers)));
	});
}

module.exports = {
	/**
	 * Parses a movie XML by adding files to a ZIP.
	 * @param {Buffer} xmlBuffer 
	 * @param {Buffer | null} thumbBuffer 
	 * @returns {Promise<Buffer>}
	 */
	async pack(xmlBuffer, thumbBuffer = null) {
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
					const buffer = asset.load(id, true);
	
					// add asset meta
					ugc += asset.meta2Xml(DB.get("assets", id).data);
					// and add the file
					fUtil.addToZip(zip, filename, buffer);
	
					// add video thumbnails
					if (type == "prop" && subtype == "video") {
						pieces[2] = pieces[2].slice(0, -3) + "png";
						const filename = pieces.join(".")
						const buffer = asset.load(pieces[2], true);
						fUtil.addToZip(zip, filename, buffer);
					}
				} catch (e) {
					console.error(`WARNING: ${id}:`, e);
					return;
				}
			} else {
				if (type == "prop" && pieces.indexOf("head") > -1) {
					pieces[1] = "char";
				}	
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
										console.error(`WARNING: ${id}:`, e);
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
		themeKs.forEach((t) => {
			if (t == "ugc") return;
			const file = fs.readFileSync(`${store}/${t}/theme.xml`);
			fUtil.addToZip(zip, `${t}.xml`, file);
		});
	
		fUtil.addToZip(zip, "themelist.xml", Buffer.from(
			`${header}<themes>${themeKs.map((t) => `<theme>${t}</theme>`).join("")}</themes>`
		));
		fUtil.addToZip(zip, "ugc.xml", Buffer.from(ugc + "</theme>"));
		if (thumbBuffer) {
			fUtil.addToZip(zip, "thumbnail.png", thumbBuffer);
		}
		return await zip.zip();
	},

	async extractAudioTimes(xmlBuffer) {
		const film = new xmldoc.XmlDocument(xmlBuffer);
		let audios = [];

		for (const eI in film.children) {
			const elem = film.children[eI];

			if (elem.name !== "sound") continue;
			audios.push(elem);
		}
		return audios.map((v) => {
			const pieces = v.childNamed("sfile").val.split(".");
			const themeId = pieces[0];
			
			// add the extension to the last key
			const ext = pieces.pop();
			pieces[pieces.length - 1] += "." + ext;
			// add the type to the filename
			pieces.splice(1, 0, "sound");

			let filepath;
			if (themeId == "ugc") {
				filepath = path.join(asset.folder, pieces[pieces.length - 1]);
			} else {
				filepath = path.join(store, pieces.join("/"));
			}

			return {
				filepath: filepath,
				start: +v.childNamed("start").val,
				stop: +v.childNamed("stop").val,
				trimStart: +v.childNamed("trimStart")?.val || 0,
				trimEnd: +v.childNamed("trimEnd")?.val || 0,
				fadeIn: {
					duration: +v.childNamed("fadein").attr.duration,
					vol: +v.childNamed("fadein").attr.vol
				},
				fadeOut: {
					duration: +v.childNamed("fadeout").attr.duration,
					vol: +v.childNamed("fadeout").attr.vol
				}
			}
		});
	},

	/**
	 * unpacks a movie zip returns movie xml
	 * @param {Buffer} body 
	 * @returns {Promise<Buffer>}
	 */
	async unpack(body) {
		const zip = nodezip.unzip(body);
		const ugcStream = zip["ugc.xml"].toReadStream();
		const ugcBuffer = await stream2Buffer(ugcStream);
		const ugc = new xmldoc.XmlDocument(ugcBuffer);

		for (const eI in ugc.children) {
			const elem = ugc.children[eI];

			switch (elem.name) {
				case "background": {
					if (!asset.exists(elem.attr.id)) {
						const readStream = zip[`ugc.bg.${elem.attr.id}`].toReadStream();
						const buffer = await stream2Buffer(readStream);
						asset.save(buffer, elem.attr.id, {
							type: "bg",
							subtype: "0",
							title: elem.attr.name,
							id: "c55fb6c.swf"
						});
					}
					break;
				}

				case "prop": {
					if (!asset.exists(elem.attr.id)) {
						if (elem.attr.subtype == "video") {
							const readStream = zip[`ugc.prop.${elem.attr.id}`].toReadStream();
							const buffer = await stream2Buffer(readStream);
							asset.save(buffer, elem.attr.id, {
								type: "prop",
								subtype: "video",
								title: elem.attr.name,
								width: +elem.attr.width,
								height: +elem.attr.height,
								id: elem.attr.id
							});

							const readStream2 = zip[`ugc.prop.${elem.attr.id.slice(0, -4)}.png`].toReadStream();
							const buffer2 = await stream2Buffer(readStream2);
							fs.writeFileSync(path.join(
								__dirname,
								"../../",
								process.env.ASSET_FOLDER,
								elem.attr.id.slice(0, -4) + ".png"
							), buffer2);
						} else {
							const readStream = zip[`ugc.prop.${elem.attr.id}`].toReadStream();
							const buffer = await stream2Buffer(readStream);
							asset.save(buffer, elem.attr.id, {
								type: "prop",
								subtype: "0",
								title: elem.attr.name,
								ptype: elem.attr.wearable == 1 ? "wearable" :
									elem.attr.holdable == 1 ? "holdable" :
									"placeable",
								id: elem.attr.id
							});
						}
					}
					break;
				}

				case "char": {
					if (!char.exists(elem.attr.id)) {
						const readStream = zip[`ugc.char.${elem.attr.id}.xml`].toReadStream();
						const buffer = await stream2Buffer(readStream);
						char.save(buffer, {
							type: "char",
							subtype: 0,
							title: elem.attr.name,
							themeId: char.getTheme(buffer),
							id: elem.attr.id
						});
					}
					break;
				}

				case "sound": {
					if (!asset.exists(elem.attr.id)) {
						const readStream = zip[`ugc.${elem.name}.${elem.attr.id}`].toReadStream();
						const buffer = await stream2Buffer(readStream);
						asset.save(buffer, elem.attr.id, {
							duration: +elem.attr.duration,
							type: elem.name,
							subtype: elem.attr.subtype,
							title: elem.attr.name,
							id: elem.attr.id
						});
					}
					break;
				}
			}
		}

		const readStream = zip["movie.xml"].toReadStream();
		const buffer = await stream2Buffer(readStream);

		let thumbBuffer = Buffer.from([0x00]);
		if (zip["thumbnail.png"]) {
			const readStream2 = zip["thumbnail.png"].toReadStream();
			thumbBuffer = await stream2Buffer(readStream2);
		}
		return [buffer, thumbBuffer];
	}
};
