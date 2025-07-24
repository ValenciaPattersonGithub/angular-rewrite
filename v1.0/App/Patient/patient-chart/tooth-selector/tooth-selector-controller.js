'use strict';

angular.module('Soar.Patient').controller('ToothSelectorController', [
  '$scope',
  'ListHelper',
  'StaticData',
  'ToothSelectionService',
  'soarAnimation',
  'PatientOdontogramFactory',
  function (
    $scope,
    listHelper,
    staticData,
    toothSelector,
    soarAnimation,
    patientOdontogramFactory
  ) {
    var ctrl = this;

    ctrl.selectedTeethHaveLoaded = false;
    $scope.originalSelectedTeeth = null;

    ctrl.setWidgetDefaults = function () {
      $scope.disableSelection = angular.isDefined($scope.disableSelection)
        ? $scope.disableSelection
        : false;
      $scope.multiselectEnabled = angular.isDefined($scope.multiselectEnabled)
        ? $scope.multiselectEnabled
        : true;
      $scope.quadrantSelectionOnly = angular.isDefined(
        $scope.quadrantSelectionOnly
      )
        ? $scope.quadrantSelectionOnly
        : false;
    };

    // waiting for pre-selected teeth
    $scope.$watch(
      'selectedTeeth',
      function (nv, ov) {
        $scope.$emit('selectedTeeth-modified', nv);
        // business wants the previously selected teeth to perist in notes crud, nv and ov will be the same in this scenario
        // setting the nvAndOvEqual flag to allow ctrl.activatePreselectedTeeth to proceed in this case
        ctrl.nvAndOvEqual = angular.equals(nv, ov);
        if (
          nv &&
          !ctrl.nvAndOvEqual &&
          nv.length > 0 &&
          ctrl.selectedTeethHaveLoaded === false
        ) {
          ctrl.selectedTeethHaveLoaded = true;
          ctrl.activatePreselectedTeeth(nv);
        }
        if ($scope.selectedTeethChanged) {
          if (nv && nv.length > 0) {
            ctrl.resetTeethSelection();
            ctrl.activatePreselectedTeeth(nv);
          } else {
            $scope.clearTeeth();
          }
        } else {
          if (
            nv &&
            nv.length === 0 &&
            ($scope.selectedTeethChanged == null ||
              $scope.selectedTeethChanged == undefined)
          ) {
            $scope.clearTeeth();
          }
        }
      },
      true
    );

    // listening for changes to quadrantSelectionOnly
    $scope.$watch(
      'quadrantSelectionOnly',
      function (nv, ov) {
        if (!angular.equals(nv, ov) && nv === true) {
          $scope.clearTeeth();
        }
      },
      true
    );

    $scope.$watch('allTeeth', function (newValue, oldValue) {
      if (newValue !== oldValue) {
        $scope.updateSelectedQuadrant();
      }
    }, true);

    $scope.$on('clearTeethEvent', function () {
      $scope.clearTeeth();
    });
    
    // everything that needs to happen when the controller is instantiated
    ctrl.$onInit = function () {
      $scope.selectedToothStructure = 'Permanent';
      ctrl.getTeethDefinitions();
      if ($scope.widget) {
        ctrl.setWidgetDefaults();
      }
    };

    // activating pre-selected teeth on load
    ctrl.activatePreselectedTeeth = function (selectedTeeth) {
      if (
        (ctrl.selectedTeethHaveLoaded && $scope.allTeeth) ||
        (ctrl.nvAndOvEqual && $scope.allTeeth)
      ) {
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

    // getting the teeth list from the factory
    ctrl.getTeethDefinitions = function () {
      staticData.TeethDefinitions().then(function (res) {
        if (res && res.Value && res.Value.Teeth) {
          $scope.allTeeth = res.Value.Teeth;
          $scope.teethPersisted = angular.copy(
            patientOdontogramFactory.selectedTeeth
          );
          angular.forEach($scope.teethPersisted, function (teeth) {
            var teethSelected = listHelper.findItemByFieldValue(
              $scope.allTeeth,
              'USNumber',
              teeth
            );
            if (teethSelected) teethSelected.Selected = true;
            $scope.selectedTeeth.push(teethSelected);
          });
          if ($scope.quadrantSelectionOnly && $scope.multiselectEnabled) {
            $scope.clearTeeth();
          } else {
            ctrl.activatePreselectedTeeth($scope.selectedTeeth);
          }
        }
      });
    };

    // selects/unselects a tooth and updates the selectedTeeth array accordingly
    ctrl.updatedSelectedTeethList = function (tooth) {
      var index = listHelper.findIndexByFieldValue(
        $scope.selectedTeeth,
        'ToothId',
        tooth.ToothId
      );
      if (index === -1) {
        $scope.selectedTeeth.push(tooth);
        tooth.Selected = true;
      } else {
        $scope.selectedTeeth.splice(index, 1);
        tooth.Selected = false;
      }
    };

    // used by all individual tooth buttons to select/unselect teeth
    $scope.selectTooth = function (tooth) {
      if ($scope.validateSelection) {
        $scope.validateToothSelection(tooth);
      }
      $scope.selectedQuadrant = [];
      $scope.activeTooth = tooth;
      ctrl.updatedSelectedTeethList(tooth);
      // only allowing one tooth to be selected at a time, in edit mode
      if (!$scope.multiselectEnabled && $scope.selectedTeeth.length === 2) {
        var item = listHelper.findItemByFieldValue(
          $scope.allTeeth,
          'ToothId',
          $scope.selectedTeeth[0].ToothId
        );
        ctrl.updatedSelectedTeethList(item);
      }
    };

    // both the quadrant and arch mutli-select buttons use this to select/unselect groups
    $scope.selectMultipleTeeth = function (selection, property) {
      let allSelected = true;
      let teethInQuadrant = $scope.allTeeth.filter(tooth => tooth[property] === selection && 
          tooth.ToothStructure === $scope.selectedToothStructure);

      teethInQuadrant.forEach(tooth => {
        if (!$scope.selectedTeeth.some(selectedTooth => selectedTooth.ToothId === tooth.ToothId)) {
          allSelected = false;
        }
      });

      if (allSelected) {
        teethInQuadrant.forEach(tooth => {
          let index = $scope.selectedTeeth.findIndex(selectedTooth => selectedTooth.ToothId === tooth.ToothId);
          if (index !== -1) {
            $scope.selectedTeeth.splice(index, 1);
            tooth.Selected = false;
          }
        });
      } else {
        teethInQuadrant.forEach(tooth => {
          if (!$scope.selectedTeeth.some(selectedTooth => selectedTooth.ToothId === tooth.ToothId)) {
            $scope.selectedTeeth.push(tooth);
            tooth.Selected = true;
          }
        });
      }
    };

    // instead of calling quadrantSelected to manually select a quadrant from, this function automatically 
    // selects quadrants based on the selected teeth
    $scope.updateSelectedQuadrant = function () {
      let selectedTeeth = $scope.allTeeth.filter(tooth => tooth.Selected);

      const groupedTeeth = selectedTeeth.reduce((acc, tooth) => {
        (acc[tooth.QuadrantName] = acc[tooth.QuadrantName] || []).push(tooth);
        return acc;
      }, {});

      $scope.selectedQuadrant = [];

      Object.keys(groupedTeeth).forEach(quadrantName => {
        const teeth = groupedTeeth[quadrantName];
        if (teeth.length % 16 === 0 || teeth.length % 10 === 0) {
          let theSelectedQuadrantString = getAbbreviatedQuadrant(quadrantName);
          addUniqueItem($scope.selectedQuadrant, { TeethOrQuadrant: theSelectedQuadrantString }, 'TeethOrQuadrant');
        }
      });
    };

    // used by the view, clears the selectedTeeth array and unselects all tooth buttons
    $scope.clearTeeth = function () {
      $scope.selectedTeeth = [];
      $scope.selectedQuadrant = [];
      ctrl.resetTeethSelection();
    };

    // function to reset teeth selection to unselected
    ctrl.resetTeethSelection = function () {
      angular.forEach($scope.allTeeth, function (tooth) {
        tooth.Selected = false;
      });
    };

    // prm button function used by the view to toggle which type teeth the multi-select buttons affect
    $scope.toggleToothStructure = function () {
      $scope.selectedToothStructure =
        $scope.selectedToothStructure === 'Permanent' ? 'Primary' : 'Permanent';
    };

    //#region apply teeth or quadrant
    $scope.selectedQuadrant = [];
  $scope.applyTeeth = function () {
  let selectedTeethToSave = [];
  let selectedTeethOrQuadrant = [];

  // Always expand quadrants to individual teeth for saving
  if ($scope.selectedQuadrant.length > 0) {
    $scope.selectedQuadrant.forEach(quadrant => {
      let quadrantTeeth = $scope.allTeeth.filter(tooth => 
        getAbbreviatedQuadrant(tooth.QuadrantName) === quadrant.TeethOrQuadrant &&
        tooth.ToothStructure === $scope.selectedToothStructure
      );
      quadrantTeeth.forEach(tooth => {
        selectedTeethToSave.push({ USNumber: tooth.USNumber });        
        addUniqueItem(selectedTeethOrQuadrant, { TeethOrQuadrant: tooth.USNumber }, 'TeethOrQuadrant');
      });
    });
  }

  // Add individual teeth (excluding those already in selected quadrants)
  if ($scope.selectedTeeth.length > 0) {
    let selectedQuadrantTeeth = new Set();
    $scope.selectedQuadrant.forEach(quadrant => {
      let quadrantTeeth = $scope.allTeeth.filter(tooth => 
        getAbbreviatedQuadrant(tooth.QuadrantName) === quadrant.TeethOrQuadrant
      );
      quadrantTeeth.forEach(tooth => selectedQuadrantTeeth.add(tooth.USNumber));
    });

    let individualTeeth = $scope.selectedTeeth
      .filter(tooth => !selectedQuadrantTeeth.has(tooth.USNumber))
      .map(tooth => ({ USNumber: tooth.USNumber }));

    selectedTeethToSave = selectedTeethToSave.concat(individualTeeth);

    // Add individual teeth to display (those not part of quadrants)
    individualTeeth.forEach(tooth => 
      addUniqueItem(selectedTeethOrQuadrant, { TeethOrQuadrant: tooth.USNumber }, 'TeethOrQuadrant')
    );
  }

  // Emit events
  $scope.$emit('tooth-selection-ui-update', selectedTeethOrQuadrant);
  $scope.$emit('tooth-selection-save', selectedTeethToSave);
  $scope.tChartPopoverActive = false;
};

    $scope.quadrantSelected = function (quadrant) {
      $scope.selectedQuadrant = [];
      $scope.selectedQuadrant.push({ TeethOrQuadrant: quadrant });
    };

    function getAbbreviatedQuadrant(quadrant) {
      let words = quadrant.split(' ');
      return words.map(word => word.charAt(0)).join('');
    }

    function addUniqueItem(array, item, key) {
      const exists = array.some(existingItem => existingItem[key] === item[key]);
      if (!exists) {
        array.push(item);
      }
    }


    $scope.cancel = function () {
      if ($scope.isClinicalNote != true) {
        $scope.clearTeeth();
      } else {
        $scope.resetToOriginalValue();
      }
      $scope.tChartPopoverActive = false;
    };

    $scope.resetToOriginalValue = function () {
      $scope.selectedTeeth = _.cloneDeep($scope.originalSelectedTeeth);
      angular.forEach($scope.allTeeth, function (tooth) {
        var index = listHelper.findIndexByFieldValue(
          $scope.selectedTeeth,
          'ToothId',
          tooth.ToothId
        );
        if (index === -1) {
          tooth.Selected = false;
        } else {
          tooth.Selected = true;
        }
      });
    };

    //#endregion

    //#region validating tooth selection not to have same position in permanent and primary

    $scope.validateToothSelection = function (tooth) {
      var index = -1;
      var index1 = -1;
      var matchingTooth = toothSelector.getToothDataByTooth(tooth);
      if (matchingTooth) {
        if (tooth.ToothId === matchingTooth.permanentNumber) {
          index = listHelper.findIndexByFieldValue(
            $scope.selectedTeeth,
            'USNumber',
            matchingTooth.primaryLetter
          );
          index1 = listHelper.findIndexByFieldValue(
            $scope.allTeeth,
            'USNumber',
            matchingTooth.primaryLetter
          );
        } else {
          if (tooth.USNumber === matchingTooth.primaryLetter) {
            index = listHelper.findIndexByFieldValue(
              $scope.selectedTeeth,
              'USNumber',
              matchingTooth.permanentNumber
            );
            index1 = listHelper.findIndexByFieldValue(
              $scope.allTeeth,
              'USNumber',
              matchingTooth.permanentNumber
            );
          }
        }
        // remove from selectedTeeth
        if (index > -1) {
          $scope.selectedTeeth.splice(index, 1);
        }
        // unselect match in allteeth
        if (index1 > -1) {
          $scope.allTeeth[index1].Selected = false;
        }
      }
    };

    //#endregion

    //#region Input
    //#region Menu Toggle

    $scope.orientV = false;

    $scope.toggleTChartActive = function () {
      $scope.tChartPopoverActive = !$scope.tChartPopoverActive;
      if ($scope.tChartPopoverActive) {
        $scope.originalSelectedTeeth = _.cloneDeep($scope.selectedTeeth);
      }
    };

    $scope.tChartToggle = function ($event) {
      $scope.toggleTChartActive();
      $scope.orientV = soarAnimation.soarVPos($event.currentTarget);
    };

    // listening for changes to tChartPopoverActive
    $scope.$watch('tChartPopoverActive', function (nv, ov) {
      $scope.$emit('tooth-widget-active', nv);
    });
  }
]);
