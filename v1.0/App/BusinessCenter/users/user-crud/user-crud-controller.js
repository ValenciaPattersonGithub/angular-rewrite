/* global toastr:false */

'use strict';

var app = angular.module('Soar.BusinessCenter');

var UserCrudControl = app.controller('UserCrudController', [
  '$rootScope',
  '$scope',
  '$routeParams',
  '$location',
  '$uibModal',
  '$q',
  'toastrFactory',
  'patSecurityService',
  'practiceService',
  'localize',
  'UserServices',
  'StaticData',
  'SaveStates',
  '$timeout',
  'ListHelper',
  'ModalFactory',
  'SoarConfig',
  'TeamMemberIdentifierService',
  '$filter',
  'RxUserType',
  'UsersFactory',
  'referenceDataService',
  'FeatureService',
  'tabLauncher',
  'TimeZoneFactory',
  'UserLocationsSetupFactory',
  'RoleNames',
  'RolesFactory',
  'RxService',
  'UserLoginTimesFactory',
  'EnterpriseSettingService',
  function (
    $rootScope,
    $scope,
    $routeParams,
    $location,
    $uibModal,
    $q,
    toastrFactory,
    patSecurityService,
    practiceService,
    localize,
    userServices,
    staticData,
    saveStates,
    $timeout,
    listHelper,
    modalFactory,
    soarConfig,
    teamMemberIdentifierService,
    $filter,
    rxUserType,
    usersFactory,
    referenceDataService,
    featureService,
    tabLauncher,
    timeZoneFactory,
    userLocationsSetupFactory,
    roleNames,
    rolesFactory,
    rxService,
    userLoginTimesFactory,
    enterpriseSettingService
  ) {
    var ctrl = this;

    $scope.loginTimePhase2 = false;
    $scope.loginTimeEnabled = false;

    ctrl.initUserLoginTimes = function () {
      var practice = practiceService.getCurrentPractice();
      var enableUltPhase2 = soarConfig.enableUlt;

      if (enableUltPhase2 === 'true') {
        //If phase2 is enabled, completely ignore whatever is set for phase1
        $scope.loginTimePhase2 = true;
        enterpriseSettingService.Enterprise.get({
          practiceId: practice.id,
        }).$promise.then(
          function (enterprise) {
            enterpriseSettingService
              .EnterpriseSettings(enterprise.id)
              .getById({
                enterpriseId: enterprise.id,
                enterpriseSettingName: 'PracticeLevelRestrictedUserTimes',
              })
              .$promise.then(
                function (ultSetting) {
                  if (ultSetting.settingValue === 'true') {
                    $scope.loginTimeEnabled = true;
                  } else {
                    $scope.loginTimeEnabled = false;
                  }
                },
                function () {
                  //If this call fails, let's assume that they don't have an enterprise setting set up
                  $scope.loginTimeEnabled = false;
                }
              );
          },
          function () {
            //EnterpriseGetFailed
            $scope.loginTimeEnabled = false;
          }
        );
      }
    };

    ctrl.initUserLoginTimes();

    //#region Initial Setup
    $scope.roleId = null;
    $scope.updatedRoleId = null;
    $scope.userLocationSetups = [];
    $scope.userLocationSetupsDataChanged = false;
    $scope.userActivated = false;
    $scope.hasInvalidTimes = false;

    // track whether new location roles are changing,
    // if so wait for the resolve before updating rx access
    //$scope.rolesHaveChanged = false;
    $scope.editMode = $routeParams.userId ? true : false;
    $scope.hasAccess = false;
    $scope.personalInfoRegex =
      '[^a-zA-Z0-9. !""#$%&\'()*+,-/:;<=>?@[\\]^_`{|}~d]$';

    $scope.practiceId = practiceService.getCurrentPractice().id;

    // list of locationids to create rx users with
    $scope.rxLocationIds = [];

    // list of provider types with names and ids
    $scope.providerTypes = [];
    staticData.ProviderTypes().then(function (res) {
      $scope.providerTypes = res.Value;
    });

    //breadcrumbs
    ctrl.hasAdditionalIdentifierAccess = false;
    $scope.dataForCrudOperation = {};
    $scope.dataForCrudOperation = { DataHasChanged: false };
    $scope.dataForCrudOperation.BreadCrumbs = [
      {
        name: localize.getLocalizedString('Practice Settings'),
        path: '/BusinessCenter/PracticeSettings/',
        title: 'Practice Settings',
      },
      {
        name: localize.getLocalizedString('Add a Team Member'),
        title: 'Add a Team Member',
      },
    ];

    // handle URL update for breadcrumbs
    $scope.changePageState = function (breadcrumb) {
      ctrl.currentBreadcrumb = breadcrumb;
      document.title = breadcrumb.title;
      $location.url(_.escape(ctrl.currentBreadcrumb.path));
    };
    //#endregion
    // sorting the taxonomy codes after promise
    $scope.taxonomyCodesSpecialties = staticData.TaxonomyCodes();
    $scope.taxonomyCodesSpecialties.then(function (result) {
      if (result) {
        $scope.taxonomyCodesSpecialties.values = $filter('orderBy')(
          result.Value,
          'Category'
        );
      }
    });

    $scope.displayTaxonomyCodeByField = function (id, field) {
      var result = listHelper.findItemByFieldValue(
        $scope.taxonomyCodesSpecialties.values,
        'TaxonomyCodeId',
        id
      );
      return result ? result[field] : '';
    };

    $scope.getProviderOnClaimsLabel = function (providerOnClaimsId) {
      if (!providerOnClaimsId || providerOnClaimsId == 1) {
        return 'Self';
      } else {
        return 'Other';
      }
    };

    // get all practice locations
    $scope.practiceLocations = referenceDataService.get(
      referenceDataService.entityNames.locations
    );

    /** gets set if navigated here from location page */
    ctrl.locationId = $routeParams.locationId;

    /** gets set if navigated here from assign roles page */
    ctrl.fromAssignRoles = $routeParams.fromAssignRoles;

    // if ctrl.locationId is set, they got here from locations, send them back there
    ctrl.previousPath = 'BusinessCenter/Users/';
    if (ctrl.locationId) {
      ctrl.previousPath =
        'BusinessCenter/PracticeSettings/Locations/?locationId=' +
        ctrl.locationId;
    }
    if (ctrl.fromAssignRoles) {
      ctrl.previousPath = 'BusinessCenter/Users/Roles/';
    }

    $scope.tenant = soarConfig.idaTenant;

    $scope.usernameMaxLength = 255;

    $scope.rxSettings = { roles: [], locations: [] };

    // template should get retrieved in the resolve
    if ($scope.taxonomyDropdownTemplateData.data) {
      $scope.taxonomyDropdownTemplate =
        $scope.taxonomyDropdownTemplateData.data;
    }

    // ie hack, $pristine is being set to false incorrectly after the first time this form is loaded
    $timeout(function () {
      if ($scope.frmUserCrud) {
        $scope.frmUserCrud.$setPristine();
      }
    }, 1400);

    // TODO - sg/temp solution until we work the global bug for the scrolling problem
    $timeout(function () {
      document.body.scrollTop = 0;
    }, 500);

    // fill states lists
    staticData.States().then(function (res) {
      $scope.stateList = res.Value;
      //$rootScope.$broadcast('sendStateList', res.Value);
    });

    //#endregion
    //#region Demo Mode
    $scope.developmentMode = false;
    featureService.isEnabled('DevelopmentMode').then(function (res) {
      $scope.developmentMode = res;
    });
    $scope.preverified = { status: false };
    //#endregion

    ctrl.resetTop = function () {
      //recalculate the point at which the keeptop directive will fix the header
      $timeout(function () {
        $rootScope.$broadcast('reset-top');
      }, 100);
    };
    //#region Authorization
    $scope.authUserCreateAccess = function () {
      return ctrl.checkAuthorization('soar-biz-bizusr-add');
    };

    $scope.authUserEditAccess = function () {
      return ctrl.checkAuthorization('soar-biz-bizusr-edit');
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

    ctrl.hasAddPreverifiedUserAccess = function () {
      return ctrl.checkAuthorization('soar-biz-bizusr-addpv');
    };

    $scope.authRxUserCreateAccess = function () {
      if (
        !patSecurityService.IsAuthorizedByAbbreviationAtPractice(
          'plapi-user-usrrol-create'
        )
      ) {
        $scope.userIsNotAdmin = true;
        $scope.rxMsgDisable = localize.getLocalizedString(
          'You must have the role of Practice Admin / Executive Dentist to modify ePrescriptions.'
        );
        return false;
      }
      return patSecurityService.IsAuthorizedByAbbreviation(
        'rxapi-rx-rxuser-create'
      );
    };

    ctrl.hasUpdateUserScheduleLoc = function () {
      return patSecurityService.IsAuthorizedByAbbreviation(
        'soar-biz-bizusr-schloc'
      );
    };

    $scope.AddPreverifiedUserAccess = ctrl.hasAddPreverifiedUserAccess();

    $scope.canViewProviderInfo = ctrl.hasViewProviderInfoAccess();

    $scope.canEditProviderInfo = ctrl.hasEditProviderInfoAccess();

    $scope.rxUserCreatePermissions = $scope.authRxUserCreateAccess();

    $scope.canUpdateUserScheduleLoc = ctrl.hasUpdateUserScheduleLoc();

    $scope.authAccess = function () {
      ctrl.resetTop();
      if (
        (!$scope.authUserEditAccess() && $scope.editMode) ||
        (!$scope.authUserCreateAccess() && !$scope.editMode)
      ) {
        toastrFactory.error(
          localize.getLocalizedString(
            'User is not authorized to access this area.'
          ),
          localize.getLocalizedString('Not Authorized')
        );
        $location.path(_.escape('/'));
      }
    };
    $scope.authAccess();

    // enabling/disabling save button based on access
    ctrl.hasAccessForSave = function () {
      if (!$scope.editMode && $scope.authUserCreateAccess) {
        $scope.hasAccess = true;
      } else if ($scope.editMode && $scope.authUserEditAccess()) {
        $scope.hasAccess = true;
      }
    };
    ctrl.hasAccessForSave();
    //#endregion

    //#region Controller Properties
    $scope.personalInfoSectionOpen = true;
    $scope.contactInfoSectionOpen = true;
    $scope.activationHistorySectionOpen = true;
    $scope.additionaIdentifiersSectionOpen = true;
    $scope.user = $scope.currentUserData;

    if ($scope.user.Color === undefined) {
      $scope.user.Color = null;
    }

    $scope.originalUser = $scope.user ? angular.copy($scope.user) : null;
    if (
      !(
        $scope.originalUser.ProviderOnClaimsId &&
        $scope.originalUser.ProviderOnClaimsRelationship
      )
    ) {
      $scope.originalUser.ProviderOnClaimsId =
        '00000000-0000-0000-0000-000000000000';
      $scope.originalUser.ProviderOnClaimsRelationship = null;
    }
    $scope.hasErrors = false;
    $scope.phones = [];

    $scope.maxDate = moment().add(1, 'y').toDate();
    // restrict birthdate to not being in the future.
    $scope.maxDateOfBirth = moment().subtract(1, 'day').utc();

    // cancel
    ctrl.hasChanges = false;
    $scope.cancelChanges = function () {
      // ie hack
      if (
        $scope.user.ProviderOnClaimsRelationship == 0 &&
        $scope.originalUser.ProviderOnClaimsRelationship == null &&
        $scope.user.ProviderTypeId == 4 &&
        $scope.originalUser.ProviderTypeId == null
      ) {
        $scope.user.ProviderOnClaimsRelationship =
          $scope.originalUser.ProviderOnClaimsRelationship;
        $scope.user.ProviderTypeId = $scope.originalUser.ProviderTypeId;
      }
      if ($scope.userLocationSetupsDataChanged === true) {
        ctrl.hasChanges = true;
      }
      if (ctrl.hasChanges) {
        modalFactory.CancelModal().then($scope.confirmCancel);
      } else {
        $scope.confirmCancel();
      }
    };

    $scope.confirmCancel = function () {
      $scope.user = $scope.originalUser;
      $location.path(_.escape(ctrl.previousPath));
    };

    $scope.$on('$routeChangeStart', function (next, current) {
      if (!ctrl.hasChanges) {
        $scope.user = $scope.originalUser;
      }
    });

    //#endregion

    //#region User Validation
    $scope.validDob = true;
    $scope.validStartDate = true;
    $scope.validEndDate = true;
    $scope.validPhones = true;
    $scope.validIds = true;
    $scope.validTaxId = true;
    $scope.showproviderclaimiderror = false;
    $scope.formIsValid = true;
    $scope.hasLocationErrors = false;
    $scope.hasRoleErrors = false;

    // users with IsActive = true must have at least one PracticeRole or one LocationRole
    ctrl.validateUserPracticeRoles = function () {
      if (
        $scope.user.$$isPracticeAdmin === true &&
        $scope.user.IsActive === true
      ) {
        var practiceAdminRole = _.find(
          $scope.user.$$UserPracticeRoles,
          function (practiceRole) {
            return (
              practiceRole.RoleName.toLowerCase() ===
              roleNames.PracticeAdmin.toLowerCase()
            );
          }
        );
        if (_.isNil(practiceAdminRole)) {
          $scope.formIsValid = false;
        }
      }
    };

    $scope.userLocationsErrors = {
      NoUserLocationsError: false,
      NoRoleForLocation: false,
    };
    ctrl.validateUserLocationSetups = function () {
      // filter out userLocationSetups with objectState of delete before validating
      var activeUserLocationSetups = _.filter(
        $scope.userLocationSetups,
        function (userLocationSetup) {
          return userLocationSetup.ObjectState != saveStates.Delete;
        }
      );

      if (activeUserLocationSetups.length === 0) {
        $scope.formIsValid = false;
        $timeout(function () {
          angular.element('#btnAddUserLocationSetup').focus();
          $scope.userLocationsErrors.NoUserLocationsError = true;
        }, 0);
      } else {
        // validate Location roles
        // only required if user has IsActive = true
        if (
          $scope.user.$$isPracticeAdmin === false &&
          $scope.user.IsActive === true
        ) {
          _.forEach($scope.userLocationSetups, function (userLocationSetup) {
            if (userLocationSetup.$$UserLocationRoles.length === 0) {
              $scope.formIsValid = false;
              $timeout(function () {
                angular.element('#btnAddUserLocationSetup').focus();
                $scope.userLocationsErrors.NoRoleForLocation = true;
              }, 0);
            }
          });
        }
      }
    };

    $scope.validateRoles = function (user) {
      // if no selected locations, formIsValid is false
      if (
        user.$$locations &&
        user.$$locations.length == 0 &&
        user.$$selectedPracticeRoles.length == 0 &&
        user.IsActive == true
      ) {
        $scope.hasLocationErrors = true;
        $scope.formIsValid = false;
        $timeout(function () {
          if ($('#inpLocations').length > 0) {
            $('#inpLocations').focus();
            $timeout(function () {
              $('#inpLocations').click();
            }, 500);
          }
        });
        //toastrFactory.error(localize.getLocalizedString('Please assign a location and a role for this team member.'), localize.getLocalizedString('Error'));
      } else {
        // if locations
        $scope.hasLocationErrors = false;
        //$scope.user.StatusChangeNote = null;

        var nonRxRoles = $filter('filter')(
          user.$$selectedPracticeRoles,
          function (role) {
            return (
              role.RoleName.toLowerCase().trim() !==
              roleNames.RxUser.toLowerCase()
            );
          }
        );
        // if user has no Practice roles and no location roles formIsValid is false
        if (nonRxRoles && nonRxRoles.length == 0 && user.IsActive == true) {
          var locationError = false;
          var firstLocationErrorId = 0;
          if (user.$$locations) {
            angular.forEach(user.$$locations, function (location) {
              if (!location.Roles || location.Roles.length == 0) {
                locationError = true;
                firstLocationErrorId =
                  firstLocationErrorId == 0
                    ? location.Location.LocationId
                    : firstLocationErrorId;
              }
            });
          }
          if (locationError) {
            $scope.hasRoleErrors = true;
            $scope.formIsValid = false;
            $timeout(function () {
              if ($('#inpLocRole' + firstLocationErrorId).length > 0) {
                $('#inpLocRole' + firstLocationErrorId)
                  .first()
                  .focus();
                $timeout(function () {
                  $('#inpLocRole' + firstLocationErrorId)
                    .first()
                    .click();
                }, 500);
              }
            });
          }
        } else {
          // if user has practice roles, formIsValid is true
          $scope.hasRoleErrors = false;
          $scope.formIsValid = true;
        }
      }
    };

    // Below function is to validate Employement Start Date and Employement End Date
    ctrl.datesValidaion = function () {
      if (!$scope.editMode) {
        $scope.datesComparionValidationMessage = null;
        return true;
      } else {
        $scope.datesComparionValidationMessage =
          'Employment Start Date should be prior to Employment End Date';
        if (
          _.isNull($scope.user.EmployeeStartDate) &&
          _.isNull($scope.user.EmployeeEndDate)
        ) {
          $scope.datesComparionValidationMessage = null;
          return true;
        } else {
          if (
            _.isNull($scope.user.EmployeeStartDate) &&
            !_.isNull($scope.user.EmployeeEndDate)
          ) {
            $scope.datesComparionValidationMessage =
              'Employment Start Date should not be empty';
            return false;
          }
          if (
            !_.isNull($scope.user.EmployeeStartDate) &&
            _.isNull($scope.user.EmployeeEndDate)
          ) {
            $scope.datesComparionValidationMessage = null;
            return true;
          }
          if (
            !_.isNull($scope.user.EmployeeStartDate) &&
            !_.isNull($scope.user.EmployeeEndDate)
          ) {
            var startDate = new Date($scope.user.EmployeeStartDate);
            var endDate = new Date($scope.user.EmployeeEndDate);
            if (startDate > endDate) {
              return false;
            } else {
              $scope.datesComparionValidationMessage = null;
              return true;
            }
          }
        }
      }
    };
    // validate required and any attributes
    $scope.validatePanel = function (nv) {
      if (nv) {
        $scope.formIsValid =
          $scope.frmUserCrud.$valid &&
          ctrl.datesValidaion() &&
          $scope.frmUserCrud.inpFirstName.$valid &&
          $scope.frmUserCrud.inpLastName.$valid &&
          $scope.frmUserCrud.inpUserName.$valid &&
          !$scope.frmUserCrud.inpUserName.$error.minlength &&
          !$scope.frmUserCrud.inpUserName.$error.maxlength &&
          $scope.validDob &&
          $scope.validStartDate &&
          $scope.validEndDate &&
          //&& $scope.frmUserCrud.inpEmailAddress.$valid
          $scope.frmUserCrud.inpZip.$valid &&
          $scope.validIds &&
          $scope.validPhones &&
          $scope.validTaxId &&
          !$scope.showproviderclaimiderror;

        // set focus if not valid
        if ($scope.formIsValid == false) {
          if (!$('#personalInfo').hasClass('in')) {
            $('#personalInfo').addClass('in');

            $scope.personalInfoSectionOpen = true;
          }

          if (!$('#contactInfo').hasClass('in')) {
            $('#contactInfo').addClass('in');
            $scope.contactInfoSectionOpen = true;
          }

          if (!$('#addtionalIdentifiers').hasClass('in')) {
            $('#addtionalIdentifiers').addClass('in');
            $scope.addtionalIdentifiersSectionOpen = true;
          }
          $timeout(function () {
            $('input.ng-invalid').first().focus();
          });
        }
      }
    };

    $scope.userNameValid = true;

    // $scope.userNameValid gets set if the api was called and we received
    // a uniqueness error on username, resetting it here
    $scope.$watch('user.UserName', function (nv, ov) {
      if (nv && $scope.userNameValid === false) {
        $scope.userNameValid = true;
      }
    });

    //#endregion

    //RxUserType, the values are 0 for No Access, 1 for Prescribing and 2 for Proxy.
    //#region rx
    $scope.rxAccessProviderRoles = [
      {
        Name: localize.getLocalizedString('No Rx Access'),
        Type: 0,
        Info: localize.getLocalizedString(
          '{0} - This user type will not be able to access any e-prescription related data for patients.',
          ['No Rx Access']
        ),
      },
      {
        Name: localize.getLocalizedString('Prescribing User'),
        Type: 1,
        Info: localize.getLocalizedString(
          '{0} - This user type may create and submit e-prescriptions for patients.',
          ['Prescribing User']
        ),
      },
      {
        Name: localize.getLocalizedString('Proxy User'),
        Type: 2,
        Info: localize.getLocalizedString(
          '{0} - This user type may access and create prescription related data, but may not submit e-prescriptions for patients.',
          ['Proxy User']
        ),
      },
      {
        Name: localize.getLocalizedString('Rx Admin'),
        Type: 3,
        Info: localize.getLocalizedString(
          "{0} - This user type is for the administration of DoseSpot (needed to validate providers' controlled substance registration) and is also a Proxy User.",
          ['Rx Admin']
        ),
      },
    ];
    $scope.isPrescribingUser = false;
    $scope.rxAccessType = $scope.user.RxUserType;
    $scope.$watch('rxAccessType', function (nv, ov) {
      $scope.user.RxUserType = parseInt(nv);
      $scope.isPrescribingUser = $scope.user.RxUserType === 1;
      $scope.isRxAdminUser = $scope.user.RxUserType === 3;
      // grab selected object to get info
      $scope.rxAccessProviderRole = $filter(
        'filter'
      )($scope.rxAccessProviderRoles, { Type: nv })[0];
    });
    $scope.rxSettingsChanged = function (rxSettings) {
      $scope.rxAccessRequirements =
        rxSettings &&
        rxSettings.roles &&
        rxSettings.roles.length > 0 &&
        rxSettings.locations &&
        rxSettings.locations.length > 0;
      $scope.$broadcast('fuse:user-rx-changed', rxSettings);
    };
    $scope.disableRxDD = false;
    $scope.$on('setRxDisable', function (events, args) {
      $scope.disableRxDD = !args;
      if (args) {
        $('#ddLocker').css('z-index', 0);
        $scope.rxAccessProviderRole = $scope.rxUserCreatePermissions
          ? $filter('filter')($scope.rxAccessProviderRoles, {
              Type: $scope.user.RxUserType,
            })[0]
          : '';
        $scope.rxMsgDisable = '';
      } else {
        $('#ddLocker').css('z-index', 2);
        $scope.rxAccessProviderRole = '';
        $scope.rxMsgDisable = 'Cannot update Rx Role for an Inactive User';
      }
    });

    //#endregion rx

    //#region Master Additional Identifiers
    $scope.getMasterAdditionalIdenfiers = function () {
      teamMemberIdentifierService.teamMemberIdentifier().then(
        function (res) {
          $scope.masterAdditionalIdentifersGetSuccess(res);
        },
        function () {
          $scope.masterAdditionalIdentifiersGetFailure();
        }
      );
    };

    $scope.masterAdditionalIdentifersGetSuccess = function (res) {
      if (!res.Value.isEmpty) {
        if (res.Value.length > 0) {
          $scope.masterAdditionalIdentifiers = res.Value;
          $scope.getAdditionalIdenfiers();
        }
      }
    };

    $scope.masterAdditionalIdentifiersGetFailure = function () {
      toastrFactory.error(
        localize.getLocalizedString('{0} {1} {2}', [
          'Failed to get',
          'User',
          'Master User Additional Identifiers',
        ]),
        localize.getLocalizedString('Error')
      );
    };

    // #endregion

    // #region Additional Identifiers
    $scope.getAdditionalIdenfiers = function () {
      if ($scope.user.UserId) {
        userServices.AdditionalIdentifiers.getAllAdditionalIdentifiers(
          { Id: $scope.user.UserId },
          $scope.additionalIdentifersGetSuccess,
          $scope.additionalIdentifiersGetFailure
        );
      } else {
        var master = $scope.masterAdditionalIdentifiers;
        angular.forEach(master, function (idn) {
          idn.UserId = '';
          idn.Value = '';
          idn.UserIdentifierId = '';
        });
        $scope.masterAdditionalIdentifiers = master;
      }
    };

    $scope.additionalIdentifersGetSuccess = function (res) {
      var master = $scope.masterAdditionalIdentifiers;
      if (!res.Value.isEmpty) {
        if (res.Value.length > 0) {
          var additionIdentifiers = res.Value;
          angular.forEach(master, function (idn) {
            var idnValue = listHelper.findItemByFieldValue(
              additionIdentifiers,
              'MasterUserIdentifierId',
              idn.MasterUserIdentifierId
            );
            idn.UserId = $scope.user.UserId;
            idn.Value = idnValue != null ? idnValue.Value : '';
            idn.UserIdentifierId =
              idnValue != null ? idnValue.UserIdentifierId : '';
          });
          $scope.masterAdditionalIdentifiers = master;
        } else {
          angular.forEach(master, function (idn) {
            idn.UserId = '';
            idn.Value = '';
            idn.UserIdentifierId = '';
          });
          $scope.masterAdditionalIdentifiers = master;
        }
      }
      if (res.Value.isEmpty) {
        angular.forEach(master, function (idn) {
          idn.UserId = '';
          idn.Value = '';
          idn.UserIdentifierId = '';
        });
        $scope.masterAdditionalIdentifiers = master;
      }
    };

    $scope.additionalIdentifiersGetFailure = function () {
      toastrFactory.error(
        localize.getLocalizedString('{0} {1} {2}', [
          'Failed to get',
          'User',
          'Additional Identifiers',
        ]),
        localize.getLocalizedString('Error')
      );
    };

    $scope.getMasterAdditionalIdenfiers();

    $scope.saveAdditionalIdentifiers = function () {
      var resultPromises = [];
      var master = $scope.masterAdditionalIdentifiers;
      var identifiersToUpdate = [];
      var identifiersToAdd = [];

      if (master) {
        for (var i = 0; i < master.length; i++) {
          var identifier = {};
          if (master[i].UserIdentifierId !== '') {
            identifier.UserIdentifierId = master[i].UserIdentifierId;
            identifier.UserId = $scope.user.UserId;
            identifier.MasterUserIdentifierId =
              master[i].MasterUserIdentifierId;
            identifier.Value = master[i].Value;
            identifiersToUpdate.push(identifier);
          }

          if (master[i].UserIdentifierId === '' && master[i].Value !== '') {
            identifier.UserIdentifierId = '';
            identifier.UserId = $scope.user.UserId;
            identifier.MasterUserIdentifierId =
              master[i].MasterUserIdentifierId;
            identifier.Value = master[i].Value;
            identifiersToAdd.push(identifier);
          }
        }
      }
      if (identifiersToAdd.length > 0) {
        if ($scope.user.UserId) {
          var createPromise = $q.defer();
          resultPromises.push(createPromise.promise);
          userServices.AdditionalIdentifiers.create(
            { Id: $scope.user.UserId },
            identifiersToAdd,
            function (res) {
              $scope.additionalIdentifersSaveSuccess(res);
              createPromise.resolve();
            },
            function () {
              $scope.additionalIdentifiersSaveFailure();
              createPromise.reject('adding identifiers');
            }
          );
        }
      }
      if (identifiersToUpdate.length > 0) {
        if ($scope.user.UserId) {
          var updatePromise = $q.defer();
          resultPromises.push(updatePromise.promise);
          userServices.AdditionalIdentifiers.update(
            { Id: $scope.user.UserId },
            identifiersToUpdate,
            function (res) {
              $scope.additionalIdentifersSaveSuccess(res);
              updatePromise.resolve();
            },
            function () {
              $scope.additionalIdentifiersSaveFailure();
              updatePromise.reject('updating identifiers');
            }
          );
        }
      }

      return resultPromises;
    };
    $scope.additionalIdentifersSaveSuccess = function (res) {
      if (!res.Value.isEmpty) {
        if (res.Value.length > 0) {
          $scope.masterAdditionalIdentifiers = res.Value;
        }
      }
    };

    $scope.additionalIdentifersSaveFailure = function () {
      toastrFactory.success(
        localize.getLocalizedString('{0} {1} {2}', [
          'Failed to save',
          'User',
          'Additional Identifiers',
        ]),
        localize.getLocalizedString('Failure')
      );
    };
    //#endregion

    ctrl.isOriginalActive = false;
    ctrl.isNewlyInactivated = false;
    ctrl.originalAssignedRoles = [];

    $scope.getPhones = function () {
      if ($scope.user.UserId) {
        ctrl.isOriginalActive = $scope.user.IsActive;
        //ctrl.UserAssignedRolesDto.UserId = $scope.user.UserId;
        userServices.Contacts.get(
          { Id: $scope.user.UserId },
          $scope.userContactsGetSuccess,
          $scope.userContactsGetFailure
        );
      }
    };

    $scope.userContactsGetSuccess = function (res) {
      if (!res.Value.isEmpty) {
        if (res.Value.length > 0) {
          $scope.phones = $filter('orderBy')(res.Value, 'OrderColumn');
        } else {
          $scope.$broadcast('add-empty-phone');
        }
      }
    };

    $scope.userContactsGetFailure = function () {
      toastrFactory.error(
        localize.getLocalizedString('{0} {1} {2}', [
          'Failed to get',
          'User',
          'Contacts',
        ]),
        localize.getLocalizedString('Error')
      );
    };
    $scope.getPhones();

    // Build instance
    $scope.backupPhones = null;
    $scope.buildInstance = function (currentPhones) {
      $scope.backupPhones = JSON.stringify(currentPhones);
    };
    $scope.buildInstance($scope.phones);

    // Only save a phone if the phone state is not NONE and
    // PhoneNumber is not null or empty and
    // PhoneType is not null or empty
    // Unless the ObjectState is Delete
    $scope.checkValidPhone = function (phone) {
      return (
        (phone.ObjectState != null &&
          phone.ObjectState != saveStates.None &&
          phone.PhoneNumber &&
          phone.PhoneNumber.length > 0) ||
        phone.ObjectState == saveStates.Delete
      );
    };

    $scope.contactIdsToDelete = [];
    $scope.savePhones = function () {
      var phonesToSend = [];
      var savePhonePromise = $q.defer();
      angular.forEach($scope.phones, function (phone) {
        if ($scope.checkValidPhone(phone)) {
          phone.UserId = $scope.user.UserId;

          let phoneToSend = _.cloneDeep(phone);
          if (!phoneToSend.ContactId) delete phoneToSend.ContactId;

          phonesToSend.push(phoneToSend);

          // keeping track of the deletes for easy removal in success callback
          if (phone.ObjectState === saveStates.Delete) {
            $scope.contactIdsToDelete.push(phone.ContactId);
          }
        }
      });

      if (phonesToSend.length > 0) {
        userServices.Contacts.save(
          {
            Id: $scope.user.UserId,
          },
          phonesToSend,
          function (res) {
            $scope.userContactsSaveSuccess(res);
            savePhonePromise.resolve();
          },
          function () {
            $scope.userContactsSaveFailure();
            savePhonePromise.reject('saving contacts');
          }
        );
      } else {
        savePhonePromise.resolve();
      }

      return savePhonePromise.promise;
    };

    $scope.userContactsSaveSuccess = function (res) {
      angular.forEach(res.Value, function (phoneReturned) {
        if (phoneReturned.ObjectState === saveStates.Successful) {
          // if contact id already exists in $scope.phones, then we have an update or delete
          var index = listHelper.findIndexByFieldValue(
            $scope.phones,
            'ContactId',
            phoneReturned.ContactId
          );
          if (index !== -1) {
            if (
              $scope.contactIdsToDelete.indexOf(phoneReturned.ContactId) !== -1
            ) {
              // delete
              $scope.phones.splice(index, 1);
            } else {
              // update
              $scope.phones[index].ObjectState = saveStates.None;
            }
          } else {
            // add
            index = -1;
            angular.forEach($scope.phones, function (phone, key) {
              if (
                phone.PhoneNumber === phoneReturned.PhoneNumber &&
                phone.Type === phoneReturned.Type
              ) {
                index = key;
              }
            });
            if (index !== -1) {
              $scope.phones[index].ObjectState = saveStates.None;
            }
          }
        } else if (phoneReturned.ObjectState === saveStates.Failed) {
        }
      });
      $scope.frmUserCrud.$setPristine();
    };

    $scope.userContactsSaveFailure = function () {
      $scope.phones = angular.copy($scope.backupPhones);
      //toastrFactory.error(localize.getLocalizedString('{0} {1} {2}', ['There was an error while saving', 'User', 'Contacts']), localize.getLocalizedString('Error'));
    };
    //#endregion Save Phone Info

    $scope.loginTimesChange = function (loginTimeList) {
      ctrl.userLoginTimes = loginTimeList;

      if (
        loginTimeList &&
        loginTimeList.length > 0 &&
        loginTimeList.some(time => {
          return time.IsValid == false;
        })
      ) {
        $scope.hasInvalidTimes = true;
      } else {
        $scope.hasInvalidTimes = false;
      }
      $scope.$apply();
    };

    $scope.duplicateEmailAdd = false;
    $scope.saveUser = function (status) {
      // TODO: change domain validation to allow empty string for SSN
      // disable buttons while saving
      $scope.duplicateEmailAdd = false;
      $scope.savingUser = true;
      $scope.validatePanel($scope.user);
      // validate presribing user if formIsValid
      if ($scope.formIsValid) {
        $scope.validatePrescribingUser($scope.user);
      }
      // validate roles if formIsValid
      if ($scope.formIsValid) {
        //$scope.validateRoles($scope.user);
        ctrl.validateUserLocationSetups();
        ctrl.validateUserPracticeRoles();
      }
      // validate phones if formIsValid
      if ($scope.formIsValid) {
        $scope.validatePhones();
      }
      // validate Provider on Claims if formIsValid
      if ($scope.formIsValid) {
        $scope.validatePOC($scope.user);
      }

      $scope.hasErrors = !$scope.formIsValid;

      // Get a copy of the user to pass to update functions for roles and selected locations
      var roleByLocationData = angular.copy($scope.user);

      if ($scope.formIsValid) {
        if ($scope.user.Address.ZipCode) {
          $scope.user.Address.ZipCode = $scope.user.Address.ZipCode.replace(
            '-',
            ''
          );
        }

        if ($scope.user.DateOfBirth instanceof Date) {
          $scope.user.DateOfBirth.setHours(23);
          $scope.user.DateOfBirth.setMinutes(59);
          $scope.user.DateOfBirth = $scope.user.DateOfBirth.toLocaleString();
        }

        if ($scope.user.EmployeeStartDate instanceof Date) {
          $scope.user.EmployeeStartDate.setHours(23);
          $scope.user.EmployeeStartDate.setMinutes(59);
          $scope.user.EmployeeStartDate = $scope.user.EmployeeStartDate.toLocaleString();
        }

        if ($scope.user.EmployeeEndDate instanceof Date) {
          $scope.user.EmployeeEndDate.setHours(23);
          $scope.user.EmployeeEndDate.setMinutes(59);
          $scope.user.EmployeeEndDate = $scope.user.EmployeeEndDate.toLocaleString();
        }

        if ($scope.editMode) {
          // Edit user
          if ($scope.user.RxUserType !== $scope.originalUser.RxUserType) {
            // Save new rx user type and only update AFTER rxApi call is successful
            $scope.updatedRxUserType = $scope.user.RxUserType;
          }

          userServices.Users.update(
            $scope.user,
            function (res) {
              // store a copy of user for updating locations, roles, and rx
              $scope.roleByLocationData = roleByLocationData;
              $scope.duplicateEmailAdd = false;
              // saving the userLocationsSetups before continuing
              ctrl.userLocationSetups = _.cloneDeep($scope.userLocationSetups);

              // setup rx location ids based on userLocationSetups
              $scope.rxLocationIds = [];
              _.forEach(ctrl.userLocationSetups, function (location) {
                $scope.rxLocationIds.push(location.LocationId);
              });
              // if user has been been marked No Access (user.IsActive = false),
              // call ctrl.setInactiveRoles to populate the userAssignedRolesDto
              var userAssignedRolesDto = null;
              if (
                $scope.originalUser.IsActive === true &&
                $scope.user.IsActive === false
              ) {
                userAssignedRolesDto = ctrl.setInactiveRoles(
                  ctrl.userLocationSetups,
                  $scope.user
                );
              }
              // save userLocationSetups, roles before processing success
              var updatePromises = [];
              updatePromises.push(
                userLocationsSetupFactory.SaveUserLocationSetups(
                  ctrl.userLocationSetups
                )
              );
              // if user has been been marked No Access (user.IsActive = false),
              // call rolesFactory.AddInactiveUserAssignedRoles to store the inactive roles
              if (!_.isNil(userAssignedRolesDto)) {
                updatePromises.push(
                  rolesFactory.AddInactiveUserAssignedRoles(
                    $scope.user.UserId,
                    userAssignedRolesDto
                  )
                );
              }
              updatePromises.push(
                rolesFactory.ProcessUserLocationRoles(
                  ctrl.userLocationSetups,
                  $scope.user.UserId
                )
              );
              updatePromises.push(
                rolesFactory.ProcessUserPracticeRoles($scope.user)
              );
              updatePromises.push(
                userLoginTimesFactory.UpdateLoginTime(
                  $scope.user.UserId,
                  ctrl.userLoginTimes
                )
              );

              if (updatePromises.length > 0) {
                $q.all(updatePromises).then(function () {
                  $scope.usersSaveSuccess(
                    res,
                    'Update successful.',
                    status,
                    roleByLocationData
                  );
                });
              } else {
                $scope.usersSaveSuccess(
                  res,
                  'Update successful.',
                  status,
                  roleByLocationData
                );
              }
            },
            function (error) {
              $scope.usersSaveFailure(
                error,
                'Update was unsuccessful. Please retry your save.'
              );
            }
          );
        } else {
          // Create user
          var userCreateDto = {};
          userCreateDto.User = angular.copy($scope.user);
          userCreateDto.PracticeRoles = {};
          userCreateDto.LocationRoles = {};
          if ($scope.user.RxUserType > 0) {
            $scope.updatedRxUserType = $scope.user.RxUserType;
          }

          if (!userCreateDto.User.UserId) delete userCreateDto.User.UserId;

          if (!userCreateDto.User.RxUserType) userCreateDto.User.RxUserType = 0;

          // Add new user practice roles
          if ($scope.user.$$UserPracticeRoles.length != 0) {
            userCreateDto.PracticeRoles[$scope.practiceId] = [];
            _.forEach($scope.user.$$UserPracticeRoles, function (practiceRole) {
              userCreateDto.PracticeRoles[$scope.practiceId].push(
                practiceRole.RoleId
              );
            });
          }
          // Add new user location roles
          _.forEach($scope.userLocationSetups, function (userLocationSetup) {
            userCreateDto.LocationRoles[userLocationSetup.LocationId] = [];
            if (
              userLocationSetup.$$UserLocationRoles &&
              userLocationSetup.$$UserLocationRoles.length != 0
            ) {
              _.forEach(userLocationSetup.$$UserLocationRoles, function (role) {
                userCreateDto.LocationRoles[userLocationSetup.LocationId].push(
                  role.RoleId
                );
              });
            }
          });

          if ($scope.preverified && $scope.preverified.status) {
            userCreateDto.UserVerificationType = 3;
          } else {
            userCreateDto.UserVerificationType = 0;
          }
          userServices.Users.save(userCreateDto).$promise.then(
            function (res) {
              var defaultHeader = 'New User Setup';
              var resendHeader = 'Resend New User Verification';
              var verifiedMessage =
                'Your new user has successfully completed the setup. They may now start using Fuse.';
              var unverifiedMessage =
                'You have successfully completed new user setup. An email will be sent in the next 24 hours asking this user to verify their email address and setup their personal security settings.';
              var invalidVerificationMessage =
                'You have successfully completed new user setup. However, we were unable to verify the user. Please wait a few minutes and try to resend the verification email.  If you continue to have issues, please contact support.';
              var buttonText = 'Close';

              $scope.res = res;
              $scope.status = status;
              // store a copy of user for updating locations, roles, and rx
              $scope.roleByLocationData = roleByLocationData;

              // get and set the userId in userLocationsSetups
              var userId = res.Value.UserId;
              _.forEach(
                $scope.userLocationSetups,
                function (userLocationSetup) {
                  userLocationSetup.UserId = userId;
                }
              );

              // storing then saving the userLocationsSetups before continuing
              ctrl.userLocationSetups = _.cloneDeep($scope.userLocationSetups);
              userLocationsSetupFactory
                .SaveUserLocationSetups($scope.userLocationSetups)
                .then(function () {
                  // force users referenceData to update
                  referenceDataService.forceEntityExecution(
                    referenceDataService.entityNames.users
                  );
                });
              userLoginTimesFactory.UpdateLoginTime(
                userId,
                ctrl.userLoginTimes
              );

              // setup rx location ids based on userLocationSetups
              $scope.rxLocationIds = [];
              _.forEach(ctrl.userLocationSetups, function (location) {
                $scope.rxLocationIds.push(location.LocationId);
              });

              $scope.usersSaveSuccess();
            },
            function (error) {
              var errDisplayed = false;
              var foundItem = $filter('filter')(
                error.data.InvalidProperties,
                { PropertyName: 'EmailAddressMustUnique' },
                true
              );
              if (foundItem) {
                if (foundItem.length > 0) {
                  errDisplayed = true;
                  $scope.duplicateEmailAdd = true;
                  $scope.usersSaveFailure(
                    error,
                    error.data.InvalidProperties[0].ValidationMessage
                  );
                }
              }

              if (!errDisplayed) {
                $scope.usersSaveFailure(
                  error,
                  'There was an error and your user was not created.'
                );
              }
            }
          );
        }
      } else {
        $scope.savingUser = false;

        if (
          $scope.hasErrors &&
          $scope.phones.length == 0 &&
          $scope.rxAccessRequirements
        )
          $rootScope.$broadcast('rx-required-user');
      }
    };

    $scope.clearValidation = function () {
      $scope.duplicateEmailAdd = false;
    };

    // This method loads the userAssignedRolesDto with the user's current roles (location or practice)
    // to retain inactive roles if user is set to No Access
    // this method marks the current roles objectState to Delete
    ctrl.setInactiveRoles = function (userLocationSetups, user) {
      // This object used to persist inactive roles if user is set to No Access
      var userAssignedRolesDto = {
        UserLocationDtos: [],
        IsSetToInactive: true,
        UserRoleLocationInactiveDtos: [],
        UserRolePracticeInactiveDtos: [],
        UserPracticeRoles: [],
        UserId: null,
      };

      userAssignedRolesDto.UserId = $scope.user.UserId;
      if (
        $scope.originalUser.IsActive === true &&
        $scope.user.IsActive === false
      ) {
        // add each locationSetup.$$UserLocationRole to inactiveRole object  (unless its ObjectState is Add)
        _.forEach(userLocationSetups, function (userLocationSetup) {
          _.forEach(
            userLocationSetup.$$UserLocationRoles,
            function (userLocationRole) {
              // remove role if ObjectState is Add, hasn't been persisted, otherwise store as inactive
              userLocationRole.$$ObjectState =
                userLocationRole.$$ObjectState === saveStates.Add
                  ? saveStates.None
                  : saveStates.Delete;
              // add current roles to inactive roles object
              if (userLocationRole.$$ObjectState === saveStates.Delete) {
                var inactiveRole = {
                  UserId: $scope.user.UserId,
                  RoleId: userLocationRole.RoleId,
                  LocationId: userLocationSetup.LocationId,
                };
                userAssignedRolesDto.UserRoleLocationInactiveDtos.push(
                  inactiveRole
                );
              }
            }
          );
        });
        // add each user.$$UserPracticeRole to inactiveRole object (unless its ObjectState is Add)
        _.forEach(user.$$UserPracticeRoles, function (userPracticeRole) {
          // remove role if ObjectState is Add, hasn't been persisted, otherwise store as inactive
          userPracticeRole.$$ObjectState =
            userPracticeRole.$$ObjectState === saveStates.Add
              ? saveStates.None
              : saveStates.Delete;
          // add current roles to inactive roles object
          if (userPracticeRole.$$ObjectState === saveStates.Delete) {
            var inactiveRole = {
              UserId: $scope.user.UserId,
              RoleId: userPracticeRole.RoleId,
              PracticeId: $scope.practiceId,
            };
            userAssignedRolesDto.UserRolePracticeInactiveDtos.push(
              inactiveRole
            );
          }
        });
      }
      return userAssignedRolesDto;
    };

    $scope.statusChange = false;
    $scope.usersSaveSuccess = function (res, msg, status, roleByLocationData) {
      referenceDataService.forceEntityExecution(
        referenceDataService.entityNames.users
      );
      var savingPromises = [];
      if (!res && !msg && !roleByLocationData) {
        res = $scope.res;
        status = $scope.status;
        roleByLocationData = $scope.roleByLocationData;
      }

      ctrl.hasChanges = false;
      res.Value.StatusChangeNote = $scope.user.StatusChangeNote;
      $scope.user = res.Value;
      $scope.originalUser = $scope.user;
      roleByLocationData.UserId = $scope.user.UserId;

      if (!status) {
      } else {
        $scope.statusChange = true;
        // Since we're not closing the form, remove ng-dirty class and set form to pristine state
        // We need this so that the cancel button acts correctly
        $timeout(function () {
          if ($scope.frmUserCrud) {
            $scope.frmUserCrud.$setPristine();
          }
        }, 100);
      }

      // save Additional Identifiers
      var additionalIdentifierPromises = $scope.saveAdditionalIdentifiers();

      if (additionalIdentifierPromises && additionalIdentifierPromises.length) {
        for (var i = 0; i < additionalIdentifierPromises.length; i++) {
          savingPromises.push(additionalIdentifierPromises[i]);
        }
      }

      // save phones
      var savePhonePromise = $scope.savePhones();

      if (savePhonePromise) {
        savingPromises.push(savePhonePromise);
      }

      //save licenses
      var saveLicensesPromise = $scope.saveLicenses();
      if (saveLicensesPromise) {
        savingPromises.push(saveLicensesPromise);
      }

      ctrl.finishUp = function () {
        $scope.res = null;
        $scope.status = null;
        $scope.roleByLocationData = null;
        toastrFactory.success(msg, 'Success');
        //Bug 176806
        $location.path(_.escape(ctrl.previousPath));
        $rootScope.$broadcast('user-updated', res);
      };

      $q.all(savingPromises).then(
        function savingPromisesSuccess() {
          $scope.savingUser = false;
          // set to false if saving user
          $scope.doRxCheckOnPageLoad = false;

          // added to capture save and responses after user save completes
          var rxPromises = [];
          if ($scope.rxSettings.isNew === false || ($scope.rxSettings.roles.length > 0 && $scope.rxSettings.locations.length > 0)) {
            rxPromises.push(ctrl.saveRxUser());
            $q.all(rxPromises).then(function () {
              ctrl.finishUp();
            });
          } else {
            ctrl.finishUp();
          }
        },
        function savingPromisesFailed(error) {
          $scope.savingUser = false;
          toastrFactory.error(error, 'Failure ' + error);
        }
      );
    };

    $scope.usersSaveFailure = function (error, msg) {
      angular.forEach(error.data.InvalidProperties, function (prop) {
        // finding the object in the string
        var index = prop.ValidationMessage.indexOf('Result');
        var validationError;
        try {
          validationError = JSON.parse(
            prop.ValidationMessage.substring(index - 2)
          );
        } catch (e) {
          validationError = {};
        }
        if (validationError.Result) {
          angular.forEach(validationError.Result.Errors, function (error) {
            // TODO : ugly? yes. only way to do it until we have a better error handling solution
            if (
              error.PropertyName === 'UserName' &&
              error.ValidationMessage === 'Name must be unique'
            ) {
              $scope.userNameValid = false;
            }
          });
        }
      });
      $scope.savingUser = false;
      toastrFactory.error(msg, 'Error');
    };

    $scope.comboBoxBlur = function (e) {
      var elem = angular.element(e.target);
      var comboBox = elem.data('kendo-combo-box');
      // because of the way some states are abbreviated (MO, CT, etc.), the filtering was causing comboBox.select()
      // to evaluate to -1 for valid states on blur, adding special validation for states to fix this bug
      var invalidValue = false;
      if (elem[0].name === 'stateListComboBox') {
        var state = listHelper.findItemByFieldValue(
          $scope.stateList,
          'Name',
          comboBox.value()
        );
        if (state === null) {
          invalidValue = true;
        }
      } else {
        if (comboBox.select() == -1) {
          invalidValue = true;
        }
      }
      if (comboBox && comboBox.value().length > 0 && invalidValue) {
        comboBox.focus();
        elem.controller('ngModel').$setValidity('comboBox', false);
      } else {
        elem.controller('ngModel').$setValidity('comboBox', true);
      }
    };

    //#endregion

    //#region Rx Access
    ctrl.updateRxAccess = function () {
      if (
        $scope.rxAccessEnum === rxUserType.PrescribingUser ||
        $scope.rxAccessEnum === rxUserType.RxAdminUser ||
        $scope.rxAccessEnum === rxUserType.ProxyUser
      ) {
        return ctrl.createRxUser();
      }

      return [];
    };

    $scope.$watch('user.RxUserType', function (nv) {
      $scope.rxAccessRequirements =
        $scope.user.RxUserType === 1 ||
        $scope.user.RxUserType === 2 ||
        $scope.user.RxUserType === 3;
    });
   

      // prescribing users must have valid npi and dea numbers
      $scope.validatePrescribingUser = function (user) {
          if ($scope.rxSettings && $scope.rxSettings.invalid) {
              $scope.formIsValid = false;
          }

          if (
              $scope.rxSettings &&
              $scope.rxSettings.roles &&
              $scope.rxSettings.roles.length > 0
          ) {
              var index = _.findIndex($scope.rxSettings.roles, function (role) {
                  return role.value === 1; //Looking for Prescribing role
              });

              if (index > -1) {
                  if (!user.DeaNumber || !user.NpiTypeOne || !user.TaxId) {
                      $scope.formIsValid = false;
                  }
              }
          }

      };

    $scope.rxAccessSuccess = function () {
      // don't show success on page load, and only once on save
      if (
        $scope.doRxCheckOnPageLoad === false &&
        $scope.doDisplayRxInfo === true
      ) {
        var message = localize.getLocalizedString('Successfully added {0}.', [
          'e-prescriptions',
        ]);
        toastrFactory.success(message, 'Success');
        $scope.doDisplayRxInfo = false;
        $scope.updatedRxUserType = undefined;
      } else {
        $scope.doRxCheckOnPageLoad = false;
      }
      return;
    };

    $scope.validatePhones = function () {
      for (var i = 0; i < $scope.phones.length; i++) {
        if (
          $scope.phones[i].hasErrors ||
          $scope.phones[i].duplicateNumber ||
          ($scope.phones[i].hasErrors &&
            $scope.phones[i].invalidType != $scope.phones[i].invalidPhoneNumber)
        ) {
          $scope.formIsValid = false;
          $('#inpPhoneNumber' + i).focus();
          i = $scope.phones.length;
        }
      }
    };

    $scope.validatePOC = function (user) {
      if (
        user.ProviderOnClaimsRelationship == 2 &&
        user.ProviderOnClaimsId == null
      ) {
        $scope.formIsValid = false;
        $rootScope.$broadcast('validateProviderOnClaims', true);
        $('#userTypeAheadInput').focus();
      }
    };
    // used to let us know when all of the roles have resolved
    $scope.rolesStatus = { Loaded: false };
    $scope.$watch(
      'rolesStatus',
      function (nv) {
        if (nv.Loaded === true) {
          ctrl.checkRxAccess();
        }
      },
      true
    );

    ctrl.setRxAccessEnum = function () {
      if ($scope.user.RxUserType !== 0) {
        switch ($scope.user.RxUserType) {
          case 1:
            $scope.rxAccessEnum = rxUserType.PrescribingUser;
            break;
          case 2:
            $scope.rxAccessEnum = rxUserType.ProxyUser;
            break;
          case 3:
            $scope.rxAccessEnum = rxUserType.RxAdminUser;
            break;
          default:
            $scope.rxAccessEnum = null;
            break;
        }
      }
    };

    // controls how often we run the checkRxAccess
    $scope.doRxCheckOnPageLoad = true;
    ctrl.checkRxAccess = function () {
      if (
        $scope.user &&
        $scope.phones &&
        $scope.rolesStatus.Loaded === true &&
        $scope.doRxCheckOnPageLoad &&
        $scope.formIsValid &&
        ($scope.user.RxUserType === 1 || $scope.user.RxUserType === 2)
      ) {
        // get location ids for individual calls to rx access (practice roles)
        angular.forEach($scope.user.$$selectedPracticeRoles, function (role) {
          if (
            role.RoleName.toLowerCase().trim() ===
            roleNames.PracticeAdmin.toLowerCase().trim()
          ) {
            // if we're assigning a practice admin role, we need to setup rx for all locations for this user
            ctrl.setRxLocationIdsForPracticeRole();
          }
        });
        // get location ids for individual calls to rx access (location roles)
        ctrl.setRxLocationIdsForLocationRoles($scope.user.$$locations);
        ctrl.setRxAccessEnum();
        ctrl.updateRxAccess();
      }
    };

    ctrl.getInvalidRxDataMessage = function () {
      var rxAccessFailedInfo =
        localize.getLocalizedString(
          'Unable to add/update your team member for e-prescriptions, please verify the following:'
        ) + '<br/><br/>';
      rxAccessFailedInfo +=
        localize.getLocalizedString('Must have a valid {0}.', [
          'phone number',
        ]) + '<br/>';
      rxAccessFailedInfo +=
        localize.getLocalizedString('Must have a valid {0}.', ['address']) +
        '<br/>';
      if ($scope.user.RxUserType === 1) {
        rxAccessFailedInfo +=
          localize.getLocalizedString('Must have a valid {0}.', [
            'NPI Number',
          ]) + '<br/>';
      }
      return rxAccessFailedInfo;
    };

    // multiple calls to rx access can fail but we only want to show info once
    $scope.doDisplayRxInfo = true;
    $scope.invalidDataForRx = false;
    $scope.rxAccessFailed = function (res) {
      var error = 'Unknown error';      
      error = ctrl.getInvalidRxDataMessage();      
      var title = localize.getLocalizedString('e-prescriptions');
      if (
        $scope.doRxCheckOnPageLoad === false &&
        $scope.doDisplayRxInfo === true
      ) {
        // show toastr message
        toastr.options = {
          positionClass: 'toast-bottom-right',
          timeOut: '15000',
          showEasing: 'swing',
          hideEasing: 'linear',
          showMethod: 'fadeIn',
          hideMethod: 'fadeOut',
          'body-output-type': 'trustedHtml',
        };
        toastr.error(error, title);
        $scope.doDisplayRxInfo = false;
      } else {
        // display in header
        $scope.invalidDataForRx = true;
        // only do this once on page load
        $scope.doRxCheckOnPageLoad = false;
      }
      return;
    };

    // if user has practice roles, userLocations includes all locations in practice
    ctrl.setRxLocationIdsForPracticeRole = function () {
      $scope.rxLocationIds = [];
      angular.forEach($scope.practiceLocations, function (location) {
        $scope.rxLocationIds.push(location.LocationId);
      });
    };

    // if user has location access, userLocations includes only the locations for this user
    ctrl.setRxLocationIdsForLocationRoles = function (locations) {
      angular.forEach(locations, function (location) {
        $scope.rxLocationIds.push(location.Location.LocationId);
      });
    };

    ctrl.createRxUser = function () {
      var responsePromises = [];
      // get the application id
      var userContext = JSON.parse(sessionStorage.getItem('userContext'));
      var applicationId = userContext.Result.Application.ApplicationId;

      // set npi
      var npiNumber = null;
      if ($scope.user.NpiTypeOne !== '') {
        npiNumber = $scope.user.NpiTypeOne;
      }

      // set dea
      var deaNumber = null;
      if ($scope.user.DeaNumber !== '') {
        deaNumber = $scope.user.DeaNumber;
      }

      var formattedZipCode = $filter('zipCode')($scope.user.Address.ZipCode);

      $scope.rxUser = {
        UserId: $scope.user.UserId,
        UserType: $scope.rxAccessEnum,
        FirstName: $scope.user.FirstName,
        LastName: $scope.user.LastName,
        Gender: 'Unknown',
        Address1: $scope.user.Address.AddressLine1,
        Address2: $scope.user.Address.AddressLine2,
        City: $scope.user.Address.City,
        State: $scope.user.Address.State,
        PostalCode: formattedZipCode,
        ApplicationId: applicationId,
        DEANumber: deaNumber,
        DateOfBirth: $scope.user.DateOfBirth,
        Email: $scope.user.UserName,
        Fax: $scope.phones[0].PhoneNumber,
        NPINumber: npiNumber,
        Phone: $scope.phones[0].PhoneNumber,
        LocationIds: [],
      };

      $scope.rxUser.LocationIds = $scope.rxLocationIds;

      responsePromises.push(
        userServices.RxAccess.save(
          { practiceId: $scope.practiceId },
          $scope.rxUser,
          $scope.rxAccessSuccess,
          $scope.rxAccessFailed
        )
      );
      return responsePromises;
    };

    // new save function to fire after other saves / updates
    ctrl.saveRxUser = function () {
      var userContext = JSON.parse(sessionStorage.getItem('userContext'));
      var applicationId = userContext.Result.Application.ApplicationId;

      // set npi
      var npiNumber = null;
      if ($scope.user.NpiTypeOne !== '') {
        npiNumber = $scope.user.NpiTypeOne;
      }

      // set dea
      var deaNumber = null;
      if ($scope.user.DeaNumber !== '') {
        deaNumber = $scope.user.DeaNumber;
      }

      var formattedZipCode = $filter('zipCode')($scope.user.Address.ZipCode);

      $scope.rxUser = {
        UserId: $scope.user.UserId,
        UserType: $scope.rxAccessEnum,
        FirstName: $scope.user.FirstName,
        MiddleName: $scope.user.MiddleName,
        LastName: $scope.user.LastName,
        Suffix: $scope.user.SuffixName,
        Gender: 'Unknown',
        Address1: $scope.user.Address.AddressLine1,
        Address2: $scope.user.Address.AddressLine2,
        City: $scope.user.Address.City,
        State: $scope.user.Address.State,
        PostalCode: formattedZipCode,
        ApplicationId: applicationId,
        DEANumber: deaNumber,
        DateOfBirth: $scope.user.DateOfBirth,
        Email: $scope.user.UserName,
        Fax: $scope.phones[0].PhoneNumber,
        NPINumber: npiNumber,
        Phone: $scope.phones[0].PhoneNumber,
        LocationIds: [],
      };
      $scope.rxUser.LocationIds = $scope.rxLocationIds;

      var defer = $q.defer();
      var promise = defer.promise;

      // userServices.RxAccess.save add / updates all location for this user to have Rx Access
      // with most current information for that user.
      var userForRxUpdate = _.cloneDeep($scope.user);
      rxService
        .saveRxClinician(userForRxUpdate, $scope.rxUser, $scope.rxSettings)
        .then(
          function (res) {
            $scope.rxAccessSuccess();
            defer.resolve(res);
          },
          function (res) {
            $scope.rxAccessFailed(res);
            // call resolve so that promise is resolved and the page will close
            defer.resolve(res);
          }
        );
      return promise;
    };

    //#endregion

    // #region State Licenses
    $scope.updatedLicenses = [];
    $scope.$on('sendUpdatedLicenses', function (events, args) {
      if (args) {
        $scope.updatedLicenses = args;
      }
    });

    $scope.saveLicenses = function () {
      var stateLicenseDto = [];
      var saveLicencesPromise = $q.defer();
      angular.forEach($scope.updatedLicenses, function (license) {
        var item = {
          UserId: $scope.user.UserId,
          StateId: license.StateId,
          StateLicenseNumber: license.StateLicense,
          AnesthesiaId: license.AnesthesiaId,
          IsActive: true,
          IsDeleted: false,
          ObjectState: license.ObjectState,
          StateLicenseId: license.StateLicenseId,
          DataTag: license.DataTag,
        };

        stateLicenseDto.push(item);
      });

      if (stateLicenseDto.length > 0) {
        userServices.Licenses.update(
          stateLicenseDto,
          function (res) {
            $scope.userLicensesSaveSuccess(res);
            saveLicencesPromise.resolve();
          },
          function (error) {
            $scope.userLicensesSaveFailure();
            saveLicencesPromise.reject('saving licenses');
          }
        );
      } else {
        saveLicencesPromise.resolve();
      }

      return saveLicencesPromise.promise;
    };

    $scope.userLicensesSaveSuccess = function (res) {
      var result = res;
    };

    $scope.userLicensesSaveFailure = function () {
      toastrFactory.error(
        localize.getLocalizedString('{0} {1} {2}', [
          'There was an error while saving',
          'User',
          'State Licenses',
        ]),
        localize.getLocalizedString('Error')
      );
    };

    // #endregion

    $scope.changePassword = function () {
      var forgetPasswordUrl = soarConfig.resetPasswordUrl;
      tabLauncher.launchNewTab(forgetPasswordUrl);
    };

    //watch for page changes

    $scope.$watch(
      'user',
      function (nv, ov) {
        if (nv && ov && nv !== ov) {
          ctrl.hasChanges = true;
          ctrl.checkRxAccess();
        }
      },
      true
    );

    $scope.$watch(
      'user.IsActive',
      function (nv) {
        if (nv != null) {
          if (nv != $scope.originalUser.IsActive) {
            $scope.openStatusChangeConfirmationModal(nv ? 1 : 2);
          }
        }
      },
      true
    );

    $scope.$watch(
      'phones',
      function (nv, ov) {
        if (nv && ov && nv !== ov) {
          ctrl.hasChanges = true;
          ctrl.checkRxAccess();
        }
      },
      true
    );

    $scope.$watch(
      'updatedRoleId',
      function (nv, ov) {
        if (nv && ov && nv !== ov) {
          ctrl.hasChanges = true;
        }
      },
      true
    );

    $scope.$watch(
      'user.$$locations',
      function (nv, ov) {
        if (
          nv &&
          ov &&
          nv !== ov &&
          $scope.rolesStatus &&
          $scope.rolesStatus.Loaded
        ) {
          ctrl.hasChanges = true;
          $rootScope.$broadcast('sendLocationsToValidate', nv);
        }
      },
      true
    );

    //setup listener for page changes

    ctrl.setChangesListener = function () {
      setTimeout(function () {
        ctrl.hasChanges = false;
      }, 1400);
    };

    ctrl.setChangesListener();

    ctrl.getUserScheduleStatus = function () {
      if ($scope.user && $scope.user.UserId) {
        userServices.UsersScheduleStatus.get({
          userId: $scope.user.UserId,
        }).$promise.then(function (res) {
          $scope.user.$$scheduleStatuses = res.Value;
        });
      }
    };
    ctrl.getUserScheduleStatus();

    $scope.userLocation = function () {
      return JSON.parse(sessionStorage.getItem('userLocation'));
    };

    ctrl.getLastModifiedMessage = function () {
      $scope.lastModifiedMessage = '';

      var userLocation = $scope.userLocation();
      var abbr = userLocation
        ? timeZoneFactory.GetTimeZoneAbbr(
            userLocation.timezone,
            $scope.user.DateModified
          )
        : '';
      var time = userLocation
        ? timeZoneFactory.ConvertDateTZ(
            $scope.user.DateModified,
            userLocation.timezone
          )
        : $scope.user.DateModified;
      var filteredDateTime = $filter('date')(time, 'M/d/yyyy h:mm a');

      if (
        $scope.user.UserModified &&
        $scope.user.UserModified != ctrl.emptyGuid
      ) {
        var users = referenceDataService.get(
          referenceDataService.entityNames.users
        );
        var user = _.find(users, { UserId: $scope.user.UserModified });
        if (!_.isNil(user)) {
          var lastModifiedUser = user.FirstName + ' ' + user.LastName;
          $scope.lastModifiedMessage =
            lastModifiedUser + ' on ' + filteredDateTime + ' (' + abbr + ')';
        } else {
            var lastModifiedUser = 'External User (' + $scope.user.UserModified + ')';
            var lastMod = new Date($scope.user.DateModified);
            $scope.lastModifiedMessage =
                lastModifiedUser + ' on ' + lastMod.toDateString();
        }
      }
    };

    ctrl.getLastModifiedMessage();

    $scope.openStatusChangeConfirmationModal = function (layout) {
      $scope.rolesSelectionIsValid = true;
      if (!$scope.user.IsActive) {
        var user = $scope.user;
        var locationError = false;

        if (
          user.$$locations &&
          user.$$locations.length == 0 &&
          user.$$selectedPracticeRoles.length == 0
        ) {
          $scope.rolesSelectionIsValid = false;
          $timeout(function () {
            if ($('#inpLocations').length > 0) {
              $('#inpLocations').focus();
              $timeout(function () {
                $('#inpLocations').click();
              }, 500);
            }
          });
          $scope.user.IsActive = true;
          return;
        }

        var firstLocationErrorId = 0;
        if (user.$$locations) {
          angular.forEach(user.$$locations, function (location) {
            if (!location.Roles || location.Roles.length == 0) {
              locationError = true;
              firstLocationErrorId =
                firstLocationErrorId == 0
                  ? location.Location.LocationId
                  : firstLocationErrorId;
            }
          });
        }
        if (locationError) {
          $scope.hasRoleErrors = true;
          $scope.rolesSelectionIsValid = false;
          $timeout(function () {
            if ($('#inpLocRole' + firstLocationErrorId).length > 0) {
              $('#inpLocRole' + firstLocationErrorId)
                .first()
                .focus();
              $timeout(function () {
                $('#inpLocRole' + firstLocationErrorId)
                  .first()
                  .click();
              }, 500);
            }
          });
          $scope.user.IsActive = true;
          return;
        }
      }

      if ($scope.rolesSelectionIsValid) {
        layout = angular.isDefined(layout) ? layout : 1;
        var modalInstance = $uibModal.open({
          templateUrl:
            'App/BusinessCenter/components/status-change-confirmation/status-change-confirmation.html',
          keyboard: false,
          size: 'md',
          windowClass: 'center-modal user-status-change-modal',
          backdrop: 'static',
          controller: 'StatusChangeConfirmationController',
          resolve: {
            userData: function () {
              return $scope.user;
            },
            layout: function () {
              return layout;
            },
          },
        });
      }
    };

    ctrl.unregisterStatusChangeConfirm = $rootScope.$on(
      'statusChangeConfirmed',
      function (event, result) {
        if (result.layout == 1 && result.confirm && !$scope.user.IsActive) {
          $scope.saveUser();
        } else if (
          result.layout == 1 &&
          !result.confirm &&
          $scope.user.IsActive
        ) {
          $scope.user.IsActive = false;
        } else if (result.layout == 2 && !result.confirm) {
          $scope.user.IsActive = true;
        }
        // set property signaling that user has been activated
        if (result.layout === 1 && $scope.user.IsActive === true) {
          // user has confirmed reactivation, set userActivated which notifies
          // the userLocationSetup to get the retained roles
          $scope.userActivated = true;
        }
      }
    );

    $scope.$on('$destroy', function () {
      ctrl.unregisterStatusChangeConfirm();
    });
  },
]);
