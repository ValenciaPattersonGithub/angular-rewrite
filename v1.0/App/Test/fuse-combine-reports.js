/* globals require:false */

var path = require('path');

module.exports = function (grunt) {
  var options = grunt.config(['fuseCombineReports']) || {};
  var saveReport = options.saveReport === 'true';

  var baseDir = 'v1.0/App/Test/reports/';
  var jsonDir = 'json/';
  var coverageDir = 'coverage/';
  var outputDir = 'summary/';

  // combine json files into single file for test results
  var jsonFiles = grunt.file.expand(`${baseDir}${jsonDir}*.json`);

  // accumulate summary info and include in test results
  var totals = { success: 0, failed: 0 };
  var report = { suites: {} };
  var angularTotals;
  jsonFiles.forEach(file => {
    var suiteResults = grunt.file.readJSON(file);
    var summary = suiteResults.summary;
    totals.success += summary.success;
    totals.failed += summary.failed;
    summary.total = summary.success + summary.failed;
    summary.percentage = (summary.success / summary.total) * 100;

    var suiteName = path.basename(file).replace('.json', '');

    var suiteCoverage = grunt.file.readJSON(
      `${baseDir}${coverageDir}${suiteName}-coverage-summary.json`
    );
    summary.coverage = suiteCoverage.total.statements;

    report.suites[suiteName] = summary;

    if (suiteName === 'angular') angularTotals = summary.coverage.total;
  });

  totals.total = totals.success + totals.failed;
  totals.percentage = (totals.success / totals.total) * 100;

  var totalCoverage = grunt.file.readJSON(
    `${baseDir}${outputDir}coverage.json`
  );
  totals.coverage = totalCoverage.total.statements;
  totals.migration = (angularTotals / totals.coverage.total) * 100;

  report.totals = totals;

  report.timestamp = grunt.template.today('isoDateTime');

  // write test results to file
  var reportStrFormatted = JSON.stringify(report, null, 4);
  var reportStr = JSON.stringify(report);
  var html = htmlTemplate.replace(
    '$$results',
    `window.testResults = ${reportStr};`
  );

  var previous = '';
  if (grunt.file.exists(`${baseDir}${outputDir}summary-saved.json`)) {
    var previousResults = grunt.file.readJSON(
      `${baseDir}${outputDir}summary-saved.json`
    );
    previous = `window.previousResults = ${JSON.stringify(previousResults)};`;
  }
  html = html.replace('$$comparePrevious', previous);
  grunt.file.write(`${baseDir}${outputDir}summary.json`, reportStrFormatted);
  grunt.file.write(`${baseDir}${outputDir}summary.html`, html);

  if (saveReport) {
    grunt.file.write(
      `${baseDir}${outputDir}summary-saved.json`,
      reportStrFormatted
    );
  }
};

