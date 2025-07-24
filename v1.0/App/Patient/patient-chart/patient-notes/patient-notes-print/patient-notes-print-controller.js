'use strict';

var app = angular.module('Soar.Patient');

var PatientNotesPrintController = app.controller(
  'PatientNotesPrintController',
  [
    '$rootScope',
    '$scope',
    '$filter',
    'patSecurityService',
    'toastrFactory',
    'localize',
    '$routeParams',
    '$window',
    'PersonFactory',
    'practiceService',
    'PatientNotesFactory',
    'UsersFactory',
    '$timeout',
    '$location',
    function (
      $rootScope,
      $scope,
      $filter,
      patSecurityService,
      toastrFactory,
      localize,
      $routeParams,
      $window,
      personFactory,
      practiceService,
      patientNotesFactory,
      usersFactory,
      $timeout,
      $location
    ) {
      var ctrl = this;
      $scope.loadingPatient = true;
      $scope.loadingUser = true;
      $scope.currentUser = {};
      $scope.showHistory = { Value: false };
      $scope.showHistoryLabel = localize.getLocalizedString('Show {0}', [
        'edit history',
      ]);

      //#region auth

      $scope.authViewAccess = function () {
        return patSecurityService.IsAuthorizedByAbbreviation(
          'soar-clin-cnotes-view'
        );
      };

      $scope.authAccess = function () {
        if (!$scope.authViewAccess()) {
          toastrFactory.error(
            patSecurityService.generateMessage('soar-clin-cnotes-view'),
            'Not Authorized'
          );
          event.preventDefault();
          $location.path('/');
        }
      };
      $scope.authAccess();

      //#endregion

      $scope.showHisoryDetails = function () {
        if ($scope.showHistory.Value == true) {
          $scope.showHistoryData = ctrl.clinicalNotes.Notes;
        } else {
          $scope.showHistoryData = ctrl.loadfilteredNotes();
        }
      };

      ctrl.loadfilteredNotes = function () {
        var notes = [];
        for (var i = 0; i < ctrl.clinicalNotes.Notes.length; i++) {
          var existingNote = notes.filter(function (note) {
            return note.NoteId == ctrl.clinicalNotes.Notes[i].NoteId;
          });
          if (existingNote.length == 0) {
            ctrl.clinicalNotes.Notes[i].$$OriginalCreatedDate = angular.copy(
              ctrl.clinicalNotes.Notes[i].CreatedDate
            );
            ctrl.clinicalNotes.Notes[i].histories = [];
            notes.push(ctrl.clinicalNotes.Notes[i]);
          } else {
            existingNote[0].$$OriginalCreatedDate = angular.copy(
              existingNote[0].CreatedDate
            );
            existingNote[0].histories.push(ctrl.clinicalNotes.Notes[i]);
            _.forEach(existingNote[0].histories, function (his) {
              if (
                moment(his.CreatedDate).isBefore(
                  existingNote[0].$$OriginalCreatedDate
                )
              ) {
                existingNote[0].$$OriginalCreatedDate = angular.copy(
                  his.CreatedDate
                );
              }
            });
          }
        }
        return notes;
      };

      //#region init

      ctrl.$onInit = function () {
        $scope.patientId = $routeParams.patientId;
        var storageId = $routeParams.storageId;

        angular.element('body').addClass('patientNotesPrint');

        //get the stored perio and remove the storage item
        var localStorageIdentifier = 'clinicalNotes_' + storageId;
        $scope.clinicalNotes = JSON.parse(
          localStorage.getItem(localStorageIdentifier)
        );
        localStorage.removeItem(localStorageIdentifier);

        $scope.getDisplayNameAndDesignation();

        // load the patient details
        ctrl.getPatient();

        //load selectedLoction
        var temploc = JSON.parse(sessionStorage.getItem('userLocation'));
        $scope.selectedLocation = temploc.name;

        //get todays date for the report
        $scope.todaysDate = moment();

        // get current user
        ctrl.getCurrentUser();

        // initial properties
        $scope.loadingMessage =
          localize.getLocalizedString('Loading the notes.');
      };

      //#endregion

      // Get the current userCode
      ctrl.getCurrentUser = function () {
        //get current user
        var currentUser = $rootScope.patAuthContext.userInfo;
        usersFactory.User(currentUser.userid).then(function (res) {
          $scope.currentUser = res.Value;
          $scope.loadingUser = false;
        });
      };

      // Get the displayname with designation
      $scope.getDisplayNameAndDesignation = function () {
        angular.forEach($scope.clinicalNotes.Notes, function (note) {
          note.DisplayNameAndDesignation =
            patientNotesFactory.getNameAndDesignation(note);
          $scope.getDisplayNameAndDesignationForHistory(note);
        });
      };

      // Get the displayname with designation for note histories
      $scope.getDisplayNameAndDesignationForHistory = function (note) {
        angular.forEach(note.histories, function (history) {
          history.DisplayNameAndDesignation =
            patientNotesFactory.getNameAndDesignation(history);
        });
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

      ctrl.$onInit();
    },
  ]
);
