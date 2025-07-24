'use strict';

angular.module('Soar.Widget').factory('WidgetFactory', [
  'WidgetDataService',
  'localize',
  '$q',
  'WidgetMonthLabels',
  function (widgetDataService, localize, $q, widgetMonthLabels) {
    var emptyGuid = '00000000-0000-0000-0000-000000000000';
    var guidOne = '00000000-0000-0000-0000-000000000001';

    var successFunction = function (res) {
      var defer = $q.defer();
      var promise = defer.promise;
      promise = $.extend(promise, { values: res });
      defer.resolve(res);
      return promise;
    };

    var failureFunction = function () {
      var defer = $q.defer();
      defer.reject();
      return defer.promise;
    };

    var createFilterDto = function (
      dateOption,
      locations,
      providers,
      startDate,
      endDate,
      launchDarklyStatus
    ) {
      var filters = {};
      filters['LocationIds'] = locations;
      filters['DateOption'] = dateOption;
      filters['ProviderIds'] = providers;
      filters['StartDate'] = startDate;
      filters['EndDate'] = endDate;
      filters['LaunchDarklyStatus'] = launchDarklyStatus;
      return filters;
    };

    var createBarChartReportFilterDto = function (
      locationIds,
      dateOption,
      category,
      includeInactivePatients,
      adjustmentTypeField,
      patientGroupField
    ) {
      var categoryDate = null;
      if (category) {
        var monthIndex = widgetMonthLabels.indexOf(category);
        categoryDate = moment({ months: monthIndex });
      }
      var startDate = null;
      var endDate = null;
      switch (dateOption) {
        case 'Last Year':
          if (categoryDate) {
            startDate = moment(categoryDate)
              .add(-1, 'years')
              .startOf('month')
              .toDate();
            endDate = moment(categoryDate)
              .add(-1, 'years')
              .endOf('month')
              .startOf('day')
              .toDate();
          } else {
            startDate = moment().add(-1, 'years').startOf('year').toDate();
            endDate = moment()
              .add(-1, 'years')
              .endOf('year')
              .startOf('day')
              .toDate();
          }
          break;
        case 'Last Month':
          startDate = moment().add(-1, 'months').startOf('month').toDate();
          endDate = moment()
            .add(-1, 'months')
            .endOf('month')
            .startOf('day')
            .toDate();
          break;
        case 'YTD':
          if (categoryDate) {
            startDate = moment(categoryDate).startOf('month').toDate();
            endDate =
              moment().month() === monthIndex
                ? moment().startOf('day').toDate()
                : moment(categoryDate).endOf('month').startOf('day').toDate();
          } else {
            startDate = moment().startOf('year').toDate();
            endDate = moment().startOf('day').toDate();
          }
          break;
        case 'MTD':
          startDate = moment().startOf('month').toDate();
          endDate = moment().startOf('day').toDate();
          break;
        case 'NoFilter':
          if (categoryDate) {
            var monthNumber = moment(categoryDate).startOf('month').toDate();
            var currentMonthNumber = new Date().getMonth() + 1;
            var calculatedMonthNumber =
              moment(monthNumber).toDate().getMonth() + 1;
            if (currentMonthNumber === calculatedMonthNumber) {
              startDate = moment().add(1, 'days').startOf('day').toDate();
              endDate = moment(categoryDate)
                .endOf('month')
                .startOf('day')
                .toDate();
            } else if (currentMonthNumber > calculatedMonthNumber) {
              startDate = moment(categoryDate)
                .add(1, 'year')
                .startOf('month')
                .startOf('day')
                .toDate();
              endDate = moment(categoryDate)
                .add(1, 'year')
                .endOf('month')
                .startOf('day')
                .toDate();
            } else {
              startDate = moment(categoryDate)
                .startOf('month')
                .startOf('day')
                .toDate();
              endDate = moment(categoryDate)
                .endOf('month')
                .startOf('day')
                .toDate();
            }
          } else {
            startDate = moment().add(1, 'days').startOf('day').toDate();
            endDate = moment()
              .add(1, 'year')
              .add(-1, 'months')
              .endOf('month')
              .startOf('day')
              .toDate();
          }
      }
      var filterDto = {
        PresetFilterDto: {
          LocationIds: locationIds,
          StartDate: startDate,
          EndDate: endDate,
        },
      };
      if (includeInactivePatients) {
        filterDto.PresetFilterDto.PatientStatus = [1, 2, 3];
      }

      switch (adjustmentTypeField) {
        case 'PositiveAdjustmentTypeIds':
          filterDto.PresetFilterDto.NegativeAdjustmentTypeIds = [];
          filterDto.PresetFilterDto.PositiveAdjustmentTypeIds = [emptyGuid];
          break;
        case 'NegativeAdjustmentTypeIds':
          filterDto.PresetFilterDto.PositiveAdjustmentTypeIds = [];
          filterDto.PresetFilterDto.NegativeAdjustmentTypeIds = [emptyGuid];
          break;
        case 'All':
          filterDto.PresetFilterDto.PositiveAdjustmentTypeIds = [emptyGuid];
          filterDto.PresetFilterDto.NegativeAdjustmentTypeIds = [emptyGuid];
          filterDto.PresetFilterDto.PatientGroupTypeIds = [emptyGuid];
          break;
      }

      if (patientGroupField) {
        filterDto.PresetFilterDto.PatientGroupTypeIds = [emptyGuid, guidOne];
      }
      return filterDto;
    };

    var createHygieneVsDoctorReportFilterDto = function (
      locationIds,
      dateOption,
      category,
      includeNegAdj,
      includePositiveAdj,
      includePatGrups
    ) {
      var currentDate = moment();
      var startDate = null;
      var endDate = null;

      if (category === 'Doctor') category = 'Dentist';
      switch (dateOption) {
        case 'Last Year':
          startDate = moment(currentDate)
            .add(-1, 'years')
            .startOf('year')
            .toDate();
          endDate = moment(currentDate)
            .add(-1, 'years')
            .endOf('year')
            .startOf('day')
            .toDate();
          break;
        case 'Last Month':
          startDate = moment(currentDate)
            .add(-1, 'months')
            .startOf('month')
            .toDate();
          endDate = moment(currentDate)
            .add(-1, 'months')
            .endOf('month')
            .startOf('day')
            .toDate();
          break;
        case 'YTD':
          startDate = moment(currentDate).startOf('year').toDate();
          endDate = moment(currentDate).startOf('day').toDate();
          break;
        case 'MTD':
          startDate = moment(currentDate).startOf('month').toDate();
          endDate = moment(currentDate).startOf('day').toDate();
          break;
        default:
          break;
      }
      return {
        PresetFilterDto: {
          LocationIds: locationIds,
          StartDate: startDate,
          EndDate: endDate,
          ProviderTypes: [category],
          NegativeAdjustmentTypeIds: includeNegAdj,
          PositiveAdjustmentTypeIds: includePositiveAdj,
          PatientGroupTypeIds: includePatGrups,
        },
      };
    };

    var createCaseAcceptanceReportFilterDto = function (
      locationIds,
      dateOption,
      startDate,
      endDate,
      category
    ) {
      var filterStartDate = null;
      var filterEndDate = null;
      var categories = category ? [category] : ['Proposed', 'Accepted'];

      switch (dateOption) {
        case 'MTD':
          filterStartDate = moment().startOf('month').toDate();
          filterEndDate = moment().startOf('day').toDate();
          break;
        case 'YTD':
          filterStartDate = moment().startOf('year').toDate();
          filterEndDate = moment().startOf('day').toDate();
          break;
        case 'Date Range':
          filterStartDate = startDate;
          filterEndDate =
            endDate < moment().toDate()
              ? endDate
              : moment().startOf('day').toDate();
          break;
        default:
          break;
      }
      return {
        PresetFilterDto: {
          LocationIds: locationIds,
          StartDate: filterStartDate,
          EndDate: filterEndDate,
          ServiceCodeStatus: categories,
        },
      };
    };

    var createReportFilterDto = function (
      locationIds,
      providerIds,
      dateOption
    ) {
      var currentDate = moment();
      var startDate = null;
      var endDate = null;
      switch (dateOption) {
        case 'Last Year':
          startDate = moment(currentDate)
            .add(-1, 'years')
            .startOf('year')
            .toDate();
          endDate = moment(currentDate)
            .add(-1, 'years')
            .endOf('year')
            .startOf('day')
            .toDate();
          break;
        case 'Last Month':
          startDate = moment(currentDate)
            .add(-1, 'months')
            .startOf('month')
            .toDate();
          endDate = moment(currentDate)
            .add(-1, 'months')
            .endOf('month')
            .startOf('day')
            .toDate();
          break;
        case 'YTD':
          startDate = moment(currentDate).startOf('year').toDate();
          endDate = moment(currentDate).startOf('day').toDate();
          break;
        case 'MTD':
          startDate = moment(currentDate).startOf('month').toDate();
          endDate = moment(currentDate).startOf('day').toDate();
          break;
        case 'Today':
          startDate = endDate = moment(currentDate).startOf('day').toDate();

          break;
        default:
          break;
      }
      if (providerIds) {
        return {
          PresetFilterDto: {
            LocationIds: locationIds,
            ProviderUserIds: providerIds,
            StartDate: startDate,
            EndDate: endDate,
          },
        };
      } else {
        return {
          PresetFilterDto: {
            LocationIds: locationIds,
            StartDate: startDate,
            EndDate: endDate,
          },
        };
      }
    };

    return {
      GetFilterDto: function (
        dateOption,
        locations,
        providers,
        startDate,
        endDate,
        launchDarklyStatus
      ) {
        return createFilterDto(
          dateOption,
          locations,
          providers,
          startDate,
          endDate,
          launchDarklyStatus
        );
      },
      GetReportFilterDto: function (locationIds, providerIds, dateOption) {
        return createReportFilterDto(locationIds, providerIds, dateOption);
      },
      GetReportFilterDtoForBarChart: function (
        locationIds,
        dateOption,
        category,
        includeInactivePatients,
        adjustmentTypeField,
        patientGroupField
      ) {
        return createBarChartReportFilterDto(
          locationIds,
          dateOption,
          category,
          includeInactivePatients,
          adjustmentTypeField,
          patientGroupField
        );
      },
      GetReportFilterDtoForHygieneVsDoctorReport: function (
        locationIds,
        dateOption,
        category,
        includeNegAdjustments,
        includePositiveAdjustments,
        includePatientGroups
      ) {
        return createHygieneVsDoctorReportFilterDto(
          locationIds,
          dateOption,
          category,
          includeNegAdjustments,
          includePositiveAdjustments,
          includePatientGroups
        );
      },
      GetReportFilterDtoForCaseAcceptance: function (
        locationIds,
        dateOption,
        startDate,
        endDate,
        category
      ) {
        return createCaseAcceptanceReportFilterDto(
          locationIds,
          dateOption,
          startDate,
          endDate,
          category
        );
      },
      GetGrossProduction: function (filters) {
        return widgetDataService.GrossProduction.save(filters).$promise.then(
          successFunction,
          failureFunction
        );
      },
      GetUserDashboardGrossProduction: function (filters) {
        return widgetDataService.UserDashboardGrossProduction.save(
          filters
        ).$promise.then(successFunction, failureFunction);
      },
      GetNetProduction: function (filters) {
        return widgetDataService.NetProduction.save(filters).$promise.then(
          successFunction,
          failureFunction
        );
      },
      GetUserDashboardNetProduction: function (filters) {
        return widgetDataService.UserDashboardNetProduction.save(
          filters
        ).$promise.then(successFunction, failureFunction);
      },
      GetNetCollection: function (filters) {
        return widgetDataService.NetCollection.save(filters).$promise.then(
          successFunction,
          failureFunction
        );
      },
      GetPositiveAdjustment: function (filters) {
        return widgetDataService.PositiveAdjustment.save(filters).$promise.then(
          successFunction,
          failureFunction
        );
      },
      GetNegativeAdjustment: function (filters) {
        return widgetDataService.NegativeAdjustment.save(filters).$promise.then(
          successFunction,
          failureFunction
        );
      },
      GetFeeScheduleAdjustment: function (filters) {
        return widgetDataService.FeeScheduleAdjustment.save(
          filters
        ).$promise.then(successFunction, failureFunction);
      },
      GetPatientsSeen: function (filters) {
        return widgetDataService.PatientsSeen.save(filters).$promise.then(
          successFunction,
          failureFunction
        );
      },
      GetNewPatients: function (filters) {
        return widgetDataService.NewPatients.save(filters).$promise.then(
          successFunction,
          failureFunction
        );
      },
      GetScheduleUtilization: function (filter) {
        return widgetDataService.ScheduleUtilization.save(filter).$promise.then(
          successFunction,
          failureFunction
        );
      },
      GetCollectionToNetProduction: function (filters) {
        return widgetDataService.CollectionToNetProduction.save(
          filters
        ).$promise.then(successFunction, failureFunction);
      },
      GetReceivablesToNetProduction: function (filters) {
        return widgetDataService.ReceivablesToNetProduction.save(
          filters
        ).$promise.then(successFunction, failureFunction);
      },
      GetHygieneVsDoctorGrossProduction: function (filters) {
        return widgetDataService.HygieneVsDoctorGrossProduction.save(
          filters
        ).$promise.then(successFunction, failureFunction);
      },
      GetHygieneVsDoctorNetProduction: function (filters) {
        return widgetDataService.HygieneVsDoctorNetProduction.save(
          filters
        ).$promise.then(successFunction, failureFunction);
      },
      GetCollectionsAtCheckout: function (filters) {
        return widgetDataService.CollectionsAtCheckout.save(
          filters
        ).$promise.then(successFunction, failureFunction);
      },
      GetUserDashboardInsuranceClaims: function (filters) {
        return widgetDataService.UserDashboardInsuranceClaims.save(
          filters
        ).$promise.then(successFunction, failureFunction);
      },
      GetInsuranceClaims: function (filters) {
        return widgetDataService.InsuranceClaims.save(filters).$promise.then(
          successFunction,
          failureFunction
        );
      },
      GetOpenClinicalNotes: function (filters) {
        return widgetDataService.OpenClinicalNotes.save(filters).$promise.then(
          successFunction,
          failureFunction
        );
      },
      GetCaseAcceptance: function (filters) {
        return widgetDataService.CaseAcceptance.save(filters).$promise.then(
          successFunction,
          failureFunction
        );
      },
      GetUserDashboardPendingClaims: function (filters) {
        return widgetDataService.UserDashboardPendingClaims.save(
          filters
        ).$promise.then(successFunction, failureFunction);
      },
      GetPendingClaims: function (filters) {
        return widgetDataService.PendingClaims.save(filters).$promise.then(
          successFunction,
          failureFunction
        );
      },
      GetUserDashboardReceivables: function (filters) {
        return widgetDataService.UserDashboardReceivables.save(
          filters
        ).$promise.then(successFunction, failureFunction);
      },
      GetReceivables: function (filters) {
        return widgetDataService.Receivables.save(filters).$promise.then(
          successFunction,
          failureFunction
        );
      },
      GetHygieneRetention: function (filters) {
        return widgetDataService.HygieneRetention.save(filters).$promise.then(
          successFunction,
          failureFunction
        );
      },
      GetUserDashboardHygieneRetention: function (filters) {
        return widgetDataService.UserDashboardHygieneRetention.save(
          filters
        ).$promise.then(successFunction, failureFunction);
      },
      GetProjectedNetProduction: function (filters) {
        return widgetDataService.ProjectedNetProduction.save(
          filters
        ).$promise.then(successFunction, failureFunction);
      },
    };
  },
]);
