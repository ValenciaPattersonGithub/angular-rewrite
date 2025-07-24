'use strict';
angular.module('Soar.Patient').service('ToothSelectionService', [
  'ListHelper',
  'PatientOdontogramFactory',
  function (listHelper, patientOdontogramFactory) {
    var service = this;
    var selectedQuadrant;

    service.selection = {
      teeth: [],
    };

    var getInitToothData = function () {
      return {
        1: {
          isPrimary: false,
          permanentNumber: 1,
          primaryLetter: '',
          quadrant: 'ur',
          arch: 'u',
          watchIds: null,
          watchTeeth: null,
          toothId: 1,
        },
        2: {
          isPrimary: false,
          permanentNumber: 2,
          primaryLetter: '',
          quadrant: 'ur',
          arch: 'u',
          watchIds: null,
          watchTeeth: null,
          toothId: 2,
        },
        3: {
          isPrimary: false,
          permanentNumber: 3,
          primaryLetter: '',
          quadrant: 'ur',
          arch: 'u',
          watchIds: null,
          watchTeeth: null,
          toothId: 3,
        },
        4: {
          isPrimary: false,
          permanentNumber: 4,
          primaryLetter: 'A',
          quadrant: 'ur',
          arch: 'u',
          watchIds: null,
          watchTeeth: null,
          toothId: 4,
        },
        5: {
          isPrimary: false,
          permanentNumber: 5,
          primaryLetter: 'B',
          quadrant: 'ur',
          arch: 'u',
          watchIds: null,
          watchTeeth: null,
          toothId: 5,
        },
        6: {
          isPrimary: false,
          permanentNumber: 6,
          primaryLetter: 'C',
          quadrant: 'ur',
          arch: 'u',
          watchIds: null,
          watchTeeth: null,
          toothId: 6,
        },
        7: {
          isPrimary: false,
          permanentNumber: 7,
          primaryLetter: 'D',
          quadrant: 'ur',
          arch: 'u',
          watchIds: null,
          watchTeeth: null,
          toothId: 7,
        },
        8: {
          isPrimary: false,
          permanentNumber: 8,
          primaryLetter: 'E',
          quadrant: 'ur',
          arch: 'u',
          watchIds: null,
          watchTeeth: null,
          toothId: 8,
        },
        9: {
          isPrimary: false,
          permanentNumber: 9,
          primaryLetter: 'F',
          quadrant: 'ul',
          arch: 'u',
          watchIds: null,
          watchTeeth: null,
          toothId: 9,
        },
        10: {
          isPrimary: false,
          permanentNumber: 10,
          primaryLetter: 'G',
          quadrant: 'ul',
          arch: 'u',
          watchIds: null,
          watchTeeth: null,
          toothId: 10,
        },
        11: {
          isPrimary: false,
          permanentNumber: 11,
          primaryLetter: 'H',
          quadrant: 'ul',
          arch: 'u',
          watchIds: null,
          watchTeeth: null,
          toothId: 11,
        },
        12: {
          isPrimary: false,
          permanentNumber: 12,
          primaryLetter: 'I',
          quadrant: 'ul',
          arch: 'u',
          watchIds: null,
          watchTeeth: null,
          toothId: 12,
        },
        13: {
          isPrimary: false,
          permanentNumber: 13,
          primaryLetter: 'J',
          quadrant: 'ul',
          arch: 'u',
          watchIds: null,
          watchTeeth: null,
          toothId: 13,
        },
        14: {
          isPrimary: false,
          permanentNumber: 14,
          primaryLetter: '',
          quadrant: 'ul',
          arch: 'u',
          watchIds: null,
          watchTeeth: null,
          toothId: 14,
        },
        15: {
          isPrimary: false,
          permanentNumber: 15,
          primaryLetter: '',
          quadrant: 'ul',
          arch: 'u',
          watchIds: null,
          watchTeeth: null,
          toothId: 15,
        },
        16: {
          isPrimary: false,
          permanentNumber: 16,
          primaryLetter: '',
          quadrant: 'ul',
          arch: 'u',
          watchIds: null,
          watchTeeth: null,
          toothId: 16,
        },
        17: {
          isPrimary: false,
          permanentNumber: 17,
          primaryLetter: '',
          quadrant: 'll',
          arch: 'l',
          watchIds: null,
          watchTeeth: null,
          toothId: 17,
        },
        18: {
          isPrimary: false,
          permanentNumber: 18,
          primaryLetter: '',
          quadrant: 'll',
          arch: 'l',
          watchIds: null,
          watchTeeth: null,
          toothId: 18,
        },
        19: {
          isPrimary: false,
          permanentNumber: 19,
          primaryLetter: '',
          quadrant: 'll',
          arch: 'l',
          watchIds: null,
          watchTeeth: null,
          toothId: 19,
        },
        20: {
          isPrimary: false,
          permanentNumber: 20,
          primaryLetter: 'K',
          quadrant: 'll',
          arch: 'l',
          watchIds: null,
          watchTeeth: null,
          toothId: 20,
        },
        21: {
          isPrimary: false,
          permanentNumber: 21,
          primaryLetter: 'L',
          quadrant: 'll',
          arch: 'l',
          watchIds: null,
          watchTeeth: null,
          toothId: 21,
        },
        22: {
          isPrimary: false,
          permanentNumber: 22,
          primaryLetter: 'M',
          quadrant: 'll',
          arch: 'l',
          watchIds: null,
          watchTeeth: null,
          toothId: 22,
        },
        23: {
          isPrimary: false,
          permanentNumber: 23,
          primaryLetter: 'N',
          quadrant: 'll',
          arch: 'l',
          watchIds: null,
          watchTeeth: null,
          toothId: 23,
        },
        24: {
          isPrimary: false,
          permanentNumber: 24,
          primaryLetter: 'O',
          quadrant: 'll',
          arch: 'l',
          watchIds: null,
          watchTeeth: null,
          toothId: 24,
        },
        25: {
          isPrimary: false,
          permanentNumber: 25,
          primaryLetter: 'P',
          quadrant: 'lr',
          arch: 'l',
          watchIds: null,
          watchTeeth: null,
          toothId: 25,
        },
        26: {
          isPrimary: false,
          permanentNumber: 26,
          primaryLetter: 'Q',
          quadrant: 'lr',
          arch: 'l',
          watchIds: null,
          watchTeeth: null,
          toothId: 26,
        },
        27: {
          isPrimary: false,
          permanentNumber: 27,
          primaryLetter: 'R',
          quadrant: 'lr',
          arch: 'l',
          watchIds: null,
          watchTeeth: null,
          toothId: 27,
        },
        28: {
          isPrimary: false,
          permanentNumber: 28,
          primaryLetter: 'S',
          quadrant: 'lr',
          arch: 'l',
          watchIds: null,
          watchTeeth: null,
          toothId: 28,
        },
        29: {
          isPrimary: false,
          permanentNumber: 29,
          primaryLetter: 'T',
          quadrant: 'lr',
          arch: 'l',
          watchIds: null,
          watchTeeth: null,
          toothId: 29,
        },
        30: {
          isPrimary: false,
          permanentNumber: 30,
          primaryLetter: '',
          quadrant: 'lr',
          arch: 'l',
          watchIds: null,
          watchTeeth: null,
          toothId: 30,
        },
        31: {
          isPrimary: false,
          permanentNumber: 31,
          primaryLetter: '',
          quadrant: 'lr',
          arch: 'l',
          watchIds: null,
          watchTeeth: null,
          toothId: 31,
        },
        32: {
          isPrimary: false,
          permanentNumber: 32,
          primaryLetter: '',
          quadrant: 'lr',
          arch: 'l',
          watchIds: null,
          watchTeeth: null,
          toothId: 32,
        },
      };
    };

    service.toothData = getInitToothData();

    service.resetToothData = function () {
      service.toothData = getInitToothData();
    };

    service.selectToothGroup = function (type, position, selected) {
      if (type == 'arch' || type == 'quadrant' || type == 'mouth') {
        angular.forEach(service.toothData, function (tooth, key) {
          if (tooth.toothId > 32) {
            var tempId = tooth.toothId;
          } else {
            var tempId = service.getPermanentNumber(key);
          }
          var listItemIndex = listHelper.findIndexByFieldValue(
            service.selection.teeth,
            'position',
            tempId
          );
          if (
            type == 'mouth' ||
            (tooth[type] == position && listItemIndex < 0 && !selected)
          ) {
            if (service.getToothId(key)) {
              patientOdontogramFactory.setSelectedTeeth(
                service.getToothId(key)
              );
            }
            service.selection.teeth.push({
              position: key,
              toothId: service.getToothId(key),
            });
          } else if (
            type == 'mouth' ||
            (tooth[type] == position && listItemIndex >= 0 && selected)
          ) {
            if (tooth.isPrimary !== true || tooth.primaryLetter !== '') {
              var idx = patientOdontogramFactory.selectedTeeth.indexOf(
                tooth.isPrimary ? tooth.primaryLetter : tooth.permanentNumber
              );
              patientOdontogramFactory.selectedTeeth.splice(idx, 1);
            }
            service.selection.teeth.splice(listItemIndex, 1);
          }
        });
      }
      return service.selection.teeth;
    };

    service.selectTooth = function (tooth, selected) {
      var listItemIndex = listHelper.findIndexByFieldValue(
        service.selection.teeth,
        'position',
        tooth.position
      );
      if (selected && listItemIndex < 0) {
        service.selection.teeth.push(tooth);
      } else if (!selected && listItemIndex >= 0) {
        service.selection.teeth.splice(listItemIndex, 1);
      }
    };

    service.getToothId = function (position) {
      if (service.toothData[position].isPrimary) {
        return service.toothData[position].primaryLetter;
      } else {
        return service.toothData[position].permanentNumber;
      }
    };

    service.getPermanentNumber = function (position) {
      return service.toothData[position].permanentNumber;
    };

    service.getToothDataByTooth = function (selectedTooth) {
      var selectedToothData = {};
      if (selectedTooth.ToothId > 32) {
        angular.forEach(service.toothData, function (tooth, key) {
          if (selectedTooth.USNumber === tooth.primaryLetter) {
            selectedToothData = tooth;
          }
        });
      } else {
        angular.forEach(service.toothData, function (tooth, key) {
          if (selectedTooth.ToothId === tooth.permanentNumber) {
            selectedToothData = tooth;
          }
        });
      }
      return selectedToothData;
    };

    service.getToothDataByToothId = function (toothId) {
      var selectedToothData = {};
      if (toothId > 32) {
        angular.forEach(service.toothData, function (tooth, key) {
          if (toothId === tooth.primaryLetter) {
            selectedToothData = tooth;
          }
        });
      } else {
        angular.forEach(service.toothData, function (tooth, key) {
          if (parseInt(toothId, 10) === parseInt(tooth.permanentNumber, 10)) {
            selectedToothData = tooth;
          }
        });
      }
      return selectedToothData;
    };

    service.unselectTeeth = function () {
      service.selection.teeth = [];
      patientOdontogramFactory.setSelectedTeeth(null);
    };
  },
]);
