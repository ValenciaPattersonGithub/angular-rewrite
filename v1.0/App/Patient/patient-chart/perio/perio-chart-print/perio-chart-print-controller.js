'use strict';

var app = angular.module('Soar.Patient');

var PerioChartPrintController = app.controller('PerioChartPrintController', [
  '$scope',
  '$rootScope',
  '$filter',
  'localize',
  '$routeParams',
  '$timeout',
  'ListHelper',
  '$window',
  'PatientPerioExamFactory',
  'PersonFactory',
  'practiceService',
  'toastrFactory',
  'patSecurityService',
  '$location',
  function (
    $scope,
    $rootScope,
    $filter,
    localize,
    $routeParams,
    $timeout,
    listHelper,
    $window,
    patientPerioExamFactory,
    personFactory,
    practiceService,
    toastrFactory,
    patSecurityService,
    $location
  ) {
    var ctrl = this;

    $scope.viewOnly = true;
    $scope.isForClaimAttachment = false;

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
      //get the stored perio and remove the storage item
      var localStorageIdentifier = 'perio_' + $routeParams.examId;
      $scope.perioExam = JSON.parse(
        localStorage.getItem(localStorageIdentifier)
      );        
      if ($scope.$parent.currentDocument) {
        $scope.isForClaimAttachment = true;
      }
      if ($scope.isForClaimAttachment) {
        $scope.perioExam = $scope.$parent.currentDocument.data;
      }
      // adding catch for the fact that the storage item might not exist due to refresh
      if (!_.isNil($scope.perioExam)) {
        localStorage.removeItem(localStorageIdentifier);
        //
        //Leaving this here in case we are requested to convert nulls to 0 again in the future
        //If some offices need/want the print view to show 0s instead of nulls, we can maybe give them a toggle on the print page?
        //patientPerioExamFactory.convertNullsToZero(
        //    $scope.perioExam.ExamDetails
        //);
        //
        var local = moment.utc($scope.perioExam.ExamHeader.ExamDate).toDate();
        $scope.perioExam.ExamHeader.$$LocalExamDate = moment(local).format(
          'MM/DD/YYYY'
        );
        //
        if (!$scope.isForClaimAttachment) {
          angular.element('body').addClass('perioChartPrint');
        }
        // load the patient details
        $scope.patientId = $routeParams.patientId;
        if ($scope.isForClaimAttachment) {
          $scope.patientId = $scope.$parent.claim.PatientId;
        }
        $scope.loadingPatient = true;
        ctrl.getPatient();
        //load practice details
        $scope.currentPractice = practiceService.getCurrentPractice();
        //get todays date for the report
        $scope.todaysDate = moment();
        // initial properties
        $scope.loadingMessage = localize.getLocalizedString(
          'Loading the exam.'
        );
        $scope.bleedingPocketVisible = true;
        $scope.suppurationPocketVisible = false;
        $scope.loadingQueue = angular.copy($scope.loadingQueueBackup);
      }
    };

    //#endregion

    //#region loading queue

    // default state of perio readings directive queue
    $scope.loadingQueueBackup = [
      { load: true },
      { load: false },
      { load: false },
      { load: false },
      { load: false },
      { load: false },
      { load: false },
      { load: false },
      { load: false },
      { load: false },
      { load: false },
      { load: false },
      { load: false },
      { load: false },
      { load: false },
      { load: false },
      { load: false },
      { load: false },
      { load: false },
      { load: false },
      { load: false },
      { load: false },
      { load: false },
      { load: false },
      { load: false },
      { load: false },
      { load: false },
      { load: false },
      { load: false },
      { load: false },
      { load: false },
      { load: false },
    ];

    // turning on one perio readings directive at a time
    $scope.$on('soar:perio-reading-directive-loaded', function () {
      var keepGoing = true;
      angular.forEach($scope.loadingQueue, function (item) {
        if (keepGoing === true && item.load === false) {
          keepGoing = false;
          item.load = true;
        }
      });
    });

    //broadcast when loadingQueue is finished running for attachments-modal.js
    $scope.$watch(
      'loadingQueue[28]',
      function () {
        if ($scope.loadingQueue[28].load === true) {
          $rootScope.$broadcast('$perioLoadingComplete');
        }
      },
      true
    );

    //#endregion

    //#region suppuration,bleeding

    // some special handling for bleeding and suppuration now they want those to appear in the same row
    $scope.$watch(
      function () {
        return patientPerioExamFactory.ActiveExam;
      },
      function (nv) {
        if (nv === 'SuppurationPocket') {
          $scope.bleedingPocketVisible = false;
          $scope.suppurationPocketVisible = true;
        } else if (nv === 'BleedingPocket') {
          $scope.bleedingPocketVisible = true;
          $scope.suppurationPocketVisible = false;
        }
      }
    );

    //#endregion

    //#region private methods

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

    //#endregion

    ctrl.$onInit();
  },
]);
