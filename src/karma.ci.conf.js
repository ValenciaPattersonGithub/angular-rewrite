// Karma configuration file, see link for more information
// https://karma-runner.github.io/1.0/config/configuration-file.html

module.exports = function (config) {
    config.set({
        basePath: '',
        frameworks: ['jasmine', '@angular-devkit/build-angular'],
        plugins: [
            require('karma-jasmine'),
            require('karma-chrome-launcher'),
            require('karma-brief-reporter'),
            require('karma-coverage'),
            require('@angular-devkit/build-angular/plugins/karma')
        ],
        client: {
            captureConsole: false // leave Jasmine Spec Runner output visible in browser
        },
        proxies: {
            '/src/assets/': '/assets/',
        },
        coverageReporter: {
            reports: ['text-summary'],
            fixWebpackSourcePaths: true
        },
        briefReporter: {
            suppressBrowserLogs: true,
            suppressErrorHighlighting: true,
            renderOnRunCompleteOnly: true
        },
        reporters: ['brief'],
        port: 9876,
        colors: true,
        logLevel: config.LOG_DISABLE,
        autoWatch: false,
        browsers: ['ChromeHeadless'],
        singleRun: true,
        files: [
            '../v1.0/Scripts/lodash.min.js'
        ],
        browserNoActivityTimeout: 120000,
        browserDisconnectTimeout: 20000,
        browserDisconnectTolerance: 3
    });
};
