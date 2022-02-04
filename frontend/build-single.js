const fs = require('fs-extra');
const concat = require('concat');

(async function build() {
    //const prefix = '/Users/hilln/dev/www';
    const prefix = '/Users/cesler/Stuffz/HORIZON';
    const files = [
        prefix + '/runtime.js',
        prefix + '/polyfills.js',
        prefix + '/scripts.js',
        prefix + '/main.js'
    ]
    await concat(files, prefix + '/horizon.js')
    console.info('DONE to horizon.js');
})()
