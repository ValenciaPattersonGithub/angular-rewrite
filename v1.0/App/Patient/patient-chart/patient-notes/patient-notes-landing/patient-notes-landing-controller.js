'use strict';
angular.module('Soar.Patient').controller('PatientNotesLandingController', [
  '$scope',
  'localize',
  '$routeParams',
  'patSecurityService',
  'toastrFactory',
  '$uibModal',
  'ModalFactory',
  '$filter',
  'StaticData',
  'ListHelper',
  'PatientServices',
  'PatientNotesFactory',
  '$timeout',
  'tabLauncher',
  '$location',
  '$rootScope',
  'userSettingsDataService',
  function (
    $scope,
    localize,
    $routeParams,
    patSecurityService,
    toastrFactory,
    $uibModal,
    modalFactory,
    $filter,
    staticData,
    listHelper,
    patientServices,
    patientNotesFactory,
    $timeout,
    tabLauncher,
    $location,
    $rootScope,
    userSettingsDataService
  ) {
    //#region properties

    // initial properties
    var ctrl = this;
    ctrl.recentNotes = [];
    $scope.filteringByDate = false;
    $scope.toggleLabel = localize.getLocalizedString('Show {0}.', ['Deleted']);
    ctrl.showDeleted = false;
    ctrl.statusToFilter = 3; // Deleted
    $scope.loadingMessageNoResults = localize.getLocalizedString(
      'There are no {0}.',
      ['clinical notes']
    );
    // calc max date
    ctrl.now = moment();
    $scope.maxDate = moment([
      ctrl.now.year(),
      ctrl.now.month(),
      ctrl.now.date(),
      0,
      0,
      0,
      0,
    ]);

    // supporting clinical notes
    ctrl.clinicalNotes = [];
    ctrl.clinicalNotesFilterd = [];
    ctrl.clinicalNotesDateFilterd = [];

    // loading indicator TODO show animation while loading
    $scope.loadingClinicalNotes = true;

    //#endregion

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

    //#region getNotes

    ctrl.loadRecentNotes = function () {
      var notes = [];
      for (var i = 0; i < ctrl.clinicalNotes.length; i++) {
        var existingNote = notes.filter(function (note) {
          return note.NoteId == ctrl.clinicalNotes[i].NoteId;
        });
        if (existingNote.length == 0) {
          ctrl.clinicalNotes[i].$$OriginalCreatedDate = angular.copy(
            ctrl.clinicalNotes[i].CreatedDate
          );
          ctrl.clinicalNotes[i].histories = [];
          notes.push(ctrl.clinicalNotes[i]);
        } else {
          existingNote[0].$$OriginalCreatedDate = angular.copy(
            existingNote[0].CreatedDate
          );
          existingNote[0].histories.push(ctrl.clinicalNotes[i]);
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
    //#endregion

    //#region crud methods

    // expand note to full view for new
    $scope.createNote = function () {
      if (ctrl.authAccess.Create) {
        $scope.clearFilters();
        $timeout(function () {
          if (patientNotesFactory.DataChanged) {
            modalFactory.CancelModal().then(ctrl.confirmCancelNewNote);
          } else {
            ctrl.confirmCancelNewNote();
          }
        });
      }
      //  closes tooth
      $rootScope.$emit('toothClose', {});
    };
    ctrl.confirmCancelNewNote = function () {
      patientNotesFactory.setActiveNewNote();
      ctrl.setViewSettings(true);
      $rootScope.$broadcast('clearTeethEvent');
    };
    // expand note to full view for edit or close
    $scope.expandNote = function () {
      $scope.viewSettings.activeExpand = 1;
      $scope.viewSettings.expandView = !$scope.viewSettings.expandView;
    };

    //#endregion

    $scope.noteEditMode = patientNotesFactory.EditMode;
    $scope.$watch(
      function () {
        return patientNotesFactory.EditMode;
      },
      function (nv) {
        $scope.noteEditMode = nv;
      }
    );

    // set view settings
    ctrl.setViewSettings = function (expand) {
      $scope.viewSettings.expandView = expand;
      $scope.viewSettings.activeExpand = 1;
    };

    // update local list when it changes
    ctrl.updateClinicalNotes = function (notes) {
      ctrl.clinicalNotes = notes;
      // notify whether we have any notes
      $scope.haveNotes = ctrl.clinicalNotes.length > 0;
      // add displayName to this notes
      ctrl.addDisplayNames(ctrl.clinicalNotes);
      ctrl.setProviderLabel(ctrl.clinicalNotes);
      // build recent notes
      ctrl.recentNotes = ctrl.loadRecentNotes();
      // load to VM
      $scope.notesVm = patientNotesFactory.mapClinicalNotesToVm(
        ctrl.recentNotes
      );
    };

    ctrl.initCtrl = function () {};
    ctrl.initCtrl();

    //#region filtering

    $scope.$watch('filteringByDate', function (nv) {
      if (nv === false) {
        $scope.filterObject.StartDate = null;
        $scope.filterObject.EndDate = null;
        $scope.dateRangeError = false;
      }
    });

    // filterObject for dates
    $scope.filterObject = {
      StartDate: null,
      EndDate: null,
    };

    $scope.dateRangeError = false;
    // TODO can this be refactored
    $scope.noteFilter = function (note) {
      // only apply date filter if valid
      if ($scope.filterObject.StartDate && $scope.filterObject.EndDate) {
        var dateTo = moment($scope.filterObject.EndDate).add(1, 'days');
        // error if Start Date is greater than End Date
        if (
          moment($scope.filterObject.StartDate).isAfter(
            moment($scope.filterObject.EndDate)
          )
        ) {
          $scope.dateRangeError = true;
          return note.StatusTypeId !== ctrl.statusToFilter;
        } else {
          $scope.dateRangeError = false;
          return (
            note.StatusTypeId !== ctrl.statusToFilter &&
            moment(note.$$OriginalCreatedDate).isAfter(
              $scope.filterObject.StartDate
            ) &&
            moment(note.$$OriginalCreatedDate).isBefore(dateTo)
          );
        }
      }
      return note.StatusTypeId !== ctrl.statusToFilter;
    };

    //#region

    //#region print filtered notes

    //$scope.printAuth = 'soar-clin-cperio-view';
    ctrl.storageId;
    $scope.printNotes = function (filteredNotes) {
      if (ctrl.authAccess.View) {
        ctrl.clinicalNotesFilterd = [];
        ctrl.clinicalNotesDateFilterd = [];
        // get date range for report
        var dateFrom, dateTo;
        if ($scope.filterObject.StartDate && $scope.filterObject.EndDate) {
          dateFrom = $scope.filterObject.StartDate;
          dateTo = $scope.filterObject.EndDate;
        } else {
          dateTo = filteredNotes[0].$$OriginalCreatedDate;
          dateFrom =
            filteredNotes[filteredNotes.length - 1].$$OriginalCreatedDate;
        }
        // generate a unique id to tag the storage item with
        ctrl.storageId = Math.floor(Math.random() * 1000000);

        if (ctrl.showDeleted === false) {
          angular.forEach(ctrl.clinicalNotes, function (item) {
            if (item.StatusTypeId === 1 || item.StatusTypeId === 2) {
              ctrl.clinicalNotesFilterd.push(item);
            }
          });
        } else {
          angular.forEach(ctrl.clinicalNotes, function (item) {
            ctrl.clinicalNotesFilterd.push(item);
          });
        }

        angular.forEach(ctrl.clinicalNotesFilterd, function (item) {
          if (
            moment(item.$$OriginalCreatedDate).format('YYYY-MM-DD') >=
              moment(dateFrom).format('YYYY-MM-DD') &&
            moment(item.$$OriginalCreatedDate).format('YYYY-MM-DD') <=
              moment(dateTo).format('YYYY-MM-DD')
          ) {
            ctrl.clinicalNotesDateFilterd.push(item);
          }
        });
        ctrl.clinicalNotesDateFilterd = $filter('orderBy')(
          ctrl.clinicalNotesDateFilterd,
          '-$$OriginalCreatedDate'
        );

        var storageItem = {
          DateFrom: dateFrom,
          DateTo: dateTo,
          Notes: ctrl.clinicalNotesDateFilterd,
        };
        localStorage.setItem(
          'clinicalNotes_' + ctrl.storageId,
          JSON.stringify(storageItem)
        );
        let patientPath = '#/Patient/';
        tabLauncher.launchNewTab(
          patientPath +
            $scope.personId +
            '/Clinical/PrintNotes/' +
            ctrl.storageId.toString()
        );
      }
    };

    $scope.clearFilters = function () {
      // reset show deleted
      ctrl.statusToFilter = 3;
      $scope.toggleLabel = localize.getLocalizedString('Show {0}', ['Deleted']);
      $scope.filteringByDate = false;
      $scope.filterObject.StartDate = null;
      $scope.filterObject.EndDate = null;
      $scope.dateRangeError = false;
    };
    //#endregion

    $scope.toggleDeleted = function () {
      ctrl.showDeleted = !ctrl.showDeleted;
      var toggleLabel =
        ctrl.showDeleted === true
          ? localize.getLocalizedString('Hide {0}', ['Deleted'])
          : localize.getLocalizedString('Show {0}', ['Deleted']);
      $scope.toggleLabel = toggleLabel;
      ctrl.statusToFilter = ctrl.showDeleted === false ? 3 : null;

      ctrl.clinicalNotesFilterd = ctrl.clinicalNotes;
    };

    // set the provider label
    ctrl.setProviderLabel = function (clinicalNotes) {
      _.forEach(clinicalNotes, function (note) {
        note.$$providerLabel = patientNotesFactory.SetProviderLabel(note);
      });
    };

    //#region use clinical overview data for notes when loaded

    // add display names to note
    ctrl.addDisplayNames = function (notes) {
      _.forEach(notes, function (note) {
        note.$$DisplayNameAndDesignation =
          patientNotesFactory.getNameAndDesignation(note);
      });
    };

    ctrl.loadNotes = function () {
      if ($scope.data && $scope.data.Notes) {
        $scope.clinicalDataLoaded = true;

        if (
          !patientNotesFactory.getNotesList() ||
          patientNotesFactory.getNotesList().length === 0
        ) {
          $scope.data.Notes.forEach(function (note) {
            ctrl.clinicalNotes.push(note);
          });
        } else {
          var localList = patientNotesFactory.getNotesList();
          localList.forEach(function (note) {
            ctrl.clinicalNotes.push(note);
          });
        }
        // notify whether we have any notes
        $scope.haveNotes = ctrl.clinicalNotes.length > 0;
        // add displayName to this notes
        ctrl.addDisplayNames(ctrl.clinicalNotes);
        $scope.loadingClinicalNotes = false;
        ctrl.setProviderLabel(ctrl.clinicalNotes);
        // load the factory object
        patientNotesFactory.load(ctrl.clinicalNotes);
        // build recent notes
        ctrl.recentNotes = ctrl.loadRecentNotes();
        // load to VM
        $scope.notesVm = patientNotesFactory.mapClinicalNotesToVm(
          ctrl.recentNotes
        );
      }
    };

    // subscribe to notes list changes
    patientNotesFactory.observeNotes(ctrl.updateClinicalNotes);

    $scope.$watch(
      'data',
      function (nv, ov) {
        if (nv && !$scope.clinicalDataLoaded) {
          ctrl.loadNotes();
        }
      },
      true
    );

    $scope.$on('soar:rxNoteGenerated', function (event, value) {
      ctrl.updateClinicalNotes($scope.data.Notes);
    });

    //#endregion
  },
]);