var htmlTemplate = `<!DOCTYPE html>
<html lang="en" xmlns="http://www.w3.org/1999/xhtml" ng-app="Fuse.UnitTestReport">
<head>
    <meta charset="utf-8" />
    <title>Fuse Unit Test Report</title>
    <link href="https://stackpath.bootstrapcdn.com/bootstrap/4.1.3/css/bootstrap.min.css" rel="stylesheet" integrity="sha384-MCw98/SFnGE8fJT3GXwEOngsV7Zt27NXFoaoApmYm81iuXoPkFOJwJ8ERdknLPMO" crossorigin="anonymous" />
    <script src="https://code.jquery.com/jquery-1.9.1.min.js"></script>
    <script src="https://stackpath.bootstrapcdn.com/bootstrap/4.1.3/js/bootstrap.min.js" integrity="sha384-ChfqqxuZUCnJSK3+MXmPNIyE6ZbWh2IMqE241rYiqJxyMiZ6OW/JmZQ5stwEULTy" crossorigin="anonymous"></script>
    <script src="https://code.angularjs.org/1.7.5/angular.min.js"></script>
    <script src="https://code.angularjs.org/1.7.5/angular-route.min.js"></script>
    <style>
        .suite-card {
            cursor: pointer;
            width: 18rem;
        }
        .suite-card:hover .card-body {
            background-color: lightgray !important;
        }
        .suite-link {
            cursor: pointer;
        }
        .border-critical {
            border-color: black;
        }
        .bg-critical {
            background-color: black;
        }
        .text-critical {
            color: #dc3545;
        }
    </style>
</head>
<body>
    <nav class="navbar navbar-dark bg-dark">
        <a class="navbar-brand" href="#">Fuse UI Unit Test Report</a>
        <div ng-controller="ResultDateController as $ctrl">
            <span class="navbar-text">Results from {{ $ctrl.current | date:'shortDate' }}</span>
            <span class="navbar-text" ng-if="$ctrl.previous"> (relative to {{ $ctrl.previous | date:'shortDate' }})</span>
        </ul>
    </nav>
    <div ng-view class="mx-2 mt-2"></div>
</body>
<script type="text/ng-template" id="coverage-text.html">
    <span ng-class="$ctrl.classOverride">Coverage: </span>
    <span ng-class="$ctrl.textClass">{{$ctrl.data.pct}}%</span>
    <diff diff="$ctrl.diff" diff-key="coverage" percentage="true" class-override="$ctrl.classOverride"></diff>
</script>
<script type="text/ng-template" id="diff.html">
    <small ng-if="$ctrl.diff" ng-class="$ctrl.class">{{$ctrl.text}}</small>
</script>
<script type="text/ng-template" id="results-text.html">
    <span ng-class="[$ctrl.textClass, $ctrl.bgClass]">{{$ctrl.data.success}}/{{$ctrl.data.total}}</span>
    <diff diff="$ctrl.data.diff" diff-key="failed" invert="true"></diff>
    <span> - </span>
    <span ng-class="[$ctrl.textClass, $ctrl.bgClass]">{{$ctrl.data.percentage | number:2}}%</span>
    <diff diff="$ctrl.data.diff" diff-key="percentage" percentage="true"></diff>
</script>
<script type="text/ng-template" id="suite.html">
    <div ng-controller="SuiteController">
        <h2>{{suiteName}}</h2>
        <suite-summary ng-if="data" data="data" show-test-results="showTestResults()" show-coverage="showCoverage()" link-to-results="true"></suite-summary>
        <div ng-if="mode == 'test'" class="embed-responsive embed-responsive-4by3">
            <iframe class="embed-responsive-item" ng-src="{{iframeTestSrc}}"></iframe>
        </div>
        <div ng-if="mode == 'coverage'" class="embed-responsive embed-responsive-4by3">
            <iframe class="embed-responsive-item" ng-src="{{iframeCoverageSrc}}"></iframe>
        </div>
    </div>
</script>
<script type="text/ng-template" id="suite-card.html">
    <div class="suite-card card ml-5 mb-5" ng-class="$ctrl.getClassesForResults()">
        <h5 class="card-header text-white">{{$ctrl.suite.name}}</h5>
        <div class="card-body bg-light">
            <results-text data="$ctrl.suite.data"></results-text>
        </div>
        <div class="card-footer" ng-class="$ctrl.getClassesForCoverage()">
            <coverage-text data="$ctrl.suite.data.coverage" diff="$ctrl.suite.data.diff" class-override="text-white"></coverage-text>
        </div>            
    </div>
</script>
<script type="text/ng-template" id="suite-summary.html">
    <h3 class="ml-5" ng-click="$ctrl.showTestResults()"><results-text ng-class="$ctrl.linkToResults === true ? 'suite-link' : ''" data="$ctrl.data"></results-text></h3>
    <h5 class="ml-5" ng-click="$ctrl.showCoverage()"><coverage-text class="suite-link" data="$ctrl.data.coverage" diff="$ctrl.data.diff"></coverage-text></h5>
</script>
<script type="text/ng-template" id="totals.html">
    <div ng-controller="TotalsController">
        <h2>Summary</h2>
        <suite-summary ng-if="data" data="data.totals" show-coverage="showCoverage()"></suite-summary>
        <h5 class="ml-5">Code Migrated: {{ data.totals.migration | number:2 }}% <diff diff="data.totals.diff" diff-key="migration" percentage="true"></diff></h5>
        <div class="mt-5">
            <h2>Suites</h2>
            <div class="d-flex flex-wrap">
                <suite-card ng-repeat="suite in data.suites | orderBy:name" ng-click="goToSuite(suite.name)" suite="suite"></suite-card>
            </div>
        </div>
    </div>
</script>
<script>
angular.module('Fuse.UnitTestReport', ['ngRoute'])
    .config(function ($locationProvider, $routeProvider) {
        $locationProvider.hashPrefix('');
        $routeProvider
            .when('/', {
                templateUrl: 'totals.html'
            })
            .when('/suite/:suiteName', {
                templateUrl: 'suite.html'
            })
            .otherwise('/');
    })
    .controller('TotalsController', ['$scope', '$location', '$window', 'DataService', function ($scope, $location, $window, dataService) {
        dataService.get().then(res => $scope.data = res);
        $scope.goToSuite = function (suiteName) {
            $location.path(\`/suite/\${suiteName}\`);
        };
        $scope.showCoverage = function () {
            $window.open('coverage/index.html');
        };
    }])
    .controller('SuiteController', ['$routeParams', '$scope', 'DataService', function ($routeParams, $scope, dataService) {
        $scope.suiteName = $routeParams.suiteName;
        dataService.get().then(res => {
            if (res && res.suites) {
                var suiteData = res.suites.find(suite => suite.name === $scope.suiteName);
                if (suiteData)
                    $scope.data = suiteData.data;
            }
        });
        $scope.showTestResults = function () {
            $scope.mode = 'test';
        };
        $scope.showCoverage = function () {
            $scope.mode = 'coverage';
        };
        $scope.iframeTestSrc = \`../html/\${$scope.suiteName}.html\`;
        $scope.iframeCoverageSrc = \`../coverage/\${$scope.suiteName}/index.html\`;
    }])
    .controller('ResultDateController', ['DataService', function (dataService) {
        dataService.get().then(res => {
            if (res && res.timestamps) {
                this.current = res.timestamps.current;
                if (res.timestamps.previous) {
                    this.previous = res.timestamps.previous;
                }
            }
        })
    }])
    .component('suiteCard', {
        templateUrl: 'suite-card.html',
        bindings: { suite: '<' },
        controller: ['ClassModifierService', function (classModifierService) {
            this.getClassesForResults = function () {
                var percentage = this.suite.data.percentage;
                var modifier = classModifierService.getResultsModifier(percentage);
                return \`border-\${modifier} bg-\${modifier}\`;
            };
            this.getClassesForCoverage = function () {
                var percentage = this.suite.data.coverage.pct;
                var modifier = classModifierService.getCoverageModifier(percentage);
                return \`bg-\${modifier}\`;
            };
        }]
    })
    .component('suiteSummary', {
        templateUrl: 'suite-summary.html',
        bindings: { data: '<', showCoverage: '&', showTestResults: '&', linkToResults: '<' },
    })
    .component('resultsText', {
        templateUrl: 'results-text.html',
        bindings: { data: '<' },
        controller: ['ClassModifierService', function (classModifierService) {
            this.$onInit = function () {
                var modifier = classModifierService.getResultsModifier(this.data.percentage);
                this.textClass = \`text-\${modifier}\`;
                if (modifier === 'critical')
                    this.bgClass = \`bg-\${modifier}\`;
            };
        }]
    })
    .component('coverageText', {
        templateUrl: 'coverage-text.html',
        bindings: { data: '<', diff: '<', classOverride: '@' },
        controller: ['ClassModifierService', function (classModifierService) {
            this.$onInit = function () {
                if (!this.classOverride || this.classOverride.length === 0) {
                    var modifier = classModifierService.getCoverageModifier(this.data.pct);
                    this.textClass = \`text-\${modifier}\`;
                } else {
                    this.textClass = this.classOverride;
                }
            };
        }]
    })
    .component('diff', {
        templateUrl: 'diff.html',
        bindings: { diff: '<', diffKey: '@', percentage: '@', classOverride: '<', invert: '@' },
        controller: ['$filter', function ($filter) {
            this.$onInit = function () {
                if (this.diff) {
                    var diffValue = this.diff[this.diffKey];
                    if (this.invert === 'true')
                        diffValue = -diffValue;
                    if (!this.classOverride || this.classOverride.length === 0) {
                        var modifier = diffValue >= 0 ? 'success' : 'danger';
                        this.class = \`text-\${modifier}\`;
                    } else {
                        this.class = this.classOverride;
                    }
                    var displayValue = diffValue;
                    if (this.percentage === 'true') {
                        displayValue = \`\${$filter('number')(diffValue, 2)}%\`;
                    }
                    this.text = \`(\${diffValue >= 0 ? '+' : ''}\${displayValue})\`;
                }
            };
        }]
    })
    .service('ClassModifierService', function () {
        var service = this;
        service.getResultsModifier = function (percentage) {
            return percentage >= 99 ? 'success' :
                percentage >= 95 ? 'warning' :
                    percentage >= 90 ? 'danger' : 'critical';
        }
        service.getCoverageModifier = function (percentage) {
            return percentage >= 50 ? 'success' :
                percentage >= 45 ? 'warning' : 'danger'
        };
        return service;
    })
    .service('DataService', ['$http', '$q', function ($http, $q) {        
        var service = this;
        var processResults = function (res) {
            var results = {};
            results.totals = res.results.totals;
            if (res.previous) {
                results.totals.diff = calculateDiff(results.totals, res.previous.totals);
            }
            results.suites = [];
            for (var suite in res.results.suites) {
                var suiteData = res.results.suites[suite];
                if (res.previous && res.previous.suites[suite]) {
                    var previousSuiteData = res.previous.suites[suite];
                    suiteData.diff = calculateDiff(suiteData, previousSuiteData);
                }
                results.suites.push({
                    name: suite,
                    data: suiteData
                });
            }
            results.timestamps = {
                current: res.results.timestamp
            };
            if (res.previous) {
                results.timestamps.previous = res.previous.timestamp;
            }
            return results;
        };
        var calculateDiff = function (results, previous) {
            if (results && previous) {
                var diff = {
                    success: results.success - previous.success,
                    percentage: results.percentage - previous.percentage,
                    failed: results.failed - previous.failed,
                    migration: results.migration - previous.migration
                };
                if (results.coverage && previous.coverage) {
                    diff.coverage = results.coverage.pct - previous.coverage.pct;
                }
                return diff;
            } else {
                return null;
            }
        }
        var deferred = $q.defer();
        var resultsDeferred = $q.defer();
        if (window.testResults) {
            resultsDeferred.resolve(window.testResults);
        } else {
            $http.get('summary.json').then(res => {
                resultsDeferred.resolve(res.data);
            });
        }
        var previousDeferred = $q.defer();
        if (window.previousResults) {
            previousDeferred.resolve(window.previousResults);
        } else {
            $http.get('summary-saved.json').then(res => {
                previousDeferred.resolve(res.data);
            }, () => previousDeferred.resolve(null));;
        }
        $q.all({ results: resultsDeferred.promise, previous: previousDeferred.promise }).then(results => {
            deferred.resolve(processResults(results));
        })
        service.get = function () {
            return deferred.promise;
        };
        return service;
    }]);
</script>
<script>
    $$results
    $$comparePrevious
</script>
</html>
`;
