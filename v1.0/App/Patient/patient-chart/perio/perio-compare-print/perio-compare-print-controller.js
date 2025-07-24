'use strict';

angular.module('Soar.Patient').controller('PerioComparePrintController', [
  '$scope',
  'localize',
  '$filter',
  '$routeParams',
  '$window',
  'PatientPerioExamFactory',
  'PersonFactory',
  'practiceService',
  'toastrFactory',
  'patSecurityService',
  '$location',
  function (
    $scope,
    localize,
    $filter,
    $routeParams,
    $window,
    patientPerioExamFactory,
    personFactory,
    practiceService,
    toastrFactory,
    patSecurityService,
    $location
  ) {
    var ctrl = this;
    $scope.patientId = $routeParams.patientId;

    //#region auth

    $scope.authAccess = patientPerioExamFactory.access();
    if (!$scope.authAccess.View) {
      toastrFactory.error(
        patSecurityService.generateMessage('soar-clin-cperio-view'),
        'Not Authorized'
      );
      event.preventDefault();
      $location.path('/');
    }

    //#endregion

    //#region init

    ctrl.$onInit = function () {
      //get the stored perio comparison and remove the storage item
      ctrl.loadComparisonFromStorage($scope.patientId);
      ctrl.positionLabels();

      // load the patient details
      ctrl.getPatient($scope.patientId);

      //load practice details
      $scope.currentPractice = practiceService.getCurrentPractice();

      //get todays date for the report
      $scope.todaysDate = moment();

      // initial properties
      $scope.loadingMessage = localize.getLocalizedString(
        'Loading the comparison.'
      );

      angular.element('body').addClass('perioComparePrint');
    };

    //#endregion

    ctrl.loadComparisonFromStorage = function (patientId) {
      var localStorageIdentifier = 'perio_compare_' + patientId;
      $scope.perioExamComparison = JSON.parse(
        localStorage.getItem(localStorageIdentifier)
      );
      $scope.exams = $scope.perioExamComparison.Exams;
        angular.forEach($scope.exams, function (exam) {
        //Leaving this here in case we are requested to convert nulls to 0 again in the future
        //If some offices need/want the print view to show 0s instead of nulls, we can maybe give them a toggle on the print page?
        //patientPerioExamFactory.convertNullsToZero(exam.ExamDetails);
      });
      $scope.selectedExamType = $scope.perioExamComparison.ExamType;
      localStorage.removeItem(localStorageIdentifier);
    };

    ctrl.getPatient = function () {
      $scope.loadingPatient = true;
      personFactory.getById($scope.patientId).then(function (res) {
        $scope.patient = res.Value;
        $scope.loadingPatient = false;
        $scope.patientName = $filter('getPatientNameAsPerBestPractice')(
          $scope.patient
        );
      });
    };

    // hard code label and quadrant break based on # of exams
    ctrl.positionLabels = function () {
      switch ($scope.exams.length / 4) {
        case 1:
          $scope.labelPos = [0, 1, 2, 3];
          $scope.quadrantGap = [0, 1, 2];
          break;
        case 2:
          $scope.labelPos = [1, 3, 5, 7];
          $scope.quadrantGap = [1, 3, 5];
          break;
        case 3:
          $scope.labelPos = [1, 4, 7, 10];
          $scope.quadrantGap = [2, 5, 8];
          break;
        case 4:
          $scope.labelPos = [2, 6, 10, 14];
          $scope.quadrantGap = [3, 7, 11];
          break;
        case 5:
          $scope.labelPos = [2, 7, 12, 17];
          $scope.quadrantGap = [4, 9, 14];
          break;
        case 6:
          $scope.labelPos = [3, 9, 15, 21];
          $scope.quadrantGap = [5, 11, 17];
          break;
      }
    };

    ctrl.$onInit();
  },
]);
