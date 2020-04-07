var fs = require('fs');

var utils = {
    loadMiddleware: function(app, dir ) {
        if (fs.existsSync(dir)) {
            fs.readdirSync(dir).forEach(function(file) {
                if ( file.substr(file.lastIndexOf('.') + 1) !== 'js' ) return;
                var name = file.substr(0, file.indexOf('.'));
                app.use(require(dir + '/' + name));
            });
        }
    }
}
module.exports = utils;