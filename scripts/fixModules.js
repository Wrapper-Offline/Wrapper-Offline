// so we're using newer versions of libraries that introduce things that this version of electron doesn't support
// but since we can't upgrade electron, we'll need to modify the modules to make it compatible again

const fs = require("fs");
const { join } = require("path");

const searchDirs = ["sharp", "eta"];

searchDirs.forEach((dir) => {
    const path = join(__dirname, "../node_modules", dir);
    fs.readdirSync(
        path, 
        {
            recursive: true
        }
    )
    .filter((val) => val.endsWith(".js"))
    .forEach((dir) => {
        const newpath = join(path, dir);
        const contents = fs.readFileSync(newpath).toString();
        fs.writeFileSync(newpath, contents.replaceAll("node:", ""));
    });
});
