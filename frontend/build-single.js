const fs = require('fs-extra');
const concat = require('concat');

(async function build() {
    //const prefix = '/Users/hilln/dev/www';
    const prefix = '/Users/cesler/Stuffz/HORIZON';
    const files_es2015 = [
        prefix + '/runtime-es2015.js',
        prefix + '/polyfills-es2015.js',
        prefix + '/scripts.js', // this one doesn't have a suffix
        prefix + '/main-es2015.js'
    ];
    await concat(files_es2015, prefix + '/horizon-es2015.js');
    const files_es5 = [
        prefix + '/runtime-es5.js',
        prefix + '/polyfills-es5.js',
        prefix + '/scripts.js', // this one doesn't have a suffix
        prefix + '/main-es5.js'
    ];
    await concat(files_es5, prefix + '/horizon-es5.js');
    console.info('DONE to horizon.js');
})()
