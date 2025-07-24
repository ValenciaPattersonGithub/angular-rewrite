/*Since we use this upload from multiple locations it makes sense to put this common code in one directive

    openUploader          - this triggers the openDocUploader when set to true
    documentFilter  - this sets the patientDocumentsFactory.selectedFilter
    
*/

'use strict';

angular.module('common.directives').directive('documentUploader', function () {
  return {
    restrict: 'E',
    scope: {
      openUploader: '=',
      documentFilter: '=',
    },
    templateUrl: 'App/Common/components/documentUploader/documentUploader.html',
    controller: 'DocumentUploaderController',
    link: function link(scope, element, attrs) {
      element.on('$destroy', function elementOnDestroy() {
        scope.$destroy();
      });
    },
  };
});
