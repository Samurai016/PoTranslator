#!/usr/bin/env node

const chalk = require('chalk');
const clear = require('clear');
const figlet = require('figlet');
const files = require('./lib/files');
const inquirer = require('./lib/inquirer');
const translator = require('./lib/translator');
const util = require('./util');
const ora = require('ora');

clear();

console.log(
  chalk.yellow(
    figlet.textSync('PoTranslator', { horizontalLayout: 'full' })
  )
);

const run = async () => {
  const spinner = ora({
    text: chalk.blueBright('Translating'),
    color: 'cyan',
  });

  try {
    //Initialization
    const translationModels = (await translator.listModels()).result.models;
    const initialData = util.parseInitialData(process.argv);

    var data = await inquirer.askConfiguration(initialData, translationModels);

    //Normalization
    if (!data.defaultPath) {
      data.defaultPath = initialData.defaultPath;
    }
    if (!data.inputLanguage) {
      data.inputLanguage = (await inquirer.askInputLanguage(translationModels)).inputLanguage;
    }
    if (!data.outputLanguage) {
      data.outputLanguage = initialData.outputLanguage;
    }

    var strings = files.getStrings(data.defaultPath);
    
    //Translating
    console.log("");
    spinner.start();

    var translations = await translator.translate({
      text: strings.map(obj => obj.string || obj.id),
      inputLanguage: data.inputLanguage,
      outputLanguage: data.outputLanguage
    });

    var tests = await translator.translate({
      text: translations,
      inputLanguage: data.outputLanguage,
      outputLanguage: data.inputLanguage
    });

    spinner.succeed("Translated");
    console.log("");
     
    for (var i=0; i<translations.length; i++) {
      if (strings[i].string !== tests[i] && !strings[i].string.includes("http")) {
        translations[i] = (await inquirer.askTranslation(
          strings[i].string || strings[i].id, 
          translations[i], 
          translations.length, 
          i)).translation;
      }
      if (strings[i].string.includes("http")) {
        translations[i] =  strings[i].string
      }
    }

    //Writing
    strings = strings.map((string, index) => {
      string.string = translations[index];
      return string;
    });

    var outputPath = util.outputPathFromInputPath(data.defaultPath, data.outputLanguage);
    if (files.fileExists(outputPath)) {
      const overwrite = await inquirer.askOutputFile();

      if (overwrite.outputPath)
        outputPath = overwrite.outputPath;
    }

    console.log("");
    spinner.start("Writing file");
    
    files.writeStrings(outputPath, strings);

    spinner.succeed("Operations completed");
  }
  catch (err) {
    spinner.stop();
    console.log("\n" + chalk.redBright(err));
    process.exit(1);
  }
};

run();