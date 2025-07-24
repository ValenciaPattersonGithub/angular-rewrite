'use strict';

var PatientAccountSelectClaimsControl = angular
  .module('Soar.Patient')
  .controller('PatientAccountSelectClaimsController', [
    '$scope',
    '$routeParams',
    '$location',
    'toastrFactory',
    'localize',
    'PatientServices',
    'BusinessCenterServices',
    'PatientInsurancePaymentFactory',
    'BoundObjectFactory',
    'currentPatient',
    'ModalFactory',
    '$timeout',
    'FeatureService',
    'userSettingsDataService',
    function (
      $scope,
      $routeParams,
      $location,
      toastrFactory,
      localize,
      patientServices,
      businessCenterServices,
      patientInsurancePaymentFactory,
      boundObjectFactory,
      currentPatient,
      modalFactory,
      $timeout,
      featureService,
      userSettingsDataService
    ) {
      var ctrl = this;
      $scope.allCarriers = [];
      $scope.allClaims = {};
      $scope.patient = boundObjectFactory.Create(patientServices.Patient);
      $scope.patient.Data = currentPatient.Value;
      $scope.selectedClaimIds = [];
      $scope.selectedClaims = [];
      $scope.noClaimsFoundMsg = false;
      $scope.noClaimsSelectedMsg = false;
      $scope.filteredClaims = [];
      // authentication
      ctrl.hasAccess = { InsurancePaymentView: false };
      ctrl.hasAccess = patientInsurancePaymentFactory.access();
      $scope.hasPatientInsurancePaymentViewAccess =
        ctrl.hasAccess.InsurancePaymentView;

      // breadcrumbs
      ctrl.createBreadCrumb = function () {
        let patientPath = 'Patient/';
        var locationName = _.toLower($routeParams.PrevLocation);
        if (locationName === 'account summary') {
          $scope.PreviousLocationName = 'Account Summary';
          $scope.PreviousLocationRoute =
            patientPath +
            $routeParams.patientId +
            '/Summary/?tab=Account Summary';
        } else if (locationName === 'transaction history') {
          $scope.PreviousLocationName = 'Transaction History';
          $scope.PreviousLocationRoute =
            patientPath +
            $routeParams.patientId +
            '/Summary/?tab=Transaction History';
        } else if (locationName === 'patientoverview') {
          $scope.PreviousLocationName = 'Patient Overview';
          $scope.PreviousLocationRoute =
            patientPath + $routeParams.patientId + '/Overview/';
        }
      };

      $scope.applyPaymentToClaims = function () {
        // must have one claim checked
        if ($scope.selectedClaimIds.length === 0) {
          $scope.noClaimsSelectedMsg = true;
        } else {
          // remove all claims that may previously be in the array if navigating back to this page from apply ins page
          patientInsurancePaymentFactory.removeSelectedClaims();

          // add selected claim objects to array
          for (var i = 0; i < $scope.allClaims.length; i++) {
            for (var j = 0; j < $scope.selectedClaimIds.length; j++) {
              if ($scope.allClaims[i].ClaimId === $scope.selectedClaimIds[j]) {
                patientInsurancePaymentFactory.addSelectedClaims(
                  $scope.allClaims[i]
                );
              }
            }
          }

          $location.path(
            _.escape(
              'Patient/' +
                $routeParams.patientId +
                '/Account/' +
                $routeParams.accountId +
                '/Payment/' +
                $routeParams.PrevLocation +
                '_SelectClaims'
            )
          );
        }
      };

      // back button handler
      $scope.backToPreviousLocation = function () {
        $location.path(_.escape($scope.PreviousLocationRoute));
      };

      ctrl.createCarrierLongLabel = function () {
        angular.forEach($scope.allCarriers, function (carrier) {
          carrier.LongLabel = '';
          if (carrier.Name) {
            carrier.LongLabel += carrier.Name;
          }
          if (carrier.PayerId) {
            carrier.LongLabel += ', ' + carrier.PayerId;
          }
          if (carrier.AddressLine1) {
            carrier.LongLabel += ', ' + carrier.AddressLine1;
          }
          if (carrier.AddressLine2) {
            carrier.LongLabel += ', ' + carrier.AddressLine2;
          }
          if (carrier.State) {
            carrier.LongLabel += ', ' + carrier.State;
          }
          if (carrier.City) {
            carrier.LongLabel += ', ' + carrier.City;
          }
          if (carrier.Zip) {
            carrier.LongLabel += ', ' + carrier.Zip;
          }
          if (carrier.PhoneNumbers[0] && carrier.PhoneNumbers[0].PhoneNumber) {
            carrier.LongLabel += ', ' + carrier.PhoneNumbers[0].PhoneNumber;
          }
        });
      };

      ctrl.removeIrrelevantCarriers = function () {
        $scope.carriers = _.filter($scope.allCarriers, function (carrier) {
          var claimsForCarrier = _.filter($scope.allClaims, function (claim) {
            return claim.CarrierId == carrier.CarrierId;
          });
          return claimsForCarrier.length > 0;
        });

        var destcarriers = _.uniqBy($scope.carriers, 'CarrierId');

        $scope.filteredCarrierList = destcarriers;
        if (destcarriers.length === 1) {
          $scope.selectCarrier($scope.filteredCarrierList[0]);
        }
      };

      $scope.selectCarrier = function (item) {
        item.Label = '';
        item.Label += item.Name;
        if (item.PayerId) {
          item.Label += ', ' + item.PayerId;
        }
        $scope.selectedCarrier = item;

        ctrl.filterClaimsByCarrier();
      };

      //working
      $scope.clearContent = function () {
        $scope.selectedCarrier = null;
        $scope.filteredClaims = [];
        ctrl.setGridData($scope.filteredClaims);
      };
      $scope.filterCarriers = function (item) {
        $scope.filteredCarrierList = _.filter(
          $scope.carriers,
          function (carrier) {
            if (
              carrier.LongLabel.toLowerCase().indexOf(item.toLowerCase()) !== -1
            ) {
              return true;
            } else {
              return false;
            }
          }
        );
      };
      ctrl.filterClaimsByCarrier = function () {
        $scope.filteredClaims = _.filter($scope.allClaims, function (claim) {
          return claim.CarrierId === $scope.selectedCarrier.CarrierId;
        });
        ctrl.setGridData($scope.filteredClaims);
        ctrl.selectClaimIfOnlyOne();
      };
      ctrl.getAllClaimsSuccess = function (response) {
        //shows no record found if there are no claim records
        if (!response || (response.Value && response.Value.length === 0)) {
          $scope.noClaimsFoundMsg = true;
        }

        $scope.allClaims = response.Value;
        angular.forEach($scope.allClaims, function (claim) {
          claim.InsuranceEstimate = 0;
          claim.Charges = 0;
          claim.AdjustedEstimate = 0;
          claim.Balance = 0;
          for (
            var i = 0;
            i < claim.ServiceTransactionToClaimPaymentDtos.length;
            i++
          ) {
            claim.InsuranceEstimate +=
              claim.ServiceTransactionToClaimPaymentDtos[i].InsuranceEstimate;
            claim.Charges +=
              claim.ServiceTransactionToClaimPaymentDtos[i].Charges;
            claim.AdjustedEstimate +=
              claim.ServiceTransactionToClaimPaymentDtos[i].AdjustedEstimate;
            claim.Balance +=
              claim.ServiceTransactionToClaimPaymentDtos[i].Balance;
          }
        });
      };

      ctrl.getAllClaimsFailure = function () {
        toastrFactory.error(
          localize.getLocalizedString(
            'Failed to retrieve the list of {0}. Refresh the page to try again.',
            ['claims']
          ),
          localize.getLocalizedString('Error')
        );
      };

      ctrl.setGridData = function (data) {
        var grid = $('#selectClaimGrid').data('kendoGrid');
        grid.dataSource.data(data);
      };

      // claim checked event.  add or remove claimId from claimIds array
      $scope.claimChecked = function (claim) {
        $scope.noClaimsSelectedMsg = false;
        var claimId = claim.ClaimId;

        if ($scope.selectedClaimIds.length === 0) {
          $scope.selectedClaimIds.push(claimId);
        } else {
          if ($scope.selectedClaimIds.indexOf(claimId) === -1) {
            $scope.selectedClaimIds.push(claimId);
            return;
          }
        }
      };

      // check all event.  Check or uncheck all checkboxes. Add or remove all claimIds from claimIds array
      $scope.checkAllClaims = function () {
        $scope.noClaimsSelectedMsg = false;
        $scope.selectedClaimIds = [];
        if ($('#checkAll').is(':checked')) {
          for (var i = 0; i < $scope.allClaims.length; i++) {
            $('#claimId_' + $scope.allClaims[i].ClaimId).prop('checked', true);
            $scope.selectedClaimIds.push($scope.allClaims[i].ClaimId);
          }
        } else {
          for (var j = 0; j < $scope.allClaims.length; j++) {
            $('#claimId_' + $scope.allClaims[j].ClaimId).prop('checked', false);
            $scope.selectedClaimIds.pop($scope.allClaims[j].ClaimId);
          }
        }
      };

      $scope.selectedClaimHeaderTemplate = function () {
        return '<input id="checkAll" type="checkbox" ng-click="checkAllClaims()" />';
      };

      $scope.selectClaimTemplate = function (dataItem) {
        var claimId = dataItem.ClaimId;
        return (
          '<input id="claimId_' +
          _.escape(claimId) +
          '" data-claimId="' +
          _.escape(claimId) +
          '" type="checkbox" ng-click="claimChecked($event)" />'
        );
      };

      // kendo grid options
      $scope.selectClaimsGridOptions = {
        dataSource: new kendo.data.DataSource({
          data: [],
          schema: {
            model: {
              fields: {
                ClaimId: {
                  editable: false,
                },
                SelectClaims: {
                  editable: false,
                  headerTemplate: function () {
                    return $scope.selectedClaimHeaderTemplate();
                  },
                },
                Date: {
                  editable: false,
                },
                PatientName: {
                  editable: false,
                },
                ProviderName: {
                  editable: false,
                },
                Description: {
                  editable: false,
                },
                Charges: {
                  editable: false,
                },
                InsuranceEstimate: {
                  editable: false,
                },
                AdjustedEstimate: {
                  editable: false,
                },
                Balance: {
                  editable: false,
                },
              },
            },
          },
        }),
        autoBind: false,
        sortable: true,
        pageable: false,
        editable: false,
        change: onChange,
        columns: [
          {
            field: 'ClaimId',
            hidden: true,
          },
          {
            field: 'SortOrder',
            title: 'SortOrder',
            hidden: true,
          },
          {
            //checkbox column
            width: '50px',
            selectable: true,
            template: function (dataItem) {
              return $scope.selectClaimTemplate(dataItem);
            },
          },
          {
            field: 'DateEntered',
            title: localize.getLocalizedString('Date'),
            width: '100px',
            template: function (dataItem) {
              return patientInsurancePaymentFactory.formatClaimDisplayDate(
                dataItem
              );
            },
          },
          /* eslint-disable no-template-curly-in-string */
          {
            field: 'PatientName',
            template: kendo.template(
              "<span title='${PatientName}' class='truncateText'>{{\"${PatientName}\"}}</span>"
            ),
            title: localize.getLocalizedString('Patient'),
            width: '100px',
          },
          {
            field: 'ProviderName',
            template: kendo.template(
              "<span title='${ProviderName}' class='truncateText'>{{\"${ProviderName}\"}}</span>"
            ),
            title: localize.getLocalizedString('Provider'),
            width: '100px',
          },
          {
            field: 'Description',
            template: kendo.template(
              '<span class=\'truncateText\'>{{"${CarrierName} - ${PrimaryClaim}" }}</span>'
            ),
            title: localize.getLocalizedString('Description'),
            width: '250px',
          },
          /* eslint-enable no-template-curly-in-string */
          {
            field: 'Charges',
            title: localize.getLocalizedString('Charges'),
            width: '100px',
            format: '{0:c}',
          },
          {
            field: 'InsuranceEstimate',
            title: localize.getLocalizedString('Estimated Ins.'),
            width: '100px',
            format: '{0:c}',
          },
          {
            field: 'AdjustedEstimate',
            title: localize.getLocalizedString('Est. Ins. Adj.'),
            width: '100px',
            format: '{0:c}',
          },
          {
            field: 'Balance',
            title: localize.getLocalizedString('Patient Bal'),
            width: '100px',
            format: '{0:c}',
          },
        ],
      };

      ctrl.selectClaimIfOnlyOne = function () {
        if ($scope.filteredClaims.length === 1) {
          $('#claimId_' + $scope.filteredClaims[0].ClaimId).prop(
            'checked',
            true
          );
          $scope.selectedClaimIds.push($scope.filteredClaims[0].ClaimId);
        } else {
          $scope.selectedClaimIds = [];
        }
      };

      ctrl.callClaimsSetup = function () {
        return [
          {
            Call: patientServices.Claim.getClaimsByAccount,
            Params: { accountId: $routeParams.accountId },
            OnSuccess: ctrl.getAllClaimsSuccess,
            OnError: ctrl.getAllClaimsFailure,
          },
          {
            Call: businessCenterServices.Carrier.get,
            Params: {},
            OnSuccess: function (res) {
              $scope.allCarriers = res.Value;
              ctrl.createCarrierLongLabel();
            },
            OnFailure: function (res) {
              toastrFactory.error(
                localize.getLocalizedString(
                  'Failed to retrieve the list of {0}. Please try again.',
                  ['carriers']
                ),
                'Error'
              );
            },
          },
        ];
      };

      function onChange(e) {
        var rows = e.sender.select();
        $scope.selectedClaimIds = [];
        rows.each(function (e) {
          var grid = $('#selectClaimGrid').data('kendoGrid');
          var dataItem = grid.dataItem(this);
          var row = grid.table.find("tr[data-uid='" + dataItem.uid + "']");
          var checkbox = $(row).find('.k-checkbox');
          if (checkbox.is(':checked')) {
            $scope.claimChecked(dataItem);
          } else {
            var index = $scope.selectedClaimIds.indexOf(dataItem.ClaimId);
            $scope.selectedClaimIds.splice(index, 1);
            return;
          }
        });
      }

      ctrl.init = function () {
        $scope.noClaimsFoundMsg = false;
        ctrl.createBreadCrumb();
        modalFactory
          .LoadingModal(ctrl.callClaimsSetup)
          .then(ctrl.removeIrrelevantCarriers);
      };

      $timeout(function () {
        $scope.developmentMode = false;
        featureService.isEnabled('DevelopmentMode').then(function (res) {
          if (res) {
            $scope.developmentMode = true;
          }
        });
      });

      ctrl.init();
    },
  ]);

PatientAccountSelectClaimsControl.resolvePatientAccountSelectClaimsControl = {
  currentPatient: [
    '$route',
    'PatientServices',
    function ($route, patientServices) {
      var id = $route.current.params.patientId;

      if (id) {
        return patientServices.Patients.get({
          Id: $route.current.params.patientId,
        }).$promise;
      } else {
        return {
          Value: {
            FirstName: null,
            MiddleName: null,
            LastName: null,
            PreferredName: null,
            Prefix: null,
            Suffix: null,
            AddressLine1: null,
            AddressLine2: null,
            City: null,
            State: null,
            ZipCode: null,
            Sex: null,
            IsActive: true,
            ContactInformation: [],
            PatientGroups: [],
            CustomLabelValueDtos: [],
            PatientId: 0,
            PreferredLocation: null,
            PreferredHygienist: null,
            PreferredDentist: null,
            ResponsiblePersonType: null,
            ResponsiblePersonId: null,
            DateOfBirth: null,
            IsPatient: true,
            ImageDataUrl: null,
            ImageName: null,
            EmailAddress: null,
            EmailAddress2: null,
          },
        };
      }
    },
  ],
};
