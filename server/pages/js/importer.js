/*
importer
*/
class AssetImporter {
	constructor(importer) {
		this.$importer = importer;
		this.$queue = importer.find("#importer-queue");
		this.config = { maxsize: false };
		this.pendingExts = [];
		this.addEvents();
	}

	addEvents() {
		this.$importer.find("#importer-files").on("input", () => {
			const fileUpload = document.getElementById("importer-files");
			for (let i = 0; i < fileUpload.files.length; i++) {
				this.addFile(fileUpload.files[i]);
			}
		});
		/* drag & drop */
		this.$importer.on("dragover", (e) => {
			e.preventDefault();
			e.stopPropagation();
		});
		this.$importer.on("dragenter", (e) => {
			e.preventDefault();
			e.stopPropagation();
			this.$importer.find(".drag_hint").show();
		});
		this.$importer.on("dragleave", (e) => {
			e.preventDefault();
			e.stopPropagation();
			this.$importer.find(".drag_hint").hide();
		});
		this.$importer.on("drop", (e) => {
			e.preventDefault();
			e.stopPropagation();
			const files = e.originalEvent.dataTransfer.files;
			for (let i = 0; i < files.length; i++) {
				this.addFile(files[i]);
			}
		});
		/* bulk importing */
		this.$importer.on("click", ".bulk_import_confirm [data-action], .importer_asset.ext [data-action]", (e) => {
			const $target = $(e.target);
			const action = $target.attr("data-action");
			switch (action) {
				case "confirm":
				case "cancel": {
					const $hint = $target.parent().parent();
					const ext = $hint.attr("data-ext");
					$hint.remove();
	
					const assets = this.$queue.children(`[data-ext="${ext}"]`);
	
					if (action == "confirm") {
						for (const asset of assets) {
							asset.style.display = "none";
						}
						const $el = this.insertFileElement(
							assets.length + " files",
							"." + ext,
							ext,
							false
						);
						$el.addClass("ext");
						$el.attr("data-ext", ext);
						this.pendingExts.push(ext);
					} else {
						for (const asset of assets) {
							asset.style.display = "";
						}
						this.pendingExts.splice(this.pendingExts.indexOf(ext), 1);
					}
				}
				case "goaway": {
					localStorage.setItem("showBulkImportConfirm", "false");
				}
				case "close": {
					const $hint = $target.parent().parent();
					$hint.remove();
					break;
				}
			}
		});
		this.$importer.on("click", "[data-ext] .import_as>[data-type]", (e) => {
			const $target = $(e.target);
			const $assetEl = $target.parent().parent();
			const ext = $assetEl.attr("data-ext");
			const type = $target.attr("data-type");
			
			for (const asset of this.$queue.children(`[data-ext="${ext}"]`)) {
				if (asset.classList.contains("ext")) {
					continue
				}
				asset.querySelector(`[data-type="${type}"]`).click();
				if (type !== "prop") {
					asset.remove();
				}
			}
			if (type !== "prop") {
				$assetEl.find(".import_as").remove();
				$assetEl.find(".asset_subtype").text("Pending...");
				setTimeout(() => $assetEl.remove(), 10000);
			} else {
				$assetEl.find(".import_as").html(`
					<a href="javascript:;" data-ptype="holdable">Handheld</a>
					<a href="javascript:;" data-ptype="wearable">Headgear</a>
					<a href="javascript:;" data-ptype="placeable">Other Prop</a>
					<a href="javascript:;" data-action="cancel">Cancel</a>
				`);
			}
		});
		this.$importer.on("click", "[data-ext] .import_as>[data-ptype]", (e) => {
			const $target = $(e.target);
			const $assetEl = $target.parent().parent();
			const ext = $assetEl.attr("data-ext");
			const ptype = $target.attr("data-ptype");
			
			$assetEl.find(".import_as").remove();
			$assetEl.find(".asset_subtype").text("Pending...");
			for (const asset of this.$queue.children(`[data-ext="${ext}"]`)) {
				if (asset.classList.contains("ext")) {
					continue
				}
				asset.querySelector(`[data-ptype="${ptype}"]`).click();
				asset.remove();
			}
			setTimeout(() => $assetEl.remove(), 10000);
		});
	}

	/**
	 * @param {string} msg 
	 */
	displayError(msg) {
		const $elem = $(`<div class="importer_hint">${msg}</div>`);
		this.$importer.find("#import_head").after($elem);
		setTimeout(() => $elem.fadeOut(() => $elem.remove()), 6000);
	}

