const fs = require('fs');

module.exports = {
  readAllLines: function(path) {
    return fs.readFileSync(path, 'utf8').split("\n").filter((line) => line);
  },
  getStrings: function(path) {
    var lines = this.readAllLines(path);
    var strings = [];

    for (var i=0; i<lines.length; i++) {
      var line = lines[i];

      var matchID = /msgid "(.+)"/gm.exec(line);
      if (matchID) {
        var obj = {
          'id': matchID[1],
          'string': ''
        }

        var matchStr = /msgstr "(.+)"/gm.exec(lines[i+1]);
        if (matchStr) {
          obj.string = matchStr[1];
          i++;
        }

        strings.push(obj);
      }
    }

    return strings;
  },
  writeStrings: function(path, strings) {
    content = strings.map((string) => {
      return `msgid "${string.id}"\nmsgstr "${string.string}"`;
    }).join("\n\n");

    fs.writeFileSync(path, content);
  },
  fileExists: function(path) {
    return fs.existsSync(path);
  } 
}