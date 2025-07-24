angular.module('Soar.Patient').directive('communicationIcon', function () {
  return {
    restrict: 'E',
    scope: {
      patientId: '=',
      communicationTypeId: '=',
      showUnreadCount: '=?',
      initialCount: '=?',
      hideOnZeroCount: '=?',
      disable: '=?',
    },
    templateUrl:
      'App/Patient/components/communication-icon/communication-icon.html',
    controller: 'CommunicationIconController',
    link: function link(scope, element, attrs) {
      element.on('$destroy', function elementOnDestroy() {
        scope.$destroy();
      });
    },
  };
});
