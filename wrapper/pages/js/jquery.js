const importer = $("#importer");

/**
show and hide
**/
let importerVisible = false;
function showImporter() {
	switch(importerVisible) {
		case true: {
			hideImporter();
			break;
		}
		case false:
		default: {
			importerVisible = true;
			importer.css("display", "block");
			if (!importer.data("importer"))
				importer.data("importer", new AssetImporter(importer))
		}
	}
	return true;
}
function hideImporter() {
	importerVisible = false;
	importer.css("display", "none");
}

/**
imports media
**/
class AssetImporter {
	constructor(importer) {
		this.importer = importer;
		this.queue = importer.find("#importer-queue");
		this.initialize();
	}
	initialize() {
		this.importer.find("#importer-files").on("change", (event) => {
			//uploads every file
			var fileUpload = document.getElementById("importer-files");
			for (var i = 0; i < fileUpload.files.length; i++) {
				this.addFiles(fileUpload.files[i]);
			}
		});
	}
	addFiles(file) { //adds a file to the queue
		//image importing
		const ext = file.name.substring(file.name.lastIndexOf('.')+1);
		var validFileType = false;
		switch (ext) {
			case "mp3":
			case "wav": {
				validFileType = true;
				const el = $(`
					<div class="importer_asset">
						<div class="asset_metadata">
							<h4>${file.name}</h4>
							<p class="asset_subtype">Import as...</p>
						</div>
						<div class="import_as">
							<a href="#" type="bgmusic">Music</a>
							<a href="#" type="soundeffect">Sound effect</a>
							<a href="#" type="voiceover">Voiceover</a>
						</div>
					</div>
				`).appendTo(this.queue)
				break;
			}
			case "jpg":
			case "png": {
				validFileType = true;
				const el = $(`
					<div class="importer_asset">
						<div class="asset_metadata">
							<h4>${file.name}</h4>
							<p class="asset_subtype">Import as...</p>
						</div>
						<div class="import_as">
							<a href="#" type="bg">Background</a>
							<a href="#" type="prop">Prop</a>
						</div>
					</div>
				`).appendTo(this.queue)
				break;
			}
		}
		if (validFileType == false) {
			console.log("Invalid file type!")
		}
		const request = new ImporterFile(file, el);
	}
}
class ImporterFile {
	constructor(file, element) {
		this.file = file;
		this.el = element;
		this.initialize();
	}
	initialize() {
		this.el.find("[type]").on("click", (event) => {
			//uploads every file
			var fileUpload = document.getElementById("importer-files");
			for (var i = 0; i < fileUpload.files.length; i++) {
				this.addFiles(fileUpload.files[i]);
			}
		});
	}
	upload(file, type) { //adds a file to the queue
		$.ajax()
	}
}