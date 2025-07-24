'use strict';

angular.module('common.controllers').controller('RotSelectorController', [
  '$scope',
  'ListHelper',
  'StaticData',
  'localize',
  '$timeout',
  '$filter',
  function ($scope, listHelper, staticData, localize, $timeout, $filter) {
    var ctrl = this;

    $scope.selectedTeeth = [];
    $scope.quadrants = [
      {
        USNumber: 'UL',
        range: '9-16',
        type: 'permanent',
        $$Selected: false,
        $$Visible: true,
        $$PositionAlreadyTaken: false,
        $$Highlight: false,
      },
      {
        USNumber: 'UR',
        range: '1-8',
        type: 'permanent',
        $$Selected: false,
        $$Visible: true,
        $$PositionAlreadyTaken: false,
        $$Highlight: false,
      },
      {
        USNumber: 'LL',
        range: '17-24',
        type: 'permanent',
        $$Selected: false,
        $$Visible: true,
        $$PositionAlreadyTaken: false,
        $$Highlight: false,
      },
      {
        USNumber: 'LR',
        range: '25-32',
        type: 'permanent',
        $$Selected: false,
        $$Visible: true,
        $$PositionAlreadyTaken: false,
        $$Highlight: false,
      },
      {
        USNumber: 'UA',
        range: '1-16',
        type: 'permanent',
        $$Selected: false,
        $$Visible: true,
        $$PositionAlreadyTaken: false,
        $$Highlight: false,
      },
      {
        USNumber: 'LA',
        range: '17-32',
        type: 'permanent',
        $$Selected: false,
        $$Visible: true,
        $$PositionAlreadyTaken: false,
        $$Highlight: false,
      },
      {
        USNumber: 'FM',
        range: '1-32',
        type: 'permanent',
        $$Selected: false,
        $$Visible: true,
        $$PositionAlreadyTaken: false,
        $$Highlight: false,
      },
      {
        USNumber: 'UL',
        range: 'F-J',
        type: 'primary',
        $$Selected: false,
        $$Visible: true,
        $$PositionAlreadyTaken: false,
        $$Highlight: false,
      },
      {
        USNumber: 'UR',
        range: 'A-E',
        type: 'primary',
        $$Selected: false,
        $$Visible: true,
        $$PositionAlreadyTaken: false,
        $$Highlight: false,
      },
      {
        USNumber: 'LL',
        range: 'K-O',
        type: 'primary',
        $$Selected: false,
        $$Visible: true,
        $$PositionAlreadyTaken: false,
        $$Highlight: false,
      },
      {
        USNumber: 'LR',
        range: 'P-T',
        type: 'primary',
        $$Selected: false,
        $$Visible: true,
        $$PositionAlreadyTaken: false,
        $$Highlight: false,
      },
      {
        USNumber: 'UA',
        range: 'A-J',
        type: 'primary',
        $$Selected: false,
        $$Visible: true,
        $$PositionAlreadyTaken: false,
        $$Highlight: false,
      },
      {
        USNumber: 'LA',
        range: 'T-K',
        type: 'primary',
        $$Selected: false,
        $$Visible: true,
        $$PositionAlreadyTaken: false,
        $$Highlight: false,
      },
      {
        USNumber: 'FM',
        range: 'A-T',
        type: 'primary',
        $$Selected: false,
        $$Visible: true,
        $$PositionAlreadyTaken: false,
        $$Highlight: false,
      },
    ];
    ctrl.addQuadrants = function () {
      angular.forEach($scope.quadrants, function (quadrant) {
        $scope.teethDefinitions.Teeth.push(quadrant);
      });
    };
    // all things that happen at instantiation
    ctrl.$onInit = function () {
      $scope.placeholderText = localize.getLocalizedString('Select teeth...');
      ctrl.getTeethDefinitions();
    };

    // reacting to selected changes, could get [1,3], [1-8], etc.
    $scope.$watch(
      'selected',
      function (nv, ov) {
        if ($scope.teethDefinitions) {
          ctrl.loadPreselectedTeeth(nv);
        }
      },
      true
    );

    //#region view

    // fired when user hits enter, handles selection of inputs
    $scope.enter = function () {
      $scope.showTeethList = false;
      $scope.input = $scope.input.replace(/ /g, '');
      var entrys = $scope.input.split(',');
      angular.forEach(entrys, function (ent) {
        if (typeof ent === 'string') {
          ent = ent.toUpperCase();
        }
        switch (ent) {
          case 'UR':
            ent = '1-8';
            break;
          case 'UL':
            ent = '9-16';
            break;
          case 'LR':
            ent = '25-32';
            break;
          case 'LL':
            ent = '17-24';
            break;
          case 'UA':
            ent = '1-16';
            break;
          case 'LA':
            ent = '17-32';
            break;
          case 'FM':
            ent = '1-32';
            break;
          default:
            break;
        }
        if (ent.indexOf('-') === -1) {
          ctrl.selectIndividual(ent);
        } else if (ent.indexOf('-') >= 1 && ent.length >= 3) {
          ctrl.selectRange(ent);
        }
      });
      $scope.input = null;
    };

    // listening for changes to input for highlighting
    $scope.$watch('input', function (nv, ov) {
      if ($scope.teethDefinitions) {
        angular.forEach($scope.teethDefinitions.Teeth, function (tooth) {
          tooth.$$Visible = true;
          tooth.$$Highlight = false;
        });
      }
      if (nv) {
        if (nv.indexOf('-') === -1) {
          if (nv.indexOf('-') === -1 && nv.indexOf(',') === -1) {
            $scope.showTeethList = true;
          } else {
            $scope.showTeethList = false;
          }
          if (typeof nv === 'string') {
            nv = nv.toUpperCase();
          }
          ctrl.filterBasedOnInput(nv);
        } else {
          $scope.showTeethList = false;
        }
      } else {
        $scope.showTeethList = false;
      }
    });

    // click handler for dropdown list items, does selection
    $scope.select = function (tooth) {
      $scope.showTeethList = false;
      $scope.input = null;
      ctrl.toggle$$SelectProperty(tooth, true);
      ctrl.updateSelected();
    };

    $scope.selectQuadrant = function (quadrant) {
      $scope.input = null;
      ctrl.selectRange(quadrant.range);
    };

    // handles delete clicks on the selected teeth tags/buttons, removes individual or range
    $scope.remove = function (tooth) {
      var type = $filter('filter')($scope.quadrants, { USNumber: tooth });
      if (type.length > 1 && tooth == type[0].USNumber) {
        if ($scope.selected.indexOf(type[0].range) > -1) {
          tooth = type[0].range;
        } else if ($scope.selected.indexOf(type[1].range) > -1) {
          tooth = type[1].range;
        }
      }
      if (tooth.indexOf('-') === -1) {
        ctrl.removeIndividual(tooth);
      } else {
        ctrl.removeRange(tooth);
      }
    };

    // used to close dropdown when input is blurred
    $scope.inputBlurred = function () {
      $timeout(function () {
        $scope.showTeethList = false;
      }, 100);
    };

    // used to set focus on input when any part of the control is clicked
    $scope.focusInput = function () {
      $scope.showTeethList = !$scope.showTeethList;
      angular.element('#toothInput').focus();
    };

    //#endregion

    //#region private helpers

    // used for mapping other dentition in same position
    var map = {};
    // perm > prim
    map[4] = 33;
    map[5] = 34;
    map[6] = 35;
    map[7] = 36;
    map[8] = 37;
    map[9] = 38;
    map[10] = 39;
    map[11] = 40;
    map[12] = 41;
    map[13] = 42;
    map[20] = 43;
    map[21] = 44;
    map[22] = 45;
    map[23] = 46;
    map[24] = 47;
    map[25] = 48;
    map[26] = 49;
    map[27] = 50;
    map[28] = 51;
    map[29] = 52;
    // prim > perm
    map[33] = 4;
    map[34] = 5;
    map[35] = 6;
    map[36] = 7;
    map[37] = 8;
    map[38] = 9;
    map[39] = 10;
    map[40] = 11;
    map[41] = 12;
    map[42] = 13;
    map[43] = 20;
    map[44] = 21;
    map[45] = 22;
    map[46] = 23;
    map[47] = 24;
    map[48] = 25;
    map[49] = 26;
    map[50] = 27;
    map[51] = 28;
    map[52] = 29;

    // get the teeth defs from localStorage and adding custom properties
    ctrl.getTeethDefinitions = function () {
      staticData.TeethDefinitions().then(function (res) {
        if (res && res.Value) {
          $scope.teethDefinitions = {
            Teeth: $filter('filter')(res.Value.Teeth, function (tooth) {
              return tooth.ToothId < 53;
            }),
          };
          angular.forEach($scope.teethDefinitions.Teeth, function (tooth) {
            if (map[tooth.ToothId]) {
              tooth.$$ToothIdOfOtherDentitionInSamePosition =
                map[tooth.ToothId];
            }
            tooth.$$Visible = true;
            tooth.$$Selected = false;
            tooth.$$PositionAlreadyTaken = false;
          });
        }
        ctrl.loadPreselectedTeeth($scope.selected);
      });
    };

    // selects an individual tooth
    ctrl.selectIndividual = function (toothNumber) {
      var tooth = listHelper.findItemByFieldValue(
        $scope.teethDefinitions.Teeth,
        'USNumber',
        toothNumber
      );
      if (tooth) {
        ctrl.toggle$$SelectProperty(tooth, true);
        ctrl.updateSelected();
      }
    };

    // selects a range of teeth, '1-8', etc.
    ctrl.selectRange = function (toothRange) {
      var firstIndex = listHelper.findIndexByFieldValue(
        $scope.teethDefinitions.Teeth,
        'USNumber',
        toothRange.slice(0, toothRange.indexOf('-'))
      );
      var lastIndex = listHelper.findIndexByFieldValue(
        $scope.teethDefinitions.Teeth,
        'USNumber',
        toothRange.slice(toothRange.indexOf('-') + 1)
      );
      if (
        firstIndex !== -1 &&
        lastIndex !== -1 &&
        lastIndex >= firstIndex &&
        $scope.teethDefinitions.Teeth[firstIndex].ToothStructure ===
          $scope.teethDefinitions.Teeth[lastIndex].ToothStructure
      ) {
        var list = $scope.teethDefinitions.Teeth.slice(
          firstIndex,
          lastIndex + 1
        );
        angular.forEach(list, function (tooth) {
          ctrl.toggle$$SelectProperty(tooth, true);
        });
        ctrl.updateSelected();
      } else if (
        firstIndex !== -1 &&
        lastIndex !== -1 &&
        lastIndex < firstIndex &&
        $scope.teethDefinitions.Teeth[firstIndex].ToothStructure ===
          $scope.teethDefinitions.Teeth[lastIndex].ToothStructure
      ) {
        var list = $scope.teethDefinitions.Teeth.slice(
          lastIndex,
          firstIndex + 1
        );
        angular.forEach(list, function (tooth) {
          ctrl.toggle$$SelectProperty(tooth, true);
        });
        ctrl.updateSelected();
      }
    };

    // removes an individual tooth
    ctrl.removeIndividual = function (toothNumber) {
      var tooth = listHelper.findItemByFieldValue(
        $scope.teethDefinitions.Teeth,
        'USNumber',
        toothNumber
      );
      if (tooth) {
        ctrl.toggle$$SelectProperty(tooth, false);
        ctrl.updateSelected();
      }
    };

    // removes a range of teeth, '1-8', etc.
    ctrl.removeRange = function (toothRange) {
      var firstIndex = listHelper.findIndexByFieldValue(
        $scope.teethDefinitions.Teeth,
        'USNumber',
        toothRange.slice(0, toothRange.indexOf('-'))
      );
      var lastIndex = listHelper.findIndexByFieldValue(
        $scope.teethDefinitions.Teeth,
        'USNumber',
        toothRange.slice(toothRange.indexOf('-') + 1)
      );
      var list = $scope.teethDefinitions.Teeth.slice(firstIndex, lastIndex + 1);
      angular.forEach(list, function (tooth) {
        ctrl.toggle$$SelectProperty(tooth, false);
      });
      ctrl.updateSelected();
    };

    // when input value changes, filter the list and highlight the first match to mimic kendo multiselect
    ctrl.filterBasedOnInput = function (inputValue) {
      var foundOne = false;
      angular.forEach($scope.teethDefinitions.Teeth, function (tooth) {
        tooth.$$Visible = tooth.USNumber.startsWith(inputValue);
        if (!foundOne && tooth.$$Visible && !tooth.$$Selected) {
          tooth.$$Highlight = true;
          foundOne = true;
        }
      });
      foundOne = false;
      angular.forEach($scope.quadrants, function (quadrant) {
        quadrant.$$Visible = quadrant.USNumber.startsWith(inputValue);
        if (!foundOne && quadrant.$$Visible && !quadrant.$$Selected) {
          quadrant.$$Highlight = true;
          foundOne = true;
        }
      });
    };

    // keeping selected list updated
    ctrl.updateSelected = function () {
      if ($scope.selected) {
        $scope.selected.length = 0;
      }
      var selectedNumbers = '';
      angular.forEach($scope.teethDefinitions.Teeth, function (tooth, $index) {
        if (tooth.$$Selected) {
          if (
            $scope.teethDefinitions.Teeth[$index - 1] &&
            tooth.ToothStructure !==
              $scope.teethDefinitions.Teeth[$index - 1].ToothStructure
          ) {
            selectedNumbers = selectedNumbers.concat(',-', tooth.USNumber);
          } else {
            selectedNumbers = selectedNumbers.concat('-', tooth.USNumber);
          }
        } else {
          selectedNumbers = selectedNumbers.concat(',');
        }
      });
      selectedNumbers = selectedNumbers.split(',');
      angular.forEach(selectedNumbers, function (group) {
        if (group) {
          group = group.slice(1);
          if (group.indexOf('-') === -1) {
            $scope.selected.push(group);
          } else {
            var firstNumber = group.slice(0, group.indexOf('-'));
            var lastNumber = group.slice(group.lastIndexOf('-') + 1);
            $scope.selected.push(firstNumber + '-' + lastNumber);
          }
        }
      });
      $scope.updateTags();
    };

    $scope.updateTags = function () {
      $scope.selectedTeeth = [];
      angular.forEach($scope.selected, function (tooth, $index) {
        $scope.selectedTeeth[$index] = tooth;
      });
      angular.forEach($scope.selectedTeeth, function (range, $index) {
        var type = $filter('filter')($scope.quadrants, { range: range });
        if (type.length > 0 && type[0].range == range) {
          $scope.selectedTeeth[$index] = type[0].USNumber;
        }
      });
    };

    // flips tooth.$$Selected and keeps user from selecting tooth in the same position as an already selected tooth
    ctrl.toggle$$SelectProperty = function (tooth, flag) {
      if (tooth.$$ToothIdOfOtherDentitionInSamePosition) {
        var toothOfOtherDentitionInSamePosition =
          listHelper.findItemByFieldValue(
            $scope.teethDefinitions.Teeth,
            'ToothId',
            tooth.$$ToothIdOfOtherDentitionInSamePosition
          );
        if (
          toothOfOtherDentitionInSamePosition &&
          !toothOfOtherDentitionInSamePosition.$$Selected
        ) {
          tooth.$$Selected = flag;
          toothOfOtherDentitionInSamePosition.$$PositionAlreadyTaken = flag;
        }
      } else {
        tooth.$$Selected = flag;
      }
    };

    // handles preselected teeth and teeth on service transaction being edited
    ctrl.loadPreselectedTeeth = function (nv) {
      if (nv && nv[0] && nv[0].toString().indexOf(',') !== -1) {
        nv = nv[0].split(',');
      }
      angular.forEach(nv, function (item) {
        item = isNaN(item) ? item : item.toString();
        var tooth = listHelper.findItemByFieldValue(
          $scope.teethDefinitions.Teeth,
          'USNumber',
          item
        );
        if (tooth) {
          ctrl.toggle$$SelectProperty(tooth, true);
        } else if (item.indexOf('-') >= 1 && item.length >= 3) {
          ctrl.selectRange(item);
        }
      });
      ctrl.updateSelected();
    };

    //#endregion
  },
]);
