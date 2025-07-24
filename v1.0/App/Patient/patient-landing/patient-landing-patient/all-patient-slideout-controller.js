'user strict';

angular
  .module('Soar.Patient')
  .controller('AllPatientSlideoutController', [
    '$scope',
    '$timeout',
    'PatientAdditionalIdentifierService',
    'toastrFactory',
    'localize',
    AllPatientSlideoutController,
  ]);
function AllPatientSlideoutController(
  $scope,
  $timeout,
  patientAdditionalIdentifierService,
  toastrFactory,
  localize
) {
  BaseCtrl.call(this, $scope, 'AllPatientSlideoutController');
  var ctrl = this;
  ctrl.isFirstLoad = true;
  //#region array declarations

  $scope.getPatientAdditionalIdentifiers = function () {
    patientAdditionalIdentifierService.get().then(
      function (res) {
        if ($scope.patientAdditionalIdGetSuccess) {
          $scope.patientAdditionalIdGetSuccess(res);
        }
      },
      function () {
        $scope.patientAdditionalIdGetFailure();
      }
    );
  };

  $scope.patientAdditionalIdGetSuccess = function (res) {
    $scope.patientAdditionalIdentifiers = res.Value != null ? res.Value : [];
    $scope.additionalIdentifiers = [
      {
        Field: 'AdditionalIdentifiers',
        Value: 'All',
        Key: 'All',
        isVisible: true,
        isSelected: ctrl.isFirstLoad
          ? true
          : ctrl.isItemSelected('AdditionalIdentifiers', null),
      },
      {
        Field: 'AdditionalIdentifiers',
        Value: 'N/A',
        Key: '00000000-0000-0000-0000-000000000000',
        isVisible: true,
        isSelected: ctrl.isFirstLoad
          ? true
          : ctrl.isItemSelected(
              'AdditionalIdentifiers',
              '00000000-0000-0000-0000-000000000000'
            ),
      },
    ];
    var sortedAI = _.orderBy(
      $scope.patientAdditionalIdentifiers,
      ['Description'],
      ['asc']
    );
    angular.forEach(sortedAI, function (item) {
      $scope.additionalIdentifiers.push({
        Field: 'AdditionalIdentifiers',
        Value: item.Description,
        Key: item.MasterPatientIdentifierId,
        isVisible: $scope.patientAdditionalIdentifiers > 4 ? false : true,
        isSelected: ctrl.isFirstLoad
          ? true
          : ctrl.isItemSelected('AdditionalIdentifiers', item.Key),
      });
    });

    $scope.hasIdentifiers = $scope.patientAdditionalIdentifiers.length > 0;
  };

  $scope.patientAdditionalIdGetFailure = function () {
    $scope.patientAdditionalIdentifiers = [];
    toastrFactory.error(
      localize.getLocalizedString(
        'Failed to retrieve the list of patient additional identifiers. Refresh the page to try again.'
      ),
      localize.getLocalizedString('Error')
    );
  };

  ctrl.$onInit = function () {
    $scope.getPatientAdditionalIdentifiers();
  };

  $scope.appointmentDates = [
    { Field: 'BusinessDays', Value: 'All', Key: 'All', Checked: true },
    {
      Field: 'BusinessDays',
      Value: 'Next Business Day',
      Key: 1,
      Checked: false,
    },
    { Field: 'BusinessDays', Value: 'Next 7 Days', Key: 2, Checked: false },
  ];

  $scope.insuranceFilters = [
    { Field: 'HasInsurance', Value: 'All', Key: null, Checked: true },
    { Field: 'HasInsurance', Value: 'Yes', Key: true, Checked: false },
    { Field: 'HasInsurance', Value: 'No', Key: false, Checked: false },
  ];

  $scope.preventiveCareStates = [
    { Field: 'IsNoDueDate', Value: 'All', Key: 'All' },
    { Field: 'IsNoDueDate', Value: 'No Due Date', Key: true },
    { Field: 'PreventiveCareIsScheduled', Value: 'Scheduled', Key: true },
    { Field: 'PreventiveCareIsScheduled', Value: 'Unscheduled', Key: false },
  ];

  $scope.appointmentStates = [
    { Field: '', Value: 'All', Key: 'All' },
    { Field: 'AppointmentStatusList', Value: 'Completed', Key: 3 },
    { Field: 'IsScheduled', Value: 'Scheduled', Key: true },
    { Field: 'IsScheduled', Value: 'Unscheduled', Key: false },
  ];

  $scope.treatmentPlanStates = [
    { Field: 'TreatmentPlanStates', Value: 'All', Key: 'All' },
    { Field: 'TreatmentPlanStates', Value: 'N/A', Key: null },
    { Field: 'TreatmentPlanStates', Value: 'Scheduled', Key: true },
    { Field: 'TreatmentPlanStates', Value: 'Unscheduled', Key: false },
  ];

  $scope.patientTypeStatus = [
    { Field: '', Value: 'All', Key: 'All', Checked: false },
    { Field: 'IsActive', Value: 'Active', Key: true, Checked: true },
    { Field: 'IsActive', Value: 'Inactive', Key: false, Checked: false },
    { Field: 'IsPatient', Value: 'Non-Patients', Key: false, Checked: false },
    { Field: 'IsPatient', Value: 'Patients', Key: true, Checked: true },
  ];

  $scope.reminderStatus = [
    { Field: 'ReminderStatus', Value: 'All', Key: 'All' },
    { Field: 'ReminderStatus', Value: 'N/A', Key: null },
    { Field: 'ReminderStatus', Value: 'Confirmed', Key: 2 },
    { Field: 'ReminderStatus', Value: 'Reminder Sent', Key: 1 },
    { Field: 'ReminderStatus', Value: 'Unconfirmed', Key: 0 },
  ];

  ctrl.currentMonth = new Date().getMonth() + 1;
  $scope.birthMonths = [
    { Field: 'BirthMonths', Value: 'All', Key: -1, Checked: true },
    { Field: 'BirthMonths', Value: 'N/A', Key: 0, Checked: true },
    { Field: 'BirthMonths', Value: 'January', Key: 1, Checked: true },
    { Field: 'BirthMonths', Value: 'February', Key: 2, Checked: true },
    { Field: 'BirthMonths', Value: 'March', Key: 3, Checked: true },
    { Field: 'BirthMonths', Value: 'April', Key: 4, Checked: true },
    { Field: 'BirthMonths', Value: 'May', Key: 5, Checked: true },
    { Field: 'BirthMonths', Value: 'June', Key: 6, Checked: true },
    { Field: 'BirthMonths', Value: 'July', Key: 7, Checked: true },
    { Field: 'BirthMonths', Value: 'August', Key: 8, Checked: true },
    { Field: 'BirthMonths', Value: 'September', Key: 9, Checked: true },
    { Field: 'BirthMonths', Value: 'October', Key: 10, Checked: true },
    { Field: 'BirthMonths', Value: 'November', Key: 11, Checked: true },
    { Field: 'BirthMonths', Value: 'December', Key: 12, Checked: true },
  ];
  //#endregion scope declarations

  $scope.isCollapsed = true;

  ctrl.isResetFull = '1';

  $scope.isVisibleShowMorebuttonDentist = null;
  $scope.isVisibleShowLessbuttonDentist = null;
  $scope.isVisibleShowMorebuttonHygienist = null;
  $scope.isVisibleShowLessbuttonHygienist = null;
  $scope.isVisibleShowMorebuttonZipCodes = null;
  $scope.isVisibleShowLessbuttonZipCodes = null;
  $scope.isVisibleShowMorebuttonPrefferedLoc = null;
  $scope.isVisibleShowLessbuttonPrefferedLoc = null;
  $scope.isVisibleShowMorebuttonAI = null;
  $scope.isVisibleShowLessbuttonAI = null;

  ctrl.showMoreLessButtonInitialize = function () {
    $scope.isVisibleShowMorebuttonDentist = false;
    $scope.isVisibleShowLessbuttonDentist = false;
    $scope.isVisibleShowMorebuttonHygienist = false;
    $scope.isVisibleShowLessbuttonHygienist = false;
    $scope.isVisibleShowMorebuttonZipCodes = false;
    $scope.isVisibleShowLessbuttonZipCodes = false;
    $scope.isVisibleShowMorebuttonPrefferedLoc = false;
    $scope.isVisibleShowLessbuttonPrefferedLoc = false;
    $scope.isVisibleShowMorebuttonAI = false;
    $scope.isVisibleShowLessbuttonAI = false;
  };

  ctrl.showMoreLessButtonInitialize();

  // Selected Location
  $scope.$watch('selectedLocation', function () {
    ctrl.isResetFull = '1';
  });

  // Grid Data
  $scope.$watch('gridData', function (nv, ov) {
    if (nv != undefined) {
      ctrl.updateFilters();
    }
  });

  ctrl.updateFilters = function () {
    $scope.preferredLocations = [
      {
        Field: 'PreferredLocations',
        Value: 'All',
        Key: 'All',
        isVisible: true,
        isSelected: ctrl.isFirstLoad
          ? true
          : ctrl.isItemSelected('PreferredLocations', null),
      },
      //{ Field: "PreferredLocations", Value: "N/A", Key: null, isVisible: true, isSelected: ctrl.isFirstLoad ? true : ctrl.isItemSelected('PreferredLocations', null) }
    ];

    angular.forEach($scope.gridData.PreferredLocation, function (item) {
      $scope.preferredLocations.push({
        Field: 'PreferredLocations',
        Value: item.Value,
        Key: item.Key,
        isVisible: $scope.preferredLocations.length > 4 ? false : true,
        isSelected: ctrl.isFirstLoad
          ? true
          : ctrl.isItemSelected('PreferredLocations', item.Key),
      });
    });

    $scope.preferredDentists = [
      {
        Field: 'PreferredDentists',
        Value: 'All',
        Key: 'All',
        isVisible: true,
        isSelected: ctrl.isFirstLoad
          ? true
          : ctrl.isItemSelected('PreferredDentists', null),
      },
      {
        Field: 'PreferredDentists',
        Value: 'N/A',
        Key: '00000000-0000-0000-0000-000000000000',
        isVisible: true,
        isSelected: ctrl.isFirstLoad
          ? true
          : ctrl.isItemSelected(
              'PreferredDentists',
              '00000000-0000-0000-0000-000000000000'
            ),
      },
    ];

    angular.forEach($scope.gridData.PreferredDentists, function (item) {
      $scope.preferredDentists.push({
        Field: 'PreferredDentists',
        Value: item.Value,
        Key: item.Key,
        isVisible: $scope.preferredDentists.length > 4 ? false : true,
        isSelected: ctrl.isFirstLoad
          ? true
          : ctrl.isItemSelected('PreferredDentists', item.Key),
      });
    });
    //Group Type
    $scope.groupTypes = [
      {
        Field: 'GroupTypes',
        Value: 'All',
        Key: 'All',
        isVisible: true,
        isSelected: ctrl.isFirstLoad
          ? true
          : ctrl.isItemSelected('GroupTypes', null),
      },
      {
        Field: 'GroupTypes',
        Value: 'N/A',
        Key: '00000000-0000-0000-0000-000000000000',
        isVisible: true,
        isSelected: ctrl.isFirstLoad
          ? true
          : ctrl.isItemSelected(
              'GroupTypes',
              '00000000-0000-0000-0000-000000000000'
            ),
      },
    ];

    angular.forEach($scope.gridData.GroupTypes, function (item) {
      $scope.groupTypes.push({
        Field: 'GroupTypes',
        Value: item.Value,
        Key: item.Key,
        isVisible: $scope.groupTypes.length > 4 ? false : true,
        isSelected: ctrl.isFirstLoad
          ? true
          : ctrl.isItemSelected('GroupTypes', item.Key),
      });
    });

    // Preferred Hygienists
    $scope.preferredHygienists = [
      {
        Field: 'PreferredHygienists',
        Value: 'All',
        Key: 'All',
        isVisible: true,
        isSelected: ctrl.isFirstLoad
          ? true
          : ctrl.isItemSelected('PreferredHygienists', null),
      },
      {
        Field: 'PreferredHygienists',
        Value: 'N/A',
        Key: '00000000-0000-0000-0000-000000000000',
        isVisible: true,
        isSelected: ctrl.isFirstLoad
          ? true
          : ctrl.isItemSelected(
              'PreferredHygienists',
              '00000000-0000-0000-0000-000000000000'
            ),
      },
    ];

    angular.forEach($scope.gridData.PreferredHygienists, function (item) {
      $scope.preferredHygienists.push({
        Field: 'PreferredHygienists',
        Value: item.Value,
        Key: item.Key,
        isVisible: $scope.preferredHygienists.length > 4 ? false : true,
        isSelected: ctrl.isFirstLoad
          ? true
          : ctrl.isItemSelected('PreferredHygienists', item.Key),
      });
    });

    $scope.zipCodes = [
      {
        Field: 'ZipCodes',
        Value: 'All',
        Key: 'All',
        isVisible: true,
        isSelected: ctrl.isFirstLoad
          ? true
          : ctrl.isItemSelected('ZipCodes', null),
      },
      {
        Field: 'ZipCodes',
        Value: 'N/A',
        Key: '',
        isVisible: true,
        isSelected: ctrl.isFirstLoad
          ? true
          : ctrl.isItemSelected('ZipCodes', null),
      },
    ];

    angular.forEach($scope.gridData.PatientLocationZipCodes, function (item) {
      $scope.zipCodes.push({
        Field: 'ZipCodes',
        Value: item.Value,
        Key: item.Key,
        isVisible: $scope.zipCodes.length > 4 ? false : true,
        isSelected: ctrl.isFirstLoad
          ? true
          : ctrl.isItemSelected('ZipCodes', item.Key),
      });
    });

    $('.filter-option').removeClass('in');

    angular
      .element('.panel-heading')
      .find('.glyphicon-chevron-down')
      .removeClass('glyphicon-chevron-down')
      .addClass('glyphicon-chevron-up');

    ctrl.defaultFilterCount =
      3 +
      $scope.groupTypes.length +
      $scope.preventiveCareStates.length +
      $scope.reminderStatus.length +
      $scope.treatmentPlanStates.length +
      $scope.preferredDentists.length +
      $scope.preferredHygienists.length +
      $scope.preferredLocations.length +
      $scope.zipCodes.length;

    ctrl.showMoreLessButtonInitialize();
    ctrl.showMoreCheck(false);

    $scope.$emit('appliedFiltersCount', ctrl.defaultFilterCount);
    ctrl.isResetFull = '0';
  };

  ctrl.showMoreCheck = function (isVisible) {
    if (
      $scope.preferredDentists != undefined &&
      $scope.preferredHygienists != undefined &&
      $scope.preferredLocations != undefined &&
      $scope.zipCodes != undefined &&
      $scope.additionalIdentifiers != undefined &&
      $scope.groupTypes != undefined
    ) {
      if ($scope.preferredDentists.length > 5) {
        $scope.isVisibleShowMorebuttonDentist = !isVisible;
        $scope.isVisibleShowLessbuttonDentist = isVisible;
        for (var i = 5; i < $scope.preferredDentists.length; i++) {
          $scope.preferredDentists[i].isVisible = isVisible;
        }
      }

      if ($scope.preferredHygienists.length > 5) {
        $scope.isVisibleShowMorebuttonHygienist = !isVisible;
        $scope.isVisibleShowLessbuttonHygienist = isVisible;
        for (var i = 5; i < $scope.preferredHygienists.length; i++) {
          $scope.preferredHygienists[i].isVisible = isVisible;
        }
      }

      if ($scope.preferredLocations.length > 5) {
        $scope.isVisibleShowMorebuttonPrefferedLoc = !isVisible;
        $scope.isVisibleShowLessbuttonPrefferedLoc = isVisible;
        for (var i = 5; i < $scope.preferredLocations.length; i++) {
          $scope.preferredLocations[i].isVisible = isVisible;
        }
      }

      if ($scope.zipCodes.length > 5) {
        $scope.isVisibleShowMorebuttonZipCodes = !isVisible;
        $scope.isVisibleShowLessbuttonZipCodes = isVisible;
        for (var i = 5; i < $scope.zipCodes.length; i++) {
          $scope.zipCodes[i].isVisible = isVisible;
        }
      }
      if ($scope.additionalIdentifiers.length > 5) {
        $scope.isVisibleShowMorebuttonAI = !isVisible;
        $scope.isVisibleShowLessbuttonAI = isVisible;
        for (var i = 5; i < $scope.additionalIdentifiers.length; i++) {
          $scope.additionalIdentifiers[i].isVisible = isVisible;
        }
      }

      if ($scope.groupTypes.length > 5) {
        $scope.isVisibleShowMorebuttonGroup = !isVisible;
        $scope.isVisibleShowLessbuttonGroup = isVisible;
        for (var i = 5; i < $scope.groupTypes.length; i++) {
          $scope.groupTypes[i].isVisible = isVisible;
        }
      }
    }
  };
  $scope.showMoreButtonGroup = function ($event) {
    angular.forEach($scope.groupTypes, function (group) {
      group.isVisible = true;
    });

    $scope.isVisibleShowLessbuttonGroup = true;
    $scope.isVisibleShowMorebuttonGroup = false;
  };

  $scope.showLessButtonGroup = function () {
    var ctr = 1;
    angular.forEach($scope.groupTypes, function (group) {
      if (ctr > 5) group.isVisible = false;
      ctr++;
    });

    $scope.isVisibleShowMorebuttonGroup = true;
    $scope.isVisibleShowLessbuttonGroup = false;
  };
  //#region show more/less dentist button
  $scope.showMoreButtonDentist = function () {
    angular.forEach($scope.preferredDentists, function (dentist) {
      dentist.isVisible = true;
    });

    $scope.isVisibleShowLessbuttonDentist = true;
    $scope.isVisibleShowMorebuttonDentist = false;
  };

  $scope.showLessButtonDentist = function () {
    var ctr = 1;
    angular.forEach($scope.preferredDentists, function (dentist) {
      if (ctr > 5) {
        dentist.isVisible = false;
      }
      ctr++;
    });

    $scope.isVisibleShowMorebuttonDentist = true;
    $scope.isVisibleShowLessbuttonDentist = false;
  };

  //#endregion more/less dentist button

  //#region show more/less hygienist button
  $scope.showMoreButtonHygienist = function () {
    angular.forEach($scope.preferredHygienists, function (hygienist) {
      hygienist.isVisible = true;
    });

    $scope.isVisibleShowLessbuttonHygienist = true;
    $scope.isVisibleShowMorebuttonHygienist = false;
  };

  $scope.showLessButtonHygienist = function () {
    var ctr = 1;
    angular.forEach($scope.preferredHygienists, function (hygienist) {
      if (ctr > 5) {
        hygienist.isVisible = false;
      }
      ctr++;
    });

    $scope.isVisibleShowMorebuttonHygienist = true;
    $scope.isVisibleShowLessbuttonHygienist = false;
  };
  //#endregion show more/less hygienist button

  //#region show more/less zipCode button
  $scope.showMoreButtonZipCodes = function () {
    angular.forEach($scope.zipCodes, function (item) {
      item.isVisible = true;
    });

    $scope.isVisibleShowLessbuttonZipCodes = true;
    $scope.isVisibleShowMorebuttonZipCodes = false;
  };

  $scope.showLessButtonZipCodes = function () {
    var ctr = 1;
    angular.forEach($scope.zipCodes, function (item) {
      if (ctr > 5) {
        item.isVisible = false;
      }
      ctr++;
    });

    $scope.isVisibleShowMorebuttonZipCodes = true;
    $scope.isVisibleShowLessbuttonZipCodes = false;
  };
  //#endregion  show more/less zipCode button

  //#region show more/less preffered loc button
  $scope.showMoreButtonPrefferedLoc = function () {
    angular.forEach($scope.preferredLocations, function (item) {
      item.isVisible = true;
    });

    $scope.isVisibleShowLessbuttonPrefferedLoc = true;
    $scope.isVisibleShowMorebuttonPrefferedLoc = false;
  };

  $scope.showLessButtonPrefferedLoc = function () {
    var ctr = 1;
    angular.forEach($scope.preferredLocations, function (item) {
      if (ctr > 5) {
        item.isVisible = false;
      }
      ctr++;
    });

    $scope.isVisibleShowMorebuttonPrefferedLoc = true;
    $scope.isVisibleShowLessbuttonPrefferedLoc = false;
  };
  //#endregion show more/less preffered loc button

  //#region show more/less Additional Identifiers
  $scope.showMoreButtonAI = function () {
    angular.forEach($scope.additionalIdentifiers, function (item) {
      item.isVisible = true;
    });

    $scope.isVisibleShowLessbuttonAI = true;
    $scope.isVisibleShowMorebuttonAI = false;
  };

  $scope.showLessButtonAI = function () {
    var ctr = 1;
    angular.forEach($scope.additionalIdentifiers, function (item) {
      if (ctr > 5) {
        item.isVisible = false;
      }
      ctr++;
    });

    $scope.isVisibleShowMorebuttonAI = true;
    $scope.isVisibleShowLessbuttonAI = false;
  };
  //#endregion  show more/less zipCode button

  ctrl.reset = function (reset) {
    if (reset !== '0') {
      $('.filter-option').removeClass('in');

      _.each($('.prvntvCareFilters'), function (prvntvCareFilter) {
        switch (prvntvCareFilter.name) {
          case 'apptDate':
            if (prvntvCareFilter.id === 'All') {
              prvntvCareFilter.checked = true;
            }
            break;
          case 'insFilter':
            if (prvntvCareFilter.id === 'All') {
              prvntvCareFilter.checked = true;
            }
            break;
          case 'PatientTypeStatus':
            if (
              prvntvCareFilter.id === 'Active' ||
              prvntvCareFilter.id === 'Patients'
            ) {
              prvntvCareFilter.checked = true;
            } else {
              prvntvCareFilter.checked = false;
            }
            break;
          default:
            prvntvCareFilter.checked = true;
            break;
        }
      });

      angular
        .element('.panel-heading')
        .find('.glyphicon-chevron-down')
        .removeClass('glyphicon-chevron-down')
        .addClass('glyphicon-chevron-up');

      document.getElementById('btnExpandCollapse').innerHTML = 'Expand All';
      var $this = $('.collapse-all');
      $this.addClass('expand-all');
    }

    ctrl.showMoreLessButtonInitialize();
    ctrl.showMoreCheck(false);
    $scope.$emit('appliedFiltersCount', ctrl.defaultFilterCount);
  };

  $scope.$on('resetSlideOutFilter', function () {
    ctrl.reset();
  });

  $scope.toggleSelect = function (filterValue, filterHeader) {
    ctrl.isFirstLoad = false;
    ctrl.checkAllFilters(filterValue, filterHeader);
    $scope.$emit('appliedFiltersCount', $('.prvntvCareFilters:checked').length);
  };

  ctrl.checkAllFilters = function (filterValue, filterHeader) {
    var allStatus = $("ul[id='" + filterHeader + "']").find(
      'input[type=checkbox]'
    );
    if (filterValue === 'All') {
      if (!allStatus[0].checked) {
        angular.forEach(allStatus, function (liObject) {
          liObject.checked = false;
        });
      } else {
        angular.forEach(allStatus, function (liObject) {
          liObject.checked = true;
        });
      }
    } else {
      allStatus[0].checked = true;
      angular.forEach(allStatus, function (liObject) {
        if (!liObject.checked) {
          allStatus[0].checked = false;
          return true;
        }
        return false;
      });
    }
  };

  ctrl.toggleChevron = function (e) {
    $(e.target)
      .prev('.panel-heading')
      .find('i.indicator')
      .toggleClass('glyphicon-chevron-up glyphicon-chevron-down');

    //When user manually expands all fitlers
    if (
      $('.panel-collapse.patient-management-slideout:not(".in")').length == 0
    ) {
      document.getElementById('btnExpandCollapse').innerHTML = 'Collapse All';
      var $this = $('.collapse-all');
      $('.panel-collapse.patient-management-slideout:not(".in")').collapse(
        'show'
      );
      $this.removeClass('expand-all');
    }
    //When user manually collapses all fitlers
    if ($('.panel-collapse.patient-management-slideout.in').length == 0) {
      document.getElementById('btnExpandCollapse').innerHTML = 'Expand All';
      var $this = $('.collapse-all');
      $('.panel-collapse.patient-management-slideout.in').collapse('hide');
      $this.addClass('expand-all');
    }
  };

  $timeout(function () {
    $('#accordion').on('hidden.bs.collapse', ctrl.toggleChevron);
    $('#accordion').on('shown.bs.collapse', ctrl.toggleChevron);
  }, 0);

  $scope.$on('collapseExpandPanel', function () {
    if ($scope.isCollapsed) {
      ctrl.expandAll();
      $scope.isCollapsed = false;
    } else {
      ctrl.collapseAll();
      $scope.isCollapsed = true;
    }
  });

  ctrl.expandAll = function () {
    ctrl.showMoreCheck($scope.isCollapsed);
  };

  ctrl.collapseAll = function () {
    ctrl.showMoreCheck($scope.isCollapsed);
  };

  $scope.$on('$destroy', function scopeOnDestroy(event) {
    $('#accordion').off('hidden.bs.collapse', ctrl.toggleChevron);
    $('#accordion').off('shown.bs.collapse', ctrl.toggleChevron);
  });

  ctrl.isItemSelected = function (strFilter, itemId) {
    var result = false;
    switch (strFilter) {
      case 'PreferredDentists':
        if ($scope.gridData.FilterCriteria.PreferredDentists) {
          for (
            var i = 0;
            i < $scope.gridData.FilterCriteria.PreferredDentists.length;
            i++
          ) {
            if (
              $scope.gridData.FilterCriteria.PreferredDentists[i] === itemId
            ) {
              result = true;
              break;
            }
          }
        } else {
          result = true;
        }
        break;
      case 'GroupTypes':
        if ($scope.gridData.FilterCriteria.GroupTypes) {
          for (
            var i = 0;
            i < $scope.gridData.FilterCriteria.GroupTypes.length;
            i++
          ) {
            if ($scope.gridData.FilterCriteria.GroupTypes[i] === itemId) {
              result = true;
              break;
            }
          }
        } else {
          result = true;
        }
        break;
      case 'PreferredHygienists':
        if ($scope.gridData.FilterCriteria.PreferredHygienists) {
          for (
            var i = 0;
            i < $scope.gridData.FilterCriteria.PreferredHygienists.length;
            i++
          ) {
            if (
              $scope.gridData.FilterCriteria.PreferredHygienists[i] === itemId
            ) {
              result = true;
              break;
            }
          }
        } else {
          result = true;
        }
        break;
      case 'PreferredLocations':
        if ($scope.gridData.FilterCriteria.PreferredLocations) {
          for (
            var i = 0;
            i < $scope.gridData.FilterCriteria.preferredLocations.length;
            i++
          ) {
            if (
              $scope.gridData.FilterCriteria.PreferredHygienists[i] === itemId
            ) {
              result = true;
              break;
            }
          }
        } else {
          result = true;
        }
        break;
      case 'ZipCodes':
        if ($scope.gridData.FilterCriteria.ZipCodes) {
          for (
            var i = 0;
            i < $scope.gridData.FilterCriteria.PatientLocationZipCodes.length;
            i++
          ) {
            if (
              $scope.gridData.FilterCriteria.PreferredHygienists[i] === itemId
            ) {
              result = true;
              break;
            }
          }
        } else {
          result = true;
        }
        break;

      case 'AdditionalIdentifiers':
        if ($scope.patientAdditionalIdentifiers) {
          for (var i = 0; i < $scope.patientAdditionalIdentifiers.length; i++) {
            if ($scope.patientAdditionalIdentifiers[i] === itemId) {
              result = true;
              break;
            }
          }
        } else {
          result = true;
        }
        break;
    }
    return result;
  };
  ctrl.$onInit();
}

AllPatientSlideoutController.prototype = Object.create(BaseCtrl.prototype);
