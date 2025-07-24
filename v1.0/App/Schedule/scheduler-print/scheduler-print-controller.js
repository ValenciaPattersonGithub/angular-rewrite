//'use strict';
(function () {
  angular
    .module('Soar.Schedule')
    .controller('SchedulerPrintController', SchedulerPrintController);

  SchedulerPrintController.$inject = [
    '$scope',
    '$window',
    'toastrFactory',
    '$rootScope',
  ];

  function SchedulerPrintController(
    $scope,
    $window,
    toastrFactory,
    $rootScope
  ) {
    BaseCtrl.call(this, $scope, 'SchedulerPrintController');
    var ctrl = this;
    document.getElementsByClassName('no-print')[0].innerHTML = '';

    console.log(window.pdf);
    if (!_.isUndefined(window.pdf)) {
      var pdf = window.pdf;
      document.getElementById('print-container').innerHTML =
        '<iframe style="display:block; width:100%; height:100vh;" class="scheduler-print" width="100%" height="100%" src="' +
        pdf +
        '"></iframe>';
    }
  }
  SchedulerPrintController.prototype = Object.create(BaseCtrl.prototype);
})();
