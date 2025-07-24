'use strict';

var PatientAccountTransferController = angular
  .module('Soar.Patient')
  .controller('PatientAccountTransferController', [
    '$scope',
    '$routeParams',
    '$timeout',
    'PatientServices',
    'currentPatient',
    'phones',
    'accountMember',
    'emails',
    '$filter',
    '$window',
    'BoundObjectFactory',
    'toastrFactory',
    'localize',
    '$location',
    '$rootScope',
    'PatCacheFactory',
    'PatientValidationFactory',
    'userSettingsDataService',
    function (
      $scope,
      $routeParams,
      $timeout,
      patientServices,
      currentPatient,
      phones,
      accountMember,
      emails,
      $filter,
      $window,
      boundObjectFactory,
      toastrFactory,
      localize,
      $location,
      $rootScope,
      patCacheFactory,
      patientValidationFactory,
      userSettingsDataService
    ) {
      var ctrl = this;

      $scope.continue = false;
      $scope.patient = boundObjectFactory.Create(patientServices.Patient);
      $scope.patient.Data = currentPatient.Value;
      $scope.patient.Data.Phones = angular.copy(phones.Value);
      $scope.phones = angular.copy(phones.Value);
      $scope.accountMembers = accountMember.Value;
      $scope.emails = emails.Value;
      $scope.section = 0;
      $scope.previousSection = null;
      $scope.selectedLocation = 0;
      $scope.patientdata2 = []; // angular.copy($scope.patient.Data)
      $scope.isPrimary = {
        isSelectedLeft: true,
        isSelectedRight: false,
      };
      $scope.showClearButton = false;
      ctrl.previousRow = { highlighted: false };
      $scope.patientGrid = [];
      $scope.takeAmount = 20;
      $scope.query = {
        search: '',
      };
      $scope.isUpdating = false;
      $scope.isHidden = false;
      $scope.currentCount = 0;
      ctrl.currentPage = 0;
      ctrl.maxPage = 0;
      $scope.resultCount = 0;
      $scope.searchString = '';
      $scope.noRecordFound = false;
      $scope.viewOptions = [
        {
          Index: 0,
          Name: 'Split Account',
          RouteValue: 'SplitAccount',
          Url:
            '#/Patient/' +
            $scope.patient.Data.PatientId +
            '/TransferAccount/' +
            $scope.patient.Data.PersonAccount.AccountId +
            '/' +
            $routeParams.PrevLocation,
          Template:
            'App/Patients/patient-account/patient-account-transfer/patient-account-transfer.html',
          title: 'Split Account',
          Disabled:
            $scope.patient.Data.ResponsiblePersonName == 'Self' ? true : false,
          visible: true,
        },
        {
          Index: 1,
          Name: 'Merge Accounts',
          Disabled: false,
          Controls: false,
          visible: true,
        },
        {
          Index: 2,
          Name: localize.getLocalizedString('Merge Duplicate Patients'),
          Disabled: false,
          Controls: false,
          visible: true,
        },
      ];

      //Bread crumb
      ctrl.createBreadCrumb = function () {
        let patientPath = 'Patient/';
        var locationName = _.toLower($routeParams.PrevLocation);
        switch (locationName) {
          case 'account summary':
            $scope.PreviousLocationName = 'Account Summary';
            $scope.PreviousLocationRoute =
              patientPath +
              $routeParams.patientId +
              '/Summary/?tab=Account Summary';
            break;
          case 'transaction history':
            $scope.PreviousLocationName = 'Transaction History';
            $scope.PreviousLocationRoute =
              patientPath +
              $routeParams.patientId +
              '/Summary/?tab=Transaction History';
            break;
          case 'overview':
            $scope.PreviousLocationName = 'Overview';
            $scope.PreviousLocationRoute =
              patientPath + $routeParams.patientId + '/Overview/';
            break;
          case 'profile':
            $scope.PreviousLocationName = 'Profile';
            $scope.PreviousLocationRoute =
              patientPath +
              $routeParams.patientId +
              '/Summary/?tab=Profile&currentPatientId=0';
            break;
          case 'transhx beta':
            $scope.PreviousLocationName = 'TransHx Beta';
            $scope.PreviousLocationRoute =
              patientPath +
              $routeParams.patientId +
              '/Summary/?tab=TransHx Beta';
            break;
          case 'account summary beta':
            $scope.PreviousLocationName = 'Account Summary Beta';
            $scope.PreviousLocationRoute =
              patientPath +
              $routeParams.patientId +
              '/Summary/?tab=Account Summary Beta';
            break;
          default: //do nothing
        }
      };

      // back button handler
      $scope.backToPreviousLocation = function () {
        $location.path($scope.PreviousLocationRoute);
      };

      $scope.primarySelected = function (val) {
        console.log($scope);
      };

      $scope.cancel = function () {
        $location.path($scope.PreviousLocationRoute);
      };

      $scope.selectView = function (item) {
        if (item.Disabled) return;

        $scope.clearSearch();
        $scope.previousSection = $scope.section;

        switch (item.Index) {
          case 0:
            if (item.Disabled) break;
            if (
              $scope.patient.Data.PatientId ===
              $scope.patient.Data.ResponsiblePersonId
            )
              break;
            $scope.section = 0;
            $scope.selectedView = $scope.viewOptions[0];
            $scope.borderStyle_section1 = 'border-nonePrimary';
            $scope.borderStyle_section2 = 'border-primary';
            $scope.continue = false;
            $scope.patientdata2 = angular.copy($scope.patient.Data);
            $timeout(callAtTimeout, 1);
            break;
          case 1:
            if (item.Disabled) break;
            $scope.section = 1;
            $scope.selectedView = $scope.viewOptions[1];
            $scope.borderStyle_section1 = 'border-nonePrimary';
            $scope.borderStyle_section2 = 'border-primary';
            $scope.continue = true;
            $scope.patientdata2 = [];
            $timeout(callAtTimeout, 1);
            break;
          case 2:
            if (item.Disabled) break;
            $scope.section = 2;
            $scope.selectedView = $scope.viewOptions[2];
            $scope.borderStyle_section1 = 'border-primary';
            $scope.borderStyle_section2 = 'border-nonePrimary';
            $scope.patientdata2 = [];
            $scope.continue = true;
            $timeout(callAtTimeout, 1);
            break;
          default:
            break;
        }
      };

      $scope.transfer = function () {
        switch ($scope.section) {
          case 0:
            patientServices.PatientAccountTransfer.split(
              {
                patientId: $scope.patient.Data.PatientId,
              },
              ctrl.transferAccountSuccess,
              ctrl.transferAccountFailure
            );
            break;
          case 1:
            var otherAccountId = $filter('filter')(
              $scope.patientdata2.PersonAccountMember,
              { PersonId: $scope.patientdata2.PatientId },
              true
            )[0];
            patientServices.PatientAccountTransfer.merge(
              {
                patientId: $scope.patient.Data.PatientId,
                otherAccountId: otherAccountId.AccountId,
              },
              ctrl.transferAccountSuccess,
              ctrl.transferAccountFailure
            );
            break;
        }
      };

      ctrl.transferAccountSuccess = function (res) {
        toastrFactory.success(
          localize.getLocalizedString(
            'Patient successfully transferred to a new account'
          ),
          localize.getLocalizedString('Success')
        );
        patCacheFactory.ClearCache(
          patCacheFactory.GetCache('patientOverviewCache')
        );
        $window.sessionStorage.removeItem('patientFilters');
        let patientPath = 'Patient/';
        $location.path(patientPath + $routeParams.patientId + '/Overview');
      };

      ctrl.transferAccountFailure = function () {
        toastrFactory.error(
          localize.getLocalizedString(
            'Failed to retrieved. Refresh the page to try again'
          ),
          localize.getLocalizedString('Server Error')
        );
      };

      $scope.loadPatientGrid = function () {
        $scope.isSearch = false;
        if (
          ctrl.currentPage < ctrl.maxPage &&
          $scope.currentCount < $scope.resultCount
        ) {
          ctrl.currentPage++;
          $scope.updateGrid();
        }
      };
      $scope.$watch('isUpdating', function (nv, ov) {
        if (
          nv === false &&
          ov === true &&
          $scope.query.search &&
          !angular.equals($scope.query.search, ctrl.searchStringFromLastQuery)
        ) {
          // searchString has to be cleared out in order get past a check in the activateSearch function
          $scope.searchString = '';
          $scope.searchGrid($scope.query.search);
        }
      });

      $scope.searchGrid = function (searchTerm) {
        ///searching query

        ////
        if (
          $scope.previousSection != $scope.section &&
          $scope.searchString != searchTerm
        ) {
          $scope.searchString = searchTerm;
          $scope.isSearch = true;
          ctrl.maxPage = 0;
          $scope.resultCount = 0;
          ctrl.currentPage = 0;
          $scope.updateGrid();
        }
      };
      $scope.updateGrid = function () {
        if ($scope.isUpdating) return;

        $scope.filterResponsibleParty = false;
        $scope.isUpdating = true;
        ctrl.searchStringFromLastQuery = angular.copy($scope.query.search);

        var searchParams = {
          searchQuery: $scope.query.search,
          filterResponsibleParty: $scope.section === 1 ? true : false,
          skip: $scope.takeAmount * ctrl.currentPage,
          take: $scope.takeAmount,
        };
        patientServices.PatientAccountTransfer.getPatientGrid(
          searchParams
        ).$promise.then(ctrl.getPatientGridSuccess, ctrl.getPatientGridFailure);
      };

      ctrl.getPatientGridSuccess = function (res) {
        $scope.noRecordFound = false;
        if (!res.Value.length) {
          $scope.noRecordFound = true;
        }
        if (res.Value.length != $scope.takeAmount) {
          $scope.allDataDisplayed = true;
        }

        res.Value = $filter('filter')(res.Value, function (item) {
          if (
            item.PatientId !== $scope.patient.Data.PatientId &&
            item.ResponsiblePersonId !== $scope.patient.Data.ResponsiblePersonId
          ) {
            return item;
          } else item.TotalCount = item.TotalCount - 1;
        });
        if (res.Value.length > 0) {
          $scope.resultCount = res.Value[0].TotalCount;
          $scope.currentCount = res.Value.length;
          if ($scope.isSearch) $scope.patientGrid = res.Value;
          else {
            for (var i = 0; i < res.Value.length; i++) {
              var rowItem = res.Value[i];
              $scope.patientGrid.push(rowItem);
            }
          }

          ctrl.maxPage = Math.floor($scope.resultCount / $scope.takeAmount);
        } /// If no result found clear grid
        else $scope.patientGrid = [];

        $scope.isUpdating = false;
      };

      $scope.viewResult = function (result, forced) {
        $scope.showAddPerson = false;
        if (result && result.PatientId) {
          patientValidationFactory
            .PatientSearchValidation(result)
            .then(function (res) {
              var patientInfo = res;
              if (
                !patientInfo.authorization
                  .UserIsAuthorizedToAtLeastOnePatientLocation
              ) {
                patientValidationFactory.LaunchPatientLocationErrorModal(
                  patientInfo
                );
                $scope.searchTerm = '';
                $scope.selected = null;
                return;
              } else {
                ctrl.highlightResult(result);
              }
              patientValidationFactory.SetCheckingUserPatientAuthorization(
                false
              );
            });
        } else if (!patientValidationFactory.CheckingUserPatientAuthorization) {
          return false;
        }
      };

      $scope.highlightRow = function (currentRow) {
        if ($scope.viewResult(currentRow, null)) {
          return;
        }
      };

      ctrl.highlightResult = function (currentRow) {
        ctrl.previousRow.highlighted = !ctrl.previousRow.highlighted;
        currentRow.highlighted = !currentRow.highlighted;
        ctrl.previousRow = currentRow;
        $scope.patientdata2 = angular.copy(currentRow);

        ctrl.disableContinueBtn();
      };

      $scope.$watch('patientdata2', function (nv) {
        $scope.patientdata2 = $scope.patientdata2;
        // $scope.continue = $scope.patientdata2.PersonAccountMember && $scope.patientdata2.PersonAccountMember.length > 1 ? true : false;
      });

      ctrl.disableContinueBtn = function () {
        if ($scope.section !== 2) $scope.continue = false;
        //// Disable until the PBI is not yet in progress.
        if (
          $scope.accountMembers.length > 1 &&
          $scope.patient.Data.ResponsiblePersonName === 'Self'
        )
          $scope.continue = true;
        // disable and warn user if person is inactive
        if ($scope.patient.Data.IsActive === false) $scope.continue = true;
      };

      $scope.searchTimeout = null;

      $scope.$watch('query.search ', function (nv, ov) {
        if (nv === '') {
          $scope.showClearButton = false;
          $scope.clearSearch();
        } else if (nv && nv.length > 0 && nv !== ov) {
          if ($scope.searchTimeout) {
            $timeout.cancel($scope.searchTimeout);
          }
          $scope.searchTimeout = $timeout(function () {
            $scope.searchGrid(nv);
          }, 100);
          $scope.showClearButton = true;
        } else if (ov && ov.length > 0 && nv !== ov) {
          if ($scope.searchTimeout) {
            $timeout.cancel($scope.searchTimeout);
          }
          $scope.searchTimeout = $timeout(function () {
            $scope.searchGrid(nv);
          }, 100);
        }
      });
      $scope.clearSearch = function () {
        $scope.query.search = '';
        $scope.patientGrid = [];
        $scope.searchString = '';
      };
      $scope.$on('patCore:initlocation', function () {
        ctrl.location = JSON.parse(sessionStorage.getItem('userLocation'));
        $scope.selectedLocation = ctrl.location.id;
      });

      ctrl.init = function () {
        ctrl.createBreadCrumb();
        ctrl.defaultTab();
        $scope.viewOptions[0].Disabled =
          $scope.patient.Data.IsActive === false
            ? true
            : $scope.viewOptions[0].IsDisabled;
        ctrl.location = JSON.parse(sessionStorage.getItem('userLocation'));
        $scope.selectedLocation = ctrl.location.id;
      };

      $timeout(callAtTimeout, 1);

      function callAtTimeout() {
        $scope.setHeight(0);
      }

      $scope.setHeight = function (tab) {
        $('.patientAccountTransfer__section1').css('height', 'auto');
        $('.patientAccountTransfer__section2').css('height', 'auto');
        var element_section1 = angular.element(
          document.querySelector('.patientAccountTransfer__section1')
        );
        var element_section2 = angular.element(
          document.querySelector('.patientAccountTransfer__section2')
        );

        if (
          element_section1 &&
          element_section1[0] &&
          element_section2 &&
          element_section2[0]
        ) {
          var height =
            element_section1[0].offsetHeight > element_section2[0].offsetHeight
              ? element_section1[0].offsetHeight
              : element_section2[0].offsetHeight;
          $('.patientAccountTransfer__section2').css('height', height);
          $('.patientAccountTransfer__section1').css('height', height);
        }
      };
      ctrl.initializeGridComponent = function () {
        $scope.updateGrid();
      };
      ctrl.defaultTab = function () {
        $scope.section = 1;
        $scope.$parent.borderStyle_section1 = 'border-primary';
        $scope.$parent.borderStyle_section2 = 'border-nonePrimary';
        $scope.patientData2 = angular.copy($scope.patient.Data);
        $scope.continue = true;
        $scope.selectedView = $scope.viewOptions[$scope.section];
      };

      // #endregion
      ctrl.init();
      ctrl.initializeGridComponent();
    },
  ]);

