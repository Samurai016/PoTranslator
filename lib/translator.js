const LanguageTranslatorV3 = require('ibm-watson/language-translator/v3');
const { IamAuthenticator } = require('ibm-watson/auth');

function login() {
    return new LanguageTranslatorV3({
        version: '2018-05-01',
        authenticator: new IamAuthenticator({
            apikey: 'W8ceNdPu98NB_wz_2GPnhvE_FQrtxBhc-XdyM_PzDwNp',
        }),
        url: "https://api.eu-gb.language-translator.watson.cloud.ibm.com/instances/192b1fcf-ad75-4639-8479-81d6871ea2df",
    });
}

module.exports = {
    translate: async function(options) {
        const translateParams = {
            text: options.text,
            modelId: `${options.inputLanguage}-${options.outputLanguage}`,
        };

        return (await login().translate(translateParams)).result.translations.map(translation => translation.translation);
    },
    listModels: async function() {
        return await login().listModels();
    }
}