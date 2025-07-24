'use strict';

function isInteger(value) {
  // Introduce this to address an IE problem.
  // See - https://stackoverflow.com/questions/26482645/number-isintegerx-which-is-created-can-not-work-in-ie
  return (
    typeof value === 'number' && isFinite(value) && Math.floor(value) === value
  );
}

// Define Filters
angular
  .module('Soar.BusinessCenter')
  .filter('unsubmittedClaimCount', function () {
    //Filter to calculate unsubmitted claims count
    return function (claims, scope) {
      var count = 0;
      var specificClaims = angular.copy(claims);
      if (claims && scope && scope.$parent) {
        if (scope.$parent.selectedaccountMemberOption) {
          specificClaims = _.filter(claims, function (item) {
            return (
              item.ClaimCommon.ApplicationPatientId ===
              scope.$parent.selectedaccountMemberOption
            );
          });
        }

        angular.forEach(specificClaims, function (item) {
          if (
            item.inLocation === true &&
            (item.ClaimCommon.Status === 1 || item.ClaimCommon.Status === 3)
          )
            count++;
        });

        scope.displayCount = true;
      }
      return count;
    };
  })
  .filter('submittedClaimCount', function () {
    //Filter to calculate sumbitted claims count
    return function (claims, scope) {
      var count = 0;
      var specificClaims = angular.copy(claims);
      if (claims && scope && scope.$parent) {
        if (scope.$parent.selectedaccountMemberOption) {
          specificClaims = _.filter(claims, function (item) {
            return (
              item.ClaimCommon.ApplicationPatientId ===
              scope.$parent.selectedaccountMemberOption
            );
          });
        }

        angular.forEach(specificClaims, function (item) {
          if (
            item.inLocation === true &&
            (item.ClaimCommon.Status === 2 ||
              item.ClaimCommon.Status === 4 ||
              item.ClaimCommon.Status === 5 ||
              item.ClaimCommon.Status === 6 ||
              item.ClaimCommon.Status === 9)
          )
            count++;
        });

        scope.displayCount = true;
      }
      return count;
    };
  })
  .filter('alertClaimCount', function () {
    //Filter to calculate alert claims count
    return function (claims, scope) {
      var count = 0;
      var specificClaims = angular.copy(claims);
      if (claims && scope && scope.$parent) {
        if (scope.$parent.selectedaccountMemberOption) {
          specificClaims = _.filter(claims, function (item) {
            return (
              item.ClaimCommon.ApplicationPatientId ===
              scope.$parent.selectedaccountMemberOption
            );
          });
        }

        angular.forEach(specificClaims, function (item) {
          if (
            item.inLocation === true &&
            (item.ClaimCommon.Status === 6 ||
              item.ClaimEntity.HasErrors === true)
          )
            count++;
        });

        scope.displayCount = true;
      }
      return count;
    };
  })
  .filter('allClaimCount', function () {
    // Filter to calculate all claims count
    return function (claims, scope) {
      var count = 0;
      var specificClaims = angular.copy(claims);
      if (claims && scope && scope.$parent) {
        if (scope.$parent.selectedaccountMemberOption) {
          specificClaims = _.filter(claims, function (item) {
            return (
              item.ClaimCommon.ApplicationPatientId ===
              scope.$parent.selectedaccountMemberOption
            );
          });
        }

        angular.forEach(specificClaims, function (item) {
          if (item.inLocation === true) count++;
        });

        scope.displayCount = true;
      }
      return count;
    };
  })
  .filter('allClaimCountWithDefault', function () {
    // Filter to calculate all claims count
    return function (claims, scope) {
      var count = 0;
      var specificClaims = angular.copy(claims);
      if (claims && scope && scope.$parent) {
        if (scope.$parent.selectedaccountMemberOption) {
          specificClaims = _.filter(claims, function (item) {
            return (
              item.ClaimCommon.ApplicationPatientId ===
              scope.$parent.selectedaccountMemberOption
            );
          });
        }

        angular.forEach(specificClaims, function (item) {
          if (
            item.inLocation === true &&
            !(
              item.IsReceived === true &&
              item.ClaimCommon.IsActualClaim === false
            ) &&
            (item.ClaimCommon.Status === 1 ||
              item.ClaimCommon.Status === 2 ||
              item.ClaimCommon.Status === 3 ||
              item.ClaimCommon.Status === 4 ||
              item.ClaimCommon.Status === 5 ||
              item.ClaimCommon.Status === 6 ||
              item.ClaimCommon.Status === 9)
          )
            count++;
        });

        scope.displayCount = true;
      }
      return count;
    };
  })
  .filter('unsubmittedClaimFee', function () {
    // Filter to calculate unsubmitted claims total fees
    return function (claims, scope) {
      var fee = 0;
      var claimsToSum = angular.copy(claims);
      if (claims && scope && scope.$parent) {
        if (scope.$parent.selectedaccountMemberOption) {
          claimsToSum = _.filter(claims, function (item) {
            return (
              item.ClaimCommon.ApplicationPatientId ===
              scope.$parent.selectedaccountMemberOption
            );
          });
        }
        angular.forEach(claimsToSum, function (item) {
          if (
            item.inLocation === true &&
            (item.ClaimCommon.Status === 1 || item.ClaimCommon.Status === 3)
          )
            fee += item.feesCalculated;
        });
      }
      return fee;
    };
  })
  .filter('submittedClaimFee', function () {
    // Filter to calculate submitted claims total fees
    return function (claims, scope) {
      var fee = 0;
      var claimsToSum = angular.copy(claims);
      if (claims && scope && scope.$parent) {
        if (scope.$parent.selectedaccountMemberOption) {
          claimsToSum = _.filter(claims, function (item) {
            return (
              item.ClaimCommon.ApplicationPatientId ===
              scope.$parent.selectedaccountMemberOption
            );
          });
        }
        angular.forEach(claimsToSum, function (item) {
          if (
            item.inLocation === true &&
            (item.ClaimCommon.Status === 2 ||
              item.ClaimCommon.Status === 4 ||
              item.ClaimCommon.Status === 5 ||
              item.ClaimCommon.Status === 6 ||
              item.ClaimCommon.Status === 9)
          )
            fee += item.feesCalculated;
        });
      }
      return fee;
    };
  })
  .filter('alertClaimFee', function () {
    // Filter to calculate alert claims total fees
    return function (claims, scope) {
      var fee = 0;
      var claimsToSum = angular.copy(claims);
      if (claims && scope && scope.$parent) {
        if (scope.$parent.selectedaccountMemberOption) {
          claimsToSum = _.filter(claims, function (item) {
            return (
              item.ClaimCommon.ApplicationPatientId ===
              scope.$parent.selectedaccountMemberOption
            );
          });
        }
        angular.forEach(claimsToSum, function (item) {
          if (
            item.inLocation === true &&
            (item.ClaimCommon.Status === 6 || item.ClaimEntity.HasErrors)
          )
            fee += item.feesCalculated;
        });
      }
      return fee;
    };
  })
  .filter('getActivityAction', [
    'localize',
    'ActivityActions',
    function (localize, activityActions) {
      // Converts an ActivityAction enum value to a localized display label
      var actionNames = activityActions.map(function (action) {
        return action['Name'];
      });
      return function (enumval) {
        var str = '';
        if (
          enumval &&
          isInteger(enumval) &&
          enumval > 0 &&
          enumval <= actionNames.length
        ) {
          str = actionNames[enumval - 1];
        }
        if (str !== '') {
          str = localize.getLocalizedString(str);
        }
        return str;
      };
    },
  ])
  .filter('getActivityArea', [
    'localize',
    'ActivityAreas',
    function (localize, activityAreas) {
      // Converts an ActivityArea enum value to a localized display label
      var areaNames = activityAreas.map(function (area) {
        return area['Name'];
      });
      return function (enumval) {
        var str = '';
        if (
          enumval &&
          isInteger(enumval) &&
          enumval > 0 &&
          enumval <= areaNames.length
        ) {
          str = areaNames[enumval - 1];
        }
        if (str !== '') {
          str = localize.getLocalizedString(str);
        }
        return str;
      };
    },
  ])
  .filter('getActivityType', [
    'localize',
    'ActivityTypes',
    function (localize, activityTypes) {
      // Converts an ActivityType enum value to a localized display label
      var typeNames = activityTypes.map(function (type) {
        return type['Name'];
      });
      return function (enumval) {
        var str = '';
        if (
          enumval &&
          isInteger(enumval) &&
          enumval > 0 &&
          enumval <= typeNames.length
        ) {
          str = typeNames[enumval - 1];
        }
        if (str !== '') {
          str = localize.getLocalizedString(str);
        }
        return str;
      };
    },
  ])
  .filter('statusDefinition', function () {
    return function (status) {
      switch (status) {
        case 1:
          return 'Unsubmitted Paper';
        case 2:
          return 'Printed';
        case 3:
          return 'Unsubmitted Electronic';
        case 4:
          return 'In Process';
        case 5:
          return 'Accepted Electronic';
        case 6:
          return 'Rejected';
        case 7:
          return 'Closed';
        case 8:
          return 'Closed - Paid';
        case 9:
          return 'In Process';
        default:
          return '';
      }
    };
  })
  .filter('priorityLabel', function () {
    return function (priority) {
      switch (priority) {
        case 0:
          return 'Primary';
        case 1:
          return 'Secondary';
        case 2:
          return '3rd Supplemental';
        case 3:
          return '4th Supplemental';
        case 4:
          return '5th Supplemental';
        case 5:
          return '6th Supplemental';
        default:
          return '';
      }
    };
  })
  .filter('claimPatientName', function () {
    return function (claim) {
      var value = '';
      if (claim) {
        if (claim.PatientFirstName) {
          value += claim.PatientFirstName;
        }
        if (claim.PatientLastName) {
          value += ' ' + claim.PatientLastName;
        }
        if (claim.PatientSuffix) {
          value += ' ' + claim.PatientSuffix;
        }
      }
      value = value !== '' ? value.trim() + "'s" : "Unknown's";
      return value;
    };
  })
  .filter('claimTotalFees', [
    'currencyFilter',
    function (currencyFilter) {
      return function (claim) {
        if (claim && claim.Details) {
          return currencyFilter(
            _.reduce(
              claim.Details,
              function (total, det) {
                return total + det.Fee;
              },
              0
            )
          );
        } else {
          return currencyFilter(0);
        }
      };
    },
  ])
  .filter('medicalClaimDiagnosisCodesAreValid', function () {
    return function (claim) {
      //find the first element with no value
      //take only the part of the array after that element
      //if there are any values that are not null then the diagnosis code is invalid
      var firstEmpty = claim.DiagnosisCodes.findIndex(function (element) {
        return !element;
      });
      if (firstEmpty === -1) {
        return true;
      }
      var afterFirstEmpty = claim.DiagnosisCodes.slice(
        firstEmpty,
        claim.DiagnosisCodes.length
      );
      return (
        afterFirstEmpty.findIndex(function (element) {
          return element;
        }) === -1
      );
    };
  });
