'use strict';
angular.module('Soar.Patient').controller('ActiveButtonLayoutController', [
  '$scope',
  'ListHelper',
  '$window',
  'localize',
  function ($scope, listHelper, $window, localize) {
    var ctrl = this;

    ctrl.$onInit = function () {};

    // using jquery here because i was having difficulty keeping selectedLayoutItems in sync with sorting changes
    angular.element('#selectedButtons').kendoSortable({
      change: function (e) {
        // re-ordering actually list
        var itemMoved = $scope.selectedLayoutItems[e.oldIndex];
        $scope.selectedLayoutItems.splice(e.oldIndex, 1);
        $scope.selectedLayoutItems.splice(e.newIndex, 0, itemMoved);
        // need this to keep ng-repeat in sync
        $scope.$apply();
      },
    });

    // fires when the button is dropped, updating list
    $scope.onDrop = function (e) {
      ctrl.add(e.draggable.element[0]);
      $scope.$apply(function () {
        $scope.draggableClass = '';
      });
    };

    // adds items to selectedLayoutItems
    ctrl.add = function (element) {
      if (element.id && element.id !== 'selectedButtons') {
        var buttonObject = {
          Id: element.id,
          Text:
            $window.navigator.userAgent.toLowerCase().indexOf('firefox') > -1
              ? element.textContent
              : element.innerText,
        };
        $scope.selectedLayoutItems.push(buttonObject);
      }
    };

    // remove items from selectedLayoutItems
    $scope.remove = function (buttonObject) {
      var index = listHelper.findIndexByFieldValue(
        $scope.selectedLayoutItems,
        'Id',
        buttonObject.Id
      );
      if (index !== -1) {
        $scope.selectedLayoutItems.splice(index, 1);
      }
    };

    // setting background class based on button type
    $scope.getButtonColorClass = function (layoutItem) {
      var cssClass = '';
      switch (layoutItem.Id.slice(0, 1)) {
        case '1':
          cssClass = 'conditionColor';
          break;
        case '2':
          cssClass = 'svcBtnColor';
          break;
        case '3':
          cssClass = 'swiftCodeBtnColor';
          break;
      }
      return cssClass;
    };

    $scope.showCloseButton = false;
    $scope.removeFavoriteMessage = localize.getLocalizedString('{0} {1}', [
      'Remove',
      'favorite',
    ]);
  },
]);
