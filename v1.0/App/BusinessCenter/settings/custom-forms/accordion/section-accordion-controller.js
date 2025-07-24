'use strict';

angular.module('common.controllers').controller('SectionsAccordionController', [
  '$scope',
  function ($scope) {
    $scope.panes = [];
    $scope.inputIsDisabled = true;
    /****************angularaccordion specific functions start************************/

    this.expandPane = $scope.expandPane = function (paneToExpand) {
      angular.forEach($scope.panes, function (iteratedPane) {
        if (paneToExpand !== iteratedPane) {
          iteratedPane.expanded = false;
        }
      });
    };

    this.addPane = $scope.addPane = function (pane) {
      $scope.panes.push(pane);
    };

    /****************angularaccordion specific functions end************************/
  },
]);
