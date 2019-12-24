const path = require('path');
const axios = require('axios');

module.exports = {
    filenameFromPath: function(filePath) {
        return path.basename(filePath, path.extname(filePath));
    },
    outputPathFromInputPath: function(filePath, language) {
        return path.join(path.dirname(filePath), `${language}.po`);
    }
}