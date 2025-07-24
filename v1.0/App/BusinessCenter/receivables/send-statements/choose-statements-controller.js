'use strict';

angular.module('Soar.BusinessCenter').controller('ChooseStatementsController', [
  '$scope',
  'toastrFactory',
  'localize',
  'ListHelper',
  '$filter',
  '$location',
  function ($scope, toastrFactory, localize, listHelper, $filter, $location) {
    //breadcrumbs
    /*        
            $scope.dataForCrudOperation = {};
            $scope.dataForCrudOperation.DataHasChanged = false;
            $scope.dataForCrudOperation.BreadCrumbs = [
                {
                    name: localize.getLocalizedString('Receivables'),
                    path: '/Receivables path here/'
                },
                 {
                     name: localize.getLocalizedString('Choose Statements'),
                     path: '/Choose Statements Path here/'
                 },
            ];
    
            // handle URL update for breadcrumbs
            $scope.changePageState = function (breadcrumb) {
                ctrl.currentBreadcrumb = breadcrumb;
                if ($scope.dataForCrudOperation.DataHasChanged && $scope.dataForCrudOperation.BreadCrumbs.length > 2) {
                    modalFactory.CancelModal().then(ctrl.changePath);
                } else {
                    ctrl.changePath();
                }
    
            }
    
        */

    $scope.stmntDueDate = {
      value: '',
      labels: ['Due Upon Receipt', 'Custom Date:'],
      options: [0, 1],
    };
    $scope.stmntFinanceCharge = {
      value: '',
      labels: ['Default', 'Custom:'],
      options: [0, 1],
    };
    $scope.stmntDetail = {
      value: '',
      labels: ['Since Last Statement', 'Custom:'],
      options: [0, 1],
    };
  },
]);
