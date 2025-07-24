/* globals require:false, process:false */

var path = require('path');
var fs = require('fs');

function writeOutput(config, output, helper, logger) {
  var log = logger.create('fuse-reporter');

  if (config.outputFile) {
    helper.mkdirIfNotExists(path.dirname(config.outputFile), function () {
      if (config.isSynchronous) {
        log.debug('Writing test results to JSON file ' + config.outputFile);
        try {
          fs.writeFileSync(config.outputFile, JSON.stringify(output, null, 4));
        } catch (err) {
          log.warn('Cannot write test results to JSON file\n\t' + err.message);
        }
      } else {
        fs.writeFile(
          config.outputFile,
          JSON.stringify(output, null, 4),
          function (err) {
            if (err) {
              log.warn(
                'Cannot write test results to JSON file\n\t' + err.message
              );
            } else {
              log.debug(
                'Test results were written to JSON file ' + config.outputFile
              );
            }
          }
        );
      }
    });
  } else {
    process.stdout.write(JSON.stringify(output));
  }
}

var FuseReporter = function (
  baseReporterDecorator,
  formatError,
  config,
  helper,
  logger
) {
  var self = this;

  baseReporterDecorator(self);

  var logMessageFormater = function (error) {
    return formatError(error);
  };

  function getBrowser(browser) {
    var b = self.browsers[browser.id];

    if (b) {
      return b;
    }

    var newRecord = {
      browser: browser,
      errors: [],
      results: [],
    };

    self.browsers[browser.id] = newRecord;

    return newRecord;
  }

  self.clear = function () {
    self.browsers = {};
  };

  self.onBrowserError = function (browser, error) {
    getBrowser(browser).errors.push(error);
  };

  self.onSpecComplete = function (browser, result) {
    // convert newlines into array and flatten
    result.log = [].concat.apply(
      [],
      result.log.map(function (message) {
        return message.split('\n');
      })
    );
    getBrowser(browser).results.push(result);
  };

  self.onRunComplete = function (browsers, summary) {
    var browserResults = [];

    for (var browserId in self.browsers) {
      var browser = self.browsers[browserId];

      browser.errors = browser.errors.map(logMessageFormater);

      browserResults.push(browser);
    }

    var output = {
      summary: summary,
      browsers: browserResults,
    };

    writeOutput(config, output, helper, logger);

    self.clear();
  };

  self.clear();
};

FuseReporter.$inject = [
  'baseReporterDecorator',
  'formatError',
  'config.fuseReporter',
  'helper',
  'logger',
];

module.exports = {
  'reporter:fuse': ['type', FuseReporter],
};
