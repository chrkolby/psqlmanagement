define([
    'templates/apidoc/locales/ca.js',
    'templates/apidoc/locales/de.js',
    'templates/apidoc/locales/es.js',
    'templates/apidoc/locales/fr.js',
    'templates/apidoc/locales/it.js',
    'templates/apidoc/locales/nl.js',
    'templates/apidoc/locales/pl.js',
    'templates/apidoc/locales/pt_br.js',
    'templates/apidoc/locales/ro.js',
    'templates/apidoc/locales/ru.js',
    'templates/apidoc/locales/tr.js',
    'templates/apidoc/locales/vi.js',
    'templates/apidoc/locales/zh.js',
    'templates/apidoc/locales/zh_cn.js'
], function() {
    var langId = (navigator.language || navigator.userLanguage).toLowerCase().replace('-', '_');
    var language = langId.substr(0, 2);
    var locales = {};

    for (index in arguments) {
        for (property in arguments[index])
            locales[property] = arguments[index][property];
    }
    if ( ! locales['en'])
        locales['en'] = {};

    if ( ! locales[langId] && ! locales[language])
        language = 'en';

    var locale = (locales[langId] ? locales[langId] : locales[language]);

    function __(text) {
        var index = locale[text];
        if (index === undefined)
            return text;
        return index;
    };

    function setLanguage(language) {
        locale = locales[language];
    }

    return {
        __         : __,
        locales    : locales,
        locale     : locale,
        setLanguage: setLanguage
    };
});
