const fs = require('fs-extra');
const concat = require('concat');

(async function build() {
    const files = [
        '/Users/hilln/dev/www/runtime.js',
        '/Users/hilln/dev/www/polyfills.js',
        '/Users/hilln/dev/www/scripts.js',
        '/Users/hilln/dev/www/main.js'
    ]
    await concat(files, '/Users/hilln/dev/www/horizon.js')
    console.info('DONE to horizon.js');
})()