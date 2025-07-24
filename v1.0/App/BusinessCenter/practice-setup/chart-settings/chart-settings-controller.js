'use strict';

angular.module('Soar.BusinessCenter').controller('ChartSettingsController', [
  '$scope',
  '$routeParams',
  'ListHelper',
  'localize',
  '$location',
  'CommonServices',
  'ModalFactory',
  'FeatureService',
  function (
    $scope,
    $routeParams,
    listHelper,
    localize,
    $location,
    commonServices,
    modalFactory,
    featureService,
  ) {
    var ctrl = this;

    ctrl.inputValue = 'Chart Settings';
    ctrl.sections = ['Draw Types', 'Note Templates', 'Chart Colors'];

    // used by the generic template
    $scope.idPrefix = 'chart-settings-';
    $scope.iconClass = 'fas fa-chart-line';
    $scope.header = 'Chart';

    ctrl.$onInit = function () {
      ctrl.loadList();
    };

    // adding links for each sections
    ctrl.addLinks = function () {
      angular.forEach($scope.list, function (item) {
        switch (item.Section) {
          case ctrl.sections[0]:
            item.Link = '#/BusinessCenter/DrawTypes/';
            break;
          case ctrl.sections[1]:
            item.Link = '#/BusinessCenter/NoteTemplates/';
            break;
        }
      });

      $scope.list.push({
        Section: 'Chart Colors',
        Link: '#/BusinessCenter/ChartColors/',
      });
    };

    ctrl.success = function (res) {
      if (res && res.Value && res.Value.Sections) {
        $scope.listIsLoading = false;
        $scope.list = [];
        angular.forEach(res.Value.Sections, function (sec) {
          // TODO - may be able to remove if domain stops returning these
          if (
            sec.Section !== 'Service Buttons' &&
            sec.Section !== 'Type / Materials'
          ) {
            $scope.list.push(sec);
          }
        });
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

    // click handler for modals
    $scope.openModal = function (template, modifierClass, amfa) {
      // if there is a template, we know that this is the service types item and we need to open the modal
      if (template && modifierClass !== 'inactive') {
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
        modalInstance.result.then(function () { }, ctrl.modalWasClosed);
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
      if (item.Section != 'Chart Colors') {
        return '(' + item.Count + ')';
      }
    };

    // for the when the desired display name differs from what is returned by the service
    $scope.displayName = function (item) {
      var name = item.Section;
      switch (item.Section) {
        case ctrl.sections[0]:
          name = 'Draw Types';
          break;
        case ctrl.sections[1]:
          name = 'Clinical Note Templates';
          break;
        case ctrl.sections[2]:
          name = 'Chart Colors';
          break;
      }

      return name;
    };
  },
]);
