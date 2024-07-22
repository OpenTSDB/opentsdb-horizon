const fs = require("fs-extra");
const concat = require("concat");

(async function build() {
    //const prefix = '/Users/hilln/dev/www';
    const prefix = "/tmp/Stuffz/HORIZON";
    const files = [
        prefix + "/runtime.js",
        prefix + "/polyfills.js",
        prefix + "/scripts.js", // this one doesn't have a suffix
        prefix + "/main.js",
    ];
    await concat(files, prefix + "/horizon.js")
        .catch(err => {
            console.error(err);
            process.exit(1);
        });
    console.info("DONE to horizon.js");
})();