	/**
	 * @param {File} file
	 */
	addFile(file) {
		const maxsize = this.config.maxsize;
		if (maxsize && file.size > maxsize) {
			displayError("The file you selected is too large.");
			return;
		}

		const ext = file.name.substring(file.name.lastIndexOf(".") + 1);
		const $el = this.insertFileElement(file.name, filesize(file.size), ext);
		if ($el == false) {
			return;
		}

		$el.data("importerFile", new ImporterFile(file, $el, ext));
		this.onFileAdded(ext);

		if (this.pendingExts.indexOf(ext) > -1) {
			$el.hide();
		}
	}

	/**
	 * @param {string} name 
	 * @param {string} size 
	 * @param {string} ext 
	 * @param {?boolean} iUsedToHaveACripplingRobloxPornAddiction
	 * @returns {JQuery | false}
	 */
	insertFileElement(name, size, ext, iUsedToHaveACripplingRobloxPornAddiction = true) {
		let $el;
		switch (ext) {
			case "ogg":
			case "mp3":
			case "wma":
			case "wav": {
				$el = $(`
					<div class="importer_asset" data-ext="${ext}">
						<div class="asset_metadata">
							<img class="asset_preview" src="/pages/img/importer/sound.svg"/>
							<div>
								<h4 ${iUsedToHaveACripplingRobloxPornAddiction ? 'contenteditable="true"' : ""} class="asset_name">${name}</h4>
								<p class="asset_subtype">${size} | Import as...</p>
							</div>
						</div>
						<div class="import_as">
							<a href="javascript:;" data-type="bgmusic">Music</a>
							<a href="javascript:;" data-type="soundeffect">Sound effect</a>
							<a href="javascript:;" data-type="voiceover">Voiceover</a>
							<a href="javascript:;" data-action="cancel">Cancel</a>
						</div>
					</div>
				`.trim()).prependTo(this.$queue);
				break;
			}
			case "swf":
			case "gif":
			case "jpg":
			case "png": {
				$el = $(`
					<div class="importer_asset" data-ext="${ext}">
						<div class="asset_metadata">
							<img class="asset_preview" src="/pages/img/importer/image.svg"/>
							<div>
								<h4 ${iUsedToHaveACripplingRobloxPornAddiction ? 'contenteditable="true"' : ""} class="asset_name">${name}</h4>
								<p class="asset_subtype">${size} | Import as...</p>
							</div>
						</div>
						<div class="import_as">
							<a href="javascript:;" data-type="bg">Background</a>
							<a href="javascript:;" data-type="prop">Prop</a>
							<a href="javascript:;" data-type="watermark">Watermark</a>
							<a href="javascript:;" data-action="cancel">Cancel</a>
						</div>
					</div>
				`.trim()).prependTo(this.$queue);
				break;
			}
			case "mp4": {
				$el = $(`
					<div class="importer_asset" data-ext="${ext}">
						<div class="asset_metadata">
							<img class="asset_preview" src="/pages/img/importer/video.svg"/>
							<div>
								<h4 ${iUsedToHaveACripplingRobloxPornAddiction ? 'contenteditable="true"' : ""} class="asset_name">${name}</h4>
								<p class="asset_subtype">${size} | Video</p>
							</div>
						</div>
						<div class="import_as">
							<a href="javascript:;" data-type="video">Import</a>
							<a href="javascript:;" data-action="cancel">Cancel</a>
						</div>
					</div>
				`.trim()).prependTo(this.$queue);
				break;
			}
			default: {
				this.displayError("Invalid file type!");
				return false;
			}
		}
		return $el;
	}

	/**
	 * @param {string} ext 
	 */
	onFileAdded(ext) {
		const length = this.$queue.children(`[data-ext="${ext}"]`).length;
		if (length == 2 && localStorage.getItem("showBulkImportConfirm") != "false") {
			this.$importer.find("#import_head").after(`
				<div class="bulk_import_confirm importer_hint" data-ext="${ext}">
					It appears you have selected multiple files with the same extension (.${ext}). Would you like to import them all as the same type?
					<div class="importer_hint_btns">
						<button class="btn" data-action="confirm">Yes</button>
						<button class="btn" data-action="close">No</button>
						<button class="btn" data-action="goaway">Do not show again</button>
					</div>
				</div>
			`);
		}
	}
}

