// Contains Grunt tasks related to building translatable assets.
module.exports = function(grunt) {
  var path = require('path');
  var MessageFormat = require('messageformat');

  grunt.registerMultiTask('build-i18n', 'Compile i18n strings!', function() {
    this.files.forEach(function(file) {
      file.src.forEach(function(src) {
        var locale = path.basename(src, '.json').toLowerCase();
        var englishData = grunt.file.readJSON(src.replace(locale, 'en_us'));
        var localeData = grunt.file.readJSON(src);
        // Remove any strings which are empty
        Object.keys(localeData).forEach(function(key) {
          if (localeData[key] === '') {
            delete localeData[key];
          }
        });
        // Fill in missing strings with the English strings
        var finalData = Object.assign(englishData, localeData);
        try {
          // Compile the MessageFormat JSON into usable Javascript
          var formatted = process(locale, finalData);
          grunt.file.write(file.dest, formatted);
        } catch (e) {
          var errorMsg = `Error processing localization file ${src}: ${e}`;
          if (grunt.option('force')) {
            grunt.log.warn(errorMsg);
          } else {
            throw new Error(errorMsg);
          }
        }
      });
    });
  });

  // Compiles the MessageFormat JSON into a usable Javascript object.
  // A locale's i18n string are accessible through the `window.locales` objects.
  // For example, to access the English 'hello': `window.locales.en_us.hello()`
  function process(locale, json) {
    var mf;
    try {
      mf = new MessageFormat(locale);
    } catch (e) {
      // Fallback to English if the given locale is not found
      grunt.warn(`MessageFormat can't handle the ${locale} locale. Defaulting to en_us instead.`)
      if (locale !== 'en_us') {
        return process('en_us', json);
      } else {
        throw e;
      }
    }

    return (
      mf
        .compile(json)
        .toString('(window.locales = window.locales || {}).' + locale) + ';'
    );
  }
};
