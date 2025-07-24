'use strict';

angular.module('Soar.BusinessCenter').controller('SmartCodeSetupController', [
  '$scope',
  'localize',
  '$filter',
  'toastrFactory',
  'ServiceCode',
  'AllServiceCodes',
  '$uibModalInstance',
  function (
    $scope,
    localize,
    $filter,
    toastrFactory,
    serviceCode,
    allServiceCodes,
    $uibModalInstance
  ) {
    var ctrl = this;

    ctrl.init = function () {
      $scope.serviceCode = serviceCode.Data;
      $scope.codesByArea = {};
      $scope.loading = false;
      $scope.allServiceCodes = allServiceCodes;
      $scope.filteredServices = [];
      $scope.filteredServiceCodes = [];
      $scope.searchData = {};
      $scope.label = '';
      $scope.label2 = '';
      $scope.radioButtonModel = null;
      $scope.showSection = false;

      $scope.setCodesByAffectedArea();
      $scope.validateOptions();
      $scope.filterServices();
      $scope.setSearchData();
    };

    // Set the number of search features to display on the view, and create the label based on affected area
    $scope.setCodesByAffectedArea = function () {
      switch (parseInt($scope.serviceCode.AffectedAreaId)) {
        case 3:
          $scope.radioButtonModel = $scope.serviceCode.UseSmartCodes;
          $scope.codesByArea.count = 3;
          $scope.codesByArea.label = localize.getLocalizedString('Channel(s)');
          $scope.label = localize.getLocalizedString(
            'Use Code for entire {0}',
            ['Root']
          );
          $scope.label2 = localize.getLocalizedString(
            'Use Smart Code for Root Channels'
          );
          break;
        case 4:
          $scope.radioButtonModel = $scope.serviceCode.UseSmartCodes;
          $scope.codesByArea.count = 5;
          $scope.codesByArea.label = localize.getLocalizedString('Surface(s)');
          $scope.label = localize.getLocalizedString(
            'Use Code for all Surfaces'
          );
          $scope.label2 = localize.getLocalizedString(
            'Use Smart Code for Surfaces'
          );
          break;
        case 5:
          $scope.radioButtonModel = $scope.serviceCode.UseCodeForRangeOfTeeth;
          $scope.codesByArea.count = 2;
          $scope.codesByArea.RoT = [
            localize.getLocalizedString('Upper'),
            localize.getLocalizedString('Lower'),
          ];
          $scope.label = localize.getLocalizedString(
            'Use this Code Once per Tooth'
          );
          $scope.label2 = localize.getLocalizedString(
            'Use this Code Once for a Range of Teeth'
          );
          break;
      }
    };

    // Create a term for each of the smart code ids, based on affected area
    $scope.setSearchData = function () {
      if ($scope.codesByArea && $scope.codesByArea != {}) {
        var searchTerms = [];
        for (var i = 1; i <= $scope.codesByArea.count; i++) {
          var smartCode = 'SmartCode' + i + 'Id';
          if ($scope.serviceCode[smartCode] != null) {
            var currentCode = $filter('filter')($scope.allServiceCodes, {
              ServiceCodeId: $scope.serviceCode[smartCode],
            })[0];
            if (currentCode) {
              searchTerms.push({ term: currentCode.Code });
            } else {
              searchTerms.push({ term: null });
            }
          } else {
            searchTerms.push({ term: null });
          }
        }
      }
      $scope.searchData.searchTerms = searchTerms;
    };

    // Capture the result from the typeahead search, and update values
    $scope.selectResult = function (result, $index) {
      $scope.hasErrors = false;
      if (result) {
        var index = $index + 1;
        var smartCode = 'SmartCode' + index + 'Id';
        $scope.searchData.searchTerms[$index].term = result.Code;
        $scope.serviceCode[smartCode] = result.ServiceCodeId;
      }
    };

    // Filter the cached list of services based on the current service codes affect area
    $scope.filterServices = function () {
      if (!_.isEmpty($scope.allServiceCodes)) {
        _.forEach($scope.allServiceCodes, function (code) {
          if (
            code.AffectedAreaId == $scope.serviceCode.AffectedAreaId &&
            $scope.serviceCode.AffectedAreaId != 5
          ) {
            $scope.filteredServices.push(code);
          } else if (
            $scope.serviceCode.AffectedAreaId == 5 &&
            code.AffectedAreaId == 5 &&
            code.UseCodeForRangeOfTeeth
          ) {
            $scope.filteredServices.push(code);
          }
        });
      }
    };

    // Re-roll the list based on what is entered into the typeahead
    $scope.filterServiceCodes = function (term) {
      // clear hasErrors during input
      $scope.hasErrors = false;
      var resultSet = [];
      if (term) {
        resultSet = $filter('searchOnParticularColumn')(
          $scope.filteredServices,
          term,
          ['Code', 'CdtCodeName', 'Description', 'Fee']
        );
      }

      $scope.filteredServiceCodes = resultSet;
    };

    // Clear the currently selected typeahed and remove the value from this service codes smart code index
    $scope.clear = function ($index) {
      $scope.hasErrors = false;
      var index = $index + 1;
      var smartCode = 'SmartCode' + index + 'Id';
      $scope.searchData.searchTerms[$index].term = '';
      $scope.serviceCode[smartCode] = null;
    };

    // UI show/hide logic
    $scope.validateOptions = function () {
      switch (parseInt($scope.serviceCode.AffectedAreaId)) {
        case 3:
        case 4:
          $scope.serviceCode.UseSmartCodes = $scope.radioButtonModel;
          if (
            $scope.serviceCode.UseSmartCodes == true ||
            $scope.serviceCode.UseSmartCodes == 'true'
          ) {
            return true;
          }
          break;
        case 5:
          $scope.serviceCode.UseCodeForRangeOfTeeth = $scope.radioButtonModel;
          if (
            $scope.serviceCode.UseCodeForRangeOfTeeth == 'false' ||
            !$scope.serviceCode.UseCodeForRangeOfTeeth
          ) {
            $scope.serviceCode.UseSmartCodes = false;
          }
          if (
            ($scope.serviceCode.UseCodeForRangeOfTeeth == true ||
              $scope.serviceCode.UseCodeForRangeOfTeeth == 'true') &&
            ($scope.serviceCode.UseSmartCodes == true ||
              $scope.serviceCode.UseSmartCodes == 'true')
          ) {
            return true;
          }
          break;
        default:
          return false;
      }
    };

    // Change function for all toggles
    $scope.toggle = function () {
      $scope.showSection = $scope.validateOptions();
    };

    $scope.close = function () {
      var selectionsAreValid = ctrl.validateSmartCodeSelection(
        $scope.searchData.searchTerms
      );
      if (selectionsAreValid) {
        // Need to recheck the search terms in case they have entered in manually one of the relevant fields
        for (var i = 0; i <= $scope.searchData.searchTerms.length - 1; i++) {
          var index = i + 1;
          var term = $scope.searchData.searchTerms[i].term;
          var smartCode = 'SmartCode' + index + 'Id';
          if (term && term != null && term.length == 5) {
            var resultSet = $filter(
              'searchOnParticularColumn'
            )($scope.allServiceCodes, term, ['Code'])[0];
            if (resultSet && resultSet != null) {
              $scope.serviceCode[smartCode] = resultSet.ServiceCodeId;
            }
          } else if (term == '') {
            $scope.serviceCode[smartCode] = null;
          }
        }
        $uibModalInstance.close($scope.serviceCode);
      }
    };

    $scope.cancel = function () {
      $uibModalInstance.dismiss();
    };

    // validate smart code inputs
    ctrl.validateSmartCodeSelection = function (searchTerms) {
      var formIsValid = true;
      _.forEach(searchTerms, function (searchTerm) {
        searchTerm.$$invalidCode = false;
        searchTerm.$$validationMessage = '';
        // searchTerm can be empty, if so this is a valid entry
        if (!_.isNil(searchTerm.term) && !_.isEmpty(searchTerm.term)) {
          // look the smart code service code selection up in the list, is it a valid one for this service
          var match = _.find($scope.allServiceCodes, function (serviceCode) {
            return serviceCode.Code === searchTerm.term;
          });
          // if we find a match in allServiceCodes
          if (match) {
            // if AffectedAreaId = Tooth, AffectedAreaId must match and both must have UseCodeForRangeOfTeeth= true
            if (
              parseInt($scope.serviceCode.AffectedAreaId) === 5 &&
              $scope.serviceCode.UseCodeForRangeOfTeeth === true
            ) {
              searchTerm.$$invalidCode =
                parseInt(match.AffectedAreaId) ===
                  parseInt($scope.serviceCode.AffectedAreaId) &&
                match.UseCodeForRangeOfTeeth !== true;
              if (searchTerm.$$invalidCode === true) {
                formIsValid = false;
                searchTerm.$$validationMessage =
                  'Smart codes for this service code must all be allowed to be used with a range of teeth.';
              }
            }
            // if AffectedAreaId other than Tooth, AffectedAreaId must match
            if (
              parseInt($scope.serviceCode.AffectedAreaId) === 5 &&
              $scope.serviceCode.UseCodeForRangeOfTeeth === false
            ) {
              searchTerm.$$invalidCode =
                parseInt(match.AffectedAreaId) !==
                parseInt($scope.serviceCode.AffectedAreaId);
              if (searchTerm.$$invalidCode === true) {
                formIsValid = false;
                searchTerm.$$validationMessage =
                  'Smart codes for this service code must have the same affected area as this service code.';
              }
            }
            // if AffectedAreaId other than Tooth, AffectedAreaId must match
            if (parseInt($scope.serviceCode.AffectedAreaId != 5)) {
              searchTerm.$$invalidCode =
                parseInt(match.AffectedAreaId) !==
                parseInt($scope.serviceCode.AffectedAreaId);
              if (searchTerm.$$invalidCode === true) {
                formIsValid = false;
                searchTerm.$$validationMessage =
                  'Smart codes for this service code must have the same affected area as this service code.';
              }
            }
          } else {
            // if this code is not in list
            searchTerm.$$invalidCode = true;
            if (searchTerm.$$invalidCode === true) {
              formIsValid = false;
              searchTerm.$$validationMessage =
                'Smart codes for this service code must have the same affected area as this service code.';
            }
          }
        }
      });
      $scope.hasErrors = !formIsValid;
      return formIsValid;
    };
    ctrl.init();
  },
]);
