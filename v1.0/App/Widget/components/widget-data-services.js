'use strict';

angular.module('Soar.Widget').service('WidgetDataService', [
  '$resource',
  function ($resource) {
    return {
      GrossProduction: $resource(
        '_soarapi_/widgets/financial/GrossProduction',
        {},
        {}
      ),
      UserDashboardGrossProduction: $resource(
        '_soarapi_/widgets/financial/UserDashboardGrossProduction',
        {},
        {}
      ),
      NetProduction: $resource(
        '_soarapi_/widgets/financial/NetProduction',
        {},
        {}
      ),
      UserDashboardNetProduction: $resource(
        '_soarapi_/widgets/financial/UserDashboardNetProduction',
        {},
        {}
      ),
      NetCollection: $resource(
        '_soarapi_/widgets/financial/NetCollection',
        {},
        {}
      ),
      PositiveAdjustment: $resource(
        '_soarapi_/widgets/financial/PositiveAdjustment',
        {},
        {}
      ),
      NegativeAdjustment: $resource(
        '_soarapi_/widgets/financial/NegativeAdjustment',
        {},
        {}
      ),
      UserDashboardReceivables: $resource(
        '_soarapi_/widgets/financial/UserDashboardReceivables',
        {},
        {}
      ),
      Receivables: $resource('_soarapi_/widgets/financial/Receivables', {}, {}),
      FeeScheduleAdjustment: $resource(
        '_soarapi_/widgets/financial/FeeScheduleAdjustment',
        {},
        {}
      ),
      PatientsSeen: $resource(
        '_soarapi_/widgets/performance/PatientsSeen',
        {},
        {}
      ),
      NewPatients: $resource(
        '_soarapi_/widgets/performance/NewPatients',
        {},
        {}
      ),
      HygieneRetention: $resource(
        '_soarapi_/widgets/schedule/HygieneRetention',
        {},
        {}
      ),
      UserDashboardHygieneRetention: $resource(
        '_soarapi_/widgets/schedule/UserDashboardHygieneRetention',
        {},
        {}
      ),
      ScheduleUtilization: $resource(
        '_soarapi_/widgets/schedule/ScheduleUtilization',
        {},
        {}
      ),
      CollectionToNetProduction: $resource(
        '_soarapi_/widgets/financial/CollectionToNetProduction',
        {},
        {}
      ),
      UserDashboardPendingClaims: $resource(
        '_soarapi_/widgets/financial/UserDashboardPendingClaims',
        {},
        {}
      ),
      PendingClaims: $resource(
        '_soarapi_/widgets/financial/PendingClaims',
        {},
        {}
      ),
      ReceivablesToNetProduction: $resource(
        '_soarapi_/widgets/financial/ReceivablesToNetProduction',
        {},
        {}
      ),
      HygieneVsDoctorGrossProduction: $resource(
        '_soarapi_/widgets/financial/HygieneVsDoctorGrossProduction',
        {},
        {}
      ),
      HygieneVsDoctorNetProduction: $resource(
        '_soarapi_/widgets/financial/HygieneVsDoctorNetProduction',
        {},
        {}
      ),
      CollectionsAtCheckout: $resource(
        '_soarapi_/widgets/financial/CollectionsAtCheckout',
        {},
        {}
      ),
      UserDashboardInsuranceClaims: $resource(
        '_soarapi_/widgets/financial/UserDashboardInsuranceClaims',
        {},
        {}
      ),
      InsuranceClaims: $resource(
        '_soarapi_/widgets/financial/InsuranceClaims',
        {},
        {}
      ),
      OpenClinicalNotes: $resource(
        '_soarapi_/widgets/performance/OpenClinicalNotes',
        {},
        {}
      ),
      CaseAcceptance: $resource(
        '_soarapi_/widgets/performance/CaseAcceptance',
        {},
        {}
      ),
      ProjectedNetProduction: $resource(
        '_soarapi_/widgets/financial/ProjectedNetProduction',
        {},
        {}
      ),
    };
  },
]);
