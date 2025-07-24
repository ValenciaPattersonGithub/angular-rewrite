'use strict';

angular.module('common.directives').directive('slotPreviewList', function () {
  return {
    restrict: 'E',
    scope: {
      openTimeSlots: '=',
      timeSlotToPreview: '=',
      selectedSlot: '=',
      searchGroup: '=',
      onPreview: '&?',
      onClose: '&?',
      previewParam: '=',
    },
    templateUrl: 'App/Common/components/previewSlotSlider/slotPreviewList.html',
    controller: 'SlotPreviewListController',
    link: function link(scope, element, attrs) {
      element.on('$destroy', function elementOnDestroy() {
        scope.$destroy();
      });
    },
  };
});
