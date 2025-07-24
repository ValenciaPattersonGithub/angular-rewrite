'use strict';

angular
  .module('Soar.Patient')
  .controller('SupernumeraryToothSelectorController', [
    '$rootScope',
    '$scope',
    'StaticData',
    '$filter',
    'PatientOdontogramFactory',
    '$routeParams',
    'ListHelper',
    '$uibModalInstance',
    'localize',
    function (
      $rootScope,
      $scope,
      staticData,
      $filter,
      patientOdontogramFactory,
      $routeParams,
      listHelper,
      $uibModalInstance,
      localize
    ) {
      var ctrl = this;

      ctrl.$onInit = function () {
        $scope.hasChanges = false;
        ctrl.getSupernumeraryTeeth();
      };

      //#region helpers

      // used to disable selection of supernumerary teeth that are already charted and selection for primary teeth if they aren't in the chart
      ctrl.setSelected = function () {
        $scope.chartedPrimaryTeeth = [];
        patientOdontogramFactory.access();
        patientOdontogramFactory
          .getMouthStatus($routeParams.patientId)
          .then(function (res) {
            if (res && res.Value) {
              var chartedTeeth = patientOdontogramFactory.getChartedTeeth(
                res.Value
              );
              angular.forEach(chartedTeeth, function (tooth) {
                // parse tooth information
                var toothArray = tooth.split(',');

                var tooth = toothArray[0];
                var index = listHelper.findIndexByFieldValue(
                  $scope.supernumeraryTeeth,
                  'USNumber',
                  tooth
                );
                if (index !== -1) {
                  // highlight any supernumerarys
                  $scope.supernumeraryTeeth[index].Selected = true;
                  $scope.supernumeraryTeeth[index].$$Prompt = '';

                  // If there are any completed services, disable and warn the user that the supernumerary tooth cannot be deleted
                  // If there are any conditions on supernumerary tooth, disable and warn the user that it cannot be deleted
                  // If there are any proposed/pending services disable and warn the user that they must first remove any proposed or pending services before deleting
                  // disable supernumerarys that have conditions or completed services
                  if (
                    toothArray.indexOf('NotRemovable') !== -1 ||
                    toothArray.indexOf('Missing') !== -1 ||
                    toothArray.indexOf('Implant') !== -1
                  ) {
                    $scope.supernumeraryTeeth[index].$$Disable = true;
                    $scope.supernumeraryTeeth[index].$$Prompt =
                      localize.getLocalizedString(
                        'Supernumerary teeth with completed services or conditions cannot be deleted.'
                      );
                  }

                  // disable supernumerarys that proposed or pending services
                  if (toothArray.indexOf('NotRemovablePropPend') !== -1) {
                    $scope.supernumeraryTeeth[index].$$Disable = true;
                    $scope.supernumeraryTeeth[index].$$Prompt =
                      localize.getLocalizedString(
                        'You must first remove any proposed or pending services before removing a supernumerary tooth.'
                      );
                  }
                  // also disabling their equivalent perm/prim
                  var desc;
                  if (
                    $scope.supernumeraryTeeth[index].ToothStructure ===
                    'Permanent'
                  ) {
                    desc = $scope.supernumeraryTeeth[index].Description.replace(
                      'Permanent',
                      'Primary'
                    );
                  } else if (
                    $scope.supernumeraryTeeth[index].ToothStructure ===
                    'Primary'
                  ) {
                    desc = $scope.supernumeraryTeeth[index].Description.replace(
                      'Primary',
                      'Permanent'
                    );
                  }
                  var otherToothToDisable = listHelper.findItemByFieldValue(
                    $scope.supernumeraryTeeth,
                    'Description',
                    desc
                  );
                  if (otherToothToDisable) {
                    otherToothToDisable.$$Disable = true;
                  }
                }
                if (isNaN(parseInt(tooth)) && tooth.length === 1) {
                  // only enabling primary supernumerary selection if they are in the chart
                  $scope.chartedPrimaryTeeth.push(tooth + 'S');
                }
              });
            }
          });
      };

      // getting the teeth list from the factory and creating a list of supernumerary teeth
      ctrl.getSupernumeraryTeeth = function () {
        $scope.supernumeraryTeeth = [];
        staticData.TeethDefinitions().then(function (res) {
          if (res && res.Value && res.Value.Teeth) {
            angular.forEach(res.Value.Teeth, function (tooth) {
              if (
                tooth.USNumber > 32 ||
                (isNaN(parseInt(tooth.USNumber)) && tooth.USNumber.length > 1)
              ) {
                tooth.$$Disable = false;
                tooth.$$Modified = false;
                $scope.supernumeraryTeeth.push(tooth);
              }
            });
            ctrl.setSelected();
          }
        });
      };

      // clearing all selected teeth
      ctrl.clearSelectedTeeth = function () {
        angular.forEach($scope.supernumeraryTeeth, function (tooth) {
          tooth.Selected = false;
        });
      };

      $scope.setToothState = function (tooth) {
        tooth.Selected = tooth.Selected ? false : true;
        tooth.$$Modified = true;
      };

      //#endregion

      //#region view

      // this will kick off adding any selected or deselected supernumerary teeth to the odontogram
      $scope.save = function () {
        $rootScope.$broadcast(
          'soar:odo-supernumerary-update',
          $filter('filter')($scope.supernumeraryTeeth, { $$Modified: true })
        );
        ctrl.clearSelectedTeeth();
        $uibModalInstance.close();
      };

      // cancel button handler
      $scope.cancel = function () {
        ctrl.clearSelectedTeeth();
        $uibModalInstance.close();
      };

      //#endregion

      //#region watches

      // used to enable/disable add tooth button
      $scope.$watch(
        'supernumeraryTeeth',
        function (nv, ov) {
          if (nv) {
            $scope.hasChanges =
              $filter('filter')(nv, { $$Modified: true }).length > 0;
          }
        },
        true
      );

      //#endregion
    },
  ]);
