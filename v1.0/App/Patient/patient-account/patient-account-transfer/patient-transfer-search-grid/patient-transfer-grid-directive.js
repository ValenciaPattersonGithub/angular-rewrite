angular.module('Soar.Patient').directive('patientTransferGrid', function () {
  return {
    restrict: 'E',
    scope: {
      patientData2: '=',
      updateValue: '&',
    },
    templateUrl:
      'App/Patient/patient-account/patient-account-transfer/patient-transfer-search-grid/patient-transfer-grid.html',
    controller: 'PatientTransferGridController',
    link: function link(scope, element, attrs) {
      //scope.highlightRow = function (currentRow) {
      //    console.log(currentRow);
      //    scope.$parent.patientData2 = currentRow;
      //    scope.updateValue(currentRow);
      //}
      //scope.$watch('patientData2', function (nv) {
      //    scope.patientData = nv;
      //});
      element.on('$destroy', function elementOnDestroy() {
        scope.$destroy();
      });
    },
  };
});
