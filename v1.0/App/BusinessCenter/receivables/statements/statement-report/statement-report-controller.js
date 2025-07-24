'use strict';
angular.module('Soar.BusinessCenter').controller('StatementReportController', [
  '$rootScope',
  '$scope',
  '$routeParams',
  'localize',
  'BatchStatementService',
  'toastrFactory',
  'LocationServices',
  function (
    $rootScope,
    $scope,
    $routeParams,
    localize,
    batchStatementService,
    toastrFactory,
    locationServices
  ) {
    var ctrl = this;
    $scope.reports = [];
    $scope.init = function () {
      angular.element('body').addClass('statementReport');
      batchStatementService.Service.getReport(
        { batchStatementId: $routeParams.batchStatementId },
        ctrl.getReportSuccess,
        ctrl.getReportFailure
      );
      locationServices.get({}, ctrl.getLocationsSuccess);
    };

    ctrl.getReportSuccess = function (res) {
      $scope.reports = res.Value;
      locationServices.get({}, ctrl.getLocationsSuccess);
    };

    ctrl.getLocationsSuccess = function (res) {
      angular.forEach($scope.reports, function (report) {
        var ofcLocation = _.find(res.Value, function (loc) {
          return loc.LocationId === report.LocationId;
        });
        if (ofcLocation) {
          report.LocationName = ofcLocation.NameLine1;
        }
      });
    };

    ctrl.getReportFailure = function () {
      toastrFactory.error(
        localize.getLocalizedString('Failed to {0}', ['Retrieve eStatement']),
        'Error'
      );
    };

    $scope.init();
  },
]);
