'use strict';

angular
  .module('Soar.BusinessCenter')
  .controller('PatientAccountingSetupController', [
    '$scope',
    'localize',
    'ModalFactory',
    'patSecurityService',
    'CommonServices',
    function (
      $scope,
      localize,
      modalFactory,
      patSecurityService,
      commonServices,
    ) {
      var ctrl = this;

      ctrl.sections = [
        'Adjustment Types',
        'Discount Types',
        'Payment Types',
        'Default Messages',
        'Bank Accounts',
      ];

      // for noResults directive
      $scope.listIsLoading = true;

      // used by the generic template
      $scope.idPrefix = 'patient-account-setup-';
      $scope.iconClass = 'fas fa-dollar-sign';
      $scope.header = localize.getLocalizedString('Billing');

      // adding links for each sections
      ctrl.addLinks = function () {
        angular.forEach($scope.list, function (item) {
          switch (item.Section) {
            case ctrl.sections[0]:
              item.Link = '#/Business/Billing/AdjustmentTypes/';
              break;
            case ctrl.sections[1]:
              item.Link = '#/Business/Billing/DiscountTypes/';
              break;
            case ctrl.sections[2]:
              item.Link = '#/Business/Billing/PaymentTypes/';
              break;
            case ctrl.sections[3]:
              item.Link = '#/Business/Billing/DefaultMessages/';
              item.AmfaAbbreviation = 'soar-biz-bilmsg-view';
              break;
            case ctrl.sections[4]:
              item.Link = '#/Business/Billing/BankAccounts/';
              break;
          }
        });
      };

      ctrl.success = function (res) {
        if (res && res.Value && res.Value.Sections) {
          $scope.listIsLoading = false;
          $scope.list = res.Value.Sections;

          // we don't get this one back from the api call, because there is no need for a count
          var defaultMessagesSection = {
            Count: null,
            OtherInformation: null,
            Section: ctrl.sections[3],
          };
          $scope.list.push(defaultMessagesSection);
          ctrl.addLinks();
        }
      };

      ctrl.failure = function () {
        $scope.listIsLoading = false;
      };

      // api call to get section data
      ctrl.loadList = function () {
        commonServices.PracticeSettings.PracticeSetup.Retrieve({ InputValue: 'Patient Account Settings' }).$promise.then(ctrl.success, ctrl.failure);
      };

      // initial load of the list
      ctrl.loadList();

      // click handler for modals
      $scope.openModal = function (template, modifierClass) {
        if (template && modifierClass !== 'inactive') {
          switch (template) {
            case 'App/BusinessCenter/settings/payment-types/payment-types.html':
              var title = localize.getLocalizedString('Payment Types');
              var amfaValue = 'soar-biz-bpmttp-view';
              if (patSecurityService.IsAuthorizedByAbbreviation(amfaValue)) {
                ctrl.instantiateModal(title, amfaValue, template);
              }
              break;
            case 'App/BusinessCenter/settings/adjustment-types/adjustment-types.html':
              title = localize.getLocalizedString('Adjustment Types');
              amfaValue = 'soar-biz-bpmttp-view';
              if (patSecurityService.IsAuthorizedByAbbreviation(amfaValue)) {
                ctrl.instantiateModal(title, amfaValue, template);
              }
              break;
            case 'App/BusinessCenter/settings/discount-types/discount-types-landing.html':
              title = localize.getLocalizedString('Discount Types');
              amfaValue = 'soar-biz-bizdsc-view';
              if (patSecurityService.IsAuthorizedByAbbreviation(amfaValue)) {
                ctrl.instantiateModal(title, amfaValue, template);
              }
              break;
          }
        }
      };

      ctrl.instantiateModal = function (title, amfaValue, template) {
        $scope.modalIsOpen = true;
        var modalInstance = modalFactory.Modal({
          templateUrl: 'App/BusinessCenter/practice-setup/lists-modal.html',
          backdrop: 'static',
          keyboard: false,
          size: 'lg',
          windowClass: 'center-modal',
          controller: 'ListsModalController',
          amfa: amfaValue,
          resolve: {
            title: function () {
              return title;
            },
            template: function () {
              return template;
            },
          },
        });
        modalInstance.result.then(function () { }, ctrl.modalWasClosed);
      };

      ctrl.modalWasClosed = function () {
        $scope.modalIsOpen = false;
        // refreshing the list after the modal is closed
        $scope.listIsLoading = true;
        $scope.list = [];
        ctrl.loadList();
      };

      // determines whether or not to add the complete modifier class
      $scope.getModifierClass = function (item) {
        var cls = '';
        switch (item.Section) {
          case ctrl.sections[0]:
            if (item.Count > 0) {
              cls = 'complete';
            }
            break;
          case ctrl.sections[1]:
            if (item.Count > 0) {
              cls = 'complete';
            }
            break;
          case ctrl.sections[2]:
            if (item.Count > 0) {
              cls = 'complete';
            }
            break;
          case ctrl.sections[3]:
            if (item.Count > 0) {
              cls = 'complete';
            }
            break;
          case ctrl.sections[4]:
            if (item.Count > 0) {
              cls = 'complete';
            }
            break;
        }
        return cls;
      };

      // displaying the counts
      $scope.displayAdditionalContent = function (item) {
        var content = '';
        switch (item.Section) {
          case ctrl.sections[0]:
            content = '(' + item.Count + ')';
            break;
          case ctrl.sections[1]:
            content = '(' + item.Count + ')';
            break;
          case ctrl.sections[2]:
            content = '(' + item.Count + ')';
            break;
          case ctrl.sections[4]:
            content = '(' + item.Count + ')';
            break;
        }
        return content;
      };

      // for the when the desired display name differs from what is returned by the service
      $scope.displayName = function (item) {
        var name = item.Section;
        switch (item.Section) {
          case ctrl.sections[0]:
            name = 'Adjustment Types';
            break;
          case ctrl.sections[1]:
            name = 'Discount Types';
            break;
          case ctrl.sections[2]:
            name = 'Payment Types';
            break;
          case ctrl.sections[3]:
            name = 'Default Messages';
            break;
          case ctrl.sections[4]:
            name = 'Bank Accounts';
            break;
        }
        return name;
      };
    },
  ]);
