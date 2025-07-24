'use strict';

angular.module('Soar.BusinessCenter').controller('InsuranceController', [
  '$rootScope',
  '$scope',
  '$window',
  'PatientServices',
  'PayerReportsService',
  'ModalFactory',
  '$routeParams',
  'ListHelper',
  '$location',
  'ReportsFactory',
  'FeatureService',
  '$timeout',
  '$q',
  'toastrFactory',
  'localize',
  function (
    $rootScope,
    $scope,
    $window,
    patientServices,
    payerReportsService,
    modalFactory,
    $routeParams,
    listHelper,
    $location,
    reportsFactory,
    featureService,
    $timeout,
    $q,
    toastrFactory,
    localize
  ) {
    var ctrl = this;
    $scope.searchTerm = '';
    var claimInformation = ($scope.claimInfo =
      patientServices.GetClaimInformation());

    ctrl.init = function () {
      if (claimInformation) {
        $scope.selectedOptionType =
          $scope.claimInfo.responsiblePersonName + ' ' + 'account';
        $scope.specificAccountClaims = true;
        $scope.accountMemberOptions = [];

        if ($scope.claimInfo.accountMembers.length > 1) {
          $scope.selectedAccountMemberName =
            'All' +
            ' ' +
            $scope.claimInfo.responsiblePersonName +
            ' ' +
            'account members';
          $scope.accountMemberOptions.push({
            responsiblePerson:
              'All' +
              ' ' +
              $scope.claimInfo.responsiblePersonName +
              ' account members',
            PatientId: null,
          });
        }

        angular.forEach(
          $scope.claimInfo.accountMembers,
          function (accountMembers) {
            var personPreferredName = accountMembers.PreferredName
              ? '(' + accountMembers.PreferredName + ')'
              : '';

            var personmiddleName = accountMembers.MiddleName
              ? accountMembers.MiddleName.charAt(0) + '.'
              : '';

            var personName =
              [accountMembers.FirstName, personPreferredName, personmiddleName]
                .filter(function (text) {
                  return text;
                })
                .join(' ') +
              '  ' +
              [accountMembers.LastName, accountMembers.Suffix]
                .filter(function (text) {
                  return text;
                })
                .join(', ');

            accountMembers.responsiblePerson = personName;
            $scope.accountMemberOptions.push({
              responsiblePerson: personName,
              PatientId: accountMembers.PatientId,
            });
          }
        );

        $scope.accountMemberOtionsBckp = angular.copy(
          $scope.accountMemberOptions
        );

        if ($scope.claimInfo.accountMembers.length == 1) {
          $scope.selectedAccountMemberName =
            $scope.claimInfo.accountMembers[0].responsiblePerson;
        }
        var clearData = true;
        // reset the claimInformation
        $rootScope.$on('$routeChangeStart', function (next, current) {
          if (
            clearData &&
            (current.$$route.templateUrl !==
              'App/BusinessCenter/businessCenter.html' ||
              current.pathParams.Category !== 'Insurance' ||
              current.pathParams.SubCategory !== 'Claims')
          ) {
            $scope.specificAccountClaims = false;
            claimInformation = null;
            patientServices.SetClaimInformation(claimInformation);
          }
          clearData = false;
        });
      }
      }

    ctrl.getPatientData = function (patientId) {
      return patientServices.Patients.get({
        Id: patientId,
      }).$promise.then(getPatientByIdSuccess, getPatientByIdFailed);
    };

    var getPatientByIdSuccess = function (result) {
      $scope.getClaims(result.Value.PersonAccount.AccountId);
    };

    var getPatientByIdFailed = function () {
      toastrFactory.error(
        localize.getLocalizedString(
          'Failed to retrieve the {0}. Please try again.',
            ['patient']
        ),
        'Error'
      );
    };

    $scope.getClaims = function (accountId) {
      var defer = $q.defer();
      patientServices.Account.getAllAccountMembersByAccountId(
        {
          accountId: accountId,
        },
        function (res) {
          var claimInfo = {
            url: '/Patient/' + $routeParams.patientId + '/Summary/',
            accountId: $routeParams.patientId,
            claimFilterType: 2,
            responsiblePersonName: '',
            accountMembers: res.Value,
            selectedIds: _.map(res.Value, 'PatientId'),
            locationIds: [],
          };

          patientServices.SetClaimInformation(claimInfo);
          $scope.claimInfo = claimInfo;
          claimInformation = claimInfo;
          ctrl.init();
          defer.resolve(res.Value);
          return defer.promise;
        }
      );
    };

    if (!patientServices.GetClaimInformation() && $location.search().patientId) {
      var queryParams = $location.search();
      ctrl.getPatientData(queryParams.patientId);
    }
    else {
      ctrl.init();
    }

    ctrl.checkForPayerReports = function () {
      payerReportsService.PracticeHasPayerReport({}, function (res) {
        //if you add items to the list make sure this is still referencing
        //Payer reports tab
        $scope.viewOptions[6].enabled = res.Value;
      });
    };

    ctrl.checkForPayerReports();

    $scope.specificAccountClaimsClicked = function () {
      //  returning back to the account.

      var accounturl =
        $scope.claimInfo.url +
        '?tab=Insurance%20Information&currentPatientId=0';
      $location.url(accounturl);
    };

    $scope.accountMemberOptionClicked = function (option) {
      //reset account member option
      $scope.accountMemberOptions = angular.copy(
        $scope.accountMemberOtionsBckp
      );

      $scope.selectedaccountMemberOption = option.PatientId;
      $scope.selectedAccountMemberName = option.responsiblePerson;
      for (var i = $scope.accountMemberOptions.length - 1; i >= 0; i--) {
        if ($scope.accountMemberOptions[i].PatientId == option.PatientId) {
          $scope.accountMemberOptions.splice(i, 1);
        }
      }

      $scope.claimInfo.selectedIds =
        option.PatientId !== null
          ? [option.PatientId]
          : _.map(
            _.filter($scope.accountMemberOtionsBckp, function (member) {
              return member.PatientId !== null;
            }),
            'PatientId'
          );

      patientServices.SetClaimInformation($scope.claimInfo);
      $scope.$broadcast('selectedAccountMemberChanged');
    };

    $scope.viewOptions = [
      {
        Name: 'Claim & Predetermination',
        Plural: 'Claims & Predeterminations',
        RouteValue: 'claims',
        Url: '#/BusinessCenter/Insurance/Claims',
        Template: 'App/BusinessCenter/insurance/claims/claims.html',
        title: 'Claims & Predeterminations',
        Afma: 'soar-ins-iclaim-view',
        AddAmfa: 'soar-ins-iclaim-add',
        Controls: false,
        disabled: false,
        enabled: true,
      },
      {
        Name: 'Carrier',
        Plural: 'Carriers',
        RouteValue: 'carriers',
        Url: '#/BusinessCenter/Insurance/Carriers',
        Template: 'App/BusinessCenter/insurance/carriers/carriers.html',
        title: 'Carriers',
        Afma: 'soar-ins-ibcomp-view',
        AddAmfa: 'soar-ins-ibcomp-add',
        Controls: true,
        disabled: false,
        enabled: true,
      },
      {
        Name: 'Plan',
        Plural: 'Plans',
        RouteValue: 'plans',
        Url: '#/BusinessCenter/Insurance/Plans',
        Template:
          'App/BusinessCenter/insurance/benefit-plans/dental-benefit-plans.html',
        title: 'Plans',
        Afma: 'soar-ins-ibplan-view',
        AddAmfa: 'soar-ins-ibplan-add',
        Controls: true,
        disabled: false,
        enabled: true,
      },
      {
        Name: 'Fee Schedule',
        Plural: 'Fee Schedules',
        RouteValue: 'feeschedule',
        Url: '#/BusinessCenter/Insurance/FeeSchedule',
        Template:
          'App/BusinessCenter/insurance/fee-schedule/fee-schedule-landing.html',
        title: 'Fee Schedules',
        Afma: 'soar-ins-ifsch-view',
        AddAmfa: 'soar-ins-ifsch-add',
        Controls: true,
        disabled: false,
        enabled: true,
      },
      {
        Name: 'Apply Bulk Insurance Payment',
        Plural: 'Apply Bulk Insurance Payment',
        RouteValue: 'bulkpayment',
        Url: '#/BusinessCenter/Insurance/BulkPayment',
        Template:
          'App/BusinessCenter/insurance/bulk-payment/bulk-payment-w.html',
        title: 'Apply Bulk Insurance Payment',
        Afma: 'soar-acct-aipmt-view',
        AddAmfa: 'soar-acct-aipmt-add',
        Controls: false,
        disabled: false,
        enabled: true,
      },
      {
        Name: 'ERA',
        Plural: 'ERA',
        RouteValue: 'era',
        Url: '#/BusinessCenter/Insurance/ERA',
        Template: 'App/BusinessCenter/insurance/ERA/ERA.html',
        title: 'ERA',
        Afma: 'soar-acct-aipmt-view',
        AddAmfa: 'soar-acct-aipmt-add',
        Controls: false,
        disabled: false,
        enabled: true,
      },
      {
        Name: 'Payer Reports',
        Plural: 'Payer Reports',
        RouteValue: 'payerreport',
        Url: '#/BusinessCenter/Insurance/PayerReport',
        Template: 'App/BusinessCenter/insurance/payer-report/payer-report.html',
        title: 'Payer Reports',
        Afma: 'soar-ins-iclaim-view',
        AddAmfa: 'soar-ins-iclaim-add',
        Controls: false,
        disabled: false,
        //this gets updated by ctrl.checkforpayerReports which
        //requires this to be the seventh item in the list
        enabled: false,
      },
    ];

    ctrl.disableMethodsInProduction = function () {
      // Example of a feature service check, this one for disabling the ERA tab in production.
      // No longer needed because ERA feature is complete.
      //featureService.isEnabled('DevelopmentMode').then(function (res) {
      //    $scope.viewOptions[5].disabled = !res;
      //});
    };
    ctrl.disableMethodsInProduction();

    $scope.selectView = function (view) {
      if (!view.disabled) {
        document.title = view.title;
        $scope.selectedView = view;
        $scope.filter = '';
        $window.location.href = view.Url;
      }
    };

    // Should be drill down from  dashboard 2 ERA widget
    if (sessionStorage.getItem('eraWidget') === 'true') {
      $scope.selectedView = $scope.viewOptions[5];
      sessionStorage.removeItem('eraWidget');
    } else {
      // Should be defaulted to the Claims & Predeterminations unless defined from the other controller
      if ($routeParams.SubCategory > '') {
        var viewOption = listHelper.findItemByFieldValue(
          $scope.viewOptions,
          'RouteValue',
          $routeParams.SubCategory.toLowerCase()
        );
        $scope.selectedView =
          viewOption != null ? viewOption : $scope.viewOptions[0];
      } else {
        $scope.selectedView = $scope.viewOptions[0];
      }
    }
    //#endregion

    $scope.$watch('selectedReport', function (nv, ov) {
      $timeout(function () {
        if (nv !== ov && $scope.selectedReport > 0) {
          reportsFactory.OpenReportPage(
            $scope.reports.CarrierReports[$scope.selectedReport - 1],
            $scope.selectedView.Url.substring(1) +
              '/' +
              $scope.reports.CarrierReports[
                $scope.selectedReport - 1
              ].ReportTitle.replace(/\s/g, ''),
            true
          );
          $scope.selectedReport = 0;
        }
      });
    });
  },
]);
