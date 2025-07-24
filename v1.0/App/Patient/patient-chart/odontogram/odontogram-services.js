'use strict';

// parts are renamed to stages
// Define Services
angular.module('Soar.Patient').service('OdontogramUtilities', function () {
  var teethList = [];
  var setTeethDefinitions = function (teethDefs) {
    if (teethDefs && !_.isEmpty(teethDefs.Teeth)) {
      teethList = _.map(teethDefs.Teeth, 'USNumber');
    }
  };

  var setMesialDistal = function (statusObj, toothIndex, direction) {
    if (
      (direction !== 'positive' && direction !== 'negative') ||
      toothIndex < 0 ||
      toothIndex >= 32
    ) {
      return;
    }

    var mesialPos = toothIndex < 8 || (toothIndex >= 16 && toothIndex < 24);
    var positive = direction === 'positive';

    var mesDis =
      (positive && mesialPos) || (!positive && !mesialPos)
        ? 'mesial'
        : 'distal';

    if (
      statusObj.direction &&
      statusObj.direction !== '' &&
      statusObj.direction !== mesDis
    ) {
      statusObj.direction = 'both';
    } else {
      statusObj.direction = mesDis;
    }
  };

  var calculateBridgeData = function (data, toothChart) {
    var bridgeData = {};
    var teeth = toothChart.split(';');
    var inBridge = false;
    var lastAbutmentIndex = -1;
    for (var i = 0; i < teeth.length; i++) {
      var tooth = teeth[i];
      var status = data[tooth];

      var type = status ? status.type : '';

      switch (type) {
        case 'missing':
          break;
        case 'pontic':
          inBridge = true;
          if (lastAbutmentIndex !== -1) {
            setMesialDistal(
              bridgeData[teeth[lastAbutmentIndex]],
              lastAbutmentIndex,
              'positive'
            );
          }
          lastAbutmentIndex = -1;
          break;
        case 'abutment':
          if (inBridge) {
            setMesialDistal(status, i, 'negative');
          }
          inBridge = true;
          if (lastAbutmentIndex !== -1) {
            setMesialDistal(
              bridgeData[teeth[lastAbutmentIndex]],
              lastAbutmentIndex,
              'positive'
            );
          }
          lastAbutmentIndex = i;
          break;
        default:
          inBridge = false;
          lastAbutmentIndex = -1;
          break;
      }

      if (status) {
        if (i === 0 || i === 15 || i === 16 || i === 31) {
          status.direction = 'mesial';
        }
        bridgeData[tooth] = status;
      }

      if (i === 15 || i === 31) {
        inBridge = false;
        lastAbutmentIndex = -1;
      }
    }

    return bridgeData;
  };

  var isToothInRange = function (range, selectedTooth) {
    var returnValue = false;
    if (teethList && teethList.length > 0) {
      range = range.split(',');
      _.forEach(range, function (tooth) {
        if (!returnValue) {
          if (tooth.indexOf('-') !== -1) {
            var start = tooth.slice(0, tooth.indexOf('-'));
            var end = tooth.slice(tooth.indexOf('-') + 1);
            var indexOfSelectedTooth = teethList.indexOf(
              selectedTooth.toString()
            );
            if (
              indexOfSelectedTooth !== -1 &&
              indexOfSelectedTooth >= teethList.indexOf(start) &&
              indexOfSelectedTooth <= teethList.indexOf(end)
            ) {
              returnValue = true;
            }
          } else {
            returnValue = selectedTooth.toString() === tooth;
          }
        }
      });
    }
    return returnValue;
  };

  var isRange = function (tooth) {
    return !tooth
      ? false
      : tooth.toString().indexOf('-') >= 1 && tooth.toString().length >= 3;
  };

  var getTeethInRange = function (inputValue) {
    var retVal = [];
    var ranges = inputValue.toString().split(',');
    _.forEach(ranges, function (range) {
      if (!isRange(range)) {
        retVal.push(range);
      } else if (teethList && teethList.length > 0) {
        var split = range.split('-');
        if (split.length === 2) {
          var start = split[0];
          var end = split[1];
          var startTooth = teethList.indexOf(start);
          var endTooth = teethList.indexOf(end);
          for (var i = startTooth; i <= endTooth; i++) {
            retVal.push(teethList[i]);
          }
        }
      }
    });

    return retVal;
  };

  var orderGroupMap = {
    services: {
      1: 1, // Proposed
      2: 3, // Referred
      3: 9, // Rejected
      4: 6, // Completed
      5: 4, // Pending
      6: 8, // Existing
      7: 2, // Accepted
      8: 7, // ReferredCompleted
    },
    conditions: {
      1: 5, // Present
      2: 10, // Resolved
    },
  };
  var getOrderGroup = function (ledgerService) {
    if (ledgerService.RecordType === 'ServiceTransaction') {
      return orderGroupMap.services[ledgerService.StatusId];
    } else if (ledgerService.RecordType === 'Condition') {
      return orderGroupMap.conditions[ledgerService.StatusId];
    }
  };

  return {
    calculateBridgeData: calculateBridgeData,
    isToothInRange: isToothInRange,
    setTeethDefinitions: setTeethDefinitions,
    isRange: isRange,
    getTeethInRange: getTeethInRange,
    getOrderGroup: getOrderGroup,
  };
});
