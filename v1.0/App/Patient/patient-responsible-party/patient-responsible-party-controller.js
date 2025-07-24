'use strict';
var app = angular.module('Soar.Patient');

var PatientResponsiblePartyController = app.controller(
  'PatientResponsiblePartyController',
  [
    '$scope',
    '$timeout',
    '$filter',
    '$uibModal',
    'localize',
    'toastrFactory',
    'PatientServices',
    'ModalFactory',
    'GlobalSearchFactory',
    'PersonServices',
    'ListHelper',
    'PatientValidationFactory',
    function (
      $scope,
      $timeout,
      $filter,
      $uibModal,
      localize,
      toastrFactory,
      patientServices,
      modalFactory,
      globalSearchFactory,
      personServices,
      listHelper,
      patientValidationFactory
    ) {
      var ctrl = this;
      $scope.disableResponsiblePerson = $scope.patient.ResponsiblePersonId
        ? true
        : false;
      $scope.originalRpType = angular.copy(
        $scope.patient.ResponsiblePersonType
      );
      $scope.showSearchRp = $scope.originalRpType === 2 ? true : false;
      $scope.showRpMessage = function () {
        if (
          !$scope.patient.IsResponsiblePersonEditable &&
          $scope.patient.ResponsiblePersonId != null
        ) {
          $scope.rpMessage =
            'Please use the Transfer functionality as this patient has account activity that needs to be transferred.';
        } else {
          $scope.rpMessage = '';
        }
      };

      // scope vars
      ctrl.initializeSearch = function () {
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

      $scope.responsiblePersonOptions = ['1', '2'];
      $scope.responsiblePersonLabels = ['Self', 'Other'];

      ctrl.initializeSearch();

      ctrl.responsiblePersonSuccess = function (response) {
        $scope.responsiblePerson = response.Value;
        if ($scope.responsiblePerson != null) {
          //$scope.searchTerm = $scope.searchString = $scope.responsiblePerson.FirstName + ' ' + $scope.responsiblePerson.LastName + '          ' + $filter('toShortDisplayDateUtc')($scope.responsiblePerson.DateOfBirth) + '          ' + $filter('tel')($scope.responsiblePerson.PhoneNumber);
          $scope.searchTerm = $scope.searchString =
            $scope.responsiblePerson.FirstName +
            ' ' +
            $scope.responsiblePerson.LastName +
            ' (RP)' +
            '          ' +
            'ID: ' +
            $scope.responsiblePerson.PatientCode +
            '          ' +
            'DoB: ' +
            $filter('toShortDisplayDateUtc')(
              $scope.responsiblePerson.DateOfBirth
            );
        }
      };
      ctrl.responsiblePersonFailure = function (error) {
        toastrFactory.error(
          localize.getLocalizedString('Failed to load responsible person'),
          localize.getLocalizedString('Server Error')
        );
      };

      ctrl.getResponsiblePersonById = function (responsiblePersonId) {
        return patientServices.Patients.get(
          { Id: responsiblePersonId },
          ctrl.responsiblePersonSuccess,
          ctrl.responsiblePersonFailure
        );
      };

      ctrl.setResponsiblePerson = function () {
        if ($scope.patient.ResponsiblePersonId != null) {
          ctrl.getResponsiblePersonById($scope.patient.ResponsiblePersonId);
        }
      };

      ctrl.setResponsiblePerson();
      // Boolean to display search loading gif
      $scope.searchIsQueryingServer = false;
      // Boolean to include inactive patients in search (not active yet)
      $scope.includeInactivePatients = false;

      $scope.validSearch = function (searchString) {
        // if format XXX- allow search
        var validPhoneRegex = new RegExp(/^[0-9]{3}?\-$/);
        if (validPhoneRegex.test(searchString)) {
          return true;
        }

        // if format X or XX or XXX prevent search
        var phoneRegex = new RegExp(/^[0-9]{1,3}?$/);
        if (phoneRegex.test(searchString)) {
          return false;
        }

        // if format XX- or XX/ allow search
        var validDateRegex = new RegExp(/^[0-9]{1,2}?\-?$/);
        if (validDateRegex.test(searchString)) {
          return true;
        }

        // if format XX- or XX/ allow search
        var dateRegex = new RegExp(/^[0-9]{1,2}?\/?$/);
        if (dateRegex.test(searchString)) {
          return true;
        }
        return true;
      };

      // Watch the input
      $scope.$watch('searchTerm', function (nv, ov) {
        if (nv && nv.length > 0 && nv != ov) {
          if ($scope.validSearch(nv)) {
            if ($scope.searchTimeout) {
              $timeout.cancel($scope.searchTimeout);
            }
            $scope.searchTimeout = $timeout(function () {
              $scope.activateSearch(nv);
            }, 500);
          }
        } else if (ov && ov.length > 0 && nv != ov) {
          if ($scope.validSearch(nv)) {
            if ($scope.searchTimeout) {
              $timeout.cancel($scope.searchTimeout);
            }
            $scope.searchTimeout = $timeout(function () {
              $scope.activateSearch(nv);
            }, 500);
          }
        }
      });

      $scope.$watch('patient.DateOfBirth', function (nv, ov) {
        if (ov != nv) {
          $scope.ageCheck = true;
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
            return;
          }
          // set variable to indicate status of search
          $scope.searchIsQueryingServer = true;

          var searchParams = {
            searchFor: $scope.searchString,
            skip: $scope.searchResults.length,
            take: $scope.takeAmount,
            sortBy: $scope.sortCol,
            includeInactive: $scope.includeInactive,
            excludePatient: $scope.patient.PatientId,
          };

          patientServices.Patients.search(
            searchParams,
            $scope.searchGetOnSuccess,
            $scope.searchGetOnError
          );
        }
      };

      $scope.searchGetOnSuccess = function (res) {
        $scope.resultCount = res.Count;
        // Set the patient list
        $scope.searchResults = $scope.searchResults.concat(res.Value);
        // set variable to indicate whether any results
        $scope.noSearchResults = $scope.resultCount === 0;
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

      // notify of searchstring change
      $scope.activateSearch = function (searchTerm) {
        if ($scope.searchString != searchTerm && $scope.disableParty !== true) {
          // reset limit when search changes
          $scope.limit = 15;
          $scope.limitResults = true;
          $scope.searchString = searchTerm;
          $scope.resultCount = 0;
          $scope.searchResults = [];
          $scope.search();
          //$scope.validateResponsiblePerson();
        }
      };

      // clear the selected responsible person
      $scope.clearResponsiblePerson = function () {
        ctrl.initializeSearch();
        $scope.patient.ResponsiblePersonId = null;
        $scope.responsiblePerson = null;
        $scope.disableResponsiblePerson = false;
        if ($scope.patient.ResponsiblePersonType == '1') {
          $scope.patient.ResponsiblePersonType = null;
          angular.element('#inpSelf').focus();
        } else if ($scope.patient.ResponsiblePersonType == '2') {
          $timeout(function () {
            angular.element('#personTypeAheadInput').focus();
          }, 200);
        }
        $scope.validate();
      };

      $scope.continueResponsiblePerson = function () {
        //Nothing here
        $scope.disableResponsiblePerson = true;
        $scope.searchTerm =
          $scope.selectedRp.FirstName +
          ' ' +
          $scope.selectedRp.LastName +
          ' (RP)' +
          '          ' +
          'ID: ' +
          $scope.selectedRp.PatientCode +
          '          ' +
          'DoB: ' +
          $filter('toShortDisplayDateUtc')($scope.selectedRp.DateOfBirth);
        $scope.validate();
      };

      // Un check radio button
      $scope.uncheckResponsiblePersonType = function (event) {
        if ($scope.patient.ResponsiblePersonType == event.target.value) {
          $scope.patient.ResponsiblePersonType = null;
          $scope.clearResponsiblePerson();
        }
      };
      //On space key press
      $scope.checkUncheckResponsiblePersonTypeOnKeyDown = function (event) {
        if (event.keyCode === 32) {
          if ($scope.patient.ResponsiblePersonType === event.target.value) {
            $timeout(function () {
              ctrl.initializeSearch();
              $scope.patient.ResponsiblePersonId = null;
              $scope.responsiblePerson = null;
              $scope.disableResponsiblePerson = false;
              if (event.target.value == '1') {
                $scope.patient.ResponsiblePersonType = null;
                angular.element('#inpSelf').focus();
              } else if (event.target.value == '2') {
                $scope.patient.ResponsiblePersonType = null;
                angular.element('#inpOther').focus();
              }
              $scope.validate();
            }, 200);
          } else {
            $timeout(function () {
              $scope.patient.ResponsiblePersonType = event.target.value;
              $scope.responsiblePersonTypeChange();
            }, 200);
          }
        }
      };
      $scope.patientSignatureChange = function () {
        if ($scope.patient.IsSignatureOnFile) {
          ctrl.confirmSignatureChange();
        }
      };

      ctrl.confirmSignatureChange = function (claim, plan) {
        var title = localize.getLocalizedString(
          'Confirm Signature Authorization'
        );
        var message = localize.getLocalizedString(
          'By selecting this option, the patient has authorized the practice to use their signature for insurance claims and agrees to pay for any services not covered by insurance.'
        );
        var button1Text = localize.getLocalizedString('Yes');
        var button2Text = localize.getLocalizedString('No');
        modalFactory
          .ConfirmModal(title, message, button1Text, button2Text)
          .then(ctrl.signatureConfirm, ctrl.signatureDecline);
      };
      ctrl.signatureConfirm = function () {
        //leaving this empty for now
      };

      ctrl.signatureDecline = function () {
        $scope.patient.IsSignatureOnFile = 0;
      };

      // on responsible person type change
      $scope.responsiblePersonTypeChange = function () {
        ctrl.originalPatientInfo = angular.copy($scope.patient);
        if ($scope.patient.IsResponsiblePersonEditable) {
          $timeout(function () {
            if (
              $scope.patient.ResponsiblePersonType != null &&
              $scope.patient.ResponsiblePersonType == '1'
            ) {
              $scope.patient = ctrl.originalPatientInfo;
              $scope.patient.ResponsiblePersonType = '1';
              $scope.showSearchRp = false;
              $scope.validateAge($scope.patient);
            } else {
              $timeout(function () {
                $scope.showSearchRp = true;
                angular.element('#personTypeAheadInput').focus();
              }, 200);
            }
            $scope.validate();
            ctrl.initializeSearch();
            $scope.responsiblePerson = null;
            $scope.patient.ResponsiblePersonId = null;
            $scope.disableResponsiblePerson = false;
          }, 100);
        } else {
          $scope.patient.ResponsiblePersonType = $scope.originalRpType;
          $scope.showRpMessage();
          $timeout(function () {
            $scope.patient.ResponsiblePersonType = $scope.originalRpType;
            $scope.showSearchRp = $scope.originalRpType === 2 ? true : false;
          }, 50);
        }
      };

      // validate age
      $scope.validateAge = function (patient) {
        if (
          patient != null &&
          patient.DateOfBirth &&
          patient.DateOfBirth.length > 0
        ) {
          var age = $filter('age')(patient.DateOfBirth);
          if (age < 18 && $scope.ageCheck) {
            $scope.ageCheck = false;
            var patientName = [patient.FirstName, patient.LastName]
              .filter(function (text) {
                return text;
              })
              .join(' ');
            var message = localize.getLocalizedString(
              '{0} is under the age of 18.',
              [patientName]
            );
            var title = localize.getLocalizedString(
              'Responsible Person Validation'
            );
            var button1Text = localize.getLocalizedString('Continue');
            var button2Text = localize.getLocalizedString('Cancel');
            modalFactory
              .ConfirmModal(title, message, button1Text, button2Text)
              .then(
                $scope.continueResponsiblePerson,
                $scope.clearResponsiblePerson
              );
          } else {
            $scope.disableResponsiblePerson =
              $scope.patient != null && $scope.patient.ResponsiblePersonId
                ? true
                : false;

            if ($scope.selectedRp != null) {
              $scope.searchTerm =
                $scope.selectedRp.FirstName +
                ' ' +
                $scope.selectedRp.LastName +
                ' (RP)' +
                '          ' +
                'ID: ' +
                $scope.selectedRp.PatientCode +
                '          ' +
                'DoB: ' +
                $filter('toShortDisplayDateUtc')($scope.selectedRp.DateOfBirth);
            }
          }
        } else {
          $scope.disableResponsiblePerson =
            $scope.patient != null && $scope.patient.ResponsiblePersonId
              ? true
              : false;
          $scope.searchTerm =
            $scope.selectedRp != null && $scope.selectedRp != undefined
              ? $scope.selectedRp.FirstName +
                ' ' +
                $scope.selectedRp.LastName +
                ' (RP)' +
                '          ' +
                'ID: ' +
                $scope.selectedRp.PatientCode +
                '          ' +
                'DoB: ' +
                $filter('toShortDisplayDateUtc')($scope.selectedRp.DateOfBirth)
              : $scope.searchTerm;
        }
        $scope.validate();
      };

      // check for responsible person account and age
      ctrl.checkForResponsiblePersonAccountAndAge = function (patient) {
        var message, title, button1Text;
        if (
          $scope.patient != null &&
          $scope.patient.ResponsiblePersonId == null
        ) {
          message = localize.getLocalizedString(
            '{0} {1} cannot be selected as the responsible person as he/she is not the responsible person for his/her own account.',
            [
              patient.FirstName ? patient.FirstName : '',
              patient.LastName ? patient.LastName : '',
            ]
          );
          title = localize.getLocalizedString('Responsible Person Validation');
          button1Text = localize.getLocalizedString('OK');
          modalFactory
            .ConfirmModal(title, message, button1Text)
            .then($scope.clearResponsiblePerson);
        } else {
          $scope.ageCheck = true;
          $scope.validateAge(patient);
        }
      };

      $scope.validate = function () {
        $scope.isValid =
          $scope.patient != null &&
          $scope.patient.ResponsiblePersonType != null &&
          $scope.patient.ResponsiblePersonType === '2'
            ? $scope.patient.ResponsiblePersonId != null
              ? true
              : false
            : true;
      };

      ctrl.populateSelectedResult = function () {
        $scope.searchTerm =
          $scope.selectedRp.FirstName +
          ' ' +
          $scope.selectedRp.LastName +
          '          ' +
          'ID: ' +
          $scope.selectedRp.PatientCode +
          '          ' +
          'DoB: ' +
          $filter('toShortDisplayDateUtc')($scope.selectedRp.DateOfBirth);
        $scope.responsiblePerson = $scope.selectedRp;
        patientServices.Patients.get(
          { Id: $scope.responsiblePerson.PatientId },
          function (res) {
            if (
              res &&
              res.Value &&
              res.Value.PersonAccount &&
              res.Value.PersonAccount.PersonAccountMember &&
              res.Value.PersonAccount.PersonAccountMember.ResponsiblePersonId ==
                $scope.responsiblePerson.PatientId
            ) {
              $scope.responsiblePerson.PersonAccount = res.Value.PersonAccount;
              $scope.patient.ResponsiblePersonId =
                $scope.responsiblePerson.PatientId;
              $scope.patient.PersonAccount = {
                ReceivesStatements: res.Value.PersonAccount.ReceivesStatements,
                ReceivesFinanceCharges:
                  res.Value.PersonAccount.ReceivesFinanceCharges,
              };
              ctrl.checkForResponsiblePersonAccountAndAge(
                $scope.responsiblePerson
              );
            } else {
              $scope.patient.ResponsiblePersonId = null;
              ctrl.checkForResponsiblePersonAccountAndAge(
                $scope.responsiblePerson
              );
            }
          },
          function () {
            $scope.patient.ResponsiblePersonId = null;
            ctrl.checkForResponsiblePersonAccountAndAge(
              $scope.responsiblePerson
            );
          }
        );
        // add selected person id to 'most recent' list
        ctrl.saveMostRecent($scope.responsiblePerson.PatientId);
      };

      //#region get patient
      ctrl.PersonServicesGetSuccess = function (res) {
        if (res.Value) {
          $timeout(function () {
            $scope.person = res.Value;
            $scope.tempPerson = angular.copy($scope.person);

            var userLocation = JSON.parse(
              sessionStorage.getItem('userLocation')
            );

            var locationMatch = patientValidationFactory.CheckPatientLocation(
              $scope.tempPerson,
              userLocation
            );

            if (locationMatch) {
              ctrl.populateSelectedResult();
            } else {
              patientValidationFactory.SetCheckingUserPatientAuthorization(
                true
              );
              patientValidationFactory
                .PatientSearchValidation($scope.selectedRp)
                .then(function (res) {
                  var patientInfo = res;
                  if (
                    !patientInfo.authorization
                      .UserIsAuthorizedToAtLeastOnePatientLocation
                  ) {
                    patientValidationFactory.LaunchPatientLocationErrorModal(
                      patientInfo
                    );
                    patientValidationFactory.SetCheckingUserPatientAuthorization(
                      false
                    );
                    $scope.searchTerm = '';
                    $scope.selectedRp = null;
                  } else {
                    ctrl.populateSelectedResult();
                  }
                  patientValidationFactory.SetCheckingUserPatientAuthorization(
                    false
                  );
                });
            }

            $scope.searchIsQueryingServer = false;
            $scope.disableResponsiblePerson = false;
          }, 500);
        }
      };

      ctrl.PersonServicesGetFailure = function () {
        toastrFactory.error(
          localize.getLocalizedString(
            'Failed to retrieve the {0}. Refresh the page to try again.',
            ['patient']
          ),
          localize.getLocalizedString('Server Error')
        );
      };

      ctrl.getPatient = function (patientId) {
        personServices.Persons.get(
          { Id: patientId },
          ctrl.PersonServicesGetSuccess,
          ctrl.PersonServicesGetFailure
        );
      };

      // Handle click event to select patient
      $scope.selectResult = function (patient) {
        $scope.selectedRp = angular.copy(patient);
        $scope.searchIsQueryingServer = true;
        $scope.disableResponsiblePerson = true;
        ctrl.getPatient(patient.PatientId);
      };

      // set focus on responsible person
      ctrl.setFocusOnResponsiblePerson = function () {
        $scope.defaultExpanded = true;
        //Fix for focus and scrolling element into view
        angular.element('#inpSelf').focus();
        if ($('header') != null && $('#lblResponsiblePerson') != null) {
          var h = $('header').height();
          var eTop = $('#lblResponsiblePerson').offset().top;
          var s = eTop - (h + 20);
          $(window).scrollTop(s);
        }
      };
      // Set focus on "Self" responsible person radio button on page load
      $timeout(function () {
        if ($scope.defaultFocus) {
          ctrl.setFocusOnResponsiblePerson();
        }
      }, 300);

      // Set focus on "Self" responsible person radio button when defaultFocus property is set to true
      $scope.$watch('defaultFocus', function (nv, ov) {
        if (nv && nv != ov) {
          $timeout(function () {
            ctrl.setFocusOnResponsiblePerson();
          }, 300);
        }
      });
      $scope.$on('patsoar:setreasponsiblepersonfocus', function () {
        $timeout(function () {
          if ($scope.defaultFocus) {
            ctrl.setFocusOnResponsiblePerson();
          }
        }, 500);
      });

      $scope.$on('resetRpValues', function () {
        $timeout(function () {
          ctrl.setResponsiblePerson();
          $scope.originalRpType = angular.copy(
            $scope.patient.ResponsiblePersonType
          );
          $scope.showSearchRp = $scope.originalRpType === 2 ? true : false;
          $scope.rpMessage = '';
        }, 500);
      });

      //#region recents
      ctrl.saveMostRecent = function (personId) {
        globalSearchFactory.SaveMostRecentPerson(personId);
      };
      // #endregion
    },
  ]
);
