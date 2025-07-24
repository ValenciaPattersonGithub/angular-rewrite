'use strict';
angular.module('Soar.Patient').controller('CreateNoteModalController', [
  '$scope',
  'toastrFactory',
  'localize',
  '$filter',
  'ModalFactory',
  'referenceDataService',
  'AccountNoteFactory',
  '$q',
  'TimeZoneFactory',
  /**
   *
   * @param {*} $scope
   * @param {*} toastrFactory
   * @param {*} localize
   * @param {angular.IFilterService} $filter
   * @param {*} modalFactory
   * @param {*} referenceDataService
   * @param {*} accountNoteFactory
   * @param {angular.IQService} $q
   */
  function (
    $scope,
    toastrFactory,
    localize,
    $filter,
    modalFactory,
    referenceDataService,
    accountNoteFactory,
    $q,
    timeZoneFactory
  ) {
    var ctrl = this;

    $scope.minDate = moment(new Date(1000, 12, 31, 23, 59, 59, 999));

    $scope.maxDate = moment(new Date());

    $scope.accountMemberLists = [];

    ctrl.patientId = null;

    $scope.isAddmode = true;
    $scope.patientIndex = null;
    $scope.disableSave = false;

    $scope.dataPersonAccountNote = {
      AccountId: null,
      PatientId: null,
      Date: null,
      Description: '',
      DataTag: null,
      Type: 'Account Note',
      LocationId: null,
    };

    ctrl.init = function () {
      //intialize the value if view and edit
      if (_.isEqual($scope.mode, 'view') || _.isEqual($scope.mode, 'edit')) {
        var locationId = $scope.personAccountNote.LocationId
          ? $scope.personAccountNote.LocationId
          : $scope.personAccountNote.Location;
        $scope.dataPersonAccountNote = {
          Id: $scope.personAccountNote.Id
            ? $scope.personAccountNote.Id
            : $scope.personAccountNote.PersonAccountNoteId,
          AccountId: $scope.personAccountNote.AccountId,
          PatientId: $scope.personAccountNote.PatientId
            ? $scope.personAccountNote.PatientId
            : $scope.personAccountNote.PersonId,
          // This method is used time shift the date to the local time with the same
          // "time" as the date in the practice location's timezone.
          Date: ctrl.convertDateToMomentTZ(
            $scope.personAccountNote.DateEntered,
            locationId
          ),
          Description: $scope.personAccountNote.Description,
          DataTag: $scope.personAccountNote.DataTag,
          Type: 'Account Note',
          LocationId: locationId,
        };
        $scope.selectedAccountMember = $filter('filter')(
          $scope.accountMemberLists,
          { PatientId: $scope.dataPersonAccountNote.PatientId },
          true
        )[0];
        $scope.patientIndex = $scope.selectedAccountMember.index;
        ctrl.initializeDefault();
      }

      if (
        _.isUndefined($scope.window) ||
        !_.isEqual($scope.window, 'receivables')
      ) {
        if (_.isUndefined($scope.$parent.data)) {
          ctrl.accountId = $scope.dataPersonAccountNote.AccountId;
          ctrl.patientId = $scope.dataPersonAccountNote.PatientId;
        } //If other window
        else {
          ctrl.accountId = $scope.$parent.data.currentPatient.AccountId;
          if (
            Array.isArray($scope.$parent.selectedPatientId) &&
            $scope.$parent.selectedPatientId.length > 0
          ) {
            ctrl.patientId = $scope.$parent.selectedPatientId[0];
          } else {
            ctrl.patientId =
              $scope.$parent.selectedPatientId == 0
                ? $scope.$parent.currentPatientId
                : $scope.$parent.selectedPatientId;
          }
        }
      } else {
        // If receibles window
        ctrl.patientId = $scope.patientInfo.ResponsiblePartyId;
        ctrl.accountId = $scope.patientInfo.AccountId;
      }

      if (_.isEqual($scope.mode, 'add')) {
        $scope.dataPersonAccountNote.LocationId = JSON.parse(
          sessionStorage.getItem('userLocation')
        ).id;
        $scope.selectedAccountMember = $filter('filter')(
          $scope.accountMemberLists,
          { PatientId: ctrl.patientId },
          true
        )[0];
        $scope.patientIndex = $scope.selectedAccountMember.index;
        $scope.dataPersonAccountNote.PatientId =
          $scope.selectedAccountMember.PatientId;

        // This is going to get "now", but shifted to the local time with the same
        // "time" as the current time in the practice location's timezone. This is required
        // because the save method will shift the date back.
        $scope.dataPersonAccountNote.Date = ctrl.convertDateToMomentTZ(
          null,
          $scope.dataPersonAccountNote.LocationId
        );

        ctrl.initializeDefault();
      }

      if (_.isEqual($scope.mode, 'view')) $scope.isAddmode = false;
    };

    $scope.getTitle = function () {
      switch ($scope.mode) {
        case 'add':
          return localize.getLocalizedString('Add an Account Note');
        case 'view':
          return localize.getLocalizedString('View Account Note');
        case 'edit':
          return localize.getLocalizedString('Edit Account Note');
        default:
          return localize.getLocalizedString('Account Note');
      }
    };

    ///Set Locations
    ctrl.setLocation = function () {
      $scope.locations = $filter('orderBy')($scope.locations, 'NameLine1');
      $scope.dataPersonAccountNote.LocationId = $scope.dataPersonAccountNote
        .LocationId
        ? $scope.dataPersonAccountNote.LocationId
        : JSON.parse(sessionStorage.getItem('userLocation')).id;
    };

    ctrl.setAccountMembers = function (data) {
      var allAccountMembers = data;
      allAccountMembers = $filter('orderBy')(allAccountMembers, [
        'LastName',
        'FirstName',
      ]);
      //Commented below statement to resolve the bug: 407246
      //allAccountMembers = $filter('filter')(allAccountMembers, { IsPatient: true }, true);
      //allAccountMembers = $filter('filter')(allAccountMembers, { IsActive: true }, true);

      var accountMembersOptionsTemp = [];
      var index = 0;
      _.forEach(allAccountMembers, function (accountMemberDto) {
        var accountMember = _.clone(accountMemberDto);
        accountMembersOptionsTemp.push({
          index: index,
          FirstName: accountMember.FirstName,
          Name: [accountMember.FirstName, accountMember.LastName]
            .filter(function (text) {
              return text;
            })
            .join(' '),
          DisplayName:
            [accountMember.FirstName, accountMember.LastName.charAt(0)]
              .filter(function (text) {
                return text;
              })
              .join(' ') + '.',
          PatientId: accountMember.PatientId,
          IsResponsiblePerson: accountMember.IsResponsiblePerson,
          PatientDetailedName:
            accountMember.FirstName +
            (accountMember.PreferredName !== null &&
            accountMember.PreferredName !== ''
              ? ' (' + accountMember.PreferredName + ')'
              : '') +
            (accountMember.MiddleName !== null &&
            accountMember.MiddleName !== ''
              ? ' ' + accountMember.MiddleName + '.'
              : '') +
            ' ' +
            accountMember.LastName +
            (accountMember.SuffixName !== null &&
            accountMember.SuffixName !== ''
              ? ', ' + accountMember.SuffixName
              : '') +
            (accountMember.IsResponsiblePerson ? ' (RP)' : ''),
        });
        index++;
      });
      $scope.accountMemberLists = accountMembersOptionsTemp;
    };

    $scope.cancelChanges = function () {
      if ($scope.mode !== 'view') {
        var madeChanges = ctrl.validateDefault();
        if (madeChanges) modalFactory.CancelModal().then(ctrl.closeModal);
        else ctrl.closeModal();
      } else ctrl.closeModal();
    };

    ctrl.closeModal = function () {
      if (
        !_.isUndefined(typeof $scope.previewModal) &&
        !_.isNull($scope.previewModal)
      ) {
        $scope.previewModal.close();
      }
    };

    $scope.save = function () {
      if ($scope.disableSave === true) {
        return;
      }
      ///check in editing or adding
      if (!_.isUndefined($scope.dataPersonAccountNote)) {
        $scope.personAccountNoteId = $scope.dataPersonAccountNote.Id;
        $scope.dataPersonAccountNote.AccountId = ctrl.accountId;
      }
      if (
        _.isUndefined($scope.dataPersonAccountNote.Description) ||
        $scope.dataPersonAccountNote.Description === ''
      ) {
        return true;
      }

      /** This method is used to undo the time shift performed by {@link convertDateToMomentTZ}. */
      var serializedDateEntered = ctrl.convertDateToSaveString(
        $scope.dataPersonAccountNote.Date,
        $scope.dataPersonAccountNote.LocationId
      );

      var accountNote = {
        PersonAccountNoteId: $scope.dataPersonAccountNote.Id,
        AccountId: $scope.dataPersonAccountNote.AccountId,
        LocationId: $scope.dataPersonAccountNote.LocationId,
        PersonId: $scope.dataPersonAccountNote.PatientId,
        DateEntered: serializedDateEntered,
        Description: $scope.dataPersonAccountNote.Description,
        DataTag: $scope.dataPersonAccountNote.DataTag,
        Type: 1,
      };
      $scope.disableSave = true;

      if ($scope.mode === 'edit') {
        accountNoteFactory.editAccountNote(accountNote, ctrl.saveSuccess);
      } else if ($scope.mode === 'add') {
        accountNoteFactory.createAccountNote(accountNote, ctrl.saveSuccess);
      }
    };

    ctrl.saveSuccess = function () {
      ctrl.closeModal();
      toastrFactory.success(
        localize.getLocalizedString('Saved {0}.', ['successful']),
        localize.getLocalizedString('Success')
      );
      if ($scope.window !== 'receivables') {
        if (_.isUndefined($scope.$parent.refreshSummaryPageDataForGrid)) {
          if (_.isUndefined($scope.$parent.refreshTransactionHistory))
            $scope.$parent.$parent.refreshSummaryPageDataForGrid();
          else $scope.$parent.refreshTransactionHistory();
        } else {
          $scope.$parent.refreshSummaryPageDataForGrid();
        }
      }
    };

    ctrl.getLocation = getLocation;
    /**
     * Finds a location by LocationId. Locations should be initialized on init.
     *
     * Returns undefined if no location is found.
     *
     * @param {number} locationId
     * @returns
     */
    function getLocation(locationId) {
      return $scope.locations.find(
        location => location.LocationId === locationId
      );
    }

    ctrl.getTimezone = getTimezone;
    /**
     * Finds the standard time zone for the location with the given LocationId.
     *
     * Returns the user's timezone if no location is found or the location has no standard timezone.
     *
     * @param {number} locationId
     * @returns {string}
     */
    function getTimezone(locationId) {
      var location = ctrl.getLocation(locationId);
      return location ? location.Timezone : null;
    }

    ctrl.convertDateToMomentTZ = convertDateToMomentTZ;
    /**
     * Performs a time shift on the given date. The date is assumed to be in UTC. The time shift is
     * based on the location with the given LocationId. The resulting date is returned in local time, with
     * the same "time" as the date in the practice's timezone.
     *
     * If no date is given, the current date is used. The current date is also shifted.
     *
     * @param {moment.MomentInput} date Date string in ISO format
     * @param {number} locationId
     * @returns {moment.Moment}
     */
    function convertDateToMomentTZ(date, locationId) {
      var timezone = ctrl.getTimezone(locationId);
      if (date) {
        return timeZoneFactory.ConvertDateToMomentTZ(date, timezone);
      }

      return timeZoneFactory.ConvertDateToMomentTZ(moment.utc(), timezone);
    }

    ctrl.convertDateToSaveString = convertDateToSaveString;
    /**
     * The date is assumed to be in local time. The date is "changed"
     * to the practice location's timezone based on the location with the given LocationId. The resulting date retains
     * the same local time.
     *
     * This method is used to undo the time shift performed by {@link convertDateToMomentTZ}.
     *
     * @param {moment.MomentInput} dateEntered
     * @param {number} locationId
     * @returns {string}
     */
    function convertDateToSaveString(dateEntered, locationId) {
      var timezone = ctrl.getTimezone(locationId);
      return timeZoneFactory.ConvertDateToSaveString(dateEntered, timezone);
    }

    ctrl.initializeDefault = function () {
      var locationId = $scope.dataPersonAccountNote.LocationId
        ? $scope.dataPersonAccountNote.LocationId
        : $scope.selectedLocation
        ? $scope.selectedLocation.LocationId
        : null;

      ctrl.accountNoteTemp = _.clone({
        LocationId: locationId,
        PatientId: $scope.dataPersonAccountNote.PatientId
          ? $scope.dataPersonAccountNote.PatientId
          : $scope.selectedAccountMember
          ? $scope.selectedAccountMember.PatientId
          : null,
        DateEntered: $scope.dataPersonAccountNote.Date
          ? $scope.dataPersonAccountNote.Date
          : ctrl.convertDateToMomentTZ(null, locationId),
        Description: $scope.dataPersonAccountNote.Description,
      });
    };
    ctrl.validateDefault = function () {
      if (
        ctrl.accountNoteTemp &&
        ($scope.dataPersonAccountNote.LocationId !=
          ctrl.accountNoteTemp.LocationId ||
          $scope.dataPersonAccountNote.PatientId !=
            ctrl.accountNoteTemp.PatientId ||
          moment($scope.dataPersonAccountNote.Date).format('MM/DD/YYYY') !=
            moment(ctrl.accountNoteTemp.DateEntered).format('MM/DD/YYYY') ||
          $scope.dataPersonAccountNote.Description !=
            ctrl.accountNoteTemp.Description)
      ) {
        return true;
      }
      return false;
    };

    ctrl.validateChange = function () {
      $scope.validChange =
        ctrl.validateDefault() &&
        !_.isNil($scope.dataPersonAccountNote.Description) &&
        _.isEqual(
          $scope.dataPersonAccountNote.Description.match(/^ *$/),
          null
        ) &&
        !_.isNull($scope.dataPersonAccountNote.Date);
    };

    $scope.patientChanged = function (newValue) {
      if (!$scope.accountMemberLists || !newValue) return;

      var currentPatient = $filter('filter')(
        $scope.accountMemberLists,
        {
          index: parseInt(newValue),
        },
        true
      )[0];

      $scope.patientIndex = currentPatient.index;
      $scope.dataPersonAccountNote.PatientId = currentPatient.PatientId;
      ctrl.validateChange();
    };
    $scope.locationChanged = function (newValue) {
      if (!$scope.locations || !newValue) return;

      var currentLocation = $filter('filter')(
        $scope.locations,
        {
          LocationId: parseInt(newValue),
        },
        true
      )[0];

      // Unshift the date from the original location time zone, and reshift the new location time zone.
      $scope.dataPersonAccountNote.Date = ctrl.convertDateToMomentTZ(
        ctrl.convertDateToSaveString(
          $scope.dataPersonAccountNote.Date,
          $scope.dataPersonAccountNote.LocationId
        ),
        currentLocation.LocationId
      );

      $scope.dataPersonAccountNote.LocationId = currentLocation.LocationId;

      ctrl.validateChange();
    };
    $scope.descriptionChanged = function () {
      ctrl.validateChange();
    };
    $scope.$watch('dataPersonAccountNote.Date', ctrl.validateChange, true);

    ctrl.setAccountMembers($scope.accountMembers);

    $scope.loading = true;
    $q.resolve(
      $scope.locations
        ? $scope.locations
        : referenceDataService.getData(
            referenceDataService.entityNames.locations
          )
    ).then(function (locations) {
      $scope.locations = locations;
      ctrl.setLocation();
      ctrl.init();
      $scope.loading = false;
    });
  },
]);
