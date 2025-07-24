'use strict';

angular.module('Soar.Patient').controller('ToothPickerController', [
  '$scope',
  'ListHelper',
  function ($scope, listHelper) {
    var ctrl = this;

    // tooth setup flags
    $scope.permanentActive = true;
    $scope.primaryActive = false;

    // vars used for active states of buttons
    $scope.ulActivePermanent = false;
    $scope.urActivePermanent = false;
    $scope.uActivePermanent = false;
    $scope.allActivePermanent = false;
    $scope.lActivePermanent = false;
    $scope.llActivePermanent = false;
    $scope.lrActivePermanent = false;
    $scope.noneActivePermanent = false;

    $scope.ulActivePrimary = false;
    $scope.urActivePrimary = false;
    $scope.uActivePrimary = false;
    $scope.allActivePrimary = false;
    $scope.lActivePrimary = false;
    $scope.llActivePrimary = false;
    $scope.lrActivePrimary = false;
    $scope.noneActivePrimary = false;

    // all teeth
    ctrl.getDefaultTeethObject = function () {
      return [
        {
          Half: 'U',
          Position: '1',
          IsPrimary: false,
          Quadrant: 'UR',
          Selected: false,
          Enabled: false,
        },
        {
          Half: 'U',
          Position: '2',
          IsPrimary: false,
          Quadrant: 'UR',
          Selected: false,
          Enabled: false,
        },
        {
          Half: 'U',
          Position: '3',
          IsPrimary: false,
          Quadrant: 'UR',
          Selected: false,
          Enabled: false,
        },
        {
          Half: 'U',
          Position: '4',
          IsPrimary: false,
          Quadrant: 'UR',
          Selected: false,
          Enabled: false,
        },
        {
          Half: 'U',
          Position: '5',
          IsPrimary: false,
          Quadrant: 'UR',
          Selected: false,
          Enabled: false,
        },
        {
          Half: 'U',
          Position: '6',
          IsPrimary: false,
          Quadrant: 'UR',
          Selected: false,
          Enabled: false,
        },
        {
          Half: 'U',
          Position: '7',
          IsPrimary: false,
          Quadrant: 'UR',
          Selected: false,
          Enabled: false,
        },
        {
          Half: 'U',
          Position: '8',
          IsPrimary: false,
          Quadrant: 'UR',
          Selected: false,
          Enabled: false,
        },
        {
          Half: 'U',
          Position: '9',
          IsPrimary: false,
          Quadrant: 'UL',
          Selected: false,
          Enabled: false,
        },
        {
          Half: 'U',
          Position: '10',
          IsPrimary: false,
          Quadrant: 'UL',
          Selected: false,
          Enabled: false,
        },
        {
          Half: 'U',
          Position: '11',
          IsPrimary: false,
          Quadrant: 'UL',
          Selected: false,
          Enabled: false,
        },
        {
          Half: 'U',
          Position: '12',
          IsPrimary: false,
          Quadrant: 'UL',
          Selected: false,
          Enabled: false,
        },
        {
          Half: 'U',
          Position: '13',
          IsPrimary: false,
          Quadrant: 'UL',
          Selected: false,
          Enabled: false,
        },
        {
          Half: 'U',
          Position: '14',
          IsPrimary: false,
          Quadrant: 'UL',
          Selected: false,
          Enabled: false,
        },
        {
          Half: 'U',
          Position: '15',
          IsPrimary: false,
          Quadrant: 'UL',
          Selected: false,
          Enabled: false,
        },
        {
          Half: 'U',
          Position: '16',
          IsPrimary: false,
          Quadrant: 'UL',
          Selected: false,
          Enabled: false,
        },
        {
          Half: 'L',
          Position: '17',
          IsPrimary: false,
          Quadrant: 'LL',
          Selected: false,
          Enabled: false,
        },
        {
          Half: 'L',
          Position: '18',
          IsPrimary: false,
          Quadrant: 'LL',
          Selected: false,
          Enabled: false,
        },
        {
          Half: 'L',
          Position: '19',
          IsPrimary: false,
          Quadrant: 'LL',
          Selected: false,
          Enabled: false,
        },
        {
          Half: 'L',
          Position: '20',
          IsPrimary: false,
          Quadrant: 'LL',
          Selected: false,
          Enabled: false,
        },
        {
          Half: 'L',
          Position: '21',
          IsPrimary: false,
          Quadrant: 'LL',
          Selected: false,
          Enabled: false,
        },
        {
          Half: 'L',
          Position: '22',
          IsPrimary: false,
          Quadrant: 'LL',
          Selected: false,
          Enabled: false,
        },
        {
          Half: 'L',
          Position: '23',
          IsPrimary: false,
          Quadrant: 'LL',
          Selected: false,
          Enabled: false,
        },
        {
          Half: 'L',
          Position: '24',
          IsPrimary: false,
          Quadrant: 'LL',
          Selected: false,
          Enabled: false,
        },
        {
          Half: 'L',
          Position: '25',
          IsPrimary: false,
          Quadrant: 'LR',
          Selected: false,
          Enabled: false,
        },
        {
          Half: 'L',
          Position: '26',
          IsPrimary: false,
          Quadrant: 'LR',
          Selected: false,
          Enabled: false,
        },
        {
          Half: 'L',
          Position: '27',
          IsPrimary: false,
          Quadrant: 'LR',
          Selected: false,
          Enabled: false,
        },
        {
          Half: 'L',
          Position: '28',
          IsPrimary: false,
          Quadrant: 'LR',
          Selected: false,
          Enabled: false,
        },
        {
          Half: 'L',
          Position: '29',
          IsPrimary: false,
          Quadrant: 'LR',
          Selected: false,
          Enabled: false,
        },
        {
          Half: 'L',
          Position: '30',
          IsPrimary: false,
          Quadrant: 'LR',
          Selected: false,
          Enabled: false,
        },
        {
          Half: 'L',
          Position: '31',
          IsPrimary: false,
          Quadrant: 'LR',
          Selected: false,
          Enabled: false,
        },
        {
          Half: 'L',
          Position: '32',
          IsPrimary: false,
          Quadrant: 'LR',
          Selected: false,
          Enabled: false,
        },
        {
          Half: 'U',
          Position: 'A',
          IsPrimary: true,
          Quadrant: 'UR',
          Selected: false,
          Enabled: false,
        },
        {
          Half: 'U',
          Position: 'B',
          IsPrimary: true,
          Quadrant: 'UR',
          Selected: false,
          Enabled: false,
        },
        {
          Half: 'U',
          Position: 'C',
          IsPrimary: true,
          Quadrant: 'UR',
          Selected: false,
          Enabled: false,
        },
        {
          Half: 'U',
          Position: 'D',
          IsPrimary: true,
          Quadrant: 'UR',
          Selected: false,
          Enabled: false,
        },
        {
          Half: 'U',
          Position: 'E',
          IsPrimary: true,
          Quadrant: 'UR',
          Selected: false,
          Enabled: false,
        },
        {
          Half: 'U',
          Position: 'F',
          IsPrimary: true,
          Quadrant: 'UL',
          Selected: false,
          Enabled: false,
        },
        {
          Half: 'U',
          Position: 'G',
          IsPrimary: true,
          Quadrant: 'UL',
          Selected: false,
          Enabled: false,
        },
        {
          Half: 'U',
          Position: 'H',
          IsPrimary: true,
          Quadrant: 'UL',
          Selected: false,
          Enabled: false,
        },
        {
          Half: 'U',
          Position: 'I',
          IsPrimary: true,
          Quadrant: 'UL',
          Selected: false,
          Enabled: false,
        },
        {
          Half: 'U',
          Position: 'J',
          IsPrimary: true,
          Quadrant: 'UL',
          Selected: false,
          Enabled: false,
        },
        {
          Half: 'L',
          Position: 'K',
          IsPrimary: true,
          Quadrant: 'LL',
          Selected: false,
          Enabled: false,
        },
        {
          Half: 'L',
          Position: 'L',
          IsPrimary: true,
          Quadrant: 'LL',
          Selected: false,
          Enabled: false,
        },
        {
          Half: 'L',
          Position: 'M',
          IsPrimary: true,
          Quadrant: 'LL',
          Selected: false,
          Enabled: false,
        },
        {
          Half: 'L',
          Position: 'N',
          IsPrimary: true,
          Quadrant: 'LL',
          Selected: false,
          Enabled: false,
        },
        {
          Half: 'L',
          Position: 'O',
          IsPrimary: true,
          Quadrant: 'LL',
          Selected: false,
          Enabled: false,
        },
        {
          Half: 'L',
          Position: 'P',
          IsPrimary: true,
          Quadrant: 'LR',
          Selected: false,
          Enabled: false,
        },
        {
          Half: 'L',
          Position: 'Q',
          IsPrimary: true,
          Quadrant: 'LR',
          Selected: false,
          Enabled: false,
        },
        {
          Half: 'L',
          Position: 'R',
          IsPrimary: true,
          Quadrant: 'LR',
          Selected: false,
          Enabled: false,
        },
        {
          Half: 'L',
          Position: 'S',
          IsPrimary: true,
          Quadrant: 'LR',
          Selected: false,
          Enabled: false,
        },
        {
          Half: 'L',
          Position: 'T',
          IsPrimary: true,
          Quadrant: 'LR',
          Selected: false,
          Enabled: false,
        },
      ];
    };
    $scope.teeth = ctrl.getDefaultTeethObject();

    // flipping the selected flag where appropriate on load
    if ($scope.selectedTeeth) {
      angular.forEach($scope.selectedTeeth, function (tooth) {
        var index = listHelper.findIndexByFieldValue(
          $scope.teeth,
          'Position',
          tooth
        );
        if (index !== -1) {
          $scope.teeth[index].Selected = true;
        }
      });
    } else {
      $scope.selectedTeeth = [];
    }

    // if the selectedTeeth get cleared by the parent or directive, reset the teeth object to clear button active states, etc.
    $scope.$watch(
      'selectedTeeth',
      function (nv, ov) {
        if (nv && !angular.equals(nv, ov) && nv.length === 0) {
          $scope.teeth = ctrl.getDefaultTeethObject();
          ctrl.enableActiveTeeth();
        }
      },
      true
    );

    // flipping the enabled flag where appropriate on load
    ctrl.enableActiveTeeth = function () {
      if ($scope.activeTeeth) {
        angular.forEach($scope.activeTeeth, function (tooth) {
          var index = listHelper.findIndexByFieldValue(
            $scope.teeth,
            'Position',
            tooth
          );
          if (index !== -1) {
            $scope.teeth[index].Enabled = true;
          }
        });
      } else {
        angular.forEach($scope.teeth, function (tooth) {
          tooth.Enabled = true;
        });
      }
    };
    ctrl.enableActiveTeeth();

    // if the activeTeeth get updated by the parent or directive, enable the appropriate teeth
    $scope.$watch(
      'activeTeeth',
      function (nv, ov) {
        if (nv && !angular.equals(nv, ov)) {
          ctrl.enableActiveTeeth();
        }
      },
      true
    );

    // watching for changes to the tooth collection to update $scope.selectedTeeth
    $scope.$watch(
      'teeth',
      function (nv, ov) {
        $scope.ulActivePermanent = true;
        $scope.urActivePermanent = true;
        $scope.uActivePermanent = true;
        $scope.allActivePermanent = true;
        $scope.lActivePermanent = true;
        $scope.llActivePermanent = true;
        $scope.lrActivePermanent = true;
        $scope.noneActivePermanent = true;
        $scope.ulActivePrimary = true;
        $scope.urActivePrimary = true;
        $scope.uActivePrimary = true;
        $scope.allActivePrimary = true;
        $scope.lActivePrimary = true;
        $scope.llActivePrimary = true;
        $scope.lrActivePrimary = true;
        $scope.noneActivePrimary = true;
        $scope.selectedTeeth = [];
        angular.forEach($scope.teeth, function (tooth) {
          if (tooth.Selected) {
            $scope.selectedTeeth.push(tooth.Position);
          }
          // managing the active class on each of the multi-selection buttons
          if (!tooth.Selected) {
            if (!tooth.IsPrimary) {
              if ($scope.ulActivePermanent && tooth.Quadrant === 'UL') {
                $scope.ulActivePermanent = false;
              }
              if ($scope.urActivePermanent && tooth.Quadrant === 'UR') {
                $scope.urActivePermanent = false;
              }
              if ($scope.uActivePermanent && tooth.Half === 'U') {
                $scope.uActivePermanent = false;
              }
              if ($scope.allActivePermanent) {
                $scope.allActivePermanent = false;
              }
              if ($scope.lActivePermanent && tooth.Half === 'L') {
                $scope.lActivePermanent = false;
              }
              if ($scope.llActivePermanent && tooth.Quadrant === 'LL') {
                $scope.llActivePermanent = false;
              }
              if ($scope.lrActivePermanent && tooth.Quadrant === 'LR') {
                $scope.lrActivePermanent = false;
              }
            } else {
              if ($scope.ulActivePrimary && tooth.Quadrant === 'UL') {
                $scope.ulActivePrimary = false;
              }
              if ($scope.urActivePrimary && tooth.Quadrant === 'UR') {
                $scope.urActivePrimary = false;
              }
              if ($scope.uActivePrimary && tooth.Half === 'U') {
                $scope.uActivePrimary = false;
              }
              if ($scope.allActivePrimary) {
                $scope.allActivePrimary = false;
              }
              if ($scope.lActivePrimary && tooth.Half === 'L') {
                $scope.lActivePrimary = false;
              }
              if ($scope.llActivePrimary && tooth.Quadrant === 'LL') {
                $scope.llActivePrimary = false;
              }
              if ($scope.lrActivePrimary && tooth.Quadrant === 'LR') {
                $scope.lrActivePrimary = false;
              }
            }
          } else {
            if (!tooth.IsPrimary) {
              if ($scope.noneActivePermanent) {
                $scope.noneActivePermanent = false;
              }
            } else {
              if ($scope.noneActivePrimary) {
                $scope.noneActivePrimary = false;
              }
            }
          }
        });
      },
      true
    );

    // click handler used by the multi-selection buttons
    $scope.toggle = function (selection, isPrimary) {
      angular.forEach($scope.teeth, function (tooth) {
        if (tooth.IsPrimary === isPrimary) {
          if (selection === 'NONE') {
            tooth.Selected = false;
          } else if (selection === 'ALL') {
            tooth.Selected = true;
          } else if (tooth.Quadrant === selection || tooth.Half === selection) {
            var appendedText = isPrimary ? 'ActivePrimary' : 'ActivePermanent';
            var identifier = selection.toLowerCase() + appendedText;
            var relevantActiveFlag = $scope[identifier];
            var select = true;
            if (relevantActiveFlag) {
              select = false;
            }
            tooth.Selected = select;
          }
        }
      });
    };

    $scope.individualToothClicked = function (tooth) {
      if (tooth.Enabled) {
        tooth.Selected = !tooth.Selected;
      }
    };
  },
]);
