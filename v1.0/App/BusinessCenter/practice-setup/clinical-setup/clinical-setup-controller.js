'use strict';

angular.module('Soar.BusinessCenter').controller('ClinicalSetupController', [
  '$scope',
  '$http',
  '$window',
  'toastrFactory',
  'localize',
  'ModalFactory',
  'ImagingMasterService',
  'BlueImagingService',
  'CommonServices',
  'FuseFlag',
  'FeatureFlagService',
  function (
    $scope,
    $http,
    $window,
    toastrFactory,
    localize,
    modalFactory,
    imagingMasterService,
    blueImagingService,
    commonServices,
    fuseFlag,
    featureFlagService
  ) {
    var ctrl = this;

    ctrl.inputValue = 'Clinical Setup';

    ctrl.sections = [
      'Conditions',
      'Medical History Alerts',
      'Preventive Care',
      'Treatment Consent Letter',
      'Informed Consent Message',
      'Download Dolphin Capture Agent',
      'Blue Imaging Preferences',
      'Customize Medical History',
    ];
     
    // used by the generic template
    $scope.idPrefix = 'clinical-setup-';
    $scope.iconClass = 'fa-stethoscope';
    $scope.header = 'Clinical';
    $scope.enableDCADownloadLink;
    $scope.EnableClinicalMedHxV2Navigation = false;
    ctrl.$onInit = function () {
      featureFlagService.getOnce$(fuseFlag.EnableClinicalMedHxV2Navigation).subscribe(value => {
        $scope.EnableClinicalMedHxV2Navigation = value;
      });
    };

    // adding links for each sections
    ctrl.addLinks = function () {
      angular.forEach($scope.list, function (item) {
        switch (item.Section) {
          case ctrl.sections[0]:
            item.Link = '#/BusinessCenter/Conditions/';
            break;
          case ctrl.sections[1]:
            item.Link = '#/BusinessCenter/PatientMedicalAlerts/';
            item.AmfaAbbreviation = 'soar-biz-tpmsg-view';
            break;
          case ctrl.sections[2]:
            item.Link = '#/BusinessCenter/PreventiveCare/';
            break;
          case ctrl.sections[3]:
            item.Link = '#/BusinessCenter/TreatmentConsentLetter/';
            item.AmfaAbbreviation = 'soar-biz-tpmsg-view';
            break;
          case ctrl.sections[4]:
            item.Link = '#/BusinessCenter/InformedConsentMessage/';
            item.AmfaAbbreviation = 'soar-biz-icmsg-view';
            break;
          case ctrl.sections[5]:
            if ($scope.enableDCADownloadLink) {
              item.Link = $scope.dcaLink;
            }
            break;
          case ctrl.sections[6]:
            if ($scope.enableBlueImagingLink) {
              item.Link = '';
            }
            break;

          case ctrl.sections[7]:
            item.Link = '#/BusinessCenter/Clinical/v2/MedicalHistoryEdit/';
            item.AmfaAbbreviation = 'soar-biz-bcform-edit';
            break;
        }
      });
    };

    ctrl.success = function (res) {
      if (res && res.Value && res.Value.Sections) {
        $scope.listIsLoading = false;
        $scope.list = res.Value.Sections;
        //// TODO get from api with a count...
        //var patientMedicalAlertsSection = {
        //    Count: null,
        //    OtherInformation: null,
        //    Section: ctrl.sections[1]
        //};
        //$scope.list.push(patientMedicalAlertsSection);
        //// we don't get this one back from the api call, because there is no need for a count
        var treatmentConsentSection = {
          Count: null,
          OtherInformation: null,
          Section: ctrl.sections[3],
        };
        $scope.list.push(treatmentConsentSection);

        // we don't get this one back from the api call either
        var informedConsentSection = {
          Count: null,
          OtherInformation: null,
          Section: ctrl.sections[4],
        };
        $scope.list.push(informedConsentSection);

        let dolphinDownloadSection = {
          Count: null,
          OtherInformation: null,
          Section: ctrl.sections[5],
        };
        $scope.list.push(dolphinDownloadSection);

        let bluePreferencesSection = {
          Count: null,
          OtherInformation: null,
          Section: ctrl.sections[6],
          Template: 'blue',
        };
        $scope.list.push(bluePreferencesSection);

        let medicalHistoryAdminSection = {
          Count: null,
          OtherInformation: null,
          Section: ctrl.sections[7],
        };
        if ($scope.EnableClinicalMedHxV2Navigation) {
          $scope.list.push(medicalHistoryAdminSection);
        }

        ctrl.addLinks();
      }
    };

    ctrl.failure = function () {
      $scope.listIsLoading = false;
    };

    // api call to get section data
    ctrl.loadList = function () {
      // for noResults directive
      $scope.listIsLoading = true;
      commonServices.PracticeSettings.PracticeSetup.Retrieve({ InputValue: ctrl.inputValue }).$promise.then(ctrl.success, ctrl.failure);
    };

    // initial load of the list
    ctrl.loadList();

    // click handler for modals
    $scope.openModal = function (template, modifierClass, amfa) {
      // if there is a template, we know that this is the service types item and we need to open the modal
      if (template == 'blue') {
        $window.open($scope.blueLink);
      } else if (template && modifierClass !== 'inactive') {
        $scope.modalIsOpen = true;
        var modalInstance = modalFactory.Modal({
          templateUrl: 'App/BusinessCenter/practice-setup/lists-modal.html',
          backdrop: 'static',
          keyboard: false,
          size: 'lg',
          windowClass: 'center-modal',
          controller: 'ListsModalController',
          amfa: amfa,
          resolve: {
            title: function () {
              return localize.getLocalizedString('Service Types');
            },
            template: function () {
              return template;
            },
          },
        });
        modalInstance.result.then(function () {}, ctrl.modalWasClosed);
      }
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
      if (item.Count > 0) {
        cls = 'complete';
      }
      return cls;
    };

    // displaying the counts
    $scope.displayAdditionalContent = function (item) {
      return item.Count ? '(' + item.Count + ')' : '';
    };

    // for the when the desired display name differs from what is returned by the service
    $scope.displayName = function (item, index) {
      var name = ctrl.sections[index];
      switch (item.Section) {
        case ctrl.sections[0]:
          name = localize.getLocalizedString('Conditions');
          break;
        case ctrl.sections[1]:
          name = localize.getLocalizedString('Medical History Alerts');
          break;
        case ctrl.sections[2]:
          name = localize.getLocalizedString('Preventive Care');
          break;
        case ctrl.sections[3]:
          name = localize.getLocalizedString('Treatment Consent Letter');
          break;
        case ctrl.sections[4]:
          name = localize.getLocalizedString('Informed Consent Message');
          break;
        case ctrl.sections[5]:
          if ($scope.enableDCADownloadLink) {
            name = localize.getLocalizedString('Download Dolphin Capture Agent');
          }
          break;
        case ctrl.sections[6]:
          if ($scope.enableBlueImagingLink) {
            name = localize.getLocalizedString('Blue Imaging Preferences');
          }
          break;
        case ctrl.sections[7]:
          if ($scope.EnableClinicalMedHxV2Navigation) {
            name = localize.getLocalizedString('Customize Medical History');
          }
          break;
      }
      return name;
    };

    ctrl.getDolphinCaptureAgentLink = function () {
      $http({
        method: 'GET',
        url: '_soarapi_/utilities/dca',
      }).then(
        function onSuccess(res) {
          $scope.dcaLink = res.data.Value;
          // populate link if not populated already
          $scope.list.find(x => {
            if (x.Section === 'Download Dolphin Capture Agent') {
              x.Link = res.data.Value;
            }
          });
        },
        function onError() {
          toastrFactory.error(
            localize.getLocalizedString('Failed to enable download link for Dolphin Capture Agent'),
            localize.getLocalizedString('Error')
          );
        }
      );
    };

    ctrl.getBlueImagingLink = function () {
      blueImagingService.getUrlForPreferences().then(res => {
        $scope.blueLink = `#/BusinessCenter/PracticeSettings/Blue?blueUrl=${encodeURIComponent(res)}`;
        $scope.list.find(x => {
          if (x.Section === 'Blue Imaging Preferences') {
            x.Link = '';
          }
        });
      });
    };

    // check for sidexis/dolphinBlue integration
    ctrl.getImagingProviders = function () {
      imagingMasterService.getServiceStatus().then(res => {
        if (res.sidexis) {
          // enable DCA link if sidexis is enabled
          if (res.sidexis.status !== 'notAvailable') {
            $scope.enableDCADownloadLink = true;
            ctrl.getDolphinCaptureAgentLink();
          }
        }

        if (res.blue) {
          // enable Blue Preferences link if Blue Imaging is enabled
          if (res.blue.status !== 'notAvailable') {
            $scope.enableBlueImagingLink = true;
            ctrl.getBlueImagingLink();
          }
        }
      });
    };

    ctrl.getImagingProviders();
  },
]);
