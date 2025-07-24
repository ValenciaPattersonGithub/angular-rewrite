'use strict';

angular
  .module('Soar.BusinessCenter')
  .controller('UserIdentificationController', [
    '$scope',
    '$timeout',
    '$filter',
    'toastrFactory',
    'localize',
    'patSecurityService',
    'StaticData',
    '$http',
    'UserServices',
    '$rootScope',
    'SaveStates',
    function (
      $scope,
      $timeout,
      $filter,
      toastrFactory,
      localize,
      patSecurityService,
      staticData,
      $http,
      userServices,
      $rootScope,
      saveState
    ) {
      var ctrl = this;

      $scope.stateLicensesRequired = false;
      $scope.editMode = $scope.user.UserId ? true : false;
      $scope.userIdentificationSectionOpen = true;
      $scope.taxonomyCodes = [];
      $scope.primaryTaxonomyCodes = [];
      $scope.secondaryTaxonomyCodes = [];
      $scope.isOnEditMode = false;
      $scope.originalStateLicenseCode = null;
      $scope.originalValue = {};

      staticData.TaxonomyCodes().then(function (res) {
        $scope.taxonomyCodes = $filter('orderBy')(res.Value, 'Category');

        $scope.primaryTaxonomyCodes = new kendo.data.ObservableArray(
          $scope.taxonomyCodes
        );
        $scope.secondaryTaxonomyCodes = new kendo.data.ObservableArray(
          $scope.taxonomyCodes
        );
        if ($scope.editMode) {
          $scope.filterPrimaryTaxonomyCodes();
          $scope.filterSecondaryTaxonomyCodes();
        }

        ctrl.setTaxonomyDropdownText();
      });

      $scope.canView = false;

      ctrl.setTaxonomyDropdownText = function () {
        var i = 0;
        if ($scope.primaryTaxonomyCodes != null) {
          for (i = 0; i < $scope.primaryTaxonomyCodes.length; i++) {
            $scope.primaryTaxonomyCodes[i].$$DisplayText =
              $scope.primaryTaxonomyCodes[i].Category +
              ' / ' +
              $scope.primaryTaxonomyCodes[i].Code;
          }
        }

        if ($scope.secondaryTaxonomyCodes != null) {
          for (i = 0; i < $scope.secondaryTaxonomyCodes.length; i++) {
            $scope.secondaryTaxonomyCodes[i].$$DisplayText =
              $scope.secondaryTaxonomyCodes[i].Category +
              ' / ' +
              $scope.secondaryTaxonomyCodes[i].Code;
          }
        }
      };

      // show all codes except secondary
      $scope.filterPrimaryTaxonomyCodes = function () {
        $scope.primaryTaxonomyCodes = new kendo.data.ObservableArray(
          $scope.taxonomyCodes
        );
        if ($scope.user.SecondaryTaxonomyId != null) {
          for (var i = 0; i < $scope.primaryTaxonomyCodes.length; i++) {
            if (
              $scope.primaryTaxonomyCodes[i].TaxonomyCodeId ==
              $scope.user.SecondaryTaxonomyId
            ) {
              var index = $scope.primaryTaxonomyCodes.indexOf(
                $scope.primaryTaxonomyCodes[i],
                1
              );
              $scope.primaryTaxonomyCodes.splice(index, 1);
            }
          }
        }
        $timeout(function () {
          $scope.$apply();
        });
      };

      // show all codes except primary
      $scope.filterSecondaryTaxonomyCodes = function () {
        $scope.secondaryTaxonomyCodes = new kendo.data.ObservableArray(
          $scope.taxonomyCodes
        );
        if ($scope.user.PrimaryTaxonomyId != null) {
          for (var i = 0; i < $scope.secondaryTaxonomyCodes.length; i++) {
            if (
              $scope.secondaryTaxonomyCodes[i].TaxonomyCodeId ==
              $scope.user.PrimaryTaxonomyId
            ) {
              var index = $scope.secondaryTaxonomyCodes.indexOf(
                $scope.secondaryTaxonomyCodes[i],
                1
              );
              $scope.secondaryTaxonomyCodes.splice(index, 1);
            }
          }
        }
        $timeout(function () {
          $scope.$apply();
        });
      };

      // Watch Npi
      $scope.$watch('user.NpiTypeOne', function () {
        $scope.validIds = $scope.userIdentificationFrm.inpNpiType1.$valid;
      });

      ctrl.isProvider = function (location) {
        if (
          location.ProviderTypeId == 1 ||
          location.ProviderTypeId == 2 ||
          location.ProviderTypeId == 3 ||
          location.ProviderTypeId == 5
        ) {
          return true;
        }
        return false;
      };

      ctrl.checkIfUserIsProviderOfService = function () {
        var result = false;
        angular.forEach($scope.userLocationSetups, function (location) {
          if (!result) {
            result = ctrl.isProvider(location);
          }
        });

        return result;
      };

      $scope.$watch('userLocationSetups', function () {
        $scope.isProviderOfService = ctrl.checkIfUserIsProviderOfService();
      });

      $scope.$watch('userLocationSetupsDataChanged', function () {
        $scope.isProviderOfService = ctrl.checkIfUserIsProviderOfService();
      });

      // Watch PrimaryTaxonomyId
      $scope.$watch('user.PrimaryTaxonomyId', function () {
        if (!$scope.user.PrimaryTaxonomyId && $scope.user.SecondaryTaxonomyId) {
          $scope.user.SecondaryTaxonomyId = null;
          $scope.TaxonomyCodesAreUnique = true;
        }

        ctrl.checkTaxonomyCodesAreUnique();
      });

      // Watch SecondaryTaxonomyId
      $scope.$watch('user.SecondaryTaxonomyId', function () {
        ctrl.checkTaxonomyCodesAreUnique();
      });

      $scope.validateTaxId = function () {
        if ($scope.user.TaxId && $scope.user.TaxId.length < 9) {
          $scope.userIdentificationFrm.inpFederalTaxId.$valid = false;
        } else {
          $scope.userIdentificationFrm.inpFederalTaxId.$valid = true;
        }
        $scope.validTaxId = $scope.userIdentificationFrm.inpFederalTaxId.$valid;
      };

      ctrl.checkAuthorization = function (amfa) {
        return patSecurityService.IsAuthorizedByAbbreviation(amfa);
      };

      ctrl.hasViewProviderInfoAccess = function () {
        return ctrl.checkAuthorization('soar-biz-bizusr-vwprov');
      };

      ctrl.hasEditProviderInfoAccess = function () {
        return ctrl.checkAuthorization('soar-biz-bizusr-etprov');
      };

      $scope.TaxonomyCodesAreUnique = true;

      ctrl.checkTaxonomyCodesAreUnique = function () {
        $scope.TaxonomyCodesAreUnique = true;

        if (
          angular.isDefined($scope.user.PrimaryTaxonomyId) &&
          $scope.user.PrimaryTaxonomyId !== null &&
          $scope.user.PrimaryTaxonomyId !== '' &&
          angular.isDefined(
            $scope.user.SecondaryTaxonomyId &&
              $scope.user.SecondaryTaxonomyId !== null &&
              $scope.user.SecondaryTaxonomyId !== ''
          )
        ) {
          if (
            $scope.user.PrimaryTaxonomyId == $scope.user.SecondaryTaxonomyId
          ) {
            $scope.TaxonomyCodesAreUnique = false;
            $scope.userIdentificationFrm.inpPrimaryTaxonomyCode.$valid = false;
            $scope.userIdentificationFrm.inpSecondaryTaxonomyCode.$valid = false;
          }
        }
      };

      $scope.canViewProviderInfo = ctrl.hasViewProviderInfoAccess();

      $scope.canEditProviderInfo = ctrl.hasEditProviderInfoAccess();

      //#region id# error message

      //#endregion

      //#region prescribing user

      // set isPrescribingUser based on user.RxUserType
      $scope.isPrescribingUser = false;
      $scope.$watch('user.RxUserType', function (nv) {
        $scope.isPrescribingUser = nv === 1;
      });

      $scope.$on('fuse:user-rx-changed', function (event, rxSettings) {
        //RxV2
        if (rxSettings) {
          if (rxSettings.roles && rxSettings.roles.length > 0) {
            var index = _.findIndex(rxSettings.roles, function (role) {
              return role.value === 1; //Looking for Prescribing role
            });

            if (index > -1) {
              $scope.isPrescribingUser = true;
            } else {
              $scope.isPrescribingUser = false;
            }
          }
        }
      });

      //#endregion

      $scope.states = [];
      $scope.getStateAbbreviation = function (stateId) {
        var result = $filter('filter')(
          $scope.originalStates,
          { StateId: stateId },
          true
        )[0];
        return result.Abbreviation;
      };

      staticData.States().then(function (res) {
        $scope.originalStates = res.Value;
        $scope.getLicenses();

        if ($scope.states.length === 0 && $scope.user.UserId === '') {
          $scope.states = [];
          _.each($scope.originalStates, function (obj) {
            var item = {
              Disabled:
                $filter('filter')(
                  $scope.UserStateLicenses,
                  { StateId: obj.StateId },
                  true
                ).length > 0,
              StateId: parseInt(obj.StateId),
              Abbreviation: obj.Abbreviation,
            };

            $scope.states.push(item);
          });
        }
      });

      // #region user licenses
      $scope.getLicenses = function () {
        if ($scope.user.UserId) {
          userServices.Licenses.get(
            { Id: $scope.user.UserId },
            $scope.userLicensesGetSuccess,
            $scope.userLicensesGetFailure
          );
        }
      };

      $scope.userLicensesGetSuccess = function (res) {
        if (!res.Value.isEmpty) {
          if (res.Value.length > 0) {
            $scope.UserStateLicenses = [];
            _.each(res.Value, function (obj) {
              var item = {
                StateLicenseId: obj.StateLicenseId,
                Flag: 0,
                StateId: parseInt(obj.StateId),
                StateAbbreviation: $scope.getStateAbbreviation(
                  parseInt(obj.StateId)
                ),
                StateLicense: obj.StateLicenseNumber,
                AnesthesiaId: obj.AnesthesiaId,
                IsEdit: false,
                ObjectState: saveState.None,
                DataTag: obj.DataTag,
                StateIdUndefined: false,
                StateLicenseUndefined: false,
              };

              $scope.UserStateLicenses.push(item);
            });
            $rootScope.$broadcast(
              'sendLicensesToValidate',
              $scope.UserStateLicenses
            );
          } else {
            $rootScope.$broadcast('sendLicensesToValidate', false);
          }
        }
        $scope.user.$$originalStateLicenses = angular.copy(
          $scope.UserStateLicenses
        );
        if ($scope.originalStates && $scope.originalStates.length > 0) {
          $scope.states = [];
          _.each($scope.originalStates, function (obj) {
            var item = {
              Disabled:
                $filter('filter')(
                  $scope.UserStateLicenses,
                  { StateId: obj.StateId },
                  true
                ).length > 0,
              StateId: parseInt(obj.StateId),
              Abbreviation: obj.Abbreviation,
            };

            $scope.states.push(item);
          });
        } else {
          staticData.States().then(function (res) {
            $scope.originalStates = res.Value;
            $scope.states = [];
            _.each($scope.originalStates, function (obj) {
              var item = {
                Disabled:
                  $filter('filter')(
                    $scope.UserStateLicenses,
                    { StateId: obj.StateId },
                    true
                  ).length > 0,
                StateId: parseInt(obj.StateId),
                Abbreviation: obj.Abbreviation,
              };

              $scope.states.push(item);
            });
          });
        }
      };

      $scope.userLicensesGetFailure = function () {
        toastrFactory.error(
          localize.getLocalizedString('{0} {1} {2}', [
            'Failed to get',
            'User',
            'Licenses',
          ]),
          localize.getLocalizedString('Error')
        );
      };

      $scope.isAdding = false;
      $scope.UserStateLicenses = [];

      $scope.NewUserStateLicense = {
        Flag: 1,
        StateId: 0,
        StateAbbreviation: '',
        StateLicense: '',
        AnesthesiaId: '',
      };

      $scope.ModelStateLicense = [
        {
          Flag: 1,
          StateId: 0,
          StateAbbreviation: 'Select State',
          StateLicense: '',
          AnesthesiaId: '',
        },
      ];

      ctrl.initialUserStateLicense = {
        Flag: 1,
        StateId: 0,
        StateAbbreviation: '',
        StateLicense: '',
        AnesthesiaId: '',
      };

      $scope.removeUserStateLicense = function (item) {
        var isNewlyAdded = item.ObjectState == 'Add';
        item.ObjectState = saveState.Delete;

        var toRemove = $scope.UserStateLicenses.indexOf(item);

        if (toRemove > -1) {
          if (isNewlyAdded) {
            $scope.UserStateLicenses.splice(toRemove, 1);
          }
          $filter('filter')(
            $scope.states,
            { StateId: item.StateId },
            true
          )[0].Disabled = false;
        }
        ctrl.sendUpdateLicense();
      };

      ctrl.sendUpdateLicense = function () {
        ///
        ///validation that user should enter a state license for state based on user location assignment again
        ///
        var copyUserStateLicenses = angular.copy($scope.UserStateLicenses);
        var updatedStateLicense = copyUserStateLicenses;
        $rootScope.$broadcast('sendUpdatedLicenses', updatedStateLicense);
        $rootScope.$broadcast('validateNewLicenses', updatedStateLicense);
      };
      $scope.editUserStateLicense = function (item, $index) {
        if ($scope.isOnEditMode) return;

        item.IsEdit = true;
        $scope.isOnEditMode = true;

        $scope.originalValue = angular.copy(item);

        $scope.originalStateLicenseCode = item.StateId;
      };

      $scope.noDLSate = false;
      $scope.noStateLicense = false;

      $scope.persistUpdateStateLicense = function (item) {
        if (item.StateLicense === undefined || item.StateLicense === '') {
          item.StateLicenseUndefined = true;
        } else item.StateLicenseUndefined = false;
        if (item.StateId === 0) {
          item.StateIdUndefined = true;
        } else item.StateIdUndefined = false;

        if (item.StateLicenseUndefined || item.StateIdUndefined) return;

        $scope.isOnEditMode = false;
        item.IsEdit = false;

        item.ObjectState = saveState.Update;

        ctrl.sendUpdateLicense();

        $filter('filter')($scope.states, {
          StateId: $scope.originalStateLicenseCode,
        })[0].Disabled = false;
        $filter('filter')($scope.states, {
          StateId: item.StateId,
        })[0].Disabled = true;

        $scope.noDLSate = false;
        $scope.noStateLicense = false;
      };
      ctrl.validateLicenseInfo = function () {
        $scope.noDLSate = false;
        $scope.noStateLicense = false;
        var isValid = true;
        if (document.getElementById('dlStates').value == 0) {
          isValid = false;
          $scope.noDLSate = true;
        }

        if ($scope.NewUserStateLicense.StateLicense.trim() === '') {
          isValid = false;
          $scope.noStateLicense = true;
        }

        ctrl.isInfoComplete = isValid;
      };

      ctrl.isInfoComplete = false;
      $scope.addUserStateLicense = function (item) {
        ctrl.validateLicenseInfo();
        if (ctrl.isInfoComplete) {
          var strStateAbbreviation = $filter('filter')(
            $scope.states,
            { StateId: parseInt(document.getElementById('dlStates').value) },
            true
          )[0].Abbreviation;
          if (
            $filter('filter')(
              $scope.UserStateLicenses,
              { StateAbbreviation: strStateAbbreviation },
              true
            ).length === 1
          ) {
            //if deleted license is added back
            var itemStateLicense = $filter('filter')(
              $scope.UserStateLicenses,
              { StateAbbreviation: strStateAbbreviation },
              true
            )[0];
            itemStateLicense.ObjectState = saveState.Update;
            itemStateLicense.StateLicense = item.StateLicense;
            itemStateLicense.AnesthesiaId = item.AnesthesiaId;
          } else {
            var newItem = {
              Flag: 1,
              StateId: parseInt(document.getElementById('dlStates').value),
              StateAbbreviation: $filter('filter')(
                $scope.states,
                {
                  StateId: parseInt(document.getElementById('dlStates').value),
                },
                true
              )[0].Abbreviation,
              StateLicense: item.StateLicense,
              AnesthesiaId: item.AnesthesiaId,
              IsEdit: false,
              ObjectState: saveState.Add,
            };

            $scope.UserStateLicenses.push(newItem);
          }

          $filter('filter')($scope.states, {
            StateId: parseInt(document.getElementById('dlStates').value),
          })[0].Disabled = true;
          $scope.clearUserStateLicense();

          $rootScope.$broadcast(
            'sendUpdatedLicenses',
            $scope.UserStateLicenses
          );
          $rootScope.$broadcast(
            'validateNewLicenses',
            $scope.UserStateLicenses
          );
        }
      };

      $scope.ModelStateLicense2 = [
        {
          Flag: 1,
          StateId: 0,
          StateAbbreviation: 'Select State',
          StateLicense: '',
          AnesthesiaId: '',
        },
      ];

      $scope.clearUserStateLicense = function () {
        $scope.NewUserStateLicense = angular.copy(ctrl.initialUserStateLicense);
        $scope.ModelStateLicense = [
          {
            Flag: 1,
            StateId: 0,
            StateAbbreviation: 'Select State',
            StateLicense: '',
            AnesthesiaId: '',
          },
        ];
        // document.getElementById('dlStates')[0].selected = true;
        $scope.isAdding = false;

        $scope.noDLSate = false;
        $scope.noStateLicense = false;
      };

      $scope.allowLicenseAdd = function () {
        if ($scope.isOnEditMode) return;

        if (isNaN(parseInt(document.getElementById('dlStates')[0].value))) {
          document.getElementById('dlStates').selectedIndex = 1;
          document.getElementById('dlStates').remove(0);
        }
        $scope.isAdding = true;
      };

      ctrl.dlHasValuye = false;
      $scope.clearStateDropdownValidation = function () {
        $scope.noDLSate = false;
        if (ctrl.dlHasValuye) {
          $scope.NewUserStateLicense = angular.copy(
            ctrl.initialUserStateLicense
          );
        } else {
          ctrl.dlHasValuye = true;
        }
      };

      $scope.clearStateLicenseValidation = function () {
        $scope.noStateLicense = false;
      };

      $scope.$on('stateLicenseValidation', function (events, args) {
        if (args != null) {
          $scope.needLicenseStates = args;
        }
      });

      $scope.updateState = function (item, $index) {
        item.StateId = 0;
        item.StateAbbreviation = '';

        if (document.getElementById('statesId' + $index).value !== '0') {
          var stateLicense = $filter('filter')(
            $scope.states,
            {
              StateId: parseInt(
                document.getElementById('statesId' + $index).value
              ),
            },
            true
          )[0].Abbreviation;

          item.StateId = parseInt(
            document.getElementById('statesId' + $index).value
          );
          item.StateAbbreviation = stateLicense;
        }
      };

      $scope.discardChangesStateLicense = function (item) {
        $scope.isOnEditMode = false;
        item.IsEdit = false;

        item.StateId = $scope.originalValue.StateId;
        item.StateLicense = $scope.originalValue.StateLicense;
        item.StateAbbreviation = $scope.originalValue.StateAbbreviation;
        item.AnesthesiaId = $scope.originalValue.AnesthesiaId;
      };
      //#endregion

      ctrl.checkDeaNumberValid = function (deaNumber) {
        if (
          deaNumber == undefined ||
          deaNumber == '' ||
          deaNumber == '' ||
          deaNumber == null
        ) {
          return true;
        }
        return false;
      };

      ctrl.validateRxAdmin = function () {
        if (
          $scope.userIdentificationFrm &&
          $scope.userIdentificationFrm.inpUserDeaNumber
        ) {
          $scope.userIdentificationFrm.inpUserDeaNumber.$setValidity(
            'deaNumberNotAllowed',
            true
          );
          if (
            $scope.user.RxUserType === 3 &&
            ctrl.checkDeaNumberValid($scope.user.DeaNumber) === false
          ) {
            $scope.userIdentificationFrm.inpUserDeaNumber.$setValidity(
              'deaNumberNotAllowed',
              false
            );
          }
        }
      };

      $scope.$watch(
        'user.RxUserType',
        function (nv, ov) {
          ctrl.validateRxAdmin();
          ctrl.setDeaNumberState();
        },
        true
      );

      $scope.$watch(
        'user.DeaNumber',
        function (nv, ov) {
          ctrl.validateRxAdmin();
        },
        true
      );

      $scope.disableDeaNumber = false;
      ctrl.setDeaNumberState = function () {
        $scope.disableDeaNumber = false;
        if (
          $scope.userIdentificationFrm &&
          $scope.userIdentificationFrm.inpUserDeaNumber &&
          ctrl.checkDeaNumberValid($scope.user.DeaNumber) === true &&
          $scope.user.RxUserType === 3
        ) {
          $scope.disableDeaNumber = true;
        }
      };
    },
  ]);
