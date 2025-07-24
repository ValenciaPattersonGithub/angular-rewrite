'use strict';
angular.module('Soar.Patient').controller('PatientNotesCrudController', [
  '$scope',
  '$rootScope',
  'localize',
  '$location',
  'ListHelper',
  'PatientServices',
  'toastrFactory',
  '$filter',
  'patSecurityService',
  'StaticData',
  'ModalFactory',
  'PatientNotesFactory',
  'NoteTemplatesHttpService',
  '$timeout',
  'tabLauncher',
  'DiscardChangesService',
  'userSettingsDataService',
  'locationService',
  '$sanitize',
  'RichTextSanitizerService',
  function (
    $scope,
    $rootScope,
    localize,
    $location,
    listHelper,
    patientServices,
    toastrFactory,
    $filter,
    patSecurityService,
    staticData,
    modalFactory,
    patientNotesFactory,
    noteTemplatesHttpService,
    $timeout,
    tabLauncher,
    discardChangesService,
    userSettingsDataService,
    locationService,
    $sanitize,
    richTextSanitizerService
  ) {
    var ctrl = this;

    //#region ctrl properties

    $scope.savingNote = false;
    ctrl.originalNote = {};
    $scope.collapseTemplates = false;
    $scope.selectedTeeth = [];
    $scope.extraContent = [];
    $scope.activeLocation = null;
    $scope.allowProviderEditing = false;      

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
      $location.path(_.escape('/'));
    }

    //#endregion

    // #region update kendo editor to readonly
    $scope.$on('kendoWidgetCreated', function (event, widget) {
      if ($scope.editMode === false) {
        disableContentEdit(
          $('#readOnlyNotesInKendoEditor').data('kendoEditor')
        );
        disableContentEdit(
          $('#deletedReadOnlyNotesInKendoEditor').data('kendoEditor')
        );
      }
    });

    function disableContentEdit(editor) {
      if (editor !== undefined) {
        editor.body.contentEditable = false;
        $('.k-editor-toolbar').hide();
      }
    }
    // #endregion

    //#region editor options

    $scope.noteToolOptions = [
      'bold',
      'italic',
      'underline',
      'foreColor',
      {
        name: 'tooth',
        template:
          '<tooth-selector template="widget" is-clinical-note="true" selected-teeth="extraContent" selected-teeth-changed="true" validate-selection=true cancel-button-label="\'Cancel\'" apply-button-label="\'Apply\'" toggle-label="\'Tooth\'" multiselect-enabled="true"></tooth-selector>',
      },
      {
        name: 'Save-Cancel',
        tooltip: 'Cancel',
        template:
          '<button id="btnCancel" class="btn btn-link" title="Cancel" ng-click="cancel()" ng-disabled="savingNote" >{{ "Cancel" | i18n }}</button><span class="spacing"><button id="btnSave" class="btn btn-primary" title="Save Note" ng-click="save();" ng-disabled="savingNote||widgetActive" >{{ "Save" | i18n }}</button></span>',
      },
    ];

    //#endregion
    //#region store original note for comparison

    ctrl.noteBackup = function (note) {
      ctrl.originalNote = angular.copy(note);
      patientNotesFactory.setDataChanged(false);
      ctrl.registerController();
    };

    //#endregion

    //#region save a note

    ctrl.save = function () {
      // check security for saving based on editMode
      if (
        ($scope.editMode === true && ctrl.authAccess.Edit === true) ||
        ($scope.editMode === false && ctrl.authAccess.Create === true)
      ) {
        // if note does not have PatientId set it to route personId
        if (
          ctrl.note.PatientId === null ||
          ctrl.note.PatientId === '' ||
          ctrl.note.PatientId === undefined
        ) {
          ctrl.note.PatientId = $scope.personId;
        }
        $scope.validNote = patientNotesFactory.validateNote($scope.noteVm);
        if ($scope.validNote && ctrl.lockChecked) {
          //Remove any SVG tags as those can cause a XSS vulnerability
          if ($scope.noteVm && $scope.noteVm.Note) {
            $scope.noteVm.Note = $scope.noteVm.Note.replace(
              /((&lt;)\/?(svg)([\s\S]*?)(&gt;))/g,
              ''
            );
          }

          //Using the built in sanitize library to clean up any XSS injection
          //$scope.noteVm.Note = $sanitize($scope.noteVm.Note);

          $scope.savingNote = true;
          // merge changes back to original note
          ctrl.mapVmToClinicalNote(ctrl.note, $scope.noteVm);
          patientNotesFactory.save(ctrl.note).then(function (res) {
            patientNotesFactory.setActiveNewNote();
            $scope.collapseTemplates = true;
            if ($scope.onSave) {
              $scope.onSave();
            }
            $scope.collapseTemplates = true;
            $scope.$broadcast('soar:collapse-all-categories');
          });
          $scope.savingNote = false;
        }
      }
    };

    //#endregion

    //#region validate a note
    ctrl.validateNote = function () {
      $scope.validNote = patientNotesFactory.validateNote($scope.noteVm);
    };

    //#endregion

    //#region cancel

    $scope.cancel = function () {
      if (patientNotesFactory.DataChanged) {
        modalFactory.CancelModal().then(ctrl.confirmCancel);
      } else {
        ctrl.confirmCancel();
      }
    };
    // process cancel confirmation
    ctrl.confirmCancel = function () {
      $scope.templateSelected = false;
      // remove any modifications before deleting
      ctrl.note = angular.copy(ctrl.originalNote);
      $scope.noteVm = ctrl.mapClinicalNoteToVm(ctrl.note);
      $scope.selectedTeeth = [];
      patientNotesFactory.setActiveNewNote();
      $scope.validNote = true;
      // reset view settings
      if ($scope.onCancel) {
        $scope.onCancel();
      }
      $scope.collapseTemplates = true;
      $scope.$broadcast('soar:collapse-all-categories');
    };

    //#endregion

    // set editMode true
    $scope.setEditMode = function () {
      $scope.editMode = true;
      patientNotesFactory.setEditMode(true);
    };

    $scope.$watch(
      function () {
        return patientNotesFactory.EditMode;
      },
      function (nv, ov) {
        if (nv) {
          $timeout(function () {
            $scope.editMode = true;
          });
        }
      }
    );
      

    ctrl.$onInit = function () {
      patientNotesFactory.setEditMode(false);
      $scope.validNote = true;
      ctrl.getTeethDefinitions();
      $scope.activeLocation = locationService.getCurrentLocation().id;
    };

    $scope.assignedProviderChanged = function (assignedProviderId) {
      $scope.noteVm.AssignedProviderId = assignedProviderId;
    };

    //#region get the note

    ctrl.getNote = function (noteTemp) {
      patientNotesFactory
        .getById(noteTemp.PatientId, noteTemp.NoteId)
        .then(function (res) {
          ctrl.note = res.Value[0];
          ctrl.setNoteAction(ctrl.note);
          // this updates the tooth selector widget with any existing teeth already on the note
          if (
            ctrl.note &&
            ctrl.note.ToothNumbers &&
            ctrl.note.ToothNumbers.length > 0
          ) {
            $scope.selectedTeeth = [];
            angular.forEach(ctrl.note.ToothNumbers, function (tooth) {
              var selectedTooth = listHelper.findItemByFieldValue(
                ctrl.teethDefinitions,
                'USNumber',
                tooth
              );
              if (selectedTooth) {
                $scope.selectedTeeth.push(selectedTooth);
              }
            });
          }
          ctrl.note.$$OriginalCreatedDate = angular.copy(ctrl.note.CreatedDate);
          // add user display name and professional designation to a new note
          ctrl.note.$$DisplayNameAndDesignation = patientNotesFactory.getNameAndDesignation(
            ctrl.note
          );

            ctrl.note.histories = res.Value.slice(1);
            if (String(ctrl.note.Note).includes("iframe")) {
                let iFrameRegex = /<[\/]?iframe[^>]*>/gi;
                ctrl.note.Note = ctrl.note.Note.replace(iFrameRegex, '');
            }
            
          angular.forEach(ctrl.note.histories, function (history) {
            history.$$DisplayNameAndDesignation = patientNotesFactory.getNameAndDesignation(
              history
            );
            if (
              moment(history.CreatedDate).isBefore(
                ctrl.note.$$OriginalCreatedDate
              )
            ) {
              ctrl.note.$$OriginalCreatedDate = angular.copy(
                history.CreatedDate
              );
            }
          });
          // set the providerLabel
          ctrl.note.$$providerLabel = patientNotesFactory.SetProviderLabel(
            ctrl.note
          );
          // map note to VM when a new note
          $scope.noteVm = ctrl.mapClinicalNoteToVm(ctrl.note);
          // backup the original note
          ctrl.noteBackup(ctrl.note);
          if (
            $scope.noteVm.LockNotePriorTo24Hours ||
            _.isNil($scope.noteVm.AutomaticLockTime)
          ) {
            $scope.allowProviderEditing = false;
          } else {
            $scope.allowProviderEditing = true;
          }
          patientNotesFactory.setDataChanged(false);
        });
    };

    //#endregion
    $scope.resetData = function () {
      patientNotesFactory.EditMode = false;
      $scope.confirmCancel();
    };

    // set datachanged when note changes
    $scope.$watch(
      'noteVm',
        function (nv, ov) {            
        if (
          nv &&
            ov &&
            nv !== ov &&
          ctrl.originalNote &&
            (richTextSanitizerService.sanitizeRichText(ctrl.originalNote.Note) !== nv.Note ||
                ctrl.originalNote.NoteTitle !== nv.NoteTitle) &&
          !$scope.savingNote
        ) {
          patientNotesFactory.setDataChanged(true);
          ctrl.registerControllerHasChanges();
        }
      },
      true
    );

    // listening for changes discardChangesService.HasChanges
    $scope.$watch(
      function () {
        return discardChangesService.currentChangeRegistration;
      },
      function (nv) {
        if (nv && nv.hasChanges === false) {
          patientNotesFactory.setDataChanged(false);
        }
      },
      true
    );

    ctrl.registerController = function () {
      discardChangesService.onRegisterController({
        controller: 'PatientNotesCrudController',
        hasChanges: false,
      });
    };

    ctrl.registerControllerHasChanges = function () {
      discardChangesService.onRegisterController({
        controller: 'PatientNotesCrudController',
        hasChanges: true,
      });
    };

    // set note to activeNote when changes
    $scope.activeNote = patientNotesFactory.ActiveNote;
    $scope.$watch(
      function () {
        return patientNotesFactory.ActiveNote;
      },
      function (nv, ov) {
        // if activeNote is null, do nothing
        if (!_.isEmpty(nv)) {
          // reset templateSelected when new note
          $scope.templateSelected = false;
          $scope.noteProviderLabel = 'Created by: ';
          var noteTemp = angular.copy(nv);
          // get a fresh copy of the note, this is an existing note
          if (noteTemp && noteTemp.NoteId != null) {
            ctrl.getNote(noteTemp);
            $scope.editMode = false;
          } else {
            // this is a new note
            ctrl.note = noteTemp;
            $scope.allowProviderEditing = true;
            ctrl.note.AssignedProviderId =
              $rootScope.patAuthContext.userInfo.userid;
            $scope.editMode = true;
            // if note does not have PatientId set it to route personId
            if (
              ctrl.note &&
              (ctrl.note.PatientId === null ||
                ctrl.note.PatientId === '' ||
                ctrl.note.PatientId === undefined)
            ) {
              ctrl.note.PatientId = $scope.personId;
            }
            // add user display name and professional designation to a new note
            ctrl.note.$$DisplayNameAndDesignation = patientNotesFactory.getNameAndDesignation(
              ctrl.note
            );
            // map note to VM when a new note
            $scope.noteVm = ctrl.mapClinicalNoteToVm(ctrl.note);
            // backup the original note
            ctrl.noteBackup(ctrl.note);
          }
          $scope.collapseTemplates = true;
          $scope.selectedTemplate = null;
        }
      }
    );

    //#region Delete Note

    ctrl.noteMarkedForDeletion = null;
    $scope.deleteNote = function (note) {
      if (ctrl.authAccess.Delete === true) {
        if (note.NoteId) {
          // merge changes back to original note
          ctrl.mapVmToClinicalNote(ctrl.note, note);
          ctrl.noteMarkedForDeletion = angular.copy(ctrl.note);
          modalFactory
            .DeleteModal('note ', note.NoteTitle, true)
            .then(ctrl.confirmDelete);
        }
      }
    };

    ctrl.confirmDelete = function () {
      patientNotesFactory
        .deleteNote(ctrl.noteMarkedForDeletion)
        .then(function (res) {
          if ($scope.onSave) {
            $scope.onSave();
          }
        });
    };

    //#endregion

    //#region finalize a new note

    ctrl.lockChecked = false;
    $scope.checkLockAndSave = function (finishNote) {
      if (
        !finishNote &&
        ($scope.noteVm.AutomaticLockTime !== null || !$scope.noteVm.NoteId)
      ) {
        $scope.validNote = patientNotesFactory.validateNote($scope.noteVm);
        if ($scope.validNote) {
          var message = localize.getLocalizedString(
            'If finalized, your note will become a legal record and will only be editable using strike-through editing.  '
          );
          var message2 = localize.getLocalizedString(
            'If you leave your note open, you will have 24 hours to make changes before it automatically locks.'
          );
          var title = localize.getLocalizedString(
            'Do you want to finalize this note now?'
          );
          var button1Text = localize.getLocalizedString('Yes, finalize now');
          var button2Text = localize.getLocalizedString(
            'No, leave open for 1 day'
          );
          if ($scope.noteVm.NoteId) {
            button2Text = localize.getLocalizedString('No, leave open');
          }
          var button3Text = localize.getLocalizedString('Cancel');
          modalFactory
            .ConfirmLockModal(
              title,
              message,
              message2,
              button1Text,
              button2Text,
              button3Text,
              $scope.noteVm
            )
            .then(ctrl.finalizeNote, ctrl.cancelSave);
        }
      } else {
        if (finishNote) {
          $scope.noteVm.LockNotePriorTo24Hours = finishNote;
        }
        ctrl.lockChecked = true;
        ctrl.save();
      }
    };

    ctrl.finalizeNote = function (lock) {
      ctrl.lockChecked = true;
      $scope.noteVm.LockNotePriorTo24Hours = lock;
      ctrl.save();
    };

    ctrl.cancelSave = function () {
      ctrl.lockChecked = false;
      $scope.noteVm.LockNotePriorTo24Hours = false;
    };

    //#endregion

    //#region selected template

    $scope.selectedTemplate = null;
    $scope.templateSelected = false;
    $scope.$watch(
      function () {
        return noteTemplatesHttpService.ActiveNoteTemplate;
      },
      function (nv, ov) {
        if (nv) {
          $scope.selectedTemplate = nv.Template;
          $scope.templateSelected = true;
          ctrl.registerControllerHasChanges();
        } else {
          if (
            $scope.noteVm &&
            ctrl.originalNote &&
            ctrl.originalNote.Note === $scope.noteVm.Note &&
            ctrl.originalNote.NoteTitle === $scope.noteVm.NoteTitle
          ) {
            discardChangesService.currentChangeRegistration.hasChanges = false;
          }
        }
      }
    );

    //#endregion

    //#teeth selection

    $scope.$on('tooth-selection-save', function (event, toothSelection) {
      $scope.noteVm.IndividualToothNumbers = [];
      angular.forEach(toothSelection, function (tooth) {
        $scope.noteVm.IndividualToothNumbers.push(tooth.USNumber.toString());
      });
      patientNotesFactory.setDataChanged(true);
      ctrl.registerControllerHasChanges();
    });

    $scope.$on('tooth-selection-ui-update', function (event, toothSelection) {
      $scope.noteVm.ToothNumbers = [];
      angular.forEach(toothSelection, function (tooth) {
        $scope.noteVm.ToothNumbers.push(tooth.TeethOrQuadrant);
      });
    });

    $scope.getToothNumbers = function (note) {
      let toothNumbers = '';
      let selectedTeeth = note.IndividualToothNumbers || note.ToothNumbers || [];

      let selectedTeethObjects = ctrl.teethDefinitions.filter(function (tooth) {
        return selectedTeeth.includes(tooth.USNumber.toString());
      });

      let groupedTeeth = selectedTeethObjects.reduce(function (acc, tooth) {
        (acc[tooth.QuadrantName] = acc[tooth.QuadrantName] || []).push(tooth);
        return acc;
      }, {});

      Object.keys(groupedTeeth).forEach(function (quadrantName) {
        let teeth = groupedTeeth[quadrantName];

        if (teeth.length % 16 === 0 || teeth.length % 10 === 0) {
          toothNumbers += getAbbreviatedQuadrant(quadrantName) + ', ';
          delete groupedTeeth[quadrantName];
        }
      });

      Object.values(groupedTeeth).forEach(function (teeth) {
        teeth.forEach(function (tooth) {
          toothNumbers += tooth.USNumber + ', ';
        });
      });

      toothNumbers = toothNumbers.substring(0, toothNumbers.length - 2);

      return toothNumbers;
    }

    function getAbbreviatedQuadrant(quadrant) {
      let words = quadrant.split(' ');
      return words.map(function (word) {
        return word.charAt(0);
      }).join('');
    }
    //#endregion

    // getting the teeth list from the factory
    ctrl.getTeethDefinitions = function () {
      staticData.TeethDefinitions().then(function (res) {
        if (res && res.Value && res.Value.Teeth) {
          ctrl.teethDefinitions = res.Value.Teeth;
        }
      });
    };

    //#region handle template

    $scope.onFinishTemplate = function () {
      $scope.templateSelected = false;
      $scope.selectedTemplate = null;
    };
    //#endregion

    //#region print note
    ctrl.storageId;
    $scope.printNote = function () {
      var filteredNotes = [];
      // merge changes back to original note before printing
      ctrl.mapVmToClinicalNote(ctrl.note, $scope.noteVm);
      // add note to filtered notes
      filteredNotes.push(ctrl.note);
      // if note does not have PatientId set it to route personId
      if (
        ctrl.note.PatientId === null ||
        ctrl.note.PatientId === '' ||
        ctrl.note.PatientId === undefined
      ) {
        ctrl.note.PatientId = $scope.personId;
      }
      if (ctrl.authAccess.View) {
        // generate a unique id to tag the storage item with
        ctrl.storageId = Math.floor(Math.random() * 1000000);
        var storageItem = {
          DateFrom: null,
          DateTo: null,
          Notes: filteredNotes,
        };
        localStorage.setItem(
          'clinicalNotes_' + ctrl.storageId,
          JSON.stringify(storageItem)
        );
        let patientPath = '#/Patient/';
        let encodedstorageId = encodeURIComponent(ctrl.storageId.toString());
        let encodedPatientId = encodeURIComponent(ctrl.note.PatientId);
        tabLauncher.launchNewTab(
          patientPath +
            encodedPatientId +
            '/Clinical/PrintNotes/' +
            encodedstorageId
        );
      }
    };
    //#endregion
    $scope.lastNoteAction = '';
    ctrl.setNoteAction = function (note) {
      $scope.lastNoteAction = 'last update by ';
      if (note.StatusTypeId === 3) {
        $scope.lastNoteAction = 'deleted by ';
      } else if (note.NoteTypeId === 5) {
        $scope.lastNoteAction = '';
      }
    };

    //#region mapping

    ctrl.mapClinicalNoteToVm = function (note) {
      if (!_.isEmpty(note)) {
          let sanitizedNote = ctrl.sanitizeNote(note.Note);            

        return {
          NoteId: note.NoteId,
          NoteTitle: note.NoteTitle,
          AutomaticLockTime: note.AutomaticLockTime,
          $$DisplayNameAndDesignation: note.$$DisplayNameAndDesignation,
          $$OriginalCreatedDate: note.$$OriginalCreatedDate,
          LockNotePriorTo24Hours: note.LockNotePriorTo24Hours,
          CreatedDate: note.CreatedDate,
          $$providerLabel: note.$$providerLabel,
          CreatedByName: note.CreatedByName,
          $$CreatedByProfessionalDesignation: note.$$CreatedByProfessionalDesignation,
          Note: sanitizedNote,
          StatusTypeId: note.StatusTypeId,
          NoteTypeId: note.NoteTypeId,
          ToothNumbers: note.ToothNumbers,
          histories: note.histories,
          AssignedProviderId: note.AssignedProviderId,
        };
      } else {
        return note;
      }
    };


    ctrl.sanitizeNote = function (note) {          
      return richTextSanitizerService.sanitizeRichText(note);         
    };

    // load changes back to original note
    ctrl.mapVmToClinicalNote = function (originalNote, noteVm) {
      if (!_.isEmpty(originalNote) || !_.isEmpty(noteVm)) {
        originalNote.NoteTitle = noteVm.NoteTitle;
        originalNote.LockNotePriorTo24Hours = noteVm.LockNotePriorTo24Hours;
        originalNote.Note = noteVm.Note;
        originalNote.ToothNumbers = noteVm.ToothNumbers;
        originalNote.AssignedProviderId = noteVm.AssignedProviderId;
      }
    };

    //#endregion
  },
]);
