// Karma configuration file, see link for more information
// https://karma-runner.github.io/1.0/config/configuration-file.html

module.exports = function (config) {
    config.set({
        basePath: '',
        frameworks: ['jasmine', '@angular-devkit/build-angular'],
        plugins: [
            require('karma-jasmine'),
            require('karma-chrome-launcher'),
            require('karma-coverage'),
            require('karma-html-reporter'),
            require('@angular-devkit/build-angular/plugins/karma'),
            require('../v1.0/App/Test/fuse-reporter')
        ],
        client: {
            captureConsole: false // leave Jasmine Spec Runner output visible in browser
        },
        coverageReporter: {
            dir: 'v1.0/App/Test/reports/coverage',
            reports: ['html', 'text-summary', 'json', 'json-summary'],
            'report-config': {
                'html': { subdir: 'angular' },
                'json': { subdir: '.', file: 'angular-coverage.json' },
                'json-summary': { dir: 'v1.0/App/Test/reports/coverage', subdir: '.', file: 'angular-coverage-summary.json' }
            },
            fixWebpackSourcePaths: true
        },
        reporters: ['progress', 'html', 'coverage', 'fuse'],
        port: 9876,
        colors: true,
        logLevel: config.LOG_DISABLE,
        autoWatch: false,
        browsers: ['ChromeHeadless'],
        singleRun: true,
        htmlReporter: {
            namedFiles: true,
            reportName: 'angular',
            outputDir: 'v1.0/App/Test/reports/html'
        },
        fuseReporter: {
            outputFile: 'v1.0/App/Test/reports/json/angular.json'
        },
        files: [
            '../v1.0/Scripts/lodash.min.js'
        ]
    });
};
