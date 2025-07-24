'use strict';

angular.module('Soar.Patient').controller('ToothQuadrantController', [
  '$scope',
  'ListHelper',
  'StaticData',
  function ($scope, listHelper, staticData) {
    var ctrl = this;
    $scope.allQuadrant = [
      { Desc: 'UL', Selected: false, Id: 1 },
      { Desc: 'UR', Selected: false, Id: 2 },
      { Desc: 'LR', Selected: false, Id: 3 },
      { Desc: 'LL', Selected: false, Id: 4 },
    ];
    ctrl.alreadySelected = [];
    $scope.selectedTeethChanged = true;
    $scope.showTeethDetail = false;

    $scope.activeTooth = {};
    $scope.dataForTeeth = {
      activeTooth: $scope.activeTooth,
      multiselectEnabled: false,
      showTeethDetail: $scope.showTeethDetail,
      quadrantSelectionOnly: $scope.quadrantSelectionOnly,
    };

    $scope.setSelected = function () {
      $scope.showTeethDetail = !$scope.showTeethDetail;
      if ($scope.showTeethDetail) {
        $scope.selectedTeethChanged = true;
        ctrl.scopeInitilize();
      }
    };

    $scope.closeSelected = function () {
      $scope.showTeethDetail = false;
    };

    $scope.selectQuadrant = function (quadrant) {
      angular.forEach($scope.allQuadrant, function (existingQuadrant) {
        if (existingQuadrant.Id == quadrant.Id) {
          if (quadrant.Selected) {
            quadrant.Selected = false;
            $scope.selectedTeeth = '';
          } else {
            quadrant.Selected = true;
            $scope.selectedTeeth = quadrant.Desc;
          }
        } else {
          existingQuadrant.Selected = false;
        }
      });
    };
    ctrl.getTeethDefinitions = function () {
      staticData.TeethDefinitions().then(function (res) {
        if (res && res.Value && res.Value.Teeth) {
          $scope.allTeeth = res.Value.Teeth;
        }
        ctrl.scopeInitilize();
      });
    };
    ctrl.scopeInitilize = function () {
      if (!$scope.quadrantSelectionOnly) {
        var actualteeth = [];
        if ($scope.selectedTeeth) {
          var item = listHelper.findItemByFieldValue(
            $scope.allTeeth,
            'USNumber',
            $scope.selectedTeeth
          );
          if (item) {
            if (
              !listHelper.findItemByFieldValue(
                actualteeth,
                'ToothId',
                item.ToothId
              )
            ) {
              item.Selected = true;
              actualteeth.push(item);
            }
          }
        }
        $scope.dataForTeeth.selectedTeeth = actualteeth;
      } else {
        angular.forEach($scope.allQuadrant, function (quadrant) {
          if ($scope.selectedTeeth && quadrant.Desc == $scope.selectedTeeth) {
            quadrant.Selected = true;
          } else {
            quadrant.Selected = false;
          }
        });
      }
    };

    $scope.$on('selectedTeeth-modified', function (event, nv) {
      if (nv && nv.length > 0) {
        if (!$scope.quadrantSelectionOnly) {
          ctrl.alreadySelected = nv;
          var item = listHelper.findItemByFieldValue(
            $scope.allTeeth,
            'ToothId',
            nv[0].ToothId
          );
          if (item) $scope.selectedTeeth = item.USNumber;
        }
      }
    });

    // Function to handle cancel button click event
    $scope.cancelModal = function () {
      //Display cancel modal depending upon whether data has changed or not
      // $uibModalInstance.close();
    };

    $scope.$watch(
      'selectedTeeth',
      function (nv, ov) {
        if (!$scope.quadrantSelectionOnly) {
          $scope.selectedTeethChanged = true;

          // If tooth selection is changed, re-initialize data for selected teeth
          ctrl.scopeInitilize();
          if (nv != ov && nv != null && nv.length > 0) {
            $scope.selectedTeethChanged = true;
          }
        }
      },
      true
    );

    //// waiting for pre-selected teeth
    $scope.$watch(
      'selectedQuadrant',
      function (nv, ov) {
        $scope.selectedTeethChanged = true;
        if (nv != ov && nv != null && nv.length > 0) {
          $scope.selectedTeethChanged = true;
        }
      },
      true
    );

    // everything that needs to happen when the controller is instantiated
    ctrl.init = function () {
      $scope.selectedToothStructure = 'Permanent';
      ctrl.getTeethDefinitions();
    };

    //// activating pre-selected teeth on load
    ctrl.activatePreselectedTeeth = function (selectedTeeth) {
      if ($scope.allTeeth) {
        angular.forEach(selectedTeeth, function (tooth) {
          var item = listHelper.findItemByFieldValue(
            $scope.allTeeth,
            'ToothId',
            tooth.ToothId
          );
          if (item) {
            item.Selected = true;
          }
        });
      }
    };

    // initializer function call
    ctrl.init();
  },
]);