class ImporterFile {
	constructor(file, element, ext) {
		this.file = file;
		this.$el = element;
		this.ext = ext;
		this.addEvents();
	}

	addEvents() {
		this.$el.find("[data-type]").one("click", async (e) => {
			const $target = $(e.target);
			const type = $target.attr("data-type");
			const fixedTypes = this.typeFixer(type);
			this.type = fixedTypes.type;
			this.subtype = fixedTypes.subtype;

			if (this.type == "prop" && this.subtype != "video") {
				// part 2
				this.$el.find(".import_as").html(`
					<a href="javascript:;" data-ptype="holdable">Handheld</a>
					<a href="javascript:;" data-ptype="wearable">Headgear</a>
					<a href="javascript:;" data-ptype="placeable">Other Prop</a>
					<a href="javascript:;" data-action="cancel">Close</a>
				`.trim());
			} else {
				// get the title
				let name = this.$el.find(".asset_name").text();
				this.upload(name);
			}
		});

		this.$el.one("click", "[data-ptype]", (e) => {
			const $target = $(e.target);
			this.ptype = $target.attr("data-ptype");
			this.upload();
		});

		this.$el.on("click", "[data-action]", (e) => {
			const $target = $(e.target);
			const action = $target.attr("data-action");

			switch (action) {
				case "add-to-scene":
					studio[0].importerAddAsset(this.type, this.id);
					break;
				case "cancel":
					this.$el.fadeOut(() => this.$el.remove());
					break;
				default:
					console.error("okay well whoever wrote this shit is stupid");
			}
		});
	}

	typeFixer(type) {
		switch (type) {
			case "bgmusic":
			case "soundeffect":
			case "voiceover":
				return { type: "sound", subtype: type };
			case "video":
				return { type: "prop", subtype: type };
			default:
				return { type: type, subtype: 0 };
		}
	}

	upload() {
		let name = this.$el.find(".asset_name").text();
		if (name == "") {
			name = "unnamed" + Math.random().toString().substring(2, 8);
		}

		this.$el.find(".import_as").html("");
		this.$el.find(".asset_subtype").text("Pending...");
		studio[0].importerStatus("processing");

		let b = new FormData();
		b.append("import", this.file);
		b.append("name", name)
		b.append("type", this.type);
		b.append("subtype", this.subtype);
		if (this.type == "prop") {
			b.append("ptype", this.ptype || "");
		}

		$.ajax({
			url: "/api/asset/upload",
			method: "POST",
			data: b,
			processData: false,
			contentType: false,
			dataType: "json"
		}).done((d) => {
			this.$el.find(".asset_subtype").text("Imported");
			if (this.type == "watermark") {
				this.$el.fadeOut(() => this.$el.remove());
				return;
			}
			this.id = d.file;

			// update the object for videos
			const importType = this.subtype == "video" ? "video" : this.type;
			if (importType == "video") {
				const thumbUrl = `${window.location.origin}/assets/${d.file.slice(0, -3) + "png"}`;
				d.thumbnail = thumbUrl;
			}

			// alert the studio
			studio[0].importerStatus("done");
			studio[0].importerUploadComplete(importType, d.file, d);

			if (this.type == "sound") {
				this.$el.find("img").after(`
					<audio>
						<source src="/assets/${d.file}" data-type="audio/${this.ext}">
					</audio>
				`.trim()).attr({
					"onclick": "this.nextSibling.play()",
					"style": "cursor:pointer"
				});
			} else if (this.subtype == 0) {
				if (this.ext != "swf") {
					this.$el.find("img").attr("src", `/assets/${d.file}`);
				} else {
					this.$el.find("img").attr("src", "/pages/img/importer/flash.svg");
				}
			}
			// change the subtypes to an add to scene button
			this.$el.find(".import_as").html(`
				<a href="javascript:;" data-action="add-to-scene">Add to scene</a>
				<a href="javascript:;" data-action="cancel">Close</a>
			`.trim());
			return;
		}).catch((e) => {
			console.error("Import failed. Error:", e);
			this.$el.find("img").attr("src", "/pages/img/importer/error.svg");
			if (typeof e.responseJSON !== "undefined") {
				this.$el.find(".asset_subtype").text(e.responseJSON.msg);
			} else {
				this.$el.find(".asset_subtype").text("An unknown error occured.");
			}
			this.$el.find(".import_as").html("<a href='javascript:;' data-action='cancel'>Close</a>");
		});
	}
}
