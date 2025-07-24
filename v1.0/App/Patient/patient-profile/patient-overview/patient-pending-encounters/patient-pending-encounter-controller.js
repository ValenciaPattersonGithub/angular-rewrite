'use strict';
var app = angular.module('Soar.Patient');
app.controller('PatientPendingEncounterController', [
  '$scope',
  '$rootScope',
  '$filter',
  '$location',
  '$q',
  'localize',
  'toastrFactory',
  '$timeout',
  'patSecurityService',
  'PersonFactory',
  'referenceDataService',
  'AccountSummaryFactory',
  'AccountSummaryDeleteFactory',
  '$routeParams',
  'PatientSummaryFactory',
  PatientPendingEncounterController,
]);
function PatientPendingEncounterController(
  $scope,
  $rootScope,
  $filter,
  $location,
  $q,
  localize,
  toastrFactory,
  $timeout,
  patSecurityService,
  personFactory,
  referenceDataService,
  accountSummaryFactory,
  accountSummaryDeleteFactory,
  $routeParams,
  patientSummaryFactory
) {
  BaseCtrl.call(this, $scope, 'PatientPendingEncounterController');
  var ctrl = this;

  var cachedLocation = JSON.parse(sessionStorage.getItem('userLocation'));

  ctrl.locations = undefined;

  /**
   * Get locations.
   *
   * @returns {angular.IPromise}
   */
  ctrl.getLocations = () => {
    if (ctrl.locations) {
      return $q.resolve(ctrl.locations);
    }
    return referenceDataService
      .getData(referenceDataService.entityNames.locations)
      .then(function (locations) {
        ctrl.locations = locations;
        return ctrl.locations;
      });
  };

  ctrl.location = undefined;

  /**
   * Get user location
   * @returns {angular.IPromise}
   */
  ctrl.getUserLocation = () => {
    if (ctrl.location) {
      return $q.resolve(ctrl.location);
    }
    return ctrl.getLocations().then(function (locations) {
      return cachedLocation != null
        ? _.find(locations, { LocationId: cachedLocation.id })
        : locations[0];
    });
  };

  $scope.checkoutAllIsAllowed = true;
  $scope.multiLocationEncounterTooltip = localize.getLocalizedString(
    'Your {0} has {1}s spanning multiple {1} {2}s. Please delete your {0} and create a new one so that all {1}s are assigned to the same {2}.',
    ['encounter', 'service', 'location']
  );
  $scope.disableAllPendingEncountersTooltip = localize.getLocalizedString(
    'You have {0}s spanning multiple {1} {2}s. You must check out the {0}s individually.',
    ['encounter', 'service', 'location']
  );
  $scope.noDeleteAccessTooltipMessage = localize.getLocalizedString(
    'You do not have permission to Delete {0}s at the service location.',
    ['encounter']
  );

  $scope.PendingEncounters = [];
  ctrl.patientEncounterView = true; //by default showing pending encounters for patient
  $scope.singleMemberAccountView = true; //flag shows the current view is for only one member account, if true then, no toggle link to show pending encounters for patient or account members.
  $scope.soarAuthEnctrChkOutKey = 'soar-acct-enctr-chkout';
  $scope.soarAuthEnctrEditKey = 'soar-acct-enctr-edit';
  $scope.soarAuthEnctrDeleteKey = 'soar-acct-enctr-delete';

  ctrl.getViewEncountersText = function () {
    return localize.getLocalizedString(
      'View Pending Encounters for {0} ({1})',
      [
        ctrl.patientEncounterView
          ? localize.getLocalizedString('Account')
          : localize.getLocalizedString('Patient'),
        ctrl.patientEncounterView
          ? ctrl.allPendingEncounters.length
          : ctrl.patientEncounterViewLength,
      ]
    );
  };

  ctrl.filterEncounters = function () {
    $scope.PendingEncounters = ctrl.patientEncounterView
      ? _.filter(ctrl.allPendingEncounters, {
          AccountMemberId:
            $scope.patient.PersonAccount.PersonAccountMember.AccountMemberId,
        })
      : ctrl.allPendingEncounters;
    ctrl.patientEncounterViewLength = ctrl.patientEncounterView
      ? $scope.PendingEncounters.length
      : ctrl.patientEncounterViewLength;
    if (!$scope.singleMemberAccountView) {
      $scope.pendingEncounterActions[0].Text = ctrl.getViewEncountersText();
    }
  };

  $scope.refreshSummaryPageDataForGrid = function () {
    $timeout(function () {
      ctrl.getPendingEncounters();
    }, 100);
  };

  $scope.$rootScopeRegistrations.push(
    $rootScope.$on('checkoutCompleted', function () {
      $timeout(function () {
        ctrl.getPendingEncounters();
      }, 100);
    })
  );

  ctrl.loadAccountOverview = function (accountOverview) {
    if (accountOverview) {
      $scope.singleMemberAccountView =
        accountOverview.AccountMembersProfileInfo.length === 1;
      if (!$scope.singleMemberAccountView) {
        $scope.pendingEncounterActions = [
          {
            Function: function () {
              ctrl.patientEncounterView = !ctrl.patientEncounterView;
              ctrl.filterEncounters();
            },
            Path: '',
            Text: '',
          },
        ];
      }
    }
  };

  ctrl.getPendingEncounters = function () {
    if (!$scope.patient || !$scope.patient.PersonAccount) {
      return $q.resolve();
    }

    return accountSummaryFactory
      .getPendingEncounters($scope.patient.PersonAccount.AccountId, {})
      .then(function (rows) {
        if (!$scope.patient || !$scope.patient.PersonAccount) {
          return $q.resolve();
        }
        $scope.checkoutAllIsAllowed = patientSummaryFactory.canCheckoutAllEncounters(
          rows
        );
        ctrl.allPendingEncounters = rows;
        ctrl.filterEncounters();
      });
  };

  $scope.getRowDetails = function (row) {
    if (!row.retrieved) {
      accountSummaryFactory.getEncounterDetails(
        row,
        $scope.patient.PersonAccount.AccountId,
        null
      );
    }
    row.showDetail = !row.showDetail;
  };

  ctrl.init = function () {
    $scope.$observerRegistrations.push(
      personFactory.observeActiveAccountOverview(ctrl.loadAccountOverview)
    );
    ctrl.loadAccountOverview(personFactory.ActiveAccountOverview);
    ctrl.getPendingEncounters().then(function () {
      // Set the title after getting the pending encounters above
      const pendingEncountersTitle = $scope.singleMemberAccountView
        ? ' (' + $scope.PendingEncounters.length + ')'
        : '';
      $scope.sectionTitle = `Pending Encounters ${pendingEncountersTitle}`;
    });
  };
  ctrl.init();

  //click events

  ctrl.notifyNotAuthorized = function (authMessageKey) {
    toastrFactory.error(
      patSecurityService.generateMessage(authMessageKey),
      'Not Authorized'
    );
    $location.path('/');
  };

  // handle developmode links
  $scope.checkoutAllPendingEncounters = function () {
    if (
      patSecurityService.IsAuthorizedByAbbreviation(
        $scope.soarAuthEnctrChkOutKey
      )
    ) {
      var params = {};
      params.$$locationId = ctrl.allPendingEncounters[0].$$locationId;
      params.ObjectId = null;
      if ($scope.checkoutAllIsAllowed) {
        ctrl
          .setRouteParams(params, 'Checkout/PatientOverview')
          .then(function () {
            patientSummaryFactory.changeCheckoutEncounterLocation($routeParams);
          });
      }
    } else {
      ctrl.notifyNotAuthorized($scope.soarAuthEnctrChkOutKey);
    }
  };

  // handle developmode links
  $scope.checkoutPendingEncounter = function (row) {
    if (
      patSecurityService.IsAuthorizedByAbbreviation(
        $scope.soarAuthEnctrChkOutKey
      )
    ) {
      ctrl.setRouteParams(row, 'Checkout/PatientOverview').then(function () {
        patientSummaryFactory.changeCheckoutEncounterLocation($routeParams);
      });
    } else {
      ctrl.notifyNotAuthorized($scope.soarAuthEnctrChkOutKey);
    }
  };

  $scope.editEncounter = function (encounter) {
    if (
      patSecurityService.IsAuthorizedByAbbreviation($scope.soarAuthEnctrEditKey)
    ) {
      ctrl
        .setRouteParams(encounter, 'EncountersCart/PatientOverview')
        .then(function () {
          patientSummaryFactory.changeCheckoutEncounterLocation($routeParams);
        });
    } else {
      ctrl.notifyNotAuthorized($scope.soarAuthEnctrEditKey);
    }
  };

  $scope.deleteEncounter = function (encounter) {
    return ctrl.getUserLocation().then(function (location) {
      return accountSummaryDeleteFactory.deleteAccountSummaryRowDetail(
        encounter,
        null,
        $scope.refreshSummaryPageDataForGrid,
        location.LocationId
      );
    });
  };

  ctrl.setRouteParams = function (row, route) {
    $routeParams.patientId = $scope.patient.PatientId;
    $routeParams.accountId = $scope.patient.PersonAccount.AccountId;
    $routeParams.encounterId = row.ObjectId;
    $routeParams.route = route;
    $routeParams.location = row.$$locationId;

    var currentUserLocation = JSON.parse(
      sessionStorage.getItem('userLocation')
    );

    return ctrl.getUserLocation().then(function (location) {
      if (location && _.isEqual(row.$$locationId, currentUserLocation.id)) {
        $routeParams.overrideLocation = false;
      } else {
        $routeParams.overrideLocation = true;
      }
    });
  };
}

PatientPendingEncounterController.prototype = Object.create(BaseCtrl.prototype);
