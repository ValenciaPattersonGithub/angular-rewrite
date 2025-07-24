'use strict';

angular.module('Soar.BusinessCenter').controller('ScheduleSetupController', [
  '$scope',
  'localize',
  'CommonServices',
  'FuseFlag',
  'FeatureFlagService',
  function (
    $scope,
    localize,
    commonServices,
    fuseFlag,
    featureFlagService
  ) {
    var ctrl = this;

    ctrl.inputValue = 'Schedule Setup';
    const appointmentTypeHeader = "Appointment Types";
    const sectionsToLinks = {
      [appointmentTypeHeader]: {
        v1: "#/Schedule/AppointmentTypes/",
        v2: "#/schedule/v2/appointmenttypes"
      },
      "Provider Hours": {
        v1: "#/Schedule/ProviderHours/?source=practiceSettings",
        v2: "#/schedule/v2/providerhours"
      },
      "Ideal Day Templates": {
        v1: "#/Schedule/ProviderHours/?source=practiceSettings&toIdealDays=true",
        v2: "#/schedule/v2/providerhours?showIdealDayTemplates=true"
      },
      "Set Time Increments": { // apparently this is not part of the scheduling domain, despite being a scheduling setting
        v1: "#/Schedule/Settings/?source=practiceSettings",
        v2: "#/Schedule/Settings/?source=practiceSettings"
      },
      "Set Holidays": {
        v1: "#/Schedule/Holidays/?source=practiceSettings",
        v2: "#/schedule/v2/holidays"
      }
    }
    
    $scope.list = [];
    for (let sectionName in sectionsToLinks) {
      $scope.list.push({
        Section: sectionName,
        Link: sectionsToLinks[sectionName].v1 // default to v1
      });
    }

    // for noResults directive
    $scope.listIsLoading = true;

    // used by the generic template
    $scope.idPrefix = 'schedule-setup-';
    $scope.iconClass = 'fa-calendar-alt';
    $scope.header = 'Schedule';
    $scope.description = localize.getLocalizedString(
      'After adding providers, you can setup your schedule and create templates that help plan your day by appointment type.'
    );

    featureFlagService.getOnce$(fuseFlag.ShowScheduleV2).subscribe((value) => {
      $scope.list.forEach(l => l.Link = (value ? sectionsToLinks[l.Section].v2 : sectionsToLinks[l.Section].v1));
      $scope.listIsLoading = false;
    });

    // click handler for modals
    $scope.openModal = function (template, modifierClass) {};

    // The below functions are related to updating the settings lists with the count(s) of items
    // at this time we're removing that functionality because it's so coupled with the other settings components
    // but I have left the functionality here in case enough people complain to add it back in
    
    // determines whether the inactive or complete class are added
    $scope.getModifierClass = function (item) {
      var cls = '';
      switch (item.Section) {
        case appointmentTypeHeader:
          if (item.Count > 0) {
            cls = 'complete';
          }
          break;
      }
      return cls;
    };

    // display the info inside the parens only if applicable
    $scope.displayAdditionalContent = function (item) {
      if (!item.Count) {
        return '';
      }
      var content = '';
      switch (item.Section) {
        case appointmentTypeHeader:
          content = '(' + item.Count + ')';
          break;
      }
      return content;
    };

    // for the when the desired display name differs from what is returned by the service
    $scope.displayName = function (item) {
      var name = item.Section;
      switch (item.Section) {
        case appointmentTypeHeader:
          name = appointmentTypeHeader;
          break;
      }
      return name;
    };
  },
]);
