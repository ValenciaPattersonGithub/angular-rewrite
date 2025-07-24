// Karma configuration
// Generated on Fri Apr 25 2014 15:48:00 GMT-0500 (Central Daylight Time)

/* global require:false, process:false */
const puppeteer = require('puppeteer');
process.env.CHROME_BIN = puppeteer.executablePath();

module.exports = function (config) {
  config.set({
    // base path that will be used to resolve all patterns (eg. files, exclude)
    basePath: '',

    // frameworks to use
    // available frameworks: https://npmjs.org/browse/keyword/karma-adapter
    frameworks: ['jasmine'],

    // list of files / patterns to load in the browser
    files: [
      '../../Scripts/jquery-2.1.0.min.js',
      '../../Scripts/angular.min.js',
      '../../Scripts/angular-mocks.js',
      '../../Scripts/angular-route.min.js',
      '../../Scripts/angular-resource.min.js',
      '../../Scripts/angular-animate.min.js',
      '../../Scripts/angular-cookies.min.js',
      '../../Scripts/angular-sanitize.min.js',
      '../../Scripts/chosen.js',
      '../../Scripts/angular-gridster/angular-gridster.min.js',
      '../../Scripts/lodash.min.js',
      '../../Scripts/moment.min.js',
      '../../Scripts/moment-timezone-with-data-2000-2035.min.js',
      '../../Scripts/toastr.min.js',
      '../../Scripts/angular-ui/ui-bootstrap.min.js',
      '../../Scripts/angular-ui/ui-bootstrap-tpls.min.js',
      '../../Scripts/ui-utils.js',
      '../../Scripts/kendo.all.min.js',
      '../../Scripts/angular-infinite-scroll.min.js',
      '../../Scripts/select.min.js',
      '../../../enterprisecore/core-shell.js',
      'testHelper.js',
      '../Common/angular/angular-modules.js',
      '../Common/angular/**/*.js',
      '../Common/**/*.js',
      '../Dashboard/dashboard.js',
      '../Dashboard/**/*.js',
      '../Help/help.js',
      '../Help/**/*.js',
      '../Patient/patient.js',
      '../Patient/**/*.js',
      '../PatShared/patShared.js',
      '../PatShared/**/*.js',
      '../BusinessCenter/businessCenter.js',
      '../BusinessCenter/**/*.js',
      '../Schedule/schedule.js',
      '../Schedule/**/*.js',
      '../Widget/widget-module.js',
      '../Widget/**/*.js',
      '../app.js',
      '../!(Test)/**/*.html',
    ],

    // list of files to exclude
    exclude: [],

    // preprocess matching files before serving them to the browser
    // available preprocessors: https://npmjs.org/browse/keyword/karma-preprocessor
    preprocessors: {},

    // test results reporter to use
    // possible values: 'dots', 'progress'
    // available reporters: https://npmjs.org/browse/keyword/karma-reporter
    reporters: ['brief', 'coverage'],

    // web server port
    port: 9876,

    // enable / disable colors in the output (reporters and logs)
    colors: true,

    // level of logging
    // possible values: config.LOG_DISABLE || config.LOG_ERROR || config.LOG_WARN || config.LOG_INFO || config.LOG_DEBUG
    logLevel: config.LOG_DISABLE,

    // enable / disable watching file and executing tests whenever any file changes
    autoWatch: false,

    // start these browsers
    // available browser launchers: https://npmjs.org/browse/keyword/karma-launcher
    browsers: ['ChromeHeadless'],

    // Continuous Integration mode
    // if true, Karma captures browsers, runs the tests and exits
    singleRun: true,

    plugins: [
      'karma-chrome-launcher',
      'karma-jasmine',
      'karma-ng-html2js-preprocessor',
      'karma-brief-reporter',
      'karma-coverage',
    ],

    ngHtml2JsPreprocessor: {
      cacheIdFromPath: function (filepath) {
        return filepath.split('Soar.UI/v1.0/')[1];
      },
      moduleName: 'soar.templates',
    },
    // this may be needed to prevent timeouts?
    browserNoActivityTimeout: 120000,

    client: {
      captureConsole: false,
    },

    briefReporter: {
      suppressBrowserLogs: true,
      suppressErrorHighlighting: true,
      renderOnRunCompleteOnly: true,
    },

    coverageReporter: {
      // specify a common output directory
      type: 'text-summary',
    },
  });
};
