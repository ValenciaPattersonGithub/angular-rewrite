'use strict';

var app = angular.module('Soar.Patient');

var PatientNotesTileController = app.controller('PatientNotesTileController', [
  '$scope',
  '$routeParams',
  'localize',
  'ListHelper',
  'PatientServices',
  'toastrFactory',
  '$filter',
  'soarAnimation',
  'patSecurityService',
  'ModalFactory',
  'PatientNotesFactory',
  '$timeout',
  '$interval',
  '$location',
  '$rootScope',
  function (
    $scope,
    $routeParams,
    localize,
    listHelper,
    patientServices,
    toastrFactory,
    $filter,
    soarAnimation,
    patSecurityService,
    modalFactory,
    patientNotesFactory,
    $timeout,
    $interval,
    $location,
    $rootScope
  ) {
    var ctrl = this;

    $scope.tileExpanded = false;
    $scope.noteIsActive = false;
    ctrl.activeNote = null;
    $scope.savingNote = false;
    $scope.validNote = true;

    //#region authentication

    //"soar-clin-cnotes-view": "View"
    //"soar-clin-cnotes-add": "Add"
    //"soar-clin-cnotes-edit": "Edit"
    //"soar-clin-cnotes-delete": "Delete"
    ctrl.authAccess = patientNotesFactory.access();
    if (!ctrl.authAccess.View) {
      toastrFactory.error(
        patSecurityService.generateMessage('soar-clin-cnotes-view'),
        'Not Authorized'
      );
      event.preventDefault();
      $location.path('/');
    }

    //#endregion

    //#region Menu Toggle
    $scope.menuToggle = function ($event, i) {
      i.ActionsVisible = !i.ActionsVisible;
      i.orientV = soarAnimation.soarVPos($event.currentTarget);
    };

    //#endregion Menu Toggle

    $scope.checkTileExpand = function (e) {
      //Stop propagation to keep the note from opening in full view
      e.stopPropagation();

      if ($scope.tileExpanded === true) {
        $scope.tileExpanded = false;
        patientNotesFactory.setPreviewNote(null);
        return true;
      } else {
        return false;
      }
    };

    //#region edit
    $scope.editNote = function (event) {
      $timeout(function () {
        if (patientNotesFactory.DataChanged) {
          modalFactory.CancelModal().then(ctrl.confirmCancelEditNote);
        } else {
          ctrl.confirmCancelEditNote();
        }
      });
      //event.preventDefault();
    };
    ctrl.confirmCancelEditNote = function () {
      patientNotesFactory.setActiveNote($scope.note);
      $scope.viewSettings.expandView = true;
      $scope.viewSettings.activeExpand = 1;
      $timeout(function () {
        if (!patientNotesFactory.EditMode)
          patientNotesFactory.setEditMode(true);
      });
      patientNotesFactory.setDataChanged(false);
    };

    //#endregion

    // expand tile to view note in patient-note-crud
    $scope.expandTile = function () {
      if (patientNotesFactory.DataChanged) {
        modalFactory.CancelModal().then(ctrl.confirmCancelExpandTile);
      } else {
        ctrl.confirmCancelExpandTile();
      }
      //closes tooth
      $rootScope.$emit('toothClose', {});
    };

    // retract expand
    ctrl.confirmCancelExpandTile = function () {
      patientNotesFactory.setActiveNote($scope.note);
      $scope.viewSettings.activeExpand = 1;
      $scope.viewSettings.expandView = true;
      patientNotesFactory.setDataChanged(false);
    };

    // expand tile to view note
    $scope.previewNote = function (e) {
      //Stop propagation to keep the note from opening in full view
      e.stopPropagation();

      patientNotesFactory.setPreviewNote($scope.note);
      $scope.tileExpanded = $scope.tileExpanded === true ? false : true;
    };

    // watch should set tileExpanded to false for all notes except activeNote
    $scope.$watch(
      function () {
        return patientNotesFactory.PreviewNote;
      },
      function (nv, ov) {
        if (nv && $scope.note.NoteId !== nv.NoteId) {
          $scope.tileExpanded = false;
        }
      }
    );

    $scope.noteEditMode = patientNotesFactory.EditMode;
    $scope.$watch(
      function () {
        return patientNotesFactory.EditMode;
      },
      function (nv) {
        // TODO may not need this handled by landing page
      }
    );

    // ActiveNote watch sets the noteIsActive
    ctrl.activeNote = angular.copy(patientNotesFactory.ActiveNote);
    $scope.$watch(
      function () {
        return patientNotesFactory.ActiveNote;
      },
      function (nv, ov) {
        ctrl.activeNote = angular.copy(nv);
        // is this the active note
        $scope.noteIsActive =
          ctrl.activeNote != null &&
          ctrl.activeNote.NoteId === $scope.note.NoteId;
      }
    );

    ctrl.init = function () {};
    ctrl.init();
  },
]);
