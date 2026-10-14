import AdmZip from "adm-zip";
import fs from "fs";
import httpz from "@octanuary/httpz";
import Database from "../../storage/database.js";
import MovieModel, { Movie } from "../models/movie.js";

const group = new httpz.Group();

/*
redirects
*/
// go_full (tutorial)
group.route("*", /\/videomaker\/full\/(\w+)\/tutorial$/, (req, res) => {
	const theme = req.matches[1];
	res.redirect(`/go_full?tray=${theme}&tutorial=0`);
});
// video list
group.route("GET", "/dashboard/videos", (req, res) => {
	res.redirect("/videos");
});

/*
thumbs
*/
group.route("*", /\/file\/movie\/thumb\/([^/]+)$/, (req, res) => {
	const id = req.matches[1];

	try {
		const readStream = MovieModel.thumb(id);
		res.setHeader("Content-Type", "image/png");
		readStream.pipe(res); 
	} catch (e) {
		if (e instanceof RangeError)
			return res.status(404).end();
		console.log(req.parsedUrl.pathname, "failed. Error:", e);
		res.status(500).end();
	}
});

/*
info
*/
group.route("GET", "/api/movie/get_info", (req, res) => {
	const id = req.query.id;
	if (!id) {
		return res.status(400).json({msg:"Movie ID missing."});
	}

	try {
		const movie = Database.get("movies", id);
		res.json(movie);
	} catch (e) {
		if (e instanceof RangeError)
			return res.status(404).json({ msg:"movie not found" });
		res.status(500).json({ msg:"error occurred" })
	}
});

/*
list
*/
// movies
group.route("GET", "/api/movie/list", (req, res) => {
	const basePath = req.query.path;
	let movies:Movie[] = Database.select("movies");
	let folders = [];
	if (basePath) {
		movies = movies.filter(m => {
			return basePath ? m.folder == basePath : !m.folder;
		});
	} else {
		folders.push({
			id: "starters",
			name: "Starters",
			color: 16535421,
			folder: "api"
		});
	}
	// const folders = Database.select("movie_folders", {
	// 	parent_id: basePath ? basePath : "/",
	// });
	// let folderPath = [];
	// if (basePath) {
	// 	let rootFound = false;
	// 	let currentId = basePath;
	// 	while (!rootFound) {
	// 		const dbRes = Database.get("movie_folders", currentId);
	// 		if (!dbRes) {
	// 			if (currentId == basePath) {
	// 				return res.status(404).json({ msg:"Path does not exist" });
	// 			}
	// 			res.log(`Parent folder with id "${currentId}" not found, returning with empty folder_path...`);
	// 			folderPath = [];
	// 			break;
	// 		}
	// 		const folder = dbRes.data;
	// 		currentId = folder.parent_id;
	// 		if (currentId == "/") {
	// 			rootFound = true;
	// 			currentId = null;
	// 		}
	// 		folderPath.unshift({
	// 			id: folder.id,
	// 			title: folder.title
	// 		});
	// 	}
	// }
	res.json({ folder_path:[], folders, movies });
});

/*
rename folder
*/
group.route("GET", "/api/movie/rename_folder", (req, res) => {
	const { new:newName, path } = req.query;
	if (!newName) {
		return res.status(400).json({msg:"Expected newName parameter"});
	}
	if (!path) {
		return res.status(400).json({msg:"Expected path parameter"});
	}

	try {
		MovieModel.renameFolder(path, newName);
		res.json({status:"ok"});
	} catch (e) {
		if (e == "404") {
			return res.status(404).json({status:"error"});
		}
		console.error(req.parsedUrl.pathname, "failed. Error:", e);
		res.status(500).json({status:"error"});
	}
});

/*
move folder
*/
group.route("POST", "/api/movie/move_selection", (req, res) => {
	/** list of movie ids to move */
	const movies:string[]|void = req.body.movies;
	/** list of folder ids to move */
	const movieFolders:string[]|void = req.body.movie_folders;
	/** id of the parent folder to move to */
	const newParentId:string|void = req.body.new_parent_id;

	if ((!movies && !movieFolders) || !newParentId) {
		return res.status(400).json({msg:"Required parameter is missing"});
	}

	try {
		MovieModel.moveToFolder({
			movieIds: movies || [],
			movieFolderIds: movieFolders || []
		}, newParentId);
		res.json({ status:"ok" });
	} catch (e) {
		switch (e) {
			case "t-404":
				return res.status(404).json({ status:"Specified target folder does not exist" });
			case "m-404":
				return res.status(404).json({ status:"A specified movie does not exist" });
			case "f-404":
				return res.status(404).json({ status:"A specified folder does not exist" });
			default: {
				console.error(req.parsedUrl.pathname, "failed. Error:", e);
				res.status(500).json({ status:"error" });
			}
		}
		
	}
});

/*
delete folder
*/
/*
move folder
*/
group.route("GET", "/api/movie/delete_folder", (req, res) => {
	// const { path } = req.query;
	// if (!path) {
	// 	return res.status(400).json({msg:"Expected path parameter"});
	// }

	// try {
	// 	MovieModel.deleteFolder(path);
	// 	res.json({status:"ok"});
	// } catch (e) {
	// 	if (e == "404") {
	// 		return res.status(404).json({status:"error"});
	// 	}
	// 	console.error(req.parsedUrl.pathname, "failed. Error:", e);
	// 	res.status(500).json({status:"error"});
	// }
});

