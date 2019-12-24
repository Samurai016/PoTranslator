const inquirer = require('inquirer');
const util = require('../util');
const fs = require('fs');
const isValid = require('is-valid-path');


const language = require('./language');

inquirer.registerPrompt('suggest', require('inquirer-prompt-suggest'));

module.exports = {
  askConfiguration: (initialData, translationModels) => {
    const inputLanguages = translationModels.map(lang => lang.source);
    const outputLanguages = translationModels.map(ln => ln.target);

    const questions = [
      ... initialData.defaultPath ? [] : [
        {
          name: 'defaultPath',
          type: 'input',
          message: 'Enter path of the default translation .po file:',
          validate: function(value) {
            if (isValid(value) && /.+\.po/.test(value) && fs.existsSync(value)) {
              return true;
            } else {
              return 'Please enter a valid .po path.';
            }
          },
          filter: function(value) {
            return value.trim().replace(/"|'/gm, "");
          }
        },
        {
          name: 'inputLanguage',
          type: 'suggest',
          message: 'Enter input language:',
          suggestions: inputLanguages,
          when: function(data) {
              return !inputLanguages.includes(util.filenameFromPath(data.defaultPath).substring(0,2));
          },
          filter: function(value) {
            return value.trim();
          },
          validate: function(value) {
              if (inputLanguages.includes(value)) {
                  return true;
              } else {
                  return 'Please enter a valid language.';
              }
          }
        }
      ],
      ... initialData.outputLanguage ? [] : [{
        name: 'outputLanguage',
        type: 'suggest',
        message: 'Enter translation language:',
        suggestions: outputLanguages,
        filter: function(value) {
          return value.trim();
        },
        validate: function(value, data) {
            if (!data.defaultPath) data.defaultPath = initialData.defaultPath;
            if (!data.inputLanguage) data.inputLanguage = util.filenameFromPath(data.defaultPath).trim().substring(0,2);
            
            const outputLanguages = translationModels.filter(ln => ln.source==data.inputLanguage).map(ln => ln.target)
            
            if (outputLanguages.includes(value)) {
                return true;
            } else {
                return 'Please enter a valid language.';
            }
        }
      }]
    ];
    return inquirer.prompt(questions);
  },
  askTranslation: (translation, translated) => {
    const questions = [
      {
        name: 'translation',
        type: 'input',
        message: `Enter translation of the string (${translation}):`,
        default: translated,
        validate: function(value) {
          if (value) {
            return true;
          } else {
            return 'Please enter a valid translation.';
          }
        }
      },
    ];
    return inquirer.prompt(questions);
  },
  askOutputFile: () => {
    const questions = [
      {
        name: 'overwrite',
        type: 'confirm',
        message: `The output file will be overwrittern, continue?:`,
        default: true,
        validate: function(value) {
          if (value) {
            return true;
          } else {
            return 'Please enter a valid answer.';
          }
        }
      },
      {
        name: 'outputPath',
        type: 'input',
        message: 'Enter path of the output .po file:',
        when: function(data) {
          return !data.overwrite;
        },
        validate: function(value) {
          if (isValid(value) && /.+\.po/.test(value)) {
            return true;
          } else {
            return 'Please enter a valid path.';
          }
        },
        filter: function(value) {
          return value.trim().replace(/"|'/gm, "");
        }
      },
    ];
    return inquirer.prompt(questions);
  }
};