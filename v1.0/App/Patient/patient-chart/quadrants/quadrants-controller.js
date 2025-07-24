'use strict';

angular.module('Soar.Patient').controller('QuadrantsController', [
  '$scope',
  '$rootScope',
  'localize',
  'patSecurityService',
  'ToothSelectionService',
  'PatientOdontogramFactory',
  'ModalFactory',
  function (
    $scope,
    $rootScope,
    localize,
    patSecurityService,
    toothSelector,
    patientOdontogramFactory,
    modalFactory
  ) {
    $scope.upperQuadrants = [
      {
        QuadrantName: 'UL',
        selectedQuadrant: 'ul',
        selected: false,
        numTeeth: 8,
      },
      {
        QuadrantName: 'UR',
        selectedQuadrant: 'ur',
        selected: false,
        numTeeth: 8,
      },
    ];
    $scope.lowerQuadrants = [
      {
        QuadrantName: 'LL',
        selectedQuadrant: 'll',
        selected: false,
        numTeeth: 8,
      },
      {
        QuadrantName: 'LR',
        selectedQuadrant: 'lr',
        selected: false,
        numTeeth: 8,
      },
    ];

    var ctrl = this;

    //#region Authorization

    $scope.ogmEditAuthAbbrev = 'soar-clin-codogm-edit';

    ctrl.authEditOdontogramAccess = function () {
      return patSecurityService.IsAuthorizedByAbbreviation(
        $scope.ogmEditAuthAbbrev
      );
    };

    ctrl.authAccess = function () {
      if (ctrl.authEditOdontogramAccess()) {
        $scope.hasEditOdontogramAccess = true;
      }
    };

    ctrl.authAccess();

    //#endregion

    //checks to see if the entire quadrant is selected
    $scope.checkSelectedQuadrants = function (quadrant) {
      var count = 0;
      angular.forEach(toothSelector.selection.teeth, function (tooth) {
        if (
          quadrant.selectedQuadrant == 'ur' &&
          tooth.position <= 8 &&
          tooth.position >= 1
        ) {
          count += 1;
        }
        if (
          quadrant.selectedQuadrant == 'ur' &&
          tooth.position <= 60 &&
          tooth.position >= 53
        ) {
          count += 1;
        }
        if (
          quadrant.selectedQuadrant == 'ur' &&
          tooth.position <= 89 &&
          tooth.position >= 85
        ) {
          count += 1;
        }

        if (
          quadrant.selectedQuadrant == 'ul' &&
          tooth.position <= 16 &&
          tooth.position >= 9
        ) {
          count += 1;
        }
        if (
          quadrant.selectedQuadrant == 'ul' &&
          tooth.position <= 68 &&
          tooth.position >= 61
        ) {
          count += 1;
        }
        if (
          quadrant.selectedQuadrant == 'ul' &&
          tooth.position <= 94 &&
          tooth.position >= 90
        ) {
          count += 1;
        }

        if (
          quadrant.selectedQuadrant == 'll' &&
          tooth.position <= 24 &&
          tooth.position >= 17
        ) {
          count += 1;
        }
        if (
          quadrant.selectedQuadrant == 'll' &&
          tooth.position <= 76 &&
          tooth.position >= 69
        ) {
          count += 1;
        }
        if (
          quadrant.selectedQuadrant == 'll' &&
          tooth.position <= 99 &&
          tooth.position >= 95
        ) {
          count += 1;
        }

        if (
          quadrant.selectedQuadrant == 'lr' &&
          tooth.position <= 32 &&
          tooth.position >= 25
        ) {
          count += 1;
        }
        if (
          quadrant.selectedQuadrant == 'lr' &&
          tooth.position <= 84 &&
          tooth.position >= 77
        ) {
          count += 1;
        }
        if (
          quadrant.selectedQuadrant == 'lr' &&
          tooth.position <= 104 &&
          tooth.position >= 100
        ) {
          count += 1;
        }
      });
      if (count >= quadrant.numTeeth) {
        quadrant.selected = true;
      } else {
        quadrant.selected = false;
      }
      return quadrant.selected;
    };

    //Adds to numTeeth if supernumerary teeth active
    $scope.updateQuadrants = function (quadrant) {
      var count = 0;
      angular.forEach(toothSelector.toothData, function (tooth) {
        if (tooth.quadrant == quadrant.selectedQuadrant) {
          count += 1;
        }
      });
      return count;
    };
    //Selects a quadrant and deselects the quadrant if it is already selected.
    $scope.selectToothGroup = function (type, quadrant) {
      quadrant.numTeeth = $scope.updateQuadrants(quadrant);
      $scope.checkSelectedQuadrants(quadrant);
      toothSelector.selectToothGroup(
        type,
        quadrant.selectedQuadrant,
        quadrant.selected
      );
      quadrant.selected = !quadrant.selected;
    };

    $scope.togglePrimary = function (togglePrimary) {
      if ($scope.hasEditOdontogramAccess) {
        $rootScope.$broadcast('soar:odo-toggle-primary', togglePrimary);
      }
    };
  },
]);
