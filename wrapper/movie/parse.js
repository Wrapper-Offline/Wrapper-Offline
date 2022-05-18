
/**
 * movie parsing
 * if you don't know what's going on here, look at the lvm's code
 * ffdec does a great job with that
 */
// modules
const fs = require("fs");
const nodezip = require("node-zip");
const xmldoc = require("xmldoc");
// vars
const themeFolder = process.env.THEME_FOLDER;
const source = process.env.CLIENT_URL;
const header = process.env.XML_HEADER;
const store = process.env.STORE_URL;
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



/**
 * Parses a movie XML by adding files to a ZIP.
 * @param {Buffer} xmlBuffer 
 * @returns {Buffer}
 */
module.exports = async function(xmlBuffer) {
	if (xmlBuffer.length == 0) throw null;

	const zip = nodezip.create();
	const themes = { common: true };
	var ugc = `${header}<theme id="ugc" name="ugc">`;
	fUtil.addToZip(zip, "movie.xml", xmlBuffer);

	// this is common in this file
	async function basicParse(file, tag) {
		const pieces = file.split(".");
		const themeId = pieces[0];

		// add the extension to the last key
		const ext = pieces.pop();
		pieces[pieces.length - 1] += "." + ext;
		// add the type to the filename
		pieces.splice(1, 0, tag);

		const filename = pieces.join(".");
		switch (themeId) {
			case "ugc": {
				const id = pieces[2];
				const buffer = asset.load(id);

				// add asset meta
				ugc += asset.meta2Xml(asset.meta(id));
				// and add the file
				fUtil.addToZip(zip, filename, buffer);
				break;
			} default: {
				const filepath = `${store}/${pieces.join("/")}`;

				// add the file to the zip
				fUtil.addToZip(zip, filename, await get(filepath));
				break;
			}
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
							
							await basicParse(file, tag);
							break;
						} case "char": {
							let file = elem2.childNamed("action")?.val;
							if (!file) continue;
							const pieces = file.split(".");
							const themeId = pieces[0];

							const ext = pieces.pop();
							pieces[pieces.length - 1] += "." + ext;
							pieces.splice(1, 0, elem2.name);
	
							switch (themeId) {
								case "ugc": {
									// make a clone of the array so we can splice
									const peces = pieces.slice(0);
									// remove the action part of the array
									peces.splice(3, 1);

									const id = pieces[2];
									const buffer = await char.load(id);
									const filename = peces.join(".");

									ugc += asset.meta2Xml({
										// i can't just select the character data because of stock chars
										id: id,
										type: "char",
										themeId: char.getTheme(buffer)
									});
									fUtil.addToZip(zip, filename + ".xml", buffer);
									break;
								} default: {
									const filepath = `${store}/${pieces.join("/")}`
									const filename = pieces.join(".");

									fUtil.addToZip(zip, filename, await get(filepath));
									break;
								}
							}

							// add props and heads
							for (const e3I in elem2.children) {
								const elem3 = elem2.children[e3I];
								if (!elem3.children) continue;

								var urlF, fileF;
								switch (elem3.name) {
									case 'head':
										urlF = 'char';
										fileF = 'prop';
										break;
									case 'prop':
										fileF = urlF = 'prop';
										break;
									default:
										continue;
								}

								file = elem3.childNamed('file');
								const slicesP = file.val.split('.');
								slicesP.pop(), slicesP.splice(1, 0, urlF);
								const urlP = `${store}/${slicesP.join('/')}.swf`;

								slicesP.splice(1, 1, fileF);
								const fileP = `${slicesP.join('.')}.swf`;
								fUtil.addToZip(zip, fileP, await get(urlP));
							}

							themes[themeId] = true;
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
};
