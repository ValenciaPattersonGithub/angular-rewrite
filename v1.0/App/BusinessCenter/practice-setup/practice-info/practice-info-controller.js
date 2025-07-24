'use strict';

angular.module('Soar.BusinessCenter').controller('PracticeInfoController', [
  '$scope',
  'ListHelper',
  'localize',
  'CommonServices',
  function (
    $scope,
    listHelper,
    localize,
    commonServices,
  ) {
    var ctrl = this;

    ctrl.inputValue = 'Practice Info';
    ctrl.sections = [
      'Location',
      'Practice Information',
      'Additional Identifiers',
      'Add a Location',
    ];

    // used by the generic template
    $scope.idPrefix = 'practice-info-';
    $scope.iconClass = 'fa-building';
    $scope.header = localize.getLocalizedString('Practice & Locations');

    $scope.$on('patCore:initlocation', function () {
      ctrl.addLinks();
    });

    // adding links for each sections
    ctrl.addLinks = function () {
      var userLocation = JSON.parse(sessionStorage.getItem('userLocation'));
      angular.forEach($scope.list, function (item) {
        switch (item.Section) {
          case ctrl.sections[0]:
            if (userLocation && userLocation.id) {
              item.Link =
                '#/BusinessCenter/PracticeSettings/Locations/?locationId=' +
                userLocation.id;
            } else {
              item.Link = '#/BusinessCenter/PracticeSettings/Locations/';
            }
            break;
          case ctrl.sections[1]:
            item.Link =
              '#/BusinessCenter/PracticeSettings/PracticeInformation/';
            break;
          case ctrl.sections[2]:
            item.Link = '#/BusinessCenter/PracticeSettings/Identifiers';
            break;
          case ctrl.sections[3]:
            item.Link =
              '#/BusinessCenter/PracticeSettings/Locations/?locationId=-1';
            item.AmfaAbbreviation = 'plapi-bus-loc-create';
            break;
        }
      });
    };

    ctrl.success = function (res) {
      if (res && res.Value && res.Value.Sections) {
        $scope.list = res.Value.Sections;
        ctrl.locationCount = listHelper.findItemByFieldValue(
          $scope.list,
          'Section',
          'Location'
        ).Count;
        ctrl.identifierCount = listHelper.findItemByFieldValue(
          $scope.list,
          'Section',
          'Additional Identifiers'
        ).Count;
        var identifier = $scope.list[1];
        $scope.list[1] = { Section: 'Practice Information' };
        $scope.list.push(identifier);
        $scope.list.push({ Section: 'Add a Location' });
        ctrl.addLinks();
        $scope.listIsLoading = false;
      }
    };

    ctrl.failure = function () {
      $scope.listIsLoading = false;
    };

    ctrl.loadLists = function () {
      // for noResults directive
      $scope.listIsLoading = true;
      commonServices.PracticeSettings.PracticeSetup.Retrieve({ InputValue: ctrl.inputValue }).$promise.then(ctrl.success, ctrl.failure);
    };

    ctrl.loadLists();

    // click handler for modals
    $scope.openModal = function (template, modifierClass) {
      // placeholder - no modals in this section yet
      if (template && modifierClass !== 'inactive') {
        switch (template) {
          case 'App/BusinessCenter/identifiers/locations-identifiers/locations-identifiers.html':
            var title = localize.getLocalizedString('Additional Identifiers');
            var amfaValue = 'soar-biz-bizgrp-view';
            ctrl.instantiateModal(title, amfaValue, template);
            break;
        }
      }
    };

    // determines whether the inactive or complete class are added
    $scope.getModifierClass = function (item) {
      var cls = '';
      switch (item.Section) {
        case ctrl.sections[0]:
          if (item.Count > 0) {
            cls = 'complete';
          }
          break;
        case ctrl.sections[1]:
          cls = 'complete bold';
          break;
        case ctrl.sections[2]:
          if (item.Count > 0) {
            cls = 'complete';
          }
          break;
        case ctrl.sections[3]:
          cls = 'complete bold';
          break;
      }
      return cls;
    };

    // display the info inside the parens, either a number or text
    $scope.displayAdditionalContent = function (item) {
      var content = '';
      switch (item.Section) {
        case ctrl.sections[0]:
          content = '(' + item.Count + ')';
          break;
        case ctrl.sections[2]:
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
          name = 'All Locations';
          break;
        case ctrl.sections[2]:
          name = 'Additional Identifiers';
          break;
        case ctrl.sections[3]:
          name = 'Add a Location';
          break;
      }
      return name;
    };
  },
]);
