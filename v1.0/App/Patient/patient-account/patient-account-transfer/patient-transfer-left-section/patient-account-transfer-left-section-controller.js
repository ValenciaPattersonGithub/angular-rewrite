'use strict';

var PatientAccountTransferController = angular
  .module('Soar.Patient')
  .controller('PatientAccountTransferLeftSectionController', [
    '$scope',
    '$routeParams',
    '$timeout',
    'PatientServices',
    '$filter',
    '$window',
    'BoundObjectFactory',
    'toastrFactory',
    'localize',
    '$location',
    function (
      $scope,
      $routeParams,
      $timeout,
      patientServices,
      $filter,
      $window,
      boundObjectFactory,
      toastrFactory,
      localize,
      $location
    ) {
      var ctrl = this;
      $scope.isPrimary = false;

      ctrl.displayPatientInfo = function (res) {
        /// Patient Name
        $scope.PatientName = ctrl.buildName(
          $scope.patientData.FirstName,
          $scope.patientData.LastName,
          $scope.patientData.MiddleName,
          $scope.patientData.Suffix
        );
        $scope.patientData.FullName = $scope.PatientName;

        $scope.primaryPatientName = ctrl.buildName(
          $scope.$parent.patientdata2.FirstName,
          $scope.$parent.patientdata2.LastName,
          $scope.$parent.patientdata2.MiddleName,
          $scope.$parent.patientdata2.Suffix
        );
        $scope.primaryPID = $scope.$parent.patientdata2.PatientCode;

        $scope.filterPatient = $filter('filter')(
          $scope.accountMembers,
          { IsResponsiblePerson: true },
          true
        )[0];

        $scope.ResponsibleParty = $scope.patientData.ResponsiblePersonName;

        if ($scope.patientData.ResponsiblePersonName !== 'Self')
          $scope.ResponsibleParty = ctrl.buildName(
            $scope.filterPatient.FirstName,
            $scope.filterPatient.LastName,
            $scope.filterPatient.MiddleName,
            $scope.filterPatient.SuffixName
          );
        $scope.warningRP =
          $scope.ResponsibleParty === 'Self' && $scope.accountMembers.length > 1
            ? true
            : false;
      };

      $timeout(callAtTimeout, 1);

      function callAtTimeout() {
        $scope.$parent.setHeight(0);
      }
      $scope.$watch('$parent.patientdata2', function (nv) {
        ctrl.displayPatientInfo();
      });
      $scope.primarySelected = function (val) {
        $scope.$parent.isPrimary.isSelectedRight = false;
        $scope.$parent.isPrimary.isSelectedLeft = true;
        $scope.$root.borderStyle_section1 = 'border-primary';
        $scope.$root.borderStyle_section2 = 'border-nonePrimary';

        $timeout(callAtTimeout, 1);
      };
      ctrl.buildName = function (firstname, lastname, middlename, suffix) {
        if (!!suffix && suffix.trim() !== '' && suffix !== 'N/A') {
          lastname += ', ' + suffix
        }

        return !!middlename && middlename.trim() !== '' && middlename !== 'N/A'
          ? firstname + ' ' + middlename + '.' + ' ' + lastname
          : firstname + ' ' + lastname;
      };
      ctrl.init = function () {
        ctrl.displayPatientInfo();
      };
      ctrl.init();
    },
  ]);