PatientAccountTransferController.resolvePatientAccountTransferControl = {
  currentPatient: [
    '$route',
    'PatientServices',
    function ($route, patientServices) {
      var id = $route.current.params.patientId;

      if (id) {
        return patientServices.Patients.get({
          Id: $route.current.params.patientId,
        }).$promise;
      } else {
        return {
          Value: {
            FirstName: null,
            MiddleName: null,
            LastName: null,
            PreferredName: null,
            Prefix: null,
            Suffix: null,
            AddressLine1: null,
            AddressLine2: null,
            City: null,
            State: null,
            ZipCode: null,
            Sex: null,
            IsActive: true,
            ContactInformation: [],
            PatientGroups: [],
            CustomLabelValueDtos: [],
            PatientId: 0,
            PreferredLocation: null,
            PreferredHygienist: null,
            PreferredDentist: null,
            ResponsiblePersonType: null,
            ResponsiblePersonId: null,
            DateOfBirth: null,
            IsPatient: true,
            ImageDataUrl: null,
            ImageName: null,
            EmailAddress: null,
            EmailAddress2: null,
            FullName: null,
          },
        };
      }
    },
  ],
  phones: [
    '$route',
    'PatientServices',
    'SaveStates',
    function ($route, patientServices, saveStates) {
      var id = $route.current.params.patientId;
      if (id) {
        return patientServices.Contacts.get({
          Id: $route.current.params.patientId,
        }).$promise;
      } else {
        return {
          Value: {
            ContactId: null,
            PhoneNumber: '',
            Type: null,
            TextOk: false,
            Notes: null,
            ObjectState: saveStates.None,
          },
        };
      }
    },
  ],
  accountMember: [
    '$route',
    'PatientServices',
    function ($route, patientServices) {
      var id = $route.current.params.accounId;
      if (id) {
        return patientServices.Account.getAllAccountMembersByAccountId({
          accountId: id,
        }).$promise;
      } else {
        return {
          Value: {
            DateOfBirth: null,
            FirstName: '',
            IsActive: true,
            IsActiveAccountMember: false,
            IsPatient: true,
            IsResponsiblePerson: false,
            LastName: '',
            MiddleName: '',
            SuffixName: '',
            PreferredName: '',
          },
        };
      }
    },
  ],
  emails: [
    '$route',
    'PatientServices',
    function ($route, patientServices) {
      var id = $route.current.params.accounId;
      if (id) {
        return patientServices.Emails.get({
          Id: $route.current.params.patientId,
        }).$promise;
      } else {
        return {
          Value: {},
        };
      }
    },
  ],
};
