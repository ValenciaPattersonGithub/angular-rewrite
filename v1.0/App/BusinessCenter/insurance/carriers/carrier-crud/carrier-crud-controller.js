'use strict';

var app = angular.module('Soar.BusinessCenter');

app.controller('CarrierCrudController', [
  '$scope',
  '$routeParams',
  '$timeout',
  '$location',
  'BusinessCenterServices',
  'CommonServices',
  'toastrFactory',
  'patSecurityService',
  'SaveStates',
  '$filter',
  'ModalFactory',
  'localize',
  function (
    $scope,
    $routeParams,
    $timeout,
    $location,
    businessCenterServices,
    commonServices,
    toastrFactory,
    patSecurityService,
    saveStates,
    $filter,
    modalFactory,
    localize
  ) {
    var ctrl = this;
    $scope.CHCList = [];
    $scope.filteredCHCList = [];
    $scope.term;
    $scope.focus;
    $scope.isSaving = false;
    $scope.removedIndex = -1;
    $scope.selectedIndex = -1;

    //#region Authorization
    // view access
    ctrl.authViewAccess = function () {
      return patSecurityService.IsAuthorizedByAbbreviation(
        'soar-ins-ibcomp-add'
      );
    };

    ctrl.authAccess = function () {
      if (!ctrl.authViewAccess()) {
        toastrFactory.error(
          patSecurityService.generateMessage('soar-ins-ibcomp-add'),
          'Not Authorized'
        );
        event.preventDefault();
        $location.path('/');
      } else {
        $scope.hasViewAccess = true;
      }
    };
    // Populate Array for Typeahead
    ctrl.getCHCList = function () {
      commonServices.Insurance.CHCCarriers.get().$promise.then(
        function (response) {
          $scope.CHCList = $filter('orderBy')(response.Value, 'Name');
          $scope.filteredCHCList = $scope.CHCList;
        }
      );
    };
    $scope.selectCarrierName = function (item) {
      $scope.carrier.Name = item.Name;
      $scope.carrier.PayerId = item.ExternalPayerId;
    };

    $scope.filterCHCList = function (term) {
      $scope.filteredCHCList = _.filter($scope.CHCList, function (Carrier) {
        if (Carrier.Name.toLowerCase().indexOf(term.toLowerCase()) !== -1) {
          return true;
        } else {
          return false;
        }
      });
    };

    ctrl.setPayerId = function () {
      if ($scope.editing === false) {
        if (
          !$scope.CHCList.find(carrier => carrier.Name === $scope.carrier.Name)
        )
          $scope.carrier.PayerId = '06126';
      }
    };

    $scope.$watch('focus', function (nv, ov) {
      if (nv != ov) {
        if ($scope.focus == false) {
          ctrl.setPayerId();
          $scope.checkForDuplicates($scope.carrier);
        }
      }
    });

    ctrl.getCHCList();
    // authorization
    ctrl.authAccess();

    // #endregion

    ctrl.validate = function (carrier) {
      var form = $scope.frmCarrier;

      return (
        form.$valid &&
        $scope.carrier.Name &&
        $scope.carrier.Name !== '' &&
        form.inpEmail.$valid &&
        form.inpZip.$valid &&
        form.inpPayerId.$valid &&
        $scope.validPhones &&
        form.inpFax.$valid
      );
    };

    ctrl.setHasErrors = function (isValid) {
      $scope.hasErrors = !isValid;
    };

    $scope.save = function (carrier) {
      var isEditing = $scope.editing;
      var resource = isEditing
        ? businessCenterServices.Carrier.update
        : businessCenterServices.Carrier.save;
      var isValid = ctrl.validate(carrier);

      ctrl.setHasErrors(isValid);

      if (isValid) {
        if (carrier.PayerId == null) {
          carrier.PayerId = '00000';
        }

        var params = angular.copy(carrier);
        params.PhoneNumbers = $filter('filter')(params.PhoneNumbers, {
          ObjectState: '!' + saveStates.Delete,
        });
        params.ZipCode = params.ZipCode
          ? params.ZipCode.replace(/-/g, '')
          : null;

        if (!$scope.isSaving) {
          $scope.isSaving = true;
          resource(
            params,
            ctrl.saveOnSuccess,
            ctrl.saveOnError
          ).$promise.finally(() => ($scope.isSaving = false));
        }
      }
    };

    $scope.setActiveStatus = function (carrier) {
      if (!carrier.IsActive) {
        if (carrier.IsLinkedToActiveBenefitPlan) {
          carrier.IsActive = true;
          var title = localize.getLocalizedString('Invalid Action');
          var message = localize.getLocalizedString(
            'This carrier has benefit plans attached to it and cannot be inactivated until those benefit plans are removed.  Please view the "Benefit Plans by Carrier" report for a list of benefit plans.'
          );
          var button1Text = localize.getLocalizedString('OK');
          modalFactory.ConfirmModal(title, message, button1Text);
        }
      }
    };

    ctrl.saveOnSuccess = function (res) {
      var isEditing = $scope.editing;
      var msg = {
        Text: isEditing
          ? '{0} saved successfully.'
          : '{0} created successfully.',
        Params: ['Carrier'],
      };

      toastrFactory.success(msg, 'Success');

        if (history.length > 1) {
          history.back();
        }
        else {
          $location.path('BusinessCenter/Insurance/Carriers');
        }
    };

    ctrl.saveOnError = function (err) {
      var isEditing = $scope.editing;
      var msg = {
        Text: isEditing
          ? 'Failed to save {0}. Please try again.'
          : 'Failed to create {0}. Please try again.',
        Params: ['carrier'],
      };

      toastrFactory.error(msg, 'Error');
    };

    $scope.checkForDuplicates = function (carrier) {
      $scope.checkingForDuplicates = true;

      $timeout.cancel(ctrl.duplicateCheckTimer);

      ctrl.duplicateCheckTimer = $timeout(function () {
        ctrl.findDuplicates(carrier);
      }, 1000);
    };

    ctrl.findDuplicates = function (carrier) {
      ctrl.clearDuplicates();

      if (carrier != null && (carrier.Name > '' || carrier.PayerId > '')) {
        var params = {
          name: carrier.Name,
          payerId: carrier.PayerId,
          excludeId: carrier.CarrierId,
        };

        businessCenterServices.Carrier.findDuplicates(
          params,
          ctrl.findDuplicatesSuccess,
          ctrl.findDuplicatesFailed
        );
      }
    };

    ctrl.findDuplicatesSuccess = function (result) {
      $scope.checkingForDuplicates = false;

      $scope.duplicates = result.Value;
    };

    ctrl.findDuplicatesFailed = function (error) {
      $scope.checkingForDuplicates = false;

      toastrFactory.error(
        { Text: 'Failed to retrieve list of {0}.', Params: ['duplicates'] },
        'Error'
      );
    };

    $scope.toggleDuplicateVisibilty = function () {
      $scope.showDuplicates = !$scope.showDuplicates;
    };

    ctrl.clearDuplicates = function () {
      $scope.duplicates = [];
    };

    $scope.cancel = function () {
      if (
        $scope.frmCarrier.inpAddressLine1.$pristine &&
        $scope.frmCarrier.inpAddressLine2.$pristine &&
        $scope.frmCarrier.inpCity.$pristine &&
        $scope.carrier.Name !== '' &&
        $scope.frmCarrier.inpEmail.$pristine &&
        $scope.frmCarrier.inpPayerId.$pristine &&
        $scope.frmCarrier.inpPaymentSource.$pristine &&
        $scope.frmCarrier.inpState.$pristine &&
        $scope.frmCarrier.inpWebsite.$pristine &&
        $scope.frmCarrier.inpZip.$pristine &&
        ctrl.untouched()
      ) {
        $location.path('BusinessCenter/Insurance/Carriers');
      } else {
        modalFactory.CancelModal().then(ctrl.confirmCancel);
      }
    };

    //workaround for IE ui-mask dirtying fields
    ctrl.untouched = function () {
      if (
        $scope.backup.FeeScheduleList.length !==
        $scope.carrier.FeeScheduleList.length ||
        $scope.backup.PhoneNumbers.length !==
        $scope.carrier.PhoneNumbers.length ||
        $scope.backup.FaxNumber !== $scope.carrier.FaxNumber
      ) {
        return false;
      }
      for (var i = 0; i < $scope.carrier.FeeScheduleList.length; i++) {
        if (
          $scope.backup.FeeScheduleList[i] !== $scope.carrier.FeeScheduleList[i]
        ) {
          return false;
        }
      }
      for (var i = 0; i < $scope.carrier.PhoneNumbers.length; i++) {
        if (
          $scope.backup.PhoneNumbers[i].PhoneNumber !==
          $scope.carrier.PhoneNumbers[i].PhoneNumber
        ) {
          return false;
        }
      }
      return true;
    };

    ctrl.confirmCancel = function () {
      if (history.length > 1) {
        history.back();
      }
      else {
        $location.path('BusinessCenter/Insurance/Carriers');
      }
    };

    ctrl.getCarrierById = function (guid) {
      $scope.loading = true;
      businessCenterServices.Carrier.get(
        { carrierId: guid },
        function (res) {
          $scope.loading = false;

          $scope.carrier = res.Value;
          if (
            !$scope.carrier.ClaimFilingIndicatorCode ||
            $scope.carrier.ClaimFilingIndicatorCode === ''
          ) {
            $scope.carrier.ClaimFilingIndicatorCode =
              $scope.paymentSourceOptions[3].value;
          }
          $scope.carrierName = angular.copy($scope.carrier.Name);
          if ($scope.carrier.PhoneNumbers.length === 0) {
            $scope.carrier.PhoneNumbers = [
              {
                ContactId: null,
                PhoneNumber: '',
                Type: null,
                TextOk: false,
                Notes: null,
                ObjectState: saveStates.Add,
                IsPrimary: false,
              },
            ];
          }
          if (
            $scope.carrier.FaxNumber === null ||
            $scope.carrier.FaxNumber === undefined
          ) {
            $scope.carrier.FaxNumber = '';
          }
          ctrl.getAvailableFeeSchedules();
        },
        function (err) {
          $scope.loading = false;

          toastrFactory.error(
            { Text: 'Failed to retrieve {0}.', Params: ['carrier'] },
            'Error'
          );
        }
      );
    };

    $scope.$watch('carrier.FaxNumber', function (nv, ov) {
      if (nv != ov) {
        $timeout.cancel($scope.timeoutFaxValidation);
        $scope.timeoutFaxValidation = $timeout(function () {
          $scope.frmCarrier.inpFax.$valid =
            $scope.carrier.FaxNumber == null ||
            $scope.carrier.FaxNumber.length == 0 ||
            $scope.carrier.FaxNumber.length == 10;
        }, 1000);
      }
    });

    $scope.initialize = function () {
      $scope.paymentSourceOptions = [
        {
          name: localize.getLocalizedString('Automobile Medical'),
          value: 'AM',
        },
        {
          name: localize.getLocalizedString('Blue Cross/Blue Shield'),
          value: 'BL',
        },
        { name: localize.getLocalizedString('Champus'), value: 'CH' },
        {
          name: localize.getLocalizedString('Commercial Insurance Co.'),
          value: 'CI',
        },
        {
          name: localize.getLocalizedString('Dental Maintenance Organization'),
          value: '17',
        },
        { name: localize.getLocalizedString('Disability'), value: 'DS' },
        {
          name: localize.getLocalizedString(
            'Exclusive Provider Organization (EPO)'
          ),
          value: '14',
        },
        {
          name: localize.getLocalizedString('Federal Employees Program'),
          value: 'FI',
        },
        {
          name: localize.getLocalizedString(
            'Health Maintenance Organizination'
          ),
          value: 'HM',
        },
        {
          name: localize.getLocalizedString(
            'Health Maintenance Organizination (HMO) Medicare Risk'
          ),
          value: '16',
        },
        {
          name: localize.getLocalizedString('Indemnity Insurance'),
          value: '15',
        },
        { name: localize.getLocalizedString('Liability Medical'), value: 'LM' },
        { name: localize.getLocalizedString('Medicaid'), value: 'MC' },
        { name: localize.getLocalizedString('Medicare Part A'), value: 'MA' },
        { name: localize.getLocalizedString('Medicare Part B'), value: 'MB' },
        { name: localize.getLocalizedString('Mutually Defined'), value: 'ZZ' },
        {
          name: localize.getLocalizedString('Other Federal Programs'),
          value: 'OF',
        },
        {
          name: localize.getLocalizedString('Other Non Federal Programs'),
          value: '11',
        },
        {
          name: localize.getLocalizedString('Point of Service (POS)'),
          value: '13',
        },
        {
          name: localize.getLocalizedString(
            'Preferred Provider Organization (PPO)'
          ),
          value: '12',
        },
        { name: localize.getLocalizedString('Title V'), value: 'TV' },
        {
          name: localize.getLocalizedString('Veterans Affairs Plan'),
          value: 'VA',
        },
        {
          name: localize.getLocalizedString(
            'Workers Compensation Health Claim'
          ),
          value: 'WC',
        },
      ];

      var guid = $routeParams.guid ? $routeParams.guid : null;

      $scope.loading = false;

      $scope.carrier = {
        Name: null,
        IsActive: true,
        PayerId: null,
        AddressLine1: null,
        AddressLine2: null,
        City: null,
        State: null,
        ZipCode: null,
        PhoneNumbers: [
          {
            ContactId: null,
            PhoneNumber: '',
            Type: null,
            TextOk: false,
            Notes: null,
            ObjectState: saveStates.Add,
            IsPrimary: false,
          },
        ],
        FaxNumber: '',
        Website: null,
        Email: null,
        Notes: null,
        DataTag: null,
        FeeScheduleList: [],
      };

      $scope.editing = guid != null;

      if ($scope.editing) {
        $timeout(function () {
          $timeout(function () {
            ctrl.getCarrierById(guid);
          });
        });
      } else {
        ctrl.getAvailableFeeSchedules();
        $scope.carrier.ClaimFilingIndicatorCode =
          $scope.paymentSourceOptions[3].value;
      }

      ctrl.getAllBenefitPlans();

      $scope.hasErrors = false;
      $scope.validPhones = true;

      ctrl.duplicateCheckTimer = null;

      $scope.duplicates = [];

      $scope.checkingDuplicates = false;
      $scope.showDuplicates = true;
    };

    ctrl.getAvailableFeeSchedules = function () {
      $scope.loading = true;
      businessCenterServices.FeeSchedule.get(
        {},
        function (res) {
          $scope.loading = false;
          $scope.availFeeSchedules = res.Value;
          $scope.carrier.FeeScheduleList.forEach(function (fs) {
            var fsToDelete;
            $scope.availFeeSchedules.forEach(function (avail) {
              if (avail.FeeScheduleId === fs.FeeScheduleId) {
                fsToDelete = avail;
              }
            });
            var index = $scope.availFeeSchedules.indexOf(fsToDelete);
            $scope.availFeeSchedules.splice(index, 1);
          });
          $scope.backup = {
            FeeScheduleList: angular.copy($scope.carrier.FeeScheduleList),
            PhoneNumbers: angular.copy($scope.carrier.PhoneNumbers),
            FaxNumber: angular.copy($scope.carrier.FaxNumber),
          };
        },
        function (err) {
          $scope.loading = false;

          toastrFactory.error(
            { Text: 'Failed to retrieve {0}.', Params: ['fee schedule'] },
            'Error'
          );
        }
      );
    };

    ctrl.getAllBenefitPlans = function () {
      $scope.loading = true;
      $scope.benefitPlans = [];
      businessCenterServices.BenefitPlan.get(
        {},
        function (res) {
          $scope.loading = false;
          $scope.benefitPlans = res.Value;
        },
        function (err) {
          $scope.loading = false;
        }
      );
    };

    $scope.setSelectedItem = function (fs, index) {
      $scope.selectedItem = $scope.availFeeSchedules.indexOf(fs);
      $scope.selectedIndex = index;
      $scope.removedIndex = -1;
    };

    $scope.addFeeSchedule = function () {
      if ($scope.selectedIndex >= 0) {
        var alreadyExists = false;
        $scope.carrier.FeeScheduleList.forEach(function (fs) {
          if (
            fs.FeeScheduleId ===
            $scope.availFeeSchedules[$scope.selectedItem].FeeScheduleId
          ) {
            alreadyExists = true;
          }
        });
        if (!alreadyExists) {
          $scope.carrier.FeeScheduleList.push(
            $scope.availFeeSchedules[$scope.selectedItem]
          );
          $scope.availFeeSchedules.splice($scope.selectedItem, 1);
        }
      }

      $scope.selectedIndex = -1;
    };

    $scope.setRemovedItem = function (fs, index) {
      $scope.removedIndex = index;
      $scope.fs = fs;
      $scope.selectedIndex = -1;
    };

    ctrl.moveFeeScheduleFromAttachedToAvailable = function (fs) {
      $scope.availFeeSchedules.push(fs);
      var index = $scope.carrier.FeeScheduleList.indexOf(fs);
      $scope.carrier.FeeScheduleList.splice(index, 1);
    };


    $scope.removeAllFeeSchedule = function () {
      let linkedFeeSchedules = $scope.carrier.FeeScheduleList.filter(function (fs) {
        return $scope.benefitPlans.some(function (bp) {
          return bp.CarrierId === $scope.carrier.CarrierId && bp.FeeScheduleId === fs.FeeScheduleId;
        });
      });

      if (linkedFeeSchedules.length > 0) {
        ctrl.showLinkedFeeSchedulesMessage();
      } else {
        while ($scope.carrier.FeeScheduleList.length > 0) {
          let fsToRemove = $scope.carrier.FeeScheduleList[0];
          ctrl.moveFeeScheduleFromAttachedToAvailable(fsToRemove);
        }
      }
    };
    ctrl.showLinkedFeeSchedulesMessage = function () {
      var title = localize.getLocalizedString('Fee schedules are in use, Please remove them individually.');
      var message = localize.getLocalizedString(
        'One or more fee schedules are in use by other Plans.  Please remove them individually.'
      );
      var okText = localize.getLocalizedString('OK');
      modalFactory.ConfirmModal(title, message, okText);
    };

    $scope.removeFeeSchedule = function () {
      if ($scope.removedIndex < 0)
        return;

      $scope.affectedBenefitPlans = [];
      var selectedItem = $scope.carrier.FeeScheduleList.find(obj => obj.FeeScheduleId === $scope.fs.FeeScheduleId);
      $scope.benefitPlans.forEach(function (bp) {
        if (
          bp.CarrierId === $scope.carrier.CarrierId &&
          bp.FeeScheduleId === selectedItem.FeeScheduleId
        ) {
          $scope.affectedBenefitPlans.push(bp);
        }
      });

      if ($scope.affectedBenefitPlans.length === 0) {
        ctrl.moveFeeScheduleFromAttachedToAvailable(selectedItem);
      } else {
        modalFactory
          .Modal({
            templateUrl:
              'App/BusinessCenter/insurance/carriers/carrier-crud/delete-fee-schedule-modal/delete-fee-schedule-modal.html',
            backdrop: 'static',
            keyboard: false,
            size: 'lg',
            windowClass: 'center-modal',
            controller: 'DeleteFeeScheduleModalController',
            amfa: 'soar-per-pbplan-add',
            resolve: {
              affectedBenefitPlans: function () {
                return $scope.affectedBenefitPlans;
              },
            },
          })
          .result.then(function () {
            ctrl.moveFeeScheduleFromAttachedToAvailable(selectedItem);
          });
      }
      $scope.removedIndex = -1;
    };
  },
]);
