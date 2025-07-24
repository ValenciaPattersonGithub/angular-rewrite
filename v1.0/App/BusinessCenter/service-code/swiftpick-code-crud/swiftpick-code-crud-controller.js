'use strict';

var app = angular.module('Soar.BusinessCenter');
var SwiftPickCodeCrudController = app
  .controller('SwiftPickCodeCrudController', [
    '$scope',
    '$timeout',
    '$filter',
    '$uibModal',
    'localize',
    'BoundObjectFactory',
    'ServiceCodeCrudService',
    'ServiceCode',
    '$uibModalInstance',
    'SearchFactory',
    'ServiceCodesService',
    'ModalFactory',
    'toastrFactory',
    'PatCacheFactory',
    'referenceDataService',
    function (
      $scope,
      $timeout,
      $filter,
      $uibModal,
      localize,
      boundObjectFactory,
      serviceCodeCrudService,
      serviceCode,
      $uibModalInstance,
      searchFactory,
      serviceCodesService,
      modalFactory,
      toastrFactory,
      cacheFactory,
      referenceDataService
    ) {
      var ctrl = this;
      var searchTextTimeout;

      // create boundObjectFactory object for handling crud actions
      $scope.serviceCode = boundObjectFactory.Create(
        serviceCodeCrudService.Dtos.ServiceCode
      );

      // save the serviceCode object into the scope variable
      $scope.serviceCode.Data = serviceCode;
      $scope.serviceCode.Name = $scope.serviceCode.Data.IsSwiftPickCode
        ? localize.getLocalizedString('Swift Code')
        : localize.getLocalizedString('Service Code');

      //Store initial copy of service code, to check for data modification
      $scope.serviceCodeInitial = angular.copy($scope.serviceCode.Data);
      $scope.dataHasChanged = false;
      $scope.confirmCancel = false;

      // Set the fees for swift picks when editing
      ctrl.setSwiftpickFees = function (serviceCode) {
        if (serviceCode.SwiftPickServiceCodes) {
          var codesList = $scope.serviceCode.Data.SwiftPickServiceCodes;
          var services = [];
          $scope.serviceCode.Data.SwiftPickServiceCodes = [];
          angular.forEach(codesList, function (code) {
            services.push(referenceDataService.setFeesByLocation(code));
          });
          $scope.serviceCode.Data.SwiftPickServiceCodes = services;
        }
      };

      ctrl.setSwiftpickFees(serviceCode);

      // handle save success flow
      $scope.serviceCode.AfterSaveSuccess = function () {
        $uibModalInstance.close($scope.serviceCode.Data);
      };

      // save swift pick code
      $scope.saveSwiftPickCode = function () {
        // FORMAT DATA HERE.
        $scope.serviceCode.Validate();

        //Check if duplicate swift pick code exists before saving
        var serviceCodeId = $scope.serviceCode.Data.ServiceCodeId
          ? $scope.serviceCode.Data.ServiceCodeId
          : '00000000-0000-0000-0000-000000000000';
        $scope.serviceCode.CheckDuplicate(
          { ServiceCodeId: serviceCodeId, Code: $scope.serviceCode.Data.Code },
          $scope.saveSwiftPickCodeCheckUniqueServiceCodeGetSuccess,
          $scope.checkUniqueServiceCodeGetFailure
        );
      };

      // Success callback handler to notify user after verifying unique service code before saving
      $scope.saveSwiftPickCodeCheckUniqueServiceCodeGetSuccess = function (
        successResponse
      ) {
        // Check if service code already exists
        if ($scope.serviceCode.IsDuplicate == true) {
          $scope.uniqueSwiftPickCodeServerMessage = localize.getLocalizedString(
            'A code with this name already exists...'
          );

          // Set focus to code input box
          $timeout(function () {
            angular.element('#inpSwiftPickCode').focus();
          }, 0);
        } else {
          $scope.isAtleastOneServiceCode =
            $scope.serviceCode.Data.SwiftPickServiceCodes.length > 0
              ? true
              : false;
          // if we're valid  and atleast, one service code
          if ($scope.serviceCode.Valid && $scope.isAtleastOneServiceCode) {
            if ($scope.serviceCode.Data.Fee > 0)
              $scope.serviceCode.Data.Fee = 0;
            if ($scope.displayActiveStatusConfirmation)
              $scope.serviceCode.Data.IsActive = true;

            if ($scope.serviceCode.Data.LocationSpecificInfo) {
              $scope.serviceCode.Data.LocationSpecificInfo = null;
            }
            if ($scope.serviceCode.Data.TaxableServiceTypeId) {
              $scope.serviceCode.Data.TaxableServiceTypeId = 0;
            }

            // clearing the service code cache since one is being added
            var scCache = cacheFactory.GetCache('ServiceCodesService');
            if (scCache) {
              cacheFactory.ClearCache(scCache);
            }

            $scope.serviceCode.Save();
          }
        }
      };

      $filter('sumFilter')($scope.serviceCode.Data.SwiftPickServiceCodes);

      // cancel changes made to service code and close modal
      $scope.cancelChanges = function () {
        $uibModalInstance.dismiss();
      };

      // set editMode to true or false
      $scope.editMode = $scope.serviceCode.Data.ServiceCodeId ? true : false;

      //Removes the service code
      $scope.removeServiceCode = function (selectedService) {
        if ($scope.serviceCode.Data.IsActive) {
          if (
            $scope.editMode &&
            $scope.serviceCode.Data.SwiftPickServiceCodes.indexOf(
              selectedService
            ) == 0 &&
            $scope.serviceCode.Data.SwiftPickServiceCodes.length == 1
          ) {
            $scope.serviceCode.Data.SwiftPickServiceCodes = [];
          } else
            $scope.serviceCode.Data.SwiftPickServiceCodes.splice(
              $scope.serviceCode.Data.SwiftPickServiceCodes.indexOf(
                selectedService
              ),
              1
            );
        }
      };

      //Begin - Service Code Search
      $scope.initializeSearch = function () {
        // initial take amount
        $scope.takeAmount = 45;
        // initial limit (rows showing)
        $scope.limit = 15;
        $scope.limitResults = true;
        // Empty string for search
        $scope.searchTerm = '';
        //current searchString
        $scope.searchString = '';
        // Set the default search variables
        $scope.resultCount = 0;
        // to hold result list
        $scope.searchResults = [];
        // Search timeout queue
        $scope.searchTimeout = null;
      };

      $scope.initializeSearch();

      // Boolean to display search loading gif
      $scope.searchIsQueryingServer = false;

      // Watch the input
      $scope.$watch('searchTerm', function (nv, ov) {
        if (nv && nv.length > 0 && nv != ov) {
          if ($scope.searchTimeout) {
            $timeout.cancel($scope.searchTimeout);
          }
          $scope.searchTimeout = $timeout(function () {
            $scope.activateSearch(nv);
          }, 500);
        } else if (ov && ov.length > 0 && nv != ov) {
          if ($scope.searchTimeout) {
            $timeout.cancel($scope.searchTimeout);
          }
          $scope.searchTimeout = $timeout(function () {
            $scope.activateSearch(nv);
          }, 500);
        }
      });

      // Perform the search
      $scope.search = function (term) {
        if (angular.isUndefined(term)) {
          // Don't search if not needed!
          if (
            $scope.searchIsQueryingServer ||
            ($scope.resultCount > 0 &&
              $scope.searchResults.length == $scope.resultCount) ||
            $scope.searchString.length === 0
          ) {
            $scope.noSearchResults = false;
            return;
          }
          // set variable to indicate status of search
          $scope.searchIsQueryingServer = true;

          var searchParams = {
            search: $scope.searchString,
            skip: $scope.searchResults.length,
            take: $scope.takeAmount,
            sortBy: $scope.sortCol,
            includeInactive: $scope.includeInactive,
          };
          serviceCodesService.search(
            searchParams,
            $scope.searchGetOnSuccess,
            $scope.searchGetOnError
          );
        }
      };

      $scope.searchGetOnSuccess = function (res) {
        $scope.resultCount = res.Count;
        // Set the cdt code list
        $scope.searchResults = referenceDataService.setFeesByLocation(
          res.Value
        );
        // set variable to indicate whether any results
        $scope.noSearchResults =
          $scope.searchString.length <= 0 ? false : $scope.resultCount === 0;
        // reset  variable to indicate status of search = false
        $scope.searchIsQueryingServer = false;
      };

      $scope.searchGetOnError = function () {
        // Toastr alert to show error
        toastrFactory.error(
          localize.getLocalizedString('Please search again.'),
          localize.getLocalizedString('Server Error')
        );
        // if search fails reset all scope var
        $scope.searchIsQueryingServer = false;
        $scope.resultCount = 0;
        $scope.searchResults = [];
        $scope.noSearchResults = true;
      };

      // notify of search string change
      $scope.activateSearch = function (searchTerm) {
        if ($scope.searchString != searchTerm) {
          // reset limit when search changes
          $scope.limit = 15;
          $scope.limitResults = true;
          $scope.searchString = searchTerm;
          $scope.resultCount = 0;
          $scope.searchResults = [];
          $scope.search();
        } else {
          $scope.noSearchResults = false;
        }
      };

      // Handle click event to select service code
      $scope.selectResult = function (selectedServices) {
        if (selectedServices) {
          if (angular.isArray(selectedServices)) {
            angular.forEach(selectedServices, function (service) {
              $scope.serviceCode.Data.SwiftPickServiceCodes.push(service);
            });
          } else {
            $scope.serviceCode.Data.SwiftPickServiceCodes.push(
              selectedServices
            );
            $scope.searchTerm = selectedServices.Code;
          }
        }
      };

      //Edit - Service Code Search

      // Verify unique swift pick code from server
      $scope.checkUniqueServiceCode = function () {
        if ($scope.serviceCode.Data.Code) {
          var serviceCodeId = $scope.serviceCode.Data.ServiceCodeId
            ? $scope.serviceCode.Data.ServiceCodeId
            : '00000000-0000-0000-0000-000000000000';
          $scope.serviceCode.CheckDuplicate(
            {
              ServiceCodeId: serviceCodeId,
              Code: $scope.serviceCode.Data.Code,
            },
            $scope.checkUniqueServiceCodeGetSuccess,
            $scope.checkUniqueServiceCodeGetFailure
          );
        }
      };

      // Success callback handler to notify user after verifying unique service code
      $scope.checkUniqueServiceCodeGetSuccess = function (successResponse) {
        // Check if service code already exists
        if ($scope.serviceCode.IsDuplicate == true)
          $scope.uniqueSwiftPickCodeServerMessage = localize.getLocalizedString(
            'A code with this name already exists...'
          );
      };

      // Error callback handler to notify user after it failed to verify unique service code
      $scope.checkUniqueServiceCodeGetFailure = function (errorResponse) {
        $scope.serviceCode.IsDuplicate = true;
        $scope.uniqueSwiftPickCodeServerMessage = localize.getLocalizedString(
          'Could not verify unique Swift Code. Please try again'
        );
      };

      // Function to reset duplicate flag on service-code value change
      $scope.serviceCodeOnChange = function () {
        $scope.serviceCode.IsDuplicate = false;
      };

      //Function to reset the displayActiveStatusConfirmation property
      $scope.cancelStatusConfirmation = function () {
        //Bug #32050 fix: timeout & jquery syntax is used to handle double click on checkbox in chrome and firefox.
        $timeout(function () {
          $scope.displayActiveStatusConfirmation = false;
          $scope.serviceCode.Data.IsActive = true;
          angular.element('#inpActive').prop('checked', true);
        }, 300);
      };

      //Function to reset the displayActiveStatusConfirmation property
      $scope.okStatusConfirmation = function () {
        //Bug #32050 fix: timeout & jquery syntax is used to handle double click on checkbox in chrome and firefox.
        $timeout(function () {
          $scope.displayActiveStatusConfirmation = false;
          $scope.serviceCode.Data.IsActive = false;
          angular.element('#inpActive').prop('checked', false);
        }, 300);
      };

      //Callback function to handle change event for displayActiveStatusConfirmation checkbox
      $scope.swiftPickCodeIsActiveOnChange = function () {
        //Bug #32050 fix: timeout & jquery syntax is used to handle double click on checkbox in chrome and firefox.
        $timeout(function () {
          if ($scope.serviceCode.Data.IsActive == false) {
            $scope.displayActiveStatusConfirmation = true;
            $scope.serviceCode.Data.IsActive = false;
            angular.element('#inpActive').prop('checked', false);
          } else {
            $scope.displayActiveStatusConfirmation = false;
            $scope.serviceCode.Data.IsActive = true;
            angular.element('#inpActive').prop('checked', true);
          }
        }, 300);
      };

      //Watch service code data for any changes
      $scope.$watch(
        'serviceCode.Data',
        function () {
          if ($scope.dataHasChanged == false)
            $scope.dataHasChanged = !angular.equals(
              $scope.serviceCode.Data,
              $scope.serviceCodeInitial
            );
        },
        true
      );

      //callback function to handle cancel function
      $scope.cancelOnClick = function () {
        if ($scope.dataHasChanged == true) {
          modalFactory.CancelModal().then($scope.cancelChanges);
        } else $scope.cancelChanges();
      };

      //select service codes from list
      $scope.showServiceCodesPicker = function () {
        var modalInstance = modalFactory.Modal({
          templateUrl:
            'App/BusinessCenter/service-code/service-codes-picker-modal/service-codes-picker-modal.html',
          keyboard: false,
          size: 'lg',
          windowClass: 'center-modal',
          backdrop: 'static',
          controller: 'ServiceCodesPickerModalController',
          amfa: 'soar-biz-bsvccd-spcasc',
          resolve: {},
        });
        modalInstance.result.then($scope.selectResult);
      };

      $scope.inputKeyDown = function (e) {
        if (e.keyCode == 13) {
          e.originalEvent.preventDefault();
        }
      };
    },
  ])
  .filter('sumFilter', function () {
    return function (values) {
      var total = 0;
      for (var i = 0; i < values.length; i++) {
        total = total + values[i].$$locationFee;
      }
      return total;
    };
  });
