'use strict';

angular.module('Soar.BusinessCenter').controller('ServicesSettingsController', [
  '$scope',
  '$routeParams',
  'ListHelper',
  'localize',
  '$location',
  'CommonServices',
  'ModalFactory',
  function (
    $scope,
    $routeParams,
    listHelper,
    localize,
    $location,
    commonServices,
    modalFactory,
  ) {
    var ctrl = this;

    ctrl.sections = ['Service Codes', 'Service Types', 'Location Fee Lists'];

    // used by the generic template
    $scope.idPrefix = 'services-settings-';
    $scope.iconClass = 'fa-clipboard';
    $scope.header = 'Services & Fees';

    // adding links for each sections
    ctrl.addLinks = function () {
      angular.forEach($scope.list, function (item) {
        switch (item.Section) {
          case ctrl.sections[0]:
            item.Link = '#/BusinessCenter/ServiceCode/';
            break;
          case ctrl.sections[1]:
            item.Link = '#/BusinessCenter/ServiceTypes/';
            break;
          case ctrl.sections[2]:
            item.Link = '#/BusinessCenter/FeeLists/';
            break;
        }
      });
    };

    ctrl.success = function (res) {
      if (res && res.Value && res.Value.Sections) {
        $scope.listIsLoading = false;
        $scope.list = res.Value.Sections;
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
      commonServices.PracticeSettings.PracticeSetup.Retrieve({ InputValue: 'Services Settings' }).$promise.then(ctrl.success, ctrl.failure);
    };

    // initial load of the list
    ctrl.loadList();

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
      return '(' + item.Count + ')';
    };

    // for the when the desired display name differs from what is returned by the service
    $scope.displayName = function (item) {
      var name = item.Section;
      switch (item.Section) {
        case ctrl.sections[0]:
          name = 'Service & Swift Codes';
          break;
        case ctrl.sections[1]:
          name = 'Service Types';
          break;
      }
      return name;
    };
  },
]);
