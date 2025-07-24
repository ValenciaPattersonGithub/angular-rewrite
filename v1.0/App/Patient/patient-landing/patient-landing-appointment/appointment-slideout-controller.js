'use strict';

angular.module('Soar.Patient').controller('AppointmentSlideoutController', [
  '$scope',
  '$timeout',
  'PatientAdditionalIdentifierService',
  'toastrFactory',
  'localize',
  function (
    $scope,
    $timeout,
    patientAdditionalIdentifierService,
    toastrFactory,
    localize
  ) {
    var ctrl = this;
    ctrl.isFirstLoad = true;

    $scope.getPatientAdditionalIdentifiers = function () {
      patientAdditionalIdentifierService.get().then(
        function (res) {
          $scope.patientAdditionalIdGetSuccess(res);
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

    // Show More
    $scope.isVisibleShowMorebuttonApptType = false;
    $scope.isVisibleShowLessbuttonApptType = false;

    $scope.isVisibleShowMorebuttonGroup = false;
    $scope.isVisibleShowLessbuttonGroup = false;

    $scope.isVisibleShowMorebuttonDentist = false;
    $scope.isVisibleShowLessbuttonDentist = false;

    $scope.isVisibleShowMorebuttonHygienist = false;
    $scope.isVisibleShowLessbuttonHygienist = false;

    $scope.isVisibleShowMorebuttonProvider = false;
    $scope.isVisibleShowLessbuttonProvider = false;

    $scope.isVisibleShowMorebuttonRoom = false;
    $scope.isVisibleShowLessbuttonRoom = false;

    $scope.isVisibleShowMorebuttonAI = null;
    $scope.isVisibleShowLessbuttonAI = null;

    ctrl.isResetFull = '1';
    $scope.isCollapsed = true;

    $scope.SoonerIfPossible = {
      Field: 'SoonerIfPossible',
      Value: 'Sooner if Possible',
      Key: false,
      isVisible: true,
    };

    // Appointment Date
    $scope.apptDates = [
      { Field: 'BusinessDays', Value: 'All', Key: 'All', Checked: true },
      {
        Field: 'BusinessDays',
        Value: 'Next Business Day',
        Key: 1,
        Checked: false,
      },
      { Field: 'BusinessDays', Value: 'Next 7 Days', Key: 2, Checked: false },
    ];

    // Appointment States
    $scope.apptStates = [
      { Field: '', Value: 'All', Key: 'All' },
      { Field: 'AppointmentState', Value: 'Cancelled', Key: '0|Cancellation' },
      { Field: 'AppointmentStatusList', Value: 'Completed', Key: 3 },
      { Field: 'AppointmentState', Value: 'Missed', Key: '1|Missed' },
      { Field: 'IsScheduled', Value: 'Scheduled', Key: true },
      { Field: 'IsScheduled', Value: 'Unscheduled', Key: false },
    ];

    // $scope.patientTypeStatus = [
    //     { Group: "PatientTypeStatus", Field: "PatientTypeStatus", Value: "All", Key: "All", Id: "PatientTypeStatusAll" },
    //     { Group: "PatientTypeStatus", Field: "IsActive", Value: "Active", Key: true, Id: "Active" },
    //     { Group: "PatientTypeStatus", Field: "IsActive", Value: "Inactive", Key: false, Id: "Inactive" },
    //     { Group: "PatientTypeStatus", Field: "IsPatient", Value: "Non-Patients", Key: false, Id: "NonPatients" },
    //     { Group: "PatientTypeStatus", Field: "IsPatient", Value: "Patients", Key: true, Id: "Patients" },];

    // Selected Location
    $scope.$watch('selectedLocation', function () {
      ctrl.isResetFull = '1';
    });

    // Blocks
    $scope.appointmentBlocks = [
      { Field: 'AppointmentBlocks', Value: 'All', Key: 'All', Checked: true },
      {
        Field: 'AppointmentBlocks',
        Value: 'Exclude Blocks',
        Key: 1,
        Checked: false,
      },
      {
        Field: 'AppointmentBlocks',
        Value: 'Include Blocks Only',
        Key: 2,
        Checked: false,
      },
    ];

    // Grid Data
    $scope.$watch('gridData', function (nv, ov) {
      if (nv != undefined) {
        ctrl.updateFilters();
      }
    });

    ctrl.updateFilters = function () {
      // Business Days
      if (
        !_.isNil($scope.gridData.FilterCriteria) ||
        !_.isNil($scope.gridData.FilterCriteria)
      ) {
        if (
          $scope.gridData.FilterCriteria.AppointmentDateFrom !== null ||
          $scope.gridData.FilterCriteria.AppointmentDateTo !== null
        ) {
          $scope.apptDates = [
            { Field: 'BusinessDays', Value: 'All', Key: 'All', Checked: true },
            {
              Field: 'BusinessDays',
              Value: 'Next Business Day',
              Key: 1,
              Checked: false,
            },
            {
              Field: 'BusinessDays',
              Value: 'Next 7 Days',
              Key: 2,
              Checked: false,
            },
          ];
        }
      }

      // Appointment Types
      $scope.apptTypes = [
        {
          Field: 'AppointmentTypes',
          Value: 'All',
          Key: 'All',
          isVisible: true,
          isSelected: ctrl.isFirstLoad
            ? true
            : ctrl.isItemSelected('AppointmentTypes', null),
        },
        {
          Field: 'AppointmentTypes',
          Value: 'N/A',
          Key: '00000000-0000-0000-0000-000000000000',
          isVisible: true,
          isSelected: ctrl.isFirstLoad
            ? true
            : ctrl.isItemSelected(
                'AppointmentTypes',
                '00000000-0000-0000-0000-000000000000'
              ),
        },
      ];

      angular.forEach($scope.gridData.AppointmentTypes, function (item) {
        $scope.apptTypes.push({
          Field: 'AppointmentTypes',
          Value: item.Value,
          Key: item.Key,
          isVisible: $scope.apptTypes.length > 4 ? false : true,
          isSelected: ctrl.isFirstLoad
            ? true
            : ctrl.isItemSelected('AppointmentTypes', item.Key),
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

      // Preferred Dentists
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

      // Providers
      $scope.providers = [
        {
          Field: 'Providers',
          Value: 'All',
          Key: 'All',
          isVisible: true,
          isSelected: ctrl.isFirstLoad
            ? true
            : ctrl.isItemSelected('Providers', null),
        },
        {
          Field: 'Providers',
          Value: 'N/A',
          Key: '00000000-0000-0000-0000-000000000000',
          isVisible: true,
          isSelected: ctrl.isFirstLoad
            ? true
            : ctrl.isItemSelected(
                'Providers',
                '00000000-0000-0000-0000-000000000000'
              ),
        },
      ];

      angular.forEach($scope.gridData.Providers, function (item) {
        $scope.providers.push({
          Field: 'Providers',
          Value: item.Value,
          Key: item.Key,
          isVisible: $scope.providers.length > 4 ? false : true,
          isSelected: ctrl.isFirstLoad
            ? true
            : ctrl.isItemSelected('Providers', item.Key),
        });
      });

      // Rooms
      $scope.rooms = [
        {
          Field: 'Rooms',
          Value: 'All',
          Key: 'All',
          isVisible: true,
          isSelected: ctrl.isFirstLoad
            ? true
            : ctrl.isItemSelected('Rooms', null),
        },
        {
          Field: 'Rooms',
          Value: 'N/A',
          Key: '00000000-0000-0000-0000-000000000000',
          isVisible: true,
          isSelected: ctrl.isFirstLoad
            ? true
            : ctrl.isItemSelected(
                'Rooms',
                '00000000-0000-0000-0000-000000000000'
              ),
        },
      ];

      angular.forEach($scope.gridData.Rooms, function (item) {
        $scope.rooms.push({
          Field: 'Rooms',
          Value: item.Value,
          Key: item.Key,
          isVisible: $scope.rooms.length > 4 ? false : true,
          isSelected: ctrl.isFirstLoad
            ? true
            : ctrl.isItemSelected('Rooms', item.Key),
        });
      });

      ctrl.isSooner = $scope.SoonerIfPossible.Key ? 1 : 0;

      ctrl.defaultFilterCount =
        6 +
        $scope.apptTypes.length +
        $scope.groupTypes.length +
        $scope.preferredDentists.length +
        $scope.preferredHygienists.length +
        $scope.providers.length +
        $scope.rooms.length +
        ctrl.isSooner;

      ctrl.reset(ctrl.isResetFull);
      ctrl.isResetFull = '0';
    };

    // Show More
    ctrl.ShowMoreCheck = function (isVisible) {
      if (
        $scope.preferredDentists != undefined &&
        $scope.preferredHygienists != undefined &&
        $scope.groupTypes != undefined &&
        $scope.apptTypes != undefined &&
        $scope.rooms != undefined &&
        $scope.providers != undefined &&
        $scope.additionalIdentifiers != undefined
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
        if ($scope.groupTypes.length > 5) {
          $scope.isVisibleShowMorebuttonGroup = !isVisible;
          $scope.isVisibleShowLessbuttonGroup = isVisible;
          for (var i = 5; i < $scope.groupTypes.length; i++) {
            $scope.groupTypes[i].isVisible = isVisible;
          }
        }

        if ($scope.apptTypes.length > 5) {
          $scope.isVisibleShowMorebuttonApptType = !isVisible;
          $scope.isVisibleShowLessbuttonApptType = isVisible;
          for (var i = 5; i < $scope.apptTypes.length; i++) {
            $scope.apptTypes[i].isVisible = isVisible;
          }
        }

        if ($scope.rooms.length > 5) {
          $scope.isVisibleShowMorebuttonRoom = !isVisible;
          $scope.isVisibleShowLessbuttonRoom = isVisible;
          for (var i = 5; i < $scope.rooms.length; i++) {
            $scope.rooms[i].isVisible = isVisible;
          }
        }

        if ($scope.providers.length > 5) {
          $scope.isVisibleShowMorebuttonProvider = !isVisible;
          $scope.isVisibleShowLessbuttonProvider = isVisible;
          for (var i = 5; i < $scope.providers.length; i++) {
            $scope.providers[i].isVisible = isVisible;
          }
        }
        if ($scope.additionalIdentifiers.length > 5) {
          $scope.isVisibleShowMorebuttonAI = !isVisible;
          $scope.isVisibleShowLessbuttonAI = isVisible;
          for (var i = 5; i < $scope.additionalIdentifiers.length; i++) {
            $scope.additionalIdentifiers[i].isVisible = isVisible;
          }
        }
      }
    };

    $scope.showMoreButtonDentist = function ($event) {
      angular.forEach($scope.preferredDentists, function (dentist) {
        dentist.isVisible = true;
      });

      $scope.isVisibleShowLessbuttonDentist = true;
      $scope.isVisibleShowMorebuttonDentist = false;
    };

    $scope.showLessButtonDentist = function () {
      var ctr = 1;
      angular.forEach($scope.preferredDentists, function (dentist) {
        if (ctr > 5) dentist.isVisible = false;
        ctr++;
      });

      $scope.isVisibleShowMorebuttonDentist = true;
      $scope.isVisibleShowLessbuttonDentist = false;
    };

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
        if (ctr > 5) hygienist.isVisible = false;
        ctr++;
      });

      $scope.isVisibleShowMorebuttonHygienist = true;
      $scope.isVisibleShowLessbuttonHygienist = false;
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

    $scope.showMoreButtonApptType = function ($event) {
      angular.forEach($scope.apptTypes, function (item) {
        item.isVisible = true;
      });

      $scope.isVisibleShowLessbuttonApptType = true;
      $scope.isVisibleShowMorebuttonApptType = false;
    };

    $scope.showLessButtonApptType = function () {
      var ctr = 1;
      angular.forEach($scope.apptTypes, function (item) {
        if (ctr > 5) item.isVisible = false;
        ctr++;
      });

      $scope.isVisibleShowMorebuttonApptType = true;
      $scope.isVisibleShowLessbuttonApptType = false;
    };

    $scope.showMoreButtonRoom = function ($event) {
      angular.forEach($scope.rooms, function (item) {
        item.isVisible = true;
      });

      $scope.isVisibleShowLessbuttonRoom = true;
      $scope.isVisibleShowMorebuttonRoom = false;
    };

    $scope.showLessButtonRoom = function () {
      var ctr = 1;
      angular.forEach($scope.rooms, function (item) {
        if (ctr > 5) item.isVisible = false;
        ctr++;
      });

      $scope.isVisibleShowMorebuttonRoom = true;
      $scope.isVisibleShowLessbuttonRoom = false;
    };

    $scope.showMoreButtonProvider = function ($event) {
      angular.forEach($scope.providers, function (item) {
        item.isVisible = true;
      });

      $scope.isVisibleShowLessbuttonProvider = true;
      $scope.isVisibleShowMorebuttonProvider = false;
    };

    $scope.showLessButtonProvider = function () {
      var ctr = 1;
      angular.forEach($scope.providers, function (item) {
        if (ctr > 5) item.isVisible = false;
        ctr++;
      });

      $scope.isVisibleShowMorebuttonProvider = true;
      $scope.isVisibleShowLessbuttonProvider = false;
    };
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

    //Reset functionality
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
            case 'AppointmentStates':
              if (
                prvntvCareFilter.id === 'All' ||
                prvntvCareFilter.id === 'Completed'
              ) {
                prvntvCareFilter.checked = false;
              } else {
                prvntvCareFilter.checked = true;
              }
              break;
            case 'SoonerIfPossible':
              $scope.SoonerIfPossible.Key = false;
              prvntvCareFilter.checked = false;
              break;
            case 'AppointmentBlocks':
              if (prvntvCareFilter.id === 'All') {
                prvntvCareFilter.checked = true;
              }
              break;
            // case 'IsActive':
            //     prvntvCareFilter.checked = false;
            //     if (prvntvCareFilter.id === 'Active') {
            //         prvntvCareFilter.checked = true;
            //     }
            //     break;
            // case 'IsPatient':
            //     prvntvCareFilter.checked = false;
            //     if (prvntvCareFilter.id === 'Patients') {
            //         prvntvCareFilter.checked = true;
            //     }
            //     break;
            default:
              // if (prvntvCareFilter.id === 'PatientTypeStatusAll' || prvntvCareFilter.id === 'Inactive' || prvntvCareFilter.id === 'NonPatients') {
              //     prvntvCareFilter.checked = false;
              // }
              // else {
              //     prvntvCareFilter.checked = true;
              // }
              break;
          }
        });

        angular
          .element('.panel-heading')
          .find('.glyphicon-chevron-down')
          .removeClass('glyphicon-chevron-down')
          .addClass('glyphicon-chevron-up');
      }

      $scope.isVisibleShowMorebuttonApptType = false;
      $scope.isVisibleShowLessbuttonApptType = false;

      $scope.isVisibleShowMorebuttonGroup = false;
      $scope.isVisibleShowLessbuttonGroup = false;

      $scope.isVisibleShowMorebuttonDentist = false;
      $scope.isVisibleShowLessbuttonDentist = false;

      $scope.isVisibleShowMorebuttonHygienist = false;
      $scope.isVisibleShowLessbuttonHygienist = false;

      $scope.isVisibleShowMorebuttonProvider = false;
      $scope.isVisibleShowLessbuttonProvider = false;

      $scope.isVisibleShowMorebuttonRoom = false;
      $scope.isVisibleShowLessbuttonRoom = false;

      ctrl.ShowMoreCheck(false);

      if (reset !== '0') {
        $scope.$emit('appliedFiltersCount', ctrl.defaultFilterCount);
      } else {
        $timeout(function () {
          $scope.$emit(
            'appliedFiltersCount',
            $('.prvntvCareFilters:checked').length
          );
        }, 50);
      }
    };

    $scope.$on('resetSlideOutFilter', function () {
      ctrl.reset();
    });

    // Filter Count
    $scope.toggleSelect = function (filterValue, filterHeader) {
      ctrl.isFirstLoad = false;
      ctrl.checkAllFilters(filterValue, filterHeader);
      $scope.$emit(
        'appliedFiltersCount',
        $('.prvntvCareFilters:checked').length
      );
    };
    ctrl.checkAllFilters = function (filterValue, filterHeader) {
      var allStatus = $("ul[id='" + filterHeader + "'] > li:nth-child(1)");
      if (filterHeader === 'SoonerIfPossible') {
        return;
      }
      if (filterValue === 'All') {
        // if (filterHeader === 'PatientTypeStatusAll') {
        //     document.getElementById('Active').checked = document.getElementById('PatientTypeStatusAll').checked;
        //     document.getElementById('Inactive').checked = document.getElementById('PatientTypeStatusAll').checked;
        //     document.getElementById('NonPatients').checked = document.getElementById('PatientTypeStatusAll').checked;
        //     document.getElementById('Patients').checked = document.getElementById('PatientTypeStatusAll').checked;
        // }
        // else {
        var li = $("ul[id='" + filterHeader + "'] > li");
        angular.forEach(li, function (liObject) {
          liObject.firstChild.checked = allStatus[0].firstChild.checked;
        });
        // }
      } else {
        // if (filterHeader == 'Active' || filterHeader == 'Inactive' || filterHeader == 'NonPatients' || filterHeader == 'Patients') {
        //     var statusAll = document.getElementById('PatientTypeStatusAll');
        //     statusAll.checked = true;

        //     var statusActive = document.getElementById('Active').checked;
        //     var statusInactive = document.getElementById('Inactive').checked;
        //     var statusNonPatients = document.getElementById('NonPatients').checked;
        //     var statusPatients = document.getElementById('Patients').checked;

        //     if (!statusActive || !statusInactive || !statusNonPatients || !statusPatients) {
        //         statusAll.checked = false;
        //     }
        // }
        // else {
        allStatus[0].firstChild.checked = true;
        for (
          var i = 1;
          i < $("ul[id='" + filterHeader + "'] > li").length;
          i++
        ) {
          if (!$("ul[id='" + filterHeader + "'] > li")[i].firstChild.checked) {
            allStatus[0].firstChild.checked = false;
            break;
          }
        }
        // }
      }
    };

    // Collapse
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
      ctrl.reset(1);
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
      ctrl.ShowMoreCheck($scope.isCollapsed);
    };

    ctrl.collapseAll = function () {
      ctrl.ShowMoreCheck($scope.isCollapsed);
    };

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
        case 'Providers':
          if ($scope.gridData.FilterCriteria.Providers) {
            for (
              var i = 0;
              i < $scope.gridData.FilterCriteria.Providers.length;
              i++
            ) {
              if ($scope.gridData.FilterCriteria.Providers[i] === itemId) {
                result = true;
                break;
              }
            }
          } else {
            result = true;
          }
          break;
        case 'Rooms':
          if ($scope.gridData.FilterCriteria.Rooms) {
            for (
              var i = 0;
              i < $scope.gridData.FilterCriteria.Rooms.length;
              i++
            ) {
              if ($scope.gridData.FilterCriteria.Rooms[i] === itemId) {
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
        case 'AppointmentTypes':
          if ($scope.gridData.FilterCriteria.AppointmentTypes) {
            for (
              var i = 0;
              i < $scope.gridData.FilterCriteria.AppointmentTypes.length;
              i++
            ) {
              if (
                $scope.gridData.FilterCriteria.AppointmentTypes[i] === itemId
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
            for (
              var i = 0;
              i < $scope.patientAdditionalIdentifiers.length;
              i++
            ) {
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
  },
]);
