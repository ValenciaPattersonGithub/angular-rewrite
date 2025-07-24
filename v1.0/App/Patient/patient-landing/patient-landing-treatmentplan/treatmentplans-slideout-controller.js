'use strict';

angular.module('Soar.Patient').controller('TreatmentPlansSlideoutController', [
  '$scope',
  '$timeout',
  'localize',
  '$filter',
  'PatientAdditionalIdentifierService',
  'toastrFactory',
  function (
    $scope,
    $timeout,
    localize,
    $filter,
    patientAdditionalIdentifierService,
    toastrFactory
  ) {
    var ctrl = this;
    ctrl.isFirstLoad = true;

    $scope.textTreatmentCreateDate = localize.getLocalizedString(
      'Treatment Plan Create Date'
    );
    $scope.textDateRange = localize.getLocalizedString('Date Range');
    $scope.errorRequiredDate = localize.getLocalizedString(
      'A required date is missing'
    );
    $scope.errorDateRange = localize.getLocalizedString(
      'Please enter a valid To and From date range'
    );

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

    // Created Date
    $scope.$watch('greaterThanSelectedDate', function (nv) {
      $scope.createdGte = nv != undefined ? nv.toDateString() : null;
      $scope.invalidDateRange = ctrl.invalidateDateRange();
    });

    $scope.$watch('lessThanSelectedDate', function (nv) {
      $scope.createdLte = nv != undefined ? nv.toDateString() : null;
      $scope.invalidDateRange = ctrl.invalidateDateRange();
    });

    ctrl.invalidateDateRange = function () {
      var dt = false;
      var dtFrom = new Date($scope.createdGte);
      var dtTo = new Date($scope.createdLte);
      if ($scope.createdGte !== null && $scope.createdLte !== null) {
        if (dtFrom > dtTo) {
          dt = true;
        }
      }
      return dt;
    };

    $scope.createdDateValid = true;
    $scope.dateRangeDisabled = true;
    $scope.maxCreatedDate = new Date();

    $scope.createdDateGte = {
      Name: 'From',
      FilterField: 'TreatmentPlanCreatedDate',
      FilterOperator: 'gte',
    };
    $scope.createdDateLte = {
      Name: 'To',
      FilterField: 'TreatmentPlanCreatedDate',
      FilterOperator: 'lte',
    };

    $scope.createdGte = null;
    $scope.createdLte = null;

    $scope.treatmentPlanStates = [
      {
        Group: 'TreatmentPlanStates',
        Field: 'TreatmentPlanStates',
        Value: 'All',
        Key: 'All',
        Id: 'TreatmentPlanStatesAll',
      },
      {
        Group: 'TreatmentPlanStates',
        Field: 'IsUnscheduled',
        Value: 'Unscheduled',
        Key: true,
        Individual: true,
        Id: 'IsUnscheduled',
      },
      {
        Group: 'TreatmentPlanStates',
        Field: 'IsScheduled',
        Value: 'Scheduled',
        Key: true,
        Individual: true,
        Id: 'IsScheduled',
      },
      {
        Group: 'TreatmentPlanStates',
        Field: 'IsProposed',
        Value: 'Proposed',
        Key: true,
        Individual: true,
        Id: 'IsProposed',
      },
      {
        Group: 'TreatmentPlanStates',
        Field: 'IsAccepted',
        Value: 'Accepted',
        Key: true,
        Individual: true,
        Id: 'IsAccepted',
      },
    ];

    $scope.patientTypeStatus = [
      {
        Group: 'PatientTypeStatus',
        Field: 'PatientTypeStatus',
        Value: 'All',
        Key: 'All',
        Id: 'PatientTypeStatusAll',
      },
      {
        Group: 'PatientTypeStatus',
        Field: 'IsActive',
        Value: 'Active',
        Key: true,
        Id: 'Active',
      },
      {
        Group: 'PatientTypeStatus',
        Field: 'IsActive',
        Value: 'Inactive',
        Key: false,
        Id: 'Inactive',
      },
      {
        Group: 'PatientTypeStatus',
        Field: 'IsPatient',
        Value: 'Non-Patients',
        Key: false,
        Id: 'NonPatients',
      },
      {
        Group: 'PatientTypeStatus',
        Field: 'IsPatient',
        Value: 'Patients',
        Key: true,
        Id: 'Patients',
      },
    ];

    $scope.treatmentPlanCreate = [
      { Field: 'TreatmentPlanCreate', Value: 'All', Key: 'All' },
      { Field: 'PlanCreatedDateFrom', Value: 'From', Key: false },
      { Field: 'PlanCreatedDateTo', Value: 'To', Key: false },
    ];

    $scope.TreatmentPlanName = [
      { Field: 'TreatmentPlanName', Value: '', Key: '' },
    ];

    // Show More
    $scope.isVisibleShowMorebuttonApptType = null;
    $scope.isVisibleShowLessbuttonApptType = null;

    $scope.isVisibleShowMorebuttonGroup = null;
    $scope.isVisibleShowLessbuttonGroup = null;

    $scope.isVisibleShowMorebuttonDentist = null;
    $scope.isVisibleShowLessbuttonDentist = null;

    $scope.isVisibleShowMorebuttonHygienist = null;
    $scope.isVisibleShowLessbuttonHygienist = null;

    $scope.isVisibleShowLessbuttonTreatmentProviders = null;
    $scope.isVisibleShowMorebuttonTreatmentProviders = null;

    $scope.isVisibleShowMorebuttonRoom = null;
    $scope.isVisibleShowLessbuttonRoom = null;

    $scope.isVisibleShowMorebuttonAI = null;
    $scope.isVisibleShowLessbuttonAI = null;

    ctrl.showMoreLessButtonInitialize = function () {
      $scope.isVisibleShowMorebuttonApptType = false;
      $scope.isVisibleShowLessbuttonApptType = false;

      $scope.isVisibleShowMorebuttonApptType = false;
      $scope.isVisibleShowLessbuttonApptType = false;

      $scope.isVisibleShowMorebuttonGroup = false;
      $scope.isVisibleShowLessbuttonGroup = false;

      $scope.isVisibleShowMorebuttonDentist = false;
      $scope.isVisibleShowLessbuttonDentist = false;

      $scope.isVisibleShowMorebuttonHygienist = false;
      $scope.isVisibleShowLessbuttonHygienist = false;

      $scope.isVisibleShowLessbuttonTreatmentProviders = false;
      $scope.isVisibleShowMorebuttonTreatmentProviders = false;

      $scope.isVisibleShowMorebuttonRoom = false;
      $scope.isVisibleShowLessbuttonRoom = false;

      $scope.isVisibleShowMorebuttonAI = false;
      $scope.isVisibleShowLessbuttonAI = false;
    };
    ctrl.showMoreLessButtonInitialize();

    ctrl.isResetFull = '1';
    $scope.isCollapsed = true;

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
          Key: null,
          isVisible: true,
          isSelected: ctrl.isFirstLoad
            ? true
            : ctrl.isItemSelected('GroupTypes', null),
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

      // Treatment Plan Providers
      $scope.providerList = $scope.gridData.PreferredDentists;
      var dentistList = $filter('filter')(
        $scope.providerList,
        { IsDentist: true },
        true
      );

      $scope.treatmentProviders = [
        {
          Field: 'TreatmentProviders',
          Value: 'All',
          Key: 'All',
          isVisible: true,
          isSelected: ctrl.isFirstLoad
            ? true
            : ctrl.isItemSelected('TreatmentProviders', null),
        },
      ];

      angular.forEach($scope.gridData.TreatmentProviders, function (item) {
        $scope.treatmentProviders.push({
          Field: 'TreatmentProviders',
          Value: item.Value,
          Key: item.Key,
          isVisible: $scope.treatmentProviders.length > 4 ? false : true,
          isSelected: ctrl.isFirstLoad
            ? true
            : ctrl.isItemSelected('TreatmentProviders', item.Key),
        });
      });

      ctrl.defaultFilterCount =
        11 +
        $scope.groupTypes.length +
        $scope.preferredDentists.length +
        $scope.preferredHygienists.length +
        $scope.treatmentProviders.length;

      ctrl.reset(ctrl.isResetFull);
      ctrl.isResetFull = '0';
    };

    // Show More
    ctrl.showMoreCheck = function (isVisible) {
      if (
        $scope.preferredDentists != undefined &&
        $scope.groupTypes != undefined &&
        $scope.preferredHygienists != undefined &&
        $scope.treatmentProviders != undefined &&
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
        if ($scope.treatmentProviders.length > 5) {
          $scope.isVisibleShowMorebuttonTreatmentProviders = !isVisible;
          $scope.isVisibleShowLessbuttonTreatmentProviders = isVisible;
          for (var i = 5; i < $scope.treatmentProviders.length; i++) {
            $scope.treatmentProviders[i].isVisible = isVisible;
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

    $scope.showMoreButtonTreatmentProviders = function () {
      angular.forEach($scope.treatmentProviders, function (provider) {
        provider.isVisible = true;
      });

      $scope.isVisibleShowLessbuttonTreatmentProviders = true;
      $scope.isVisibleShowMorebuttonTreatmentProviders = false;
    };

    $scope.showLessButtonTreatmentProviders = function () {
      var ctr = 1;
      angular.forEach($scope.treatmentProviders, function (provider) {
        if (ctr > 5) provider.isVisible = false;
        ctr++;
      });

      $scope.isVisibleShowMorebuttonTreatmentProviders = true;
      $scope.isVisibleShowLessbuttonTreatmentProviders = false;
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
    //#endregion  show more/less zipCode button

    //Reset functionality
    ctrl.willReset = false;
    ctrl.isFirstLoad = true;
    ctrl.reset = function (reset) {
      if (reset !== '0') {
        $('.filter-option').removeClass('in');
        ctrl.isFirstLoad = true;
        if (document.getElementById('TreatmentPlanStatesAll')) {
          ctrl.willReset = false;
          document.getElementById('Active').checked = true;
          document.getElementById('Patients').checked = true;

          document.getElementById('TreatmentPlanStatesAll').checked = true;
          document.getElementById('IsUnscheduled').checked = true;
          document.getElementById('IsScheduled').checked = true;
          document.getElementById('IsProposed').checked = true;
          document.getElementById('IsAccepted').checked = true;
        } else {
          ctrl.willReset = true;
        }

        _.each($('.prvntvCareFilters'), function (filter) {
          //select only checkbox controls
          if ($(filter).is(':checkbox')) {
            if (
              filter.id === 'PatientTypeStatusAll' ||
              filter.id === 'Inactive' ||
              filter.id === 'NonPatients'
            ) {
              filter.checked = false;
            } else {
              filter.checked = true;
            }
          } else if ($(filter).is(':radio:first')) {
            $timeout(function () {
              filter.checked = true;
              $('#hiddenCheckBox').prop('checked', false);
              document.getElementById('createdDateGte.Name').value = '';
              document.getElementById('createdDateLte.Name').value = '';
              document.getElementById('createdDateGte.Name').disabled = true;
              document.getElementById('createdDateLte.Name').disabled = true;
              $scope.invalidDateRange = false;
              $scope.dateRangeDisabled = true;
            });
          }
          //for treatment plan; disable the invisible checkbox
          if ($(filter).is(':checkbox') && filter.name == 'Created Date') {
            filter.checked = false;
          }
        });

        angular
          .element('.panel-heading')
          .find('.glyphicon-chevron-down')
          .removeClass('glyphicon-chevron-down')
          .addClass('glyphicon-chevron-up');
      }

      if (ctrl.willReset && !ctrl.isFirstLoad) {
        ctrl.willReset = false;
        document.getElementById('Active').checked = true;
        document.getElementById('Patients').checked = true;

        if (document.getElementById('TreatmentPlanStatesAll')) {
          document.getElementById('TreatmentPlanStatesAll').checked = true;
          document.getElementById('IsUnscheduled').checked = true;
          document.getElementById('IsScheduled').checked = true;
          document.getElementById('IsProposed').checked = true;
          document.getElementById('IsAccepted').checked = true;
        }
      }
      ctrl.isFirstLoad = false;

      $scope.isVisibleShowMorebuttonApptType = false;
      $scope.isVisibleShowLessbuttonApptType = false;

      $scope.isVisibleShowMorebuttonGroup = false;
      $scope.isVisibleShowLessbuttonGroup = false;

      $scope.isVisibleShowMorebuttonDentist = false;
      $scope.isVisibleShowLessbuttonDentist = false;

      $scope.isVisibleShowMorebuttonHygienist = false;
      $scope.isVisibleShowLessbuttonHygienist = false;

      $scope.isVisibleShowLessbuttonTreatmentProviders = false;
      $scope.isVisibleShowMorebuttonTreatmentProviders = false;

      $scope.isVisibleShowMorebuttonRoom = false;
      $scope.isVisibleShowLessbuttonRoom = false;

      ctrl.showMoreCheck(false);
      if (reset !== '0') {
        $scope.$emit('appliedFiltersCount', ctrl.defaultFilterCount);
      } else {
        $scope.$emit(
          'appliedFiltersCount',
          $('.prvntvCareFilters:checked').length +
            $('.prvntvCareFiltersEqual:checked').length
        );
      }

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
        $('.prvntvCareFilters:checked').length +
          $('.prvntvCareFiltersEqual:checked').length
      );
    };
    ctrl.checkAllFilters = function (filterValue, filterHeader) {
      var allStatus = $("ul[id='" + filterHeader + "'] > li:nth-child(1)");
      if (filterValue === 'All') {
        if (filterHeader === 'PatientTypeStatusAll') {
          document.getElementById('Active').checked = document.getElementById(
            'PatientTypeStatusAll'
          ).checked;
          document.getElementById('Inactive').checked = document.getElementById(
            'PatientTypeStatusAll'
          ).checked;
          document.getElementById('NonPatients').checked =
            document.getElementById('PatientTypeStatusAll').checked;
          document.getElementById('Patients').checked = document.getElementById(
            'PatientTypeStatusAll'
          ).checked;
        } else {
          var li = $("ul[id='" + filterHeader + "'] > li");
          angular.forEach(li, function (liObject) {
            liObject.firstElementChild.checked =
              allStatus[0].firstElementChild.checked;
            liObject.firstChild.checked = allStatus[0].firstChild.checked;
          });

          //if (allStatus[0].firstChild.checked === false) {
          //    angular.forEach(li,
          //        function (liObject) {
          //            liObject.firstChild.checked = false;
          //        });

          //} else {
          //    angular.forEach(li,
          //        function (liObject) {
          //            liObject.firstChild.checked = true;
          //        });
          //}
        }
      } else {
        if (
          filterHeader == 'IsUnscheduled' ||
          filterHeader == 'IsScheduled' ||
          filterHeader == 'IsProposed' ||
          filterHeader == 'IsAccepted'
        ) {
          var statusAll = document.getElementById('TreatmentPlanStatesAll');
          statusAll.checked = true;

          var statusIsUnscheduled =
            document.getElementById('IsUnscheduled').checked;
          var statusIsScheduled =
            document.getElementById('IsScheduled').checked;
          var statusIsProposed = document.getElementById('IsProposed').checked;
          var statusIsAccepted = document.getElementById('IsAccepted').checked;

          if (
            !statusIsUnscheduled ||
            !statusIsScheduled ||
            !statusIsProposed ||
            !statusIsAccepted
          ) {
            statusAll.checked = false;
          }
        } else if (
          filterHeader == 'Active' ||
          filterHeader == 'Inactive' ||
          filterHeader == 'NonPatients' ||
          filterHeader == 'Patients'
        ) {
          var statusAll = document.getElementById('PatientTypeStatusAll');
          statusAll.checked = true;

          var statusActive = document.getElementById('Active').checked;
          var statusInactive = document.getElementById('Inactive').checked;
          var statusNonPatients =
            document.getElementById('NonPatients').checked;
          var statusPatients = document.getElementById('Patients').checked;

          if (
            !statusActive ||
            !statusInactive ||
            !statusNonPatients ||
            !statusPatients
          ) {
            statusAll.checked = false;
          }
        } else {
          allStatus[0].firstChild.checked = true;
          allStatus[0].firstElementChild.checked = true;
          for (
            var i = 1;
            i < $("ul[id='" + filterHeader + "'] > li").length;
            i++
          ) {
            if (
              !$("ul[id='" + filterHeader + "'] > li")[i].firstElementChild
                .checked
            ) {
              allStatus[0].firstChild.checked = false;
              allStatus[0].firstElementChild.checked = false;
              break;
            }
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

      if (document.getElementById('createdDateGte.Name'))
        document.getElementById('createdDateGte.Name').value = null;

      if (document.getElementById('createdDateLte.Name'))
        document.getElementById('createdDateLte.Name').value = null;
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
        case 'TreatmentProviders':
          if ($scope.gridData.FilterCriteria.TreatmentProviders) {
            for (
              var i = 0;
              i < $scope.gridData.FilterCriteria.TreatmentProviders.length;
              i++
            ) {
              if (
                $scope.gridData.FilterCriteria.TreatmentProviders[i] === itemId
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

    $scope.disableDateInput = false;

    $scope.dateRangeSelector = function (filterValue) {
      if (filterValue === 'All') {
        $('#hiddenCheckBox').prop('checked', false);
        document.getElementById('createdDateGte.Name').value = '';
        document.getElementById('createdDateLte.Name').value = '';
        $scope.disableDateInput = false;
        $scope.invalidDateRange = false;
        $scope.dateRangeDisabled = true;
      } else {
        $('#hiddenCheckBox').prop('checked', true);
        $scope.disableDateInput = true;
        $scope.dateRangeDisabled = false;
      }
    };
  },
]);