/*
delete
*/
group.route("POST", "/api/movie/delete", async (req, res) => {
	const idField = req.body.id as string;
	if (typeof idField == "undefined") {
		return res.status(400).json({ msg:"Missing required parameters" });
	}
	const ids = idField.split(",");
	for (const id of ids) {
		try {
			await MovieModel.delete(id);
			res.log("Deleted movie #" + id);
		} catch (e) {
			if (e instanceof RangeError) {
				res.log(`Failed to delete movie #${id}: Movie does not exist`);
				res.log(`Skipping movie #${id}...`)
			}
			res.log(`Failed to delete movie #${id}: ${e}`);
			const remaining = ids.slice(id.indexOf(id));
			res.log("Stopping movie deletion! Remaining: " + JSON.stringify(remaining));
			return res.status(500).json({ msg:"Internal server error" });
		}
	}
	res.end()
});

/*
upload
*/
group.route("POST", "/api/movie/upload", (req, res) => {
	const file = req.files.import;
	const isStarter = req.body.is_starter;
	if (typeof file == "undefined") {
		return res.status(400).json({ msg:"No file." });
	}

	const path = file.filepath, buffer = fs.readFileSync(path);
	if (
		file.mimetype !== "application/x-zip-compressed" &&
		file.mimetype !== "application/zip" &&
		!buffer.subarray(0, 4).equals(
			Buffer.from([0x50, 0x4b, 0x03, 0x04])
		)
	) {
		return res.status(400).json({ msg:"Movie is not a zip." });
	}

	MovieModel.upload(buffer, isStarter).then((id) => {
		fs.unlinkSync(path);
		res.json({ id: id });
	}).catch((err) => {
		console.error("Controllers.movie#upload error:", err);
		res.status(500).json({ msg: null });
	});
});

/*
pack
*/
group.route(
	"*",
	/^\/file\/movie\/file\/([^/]+)|\/goapi\/getMovie\/$/,
	async (req, res) => {
		const isPost = req.method == "POST";
		const idField = isPost ?
			req.query.movieId :
			req.matches[1];
		if (typeof idField == "undefined") {
			return res.status(400).end("ID not specified");
		}
		const ids = idField.split(",");

		let zip = new AdmZip();
		let zipBuf:Buffer | undefined;
		for (const id of ids) {
			try {
				const zipped = await MovieModel.packMovie(id);
				if (ids.length == 1) {
					zipBuf = zipped;
					break;
				}
				zip.addFile(id + ".zip", zipped);
			} catch (e) {
				if (e instanceof RangeError) {
					return res.status(404).end("movie no existing !!");
				}
				res.log("Error packing movie #" + JSON.stringify(ids) + ": " + e);
				res.status(500).end("Internal server error");
			}
		}
		if (!zipBuf) {
			zipBuf = await zip.toBufferPromise();
		}
		if (isPost) {
			zipBuf = Buffer.concat([Buffer.alloc(1, 0), zipBuf]);
		}
		res.setHeader("Content-Type", "application/zip");
		res.end(zipBuf);
	}
);

/*
save
*/
group.route("POST", ["/goapi/saveMovie/", "/goapi/saveTemplate/"], async (req, res) => {
	const zipField = req.body.body_zip;
	if (typeof zipField == "undefined") {
		return res.status(400).end("Expected body_zip field");
	}
	const movieId = req.body.movieId;
	const thumbField = req.body.thumbnail_large;
	const trigAutosave = req.body.is_triggered_by_autosave;
	if (!thumbField) {
		if (trigAutosave && !movieId) {
			return res.end("0"); // lie
		}
		if (!trigAutosave) {
			return res.status(400).end("No is_triggered_by_autosave, expected thumbnail_large field");
		}
	}
	
	const body = Buffer.from(zipField, "base64");
	let thumb:Buffer | undefined;
	if (thumbField) {
		thumb = Buffer.from(thumbField, "base64");
	}
	// zip check
	if (!body.subarray(0, 4).equals(
		Buffer.from([0x50, 0x4b, 0x03, 0x04])
	)) {
		return res.status(400).end("body_zip is not a zip");
	}
	
	res.log(`Saving movie #${movieId || "<new movie>"}...`);

	const zip = new AdmZip(body);
	const movieXml = zip.readFile("movie.xml");
	const saveAsStarter = req.parsedUrl.pathname == "/goapi/saveTemplate/";
	try {
		if (!movieXml) {
			throw new Error("fuck");
		}
		const id = await MovieModel.save(movieXml, thumb, movieId, saveAsStarter);
		res.log("Successfully saved movie #" + id);
		res.end("0" + id);
	} catch (e) {
		if (e instanceof RangeError) {
			return res.status(404).end("Specified movie does not exist");
		}
		res.log("Error saving movie: " + e);
		res.status(500).end("Internal server error");
	}
});

export default group;
