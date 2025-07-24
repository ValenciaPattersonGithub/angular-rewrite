'use strict';

angular
  .module('Soar.BusinessCenter')
  .controller('PatientProfileSetupController', [
    '$scope',
    'localize',
    'ModalFactory',
    'FeatureService',
    'ReferralManagementHttpService',
    'CommonServices',
    function (
      $scope,
      localize,
      modalFactory,
      featureService,
      referralManagementHttpService,
      commonServices,
    ) {

      var ctrl = this;

      ctrl.inputValue = 'Patients Profile';
      ctrl.sections = [
        'Additional Identifiers',
        'Alerts',
        'Group Types',
        'Referral Sources',
        'Referral Affiliates'
      ];
      $scope.migrationFeatureFlagsLoaded = false;
      ctrl.getConversionFlags = function () {
        featureService.isMigrationEnabled("NgMigration_ReferralType").then(function (res) {
          $scope.migrationFeatureFlagsLoaded = res;
        });
      };

      ctrl.getConversionFlags();

      $scope.listIsLoading = true;
      $scope.referralAffiliateCount = '';

      // used by the generic template
      $scope.idPrefix = 'patient-profile-setup-';
      $scope.iconClass = 'fa-user';
      $scope.header = 'Patient Profile';

      // adding links for each sections
      ctrl.addLinks = function () {
        angular.forEach($scope.list, function (item) {
          switch (item.Section) {
            case ctrl.sections[0]:
              item.Link =
                '#/BusinessCenter/PatientProfile/AdditionalIdentifiers';
              break;
            case ctrl.sections[1]:
              item.Link = '#/BusinessCenter/PatientProfile/Flags';
              break;
            case ctrl.sections[2]:
              item.Link = '#/BusinessCenter/PatientProfile/GroupTypes';
              break;
            case ctrl.sections[3]:
              item.Link = '#/BusinessCenter/PatientProfile/ReferralSources';
              break;
            case ctrl.sections[4]:
              item.Link = '#/BusinessCenter/PatientProfile/ReferralType';
              break;
          }
        });
      };

      ctrl.success = function (res) {
        if (res && res.Value && res.Value.Sections) {
          $scope.listIsLoading = false;
          $scope.list = [];
          angular.forEach(res.Value.Sections, function (item) {
            $scope.list.push(item);
          });
          ctrl.addLinks();
        }
      };

      ctrl.failure = function () {
        $scope.listIsLoading = false;
      };

      //// api call to get section data
      ctrl.loadList = function () {
        commonServices.PracticeSettings.PracticeSetup.Retrieve({ InputValue: 'Patient Profile Setup' }).$promise.then(ctrl.success, ctrl.failure);
      };

      ctrl.displayRefferalAffiliatesCount = function () {
        var cachedLocation = JSON.parse(sessionStorage.getItem('userLocation'));
        var req = { PracticeId: cachedLocation != null ? cachedLocation.practiceid : 0 };
        return referralManagementHttpService.getProviderAffiliatesForCount(req).then(
          function (res) {
            if (res != null && res.length > 0) {
              $scope.referralAffiliateCount = '(' + res[0]["totalRecords"] + ')';
            } else {
              $scope.referralAffiliateCount = '(0)';
            }
          },
          function () {
            $scope.referralAffiliateCount = '(0)';
          }
        );
      };

      //// initial load of the list
      ctrl.displayRefferalAffiliatesCount();
      ctrl.loadList();

      //// click handler for modals
      $scope.openModal = function (template, modifierClass) {
        if (template && modifierClass !== 'inactive') {
          switch (template) {
            case 'App/BusinessCenter/settings/patient-additional-identifiers/patient-additional-identifiers.html':
              var title = localize.getLocalizedString('Additional Identifiers');
              var amfaValue = 'soar-biz-bmalrt-view';
              ctrl.instantiateModal(title, amfaValue, template);
              break;
            case 'App/BusinessCenter/settings/master-alerts/master-alerts.html':
              var title = localize.getLocalizedString('Flags');
              var amfaValue = 'soar-biz-bmalrt-view';
              ctrl.instantiateModal(title, amfaValue, template);
              break;
            case 'App/BusinessCenter/settings/group-types/group-types.html':
              var title = localize.getLocalizedString('Group Types');
              var amfaValue = 'soar-biz-bizgrp-view';
              ctrl.instantiateModal(title, amfaValue, template);
              break;
            case 'App/BusinessCenter/settings/referral-sources/referral-sources.html':
              var title = localize.getLocalizedString('Referral Sources');
              var amfaValue = 'soar-biz-brfsrc-view';
              ctrl.instantiateModal(title, amfaValue, template);
              break;
            case 'App/BusinessCenter/settings/referral-type/referral-type.html':
              var title = localize.getLocalizedString('Referral Types');
              var amfaValue = 'soar-biz-brfsrc-view';
              ctrl.instantiateModal(title, amfaValue, template);
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

      //// determines whether or not to add the complete modifier class
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

      //// displaying the counts
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
          case ctrl.sections[3]:
            content = '(' + item.Count + ')';
            break;
          case ctrl.sections[4]:
            content = '(' + item.Count + ')';
            break;
        }
        return content;
      };

      //// for the when the desired display name differs from what is returned by the service
      $scope.displayName = function (item) {
        var name = item.Section;
        switch (item.Section) {
          case ctrl.sections[0]:
            name = localize.getLocalizedString('Additional Identifiers');
            break;
          case ctrl.sections[1]:
            name = localize.getLocalizedString('Flags');
            break;
          case ctrl.sections[2]:
            name = localize.getLocalizedString('Group Types');
            break;
          case ctrl.sections[3]:
            name = localize.getLocalizedString('Referral Sources');
            break;
          case ctrl.sections[4]:
            name = localize.getLocalizedString('Referral Affiliates');
            break;
        }
        return name;
      };
    },
  ]);
