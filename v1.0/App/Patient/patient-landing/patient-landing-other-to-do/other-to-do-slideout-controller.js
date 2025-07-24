'use strict';

angular.module('Soar.Patient').controller('OtherToDoSlideoutController', [
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

    $scope.isVisibleShowMorebuttonAI = false;
    $scope.isVisibleShowLessbuttonAI = false;

    ctrl.isResetFull = '1';
    $scope.isCollapsed = true;

    // Due Date
    $scope.dueDateItems = [
      { Field: 'DueDateItems', Value: 'All', Key: 'All', Checked: true },
      { Field: 'DueDateItems', Value: 'Due this week', Key: 1, Checked: false },
      { Field: 'DueDateItems', Value: 'Due next week', Key: 2, Checked: false },
      { Field: 'DueDateItems', Value: 'Overdue', Key: 3, Checked: false },
    ];

    $scope.patientTypeStatus = [
      { Field: '', Value: 'All', Key: 'All', Checked: false },
      { Field: 'IsActive', Value: 'Active', Key: true, Checked: true },
      { Field: 'IsActive', Value: 'Inactive', Key: false, Checked: false },
      { Field: 'IsPatient', Value: 'Non-Patients', Key: false, Checked: false },
      { Field: 'IsPatient', Value: 'Patients', Key: true, Checked: true },
    ];

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
          Key: null,
          isVisible: true,
          isSelected: ctrl.isFirstLoad
            ? true
            : ctrl.isItemSelected('PreferredDentists', null),
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
          Key: null,
          isVisible: true,
          isSelected: ctrl.isFirstLoad
            ? true
            : ctrl.isItemSelected('PreferredHygienists', null),
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

      // Due Date
      if (
        !_.isNil($scope.gridData.FilterCriteria) ||
        !_.isNil($scope.gridData.FilterCriteria)
      ) {
        if (
          $scope.gridData.FilterCriteria.DueDateFrom !== null ||
          $scope.gridData.FilterCriteria.DueDateTo !== null
        ) {
          $scope.dueDateItems = [
            { Field: 'DueDateItems', Value: 'All', Key: 'All', Checked: true },
            {
              Field: 'DueDateItems',
              Value: 'Due this week',
              Key: 1,
              Checked: false,
            },
            {
              Field: 'DueDateItems',
              Value: 'Due next week',
              Key: 2,
              Checked: false,
            },
            { Field: 'DueDateItems', Value: 'Overdue', Key: 3, Checked: false },
          ];
        }
      }

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

      ctrl.defaultFilterCount =
        3 +
        $scope.groupTypes.length +
        $scope.preferredDentists.length +
        $scope.preferredHygienists.length;

      ctrl.reset(ctrl.isResetFull);
      ctrl.isResetFull = '0';
    };

    // Show More
    ctrl.ShowMoreCheck = function (isVisible) {
      if (
        $scope.preferredDentists != undefined &&
        $scope.preferredHygienists != undefined &&
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
                prvntvCareFilter.id === 'Scheduled' ||
                prvntvCareFilter.id === 'Unscheduled'
              ) {
                prvntvCareFilter.checked = true;
              } else {
                prvntvCareFilter.checked = false;
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
      $scope.$emit('appliedFiltersCount', ctrl.defaultFilterCount);

      //ctrl.isFirstLoad = true;
    };

    $scope.$on('resetSlideOutFilter', function () {
      ctrl.reset();
    });

    // Filter Count
    $scope.toggleSelect = function (filterValue, filterHeader) {
      //item.isSelected = !item.isSelected;
      ctrl.isFirstLoad = false;
      ctrl.checkAllFilters(filterValue, filterHeader);
      $scope.$emit(
        'appliedFiltersCount',
        $('.prvntvCareFilters:checked').length
      );
    };
    ctrl.checkAllFilters = function (filterValue, filterHeader) {
      var allStatus = $("ul[id='" + filterHeader + "'] > li:nth-child(1)");
      if (filterValue === 'All') {
        var li = $("ul[id='" + filterHeader + "'] > li");
        if (allStatus[0].firstChild.checked === false) {
          angular.forEach(li, function (liObject) {
            liObject.firstChild.checked = false;
          });
        } else {
          angular.forEach(li, function (liObject) {
            liObject.firstChild.checked = true;
          });
        }
      } else {
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
      }
      return result;
    };
  },
]);
