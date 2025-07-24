'use strict';

angular.module('common.directives').directive('customLabelPanel', function () {
  return {
    restrict: 'E',
    replace: true,
    scope: {
      // List of labels and values
      customLabels: '=',
      // Boolean to disable other panels on parent scope
      panelLive: '=',
      // Boolean to toggle buttons when saving
      panelSaving: '=',
      // Function to clear edits on parent scope
      cancel: '&',
      // Function to update edits on parent scope
      update: '&',
      // Indication on what call to make to get the custom labels for
      // patient = get labels for patient category
      // provider = get labels for provider category
      // location = get labels for location category
      category: '@',
    },
    templateUrl: 'App/Common/components/customLabelPanel/customLabelPanel.html',
    controller: 'CustomLabelPanelCtrl',
    link: function link(scope, element, attrs) {
      element.on('$destroy', function elementOnDestroy() {
        scope.$destroy();
      });
    },
  };
});
