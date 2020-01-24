const path = require('path');

module.exports = {
    filenameFromPath: function(filePath) {
        return path.basename(filePath, path.extname(filePath));
    },
    outputPathFromInputPath: function(filePath, language) {
        return path.join(path.dirname(filePath), `${language}.po`);
    },
    parseInitialData: function(argv) {
        var initialData = {};
        const defaultPathIndex = argv.indexOf('-p');
        if (defaultPathIndex >= 0) {
          initialData.defaultPath = argv[defaultPathIndex+1];
        }
        const outputLanguageIndex = argv.indexOf('-l');
        if (outputLanguageIndex >= 0) {
          initialData.outputLanguage = argv[outputLanguageIndex+1];
        }
        return initialData;
    }
}