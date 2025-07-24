'use strict';
angular.module('Soar.Patient').controller('RootsController', [
  '$scope',
  'ListHelper',
  'StaticData',
  '$filter',
  'PatientOdontogramFactory',
  function ($scope, listHelper, staticData, patientOdontogramFactory) {
    var ctrl = this;
    ctrl.$onInit = function () {
      ctrl.setSelectedDefault(false);
      //This was causing the modal to open up with all selected. Removed both parts due to it also deselecting all if second part left in.
      //if ($scope.activeTeeth && $scope.activeTeeth.length != 0)
      //    ctrl.setSelectedDefault(true);
      //else {
      //ctrl.setSelectedDefault(false);
      //}
    };

    ctrl.setSelectedDefault = function (flag) {
      angular.forEach($scope.data, function (root) {
        root.selected = flag;
      });
    };

    $scope.selectRoot = function (root) {
      if (root.selected) root.selected = false;
      else {
        root.selected = true;
      }
    };

    $scope.$watch('activeTeeth', function (nv, ov) {
      if (nv != ov) {
        angular.forEach($scope.data, function (root) {
          if (nv.length != 0) {
            var r = $scope.showRootsForTooth(root);
            root.selected = true;
          }
          if (nv.length == 0) root.selected = false;
        });
      }
      if (nv) {
        for (var i = 0; i < nv.length; i++) {
          angular.forEach($scope.data, function (root) {
            angular.forEach(
              nv[i].RootAbbreviations,
              function (rootabbreviation) {
                if (rootabbreviation === root.RootAbbreviation) {
                  root.selected = true;
                }
              }
            );
          });
        }
      }
    });

    $scope.showRootsForTooth = function (root) {
      if ($scope.activeTeeth.length == 1) {
        if ($scope.activeTeeth && $scope.activeTeeth[0].RootAbbreviations) {
          var contains =
            $scope.activeTeeth[0].RootAbbreviations.indexOf(
              root.RootAbbreviation
            ) > -1;
          if (!contains) {
            root.selected = false;
          }
          return contains;
        }
        return false;
      }
      if ($scope.activeTeeth.length > 1) {
        var contains = false;
        var proceed = true;
        angular.forEach($scope.activeTeeth, function (tooth) {
          if (proceed) {
            if (tooth && tooth.RootAbbreviations) {
              contains =
                tooth.RootAbbreviations.indexOf(root.RootAbbreviation) > -1;
            }
            if (contains) {
              proceed = false;
              return contains;
            }
          }
        });
        return contains;
      } else return true;
    };
  },
]);
