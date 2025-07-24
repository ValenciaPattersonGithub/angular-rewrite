'use strict';

var app = angular.module('Soar.Patient');

app.controller('InformedConsentAgreementController', [
  '$scope',
  '$rootScope',
  'localize',
  'toastrFactory',
  '$timeout',
  'patSecurityService',
  'InformedConsentFactory',
  '$routeParams',
  '$location',
  'UsersFactory',
  'locationService',
  'fileService',
  'referenceDataService',
  function (
    $scope,
    $rootScope,
    localize,
    toastrFactory,
    $timeout,
    patSecurityService,
    informedConsentFactory,
    $routeParams,
    $location,
    usersFactory,
    locationService,
    fileService,
    referenceDataService
  ) {
    var ctrl = this;
    $scope.patientSignatureTitle = localize.getLocalizedString(
      'Patient Signature'
    );
    $scope.witnessSignatureTitle = localize.getLocalizedString(
      'Witness Signature'
    );

    //#region auth

    // TODO print amfa?

    $scope.authAccess = informedConsentFactory.access();
    if (!$scope.authAccess.View) {
      toastrFactory.error(
        patSecurityService.generateMessage('soar-clin-cplan-icview'),
        'Not Authorized'
      );
      event.preventDefault();
      $location.path('/');
    }

    //#endregion

    //get todays date
    $scope.todaysDate = moment();

    //#region init

    ctrl.$onInit = function () {
      $scope.patientInfo = {};
      $scope.patientInfo.PatientId = $routeParams.patientId;
      ctrl.printDisplay();
      ctrl.loadDocumentFromStorage();
      ctrl.getCurrentUser();
      ctrl.getCurrentLocation();
    };

    ctrl.loadDocumentFromStorage = function () {
      var localStorageIdentifier = 'document_' + $routeParams.fileAllocationId;
      $scope.informedConsentAgreement = JSON.parse(
        localStorage.getItem(localStorageIdentifier)
      );
      localStorage.removeItem(localStorageIdentifier);
    };

    // styling for print/display
    ctrl.printDisplay = function () {
      angular.element('body').attr('style', 'padding-top:0;');
      angular.element('.view-container').attr('style', 'background-color:#fff');
      angular.element('.view-container').attr('style', 'width:95%');
      angular.element('.top-header').remove();
      angular.element('.feedback-container').remove();
    };

    //#endregion

    //#region location and user info
    $scope.user = { UserCode: '' };
    ctrl.getCurrentUser = function () {
      var userContext = JSON.parse(sessionStorage.getItem('userContext'));
      var userId = userContext.Result.User.UserId;
      usersFactory.User(userId).then(function (res) {
        $scope.user = res.Value;
      });
    };

    $scope.currentLocation = { name: '' };

    /**
     * Get current location.
     *
     * @returns {angular.IPromise}
     */
    ctrl.getCurrentLocation = function () {
      $scope.currentLocation = locationService.getCurrentLocation();

      // get location information by id
      return referenceDataService
        .getData(referenceDataService.entityNames.locations)
        .then(function (locations) {
          var ofcLocation = _.find(locations, {
            LocationId: $scope.currentLocation.id,
          });
          $scope.location = ofcLocation;
          return $scope.location;
        });
    };

    //#endregion

    ctrl.$onInit();
  },
]);
