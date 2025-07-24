'use strict';

// Grid Directive
// This grid directive is restricted to an element <grid>

angular
  .module('common.directives')
  .directive('communicationTypeIcon', function () {
    return {
      restrict: 'EA',
      scope: {
        communicationType: '@',
        displayType: '&',
      },
      //templateUrl: 'App/Common/components/communicationTypeIcon/communicationTypeIcon.html',

      template: [
        '<div>' +
          '<div class="commIcon">' +
          '<i class="{{communicationTypeIcon}}"></i>' +
          '<img class="communicationFltr__btnIcon" ng-src="Images/PatientCommunication/{{ ::communicationTypeIcon }}.svg"  />' +
          '</div>' +
          '</div>',
      ],
      link: function (scope, element, attr, ctrl) {
        switch (scope.communicationType) {
          case '3':
            scope.communicationTypeIcon = 'phone';
            element.find('.commIcon').css('color', '#2DABCB');
            break;
          case '5':
            scope.communicationTypeIcon = 'stampicon';
            element.find('.commIcon').css('color', '#2DABCB');
            break;
          case '6':
            scope.communicationTypeIcon = 'comment-o';
            element.find('.commIcon').css('color', '#2DABCB');
            break;
          case '7':
            scope.communicationTypeIcon = 'envelope-o';
            element.find('.commIcon').css('color', '#2DABCB');
            break;
        }
        element.on('$destroy', function elementOnDestroy() {
          scope.$destroy();
        });
      },
    };
  });
