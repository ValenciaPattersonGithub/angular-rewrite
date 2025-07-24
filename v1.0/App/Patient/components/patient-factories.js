'use strict';

// Define Services
angular
  .module('Soar.Patient')
  .factory('ClinicalOverviewFactory', [
    'PatientServices',
    'userSettingsDataService',
    function (patientServices, userSettingsDataService) {
      var factory = {
        clinicalOverview: null,
        GetClinicalOverview: getClinicalOverview,
      };

      function getClinicalOverview(patientId) {
        var fctr = factory;

        return patientServices.ClinicalOverview.get({
          Id: patientId,
        }).$promise.then(function (res) {
          fctr.clinicalOverview = res.Value;
          return fctr.clinicalOverview;
        });
      }

      return factory;
    },
  ])

  .factory('ChartLedgerFactory', [
    'PatientServices',
    function (patientServices) {
      var factory = {
        chartLedger: null,
        GetChartLedger: getChartLedger,
        ProcessChartLedger: processChartLedger,
      };

      function getChartLedger(patientId) {
        var fctr = factory;
        return patientServices.ChartLedger.get({ Id: patientId }).$promise.then(
          function (res) {
            processChartLedger(res.Value);
            fctr.chartLedger = res.Value;
            return fctr.chartLedger;
          }
        );
      }

      function processChartLedger(ledgerData) {
        // tooth number strings converted to ints for sorting
        _.forEach(ledgerData, function (cls) {
          cls.Tooth = cls.Tooth === null ? '0' : cls.Tooth;
          cls.Tooth = !isNaN(cls.Tooth) ? parseInt(cls.Tooth) : cls.Tooth;
          // Area needs to encompass surfaces and roots and be sortable
          cls.Area = '';
          if (cls.Surfaces && cls.Surfaces.length > 0) {
            cls.Area = cls.Surfaces;
          } else if (cls.Roots && cls.Roots.length > 0) {
            cls.Area = cls.Roots;
          }
          if (cls.Fee === null) {
            cls.Fee = 0;
          }
          // modify for sorting
          cls.LocationName = cls.LocationName ? cls.LocationName : '';
        });
      }

      return factory;
    },
  ])

  .factory('PatientNotesFactory', [
    'PatientServices',
    '$filter',
    'localize',
    'ListHelper',
    '$q',
    'toastrFactory',
    '$timeout',
    'patSecurityService',
    function (
      patientServices,
      $filter,
      localize,
      listHelper,
      $q,
      toastrFactory,
      $timeout,
      patSecurityService
    ) {
      var factory = this;
      var clinicalNotes = [];
      var clinicalNote = {};
      var savedNote = {};
      var hasAccess = {
        Create: false,
        Delete: false,
        Edit: false,
        View: false,
      };
      

      // validate note
      var validateActiveNote = function (note) {
        if (
          note.Note &&
          note.Note !== '' &&
          note.NoteTypeId &&
          note.NoteTypeId != null &&
          note.StatusTypeId &&
          note.StatusTypeId !== null &&
          note.NoteTitle &&
          note.NoteTitle.length > 0
        ) {
          return true;
        } else {
          return false;
        }
      };

      // alert subscribers when the notes list changes
      var observers = [];
      var addToNotes = function (notes) {
        _.forEach(notes, function (note) {
          // remove Z if last character
          if (_.endsWith(note.AutomaticLockTime, 'Z')) {
            note.AutomaticLockTime = note.AutomaticLockTime.slice(0, -1);
          }
          var index = listHelper.findIndexByFieldValue(
            clinicalNotes,
            'NoteId',
            note.NoteId
          );
          if (index > -1) {
            clinicalNotes.splice(index, 1);
          }
        });
        angular.forEach(notes, function (note) {
          clinicalNotes.push(note);
        });
        angular.forEach(observers, function (observer) {
          observer(clinicalNotes);
        });
      };
      var removeFromNotes = function (note) {
        var index = listHelper.findIndexByFieldValue(
          clinicalNotes,
          'NoteId',
          note.NoteId
        );
        if (index > -1) {
          clinicalNotes.splice(index, 1);
        }
        angular.forEach(observers, function (observer) {
          observer(clinicalNotes);
        });
      };

    

      // get all notes
      var getAll = function (personId) {
        var defer = $q.defer();
        var promise = defer.promise;
        clinicalNotes = [];
        if (clinicalNotes.length === 0) {
          patientServices.ClinicalNotes.get({ Id: personId }).$promise.then(
            function (res) {
              clinicalNotes = res.Value;
              promise = $.extend(promise, { values: res.Value });
              defer.resolve(res);
            },
            function () {
              toastrFactory.error(
                localize.getLocalizedString(
                  'Failed to retrieve the list of {0}. Refresh the page to try again.',
                  ['Clinical Notes']
                ),
                localize.getLocalizedString('Server Error')
              );
            }
          );
        } else {
          $timeout(function () {
            promise = $.extend(promise, { values: clinicalNotes });
          }, 0);
        }
        return promise;
      };

      // get all rx maps
      var getAllRxMaps = function (personId) {
        var defer = $q.defer();
        var promise = defer.promise;
        patientServices.ClinicalNotes.getRxMaps({ Id: personId }).$promise.then(
          function (res) {
            promise = $.extend(promise, { values: res.Value });
            defer.resolve(res);
          },
          function (res) {
            promise = $.extend(promise, { values: res });
            defer.resolve(res);
          }
        );
        return promise;
      };

      // get a specific note by id (always get from datasource)
      var getById = function (personId, noteId) {
        var defer = $q.defer();
        var promise = defer.promise;
        patientServices.ClinicalNotes.get({
          Id: personId,
          NoteId: noteId,
        }).$promise.then(
          function (res) {
            clinicalNote = res.Value;
            promise = $.extend(promise, { values: res.Value });
            defer.resolve(res);
          },
          function () {
            toastrFactory.error(
              localize.getLocalizedString(
                'Failed to retrieve the {0}. Refresh the page to try again.',
                ['Clinical Note']
              ),
              localize.getLocalizedString('Server Error')
            );
          }
        );
        return promise;
      };
      // save new note or modified note
      var saveNote = function (note) {
        var defer = $q.defer();
        var promise = defer.promise;
        if (!note.NoteTitle && note.NoteTitle === '') {
          note.NoteTitle = localize.getLocalizedString('Clinical Note');
        }
        if (note.NoteId) {
          patientServices.ClinicalNotes.update(
            { Id: note.PatientId },
            note
          ).$promise.then(
            function (res) {
              toastrFactory.success(
                localize.getLocalizedString('Your note has been updated.'),
                localize.getLocalizedString('Success')
              );
              var savedNotes = res.Value;
              addToNotes(savedNotes);
              promise = $.extend(promise, { values: res.Value });
              defer.resolve(res);
            },
            function () {
              toastrFactory.error(
                localize.getLocalizedString(
                  'Save was unsuccessful. Please retry your save.'
                ),
                localize.getLocalizedString('Server Error')
              );
            }
          );
        } else {
          let noteToAdd = _.cloneDeep(note);
          delete noteToAdd.NoteId;
          patientServices.ClinicalNotes.create(
            { Id: note.PatientId },
            noteToAdd
          ).$promise.then(
            function (res) {
              toastrFactory.success(
                localize.getLocalizedString('Your note has been created.'),
                localize.getLocalizedString('Success')
              );
              savedNote = [];
              savedNote.push(res.Value);
              addToNotes(savedNote);
              promise = $.extend(promise, { values: res.Value });
              defer.resolve(res);
            },
            function () {
              toastrFactory.error(
                localize.getLocalizedString(
                  'Save was unsuccessful. Please retry your save.'
                ),
                localize.getLocalizedString('Server Error')
              );
            }
          );
        }
        return promise;
      };

      // create new rx note
      var createRxNote = function (note, rxId, rxMapId) {
        var defer = $q.defer();
        var promise = defer.promise;
        patientServices.ClinicalNotes.createRxNote(
          { Id: note.PatientId, rxId, rxMapId },
          note
        ).$promise.then(
          function (res) {
            promise = $.extend(promise, { values: res.Value });
            defer.resolve(res);
          },
          function (res) {
            promise = $.extend(promise, { values: res });
            defer.resolve(res);
          }
        );
        return promise;
      };

      var deleteActiveNote = function (note) {
        var defer = $q.defer();
        var promise = defer.promise;
        patientServices.ClinicalNotes.markDeleted({
          Id: note.PatientId,
          NoteId: note.NoteId,
        }).$promise.then(
          function (res) {
            var deletedNotes = res.Value;
            promise = $.extend(promise, { values: res });
            defer.resolve(res);
            // update the list on a soft delete and remve on hard delete...
            if (note && note.NoteId !== null) {
              if (factory.noteIsLocked(note)) {
                // set status id to 3 and addToNotes
                addToNotes(deletedNotes);
              } else {
                // remove from notes
                removeFromNotes(note);
              }
            }
            toastrFactory.success(
              localize.getLocalizedString('Delete successful.'),
              localize.getLocalizedString('Success')
            );
          },
          function () {
            toastrFactory.error(
              localize.getLocalizedString(
                'Failed to delete the {0}. Please try again.',
                ['Clinical Note']
              ),
              localize.getLocalizedString('Server Error')
            );
          }
        );
        return promise;
      };

      // determine if the note is locked
      factory.noteIsLocked = function (note) {
        var result;
        /* Added 'Z' to fix time in IE and Firefox. * The 'Z' indicates UTC time. */
        var createdDate =
          note.CreatedDate.lastIndexOf('Z') === note.CreatedDate.length - 1
            ? new Date(note.CreatedDate)
            : new Date(note.CreatedDate + 'Z');
        var windowExpires = createdDate.getTime() + 86400000;
        var now = new Date();
        return windowExpires < now.getTime() || note.LockNotePriorTo24Hours
          ? true
          : false;
      };

      factory.getProviderLabel = function (note) {
        var providerLabel = '';
        if (note) {
          providerLabel = 'Created by: ';
          var isLocked = factory.noteIsLocked(note);
          if (isLocked && note.StatusTypeId === 2) {
            providerLabel = 'Updated by: ';
          }
          if (note.StatusTypeId === 3) {
            providerLabel = 'Deleted by: ';
          }
          if (note.NoteTypeId === 5) {
            providerLabel = '';
          }
        }
        return providerLabel;
      };

      factory.loadClinicalNotes = function (notes) {
        if (authViewAccess) {
          clinicalNotes = notes;
          // notify observers when list changes
          angular.forEach(observers, function (observer) {
            observer(clinicalNotes);
          });
          return clinicalNotes;
        }
      };
      //#region authentication

      var authCreateAccess = function () {
        return patSecurityService.IsAuthorizedByAbbreviation(
          'soar-clin-cnotes-add'
        );
      };

      var authDeleteAccess = function () {
        return patSecurityService.IsAuthorizedByAbbreviation(
          'soar-clin-cnotes-delete'
        );
      };

      var authEditAccess = function () {
        return patSecurityService.IsAuthorizedByAbbreviation(
          'soar-clin-cnotes-edit'
        );
      };

      var authViewAccess = function () {
        return patSecurityService.IsAuthorizedByAbbreviation(
          'soar-clin-cnotes-view'
        );
      };

      var authAccess = function () {
        if (!authViewAccess()) {
        } else {
          hasAccess.Create = authCreateAccess();
          hasAccess.Delete = authDeleteAccess();
          hasAccess.Edit = authEditAccess();
          hasAccess.View = true;
        }
        return hasAccess;
      };

      //#endregion

      return {
        // get all note template categories
        access: function () {
          return authAccess();
        },
        getNotesList: function () {
          return clinicalNotes;
        },
        getById: function (personId, noteId) {
          return getById(personId, noteId);
        },
        // get all notes
        get: function (personId) {
          return getAll(personId);
        },
        load: function (notes) {
          return factory.loadClinicalNotes(notes);
        },
        clearCached: function () {
          clinicalNotes = [];
        },
        // get all rx maps
        getAllRxMaps: function (personId) {
          return getAllRxMaps(personId);
        },
        // save a note
        save: function (note) {
          return saveNote(note);
        },
        // create rx note
        createRxNote: function (note, rxId, rxMapId) {
          return createRxNote(note, rxId, rxMapId);
        },
        // validate note
        validateNote: function (note) {
          return validateActiveNote(note);
        },
        deleteNote: function (note) {
          return deleteActiveNote(note);
        },
        // DataChanged
        DataChanged: false,
        setDataChanged: function (dataHasChanged) {
          this.DataChanged = dataHasChanged;
          return this.DataChanged;
        },
        // Preview Note
        PreviewNote: null,
        setPreviewNote: function (note) {
          this.PreviewNote = note;
          return this.PreviewNote;
        },
        // Editmode
        EditMode: false,
        setEditMode: function (editMode) {
          this.EditMode = editMode;
          return this.EditMode;
        },
        // NewNote
        NewNote: {
          NoteId: null,
          PatientId: null,
          Note: '',
          NoteTitle: 'Clinical Note',
          Id: null,
          ToothNumbers: [],
          StatusTypeId: 1,
          NoteTypeId: 3,
          Date: new Date(),
        },
        // ActiveNote
        ActiveNote: null,
        setActiveNote: function (note) {
          this.ActiveNote = null;
          this.ActiveNote = note;
          // always reset editMode and dataChanged when changing active note
          this.setEditMode(false);
          this.setDataChanged(false);
          return this.ActiveNote;
        },
        // get note name and designation
        getNameAndDesignation: function (note) {
          if (note && note.NoteTypeId === 5) {
            return localize.getLocalizedString('System generated');
          } else {
            return note != null && note.CreatedByName
              ? note.CreatedByProfessionalDesignation
                ? note.CreatedByName +
                  ', ' +
                  note.CreatedByProfessionalDesignation
                : note.CreatedByName
              : '';
          }
        },
        mapClinicalNotesToVm: function (notes) {
          var clinicalNotesVm = _.map(notes, function (note) {
            return {
              NoteId: note.NoteId,
              NoteTitle: note.NoteTitle,
              $$DisplayNameAndDesignation: note.$$DisplayNameAndDesignation,
              $$OriginalCreatedDate: note.$$OriginalCreatedDate,
              LockNotePriorTo24Hours: note.LockNotePriorTo24Hours,
              CreatedDate: note.CreatedDate,
              $$providerLabel: note.$$providerLabel,
              CreatedByName: note.CreatedByName,
              $$CreatedByProfessionalDesignation:
                note.$$CreatedByProfessionalDesignation,
              Note: note.Note,
              StatusTypeId: note.StatusTypeId,
              NoteTypeId: note.NoteTypeId,
              ToothNumbers: note.ToothNumbers,
              AutomaticLockTime: note.AutomaticLockTime,
              PatientId: note.PatientId,
            };
          });
          return clinicalNotesVm;
        },
        // set active note to a new note
        setActiveNewNote: function () {
          this.ActiveNote = {
            NoteId: null,
            PatientId: null,
            Note: '',
            NoteTitle: 'Clinical Note',
            Id: null,
            ToothNumbers: [],
            StatusTypeId: 1,
            NoteTypeId: 3,
            Date: new Date(),
          };
          // always reset editMode and dataChanged when changing active note
          this.setEditMode(false);
          this.setDataChanged(false);
          return this.ActiveNote;
        },
        NoteIsLocked: factory.noteIsLocked,
        SetProviderLabel: factory.getProviderLabel,
        // subscribe to notes list changes
        observeNotes: function (observer) {
          observers.push(observer);
        },
      };
    },
  ])
  .factory('TreatmentPlansApiFactory', [
    'TreatmentPlansApiService',
    function (treatmentPlansApiService) {
      var factory = {
        treatmentPlansAndServices: null,
        getTreatmentPlansWithSevices: getTreatmentPlansWithSevices,
      };

      function getTreatmentPlansWithSevices(patientId) {
        var fctr = factory;
        return treatmentPlansApiService
          .getTreatmentPlansWithServices(patientId)
          .then(function (resp) {
            // any business type post-processing on response data goes here
            fctr.treatmentPlansAndServices = resp;
            return fctr.treatmentPlansAndServices;
          });
      }

      return factory;
    },
  ])
  .factory('PatientAppointmentsByClassificationFactory', [
    'PatientServices',
    '$filter',
    'localize',
    'ListHelper',
    '$q',
    'toastrFactory',
    '$timeout',
    'patSecurityService',
    function (
      patientServices,
      $filter,
      localize,
      listHelper,
      $q,
      toastrFactory,
      $timeout,
      patSecurityService
    ) {
      var lastPromise = {};
      var lastUsedParams = { classification: null };
      var appointmentsByClassification = function (params) {
        if (lastUsedParams.classification != params.classification) {
          var defer = $q.defer();
          var promise = defer.promise;

          patientServices.PatientAppointment.AppointmentsByClassification(
            params
          ).$promise.then(
            function (res) {
              var list = res.Value;
              promise = $.extend(promise, {
                values: list,
              });
              defer.resolve(res);
              resetLastUsedParams();
            },
            function () {
              toastrFactory.error(
                localize.getLocalizedString(
                  'Failed to retrieve the list of {0}. Refresh the page to try again',
                  ['Appointments']
                ),
                localize.getLocalizedString('Server Error')
              );
              resetLastUsedParams();
            }
          );
          lastUsedParams = params;
          lastPromise = promise;
          return lastPromise;
        } else {
          return lastPromise;
        }
      };
      var resetLastUsedParams = function () {
        $timeout(function () {
          lastUsedParams = { classification: null };
        }, 5000);
      };

      return {
        AppointmentsByClassification: function (params) {
          return appointmentsByClassification(params);
        },
      };
    },
  ])
  .constant('ExamState', {
    EditMode: 'EditMode',
    None: 'None',
    Cancel: 'Cancel',
    Continue: 'Continue',
    Start: 'Start',
    Save: 'Save',
    SaveComplete: 'SaveComplete',
    Initializing: 'Initializing',
    Loading: 'Loading',
    ViewMode: 'ViewMode',
  })
  .factory('PatientLogic', [
    'PatientServices',
    'toastrFactory',
    'localize',
    function (patientServices, toastrFactory, localize) {
      var patientLogic = {};

      // #region GetPatientById

      patientLogic.GetPatientById = function (patientId) {
        return patientServices.Patients.get({
          Id: patientId,
        }).$promise.then(GetPatientByIdSuccess, GetPatientByIdFailed);
      };

      var GetPatientByIdSuccess = function (result) {
        return result.Value;
      };

      var GetPatientByIdFailed = function () {
        toastrFactory.error(
          localize.getLocalizedString(
            'Failed to retrieve the {0}. Please try again.',
            ['patient']
          ),
          'Error'
        );
      };

      // #endregion

      // #region StoredPatient

      var storedPatient = null;

      patientLogic.SetStoredPatient = function (patient) {
        storedPatient = angular.copy(patient);
      };

      patientLogic.GetStoredPatient = function (clearStoredPatient) {
        var returnPatient = angular.copy(storedPatient);

        if (clearStoredPatient) {
          patientLogic.ClearStoredPatient();
        }

        return angular.copy(returnPatient);
      };

      patientLogic.ClearStoredPatient = function () {
        storedPatient = null;
      };

      // name formatter
      patientLogic.GetFormattedName = function (patient) {
        var formattedName = patient.LastName + ', ' + patient.FirstName;
        formattedName = patient.MiddleName
          ? formattedName.concat(' ' + patient.MiddleName + ',')
          : formattedName;
        formattedName = patient.Suffix
          ? formattedName.concat(' ' + patient.Suffix)
          : formattedName;
        formattedName = formattedName.concat(' (' + patient.PatientCode + ')');
        return formattedName;
      };

      // #endregion
      return patientLogic;
    },
  ])
  .factory('PatientPreventiveCareFactory', [
    'PatientServices',
    '$filter',
    'localize',
    '$q',
    'toastrFactory',
    '$timeout',
    'patSecurityService',
    'ListHelper',
    'referenceDataService',
    'FuseFlag',
    'FeatureFlagService',
    /**
     * @param {*} patientServices
     * @param {ng.IFilterService} $filter
     * @param {*} localize
     * @param {ng.IQService} $q
     * @param {*} toastrFactory
     * @param {ng.ITimeoutService} $timeout
     * @param {*} patSecurityService
     * @param {*} listHelper
     * @param {{ getData: (token: string) => angular.IPromise<any>; }} referenceDataService
     * @param {*} fuseFlag
     * @param {*} featureFlagService
     * @returns
     */
    function (
      patientServices,
      $filter,
      localize,
      $q,
      toastrFactory,
      $timeout,
      patSecurityService,
      listHelper,
      referenceDataService,
      fuseFlag,
      featureFlagService
    ) {
      var factory = this;

      factory.usePracticesForPreventiveServicesOverview = false;
      featureFlagService.getOnce$(fuseFlag.UsePracticeApiForPreventiveServicesOverview).subscribe((value) => {
        factory.usePracticesForPreventiveServicesOverview = value;
      });
      //#region vars

      factory.cachedPatientId = null;
      factory.cachedPatientPreventiveCareList = [];
      factory.cachedPatientPreventiveCareOverrides = [];
      factory.dateToday = new Date();
      factory.dateToday.setHours(0, 0, 0, 0);

      //#endregion

      //#region authorization

      factory.authorization = function () {
        factory.hasServicesDueViewAccess = patSecurityService.IsAuthorizedByAbbreviation(
          'soar-per-perps-view'
        );
        factory.hasOverridesViewAccess = patSecurityService.IsAuthorizedByAbbreviation(
          'soar-per-perps-vovr'
        );
        factory.hasOverridesEditAccess = patSecurityService.IsAuthorizedByAbbreviation(
          'soar-per-perps-aovr'
        );
      };

      factory.authorization();

      //#endregion

      //#region helpers

      // coloring classes
      factory.getModifierClass = function (exam, textOnly) {
        if (exam) {
          var cssClass;
          if (exam.PercentTimeRemaining <= 20) {
            cssClass = textOnly
              ? 'patientPrevCare__error'
              : 'progress-bar-danger';
          } else if (
            exam.PercentTimeRemaining > 20 &&
            exam.PercentTimeRemaining < 50
          ) {
            cssClass = textOnly
              ? 'patientPrevCare__warning'
              : 'progress-bar-warning';
          } else if (exam.PercentTimeRemaining >= 50) {
            cssClass = textOnly
              ? 'patientPrevCare__success'
              : 'progress-bar-success';
          }
          return cssClass;
        }
      };

      // converting to date and setting hours to 00:00:00
      factory.convertToDate = function (dateString) {
        var date = dateString;
        if (dateString) {
          date = new Date(dateString);
          date = date.setHours(0, 0, 0, 0);
        }
        return date;
      };

      // adding custom properties to services due object
      factory.setCustomPropertiesForServicesDue = function (exam, textOnly) {
        exam.DaysSinceLast =
          exam.DaysSinceLast === null ? 0 : exam.DaysSinceLast;
        exam.DaysUntilDue =
          exam.DaysUntilDue === null ? '00' : exam.DaysUntilDue;
        exam.PercentTimeRemaining =
          exam.PercentTimeRemaining === null ? NaN : exam.PercentTimeRemaining;
        var dateLabel =
          exam.PercentTimeRemaining === 0 ? 'Past Due Since' : 'Due After';
        exam.$$DateLabel = localize.getLocalizedString(dateLabel);
        exam.$$Class = factory.getModifierClass(exam, textOnly);
        // for sorting
        switch (exam.PreventiveServiceTypeDescription) {
          case 'Exam':
            exam.$$Index = 0;
            break;
          case 'Prophy/Perio Maint.':
            exam.$$Index = 1;
            break;
          case 'Bitewings':
            exam.$$Index = 2;
            break;
          case 'FMX/Pano':
            exam.$$Index = 3;
            break;
          case 'Fluoride':
            exam.$$Index = 4;
            break;
        }
      };

      //#endregion

      //#region api calls

      // getting the preventive care services due list for patient
      factory.getAllServicesDue = function (patientId, refreshList) {
        var defer = $q.defer();
        var promise = defer.promise;
        if (factory.hasServicesDueViewAccess) {
          if (patientId === factory.cachedPatientId && !refreshList) {
            // if the cached patient id matches the one passed in and refreshList is false, give them the cached version
            promise = $.extend(promise, {
              values: factory.cachedPatientPreventiveCareList.Value,
            });
            defer.resolve(factory.cachedPatientPreventiveCareList);
          } else {
            // getting the latest version of the list from the api
            patientServices.PreventiveCare.getAllServicesDue({
              Id: patientId,
            }).$promise.then(
              function (res) {
                promise = $.extend(promise, {
                  values: res.Value,
                });
                defer.resolve(res);
                factory.cachedPatientPreventiveCareList = res;
                factory.cachedPatientId = patientId;
              },
              function () {
                toastrFactory.error(
                  localize.getLocalizedString(
                    'Failed to retrieve the list of {0}. Refresh the page to try again.',
                    ['Preventive Care Items']
                  ),
                  localize.getLocalizedString('Error')
                );
                defer.reject();
              }
            );
          }
        }
        return promise;
      };

      // getting the preventive care services due list for account
      factory.getAllServicesDueForAccount = function (patientId) {
        var defer = $q.defer();
        var promise = defer.promise;
        if (factory.hasServicesDueViewAccess) {
          patientServices.PreventiveCare.getAllServicesDueForAccount({
            Id: patientId,
          }).$promise.then(
            function (res) {
              promise = $.extend(promise, { values: res.Value });
              defer.resolve(res);
            },
            function () {
              toastrFactory.error(
                localize.getLocalizedString(
                  'Failed to retrieve the list of {0}. Refresh the page to try again.',
                  ['Preventive Care Items']
                ),
                localize.getLocalizedString('Error')
              );
              defer.reject();
            }
          );
        }
        return promise;
      };

      // getting the preventive care overrides for patient
      factory.getAllOverrides = function (patientId, refreshList) {
        var defer = $q.defer();
        var promise = defer.promise;
        if (factory.hasOverridesViewAccess) {
          if (patientId === factory.cachedPatientId && !refreshList) {
            // if the cached patient id matches the one passed in and refreshList is false, give them the cached version
            promise = $.extend(promise, {
              values: factory.cachedPatientPreventiveCareOverrides.Value,
            });
            defer.resolve(factory.cachedPatientPreventiveCareOverrides);
          } else {
            // getting the latest version of the list from the api
            patientServices.PreventiveCare.getAllOverrides({
              Id: patientId,
            }).$promise.then(
              function (res) {
                promise = $.extend(promise, {
                  values: res.Value,
                });
                defer.resolve(res);
                factory.cachedPatientPreventiveCareOverrides = res;
                factory.cachedPatientId = patientId;
              },
              function () {
                toastrFactory.error(
                  localize.getLocalizedString(
                    'Failed to retrieve the list of {0}. Refresh the page to try again.',
                    ['Preventive Care Overrides']
                  ),
                  localize.getLocalizedString('Error')
                );
              }
            );
          }
        }
        return promise;
      };

      // updating the preventive care overrides for patient
      factory.updateOverrides = function (patientId, overrides) {
        var defer = $q.defer();
        var promise = defer.promise;
        if (factory.hasOverridesEditAccess) {
          if (patientId === factory.cachedPatientId) {
            patientServices.PreventiveCare.updateOverrides(
              {
                Id: patientId,
              },
              overrides
            ).$promise.then(
              function (res) {
                toastrFactory.success(
                  localize.getLocalizedString('{0} have been updated.', [
                    'Preventive Care Overrides',
                  ]),
                  localize.getLocalizedString('Success')
                );
                promise = $.extend(promise, {
                  values: res.Value,
                });
                defer.resolve(res);
              },
              function () {
                toastrFactory.error(
                  localize.getLocalizedString(
                    'Failed to update the list of {0}. Refresh the page to try again.',
                    ['Preventive Care Overrides']
                  ),
                  localize.getLocalizedString('Error')
                );
              }
            );
          }
        }
        return promise;
      };

      /**
       * Get preventative services overview
       *
       * @returns {angular.IPromise<any>}
       */
      factory.getPreventiveServicesOverview = function () {
        if (factory.hasServicesDueViewAccess) {
          if (factory.usePracticesForPreventiveServicesOverview) {
            return patientServices.PreventiveServicesOverview.Retrieve().$promise;
          } else {
            return referenceDataService.getData(
              referenceDataService.entityNames.preventiveServicesOverview
            );
          }
        }
        return $q.resolve(null);
      };

      // TODO break this up a little?
      /**
       *
       * @param {*} res
       * @returns {angular.IPromise<any>}
       */
      factory.processPreventiveServices = function (res) {
        var defer = $q.defer();
        var promise = defer.promise;

        var patientPrevCareItems = res[0].Value;

        factory
          .getPreventiveServicesOverview()
          .then(preventiveServicesOverview => {
            if (factory.usePracticesForPreventiveServicesOverview) {
              for (let item of preventiveServicesOverview) {
                const matchingPrevCareItems = patientPrevCareItems.filter(i => i.PreventiveServiceTypeId == item.PreventiveServiceTypeId);
                if (matchingPrevCareItems.length > 0) {
                  const matchingPrevCareItem = matchingPrevCareItems[0];
                  item.DueDate = matchingPrevCareItem && Date.parse(matchingPrevCareItem.DateServiceDue)
                      ? new Date(matchingPrevCareItem.DateServiceDue)
                      : null;
                  item.LastPerformed = matchingPrevCareItem && Date.parse(matchingPrevCareItem.DateServiceLastPerformed)
                      ? new Date(matchingPrevCareItem.DateServiceLastPerformed)
                      : null;
                  item.IsTrumpService = matchingPrevCareItem.IsTrumpService;
                }
                item.AffectedAreaName = null;
                item.DrawTypeDescription = null;
                item.Modifications = [];
                item.SwiftPickServiceCodes = [];
                item.UsuallyPerformedByProviderTypeName = null;
              }
              // map exists because there are weird carry-over properties from the promise
              defer.resolve(preventiveServicesOverview?.map(o => o) ?? []);
            } else {
              var preventiveCareServices = [];
              var preventiveServiceTypes = [];
              var preventiveServices = [];
              var serviceCodes = [];

              if (!_.isNil(preventiveServicesOverview)) {
                preventiveServiceTypes =
                  preventiveServicesOverview.PreventiveServiceTypes;
                preventiveServices =
                  preventiveServicesOverview.PreventiveServices;
                serviceCodes = preventiveServicesOverview.ServiceCodes;
              }
              if (factory.hasServicesDueViewAccess) {
                // process patientPrevCareItems
                angular.forEach(patientPrevCareItems, function (exam) {
                  // add custom properties to patient preventive care
                  factory.setCustomPropertiesForServicesDue(exam, false);
                  exam.$$DateLabel =
                    exam.$$DateLabel === 'Due'
                      ? localize.getLocalizedString('Due After')
                      : exam.$$DateLabel;
                });

                // process preventiveServiceTypes
                angular.forEach(
                  preventiveServiceTypes,
                  function (preventiveServiceType) {
                    // get the patient preventive care item that matches the preventiveServiceTypes
                    var patientPreventiveCareItems = $filter('filter')(
                      patientPrevCareItems,
                      function (item) {
                        return (
                          item.PreventiveServiceTypeId ===
                          preventiveServiceType.PreventiveServiceTypeId
                        );
                      }
                    );

                    // if multiple, select the first
                    var patientPreventiveCareItem =
                      patientPreventiveCareItems.length > 0
                        ? patientPreventiveCareItems[0]
                        : null;

                    // get the preventiveService for this type
                    var prevServices = $filter('filter')(
                      preventiveServices,
                      function (svc) {
                        return (
                          svc.PreventiveServiceTypeId ===
                          preventiveServiceType.PreventiveServiceTypeId
                        );
                      }
                    );

                    // for each of these, add the service code information to the preventiveCareServices
                    angular.forEach(prevServices, function (preventiveService) {
                      var serviceCode = listHelper.findItemByFieldValue(
                        serviceCodes,
                        'ServiceCodeId',
                        preventiveService.ServiceCodeId
                      );
                      if (serviceCode) {
                        serviceCode.TypeOfService =
                          preventiveServiceType.Description;
                        serviceCode.Order = preventiveServiceType.Order;
                        serviceCode.DueDate =
                          patientPreventiveCareItem &&
                          Date.parse(patientPreventiveCareItem.DateServiceDue)
                            ? new Date(patientPreventiveCareItem.DateServiceDue)
                            : null;
                        serviceCode.LastPerformed =
                          patientPreventiveCareItem &&
                          Date.parse(
                            patientPreventiveCareItem.DateServiceLastPerformed
                          )
                            ? new Date(
                                patientPreventiveCareItem.DateServiceLastPerformed
                              )
                            : null;
                        serviceCode.IsTrumpService =
                          patientPreventiveCareItem.IsTrumpService;
                        preventiveCareServices.push(serviceCode);
                      }
                    });
                  }
                );
                defer.resolve(preventiveCareServices);
              }
            }
          });

        return promise;
      };

      factory.getPreventiveCareServices = function (patientId) {
        var defer = $q.defer();
        var promise = defer.promise;
        if (factory.hasServicesDueViewAccess) {
          var servicePromises = [factory.getAllServicesDue(patientId)];
          $q.all(servicePromises).then(function (res) {
            factory.processPreventiveServices(res).then(function (res) {
              promise = $.extend(promise, { values: res });
              defer.resolve(res);
            });
          });
        }
        return promise;
      };

      // method returns just theDateServiceDue of the trump service
      factory.getNextTrumpServiceDueDate = function (patientId) {
        var defer = $q.defer();
        var promise = defer.promise;
        if (factory.hasServicesDueViewAccess) {
          factory.getAllServicesDue(patientId, true).then(function (res) {
            if (res && res.Value) {
              var patientPrevCareItems = res.Value;
              var trumpService = _.find(patientPrevCareItems, {
                IsTrumpService: true,
              });
              var dueDate = _.isEmpty(trumpService)
                ? null
                : trumpService.DateServiceDue;
              defer.resolve({ Value: dueDate });
            }
          });
        }
        return promise;
      };

      //#endregion

      //#endregion

      return {
        PreventiveCareServices: function (patientId, includeServiceCodes) {
          return factory.getPreventiveCareServices(
            patientId,
            includeServiceCodes
          );
        },
        SetCustomPropertiesForServicesDue: function (exam, textOnly) {
          return factory.setCustomPropertiesForServicesDue(exam, textOnly);
        },

        GetAllServicesDue: function (patientId, refreshList) {
          return factory.getAllServicesDue(patientId, refreshList);
        },

        GetAllServicesDueForAccount: function (patientId) {
          return factory.getAllServicesDueForAccount(patientId);
        },

        GetAllOverrides: function (patientId, refreshList) {
          return factory.getAllOverrides(patientId, refreshList);
        },

        UpdateOverrides: function (patientId, overrides) {
          return factory.updateOverrides(patientId, overrides);
        },
        NextTrumpServiceDueDate: function (patientId) {
          return factory.getNextTrumpServiceDueDate(patientId);
        },
      };
    },
  ])
  .factory('PatientLandingFactory', [
    'toastrFactory',
    'patSecurityService',
    'localize',
    'PersonServices',
    '$q',
    'LocationServices',
    'UserServices',
    'ScheduleServices',
    '$filter',
    'ListHelper',
    'StaticData',
    'PatientServices',
    'TimeZoneFactory',
    '$location',
    function (
      toastrFactory,
      patSecurityService,
      localize,
      personServices,
      $q,
      locationServices,
      userServices,
      scheduleServices,
      $filter,
      listHelper,
      staticData,
      patientServices,
      timeZoneFactory,
      $location
    ) {
      var statuses = staticData.AppointmentStatuses();
      var factory = this;
      var uniqueProviderNames = [];
      var uniqueApptTypes = [];
      var uniqueProviderInTx = [];
      var uniquePatientsinTx = [];

      var hasAccess = {
        PatientView: false,
        PreventiveCareView: false,
        ScheduledAppointmentView: false,
        UnScheduledTreatmentView: false,
      };

      var uniquePreferredDentists = [];

      //#region authentication

      // view patient's access
      factory.authPatientViewAccess = function () {
        return patSecurityService.IsAuthorizedByAbbreviation(
          'soar-per-perdem-view'
        );
      };

      // view Preventive Care Access
      factory.authPreventiveCareViewAcess = function () {
        return patSecurityService.IsAuthorizedByAbbreviation(
          'soar-per-perps-view'
        );
      };

      // view scheduled appointment's access
      factory.authScheduledAppointmentViewAccess = function () {
        return patSecurityService.IsAuthorizedByAbbreviation(
          'soar-sch-sptapt-view'
        );
      };

      // view Unscheduled appointment's access
      factory.authUnScheduledAppointmentViewAccess = function () {
        return patSecurityService.IsAuthorizedByAbbreviation(
          'soar-sch-sunapt-view'
        );
      };

      // view Unscheduled treatment plan and patient benefit plan access
      factory.authUnScheduledTreatmentViewAccess = function () {
        if (
          patSecurityService.IsAuthorizedByAbbreviation(
            'soar-clin-cplan-view'
          ) &&
          patSecurityService.IsAuthorizedByAbbreviation('soar-ins-ibplan-view')
        ) {
          return true;
        } else {
          return false;
        }
      };

      // authenticate the access
      factory.authAccess = function () {
        if (
          !factory.authPatientViewAccess() &&
          !factory.authPreventiveCareViewAcess() &&
          !factory.authScheduledAppointmentViewAccess() &&
          !factory.authUnScheduledAppointmentViewAccess() &&
          !factory.authUnScheduledTreatmentViewAccess()
        ) {
          toastrFactory.error(
            patSecurityService.generateMessage('soar-per-perdem-view'),
            localize.getLocalizedString('Not Authorized')
          );
          event.preventDefault();
          $location.path(_.escape('/'));
        } else {
          hasAccess.PatientView = factory.authPatientViewAccess();
          hasAccess.PreventiveCareView = factory.authPreventiveCareViewAcess();
          hasAccess.ScheduledAppointmentView = factory.authScheduledAppointmentViewAccess();
          hasAccess.UnScheduledAppointmentView = factory.authUnScheduledAppointmentViewAccess();
          hasAccess.UnScheduledTreatmentView = factory.authUnScheduledTreatmentViewAccess();
        }
        return hasAccess;
      };

      //#endregion

      // get persons information based on location
      factory.getPersons = function (personObject) {
        return personServices.Persons.get(personObject).$promise;
      };

      // get locations
      factory.getLocations = function () {
        return locationServices.get({}).$promise;
      };

      // get providers collection
      factory.getProviders = function () {
        return userServices.Users.get({}).$promise;
      };

      // get appointments
      factory.retriveAppointments = function () {
        return patientServices.AppointmentPatientTab.get().$promise;
      };

      // convert into patient's objects
      factory.convertToPersonObjects = function (persons, providers) {
        uniquePreferredDentists.length = 0;
        var personsListForDisplay = [];
        angular.forEach(persons, function (psn) {
          var personForDisplay = {};
          personForDisplay.DisplayName = $filter(
            'getPatientNameAsPerBestPractice'
          )(psn.Profile);
          personForDisplay.DisplayNameForGlobalSearch =
            personForDisplay.DisplayName;
          personForDisplay.LastName = psn.Profile.LastName;
          personForDisplay.PatientCode = psn.Profile.PatientCode;
          personForDisplay.DateOfBirth =
            psn.Profile.DateOfBirth != null
              ? $filter('toShortDisplayDateUtc')(psn.Profile.DateOfBirth)
              : '';
          (personForDisplay.Age =
            psn.Profile.DateOfBirth != null
              ? '(Age: ' + $filter('age')(psn.Profile.DateOfBirth) + ')'
              : 'N/A'),
            (personForDisplay.PhoneNumber = '');
          personForDisplay.UnMaskedPhoneNumber = '';
          if (psn.Phones[0]) {
            personForDisplay.PhoneNumber = $filter('tel')(
              psn.Phones[0].PhoneNumber
            );
            personForDisplay.UnMaskedPhoneNumber = personForDisplay.PhoneNumber.replace(
              /[^\w]/gi,
              ''
            );
          }
          personForDisplay.PatientId = psn.Profile.PatientId;
          if (psn.Profile.PreferredDentist != null) {
            var preferredDentist = listHelper.findItemByFieldValue(
              providers,
              'UserId',
              psn.Profile.PreferredDentist
            );
            personForDisplay.PreferredDentist =
              preferredDentist.FirstName + ' ' + preferredDentist.LastName;
          } else {
            personForDisplay.PreferredDentist = 'N/A';
          }
          var findDentist = $filter('filter')(
            uniquePreferredDentists,
            { PreferredDentist: personForDisplay.PreferredDentist },
            true
          );
          if (findDentist.length === 0) {
            uniquePreferredDentists.push({
              PreferredDentist: personForDisplay.PreferredDentist,
            });
          }
          // Add IsActive to PersonObject
          personForDisplay.IsActive = psn.Profile.IsActive;
          personsListForDisplay.push(personForDisplay);
        });
        return personsListForDisplay;
      };

      //get preventive cares
      factory.getPreventiveCares = function () {
        return patientServices.PreventiveCareTab.get().$promise;
      };

      //convert into Preventive Care Objects
      factory.convertToPreventiveCareObjects = function (preventiveCares) {
        var personsListForDisplay = [];

        angular.forEach(preventiveCares, function (prc) {
          var personForDisplay = {};

          personForDisplay.DisplayName =
            prc.PatientSuffixName == null || !prc.PatientSuffixName
              ? prc.PatientLastName +
                ', ' +
                prc.PatientFirstName +
                ' ' +
                prc.PatientMiddleName
              : prc.PatientLastName +
                ' ' +
                prc.PatientSuffixName +
                ', ' +
                prc.PatientFirstName +
                ' ' +
                prc.PatientMiddleName;
          personForDisplay.LastName = prc.PatientLastName;
          personForDisplay.PatientId = prc.PatientId;
          personForDisplay.DisplayNameForGlobalSearch =
            personForDisplay.DisplayName;
          personForDisplay.DateOfBirth =
            prc.PatientDateOfBirth != null
              ? $filter('toShortDisplayDateUtc')(prc.PatientDateOfBirth)
              : null;
          personForDisplay.Age =
            prc.PatientDateOfBirth != null
              ? '(Age: ' + $filter('age')(prc.PatientDateOfBirth) + ')'
              : '';

          personForDisplay.LocationName = prc.PreferredLocationName;
          personForDisplay.LocationId = prc.PreferredLocationId;

          personForDisplay.PreferredDentistId = prc.PreferredDentist;
          personForDisplay.PreferredDentist =
            prc.PreferredDentist !== null
              ? prc.PreferredDentistFirstName +
                ' ' +
                prc.PreferredDentistLastName
              : 'N/A';

          personForDisplay.PreferredHygienistId = prc.PreferredHygienist;
          personForDisplay.PreferredHygienist =
            prc.PreferredHygienist != null
              ? prc.PreferredHygienistFirstName +
                ' ' +
                prc.PreferredHygienistLastName
              : 'N/A';

          personForDisplay.Groups = prc.Groups;
          personForDisplay.GroupsArray = prc.Groups;

          personForDisplay.ResponsiblePartyId = prc.ResponsiblePartyId;
          personForDisplay.ResponsibleParty =
            prc.ResponsiblePartySuffixName == null ||
            !prc.ResponsiblePartySuffixName
              ? prc.ResponsiblePartyLastName +
                ', ' +
                prc.ResponsiblePartyFirstName +
                ' ' +
                prc.ResponsiblePartyMiddleName
              : prc.ResponsiblePartyLastName +
                ' ' +
                prc.ResponsiblePartySuffixName +
                ', ' +
                prc.ResponsiblePartyFirstName +
                ' ' +
                prc.ResponsiblePartyMiddleName;

          personForDisplay.AccountId = prc.AccountId;
          personForDisplay.TreatmentAccountId = prc.TreatmentAccountId;

          personForDisplay.LastAppointmentId = prc.LastAppointmentId;
          personForDisplay.LastAppointment =
            prc.LastAppointmentDate != null ? prc.LastAppointmentDate : null;
          personForDisplay.LastAppointmentType = prc.LastAppointmentDescription;
          personForDisplay.LastAppointmentTimezone =
            prc.LastAppointmentTimezone;
          personForDisplay.NextAppointment =
            prc.NextAppointmentDate != null ? prc.NextAppointmentDate : null;
          personForDisplay.NextAppointmentId = prc.NextAppointmentId;
          personForDisplay.NextAppointmentType = prc.NextAppointmentDescription;
          personForDisplay.NextAppointmentTimezone =
            prc.NextAppointmentTimezone;

          personForDisplay.PreventiveCareAppointmentScheduled =
            prc.PreventiveCareAppointmentScheduled;
          personForDisplay.DueDate = $filter('date')(
            prc.PreventiveCareDueDate,
            'MM/dd/yyyy'
          );
          personForDisplay.DueDate =
            personForDisplay.DueDate != null
              ? new Date(personForDisplay.DueDate)
              : null;

          personForDisplay.DueInFuture = prc.DueInFuture;
          personForDisplay.DueLess30 = prc.DueLess30;
          personForDisplay.Due30 = prc.Due30;
          personForDisplay.Due60 = prc.Due60;
          personForDisplay.DueOver90 = prc.DueOver90;

          personForDisplay.TreatmentPlansCount = prc.TreatmentPlanCount;
          personForDisplay.TreatmentPlansTotal = prc.TreatmentPlanTotal;

          personForDisplay.LastCommunication = $filter('date')(
            prc.LastCommunication,
            'MM/dd/yyyy'
          );

          personsListForDisplay.push(personForDisplay);
        });
        personsListForDisplay = $filter('orderBy')(
          personsListForDisplay,
          ['DueDate', 'LastName'],
          false
        );
        return personsListForDisplay;
      };

      // get Treatment Plans
      factory.getTreatmentPlans = function () {
        return patientServices.TreatmentPlanTab.get().$promise;
      };

      // convert into Treatment Plan Objects
      factory.convertToTreatmentPlanObjects = function (treatmentPlans) {
        var personsListForDisplay = [];

        angular.forEach(treatmentPlans, function (prc) {
          var personForDisplay = {};

          personForDisplay.DisplayName =
            prc.PatientSuffixName == null || !prc.PatientSuffixName
              ? prc.PatientLastName +
                ', ' +
                prc.PatientFirstName +
                ' ' +
                prc.PatientMiddleName
              : prc.PatientLastName +
                ' ' +
                prc.PatientSuffixName.trim() +
                ', ' +
                prc.PatientFirstName +
                ' ' +
                prc.PatientMiddleName;
          personForDisplay.LastName = prc.PatientLastName;
          personForDisplay.PatientId = prc.PatientId;
          personForDisplay.DisplayNameForGlobalSearch =
            personForDisplay.DisplayName;
          personForDisplay.DateOfBirth =
            prc.PatientDateOfBirth != null
              ? $filter('toShortDisplayDateUtc')(prc.PatientDateOfBirth)
              : null;
          personForDisplay.Age =
            prc.PatientDateOfBirth != null
              ? '(Age: ' + $filter('age')(prc.PatientDateOfBirth) + ')'
              : '';

          personForDisplay.AccountId = prc.PersonAccountId;

          personForDisplay.LocationName = prc.PreferredLocationName;
          personForDisplay.LocationId = prc.PreferredLocationId;

          personForDisplay.PreferredDentistId = prc.PreferredDentist;
          personForDisplay.PreferredDentist =
            prc.PreferredDentist !== null
              ? prc.PreferredDentistFirstName +
                ' ' +
                prc.PreferredDentistLastName
              : 'N/A';

          personForDisplay.PreferredHygienistId = prc.PreferredHygienist;
          personForDisplay.PreferredHygienist =
            prc.PreferredHygienist != null
              ? prc.PreferredHygienistFirstName +
                ' ' +
                prc.PreferredHygienistLastName
              : 'N/A';

          personForDisplay.ResponsiblePartyId = prc.ResponsiblePartyId;
          personForDisplay.ResponsibleParty =
            prc.ResponsiblePartyId != null
              ? prc.ResponsiblePartySuffixName == null ||
                !prc.ResponsiblePartySuffixName
                ? prc.ResponsiblePartyLastName +
                  ' ' +
                  prc.ResponsiblePartyFirstName +
                  ' ' +
                  prc.ResponsiblePartyMiddleName
                : prc.ResponsiblePartyLastName +
                  ' ' +
                  prc.ResponsiblePartySuffixName.trim() +
                  ', ' +
                  prc.ResponsiblePartyFirstName +
                  ' ' +
                  prc.ResponsiblePartyMiddleName
              : 'N/A';

          personForDisplay.LastAppointmentId = prc.LastAppointmentId;
          personForDisplay.LastAppointment =
            prc.LastAppointmentDate != null ? prc.LastAppointmentDate : null;
          personForDisplay.LastAppointmentType = prc.LastAppointmentDescription;
          personForDisplay.LastAppointmentTimezone =
            prc.LastAppointmentTimezone;
          personForDisplay.NextAppointment =
            prc.NextAppointmentDate != null ? prc.NextAppointmentDate : null;
          personForDisplay.NextAppointmentId = prc.NextAppointmentId;
          personForDisplay.NextAppointmentType = prc.NextAppointmentDescription;
          personForDisplay.NextAppointmentTimezone =
            prc.NextAppointmentTimezone;

          personForDisplay.DueDate =
            prc.PreventiveCareDueDate != '0001-01-01T00:00:00'
              ? $filter('toShortDisplayDateUtc')(prc.PreventiveCareDueDate)
              : null;

          personForDisplay.TreatmentPlansCount = prc.TreatmentPlanCount;
          personForDisplay.TreatmentPlansTotal = prc.TreatmentPlanTotalBalance;
          personForDisplay.TreatmentPlanName = prc.TreatmentPlanName;
          personForDisplay.TreatmentPlanCreatedDateTime =
            prc.TreatmentPlanCreatedDate;
          personForDisplay.TreatmentPlanCreatedDate = $filter('date')(
            prc.TreatmentPlanCreatedDate,
            'MM/dd/yyyy'
          );
          personForDisplay.TreatmentPlanStatus = prc.TreatmentPlanStatus;
          personForDisplay.TreatmentPlanScheduled = prc.TreatmentPlanScheduled;
          personForDisplay.TreatmentPlanProviders = prc.TreatmentPlanProviders;
          personForDisplay.TreatmentPlanProvidersArray =
            prc.TreatmentPlanProviders;
          personForDisplay.TreatmentPlanId = prc.TreatmentPlanId;

          personForDisplay.LastCommunication = $filter('date')(
            prc.LastCommunication,
            'MM/dd/yyyy'
          );

          personsListForDisplay.push(personForDisplay);
        });

        return personsListForDisplay;
      };

      // Get Location by id
      factory.getLocationNameById = function (id, locations) {
        var ofcLocation = listHelper.findItemByFieldValue(
          locations,
          'LocationId',
          id
        );
        if (ofcLocation == null) {
          ofcLocation = '';
        }
        return ofcLocation;
      };

      // patient's best practice
      factory.getPersonName = function (person) {
        if (person)
          return (
            person.FirstName +
            (person.PreferredName != null && person.PreferredName != ''
              ? ' (' + person.PreferredName + ')'
              : '') +
            (person.MiddleName != null && person.MiddleName != ''
              ? ' ' + person.MiddleName + '.'
              : '') +
            ' ' +
            person.LastName +
            (person.SuffixName != null && person.SuffixName != ''
              ? ', ' + person.SuffixName
              : '')
          );
        else return '';
      };

      // Providers best practice
      factory.getProviderName = function (appointment, provider) {
        if (appointment != null) {
          if (provider != null) {
            return (provider.Name =
              provider.Name > ''
                ? provider.Name
                : provider.FirstName +
                  ' ' +
                  provider.LastName +
                  (provider.ProfessionalDesignation > ''
                    ? ', ' + provider.ProfessionalDesignation
                    : ''));
          } else {
            return appointment.Classification != 2
              ? ''
              : localize.getLocalizedString('Any Provider');
          }
        } else return '';
      };

      // convert into the appointments objects with providers and locations
      factory.convertToAppointmentsObjects = function (appointments) {
        var personsListForDisplay = [];
        var unscheduledRecords = [];
        var scheduledRecords = [];
        var appStatusValue = null;

        angular.forEach(appointments, function (prc) {
          var personForDisplay = {};

          personForDisplay.DisplayName =
            prc.PatientFirstName + ' ' + prc.PatientLastName;
          personForDisplay.LastName = prc.PatientLastName;
          personForDisplay.PatientId = prc.PatientId;
          personForDisplay.DisplayNameForGlobalSearch =
            personForDisplay.DisplayName;
          personForDisplay.DateOfBirth =
            prc.PatientDateOfBirth != null
              ? $filter('toShortDisplayDateUtc')(prc.PatientDateOfBirth)
              : null;
          personForDisplay.Age =
            prc.PatientDateOfBirth != null
              ? '(Age: ' + $filter('age')(prc.PatientDateOfBirth) + ')'
              : '';

          personForDisplay.AccountId = prc.PersonAccountId;

          personForDisplay.LocationName = prc.PreferredLocationName;
          personForDisplay.LocationId = prc.PreferredLocationId;

          personForDisplay.PreferredDentistId = prc.PreferredDentist;
          personForDisplay.PreferredDentist =
            prc.PreferredDentist !== null
              ? prc.PreferredDentistFirstName +
                ' ' +
                prc.PreferredDentistLastName
              : 'N/A';

          personForDisplay.PreferredHygienistId = prc.PreferredHygienist;
          personForDisplay.PreferredHygienist =
            prc.PreferredHygienist != null
              ? prc.PreferredHygienistFirstName +
                ' ' +
                prc.PreferredHygienistLastName
              : 'N/A';

          personForDisplay.ResponsiblePartyId = prc.ResponsiblePartyId;
          personForDisplay.ResponsibleParty =
            prc.ResponsiblePartyId != null
              ? prc.ResponsiblePartyFirstName +
                ' ' +
                prc.ResponsiblePartyLastName
              : 'N/A';

          personForDisplay.LastAppointmentId = prc.LastAppointmentId;
          personForDisplay.LastAppointment =
            prc.LastAppointmentDate != null
              ? $filter('toShortDisplayDateUtc')(prc.LastAppointmentDate)
              : null;
          personForDisplay.LastAppointmentType = prc.LastAppointmentDescription;
          personForDisplay.NextAppointment =
            prc.NextAppointmentDate != null
              ? $filter('toShortDisplayDateUtc')(prc.NextAppointmentDate)
              : null;
          personForDisplay.NextAppointmentId = prc.NextAppointmentId;
          personForDisplay.NextAppointmentType = prc.NextAppointmentDescription;

          personForDisplay.DueDate =
            prc.PreventiveCareDueDate != '0001-01-01T00:00:00'
              ? $filter('toShortDisplayDateUtc')(prc.PreventiveCareDueDate)
              : null;

          personForDisplay.TreatmentPlansCount = prc.TreatmentPlanCount;
          personForDisplay.TreatmentPlansTotal = prc.TreatmentPlanTotalBalance;
          personForDisplay.TreatmentPlanName = prc.TreatmentPlanName;
          personForDisplay.TreatmentPlanCreatedDate =
            prc.TreatmentPlanCreatedDate;

          personForDisplay.LastCommunication = $filter('date')(
            prc.LastCommunication,
            'MM/dd/yyyy'
          );

          personsListForDisplay.push(personForDisplay);
        });

        return personsListForDisplay;
      };

      // adding providers to filter
      function providerFilter(element) {
        element.kendoAutoComplete({
          dataSource: uniqueProviderNames,
        });
      }

      // adding appointments type to filter
      function apptTypeFilter(element) {
        element.kendoDropDownList({
          dataSource: uniqueApptTypes,
          optionLabel: '--Select Value--',
        });
      }

      // Scheduled columns
      factory.getScheduleApptColumns = function () {
        /* eslint-disable no-template-curly-in-string */
        return [
          {
            field: 'DisplayName',
            title: localize.getLocalizedString('Name'),
            template:
              '<button ng-click="saveMostRecent(\'${PatientId}\'); navToPatientProfile(\'${PatientId}\')" class="btn btn-link"  check-auth-z="soar-per-perdem-view" title=\'{{ "${DisplayName}" }}\' >{{ "${DisplayName}" | truncate:35 }}</button>',
            filterable: {
              extra: false,
              operators: {
                string: {
                  startswith: localize.getLocalizedString('Starts with'),
                  eq: localize.getLocalizedString('Is equal to'),
                  neq: localize.getLocalizedString('Is not equal to'),
                  contains: localize.getLocalizedString('contains'),
                },
              },
            },
          },
          {
            field: 'DateOfBirth',
            title: localize.getLocalizedString('Date of Birth'),
            template:
              "#: (DateOfBirth == null) ? 'N/A' : kendo.toString(DateOfBirth, 'MM/dd/yyyy')# <br \\>  #:Age#",
            filterable: {
              ui: 'datepicker',
              extra: true,
              operators: {
                string: {
                  eq: localize.getLocalizedString('Is equal to'),
                  neq: localize.getLocalizedString('Is not equal to'),
                  gte: localize.getLocalizedString('Is after or equal to'),
                  gt: localize.getLocalizedString('Is after'),
                  lte: localize.getLocalizedString('Is before or equal to'),
                  lt: localize.getLocalizedString('Is before'),
                },
              },
            },
          },
          {
            field: 'ResponsibleParty',
            title: localize.getLocalizedString('Responsible Party'),
            template:
              '<button ng-click="navToPatientProfile(\'${ResponsiblePartyId}\')" class="btn btn-link"  check-auth-z="soar-per-perdem-view" title=\'{{ "${ResponsibleParty}" }}\' >{{ "${ResponsibleParty}" | truncate:35 }}</button>',
            filterable: {
              extra: false,
              operators: {
                string: {
                  startswith: localize.getLocalizedString('Starts with'),
                  eq: localize.getLocalizedString('Is equal to'),
                  neq: localize.getLocalizedString('Is not equal to'),
                  contains: localize.getLocalizedString('contains'),
                },
              },
            },
          },
          {
            field: 'LastAppointment',
            title: localize.getLocalizedString('Last Appt'),
            template:
              '<button ng-click="' +
              "navToAppointment('${LastAppointmentId}', '${AccountId}')\" class=\"btn btn-link\"  check-auth-z=\"soar-per-perdem-view\" title='{{ \"#: (LastAppointment == null) ? 'N/A' : LastAppointmentType#\" }}' >{{ \"#: (LastAppointment == null) ? 'N/A' : LastAppointmentType#\"}} <br \\> {{ \"#: (LastAppointment == null) ? ' ': kendo.toString(LastAppointment, 'MM/dd/yyyy') #  \"}}</button>",
            filterable: {
              ui: 'datepicker',
              extra: true,
              operators: {
                string: {
                  eq: localize.getLocalizedString('Is equal to'),
                  neq: localize.getLocalizedString('Is not equal to'),
                  gte: localize.getLocalizedString('Is after or equal to'),
                  gt: localize.getLocalizedString('Is after'),
                  lte: localize.getLocalizedString('Is before or equal to'),
                  lt: localize.getLocalizedString('Is before'),
                },
              },
            },
          },
          {
            field: 'NextAppointment',
            title: localize.getLocalizedString('Next Appt'),
            template:
              '<button ng-click="' +
              "navToAppointment('${NextAppointmentId}', '${AccountId}')\" class=\"btn btn-link\"  check-auth-z=\"soar-per-perdem-view\" title='{{ \"#: (NextAppointment == null) ? 'N/A' : NextAppointmentType# \" }}' >{{ \"#: (NextAppointment == null) ? 'N/A' : NextAppointmentType# \"}} <br \\>{{ \"#: (NextAppointment == null) ? ' ': kendo.toString(NextAppointment, 'MM/dd/yyyy') #  \" }}</button>",
            filterable: {
              ui: 'datepicker',
              extra: true,
              operators: {
                string: {
                  eq: localize.getLocalizedString('Is equal to'),
                  neq: localize.getLocalizedString('Is not equal to'),
                  gte: localize.getLocalizedString('Is after or equal to'),
                  gt: localize.getLocalizedString('Is after'),
                  lte: localize.getLocalizedString('Is before or equal to'),
                  lt: localize.getLocalizedString('Is before'),
                },
              },
            },
          },
          {
            field: 'DueDate',
            width: 220,
            title: localize.getLocalizedString('Preventive Care Due Date'),
            template:
              "#: (DueDate == null) ? 'N/A' : kendo.toString(DueDate, 'MM/dd/yyyy')#",
            filterable: {
              ui: 'datepicker',
              extra: true,
              operators: {
                string: {
                  eq: localize.getLocalizedString('Is equal to'),
                  neq: localize.getLocalizedString('Is not equal to'),
                  gte: localize.getLocalizedString('Is after or equal to'),
                  gt: localize.getLocalizedString('Is after'),
                  lte: localize.getLocalizedString('Is before or equal to'),
                  lt: localize.getLocalizedString('Is before'),
                },
              },
            },
          },
          {
            field: 'TreatmentPlansTotal',
            width: 155,
            attributes: { style: 'text-align:right;' },
            title: localize.getLocalizedString('Treatment Plans'),
            template:
              "(#:TreatmentPlansCount#) #:kendo.toString(TreatmentPlansTotal, 'c')#",
            filterable: {
              field: 'TreatmentPlansTotal',
              extra: true,
              operators: {
                number: {
                  eq: localize.getLocalizedString('Is equal to'),
                  neq: localize.getLocalizedString('Is not equal to'),
                  gte: localize.getLocalizedString('Is after or equal to'),
                  gt: localize.getLocalizedString('Is after'),
                  lte: localize.getLocalizedString('Is before or equal to'),
                  lt: localize.getLocalizedString('Is before'),
                },
              },
              messages: {
                info: 'Total $',
              },
            },
          },
          {
            field: 'LastCommunication',
            width: 200,
            title: localize.getLocalizedString('Last Communication'),
            //template: "<button ng-click=\"openModal('${PatientId}')\" class=\"btn btn-link\"  >" + "#: (LastCommunication == null) ? 'New Communication' : kendo.toString(LastCommunication, 'MM/dd/yyyy') #" + "</button>",
            template:
              '<button name="${PatientId}" ng-click="openModal(\'${PatientId}\')" class="btn btn-link"  >' +
              "#: (LastCommunication == null) ? 'Create Communication' : kendo.toString(LastCommunication, 'MM/dd/yyyy') #" +
              '</button>',
            filterable: {
              ui: 'datepicker',
              extra: true,
              operators: {
                string: {
                  eq: localize.getLocalizedString('Is equal to'),
                  neq: localize.getLocalizedString('Is not equal to'),
                  gte: localize.getLocalizedString('Is after or equal to'),
                  gt: localize.getLocalizedString('Is after'),
                  lte: localize.getLocalizedString('Is before or equal to'),
                  lt: localize.getLocalizedString('Is before'),
                },
              },
            },
          },
          {
            field: 'Schedule',
            width: 112,
            title: localize.getLocalizedString('Schedule'),
            attributes: { style: 'text-align:right;' },
            template:
              '<button ng-click="createAppointment(\'${PatientId}\')" class="btn btn-link ng-binding ng-scope"  ><span id="schedule-setup-icon" class="practiceSetup__icon far fa-calendar-alt" ng-class="iconClass" title="Create new appointment"></span></button>',
            filterable: false,
          },
        ];
        /* eslint-enable no-template-curly-in-string */
      };

      // Treatment Plans columns
      factory.getTreatmentPlanColumns = function () {
        /* eslint-disable no-template-curly-in-string */
        return [
          {
            field: 'DisplayName',
            title: localize.getLocalizedString('Name'),
            template:
              '<button ng-click="saveMostRecent(\'${PatientId}\'); navToPatientProfile(\'${PatientId}\')" class="btn btn-link"  check-auth-z="soar-per-perdem-view" title=\'{{ "${DisplayName}" }}\' >{{ "${DisplayName}" | truncate:35 }}</button>',
            filterable: {
              extra: false,
              operators: {
                string: {
                  startswith: localize.getLocalizedString('Starts with'),
                  eq: localize.getLocalizedString('Is equal to'),
                  neq: localize.getLocalizedString('Is not equal to'),
                  contains: localize.getLocalizedString('contains'),
                },
              },
            },
          },
          {
            field: 'DateOfBirth',
            title: localize.getLocalizedString('Date of Birth'),
            template:
              "#: (DateOfBirth == null) ? 'N/A' : kendo.toString(DateOfBirth, 'MM/dd/yyyy')# <br >  #:Age#",
            filterable: {
              ui: 'datepicker',
              extra: true,
              operators: {
                string: {
                  eq: localize.getLocalizedString('Is equal to'),
                  neq: localize.getLocalizedString('Is not equal to'),
                  gte: localize.getLocalizedString('Is after or equal to'),
                  gt: localize.getLocalizedString('Is after'),
                  lte: localize.getLocalizedString('Is before or equal to'),
                  lt: localize.getLocalizedString('Is before'),
                },
              },
            },
          },
          {
            field: 'ResponsibleParty',
            title: localize.getLocalizedString('Responsible Party'),
            template:
              '<button ng-click="navToPatientProfile(\'${ResponsiblePartyId}\')" class="btn btn-link"  check-auth-z="soar-per-perdem-view" title=\'{{ "${ResponsibleParty}" }}\' >{{ "${ResponsibleParty}" | truncate:35 }}</button>',
            filterable: {
              extra: false,
              operators: {
                string: {
                  startswith: localize.getLocalizedString('Starts with'),
                  eq: localize.getLocalizedString('Is equal to'),
                  neq: localize.getLocalizedString('Is not equal to'),
                  contains: localize.getLocalizedString('contains'),
                },
              },
            },
          },
          {
            field: 'LastAppointment',
            title: localize.getLocalizedString('Last Appt'),
            attributes: { class: 'cell' },
            template: function (data, ifEmpty) {
              if (data.LastAppointment) {
                var tzAbbr = timeZoneFactory.GetTimeZoneAbbr(
                  data.LastAppointmentTimezone,
                  data.LastAppointment
                );
                var dateTZ = timeZoneFactory.ConvertDateTZ(
                  data.LastAppointment,
                  data.LastAppointmentTimezone
                );
                var type = data.LastAppointmentType || ifEmpty;
                var date = $filter('toShortDisplayDate')(dateTZ);
                var template =
                  '<button ng-click="navToAppointment(\'' +
                  data.LastAppointmentId +
                  "', '" +
                  data.AccountId +
                  '\')" ';
                template += 'class="btn btn-link btn-link-left" ';
                template += 'check-auth-z="soar-per-perdem-view" ';
                template +=
                  'tooltip-append-to-body="true" uib-tooltip="' +
                  date +
                  ' ' +
                  tzAbbr +
                  '">';
                template += type + '<br />';
                template += date;
                template += '</button>';
                return template;
              } else {
                return 'N/A';
              }
            },
            ifEmpty: 'N/A',
            filterable: {
              ui: 'datepicker',
              extra: true,
              operators: {
                string: {
                  eq: localize.getLocalizedString('Is equal to'),
                  neq: localize.getLocalizedString('Is not equal to'),
                  gte: localize.getLocalizedString('Is after or equal to'),
                  gt: localize.getLocalizedString('Is after'),
                  lte: localize.getLocalizedString('Is before or equal to'),
                  lt: localize.getLocalizedString('Is before'),
                },
              },
            },
          },
          {
            field: 'NextAppointment',
            title: localize.getLocalizedString('Next Appt'),
            attributes: { class: 'cell' },
            template: function (data, ifEmpty) {
              if (data.NextAppointment) {
                var tzAbbr = timeZoneFactory.GetTimeZoneAbbr(
                  data.NextAppointmentTimezone,
                  data.NextAppointment
                );
                var dateTZ = timeZoneFactory.ConvertDateTZ(
                  data.NextAppointment,
                  data.NextAppointmentTimezone
                );
                var type = data.LastAppointmentType || ifEmpty;
                var date = $filter('toShortDisplayDate')(dateTZ);
                var template =
                  '<button ng-click="navToAppointment(\'' +
                  data.NextAppointmentId +
                  "', '" +
                  data.AccountId +
                  '\')" ';
                template += 'class="btn btn-link btn-link-left" ';
                template += 'check-auth-z="soar-per-perdem-view" ';
                template +=
                  'tooltip-append-to-body="true" uib-tooltip="' +
                  date +
                  ' ' +
                  tzAbbr +
                  '">';
                template += type + '<br />';
                template += date;
                template += '</button>';
                return template;
              } else {
                return 'N/A';
              }
            },
            ifEmpty: 'N/A',
            filterable: {
              ui: 'datepicker',
              extra: true,
              operators: {
                string: {
                  eq: localize.getLocalizedString('Is equal to'),
                  neq: localize.getLocalizedString('Is not equal to'),
                  gte: localize.getLocalizedString('Is after or equal to'),
                  gt: localize.getLocalizedString('Is after'),
                  lte: localize.getLocalizedString('Is before or equal to'),
                  lt: localize.getLocalizedString('Is before'),
                },
              },
            },
          },
          {
            field: 'DueDate',
            width: 220,
            title: localize.getLocalizedString('Preventive Care Due Date'),
            template:
              "#: (DueDate == null) ? 'N/A' : kendo.toString(DueDate, 'MM/dd/yyyy')#",
            filterable: {
              ui: 'datepicker',
              extra: true,
              operators: {
                string: {
                  eq: localize.getLocalizedString('Is equal to'),
                  neq: localize.getLocalizedString('Is not equal to'),
                  gte: localize.getLocalizedString('Is after or equal to'),
                  gt: localize.getLocalizedString('Is after'),
                  lte: localize.getLocalizedString('Is before or equal to'),
                  lt: localize.getLocalizedString('Is before'),
                },
              },
            },
          },
          {
            field: 'TreatmentPlansTotal',
            width: 155,
            attributes: { style: 'text-align:right;' },
            title: localize.getLocalizedString('Treatment Plans'),
            //template: "(#:TreatmentPlansCount#) #:kendo.toString(TreatmentPlansTotal, 'c')#",
            template:
              "<div ng-mouseover=\"displayTxPlans($event, '${PatientId}', '${TreatmentPlanId}')\" ng-mouseleave=\"hideTxPlans()\">(#:TreatmentPlansCount#) #:kendo.toString(TreatmentPlansTotal, 'c')#</div>",
            filterable: {
              field: 'TreatmentPlansTotal',
              extra: true,
              operators: {
                number: {
                  eq: localize.getLocalizedString('Is equal to'),
                  neq: localize.getLocalizedString('Is not equal to'),
                  gte: localize.getLocalizedString('Is after or equal to'),
                  gt: localize.getLocalizedString('Is after'),
                  lte: localize.getLocalizedString('Is before or equal to'),
                  lt: localize.getLocalizedString('Is before'),
                },
              },
              messages: {
                info: 'Total $',
              },
            },
          },
          {
            field: 'LastCommunication',
            width: 200,
            title: localize.getLocalizedString('Last Communication'),
            template:
              '<button name="${PatientId}" ng-click="openModal(\'${PatientId}\')" class="btn btn-link"  >' +
              "#: (LastCommunication == null) ? 'Create Communication' : kendo.toString(LastCommunication, 'MM/dd/yyyy') #" +
              '</button>',
            filterable: {
              ui: 'datepicker',
              extra: true,
              operators: {
                string: {
                  eq: localize.getLocalizedString('Is equal to'),
                  neq: localize.getLocalizedString('Is not equal to'),
                  gte: localize.getLocalizedString('Is after or equal to'),
                  gt: localize.getLocalizedString('Is after'),
                  lte: localize.getLocalizedString('Is before or equal to'),
                  lt: localize.getLocalizedString('Is before'),
                },
              },
            },
          },
          {
            field: 'Schedule',
            width: 112,
            title: localize.getLocalizedString('Schedule'),
            attributes: { style: 'text-align:right;' },
            template:
              '<button ng-click="createAppointment(\'${PatientId}\')" class="btn btn-link ng-binding ng-scope"  ><span id="schedule-setup-icon" class="practiceSetup__icon far fa-calendar-alt" ng-class="iconClass" title="Create new appointment"></span></button>',
            filterable: false,
          },
        ];
        /* eslint-enable no-template-curly-in-string */
      };

      factory.getAllPatientsColumns = function () {
        /* eslint-disable no-template-curly-in-string */
        return [
          {
            field: 'DisplayName',
            title: localize.getLocalizedString('Name'),
            template:
              '<button ng-click="saveMostRecent(\'${PatientId}\'); navToPatientProfile(\'${PatientId}\')" ng-class="{\'btn btn-link\' : dataItem.IsActive, \'peopleMgmt__unstyle-button\' : !dataItem.IsActive}" check-auth-z="soar-per-perdem-view" title=\'{{ "${DisplayName}" }}\' >{{ "${DisplayName}" | truncate:35 }}</button>',
            filterable: {
              extra: false,
              operators: {
                string: {
                  startswith: localize.getLocalizedString('Starts with'),
                  eq: localize.getLocalizedString('Is equal to'),
                  neq: localize.getLocalizedString('Is not equal to'),
                  contains: localize.getLocalizedString('contains'),
                },
              },
            },
          },
          {
            field: 'DateOfBirth',
            title: localize.getLocalizedString('Date of Birth'),
            template:
              "#: (DateOfBirth == null) ? ' ' : kendo.toString(DateOfBirth, 'MM-dd-yyyy') #  #:Age#",
            filterable: {
              ui: 'datepicker',
            },
          },
          {
            field: 'UnMaskedPhoneNumber',
            attributes: { style: 'text-align:right;' },
            title: localize.getLocalizedString('Phone'),
            template: '${PhoneNumber}',
          },
          {
            field: 'PreferredDentist',
            title: localize.getLocalizedString('Preferred Dentist'),
            filterable: {
              multi: true,
              dataSource: uniquePreferredDentists,
            },
          },
          {
            field: 'Schedule',
            width: 112,
            title: localize.getLocalizedString('Schedule'),
            attributes: { style: 'text-align:right;' },
            template:
              '<button ng-click="createAppointment(\'${PatientId}\')" class="btn btn-link ng-binding ng-scope"  ><span id="schedule-setup-icon" class="practiceSetup__icon far fa-calendar-alt" ng-class="iconClass" title="Create new appointment"></span></button>',
            filterable: false,
          },
        ];
        /* eslint-enable no-template-curly-in-string */
      };

      factory.getPreventiveCareColumns = function () {
        /* eslint-disable no-template-curly-in-string */
        return [
          {
            field: 'DisplayName',
            title: localize.getLocalizedString('Name'),
            template:
              '<button ng-click="saveMostRecent(\'${PatientId}\'); navToPatientProfile(\'${PatientId}\')" class="btn btn-link"  check-auth-z="soar-per-perdem-view" title=\'{{ "${DisplayName}" }}\' >{{ "${DisplayName}" | truncate:35 }}</button>',
            filterable: {
              extra: false,
              operators: {
                string: {
                  startswith: localize.getLocalizedString('Starts with'),
                  eq: localize.getLocalizedString('Is equal to'),
                  neq: localize.getLocalizedString('Is not equal to'),
                  contains: localize.getLocalizedString('contains'),
                },
              },
            },
          },
          {
            field: 'DateOfBirth',
            sortable: true,
            dir: 'desc',
            title: localize.getLocalizedString('Date of Birth'),
            template:
              "#: (DateOfBirth == null) ? 'N/A' : kendo.toString(DateOfBirth, 'MM/dd/yyyy')# <br > #:Age#",
            filterable: {
              ui: 'datepicker',
              extra: true,
              operators: {
                string: {
                  eq: localize.getLocalizedString('Is equal to'),
                  neq: localize.getLocalizedString('Is not equal to'),
                  gte: localize.getLocalizedString('Is after or equal to'),
                  gt: localize.getLocalizedString('Is after'),
                  lte: localize.getLocalizedString('Is before or equal to'),
                  lt: localize.getLocalizedString('Is before'),
                },
              },
            },
          },
          {
            field: 'ResponsibleParty',
            title: localize.getLocalizedString('Responsible Party'),
            template:
              '<button ng-click="navToPatientProfile(\'${ResponsiblePartyId}\')" class="btn btn-link"  check-auth-z="soar-per-perdem-view" title=\'{{ "${ResponsibleParty}" }}\' >{{ "${ResponsibleParty}" | truncate:35 }}</button>',
            filterable: {
              extra: false,
              operators: {
                string: {
                  startswith: localize.getLocalizedString('Starts with'),
                  eq: localize.getLocalizedString('Is equal to'),
                  neq: localize.getLocalizedString('Is not equal to'),
                  contains: localize.getLocalizedString('contains'),
                },
              },
            },
          },
          {
            field: 'LastAppointment',
            title: localize.getLocalizedString('Last Appt'),
            attributes: { class: 'cell' },
            template: function (data, ifEmpty) {
              if (data.LastAppointment) {
                var tzAbbr = timeZoneFactory.GetTimeZoneAbbr(
                  data.LastAppointmentTimezone,
                  data.LastAppointment
                );
                var dateTZ = timeZoneFactory.ConvertDateTZ(
                  data.LastAppointment,
                  data.LastAppointmentTimezone
                );
                var type = data.LastAppointmentType || ifEmpty;
                var date = $filter('toShortDisplayDate')(dateTZ);
                var template =
                  '<button ng-click="navToAppointment(\'' +
                  data.LastAppointmentId +
                  "', '" +
                  data.AccountId +
                  '\')" ';
                template += 'class="btn btn-link btn-link-left" ';
                template += 'check-auth-z="soar-per-perdem-view" ';
                template +=
                  'tooltip-append-to-body="true" uib-tooltip="' +
                  date +
                  ' ' +
                  tzAbbr +
                  '">';
                template += type + '<br />';
                template += date;
                template += '</button>';
                return template;
              } else {
                return 'N/A';
              }
            },
            ifEmpty: 'N/A',
            filterable: {
              ui: 'datepicker',
              extra: true,
              operators: {
                string: {
                  eq: localize.getLocalizedString('Is equal to'),
                  neq: localize.getLocalizedString('Is not equal to'),
                  gte: localize.getLocalizedString('Is after or equal to'),
                  gt: localize.getLocalizedString('Is after'),
                  lte: localize.getLocalizedString('Is before or equal to'),
                  lt: localize.getLocalizedString('Is before'),
                },
              },
            },
          },
          {
            field: 'NextAppointment',
            title: localize.getLocalizedString('Next Appt'),
            attributes: { class: 'cell' },
            template: function (data, ifEmpty) {
              if (data.NextAppointment) {
                var tzAbbr = timeZoneFactory.GetTimeZoneAbbr(
                  data.NextAppointmentTimezone,
                  data.NextAppointment
                );
                var dateTZ = timeZoneFactory.ConvertDateTZ(
                  data.NextAppointment,
                  data.NextAppointmentTimezone
                );
                var type = data.LastAppointmentType || ifEmpty;
                var date = $filter('toShortDisplayDate')(dateTZ);
                var template =
                  '<button ng-click="navToAppointment(\'' +
                  data.NextAppointmentId +
                  "', '" +
                  data.AccountId +
                  '\')" ';
                template += 'class="btn btn-link btn-link-left" ';
                template += 'check-auth-z="soar-per-perdem-view" ';
                template +=
                  'tooltip-append-to-body="true" uib-tooltip="' +
                  date +
                  ' ' +
                  tzAbbr +
                  '">';
                template += type + '<br />';
                template += date;
                template += '</button>';
                return template;
              } else {
                return 'N/A';
              }
            },
            ifEmpty: 'N/A',
            filterable: {
              ui: 'datepicker',
              extra: true,
              operators: {
                string: {
                  eq: localize.getLocalizedString('Is equal to'),
                  neq: localize.getLocalizedString('Is not equal to'),
                  gte: localize.getLocalizedString('Is after or equal to'),
                  gt: localize.getLocalizedString('Is after'),
                  lte: localize.getLocalizedString('Is before or equal to'),
                  lt: localize.getLocalizedString('Is before'),
                },
              },
            },
          },
          {
            field: 'DueDate',
            sortable: true,
            width: 220,
            title: localize.getLocalizedString('Preventive Care Due Date'),
            template:
              "#: (DueDate == null) ? 'N/A' : kendo.toString(DueDate, 'MM/dd/yyyy')#",
            filterable: {
              ui: 'datepicker',
              extra: true,
              operators: {
                string: {
                  eq: localize.getLocalizedString('Is equal to'),
                  neq: localize.getLocalizedString('Is not equal to'),
                  gte: localize.getLocalizedString('Is after or equal to'),
                  gt: localize.getLocalizedString('Is after'),
                  lte: localize.getLocalizedString('Is before or equal to'),
                  lt: localize.getLocalizedString('Is before'),
                },
              },
            },
          },
          {
            field: 'TreatmentPlansTotal',
            width: 155,
            attributes: { style: 'text-align:right;' },
            title: localize.getLocalizedString('Treatment Plans'),
            //template: "(#:TreatmentPlansCount#) #:kendo.toString(TreatmentPlansTotal, 'c')#",
            template:
              "<div ng-mouseover=\"displayTxPlans($event, '${PatientId}', 'all')\" ng-mouseleave=\"hideTxPlans()\">(#:TreatmentPlansCount#) #:kendo.toString(TreatmentPlansTotal, 'c')#</div>",
            filterable: {
              field: 'TreatmentPlansTotal',
              extra: true,
              operators: {
                number: {
                  eq: localize.getLocalizedString('Is equal to'),
                  neq: localize.getLocalizedString('Is not equal to'),
                  gte: localize.getLocalizedString('Is after or equal to'),
                  gt: localize.getLocalizedString('Is after'),
                  lte: localize.getLocalizedString('Is before or equal to'),
                  lt: localize.getLocalizedString('Is before'),
                },
              },
              messages: {
                info: 'Total $',
              },
            },
          },
          {
            field: 'LastCommunication',
            sortable: true,
            width: 200,
            title: localize.getLocalizedString('Last Communication'),
            template:
              '<button name="${PatientId}" ng-click="openModal(\'${PatientId}\')" class="btn btn-link"  >' +
              "#: (LastCommunication == null) ? 'Create Communication' : kendo.toString(LastCommunication, 'MM/dd/yyyy') #" +
              '</button>',
            //template: "#: (LastCommunication == null) ? '" + "<button ng-click=\"openModal()\" class=\"btn btn-link\"  title=\"New Communication\">New Communication</button>" + "'" +
            //    ": '<button class=\"btn btn-link\"  title=\"' +  kendo.toString(LastCommunication, 'MM/dd/yyyy') + '\">' + kendo.toString(LastCommunication, 'MM/dd/yyyy') + '</button>' #",
            //template: "#: (LastCommunication == null) ? 'New Communication' : ' + kendo.toString(LastCommunication, 'MM/dd/yyyy') + '" +
            //    ": '<button class=\"btn btn-link\"  title=\"' +  kendo.toString(LastCommunication, 'MM/dd/yyyy') + '\">' + kendo.toString(LastCommunication, 'MM/dd/yyyy') + '</button>' #",
            filterable: {
              ui: 'datepicker',
              extra: true,
              operators: {
                string: {
                  eq: localize.getLocalizedString('Is equal to'),
                  neq: localize.getLocalizedString('Is not equal to'),
                  gte: localize.getLocalizedString('Is after or equal to'),
                  gt: localize.getLocalizedString('Is after'),
                  lte: localize.getLocalizedString('Is before or equal to'),
                  lt: localize.getLocalizedString('Is before'),
                },
              },
            },
          },
          {
            field: 'Schedule',
            width: 112,
            title: localize.getLocalizedString('Schedule'),
            attributes: { style: 'text-align:right;' },
            template:
              '<button ng-click="createAppointment(\'${PatientId}\')" class="btn btn-link ng-binding ng-scope"  ><span id="schedule-setup-icon" class="practiceSetup__icon far fa-calendar-alt" ng-class="iconClass" title="Create new appointment"></span></button>',
            filterable: false,
          },
        ];
        /* eslint-enable no-template-curly-in-string */
      };

      return {
        access: function () {
          return factory.authAccess();
        },
        GetPersons: function (personObject) {
          return factory.getPersons(personObject);
        },
        GetLocations: function () {
          return factory.getLocations();
        },
        GetProviders: function () {
          return factory.getProviders();
        },
        GetPreventiveCares: function () {
          return factory.getPreventiveCares();
        },
        RetriveAppointments: function () {
          return factory.retriveAppointments();
        },
        ConvertToPersonObjects: function (persons, providers) {
          return factory.convertToPersonObjects(persons, providers);
        },
        ConvertToPreventiveCareObjects: function (preventiveCares) {
          return factory.convertToPreventiveCareObjects(preventiveCares);
        },
        ConvertToTreatmentPlanObjects: function (treatmentPlans) {
          return factory.convertToTreatmentPlanObjects(treatmentPlans);
        },
        GetPersonName: function (persons) {
          return factory.getPersonName(persons);
        },
        ConvertToAppointmentsObjects: function (appointments) {
          return factory.convertToAppointmentsObjects(appointments);
        },
        GetUniqueProviderNames: function () {
          return uniqueProviderNames;
        },
        GetUniqueApptTypes: function () {
          return factory.uniqueApptTypes;
        },
        GetAllPatientsColumns: function () {
          return factory.getAllPatientsColumns();
        },
        GetPreventiveCareColumns: function () {
          return factory.getPreventiveCareColumns();
        },
        GetTreatmentPlanColumns: function () {
          return factory.getTreatmentPlanColumns();
        },
        GetScheduleApptColumns: function () {
          return factory.getScheduleApptColumns();
        },
        GetLocationNameById: function (Id, locations) {
          return factory.getLocationNameById(Id, locations);
        },
        preferredProviderId: '',
        setPreferredProvider: function (providerId) {
          this.preferredProviderId = providerId;
        },
      };
    },
  ])
  .factory('PatientBenefitPlansFactory', [
    'PatientServices',
    '$filter',
    'localize',
    '$q',
    'toastrFactory',
    '$timeout',
    'patSecurityService',
    'UsersFactory',
    'ListHelper',
    'FinancialService',
    'SaveStates',
    'locationService',
    'PatCacheFactory',
    function (
      patientServices,
      $filter,
      localize,
      $q,
      toastrFactory,
      $timeout,
      patSecurityService,
      usersFactory,
      listHelper,
      financialService,
      saveStates,
      locationService,
      patCacheFactory
    ) {
      var factory = this;

      factory.defaultPlanName = 'Patient Benefit Plan';

      //#region authorization

      factory.patientBenefitPlanViewAmfa = 'soar-ins-ibplan-view';

      factory.authPatientBenefitPlanViewAccess = function () {
        return patSecurityService.IsAuthorizedByAbbreviation(
          factory.patientBenefitPlanViewAmfa
        );
      };

      factory.authPatientBenefitPlanCreateAccess = function () {
        return patSecurityService.IsAuthorizedByAbbreviation(
          'soar-clin-ibplan-add'
        );
      };

      factory.authPatientBenefitPlanDeleteAccess = function () {
        return patSecurityService.IsAuthorizedByAbbreviation(
          'soar-ins-ibplan-delete'
        );
      };

      factory.authPatientBenefitPlanEditAccess = function () {
        return patSecurityService.IsAuthorizedByAbbreviation(
          'soar-ins-ibplan-edit'
        );
      };

      factory.authPatientBenefitPlanViewAccess = function () {
        return patSecurityService.IsAuthorizedByAbbreviation(
          'soar-ins-ibplan-view'
        );
      };

      factory.authAccess = function () {
        if (factory.authPatientBenefitPlanViewAccess()) {
          factory.hasPatientBenefitPlanViewAccess = true;
        }
      };

      //endregion

      factory.getPatientBenefitPlans = function (personId, clearCache) {
        var defer = $q.defer();
        var promise = defer.promise;
        if (factory.authPatientBenefitPlanViewAccess()) {
          if (clearCache) {
            patCacheFactory.ClearCache(
              patCacheFactory.GetCache('PatientBenefitPlans')
            );
          }
          patientServices.PatientBenefitPlan.get({
            patientId: personId,
          }).$promise.then(
            function (res) {
              promise = $.extend(promise, { values: res.Value });
              defer.resolve(res);
            },
            function () {
              toastrFactory.error(
                localize.getLocalizedString(
                  'Failed to get Patient Benefit Plans.'
                ),
                localize.getLocalizedString('Server Error')
              );
            }
          );
        }
        return promise;
      };

      factory.getPatientBenefitPlansForAccount = function (accountId) {
        var defer = $q.defer();
        var promise = defer.promise;
        if (factory.authPatientBenefitPlanViewAccess()) {
          patientServices.InsuranceInfo.get({
            AccountId: accountId,
          }).$promise.then(
            function (res) {
              promise = $.extend(promise, { values: res.Value });
              defer.resolve(res);
            },
            function () {
              toastrFactory.error(
                localize.getLocalizedString(
                  'Failed to get Patient Benefit Plans for Account.'
                ),
                localize.getLocalizedString('Server Error')
              );
            }
          );
        }
        return promise;
      };

      // Updates a list of PatientBenefitPlans (INCOMPLET
      factory.updatePatientBenefitPlans = function (
        personId,
        patientBenefitPlans
      ) {
        var defer = $q.defer();
        var promise = defer.promise;
        if (factory.authPatientBenefitPlanEditAccess()) {
          if (patientBenefitPlans) {
            patientServices.PatientBenefitPlan.update(
              { patientId: personId },
              patientBenefitPlans
            ).$promise.then(
              function (res) {
                toastrFactory.success(
                  localize.getLocalizedString('Your {0} have been updated.', [
                    'Patient Benefit Plans',
                  ]),
                  localize.getLocalizedString('Success')
                );

                promise = $.extend(promise, { values: res.Value });
                defer.resolve(res);
              },
              function (res) {
                // suppress toastr if already have 409 global message
                if (!(res && res.status === 409)) {
                  toastrFactory.error(
                    localize.getLocalizedString(
                      'Update was unsuccessful. Please retry your update.'
                    ),
                    localize.getLocalizedString('Server Error')
                  );
                }
              }
            );
          }
          return promise;
        }
      };

      // Reset plans after plan is removed
      factory.reorderPriority = function (plans) {
        // resort list based on Priority
        plans = $filter('orderBy')(plans, 'Priority');
        for (var i = 0; i < plans.length; i++) {
          if (plans[i].Priority !== i) {
            plans[i].Priority = i;
            plans[i].$patientBenefitPlan.Priority = i;
            plans[i].$patientBenefitPlan.ObjectState = saveStates.Update;
          }
        }
        return plans;
      };

      // Reset the priority for each member of insuranceTile list based on newest priority setting
      factory.resetPriority = function (plans, oldIndex, newIndex) {
        // get original priority of the plan that moved
        var originalPlanPriority = plans[oldIndex].Priority;
        // get new priority of the plan that moved
        var newPlanPriority = plans[newIndex].Priority;
        // get plan that moved
        var planThatMoved = plans[oldIndex];

        // set new Priority on plan that moved to priority of new position
        planThatMoved.Priority = newPlanPriority;
        planThatMoved.$patientBenefitPlan.Priority = newPlanPriority;
        planThatMoved.$patientBenefitPlan.ObjectState = saveStates.Update;

        // reset other priorities based on plan that moved
        if (originalPlanPriority > newPlanPriority) {
          angular.forEach(plans, function (plan) {
            if (
              plan.$patientBenefitPlan.PatientBenefitPlanId !=
                planThatMoved.$patientBenefitPlan.PatientBenefitPlanId &&
              plan.Priority < originalPlanPriority &&
              plan.Priority >= newPlanPriority
            ) {
              plan.Priority = plan.Priority + 1;
              // keep the $patientBenefitPlan synced with info tiles
              plan.$patientBenefitPlan.Priority = plan.Priority;
              plan.$patientBenefitPlan.ObjectState = saveStates.Update;
            }
          });
        } else {
          angular.forEach(plans, function (plan) {
            if (
              plan.$patientBenefitPlan.PatientBenefitPlanId !=
                planThatMoved.$patientBenefitPlan.PatientBenefitPlanId &&
              plan.Priority > originalPlanPriority &&
              plan.Priority <= newPlanPriority
            ) {
              plan.Priority = plan.Priority - 1;
              // keep the $patientBenefitPlan synced with info tiles
              plan.$patientBenefitPlan.Priority = plan.Priority;
              plan.$patientBenefitPlan.ObjectState = saveStates.Update;
            }
          });
        }
        return plans;
      };

      // set the PriorityLabel based on plan.Priority
      factory.setPriorityLabels = function (plans) {
        angular.forEach(plans, function (plan) {
          switch (plan.$patientBenefitPlan.Priority) {
            case 0:
              plan.PriorityLabel = localize.getLocalizedString(
                'Primary Dental Benefit Plan'
              );
              plan.$patientBenefitPlan.PriorityLabel = localize.getLocalizedString(
                'Primary Dental Benefit Plan'
              );
              break;
            case 1:
              plan.PriorityLabel = localize.getLocalizedString(
                'Secondary Dental Benefit Plan'
              );
              plan.$patientBenefitPlan.PriorityLabel = localize.getLocalizedString(
                'Secondary Dental Benefit Plan'
              );
              break;
            case 2:
              plan.PriorityLabel = localize.getLocalizedString(
                '3rd Supplemental Dental Benefit Plan'
              );
              plan.$patientBenefitPlan.PriorityLabel = localize.getLocalizedString(
                '3rd Supplemental Dental Benefit Plan'
              );
              break;
            case 3:
              plan.PriorityLabel = localize.getLocalizedString(
                '4th Supplemental Dental Benefit Plan'
              );
              plan.$patientBenefitPlan.PriorityLabel = localize.getLocalizedString(
                '4th Supplemental Dental Benefit Plan'
              );
              break;
            case 4:
              plan.PriorityLabel = localize.getLocalizedString(
                '5th Supplemental Dental Benefit Plan'
              );
              plan.$patientBenefitPlan.PriorityLabel = localize.getLocalizedString(
                '5th Supplemental Dental Benefit Plan'
              );
              break;
            case 5:
              plan.PriorityLabel = localize.getLocalizedString(
                '6th Supplemental Dental Benefit Plan'
              );
              plan.$patientBenefitPlan.PriorityLabel = localize.getLocalizedString(
                '6th Supplemental Dental Benefit Plan'
              );
              break;
          }
        });
        return plans;
      };

      return {
        access: function () {
          return factory.authAccess();
        },
        // Get all Patient Benefit Plans by Patient
        PatientBenefitPlans: function (personId, clearCache) {
          return factory.getPatientBenefitPlans(personId, clearCache);
        },
        // Get all Patient Benefit Plans by Account
        PatientBenefitPlansForAccount: function (accountId) {
          return factory.getPatientBenefitPlansForAccount(accountId);
        },
        // Update Patient Benefit Plans List
        Update: function (personId, patientBenefitPlans) {
          return factory.updatePatientBenefitPlans(
            personId,
            patientBenefitPlans
          );
        },
        // Reset Priority on Patient Benefit Plans
        ResetPriority: function (plans, oldIndex, newIndex) {
          return factory.resetPriority(plans, oldIndex, newIndex);
        },
        // Reorder Priority on Patient Benefit Plans when plan removed
        ReorderPriority: function (plans) {
          return factory.reorderPriority(plans);
        },
        // Set Priority Labels on Patient Benefit Plans
        SetPriorityLabels: function (plans) {
          return factory.setPriorityLabels(plans);
        },
        updatedPriority: {},
        setUpdatedPriority: function (priority) {
          this.updatedPriority = priority;
        },
      };
    },
  ])

  .factory('PatientInsurancePaymentFactory', [
    '$q',
    'PatientServices',
    'patSecurityService',
    'CommonServices',
    'PaymentGatewayService',
    'ModalDataFactory',
    'ModalFactory',
    'SaveStates',
    'localize',
    'LocationServices',
    'UsersFactory',
    '$filter',
    'toastrFactory',
    function (
      $q,
      patientServices,
      patSecurityService,
      commonServices,
      paymentGatewayService,
      modalDataFactory,
      modalFactory,
      saveStates,
      localize,
      locationServices,
      usersFactory,
      $filter,
      toastrFactory
    ) {
      var factory = this;

      // selected claims to apply payment to
      var selectedClaims = [];

      var insurancePaymentTypes = [];
      var title = localize.getLocalizedString('Fee Schedule Present');
      var message = localize.getLocalizedString(
        "The patient's benefit plan requires a fee schedule adjustment. Would you like to complete the adjustment now?"
      );
      var button1Text = localize.getLocalizedString('Yes');
      var button2Text = localize.getLocalizedString('No');
      factory.providers = usersFactory.Users();

      //#region authentication
      var hasAccess = {
        InsurancePaymentView: false,
        ClaimsView: false,
      };

      // Authorizing view patient insurance payment access
      factory.authPatientInsurancePaymentViewAccess = function () {
        return patSecurityService.IsAuthorizedByAbbreviation(
          'soar-acct-aipmt-view'
        );
      };

      // Authorizing view patient claims access
      factory.authPatientClaimsViewAccess = function () {
        return patSecurityService.IsAuthorizedByAbbreviation(
          'soar-ins-iclaim-view'
        );
      };

      // set view authorization for patient account insurance payment
      factory.authAccess = function () {
        if (!factory.authPatientInsurancePaymentViewAccess()) {
        } else {
          hasAccess.InsurancePaymentView = factory.authPatientInsurancePaymentViewAccess();
          hasAccess.ClaimsView = factory.authPatientClaimsViewAccess();
        }
        return hasAccess;
      };

      //#endregion

      /**
       * provides service data by adding default Amount field if not available and sorts them according to DateEntered
       */
      factory.getClaimServices = function (claims) {
        var allServiceDtos = [];
        if (claims && claims.length) {
          //sorting claims in order to min date
          claims.sort(function (a, b) {
            return new Date(a.MinServiceDate) - new Date(b.MinServiceDate);
          });

          _.each(claims, function (claim) {
            _.each(
              claim.ServiceTransactionToClaimPaymentDtos,
              function (serviceTransaction) {
                var claimProps = {
                  claimDisplayDate: claim.DisplayDate,
                  claimProviderName: claim.ProviderName,
                  claimPatientName: claim.PatientName,
                  claimDescription:
                    claim.CarrierName + ' - ' + claim.PrimaryClaim,
                  claimMinDate: claim.MinServiceDate,
                  Amount: 0,
                  Status: claim.Status.toString(),
                };
                serviceTransaction.IsInvalidAmount = false;
                angular.extend(serviceTransaction, claimProps);
                allServiceDtos.push(serviceTransaction);
              }
            );
          });

          //sorting services in order of DateEntered
          allServiceDtos.sort(function (a, b) {
            return new Date(a.claimMinDate) - new Date(b.claimMinDate);
          });
        }

        var claimId = '';
        var sortOrder = 0;
        _.each(allServiceDtos, function (service) {
          if (service.ClaimId !== claimId) {
            claimId = service.ClaimId;
            sortOrder++;
          }
          service.SortOrder = sortOrder;
        });

        return allServiceDtos;
      };

      // adds claim object to selected claims array
      factory.addSelectedClaims = function (claims) {
        selectedClaims.push(claims);
      };

      // gets all selected claims
      factory.getSelectedClaims = function () {
        return selectedClaims;
      };

      // clears out selected claims array
      factory.removeSelectedClaims = function () {
        selectedClaims = [];
      };

      factory.formatClaimDisplayDate = function (claim) {
        var maxDate = moment(claim.MaxServiceDate).format('MM/DD/YYYY');
        var minDate = moment(claim.MinServiceDate).format('MM/DD/YYYY');
        return minDate !== maxDate ? minDate + '-' + maxDate : maxDate;
      };

      var createCloseClaimModalObject = function (claim, isLastClaim) {
        return {
          templateUrl:
            'App/BusinessCenter/insurance/claims/claims-management/close-claim-modal/close-claim-modal.html',
          backdrop: 'static',
          keyboard: false,
          size: 'lg',
          windowClass: 'center-modal',
          controller: 'CloseClaimModalController',
          amfa: 'soar-acct-insinf-view',
          resolve: {
            closeClaimObject: function () {
              return {
                patientId: claim.PatientId,
                claimId: claim.ClaimId,
                DateOfServices: factory.formatClaimDisplayDate(claim),
                patientName: claim.PatientName,
                hasMultipleTransactions: true,
                fromPatitentSummary: false,
                isFromInsurancePayment: true,
                closeClaimButtonName: localize.getLocalizedString(
                  'Close Claim' + (isLastClaim ? '' : ' & Continue')
                ),
                TotalEstimatedInsurance: claim.TotalEstimatedInsurance,
                DataTag: claim.ClaimEntityDataTag,
                CheckDataTag: true,
              };
            },
          },
        };
      };

      var createCloseClaimModalObjectBeta = function (claim, isLastClaim) {
        return {
          templateUrl:
            'App/BusinessCenter/insurance/claims/close-claim-popup-mdtr/close-claim-popup-mdtr.html',
          backdrop: 'static',
          keyboard: false,
          size: 'lg',
          windowClass: 'center-modal',
          controller: 'CloseClaimModalControllerBeta',
          amfa: 'soar-acct-insinf-view',
          resolve: {
            closeClaimObject: function () {
              return {
                patientId: claim.PatientId,
                claimId: claim.ClaimId,
                DateOfServices: factory.formatClaimDisplayDate(claim),
                patientName: claim.PatientName,
                hasMultipleTransactions: true,
                fromPatitentSummary: false,
                isFromInsurancePayment: true,
                closeClaimButtonName: localize.getLocalizedString(
                  'Close Claim' + (isLastClaim ? '' : ' & Continue')
                ),
                TotalEstimatedInsurance: claim.TotalEstimatedInsurance,
              };
            },
          },
        };
      };

      var createAdjustmentModalObject = function (claim, benefitPlan) {
        var service = null;
        var note = '';
        if (claim.ServiceTransactionToClaimPaymentDtos.length === 1) {
          service = claim.ServiceTransactionToClaimPaymentDtos[0];
          if (service.AllowedAmount != service.OriginalAllowedAmount) {
            note = 'Allowed amount was updated from ' + service.OriginalAllowedAmount + ' to ' + service.AllowedAmount + '.';
          }
        }
        else if (claim.ServiceTransactionToClaimPaymentDtos.length > 1) {
          if (_.some(claim.ServiceTransactionToClaimPaymentDtos, function (service) {
            return service.AllowedAmount != service.OriginalAllowedAmount;
          })) {
            note = 'Allowed amount was updated at time of payment for one or more services.';
          }
        }
        return {
          PatientAccountDetails: { AccountId: claim.AccountId },
          DefaultSelectedIndex: 1,
          AllProviders: factory.providers.values,
          BenefitPlanId: claim.BenefitId,
          claimAmount: 0,
          isFeeScheduleAdjustment: true,
          claimId: claim.ClaimId,
          note: note,
          serviceTransactionData: {
            serviceTransactions: _.map(
              claim.ServiceTransactionToClaimPaymentDtos,
              'ServiceTransactionId'
            ),
            isForCloseClaim: true,
            unPaidAmout: _.reduce(
              claim.ServiceTransactionToClaimPaymentDtos,
              function (sum, item) {
                return sum + item.AdjustedEstimate;
              },
              0
            ),
          },
          patientData: {
            patientId: claim.PatientId,
            patientName: claim.PatientName,
          },
          BenefitPlan: benefitPlan,
        };
      };

      var createCreditTransactionDetails = function (
        claims,
        oldCreditTransaction,
        CreditTransactionDateEntered
      ) {
        var creditTransactionDetails = [];
        angular.forEach(claims, function (claim) {
          angular.forEach(
            claim.ServiceTransactionToClaimPaymentDtos,
            function (serviceTransactionDetail) {
              if (
                claim.PaymentAmount > 0 ||
                claim.FinalPayment ||
                oldCreditTransaction
              ) {
                // if editing we are allowed to have $0 payment and not close the claim
                var detail = {
                  AccountMemberId: serviceTransactionDetail.AccountMemberId,
                  Amount: Math.abs(serviceTransactionDetail.PaymentAmount),
                  AppliedToServiceTransationId:
                    serviceTransactionDetail.ServiceTransactionId,
                  AppliedToDebitTransactionId: null,
                  DateEntered: CreditTransactionDateEntered,
                  ProviderUserId: serviceTransactionDetail.ProviderUserId,
                  EncounterId: serviceTransactionDetail.EncounterId,
                  ObjectState: saveStates.Add,
                };

                if (oldCreditTransaction) {
                  if (oldCreditTransaction.CreditTransactionId)
                    detail.CreditTransactionId =
                      oldCreditTransaction.CreditTransactionId;
                }

                creditTransactionDetails.push(detail);
              }
            }
          );
        });
        if (oldCreditTransaction) {
          angular.forEach(
            oldCreditTransaction.CreditTransactionDetails,
            function (item) {
              item.ObjectState = saveStates.Delete;
              item.Amount = Math.abs(item.Amount);
              creditTransactionDetails.push(item);
            }
          );
        }
        return creditTransactionDetails;
      };

      var CreditTransactionDateEntered;
      var createCreditTransactionObject = function (
        creditTransaction,
        claims,
        oldCreditTransaction
      ) {
        CreditTransactionDateEntered = $filter('setDateTime')(
          creditTransaction.DateEntered
        );

        let creditTransactionObject = {
          DateEntered: CreditTransactionDateEntered,
          IsAllAccountMembersSelected: true,
          LocationId: sessionStorage['userLocation']
            ? JSON.parse(sessionStorage.getItem('userLocation')).id
            : 0,
          AccountId: creditTransaction.AccountId
            ? creditTransaction.AccountId
            : claims[0].AccountId,
          Amount: claims[0].PaymentAmount,
          ClaimId: oldCreditTransaction
            ? oldCreditTransaction.ClaimId
            : claims[0].ClaimId,
          Note: claims[0].Note,
          PaymentTypeId: creditTransaction.InsurancePaymentTypeId,
          TransactionTypeId: 3,
          CreditTransactionDetails: createCreditTransactionDetails(
            claims,
            oldCreditTransaction,
            CreditTransactionDateEntered
          ),
          PaymentGatewayTransactionId:
           creditTransaction.PaymentGatewayTransactionId,
          PaymentTypePromptValue: creditTransaction.PaymentTypePromptValue,
          DataTag: oldCreditTransaction ? oldCreditTransaction.DataTag : null,
          BulkCreditTransactionId: oldCreditTransaction
            ? oldCreditTransaction.BulkCreditTransactionId
            : null,
        };

        if (oldCreditTransaction) {
          if (oldCreditTransaction.CreditTransactionId)
            creditTransactionObject.CreditTransactionId =
              oldCreditTransaction.CreditTransactionId;
          if (oldCreditTransaction.EnteredByUserId)
            creditTransactionObject.EnteredByUserId =
              oldCreditTransaction.EnteredByUserId;
        }

        return creditTransactionObject;
      };

      var createCreditTransactions = function (bulkPaymentInfo, claims) {
        var creditTransactionList = [];
        angular.forEach(claims, function (claim) {
          if (claim.PaymentAmount > 0 || claim.FinalPayment) {
            creditTransactionList.push(
              createCreditTransactionObject(bulkPaymentInfo, [claim])
            );
          }
        });
        return creditTransactionList;
      };

      var createCarriersListObject = function (
        bulkPaymentInfo,
        claims,
        oldBulkPaymentInfo
      ) {
        let carrier = {
          LocationId: oldBulkPaymentInfo
            ? oldBulkPaymentInfo.LocationId
            : sessionStorage['userLocation']
            ? JSON.parse(sessionStorage.getItem('userLocation')).id
            : 0,
          DateEntered: oldBulkPaymentInfo
            ? bulkPaymentInfo.DateEntered
            : $filter('setDateTime')(bulkPaymentInfo.DateEntered),
          PaymentTypeId: bulkPaymentInfo.InsurancePaymentTypeId,
          PaymentTypePromptValue: bulkPaymentInfo.PaymentTypePromptValue,
          Note: bulkPaymentInfo.Note,
          BulkCreditTransactionType: oldBulkPaymentInfo
            ? oldBulkPaymentInfo.BulkCreditTransactionType
            : bulkPaymentInfo.BulkCreditTransactionType,
          UpdatedEstimates: bulkPaymentInfo.UpdatedEstimates,
          PaymentGatewayTransactionId: oldBulkPaymentInfo
            ? oldBulkPaymentInfo.PaymentGatewayTransactionId
            : bulkPaymentInfo.PaymentGatewayTransactionId,
          EraHeaderId: oldBulkPaymentInfo
            ? oldBulkPaymentInfo.EraHeaderId
              ? oldBulkPaymentInfo.EraHeaderId
              : oldBulkPaymentInfo.EraId
            : bulkPaymentInfo.EraHeaderId
            ? bulkPaymentInfo.EraHeaderId
            : bulkPaymentInfo.EraId,
          DataTag: oldBulkPaymentInfo ? oldBulkPaymentInfo.DataTag : null,
          CarrierId: claims[0].CarrierId,
          CreditTransactions: oldBulkPaymentInfo
            ? null
            : createCreditTransactions(bulkPaymentInfo, claims),
        };

        if (oldBulkPaymentInfo) {
          if (oldBulkPaymentInfo.BulkCreditTransactionId)
            carrier.BulkCreditTransactionId =
              oldBulkPaymentInfo.BulkCreditTransactionId;
          if (oldBulkPaymentInfo.EnteredByUserId)
            carrier.EnteredByUserId = oldBulkPaymentInfo.EnteredByUserId;
        }

        return carrier;
      };

      var createBulkCreditTransaction = function (
        bulkPaymentInfo,
        claims,
        oldBulkPaymentInfo
      ) {
        var bulkCreditTransactionList = [];

        var paymentCarriers = _.filter(claims, function (claim) {
          return claim.PaymentAmount !== null;
        });
        var groupByCarriers = _.groupBy(paymentCarriers, 'CarrierId');
        angular.forEach(groupByCarriers, function (Carrier) {
          bulkCreditTransactionList.push(
            createCarriersListObject(
              bulkPaymentInfo,
              Carrier,
              oldBulkPaymentInfo
            )
          );
        });
        return bulkCreditTransactionList;
      };

      var createBulkInsurancePaymentObject = function (
        bulkPaymentInfo,
        claims,
        oldBulkPaymentInfo
      ) {
        let bulkInsurancePaymentObject = {
          CarrierId: claims[0].CarrierId,
          LocationId: oldBulkPaymentInfo
            ? oldBulkPaymentInfo.LocationId
            : sessionStorage['userLocation']
            ? JSON.parse(sessionStorage.getItem('userLocation')).id
            : 0,
          DateEntered: oldBulkPaymentInfo
            ? bulkPaymentInfo.DateEntered
            : $filter('setDateTime')(bulkPaymentInfo.DateEntered),
          PaymentTypeId: bulkPaymentInfo.InsurancePaymentTypeId,
          PaymentTypePromptValue: bulkPaymentInfo.PaymentTypePromptValue,
          Note: bulkPaymentInfo.Note,
          BulkCreditTransactionType: oldBulkPaymentInfo
            ? oldBulkPaymentInfo.BulkCreditTransactionType
            : bulkPaymentInfo.BulkCreditTransactionType,
          CreditTransactions: oldBulkPaymentInfo
            ? null
            : createCreditTransactions(bulkPaymentInfo, claims),
          UpdatedEstimates: bulkPaymentInfo.UpdatedEstimates,
          PaymentGatewayTransactionId: oldBulkPaymentInfo
            ? oldBulkPaymentInfo.PaymentGatewayTransactionId
            : bulkPaymentInfo.PaymentGatewayTransactionId,
          EraHeaderId: oldBulkPaymentInfo
            ? oldBulkPaymentInfo.EraHeaderId
              ? oldBulkPaymentInfo.EraHeaderId
              : oldBulkPaymentInfo.EraId
            : bulkPaymentInfo.EraHeaderId
            ? bulkPaymentInfo.EraHeaderId
            : bulkPaymentInfo.EraId,
          DataTag: oldBulkPaymentInfo ? oldBulkPaymentInfo.DataTag : null,
          BulkCreditTransactions: createBulkCreditTransaction(
            bulkPaymentInfo,
            claims,
            oldBulkPaymentInfo
          ),
        };

        if (oldBulkPaymentInfo) {
          if (oldBulkPaymentInfo.BulkCreditTransactionId)
            bulkInsurancePaymentObject.BulkCreditTransactionId =
              oldBulkPaymentInfo.BulkCreditTransactionId;
          if (oldBulkPaymentInfo.EnteredByUserId)
            bulkInsurancePaymentObject.EnteredByUserId =
              oldBulkPaymentInfo.EnteredByUserId;
        }

        return bulkInsurancePaymentObject;
      };

      var needsOpenEdge = function (
        creditTransaction,
        location,
        claims,
        paymentType
      ) {
        //location has to be set up, has to be a credit currency type, and only one claim is being submitted
        return (
          location.IsPaymentGatewayEnabled &&
          paymentType &&
          paymentType.CurrencyTypeId === 3 &&
          creditTransaction.AccountId && 
          !(
            _.filter(claims, function (claim) {
              return claim.PaymentAmount > 0 || claim.FinalPayment;
            }).length > 1
          )
        );
      };

      var needsWriteOff = function (claim, benefitPlan) {
        var adjustedEstimates = _.reduce(
          claim.ServiceTransactionToClaimPaymentDtos,
          function (sum, item) {
            return sum + item.AdjustedEstimate;
          },
          0
        );
        return (
          benefitPlan &&
          benefitPlan.ApplyAdjustments === 2 &&
          benefitPlan.FeesIns === 2 &&
          adjustedEstimates > 0
        );
      };

      // distribute insurance payment v1 - distribute up to est ins
      factory.distributeAmountToServices = function (
        amount,
        claims,
        successCallback,
        failureCallback
      ) {
        var transactions = _(claims)
          .chain()
          .map('ServiceTransactionToClaimPaymentDtos')
          .flattenDeep()
          .value();
        patientServices.ClaimServiceTransactions.creditdistribution(
          { Amount: amount },
          transactions,
          factory.distributeAmountToServicesSuccess(claims, successCallback),
          failureCallback
        );
      };

      // distribute insurance payment v2 - distribute up to remaining charge
      factory.distributeCreditToServices = function (
        amount,
        claims,
        successCallback,
        failureCallback
      ) {
        var transactions = _(claims)
          .chain()
          .map('ServiceTransactionToClaimPaymentDtos')
          .flattenDeep()
          .value();
        patientServices.ClaimServiceTransactions.creditdistributions(
          { Amount: amount },
          transactions,
          factory.distributeAmountToServicesSuccess(claims, successCallback),
          failureCallback
        );
      };

      factory.distributeAmountToServicesSuccess = function (
        claims,
        successCallback
      ) {
        return function (response) {
          angular.forEach(claims, function (claim) {
            angular.forEach(
              claim.ServiceTransactionToClaimPaymentDtos,
              function (service) {
                var returned = _.find(response.Value, function (svc) {
                  return (
                    svc.AppliedToServiceTransationId ===
                    service.ServiceTransactionId
                  );
                });
                service.PaymentAmount = returned ? returned.Amount : 0;
              }
            );
            claim.PaymentAmount = _.reduce(
              _.map(
                claim.ServiceTransactionToClaimPaymentDtos,
                'PaymentAmount'
              ),
              function (previousValue, currentValue) {
                return previousValue + currentValue;
              }
            );
          });
          successCallback();
        };
      };

      //edit insurance payment (next 2 methods): update the credit transactions and details and then close each claim marked Final Payment
      factory.update = function (
        creditTransaction,
        claims,
        oldCreditTransaction,
        successCallback,
        failureCallback
      ) {
        patientServices.CreditTransactions.updateBulkInsurancePayment(
          createBulkInsurancePaymentObject(
            creditTransaction,
            claims,
            oldCreditTransaction
          ),
          factory.closeClaims(
            _.filter(claims, function (claim) {
              return claim.FinalPayment;
            }),
            successCallback
          ),
          failureCallback
        );
      };

      factory.closeClaims = function (remainingClaimsToClose, successCallback) {
        return function () {
          toastrFactory.success(
            localize.getLocalizedString(
              'Insurance payment updated successfully'
            ),
            localize.getLocalizedString('Success')
          );
          if (remainingClaimsToClose.length > 0) {
            modalFactory
              .Modal(
                createCloseClaimModalObject(
                  remainingClaimsToClose[0],
                  remainingClaimsToClose.length === 1
                )
              )
              .result.then(
                factory.closeClaims(
                  remainingClaimsToClose.slice(
                    1,
                    remainingClaimsToClose.length
                  ),
                  successCallback
                ),
                factory.closeClaims(
                  remainingClaimsToClose.slice(1, remainingClaimsToClose.length)
                ),
                successCallback
              );
          } else {
            successCallback();
          }
        };
      };

      factory.closeClaimsBeta = function (
        remainingClaimsToClose,
        successCallback
      ) {
        return function () {
          toastrFactory.success(
            localize.getLocalizedString(
              'Insurance payment updated successfully'
            ),
            localize.getLocalizedString('Success')
          );
          if (remainingClaimsToClose.length > 0) {
            modalFactory
              .Modal(
                createCloseClaimModalObjectBeta(
                  remainingClaimsToClose[0],
                  remainingClaimsToClose.length === 1
                )
              )
              .result.then(
                factory.closeClaimsBeta(
                  remainingClaimsToClose.slice(
                    1,
                    remainingClaimsToClose.length
                  ),
                  successCallback
                ),
                factory.closeClaimsBeta(
                  remainingClaimsToClose.slice(1, remainingClaimsToClose.length)
                ),
                successCallback
              );
          } else {
            successCallback();
          }
        };
      };


      //add insurance payment (next 6 methods): run open edge (if necessary), handle a partial payment response (if necessary), create the credit transaction and details, then
      //  for each claim marked Final Payment:
      //    - ask user if they want to do write-off (if necessary)
      //    - open write-off modal (if necessary)
      //    - close claim
      factory.addInsurancePayment = function (
        bulkPaymentInfo,
        claims,
        paymentType,
        successCallback,
        failureCallback
      ) {
        locationServices.get(
          { Id: JSON.parse(sessionStorage.getItem('userLocation')).id },
          function (res) {
            if (
              needsOpenEdge(bulkPaymentInfo, res.Value, claims, paymentType)
            ) {
              paymentGatewayService.createCreditForInsurance(
                bulkPaymentInfo.AccountId,
                bulkPaymentInfo.Amount,
                1,
                false,
                factory.handlePartialPayment(
                  bulkPaymentInfo,
                  claims,
                  successCallback,
                  failureCallback,
                ),
                failureCallback
              );
            } else {
              //only final payment claims will be closed, do those with fee schedule adjustment first.
              var claimsToClose = _(claims)
                .chain()
                .filter(function (claim) {
                  return claim.FinalPayment;
                })
                .sortBy('TotalEstInsuranceAdj')
                .value()
                .reverse();

              patientServices.CreditTransactions.applyBulkInsurancePayment(
                createBulkInsurancePaymentObject(bulkPaymentInfo, claims),
                factory.AddInsurancePaymentSuccess(
                  claimsToClose,
                  successCallback
                ),
                failureCallback
              );
            }
          }
        );
      };

      // process all bulk insurance payments and close claims if requested
      factory.addInsurancePayments = function (
        bulkPaymentInfo,
        claims,
        paymentType,
        successCallback,
        failureCallback
      ) {
        var payerId = bulkPaymentInfo.PayerId ? bulkPaymentInfo.PayerId : null;
        // get a list of claims to close,
        // only final payment claims will be closed, do those with fee schedule adjustment first.
        var claimsToClose = _(claims)
          .chain()
          .filter(function (claim) {
            return claim.FinalPayment;
          })
          .sortBy('TotalEstInsuranceAdj')
          .value()
          .reverse();
        // create lisdt of bulkCreditTransactions to process
        var bulkCreditTransactionList = createBulkCreditTransaction(
          bulkPaymentInfo,
          claims
        );
        patientServices.CreditTransactions.applyBulkInsurancePayments(
          { payerId: payerId },
          bulkCreditTransactionList,
          factory.AddInsurancePaymentSuccessBeta(
            claimsToClose,
            successCallback
          ),
          failureCallback
        );
      };

      factory.handlePartialPayment = function (
        bulkPaymentInfo,
        claims,
        successCallback,
        failureCallback
      ) {
        return function (paymentGatewayId, approvedAmount) {
          bulkPaymentInfo.PaymentGatewayTransactionId = paymentGatewayId;
          if (approvedAmount) {
            bulkPaymentInfo.Amount = approvedAmount;
            factory.distributeAmountToServices(
              approvedAmount,
              claims,
              function () {
                //only final payment claims will be closed, do those with fee schedule adjustment first.
                var claimsToClose = _(claims)
                  .chain()
                  .filter(function (claim) {
                    return claim.FinalPayment;
                  })
                  .sortBy('TotalEstInsuranceAdj')
                  .value()
                  .reverse();
                patientServices.CreditTransactions.applyBulkInsurancePayments(
                  createBulkCreditTransaction(bulkPaymentInfo, claims),
                  factory.AddInsurancePaymentSuccess(
                    claimsToClose,
                    successCallback
                  ),
                  failureCallback
                );
              }
            );
          } else {
            //only final payment claims will be closed, do those with fee schedule adjustment first.
            var claimsToClose = _(claims)
              .chain()
              .filter(function (claim) {
                return claim.FinalPayment;
              })
              .sortBy('TotalEstInsuranceAdj')
              .value()
              .reverse();
            patientServices.CreditTransactions.applyBulkInsurancePayments(
              createBulkCreditTransaction(bulkPaymentInfo, claims),
              factory.AddInsurancePaymentSuccess(
                claimsToClose,
                successCallback
              ),
              failureCallback
            );
          }
        };
      };

      factory.AddInsurancePaymentSuccess = function (
        claimsToClose,
        successCallback
      ) {
        return function () {
          toastrFactory.success(
            localize.getLocalizedString(
              'Insurance payment applied successfully'
            ),
            localize.getLocalizedString('Success')
          );
          factory.writeOffAndCloseClaims(claimsToClose, successCallback)();
        };
      };

      factory.AddInsurancePaymentSuccessBeta = function (
        claimsToClose,
        successCallback
      ) {
        return function () {
          toastrFactory.success(
            localize.getLocalizedString(
              'Insurance payment applied successfully'
            ),
            localize.getLocalizedString('Success')
          );
          factory.writeOffAndCloseClaimsBeta(claimsToClose, successCallback)();
        };
      };

      factory.writeOffAndCloseClaims = function (
        remainingClaimsToClose,
        successCallback
      ) {
        return function () {
          if (remainingClaimsToClose.length > 0) {
            commonServices.Insurance.BenefitPlan.getById(
              { BenefitId: remainingClaimsToClose[0].BenefitPlanId },
              function (res) {
                if (needsWriteOff(remainingClaimsToClose[0], res.Value)) {
                  modalFactory
                    .ConfirmModal(title, message, button1Text, button2Text)
                    .then(
                      factory.openAdjustmentModal(
                        remainingClaimsToClose,
                        successCallback,
                        res.Value
                      ),
                      factory.closeClaim(
                        remainingClaimsToClose,
                        successCallback
                      )
                    );
                } else {
                  factory.closeClaim(remainingClaimsToClose, successCallback)();
                }
              }
            );
          } else {
            successCallback();
          }
        };
      };

      factory.writeOffAndCloseClaimsBeta = function (
        remainingClaimsToClose,
        successCallback
      ) {
        return function () {
          if (remainingClaimsToClose.length > 0) {
            commonServices.Insurance.BenefitPlan.getById(
              { BenefitId: remainingClaimsToClose[0].BenefitPlanId },
              function (res) {
                if (needsWriteOff(remainingClaimsToClose[0], res.Value)) {
                  modalFactory
                    .ConfirmModal(title, message, button1Text, button2Text)
                    .then(
                      factory.openAdjustmentModalBeta(
                        remainingClaimsToClose,
                        successCallback,
                        res.Value
                      ),
                      factory.closeClaimBeta(
                        remainingClaimsToClose,
                        successCallback
                      )
                    );
                } else {
                  factory.closeClaimBeta(
                    remainingClaimsToClose,
                    successCallback
                  )();
                }
              }
            );
          } else {
            successCallback();
          }
        };
      };

      factory.openAdjustmentModal = function (
        claims,
        successCallback,
        benefitPlan
      ) {
        return function () {
          modalDataFactory
            .GetTransactionModalData(
              createAdjustmentModalObject(claims[0], benefitPlan),
              claims[0].PatientId
            )
            .then(function (result) {
              modalFactory.TransactionModal(
                result,
                factory.closeClaim(claims, successCallback),
                factory.closeClaim(claims, successCallback)
              );
            });
        };
      };

      factory.openAdjustmentModalBeta = function (
        claims,
        successCallback,
        benefitPlan
      ) {
        return function () {
          modalDataFactory
            .GetTransactionModalData(
              createAdjustmentModalObject(claims[0], benefitPlan),
              claims[0].PatientId
            )
            .then(function (result) {
              modalFactory.TransactionModal(
                result,
                factory.closeClaimBeta(claims, successCallback),
                factory.closeClaimBeta(claims, successCallback)
              );
            });
        };
      };

      factory.closeClaim = function (claims, successCallback) {
        return function () {
          modalFactory
            .Modal(createCloseClaimModalObject(claims[0], claims.length === 1))
            .result.then(
              factory.writeOffAndCloseClaims(
                claims.slice(1, claims.length),
                successCallback
              ),
              factory.writeOffAndCloseClaims(
                claims.slice(1, claims.length),
                successCallback
              )
            );
        };
      };

      factory.closeClaimBeta = function (claims, successCallback) {
        return function () {
          modalFactory
            .Modal(
              createCloseClaimModalObjectBeta(claims[0], claims.length === 1)
            )
            .result.then(
              factory.writeOffAndCloseClaimsBeta(
                claims.slice(1, claims.length),
                successCallback
              ),
              factory.writeOffAndCloseClaimsBeta(
                claims.slice(1, claims.length),
                successCallback
              )
            );
        };
      };

      return {
        access: function () {
          return factory.authAccess();
        },
        getClaimServices: function (claimList) {
          return factory.getClaimServices(claimList);
        },
        distributeAmountToServices: function (
          amount,
          claims,
          successCallback,
          failureCallback
        ) {
          return factory.distributeAmountToServices(
            amount,
            claims,
            successCallback,
            failureCallback
          );
        },
        distributeCreditToServices: function (
          amount,
          claims,
          successCallback,
          failureCallback
        ) {
          return factory.distributeCreditToServices(
            amount,
            claims,
            successCallback,
            failureCallback
          );
        },
        applyInsurancePayment: function (
          creditTransaction,
          claims,
          paymentType,
          successCallback,
          failureCallback
        ) {
          return factory.addInsurancePayment(
            creditTransaction,
            claims,
            paymentType,
            successCallback,
            failureCallback
          );
        },
        applyInsurancePayments: function (
          creditTransaction,
          claims,
          paymentType,
          successCallback,
          failureCallback
        ) {
          return factory.addInsurancePayments(
            creditTransaction,
            claims,
            paymentType,
            successCallback,
            failureCallback
          );
        },
        addSelectedClaims: function (claims) {
          return factory.addSelectedClaims(claims);
        },
        getSelectedClaims: function () {
          return factory.getSelectedClaims();
        },
        removeSelectedClaims: function () {
          return factory.removeSelectedClaims();
        },
        updateInsurancePayment: function (
          creditTransaction,
          claims,
          oldCreditTransaction,
          successCallback,
          failureCallback
        ) {
          return factory.update(
            creditTransaction,
            claims,
            oldCreditTransaction,
            successCallback,
            failureCallback
          );
        },
        formatClaimDisplayDate: function (claim) {
          return factory.formatClaimDisplayDate(claim);
        },
        completeInsurancePaymentTransaction :function(transactionInformation,bulkPaymentInfo,claims,successCallback,failureCallback){
          return paymentGatewayService.completeCreditTransaction(
             transactionInformation,
             2,
             factory.handlePartialPayment(
               bulkPaymentInfo,
               claims,
               successCallback,
               failureCallback,
             ),
             failureCallback
           );
         },
      };
    },
  ])
  // Gets all of the information for a patients account
  // such as credit, debit, and service transaction information, claim information, and encounter information
  .factory('PatientAccountSummary', [
    'PatientServices',
    '$filter',
    'localize',
    'ListHelper',
    '$q',
    'toastrFactory',
    '$timeout',
    'patSecurityService',
    function (
      patientServices,
      $filter,
      localize,
      listHelper,
      $q,
      toastrFactory,
      $timeout,
      patSecurityService
    ) {
      var getAccountSummary = function (accountData) {
        var defer = $q.defer();
        var promise = defer.promise;

        patientServices.AccountSummary.getAccountSummary(
          accountData
        ).$promise.then(
          function (res) {
            var data = res.Value;
            promise = $.extend(promise, { data: data });
            defer.resolve(res);
            //TODO toastr?
          },
          function () {
            toastrFactory.error(
              localize.getLocalizedString(
                'Failed to retrieve the account summary. Refresh the page to try again.',
                ['']
              ),
              localize.getLocalizedString('Server Error')
            );
          }
        );
        return promise;
      };
      return {
        // get all notes
        getAccountSummary: function (accountData) {
          return getAccountSummary(accountData);
        },
      };
    },
  ])

  .factory('DeleteInsurancePaymentFactory', [
    'PatientServices',
    function (patientServices) {
      //factory instance
      var factory = this;

      // Prepare DeletedCreditTransactionDto from CreditTransactionDto
      factory.processDeletedCreditTransactionDto = function (
        creditTransactionDto
      ) {
        return {
          CreditTransactionId: creditTransactionDto.CreditTransactionId,
          AccountId: creditTransactionDto.AccountId,
          DataTag: creditTransactionDto.DataTag,
          DeletedCreditTransactionDetailDtos: [],
        };
      };

      // Prepare DeletedCreditTransactionDetailDtos from CreditTransactionDetailDtos
      factory.processDeletedCreditTransactionDetailDto = function (
        creditTransactionDetailDto
      ) {
        var deletedCreditTransactionDtos = [];
        _.each(creditTransactionDetailDto, function (serviceDto) {
          var deletedCreditTransactionDetail = {
            CreditTransactionDetailId: serviceDto.CreditTransactionDetailId,
            AccountMemberId: serviceDto.AccountMemberId,
            CreditTransactionId: serviceDto.CreditTransactionId,
            DataTag: serviceDto.DataTag,
          };
          deletedCreditTransactionDtos.push(deletedCreditTransactionDetail);
        });
        return deletedCreditTransactionDtos;
      };

      //Prepare deleteClaimPaymentDto from creditTransactionDto and claimPaymentDtos and call delete insurance payment api
      factory.deleteInsurancePayment = function (
        creditTransactionDto,
        claimPaymentDtos,
        estimateInsuranceOption = true
      ) {
        var deletedCreditTransactionDto = factory.processDeletedCreditTransactionDto(
          creditTransactionDto
        );
        deletedCreditTransactionDto.DeletedCreditTransactionDetailDtos = factory.processDeletedCreditTransactionDetailDto(
          creditTransactionDto.CreditTransactionDetails
        );

        var deleteClaimPaymentDto = {
          DeletedCreditTransactionDto: deletedCreditTransactionDto,
          ClaimPaymentDtos: claimPaymentDtos,
        };
        var requestParams = {
          accountId: creditTransactionDto.AccountId,
          calculateEstimatedInsurance: estimateInsuranceOption,
        };
        return patientServices.Claim.markInsurancePaymentAsDeleted(
          requestParams,
          deleteClaimPaymentDto
        ).$promise;
      };

      return {
        deleteInsurancePayment: function (
          creditTransactionDto,
          claimPaymentDtos,
          estimateInsuranceOption = true
        ) {
          return factory.deleteInsurancePayment(
            creditTransactionDto,
            claimPaymentDtos,
            estimateInsuranceOption
          );
        },
      };
    },
  ])
  .factory('PatientDocumentsFactory', [
    'DocumentService',
    '$q',
    'DocumentsLoadingService',
    'patSecurityService',
    'toastrFactory',
    'localize',
    '$http',
    'ModalFactory',
    'DocumentGroupsService',
    function (
      documentService,
      $q,
      documentsLoadingService,
      patSecurityService,
      toastrFactory,
      localize,
      $http,
      modalFactory,
      documentGroupsService
    ) {
      var factory = this;

      //#region authorization

      // amfas properties
      factory.soarAuthClinicalDocumentsViewKey = 'soar-doc-docimp-view';
      factory.soarAuthClinicalDocumentsAddKey = 'soar-doc-docimp-add';
      factory.soarAuthClinicalDocumentsEditKey = 'soar-doc-docimp-edit';
      factory.soarAuthClinicalDocumentsDeleteKey = 'soar-doc-docimp-delete';
      factory.documentPermissions = {
        hasDocumentsDeleteAccess: false,
        hasDocumentsViewAccess: false,
        hasDocumentsEditAccess: false,
        hasDocumentsAddAccess: false,
      };

      // check if logged in user has view access to documents
      factory.authAddAccessToDocuments = function () {
        return patSecurityService.IsAuthorizedByAbbreviation(
          factory.soarAuthClinicalDocumentsAddKey
        );
      };

      // check if logged in user has view access to documents
      factory.authEditAccessToDocuments = function () {
        return patSecurityService.IsAuthorizedByAbbreviation(
          factory.soarAuthClinicalDocumentsEditKey
        );
      };

      // check if logged in user has view access to documents
      factory.authDeleteAccessToDocuments = function () {
        return patSecurityService.IsAuthorizedByAbbreviation(
          factory.soarAuthClinicalDocumentsDeleteKey
        );
      };

      // check if logged in user has view access to documents
      factory.authViewAccessToDocuments = function () {
        return patSecurityService.IsAuthorizedByAbbreviation(
          factory.soarAuthClinicalDocumentsViewKey
        );
      };

      // Check access for documents
      factory.documentAccess = function () {
        if (factory.authViewAccessToDocuments()) {
          factory.documentPermissions.hasDocumentsViewAccess = true;
        }
        if (factory.authAddAccessToDocuments()) {
          factory.documentPermissions.hasDocumentsAddAccess = true;
        }
        if (factory.authEditAccessToDocuments()) {
          factory.documentPermissions.hasDocumentsEditAccess = true;
        }
        if (factory.authDeleteAccessToDocuments()) {
          factory.documentPermissions.hasDocumentsDeleteAccess = true;
        }
      };

      // #end region

      factory.updateDirectoryAllocationId = function (document) {
        var defer = $q.defer();
        var promise = defer.promise;
        if (factory.authEditAccessToDocuments()) {
          documentService
            .updateDirectoryAllocationId({
              locationId: document.$$LocationId,
              fileId: document.FileAllocationId,
              TransferToDirectoryAllocationId: document.$$DirectoryAllocationId,
            })
            .$promise.then(
              function (res) {
                promise = $.extend(promise, { values: res.Result });
                defer.resolve(res);
              },
              function () {
                toastrFactory.error(
                  localize.getLocalizedString(
                    'Failed to update the {0}.Please try again.',
                    ['file']
                  ),
                  localize.getLocalizedString('Server Error')
                );
              }
            );
        }
        return promise;
      };

      // get documents by patientId
      factory.getDocumentsByPatientId = function (patient) {
        var defer = $q.defer();
        var promise = defer.promise;
        documentService.get(
          { parentId: patient.PatientId, parentType: 'patient' },
          function (res) {
            promise = $.extend(promise, {
              values: res.Value,
            });
            defer.resolve(res);
          },
          function (res) {
            toastrFactory.error(
              localize.getLocalizedString('{0} {1}', [
                'Documents',
                'failed to load.',
              ]),
              localize.getLocalizedString('Server Error')
            );
          }
        );
        return promise;
      };

      // displaying document to user in a new tab
      factory.displayDocument = function (doc) {
        var filegetUri = '_fileapiurl_/api/files/content/';
        var targetUri = filegetUri + doc.FileAllocationId;
        var window = {};
        documentsLoadingService.executeDownload(targetUri, doc, window);
      };

      // Delete document
      factory.deleteDocument = function (document) {
        var defer = $q.defer();
        var promise = defer.promise;
        if (factory.documentPermissions.hasDocumentsDeleteAccess) {
          var filegetUri = '_fileapiurl_/api/files/';
          var targetUri = filegetUri + document.FileAllocationId;

          // delete the metadata
          documentService
            .delete({ documentId: document.DocumentId }, function (res) {
              promise = $.extend(promise, {
                values: res.Value,
              });
              defer.resolve(res);
            })
            .$promise.then(function () {
              // delete the blob
              $http
                .delete(targetUri)
                .then(function (res) {
                  if (res.status == 200) {
                    toastrFactory.success(
                      localize.getLocalizedString('{0} {1}', [
                        'Document',
                        'deleted successfully.',
                      ]),
                      localize.getLocalizedString('Success')
                    );
                  }
                })
                .catch(function () {
                  toastrFactory.error(
                    localize.getLocalizedString('{0} {1}', [
                      'Document',
                      'failed to delete.',
                    ]),
                    localize.getLocalizedString('Server Error')
                  );
                });
            });
        }
        return promise;
      };

      // Get all document groups
      factory.getAllDocumentGroups = function () {
        var defer = $q.defer();
        var promise = defer.promise;
        documentGroupsService.getAll(
          function (res) {
            promise = $.extend(promise, {
              values: res.Value,
            });
            defer.resolve(res);
          },
          function (res) {
            toastrFactory.error(
              localize.getLocalizedString('{0} {1}', [
                'Document Groups',
                'failed to load.',
              ]),
              localize.getLocalizedString('Server Error')
            );
          }
        );

        return promise;
      };

      return {
        selectedFilter: '',
        GetDocumentsByPatientId: function (patient) {
          return factory.getDocumentsByPatientId(patient);
        },
        DisplayDocument: function (doc) {
          return factory.displayDocument(doc);
        },
        UpdateDirectoryAllocationId: function (document) {
          return factory.updateDirectoryAllocationId(document);
        },
        GetDocumentAccess: function () {
          factory.documentAccess();
          return factory.documentPermissions;
        },
        DeleteDocument: function (document) {
          factory.documentAccess();
          return factory.deleteDocument(document);
        },
        GetAllDocumentGroups: function () {
          return factory.getAllDocumentGroups();
        },
      };
    },
  ])
  .factory('MedicalHistoryFactory', [
    'PatientServices',
    '$filter',
    'localize',
    '$q',
    'toastrFactory',
    '$timeout',
    'patSecurityService',
    'ListHelper',
    'CustomFormsService',
    function (
      patientServices,
      $filter,
      localize,
      $q,
      toastrFactory,
      $timeout,
      patSecurityService,
      listHelper,
      customFormsService
    ) {
      var factory = this;
      // maintains a list of dependent observers
      var observers = [];

      var medicalHistory = {};

      //#region authorization

      var medicalHistoryAccess = { Create: false, View: false };

      //soar-per-perhst-add to be added
      var medicalHistoryCreateAccess = function () {
        return patSecurityService.IsAuthorizedByAbbreviation(
          'soar-per-perhst-add'
        );
      };

      //soar-per-perhst-view
      var medicalHistoryViewAccess = function () {
        return patSecurityService.IsAuthorizedByAbbreviation(
          'soar-per-perhst-view'
        );
      };

      // NOTE, currently no need for edit and delete amfas
      factory.getMedicalHistoryAccess = function () {
        if (!medicalHistoryViewAccess()) {
        } else {
          medicalHistoryAccess.Create = medicalHistoryCreateAccess();
          medicalHistoryAccess.View = true;
        }
        return medicalHistoryAccess;
      };

      //#endregion

      //#region load form data
      factory.setAnswerToNo = function (form) {
        for (
          var sectionIndex = 0;
          sectionIndex < form.FormSections.length;
          sectionIndex++
        ) {
          for (
            var sectionItemIndex = 0;
            sectionItemIndex <
            form.FormSections[sectionIndex].FormSectionItems.length;
            sectionItemIndex++
          ) {
            var item =
              form.FormSections[sectionIndex].FormSectionItems[sectionItemIndex]
                .FormBankItem;
            var formItemType =
              form.FormSections[sectionIndex].FormSectionItems[sectionItemIndex]
                .FormItemType;
            switch (formItemType) {
              case 2:
                item.Answer = 'No';
                break;
              case 8:
                item.Answer = 'No';
                break;
            }
          }
        }
      };

      //#endregion

      //#region crud
      factory.newMedicalHistoryForm = function () {
        var defer = $q.defer();
        var promise = defer.promise;

        if (medicalHistoryCreateAccess()) {
          // enable next line and delete one after, also won't need form id
          customFormsService.medicalHistory().$promise.then(
            function (res) {
              medicalHistory = res.Value;
              promise = $.extend(promise, {
                values: res.Value,
              });
              defer.resolve(res);
            },
            function () {
              toastrFactory.error(
                localize.getLocalizedString(
                  'Failed to retrieve the {0}. Refresh the page to try again.',
                  ['Medical History Form']
                ),
                localize.getLocalizedString('Server Error')
              );
            }
          );
        }
        return promise;
      };

      factory.getById = function (personId) {
        var defer = $q.defer();
        var promise = defer.promise;

        if (medicalHistoryViewAccess()) {
          patientServices.MedicalHistory.getById({
            patientId: personId,
          }).$promise.then(
            function (res) {
              medicalHistory = res.Value;
              promise = $.extend(promise, {
                values: res.Value,
              });
              defer.resolve(res);
            },
            function () {
              toastrFactory.error(
                localize.getLocalizedString(
                  'Failed to retrieve the patients {0}. Refresh the page to try again.',
                  ['Medical History Form']
                ),
                localize.getLocalizedString('Server Error')
              );
            }
          );
        }
        return promise;
      };

      // Get the data for medical history form answers for the timeline tile
      factory.getByFormAnswersId = function (personId, formAnswerId) {
        var defer = $q.defer();
        var promise = defer.promise;

        if (medicalHistoryViewAccess()) {
          patientServices.MedicalHistory.getByFormAnswersId({
            patientId: personId,
            formAnswersId: formAnswerId,
          }).$promise.then(
            function (res) {
              promise = $.extend(promise, {
                values: res.Value,
              });
              defer.resolve(res);
            },
            function () {
              toastrFactory.error(
                localize.getLocalizedString(
                  'Failed to retrieve the answers for {0}. Refresh the page to try again.',
                  ['Medical History Forms']
                ),
                localize.getLocalizedString('Server Error')
              );
            }
          );
        }
        return promise;
      };

      // Get the data for medical history timeline tile
      factory.getSummariesByPatientId = function (personId) {
        var defer = $q.defer();
        var promise = defer.promise;

        if (medicalHistoryViewAccess()) {
          patientServices.MedicalHistory.getSummariesByPatientId({
            patientId: personId,
          }).$promise.then(
            function (res) {
              medicalHistory = res.Value;
              promise = $.extend(promise, {
                values: res.Value,
              });
              defer.resolve(res);
            },
            function () {
              toastrFactory.error(
                localize.getLocalizedString(
                  'Failed to retrieve the patients {0}. Refresh the page to try again.',
                  ['Medical History Forms']
                ),
                localize.getLocalizedString('Server Error')
              );
            }
          );
        }
        return promise;
      };

      factory.saveForm = function (personId, form) {
        var defer = $q.defer();
        var promise = defer.promise;
        if (medicalHistoryCreateAccess()) {
          patientServices.MedicalHistory.save(
            { patientId: personId },
            form
          ).$promise.then(
            function (res) {
              toastrFactory.success(
                localize.getLocalizedString('Your {0} has been updated.', [
                  'Medical History Form',
                ]),
                localize.getLocalizedString('Success')
              );
              var formAnswers = res.Value;
              promise = $.extend(promise, { values: res.Value });
              defer.resolve(res);
            },
            function () {
              toastrFactory.error(
                localize.getLocalizedString(
                  'Save was unsuccessful. Please retry your save.'
                ),
                localize.getLocalizedString('Server Error')
              );
            }
          );
        }
        return promise;
      };

      //#endregion

      return {
        access: function () {
          return factory.getMedicalHistoryAccess();
        },
        merge: function (res, medicalHistoryForm) {
          //return mergeSavedFormToCurrentForm(res, ActiveMedicalHistoryForm, medicalHistoryForm)
        },
        create: function () {
          return factory.newMedicalHistoryForm();
        },
        getById: function (personId) {
          return factory.getById(personId);
        },
        getByFormAnswersId: function (personId, formAnswersId) {
          return factory.getByFormAnswersId(personId, formAnswersId);
        },
        getSummariesByPatientId: function (personId) {
          return factory.getSummariesByPatientId(personId);
        },
        save: function (personId, form) {
          return factory.saveForm(personId, form);
        },
        UpdatingForm: false,
        SetUpdatingForm: function (flag) {
          this.UpdatingForm = flag;
        },
        ViewingForm: false,
        SetViewingForm: function (flag) {
          this.ViewingForm = flag;
        },
        LoadingForm: false,
        SetLoadingForm: function (flag) {
          this.LoadingForm = flag;
        },
        NewMedicalHistoryForm: null,
        SetNewMedicalHistoryForm: function (medicalHistoryForm) {
          this.NewMedicalHistoryForm = medicalHistoryForm;
        },
        ActiveMedicalHistoryForm: null,
        SetActiveMedicalHistoryForm: function (medicalHistoryForm) {
          this.ActiveMedicalHistoryForm = medicalHistoryForm;
        },
        DataChanged: false,
        SetDataChanged: function (flag) {
          this.DataChanged = flag;
        },
        SetYesNoToNo: function (form) {
          factory.setAnswerToNo(form);
        },
      };
    },
  ])
  .factory('PatientMedicalHistoryAlertsFactory', [
    'PatientServices',
    '$filter',
    'localize',
    '$q',
    'toastrFactory',
    '$timeout',
    'patSecurityService',
    'ListHelper',
    function (
      patientServices,
      $filter,
      localize,
      $q,
      toastrFactory,
      $timeout,
      patSecurityService,
      listHelper
    ) {
      var factory = this;
      // maintains a list of dependent observers
      var observers = [];
      factory.patientMedicalHistoryAlerts = [];

      //#region authorization

      var access = {
        View: false,
      };

      //soar-per-peralt-view
      var patientMedicalHistoryAlertsViewAccess = function () {
        return patSecurityService.IsAuthorizedByAbbreviation(
          'soar-per-peralt-view'
        );
      };

      // NOTE, currently only view for medical history alerts (note same as patient alerts)
      factory.getPatientMedicalHistoryAlertsAccess = function () {
        access.View = patientMedicalHistoryAlertsViewAccess();
        return access;
      };

      factory.addIconClass = function (medicalHistoryAlerts) {
        angular.forEach(medicalHistoryAlerts, function (medicalHistoryAlert) {
          switch (medicalHistoryAlert.MedicalHistoryAlertTypeId) {
            case 1:
              medicalHistoryAlert.IconClass = 'fi-allergies';
              break;
            case 3:
              medicalHistoryAlert.IconClass = 'fi-premed';
              break;
            default:
              medicalHistoryAlert.IconClass = 'fa fa-heart';
              break;
          }
        });
      };

      //#endregion

      //#region get

      // get medical history alerts by patient id
      factory.get = function (personId) {
        var defer = $q.defer();
        var promise = defer.promise;
        if (patientMedicalHistoryAlertsViewAccess()) {
          patientServices.PatientMedicalHistoryAlerts.get({
            patientId: personId,
          }).$promise.then(
            function (res) {
              factory.patientMedicalHistoryAlerts = res.Value;
              factory.addIconClass(res.Value);
              promise = $.extend(promise, {
                values: res.Value,
              });
              defer.resolve(res);
            },
            function () {
              toastrFactory.error(
                localize.getLocalizedString(
                  'Failed to retrieve the patients {0}. Refresh the page to try again.',
                  ['Patient Medical History Alerts']
                ),
                localize.getLocalizedString('Server Error')
              );
            }
          );
        }
        return promise;
      };

      //#endregion

      return {
        access: function () {
          return factory.getPatientMedicalHistoryAlertsAccess();
        },
        PatientMedicalHistoryAlerts: function (personId) {
          return factory.get(personId);
        },
        IconClass: function (medicalHistoryAlerts) {
          return factory.addIconClass(medicalHistoryAlerts);
        },
      };
    },
  ])

  .factory('PatientAppointmentsFactory', [
    'PatientServices',
    '$filter',
    'localize',
    '$q',
    'toastrFactory',
    '$timeout',
    'patSecurityService',
    'ListHelper',
    'SaveStates',
    'AppointmentService',
    function (
      patientServices,
      $filter,
      localize,
      $q,
      toastrFactory,
      $timeout,
      patSecurityService,
      listHelper,
      saveStates,
      appointmentService
    ) {
      var factory = this;
      // maintains a list of dependent observers

      factory.loadHistoryObserver = [];

      // appointment data object
      factory.appointmentData = function (patientInfo) {
        var providerAppointments = [
          {
            UserId: '',
            StartTime: null,
            EndTime: null,
            ObjectState: saveStates.Add,
          },
        ];
        var appointment = {
          AppointmentId: null,
          AppointmentTypeId: null,
          Classification: 0,
          EndTime: null,
          PersonId: patientInfo.PatientId,
          //PlannedServices: [],
          ProposedDuration: null,
          Providers: [],
          //ProviderAppointments: providerAppointments,
          ServiceCodes: [],
          StartTime: null,
          TreatmentRoomId: '',
          UserId: '',
          WasDragged: false,
          Location: null,
          ObjectState: saveStates.Add,
          Patient: patientInfo,
        };
        return appointment;
      };

      //#region authorization

      factory.hasAccess = {
        Create: false,
        Delete: false,
        Edit: false,
        View: false,
        Finish: false,
      };

      //TODO figure out the access
      factory.createAccess = function () {
        return patSecurityService.IsAuthorizedByAbbreviation(
          'soar-sch-sptapt-add'
        );
      };

      //soar-sch-sptapt-edit
      factory.editAccess = function () {
        return patSecurityService.IsAuthorizedByAbbreviation(
          'soar-sch-sptapt-edit'
        );
      };

      //soar-sch-sptapt-delete
      factory.deleteAccess = function () {
        return patSecurityService.IsAuthorizedByAbbreviation(
          'soar-sch-sptapt-delete'
        );
      };
      //soar-sch-sptapt-view
      factory.viewAccess = function () {
        return patSecurityService.IsAuthorizedByAbbreviation(
          'soar-sch-sptapt-view'
        );
      };
      //soar-sch-sptapt-finish
      factory.finishAccess = function () {
        return patSecurityService.IsAuthorizedByAbbreviation(
          'soar-sch-sptapt-finish'
        );
      };

      // NOTE, currently no need for edit and delete amfas
      factory.getAccess = function () {
        if (!factory.viewAccess()) {
        } else {
          factory.hasAccess.Create = factory.createAccess();
          factory.hasAccess.Edit = factory.editAccess();
          factory.hasAccess.Delete = factory.deleteAccess();
          factory.hasAccess.Finish = factory.finishAccess();
          factory.hasAccess.View = true;
        }
        return factory.hasAccess;
      };

      //#endregion

      //#region load form data

      factory.scheduledAppointmentCount = function (personId) {
        var defer = $q.defer();
        var promise = defer.promise;
        if (factory.viewAccess()) {
          // call to see if patient has scheduled appts in future ()
          patientServices.PatientAppointment.ScheduledCount({
            patientId: personId,
          }).$promise.then(
            function (res) {
              promise = $.extend(promise, { values: true });
              defer.resolve(res);
            },
            function () {
              toastrFactory.error(
                localize.getLocalizedString(
                  'Failed to retrieve {0}. Refresh the page to try again.',
                  ['scheduled appointments count']
                ),
                localize.getLocalizedString('Error')
              );
            }
          );
          return promise;
        }
      };

      //#endregion

      factory.appendAppointmentDetails = function (appointmentDetails) {
        var appointment = appointmentDetails.Appointment;
        appointmentService.AppendDetails(appointment, appointmentDetails);
        return appointment;
      };
      factory.getAppointmentDataWithoutDetails = function (appointmentId) {
        var defer = $q.defer();
        var promise = defer.promise;
        var params = {
          appointmentId: appointmentId,
          FillAppointmentType: true,
          FillLocation: true,
          FillPerson: false,
          FillProviders: false,
          FillRoom: false,
          FillProviderUsers: false,
          FillServices: false,
          FillServiceCodes: false,
          FillPhone: false,
          IncludeCompletedServices: false,
        };
        patientServices.PatientAppointment.GetWithDetails(params).$promise.then(
          function (res) {
            promise = $.extend(promise, { values: res.Value });
            defer.resolve(res);
          },
          function () {
            toastrFactory.error(
              localize.getLocalizedString(
                'Failed to retrieve {0}. Refresh the page to try again.',
                ['Appointment Details']
              ),
              localize.getLocalizedString('Server Error')
            );
          }
        );
        return promise;
      };
      factory.getAppointmentDataWithDetails = function (appointmentId) {
        var defer = $q.defer();
        var promise = defer.promise;
        var params = {
          appointmentId: appointmentId,
          FillAppointmentType: true,
          FillLocation: true,
          FillPerson: true,
          FillProviders: true,
          FillRoom: true,
          FillProviderUsers: true,
          FillServices: true,
          FillServiceCodes: true,
          FillPhone: true,
          IncludeCompletedServices: true,
        };
        patientServices.PatientAppointment.GetWithDetails(params).$promise.then(
          function (res) {
            promise = $.extend(promise, { values: res.Value });
            defer.resolve(res);
          },
          function () {
            toastrFactory.error(
              localize.getLocalizedString(
                'Failed to retrieve {0}. Refresh the page to try again.',
                ['Appointment Details']
              ),
              localize.getLocalizedString('Server Error')
            );
          }
        );
        return promise;
      };

      factory.getAccountAppointmentHistory = function (accountId) {
        if (factory.viewAccess()) {
          var defer = $q.defer();
          var promise = defer.promise;
          patientServices.AccountAppointmentHistory.get({
            accountId: accountId,
          }).$promise.then(
            function (res) {
              promise = $.extend(promise, { values: res });
              defer.resolve(res);
            },
            function (res) {
              toastrFactory.error(
                localize.getLocalizedString(
                  'Failed to retrieve the {0}. Refresh the page to try again.',
                  ['Account Appointment History']
                ),
                localize.getLocalizedString('Server Error')
              );
            }
          );
          return promise;
        }
      };

      factory.getAccountPastAppointments = function (accountId) {
        if (factory.viewAccess()) {
          var defer = $q.defer();
          var promise = defer.promise;
          patientServices.AccountPastAppointments.get({
            accountId: accountId,
          }).$promise.then(
            function (res) {
              promise = $.extend(promise, { values: res });
              defer.resolve(res);
            },
            function (res) {
              toastrFactory.error(
                localize.getLocalizedString(
                  'Failed to retrieve the {0}. Refresh the page to try again.',
                  ['Account Past Appointments']
                ),
                localize.getLocalizedString('Server Error')
              );
            }
          );
          return promise;
        }
      };

      factory.getPatientAppointmentHistory = function (personId) {
        if (factory.viewAccess()) {
          var defer = $q.defer();
          var promise = defer.promise;
          patientServices.PatientAppointmentHistory.get({
            patientId: personId,
          }).$promise.then(
            function (res) {
              promise = $.extend(promise, { values: res });
              defer.resolve(res);
            },
            function (res) {
              toastrFactory.error(
                localize.getLocalizedString(
                  'Failed to retrieve the {0}. Refresh the page to try again.',
                  ['Patient Appointment History']
                ),
                localize.getLocalizedString('Server Error')
              );
            }
          );
          return promise;
        }
      };

      factory.getPatientPastAppointments = function (personId) {
        if (factory.viewAccess()) {
          var defer = $q.defer();
          var promise = defer.promise;
          patientServices.PatientPastAppointments.get({
            patientId: personId,
          }).$promise.then(
            function (res) {
              promise = $.extend(promise, { values: res });
              defer.resolve(res);
            },
            function (res) {
              toastrFactory.error(
                localize.getLocalizedString(
                  'Failed to retrieve the {0}. Refresh the page to try again.',
                  ['Patient Past Appointments']
                ),
                localize.getLocalizedString('Server Error')
              );
            }
          );
          return promise;
        }
      };

      // returns true / false for whether user has a running appointment
      factory.getPatientHasRunningAppointment = function (personId) {
        if (factory.viewAccess()) {
          var defer = $q.defer();
          var promise = defer.promise;
          patientServices.PatientAppointment.CheckForRunningAppointment({
            patientId: personId,
          }).$promise.then(
            function (res) {
              promise = $.extend(promise, { values: res });
              defer.resolve(res);
            },
            function (res) {
              //toastrFactory.error(localize.getLocalizedString('Failed to retrieve the list of {0}. Refresh the page to try again', ['Appointments']), localize.getLocalizedString('Server Error'));
            }
          );
          return promise;
        }
      };

      return {
        access: function () {
          return factory.getAccess();
        },
        AppointmentData: function (patientInfo) {
          return factory.appointmentData(patientInfo);
        },
        AppointmentDataWithoutDetails: function (appointmentId) {
          return factory.getAppointmentDataWithoutDetails(appointmentId);
        },
        AppointmentDataWithDetails: function (appointmentId) {
          return factory.getAppointmentDataWithDetails(appointmentId);
        },
        AppendAppointmentData: function (appointmentDetails) {
          return factory.appendAppointmentDetails(appointmentDetails);
        },
        ScheduledAppointmentCount: function (personId) {
          return factory.scheduledAppointmentCount(personId);
        },
        PatientHistory: function (personId) {
          return factory.getPatientAppointmentHistory(personId);
        },
        AccountHistory: function (accountId) {
          return factory.getAccountAppointmentHistory(accountId);
        },
        PatientPastAppointments: function (personId) {
          return factory.getPatientPastAppointments(personId);
        },
        AccountPastAppointments: function (accountId) {
          return factory.getAccountPastAppointments(accountId);
        },
        LoadHistory: false,
        setLoadHistory: function (loadHistory) {
          this.LoadHistory = loadHistory;
          // notify subscribers to LoadHistory changes
          angular.forEach(factory.loadHistoryObserver, function (observer) {
            observer(loadHistory);
          });
        },
        PatientHasRunningAppointment: function (personId) {
          return factory.getPatientHasRunningAppointment(personId);
        },
        // subscribe to LoadHistory changes
        observeLoadHistory: function (observer) {
          factory.loadHistoryObserver.push(observer);
        },
      };
    },
  ])

  .factory('PersonFactory', [
    'PatientServices',
    '$filter',
    'localize',
    '$q',
    'toastrFactory',
    '$timeout',
    'patSecurityService',
    'ListHelper',
    'PersonServices',
    function (
      patientServices,
      $filter,
      localize,
      $q,
      toastrFactory,
      $timeout,
      patSecurityService,
      listHelper,
      personServices
    ) {
      var factory = this;
      // maintains a list of dependent observers
      factory.accountOverviewObservers = [];
      factory.overviewObservers = [];

      //#region authorization

      factory.hasAccess = {
        Create: false,
        Delete: false,
        Edit: false,
        View: false,
        Finish: false,
      };

      //figure out the access
      factory.createAccess = function () {
        return patSecurityService.IsAuthorizedByAbbreviation(
          'soar-per-perdem-add'
        );
      };

      factory.editAccess = function () {
        return patSecurityService.IsAuthorizedByAbbreviation(
          'soar-per-perdem-modify'
        );
      };

      factory.deleteAccess = function () {
        return patSecurityService.IsAuthorizedByAbbreviation(
          'ssoar-per-perdem-delete'
        );
      };

      factory.viewAccess = function () {
        return patSecurityService.IsAuthorizedByAbbreviation(
          'soar-per-perdem-view'
        );
      };

      factory.searchAccess = function () {
        return patSecurityService.IsAuthorizedByAbbreviation(
          'soar-per-perdem-search'
        );
      };

      factory.inactivatePatientAccess = function () {
        return patSecurityService.IsAuthorizedByAbbreviation(
          'soar-per-perdem-inactv'
        );
      };

      // NOTE, currently no need for edit and delete amfas
      factory.getAccess = function () {
        if (!factory.viewAccess()) {
        } else {
          factory.hasAccess.Create = factory.createAccess();
          factory.hasAccess.Edit = factory.editAccess();
          factory.hasAccess.Delete = factory.deleteAccess();
          factory.hasAccess.Search = factory.searchAccess();
          factory.hasAccess.InactivatePatient = factory.inactivatePatientAccess();
          factory.hasAccess.View = true;
        }
      };

      //#endregion

      //#region person activate inactivate

      factory.setPersonActiveStatus = function (
        personId,
        isActive,
        unschedule
      ) {
        var activationTask = 'Deactivation';
        if (isActive === true) {
          activationTask = 'Activation';
        }
        var defer = $q.defer();
        var promise = defer.promise;
        if (factory.inactivatePatientAccess()) {
          personServices.Persons.setActiveStatus(
            { Id: personId, unscheduleOnly: unschedule },
            isActive
          ).$promise.then(
            function (res) {
              toastrFactory.success(
                localize.getLocalizedString('{0} was successful.', [
                  activationTask,
                ]),
                localize.getLocalizedString('Success')
              );
              promise = $.extend(promise, { values: res.Value });
              defer.resolve(res);
            },
            function () {
              toastrFactory.error(
                localize.getLocalizedString(
                  '{0} was unsuccessful. Please retry your save.',
                  [activationTask]
                ),
                localize.getLocalizedString('Server Error')
              );
              defer.reject();
            }
          );
        }
        return promise;
      };

      factory.getPatientById = function (personId) {
        var defer = $q.defer();
        var promise = defer.promise;
        if (factory.viewAccess()) {
          patientServices.Patients.get({ Id: personId }).$promise.then(
            function (res) {
              promise = $.extend(promise, { values: res.Value });
              defer.resolve(res);
            },
            function () {
              toastrFactory.error(
                localize.getLocalizedString(
                  'Failed to retrieve the {0}. Please try again.',
                  ['patient']
                ),
                'Server Error'
              );
            }
          );
        }
        return promise;
      };

      factory.getPatientAlerts = function (personId) {
        var defer = $q.defer();
        var promise = defer.promise;
        if (factory.viewAccess()) {
          patientServices.Alerts.get({ Id: personId }).$promise.then(
            function (res) {
              promise = $.extend(promise, { values: res.Value });
              defer.resolve(res);
            },
            function () {
              toastrFactory.error(
                localize.getLocalizedString(
                  'Failed to retrieve the list of {0}. Refresh the page to try again.',
                  ['Alerts']
                ),
                'Server Error'
              );
            }
          );
        }
        return promise;
      };

      factory.getPatientOverview = function (personId) {
        var defer = $q.defer();
        var promise = defer.promise;
        if (factory.viewAccess()) {
          patientServices.Patients.overview({
            patientId: personId,
          }).$promise.then(
            function (res) {
              promise = $.extend(promise, { values: res.Value });
              defer.resolve(res);
            },
            function () {
              toastrFactory.error(
                localize.getLocalizedString(
                  'Failed to retrieve the {0}. Please try again.',
                  ['patient']
                ),
                'Server Error'
              );
            }
          );
        }
        return promise;
      };

      // the difference for this method is that we have requirements that require me return the error result if it is a 403 return.
      // So we can then show a message to the users.
      factory.getPatientOverviewForApptModal = function (personId) {
        var defer = $q.defer();
        var promise = defer.promise;
        if (factory.viewAccess()) {
          patientServices.Patients.overview({
            patientId: personId,
          }).$promise.then(
            function (res) {
              promise = $.extend(promise, { values: res.Value });
              defer.resolve(res);
            },
            function (err) {
              if (err && err.status && err.status === 403) {
                defer.resolve(err);
              } else {
                toastrFactory.error(
                  localize.getLocalizedString(
                    'Failed to retrieve the {0}. Please try again.',
                    ['patient']
                  ),
                  'Server Error'
                );
              }
            }
          );
        }
        return promise;
      };

      //#endregion

      //#region Account
      factory.getAccountOverview = function (personAccountAccountId) {
        var defer = $q.defer();
        var promise = defer.promise;
        patientServices.Account.overview({
          accountId: personAccountAccountId,
        }).$promise.then(
          function (res) {
            promise = $.extend(promise, { values: res.Value });
            defer.resolve(res);
          },
          function () {
            toastrFactory.error(
              localize.getLocalizedString('Failed to get Account Overview.'),
              localize.getLocalizedString('Server Error')
            );
          }
        );
        return promise;
      };

      factory.getAllAccountMembersDetail = function (personAccountAccountId) {
        var defer = $q.defer();
        var promise = defer.promise;
        patientServices.Account.getAccountMembersDetailByAccountId({
          accountId: personAccountAccountId,
        }).$promise.then(
          function (res) {
            promise = $.extend(promise, { values: res.Value });
            defer.resolve(res);
          },
          function () {
            toastrFactory.error(
              localize.getLocalizedString(
                'Failed to get Account Members Detail.'
              ),
              localize.getLocalizedString('Server Error')
            );
          }
        );
        return promise;
      };

      // #region get all acoount members

      factory.getAllAccountMembers = function (accountId) {
        var defer = $q.defer();
        var promise = defer.promise;
        var params = {};
        params.accountId = accountId;
        patientServices.Account.getAllAccountMembersByAccountId(
          params
        ).$promise.then(
          function (res) {
            promise = $.extend(promise, { values: res.Value });
            defer.resolve(res);
          },
          function () {
            toastrFactory.error(
              localize.getLocalizedString('Failed to get Account Members.'),
              localize.getLocalizedString('Server Error')
            );
          }
        );
        return promise;
      };

      factory.getPatientSearchResults = function (searchParams) {
        var defer = $q.defer();
        var promise = defer.promise;
        patientServices.Patients.search(searchParams).$promise.then(
          function (res) {
            promise = $.extend(promise, { values: res.Value });
            defer.resolve(res);
          },
          function () {
            toastrFactory.error(
              localize.getLocalizedString('Please search again.'),
              localize.getLocalizedString('Server Error')
            );
            defer.reject();
          }
        );
        return promise;
      };

      //#endregion

      return {
        access: function () {
          return factory.getAccess();
        },
        getById: function (patientId) {
          return factory.getPatientById(patientId);
        },
        Overview: function (patientId) {
          return factory.getPatientOverview(patientId);
        },
        getPatientOverviewForApptModal: function (patientId) {
          return factory.getPatientOverviewForApptModal(patientId);
        },
        getPatientAlerts: function (personId) {
          return factory.getPatientAlerts(personId);
        },
        // for patientHeader only
        PatientAlerts: null,
        SetPatientAlerts: function (patientAlerts) {
          this.PatientAlerts = patientAlerts;
        },
        // for patientHeader only
        PatientMedicalHistoryAlerts: null,
        SetPatientMedicalHistoryAlerts: function (patientMedicalHistoryAlerts) {
          this.PatientMedicalHistoryAlerts = patientMedicalHistoryAlerts;
        },
        // for patientHeader only
        ActiveHipaaAuthorizationSummaries: null,
        SetActiveHipaaAuthorizationSummaries: function (
          hipaaAuthorizationSummaries
        ) {
          this.ActiveHipaaAuthorizationSummaries = hipaaAuthorizationSummaries;
        },
        // for patientHeader only
        ActivePatient: null,
        SetActivePatient: function (patient) {
          this.ActivePatient = patient;
        },
        ClearActivePatient: function () {
          this.ActivePatient = null;
          this.ActiveAccountOverview = null;
          this.ActiveHipaaAuthorizationSummaries = null;
          this.PatientAlerts = null;
          this.PatientMedicalHistoryAlerts = null;
        },
        AccountOverview: function (accountId) {
          return factory.getAccountOverview(accountId);
        },
        AccountMembers: function (accountId) {
          return factory.getAllAccountMembers(accountId);
        },
        AccountMemberDetails: function (accountId) {
          return factory.getAllAccountMembersDetail(accountId);
        },
        SetPersonActiveStatus: function (personId, isActive, unschedule) {
          return factory.setPersonActiveStatus(personId, isActive, unschedule);
        },
        ActiveAccountOverview: null,
        SetActiveAccountOverview: function (accountOverview) {
          this.ActiveAccountOverview = accountOverview;
          angular.forEach(
            factory.accountOverviewObservers,
            function (observer) {
              observer(accountOverview);
            }
          );
        },
        PatientSearch: function (searchParams) {
          return factory.getPatientSearchResults(searchParams);
        },
        // subscribe to ActiveAccountOvereview changes
        observeActiveAccountOverview: function (observer) {
          factory.accountOverviewObservers.push(observer);

          return function deregisterActiveAccountOverviewObserver() {
            var indexOfObserver = factory.accountOverviewObservers.indexOf(
              observer
            );
            if (indexOfObserver !== -1) {
              var registeredObserver = factory.accountOverviewObservers.splice(
                indexOfObserver,
                1
              );
              registeredObserver = null;
              observer = null;
            }
          };
        },
      };
    },
  ])

  .factory('CustomConfirmModal', [
    '$uibModal',
    '$rootScope',
    '$templateCache',
    '$filter',
    'ListHelper',
    'PatientServices',
    '$q',
    'SaveStates',
    'ModalDataFactory',
    'AuthZService',
    'ShareData',
    function (
      $uibModal,
      $rootScope,
      $templateCache,
      $filter,
      listHelper,
      patientServices,
      $q,
      saveStates,
      modalDataFactory,
      authorizationService,
      shareData
    ) {
      var customConfirmModal = {
        ConfirmModalWithIncludeAndClaimGrid: function (
          title,
          upperMessage,
          lowerMessage,
          button1Text,
          button2Text,
          sourceUrl,
          data,
          claims
        ) {
          return $uibModal.open({
            templateUrl:
              'App/Patient/patient-account/patient-insurance-info/patient-close-claim/patient-close-claim.html',
            controller: 'PatientCloseClaimController',
            size: 'lg',
            windowClass: 'warning-modal-center',
            backdrop: 'static',
            keyboard: false,
            resolve: {
              item: function () {
                return {
                  Title: title,
                  UpperMessage: upperMessage,
                  LowerMessage: lowerMessage,
                  Button1Text: button1Text,
                  Button2Text: button2Text,
                  SourceUrl: sourceUrl,
                  Data: data,
                  Claims: claims,
                };
              },
            },
          }).result;
        },
      };

      return customConfirmModal;
    },
  ])

  .factory('PatientServicesFactory', [
    'PatientServices',
    '$filter',
    'AmfaKeys',
    'localize',
    '$q',
    'toastrFactory',
    'patSecurityService',
    'SaveStates',
    function (
      patientServices,
      $filter,
      AmfaKeys,
      localize,
      $q,
      toastrFactory,
      patSecurityService,
      saveStates
    ) {
      var factory = this;

      //#region authentication
      factory.hasAccess = {
        Create: false,
        Delete: false,
        Edit: false,
        View: false,
      };

      factory.authCreateAccess = function () {
        return patSecurityService.IsAuthorizedByAbbreviation(
          AmfaKeys.SoarClinCpsvcAdd
        );
      };

      factory.authDeleteAccess = function () {
        return patSecurityService.IsAuthorizedByAbbreviation(
          AmfaKeys.SoarClinCpsvcDelete
        );
      };

      factory.authEditAccess = function () {
        return patSecurityService.IsAuthorizedByAbbreviation(
          AmfaKeys.SoarClinCpsvcEdit
        );
      };

      factory.authViewAccess = function () {
        return patSecurityService.IsAuthorizedByAbbreviation(
          AmfaKeys.SoarClinCpsvcView
        );
      };

      factory.authAccess = function () {
        if (factory.authViewAccess()) {
          factory.hasAccess.Create = factory.authCreateAccess();
          factory.hasAccess.Delete = factory.authDeleteAccess();
          factory.hasAccess.Edit = factory.authEditAccess();
          factory.hasAccess.View = true;
        }
        return factory.hasAccess;
      };

      // sets the tax, discount, and amount on a list of service transactions
      factory.getTaxAndDiscount = function (serviceTransactions) {
        if (factory.authViewAccess()) {
          var defer = $q.defer();
          var promise = defer.promise;
          patientServices.ServiceTransactions.calculateTaxAndDiscount(
            serviceTransactions
          ).$promise.then(
            function (res) {
              promise = $.extend(promise, {
                values: res.Value,
              });
              defer.resolve(res);
            },
            function () {
              toastrFactory.error(
                localize.getLocalizedString(
                  'Failed to get tax and discount for the list of {0}. Refresh the page to try again.',
                  ['Services']
                ),
                localize.getLocalizedString('Server Error')
              );
            }
          );
          return promise;
        }
      };

      factory.getTaxAndDiscountByPersonId = function (
        serviceTransactions,
        personId
      ) {
        if (factory.authViewAccess()) {
          var defer = $q.defer();
          var promise = defer.promise;
          var params = {};
          params.personId = personId;
          patientServices.ServiceTransactions.calculateTaxAndDiscountByPersonId(
            personId,
            serviceTransactions
          ).$promise.then(
            function (res) {
              promise = $.extend(promise, {
                values: res.Value,
              });
              defer.resolve(res);
            },
            function () {
              toastrFactory.error(
                localize.getLocalizedString(
                  'Failed to get tax and discount for the list of {0}. Refresh the page to try again.',
                  ['Services']
                ),
                localize.getLocalizedString('Server Error')
              );
            }
          );
          return promise;
        }
      };

      factory.getServiceTransactionsByPersonId = function (
        serviceTransactions
      ) {
        if (factory.authViewAccess()) {
          var defer = $q.defer();
          var promise = defer.promise;
          patientServices.Account.getServiceTransactionsByPersonId(
            serviceTransactions
          ).$promise.then(
            function (res) {
              promise = $.extend(promise, {
                values: res.Value,
              });
              defer.resolve(res);
            },
            function () {
              toastrFactory.error(
                localize.getLocalizedString(
                  'Failed to retrieve the {0}. Refresh the page to try again.',
                  ['Service Transaction']
                ),
                localize.getLocalizedString('Server Error')
              );
            }
          );
          return promise;
        }
      };

      // get a specific perioExam by id
      factory.getServiceTransaction = function (
        personId,
        serviceTransactionId
      ) {
        if (factory.authViewAccess()) {
          var defer = $q.defer();
          var promise = defer.promise;
          patientServices.ServiceTransactions.get({
            Id: personId,
            servicetransactionid: serviceTransactionId,
          }).$promise.then(
            function (res) {
              var serviceTransaction = res.Value;
              promise = $.extend(promise, {
                values: res.Value,
              });
              defer.resolve(res);
            },
            function () {
              toastrFactory.error(
                localize.getLocalizedString(
                  'Failed to retrieve the {0}. Refresh the page to try again.',
                  ['Service Transaction']
                ),
                localize.getLocalizedString('Server Error')
              );
            }
          );
          return promise;
        }
      };

      factory.updateServiceTransactions = function (
        serviceTransactions,
        isTreatmentPlan,
        treatmentPlanName,
        treatmentPlanGroupNumber,
        processMaxUsed
      ) {
        var defer = $q.defer();
        var promise = defer.promise;
        if (factory.authEditAccess()) {
          patientServices.ServiceTransactions.update(
            {
              accountMemberId: serviceTransactions[0].AccountMemberId,
              isTreatmentPlan: isTreatmentPlan,
              treatmentPlanName: treatmentPlanName,
              treatmentPlanGroupNumber: treatmentPlanGroupNumber,
              processMaxUsed: processMaxUsed,
            },
            serviceTransactions
          ).$promise.then(
            function (res) {
              toastrFactory.success(
                localize.getLocalizedString(
                  'Your patient service has been updated.'
                ),
                localize.getLocalizedString('Success')
              );
              var savedServiceTransactions = res.Value;

              promise = $.extend(promise, {
                values: res.Value,
              });
              defer.resolve(res);
            },
            function () {
              toastrFactory.error(
                localize.getLocalizedString(
                  'Update was unsuccessful. Please retry your save.'
                ),
                localize.getLocalizedString('Server Error')
              );
              defer.reject();
            }
          );
        }
        return promise;
      };

      factory.rollBackFeesOnServiceTransactions = function (
        serviceTransactions
      ) {
        var defer = $q.defer();
        var promise = defer.promise;
        if (factory.authEditAccess()) {
          patientServices.ServiceTransactions.feeRollback(
            serviceTransactions
          ).$promise.then(
            function (res) {
              toastrFactory.success(
                localize.getLocalizedString(
                  'Your patient service fees have been updated.'
                ),
                localize.getLocalizedString('Success')
              );
              var savedServiceTransactions = res.Value;

              promise = $.extend(promise, {
                values: res.Value,
              });
              defer.resolve(res);
            },
            function () {
              toastrFactory.error(
                localize.getLocalizedString(
                  'Update was unsuccessful. Please retry your save.'
                ),
                localize.getLocalizedString('Server Error')
              );
            }
          );
        }
        return promise;
      };

      // NOT USED or tested, may be needed in the future?
      // find a serviceTransaction within passed in list (serviceTransactions) with a matching Appointmentid and EncounterId is not null
      // this indicates a service that is on the encounter, created from an appointment
      // set new service.EncounterId based on match
      // NOTE this is used when a service is added to an appointment that is in a ReadyToCheckout status state
      // so that the new service will have a matching EncounterId
      factory.syncEncounterIdOnService = function (
        serviceTransaction,
        serviceTransactions
      ) {
        var matchingService = _.find(serviceTransactions, function (service) {
          return (
            service.ServiceTransaction.AppointmentId ===
              serviceTransaction.AppointmentId &&
            !_.isNil(service.ServiceTransaction.EncounterId)
          );
        });
        // if service exists with matching AppointmentId and Encounter (which means its ReadyForCheckout),
        // add that EncounterId to this service
        if (matchingService) {
          serviceTransaction.EncounterId =
            matchingService.ServiceTransaction.EncounterId;
        }
        return serviceTransaction;
      };

      // Keep appointments and pending encounters in sync when ready for checkout
      // find a serviceTransaction within passed in list (serviceTransactions) with a matching Appointmentid and EncounterId is not null
      // this indicates a service that is on the encounter, created from an appointment
      // NOTE this is used when a service is added to an encounter that is in a ReadyToCheckout status state
      // so that the new service will have a matching AppointmentId if the objectState is Update, None, Or Add
      // or so that the AppointmentId will be set to null  if the objectState is Delete
      // - this method assumes all services passed are from a single encounter
      factory.syncAppointmentIdOnService = function (serviceTransactions) {
        var serviceWithAppointmentId = _.find(
          serviceTransactions,
          function (serviceTransaction) {
            return !_.isNil(serviceTransaction.AppointmentId);
          }
        );

        // if service exists with matching AppointmentId and Encounter (which means its ReadyForCheckout),
        // add that appointmmentId to all of the services on this encounter
        if (serviceWithAppointmentId) {
          _.forEach(serviceTransactions, function (serviceTransaction) {
            if (
              serviceTransaction.ObjectState === saveStates.Update ||
              serviceTransaction.ObjectState === saveStates.Add
            ) {
              serviceTransaction.AppointmentId =
                serviceWithAppointmentId.AppointmentId;
            }
            if (serviceTransaction.ObjectState === saveStates.None) {
              serviceTransaction.AppointmentId =
                serviceWithAppointmentId.AppointmentId;
              serviceTransaction.ObjectState = saveStates.Update;
            }
          });
        }
        // if service is being removed from the encounter just set the Appointment and EncounterIds to null
        // and set the ServiceTransactionStatusId to 1 (proposed)
        // and set InsuranceOrder to null
        _.forEach(serviceTransactions, function (serviceTransaction) {
          if (serviceTransaction.ObjectState === saveStates.Delete) {
            serviceTransaction.EncounterId = null;
            serviceTransaction.AppointmentId = null;
            serviceTransaction.ServiceTransactionStatusId = 1;
            serviceTransaction.InsuranceOrder = null;
            serviceTransaction.ObjectState = saveStates.Update;
          }
        });
        return serviceTransactions;
      };

      //#endregion
      return {
        access: function () {
          return factory.authAccess();
        },
        update: function (
          servicetransactions,
          isTreatmentPlan,
          treatmentPlanName,
          treatmentPlanGroupNumber
        ) {
          return factory.updateServiceTransactions(
            servicetransactions,
            isTreatmentPlan,
            treatmentPlanName,
            treatmentPlanGroupNumber
          );
        },
        getById: function (personId, serviceTransactionId) {
          return factory.getServiceTransaction(personId, serviceTransactionId);
        },
        GetTaxAndDiscount: function (serviceTransactions) {
          return factory.getTaxAndDiscount(serviceTransactions);
        },
        GetTaxAndDiscountByPersonId: function (serviceTransactions, personId) {
          return factory.getTaxAndDiscountByPersonId(
            serviceTransactions,
            personId
          );
        },
        GetServiceTransactionsByPersonId: function (patientId) {
          return factory.getServiceTransactionsByPersonId(patientId);
        },
        SelectedChartButtonId: null,
        setselectedChartButton: function (buttonId) {
          this.SelectedChartButtonId = buttonId;
        },

        SelectedSwiftPickCode: null,
        setSelectedSwiftPickCode: function (swftPkCode) {
          this.SelectedSwiftPickCode = swftPkCode;
        },
        ActiveServiceTransactionId: null,
        setActiveServiceTransactionId: function (serviceTransactionId) {
          this.ActiveServiceTransactionId = serviceTransactionId;
        },
        syncAppointmentIdOnService: function (serviceTransactions) {
          return factory.syncAppointmentIdOnService(serviceTransactions);
        },
        feeRollback: function (servicetransactions) {
          return factory.rollBackFeesOnServiceTransactions(servicetransactions);
        },
        ActiveToothCtrlsScopeId: null,
      };
    },
  ])

  .factory('PatientConditionsFactory', [
    'PatientServices',
    '$filter',
    'localize',
    '$q',
    'toastrFactory',
    'patSecurityService',
    function (
      patientServices,
      $filter,
      localize,
      $q,
      toastrFactory,
      patSecurityService
    ) {
      var factory = this;

      //#region authentication
      factory.hasAccess = {
        Create: false,
        Delete: false,
        Edit: false,
        View: false,
      };

      factory.authCreateAccess = function () {
        return patSecurityService.IsAuthorizedByAbbreviation(
          'soar-clin-ccond-add'
        );
      };

      factory.authDeleteAccess = function () {
        return patSecurityService.IsAuthorizedByAbbreviation(
          'soar-clin-ccond-delete'
        );
      };

      factory.authEditAccess = function () {
        return patSecurityService.IsAuthorizedByAbbreviation(
          'soar-clin-ccond-edit'
        );
      };

      factory.authViewAccess = function () {
        return patSecurityService.IsAuthorizedByAbbreviation(
          'soar-clin-ccond-view'
        );
      };

      factory.authAccess = function () {
        if (!factory.authViewAccess()) {
        } else {
          factory.hasAccess.Create = factory.authCreateAccess();
          factory.hasAccess.Delete = factory.authDeleteAccess();
          factory.hasAccess.Edit = factory.authEditAccess();
          factory.hasAccess.View = true;
        }
        return factory.hasAccess;
      };

      // get a specific perioExam by id
      factory.getPatientCondition = function (personId, patientConditionId) {
        if (factory.authViewAccess()) {
          var defer = $q.defer();
          var promise = defer.promise;
          patientServices.Conditions.get({
            Id: personId,
            ConditionId: patientConditionId,
          }).$promise.then(
            function (res) {
              var patientCondition = res.Value;
              promise = $.extend(promise, {
                values: res.Value,
              });
              defer.resolve(res);
            },
            function () {
              toastrFactory.error(
                localize.getLocalizedString(
                  'Failed to retrieve the {0}. Refresh the page to try again.',
                  ['Patient Condition']
                ),
                localize.getLocalizedString('Server Error')
              );
            }
          );
          return promise;
        }
      };

      factory.updatePatientCondition = function (patientCondition) {
        var defer = $q.defer();
        var promise = defer.promise;
        if (factory.authEditAccess()) {
          patientServices.Conditions.update(
            { Id: patientCondition.PatientId },
            patientCondition
          ).$promise.then(
            function (res) {
              toastrFactory.success(
                localize.getLocalizedString('Your {0} has been updated.', [
                  'Patient Condition',
                ]),
                localize.getLocalizedString('Success')
              );
              var savedCondition = res.Value;

              promise = $.extend(promise, {
                values: res.Value,
              });
              defer.resolve(res);
            },
            function () {
              toastrFactory.error(
                localize.getLocalizedString(
                  'Update was unsuccessful. Please retry your save.'
                ),
                localize.getLocalizedString('Server Error')
              );
            }
          );
        }
        return promise;
      };

      //#endregion
      return {
        access: function () {
          return factory.authAccess();
        },
        update: function (patientCondition) {
          return factory.updatePatientCondition(patientCondition);
        },
        getById: function (personId, patientCondition) {
          return factory.getPatientCondition(personId, patientCondition);
        },
        SelectedChartButtonId: null,
        setselectedChartButton: function (buttonId) {
          this.SelectedChartButtonId = buttonId;
        },
        ActivePatientConditionId: null,
        setActivePatientConditionId: function (patientConditionId) {
          this.ActivePatientConditionId = patientConditionId;
        },
      };
    },
  ])

  .factory('PatientInvoiceFactory', [
    'PatientServices',
    '$filter',
    'localize',
    '$q',
    'toastrFactory',
    'patSecurityService',
    '$uibModal',
    'tabLauncher',
    'userSettingsDataService',
    function (
      patientServices,
      $filter,
      localize,
      $q,
      toastrFactory,
      patSecurityService,
      $uibModal,
      tabLauncher,
      userSettingsDataService
    ) {
      var factory = this;

      //#region authentication

      factory.authPrintAccess = function () {
        return patSecurityService.IsAuthorizedByAbbreviation(
          'soar-acct-inv-print'
        );
      };

      //#endregion

      // default dataForModal
      factory.dataForModal = {
        PatientDetails: {},
        InvoiceOptions: {
          EncounterIds: [],
          IncludeFutureAppointments: false,
          IncludePreviousBalance: false,
          Note: null,
        },
      };

      // load invoice options (if any) or default
      factory.loadInvoiceOptions = function (encounterId, patientName) {
        if (factory.authPrintAccess()) {
          var dataForModal = angular.copy(factory.dataForModal);

          var defer = $q.defer();
          var promise = defer.promise;

          patientServices.Encounter.invoiceOptions({
            encounterId: encounterId,
          }).$promise.then(
            function (res) {
              if (res.Value) {
                var invoiceOptions = res.Value;
                if (_.isNull(invoiceOptions.EncounterIds)) {
                  dataForModal.InvoiceOptions = invoiceOptions;
                } else {
                  dataForModal.NoInvoceEncounter = true;
                }
              }
              dataForModal.PatientDetails = { Name: patientName };
              dataForModal.InvoiceOptions.EncounterIds = [];
              dataForModal.InvoiceOptions.EncounterIds.push(encounterId);
              promise = $.extend(promise, {
                values: dataForModal,
              });
              defer.resolve(dataForModal);
            },
            function () {
              toastrFactory.error(
                localize.getLocalizedString(
                  'Failed to retrieve the {0}. Refresh the page to try again.',
                  ['Invoice Options']
                ),
                localize.getLocalizedString('Server Error')
              );
            }
          );
          return promise;
        }
      };

      // get invoice options for encounter
      factory.getInvoiceOptions = function (encounterId) {
        if (factory.authPrintAccess()) {
          var defer = $q.defer();
          var promise = defer.promise;
          patientServices.Encounter.invoiceOptions({
            encounterId: encounterId,
          }).$promise.then(
            function (res) {
              var invoiceOptions = res.Value;
              promise = $.extend(promise, {
                values: res.Value,
              });
              defer.resolve(res);
            },
            function () {
              toastrFactory.error(
                localize.getLocalizedString(
                  'Failed to retrieve the {0}. Refresh the page to try again.',
                  ['Invoice Options']
                ),
                localize.getLocalizedString('Server Error')
              );
            }
          );
          return promise;
        }
      };

      // create invoices based on invoice options
      factory.createInvoices = function (accountId, params) {
        if (factory.authPrintAccess()) {
          var defer = $q.defer();
          var promise = defer.promise;
          patientServices.Encounter.createInvoices(
            { accountId: accountId },
            params
          ).$promise.then(
            function (res) {
              promise = $.extend(promise, {
                values: res.Value,
              });
              defer.resolve(res);
            },
            function () {
              toastrFactory.error(
                localize.getLocalizedString(
                  'Failed to get {0}. Refresh the page to try again.',
                  ['Invoice']
                ),
                localize.getLocalizedString('Server Error')
              );
            }
          );
          return promise;
        }
      };

      factory.createRefactorInvoices = function (params) {
        if (factory.authPrintAccess()) {
          var defer = $q.defer();
          var promise = defer.promise;
          patientServices.Encounter.createRefactorInvoices(
            params
          ).$promise.then(
            function (res) {
              promise = $.extend(promise, {
                values: res.Value,
              });
              defer.resolve(res);
            },
            function () {
              toastrFactory.error(
                localize.getLocalizedString(
                  'Failed to get {0}. Refresh the page to try again.',
                  ['Invoice']
                ),
                localize.getLocalizedString('Server Error')
              );
            }
          );
          return promise;
        }
      };

      factory.createCurrentInvoice = function (
        InvoiceOptions,
        encounter,
        patientName,
        patientId
      ) {
        InvoiceOptions.EncounterIds = [encounter.EncounterId];
        InvoiceOptions.PatientId = patientId;
        InvoiceOptions.LocationId = JSON.parse(
          sessionStorage.getItem('userLocation')
        )
          ? JSON.parse(sessionStorage.getItem('userLocation')).id
          : 0;
        InvoiceOptions.IsCustomInvoice = true;

        InvoiceOptions.InvoiceDetails = [];

        var dataForModal = {
          PatientDetails: [{ Name: patientName }],
          InvoiceOptions: InvoiceOptions,
        };

        dataForModal.IsCustomInvoice = true;
        dataForModal.IsAccountSummaryInvoice = true;

        //modal invoice options
        var modalInstance = $uibModal.open({
          templateUrl:
            'App/Patient/components/invoice-options/invoice-options.html',
          keyboard: false,
          size: 'lg',
          windowClass: 'center-modal',
          backdrop: 'static',
          controller: 'InvoiceOptionsController',
          resolve: {
            DataForModal: function () {
              return dataForModal;
            },
          },
        });

        //Handle callback for "Print" & "Cancel" buttons action of dialog
        modalInstance.result.then(function (modalResult) {
          if (modalResult) {
            InvoiceOptions.IncludeFutureAppointments =
              modalResult.IncludeFutureAppointments;
            InvoiceOptions.IncludePreviousBalance =
              modalResult.IncludePreviousBalance;
            InvoiceOptions.IncludeEstimatedInsurance =
              modalResult.IncludeEstimatedInsurance;
            factory.createRefactorInvoices(modalResult).then(function (res) {
              if (res && res.Value) {
                var invoices = res.Value;
                // we might get back multiple invoices, open a tab for each one
                _.forEach(invoices, function (invoice) {
                  invoice.isCustomInvoice = true;
                  invoice.IncludeFutureAppointments =
                    modalResult.IncludeFutureAppointments;
                  invoice.IncludePreviousBalance =
                    modalResult.IncludePreviousBalance;
                  invoice.IncludeEstimatedInsurance =
                    modalResult.IncludeEstimatedInsurance;
                  invoice.Note = modalResult.Note;
                  localStorage.setItem(
                    'invoice_' + invoice.InvoiceId,
                    JSON.stringify(invoice)
                  );
                  let patientPath = '#/Patient/';
                  tabLauncher.launchNewTab(
                    patientPath + invoice.InvoiceId + '/Account/PrintInvoice/'
                  );
                });
              }
            });
          }
        });
      };
      (factory.getPatientInfo = function (patientId) {
        var defer = $q.defer();
        var promise = defer.promise;
        var patientInfo = {};

        patientServices.Patients.getWithoutAccount({
          Id: patientId,
        }).$promise.then(function (res) {
          if (res && res.Value) {
            patientInfo = res.Value;
            promise = $.extend(promise, {
              Value: patientInfo,
            });
            defer.resolve(patientInfo);
          }
        });
        return promise;
      }),
        (factory.viewEncounterInvoice = function (
          encounterId,
          patientName,
          accountId
        ) {
          var defer = $q.defer();
          var promise = defer.promise;
          factory
            .loadInvoiceOptions(encounterId, patientName)
            .then(function (res) {
              if (res.NoInvoceEncounter) {
                promise = $.extend(promise, {
                  values: res,
                });
                //res.NoInvoceEncounter = false;
                defer.resolve(res);
              } else {
                res.$$ShowApptDisclaimer = true;
                confirmInvoiceOptions(res, accountId);
              }
            });
          return promise;
        });

      var confirmInvoiceOptions = function (
        dataForModal,
        accountId,
        isCustomInvoice,
        useIncludeEstimatedInsurance,
        callback
      ) {
        var modalInstance = $uibModal.open({
          templateUrl:
            'App/Patient/components/invoice-options/invoice-options.html',
          keyboard: false,
          size: 'lg',
          windowClass: 'center-modal',
          backdrop: 'static',
          controller: 'InvoiceOptionsController',
          resolve: {
            DataForModal: function () {
              return dataForModal;
            },
          },
        });
        //Handle callback for "Print" & "Cancel" buttons action of dialog
        modalInstance.result.then(function (modalResult) {
          if (modalResult) {
            factory.createInvoices(accountId, modalResult).then(function (res) {
              if (res && res.Value) {
                var invoices = res.Value;
                // we might get back multiple invoices, open a tab for each one
                _.each(invoices, function (invoice) {
                  invoice.isCustomInvoice = isCustomInvoice
                    ? isCustomInvoice
                    : false;
                  invoice.IncludeFutureAppointments =
                    modalResult.IncludeFutureAppointments;
                  invoice.IncludePreviousBalance =
                    modalResult.IncludePreviousBalance;
                  invoice.IncludeEstimatedInsurance = useIncludeEstimatedInsurance
                    ? modalResult.IncludeEstimatedInsurance
                    : true;
                  localStorage.setItem(
                    'invoice_' + invoice.InvoiceId,
                    JSON.stringify(invoice)
                  );
                  let patientPath = '#/Patient/';
                  tabLauncher.launchNewTab(
                    patientPath + invoice.InvoiceId + '/Account/PrintInvoice/'
                  );
                });
                if (typeof callback === 'function') {
                  callback();
                }
              }
            });
          }
        });
      };

      //#endregion
      return {
        InvoiceOptions: function (encounterId) {
          return factory.getInvoiceOptions(encounterId);
        },
        LoadInvoiceOptions: function (encounterId, patientName) {
          return factory.loadInvoiceOptions(encounterId, patientName);
        },
        CreateInvoices: function (accountId, params) {
          return factory.createInvoices(accountId, params);
        },
        ViewEncounterInvoice: function (encounterId, patientName, accountId) {
          return factory.viewEncounterInvoice(
            encounterId,
            patientName,
            accountId
          );
        },
        GetPatientInfo: function (patientId) {
          return factory.getPatientInfo(patientId);
        },
        CreateRefactorInvoices: function (params) {
          return factory.createRefactorInvoices(params);
        },
        CreateCurrentInvoice: function (
          InvoiceOptions,
          encounter,
          patientName,
          patientId
        ) {
          return factory.createCurrentInvoice(
            InvoiceOptions,
            encounter,
            patientName,
            patientId
          );
        },
        ConfirmInvoiceOptions: function (
          dataForModal,
          accountId,
          isCustomInvoice,
          useIncludeEstimatedInsurance,
          callback
        ) {
          return confirmInvoiceOptions(
            dataForModal,
            accountId,
            isCustomInvoice,
            useIncludeEstimatedInsurance,
            callback
          );
        },
      };
    },
  ])

  .factory('PatientAlertsFactory', [
    function () {
      return {
        PatientAlerts: {
          PatientId: null,
          Alerts: null,
        },
      };
    },
  ])
  .factory('ChartingFavoritesFactory', [
    'UserServices',
    '$rootScope',
    'toastrFactory',
    'ListHelper',
    'localize',
    '$q',
    'patSecurityService',
    'referenceDataService',
    function (
      userServices,
      $rootScope,
      toastrFactory,
      listHelper,
      localize,
      $q,
      patSecurityService,
      referenceDataService
    ) {
      var factory = this;
        factory.chartButtonLayout = {};        
      var observers = [];

      //#region save chart button layout api

      // saving the chart button layout for user
      factory.saveChartButtonLayout = function (
        selectedLayoutItems,
        chartButtonLayout,
          pageToUpdate,
        createNewChartLayout
      ) {
        var layoutItemsToSend = [];

        if (chartButtonLayout && chartButtonLayout.LayoutItems) {
          chartButtonLayout.LayoutItems = 'undefined';
        }

        if (chartButtonLayout && chartButtonLayout.Favorites) {
          chartButtonLayout.Favorites = 'undefined';
        }

        if (selectedLayoutItems && selectedLayoutItems.length > 0) {
          angular.forEach(selectedLayoutItems, function (item) {
            var layoutItem = {};
            if (item.$$button.ItemId) {
              layoutItem.Button = {
                ItemTypeId: item.$$button.ItemTypeId,
                ItemId: item.$$button.ItemId,
              };

              layoutItem.ButtonGroup = null;
            } else {
              layoutItem.Button = null;
              layoutItem.ButtonGroup = {
                GroupName: item.$$button.GroupName,
                Buttons: item.$$button.Buttons,
              };
            }

            layoutItemsToSend.push(layoutItem);
          });
        }

        if (createNewChartLayout) {          
            
            chartButtonLayout.Pages[pageToUpdate].Favorites = layoutItemsToSend;
            chartButtonLayout = factory.validatePages(chartButtonLayout);
            userServices.ChartButtonLayout.create(
                chartButtonLayout,
                factory.saveChartButtonLayoutsSuccess,
                factory.saveChartButtonLayoutsFailure
            );
        } else {
          // update
          if (!chartButtonLayout.Pages[pageToUpdate]) {
            chartButtonLayout.Pages[pageToUpdate] = {};
          }
          chartButtonLayout.Pages[pageToUpdate].Favorites = layoutItemsToSend;
          chartButtonLayout = factory.validatePages(chartButtonLayout);
          userServices.ChartButtonLayout.update(
            chartButtonLayout,
            factory.saveChartButtonLayoutsSuccess,
            factory.saveChartButtonLayoutsFailure
          );
        }
      };

      factory.validatePages = function (chartButtonLayout) {
        if (chartButtonLayout && chartButtonLayout.Pages.length > 0) {
          var availablePages = [];
          angular.forEach(chartButtonLayout.Pages, function (page, index) {
            if (page.Favorites.length > 20) {
              for (var i = 20; page.Favorites.length > i; ) {
                var moved = false;
                var pageToOffloadOn = null;
                var obj = {};

                // Check what pages are still available before every move
                availablePages = factory.findAvailablePages(chartButtonLayout);
                if (availablePages.length > 0) {
                  for (var p = index; p <= 4; p++) {
                    obj = listHelper.findItemByFieldValue(
                      availablePages,
                      'pageNumber',
                      p
                    );
                    if (availablePages && obj) {
                      pageToOffloadOn = obj.pageNumber;
                      chartButtonLayout = factory.createNewPage(
                        chartButtonLayout,
                        pageToOffloadOn
                      );
                      chartButtonLayout.Pages[pageToOffloadOn].Favorites.push(
                        page.Favorites[i]
                      );
                      page.Favorites.splice(i, 1);
                      moved = true;
                      factory.setCurrentPage(pageToOffloadOn);
                      break;
                    }
                  }

                  if (!moved) {
                    for (var a = 0; a < index; a++) {
                      obj = listHelper.findItemByFieldValue(
                        availablePages,
                        'pageNumber',
                        a
                      );

                      if (availablePages && obj) {
                        pageToOffloadOn = obj.pageNumber;
                        chartButtonLayout = factory.createNewPage(
                          chartButtonLayout,
                          pageToOffloadOn
                        );
                        chartButtonLayout.Pages[pageToOffloadOn].Favorites.push(
                          page.Favorites[i]
                        );
                        page.Favorites.splice(i, 1);
                        moved = true;
                        factory.setCurrentPage(pageToOffloadOn);
                        break;
                      }
                    }
                  }
                } else {
                  page.Favorites.splice(i, 1);
                  toastrFactory.error(
                    localize.getLocalizedString('All pages are full.'),
                    localize.getLocalizedString('Cannot Add Favorite')
                  );
                  factory.setCurrentPage(0);
                }
              }
            }
          });
          return chartButtonLayout;
        }
      };

      factory.createNewPage = function (chartButtonLayout, pageToAdd) {
        if (!chartButtonLayout.Pages[pageToAdd]) {
          chartButtonLayout.Pages[pageToAdd] = { Favorites: [] };
        }

        return chartButtonLayout;
      };

      // Set the current page in the controller when buttons are offloaded
      factory.setCurrentPage = function (currentPage) {
        angular.forEach(observers, function (observer) {
          observer(currentPage);
        });
      };

      // Function to loop through charting favorite pages to find which pages contain less than 20 items
      factory.findAvailablePages = function (chartButtonLayout) {
        var availablePages = [];

        if (chartButtonLayout.Pages.length <= 4) {
          chartButtonLayout.Pages[chartButtonLayout.Pages.length] = {
            Favorites: [],
          };
        }

        angular.forEach(chartButtonLayout.Pages, function (page, index) {
          if (page.Favorites.length < 20) {
            availablePages.push({ pageNumber: index });
          }
        });
        return availablePages;
      };

      // success callback handler for save chart button layout
      factory.saveChartButtonLayoutsSuccess = function (res) {
        factory.chartButtonLayout = res.Value;
        angular.forEach(observers, function (observer) {
          observer(factory.chartButtonLayout);
        });
      };

      // failure callback handler for save chart button layout
      factory.saveChartButtonLayoutsFailure = function () {
        toastrFactory.error(
          localize.getLocalizedString(
            'Save was unsuccessful. Please retry your save.'
          ),
          localize.getLocalizedString('Server Error')
        );
      };

      //#endregion

      // Set the charting button objects
      factory.setChartingButtonLayout = function (item, services, conditions) {
        var layoutItem = null;
        if (!item.Buttons) {
          var condition = listHelper.findItemByFieldValue(
            conditions,
            'ConditionId',
            item.ItemId
          );
          if (!_.isEmpty(condition)) {
            var buttonObject = {
              Id: condition.ConditionId,
              Text: condition.Description,
              TypeId: item.ItemTypeId,
              IconUrl: factory.getConditionChartIconUrl(condition),
              $$button: {
                ItemTypeId: item.ItemTypeId,
                ItemId: condition.ConditionId,
              },
            };
            layoutItem = buttonObject;
          } else {
            layoutItem = null;
          }

          var service = _.find(services, { ServiceCodeId: item.ItemId });
          service = referenceDataService.setFeesByLocation(service);
          if (service) {
            var layoutItemType = service.IsSwiftPickCode === false ? '2' : '3';
            var buttonObject = {
              Id: service.ServiceCodeId,
              Text: service.DisplayAs,
              TypeId: item.ItemTypeId,
              IconUrl: factory.getServiceChartIconUrl(service),
              Service: service,
              $$button: {
                ItemTypeId: item.ItemTypeId,
                ItemId: service.ServiceCodeId,
              },
            };
            layoutItem = buttonObject;
          }
        } else {
          var buttonObject = {
            Id: null,
            Text: item.GroupName,
            IconUrl: null,
            Service: null,
            TypeId: 4,
            $$button: {
              GroupName: item.GroupName,
              Buttons: item.Buttons,
            },
          };
          layoutItem = buttonObject;
        }
        return layoutItem;
      };

      //#region Button icons

      factory.getServiceChartIconUrl = function (service) {
        var url = 'Images/ChartIcons/';
        var path = angular.copy(service.IconName);
        if (!path || path === null) {
          url += service.IsSwiftPickCode
            ? 'default_swift_code.svg'
            : 'default_service_code.svg';
        } else {
          url += path + '.svg';
        }
        return url;
      };

      factory.getConditionChartIconUrl = function (condition) {
        var url = 'Images/ConditionIcons/';
        var path = angular.copy(condition.IconName);
        if (!path) {
          url += 'default_condition.svg';
        } else {
          url += path + '.svg';
        }
        return url;
      };
      factory.getAllFavoritesContainingServiceId = function (serviceCodeId) {
        var defer = $q.defer();
        var promise = defer.promise;
        if (
          patSecurityService.IsAuthorizedByAbbreviation(
            'soar-biz-bizusr-vchbtn'
          )
        ) {
          var params = {};
          params.serviceCodeId = serviceCodeId;
          userServices.ChartButtonLayout.getFavoritesByServiceId(
            params
          ).$promise.then(
            function (res) {
              promise = $.extend(promise, { values: res.Value });
              defer.resolve(res);
            },
            function () {
              toastrFactory.error(
                localize.getLocalizedString(
                  'Failed to load the list of {0}. Refresh the page to try again.',
                  ['Favorites']
                ),
                localize.getLocalizedString('Server Error')
              );
            }
          );
        }
        return promise;
      };
      // #end region

      return {
        ChartingButtonLayout: factory.chartButtonLayout,
        SelectedChartingFavorites: [],        
        SetSelectedChartingFavorites: function (
          selectedChartingFavorites,
          chartButtonLayout,
          saving,
          pageToUpdate
        ) {
            var createNewLayout = false;            
            if (
                chartButtonLayout === null ||
                chartButtonLayout.Pages == [] ||
                !chartButtonLayout.UserId
            ) {
                chartButtonLayout = {
                    UserId: $rootScope.patAuthContext.userInfo.userid,
                    Pages: [
                        { Favorites: [] },
                        { Favorites: [] },
                        { Favorites: [] },
                        { Favorites: [] },
                        { Favorites: [] }
                    ],
                };
                createNewLayout = true;
            }            
            this.SelectedChartingFavorites = chartButtonLayout.Pages;            
                        

          if (saving) {
            factory.saveChartButtonLayout(
              selectedChartingFavorites,
              chartButtonLayout,
                pageToUpdate,
                createNewLayout
            );
          }
        },
        SetChartingButtonLayout: function (item, services, conditions) {
          return factory.setChartingButtonLayout(item, services, conditions);
        },
        observeChartButtonLayout: function (observer) {
          observers.push(observer);
        },
        observeCurrentPage: function (observer) {
          observers.push(observer);
        },
        GetAllFavoritesContainingServiceId: function (serviceCodeId) {
          return factory.getAllFavoritesContainingServiceId(serviceCodeId);
        },
      };
    },
  ])

  .factory('HipaaAuthorizationFactory', [
    'PatientServices',
    '$filter',
    'localize',
    '$q',
    'toastrFactory',
    '$timeout',
    'patSecurityService',
    'ListHelper',
    'CustomFormsService',
    function (
      patientServices,
      $filter,
      localize,
      $q,
      toastrFactory,
      $timeout,
      patSecurityService,
      listHelper,
      customFormsService
    ) {
      var factory = this;
      // maintains a list of dependent observers
      var observers = [];

      var hipaaAuthorization = {};

      //#region authorization

      var hipaaAuthorizationAccess = { Create: false, View: false };

      //soar-per-perhst-add to be added
      var hipaaAuthorizationCreateAccess = function () {
        return patSecurityService.IsAuthorizedByAbbreviation(
          'soar-per-perhst-add'
        );
      };

      //soar-per-perhst-view
      var hipaaAuthorizationViewAccess = function () {
        return patSecurityService.IsAuthorizedByAbbreviation(
          'soar-per-perhst-view'
        );
      };

      // NOTE, currently no need for edit and delete amfas
      factory.getHipaaAuthorizationAccess = function () {
        if (!hipaaAuthorizationViewAccess()) {
        } else {
          hipaaAuthorizationAccess.Create = hipaaAuthorizationCreateAccess();
          hipaaAuthorizationAccess.View = true;
        }
        return hipaaAuthorizationAccess;
      };

      //#endregion

      //#region load form data
      factory.setAnswerToNo = function (form) {
        for (
          var sectionIndex = 0;
          sectionIndex < form.FormSections.length;
          sectionIndex++
        ) {
          for (
            var sectionItemIndex = 0;
            sectionItemIndex <
            form.FormSections[sectionIndex].FormSectionItems.length;
            sectionItemIndex++
          ) {
            var item =
              form.FormSections[sectionIndex].FormSectionItems[sectionItemIndex]
                .FormBankItem;
            var formItemType =
              form.FormSections[sectionIndex].FormSectionItems[sectionItemIndex]
                .FormItemType;
            switch (formItemType) {
              case 2:
                item.Answer = 'No';
                break;
              case 8:
                item.Answer = 'No';
                break;
            }
          }
        }
      };

      //#endregion

      //#region crud
      factory.newHipaaAuthorizationForm = function () {
        var defer = $q.defer();
        var promise = defer.promise;

        if (hipaaAuthorizationCreateAccess()) {
          // enable next line and delete one after, also won't need form id
          customFormsService.hipaaAuthorization().$promise.then(
            function (res) {
              hipaaAuthorization = res.Value;
              promise = $.extend(promise, {
                values: res.Value,
              });
              defer.resolve(res);
            },
            function () {
              toastrFactory.error(
                localize.getLocalizedString(
                  'Failed to retrieve the {0}. Refresh the page to try again.',
                  ['HIPAA Authorization Form']
                ),
                localize.getLocalizedString('Server Error')
              );
            }
          );
        }
        return promise;
      };

      factory.getById = function (personId) {
        var defer = $q.defer();
        var promise = defer.promise;

        if (hipaaAuthorizationViewAccess()) {
          patientServices.HipaaAuthorization.getById({
            patientId: personId,
          }).$promise.then(
            function (res) {
              hipaaAuthorization = res.Value;
              promise = $.extend(promise, {
                values: res.Value,
              });
              defer.resolve(res);
            },
            function () {
              toastrFactory.error(
                localize.getLocalizedString(
                  'Failed to retrieve the patients {0}. Refresh the page to try again.',
                  ['HIPAA Authorization Form']
                ),
                localize.getLocalizedString('Server Error')
              );
            }
          );
        }
        return promise;
      };

      //// Get the data for medical history form answers for the timeline tile
      //factory.getByFormAnswersId = function (personId, formAnswerId) {
      //    var defer = $q.defer();
      //    var promise = defer.promise;

      //    if (medicalHistoryViewAccess()) {
      //        patientServices.MedicalHistory.getByFormAnswersId({ patientId: personId, formAnswersId: formAnswerId }).$promise.then(function (res) {
      //            promise = $.extend(promise, {
      //                values: res.Value
      //            });
      //            defer.resolve(res);
      //        },
      //            function () {
      //                toastrFactory.error(localize.getLocalizedString('Failed to retrieve the answers for {0}. Refresh the page to try again.', ['Medical History Forms']), localize.getLocalizedString('Server Error'));
      //            });
      //    }
      //    return promise;
      //};

      // Get the data for medical history timeline tile
      //factory.getSummariesByPatientId = function (personId) {
      //    var defer = $q.defer();
      //    var promise = defer.promise;

      //    if (hipaaAuthorizationViewAccess()) {
      //        patientServices.HipaaAuthorization.getSummariesByPatientId({ patientId: personId }).$promise.then(function (res) {
      //            hipaaAuthorization = res.Value;
      //            promise = $.extend(promise, {
      //                values: res.Value
      //            });
      //            defer.resolve(res);
      //        },
      //            function () {
      //                toastrFactory.error(localize.getLocalizedString('Failed to retrieve the patients {0}. Refresh the page to try again.', ['Hipaa Authorization Forms']), localize.getLocalizedString('Server Error'));
      //            });
      //    }
      //    return promise;
      //};

      factory.saveForm = function (personId, form) {
        var defer = $q.defer();
        var promise = defer.promise;
        if (hipaaAuthorizationCreateAccess()) {
          patientServices.HipaaAuthorization.save(
            { patientId: personId },
            form
          ).$promise.then(
            function (res) {
              toastrFactory.success(
                localize.getLocalizedString('Your {0} has been updated.', [
                  'HIPAA Authorization Form',
                ]),
                localize.getLocalizedString('Success')
              );
              var formAnswers = res.Value;
              promise = $.extend(promise, { values: res.Value });
              defer.resolve(res);
            },
            function () {
              toastrFactory.error(
                localize.getLocalizedString(
                  'Save was unsuccessful. Please retry your save.'
                ),
                localize.getLocalizedString('Server Error')
              );
            }
          );
        }
        return promise;
      };

      //#endregion

      return {
        access: function () {
          return factory.getHipaaAuthorizationAccess();
        },
        merge: function (res, hipaaAuthorizationForm) {
          //return mergeSavedFormToCurrentForm(res, ActiveHipaaAuthorizationForm, hipaaAuthorizationForm)
        },
        create: function () {
          return factory.newHipaaAuthorizationForm();
        },
        getById: function (personId) {
          return factory.getById(personId);
        },
        //getByFormAnswersId: function (personId, formAnswersId) {
        //    return factory.getByFormAnswersId(personId, formAnswersId);
        //},
        //getSummariesByPatientId: function (personId) {
        //    return factory.getSummariesByPatientId(personId);
        //},
        save: function (personId, form) {
          return factory.saveForm(personId, form);
        },
        UpdatingForm: false,
        SetUpdatingForm: function (flag) {
          this.UpdatingForm = flag;
        },
        ViewingForm: false,
        SetViewingForm: function (flag) {
          this.ViewingForm = flag;
        },
        LoadingForm: false,
        SetLoadingForm: function (flag) {
          this.LoadingForm = flag;
        },
        NewHipaaAuthorizationForm: null,
        SetNewHipaaAuthorizationForm: function (hipaaAuthorizationForm) {
          this.NewHipaaAuthorizationForm = hipaaAuthorizationForm;
        },
        ActiveHipaaAuthorizationForm: null,
        SetActiveHipaaAuthorizationForm: function (hipaaAuthorizationForm) {
          this.ActiveHipaaAuthorizationForm = hipaaAuthorizationForm;
        },
        DataChanged: false,
        SetDataChanged: function (flag) {
          this.DataChanged = flag;
        },
        SetYesNoToNo: function (form) {
          factory.setAnswerToNo(form);
        },
      };
    },
  ])
  .factory('PatientValidationFactory', [
    'PatientServices',
    'toastrFactory',
    'localize',
    'PersonServices',
    'ListHelper',
    '$q',
    'PersonFactory',
    '$uibModal',
    'patSecurityService',
    'UserServices',
    function (
      patientServices,
      toastrFactory,
      localize,
      personServices,
      listHelper,
      $q,
      personFactory,
      $uibModal,
      patSecurityService,
      userServices
    ) {
      var factory = this;
      var observers = [];
      factory.allAccountValidation = [];
      factory.patientData = {};
      factory.patientProfileData = {};

      // Check the patient info and return the result
      factory.checkPatientLocation = function (patientInfo, currentLocation) {
        var paitentLocationMatch = false;
        if (patientInfo) {
          var patientLocations = patientInfo.PatientLocations;
          var index = listHelper.findIndexByFieldValue(
            patientLocations,
            'LocationId',
            currentLocation.id ? currentLocation.id : currentLocation.LocationId
          );

          if (index != -1) {
            paitentLocationMatch = true;
          }

          return paitentLocationMatch;
        }
      };

      factory.setPatientData = function (patientData) {
        factory.patientData = patientData;
        angular.forEach(observers, function (observer) {
          observer(factory.patientData);
        });
      };

      factory.setPatientProfileData = function (patientProfileData) {
        factory.patientProfileData = patientProfileData;
        angular.forEach(observers, function (observer) {
          observer(factory.patientProfileData);
        });
      };

      factory.patientSearchValidation = function (patient) {
        var defer = $q.defer();
        var promise = defer.promise;
        var patientInfo = {};

        if (patient.PatientId) {
          userServices.UserPatientAccess.getAccountMemberAccess({
            patientId: patient.PatientId,
          }).$promise.then(function (res) {
            //res.Value.UserIsAuthorizedToAtLeastOnePatientLocation = false;
            if (res && res.Value) {
              var memberAuthorization = listHelper.findItemByFieldValue(
                res.Value,
                'PatientId',
                patient.PatientId
              );
              patientInfo.authorization = memberAuthorization;
              patientInfo.profile = patient;
              patientInfo.allAccountAuthorization = res.Value;
              factory.allAccountValidation = res.Value;
              promise = $.extend(promise, {
                Value: patientInfo,
              });
              defer.resolve(patientInfo);
            }
          });
          return promise;
        }
      };
      factory.userLocationAuthorization = function (locationId) {
        var defer = $q.defer();
        var promise = defer.promise;
        var locationInfo = {};

        if (locationId) {
          userServices.UserPatientAccess.getUserLocationAccess({
            locationId: locationId,
          }).$promise.then(function (res) {
            //res.Value.UserIsAuthorizedToAtLeastOnePatientLocation = false;
            if (res && res.Value) {
              locationInfo.authorization = res.Value;
              locationInfo.profile = null;
              locationInfo.allAccountAuthorization = res.Value;
              factory.allAccountValidation = res.Value;
              promise = $.extend(promise, {
                Value: locationInfo,
              });
              defer.resolve(locationInfo);
            }
          });
          return promise;
        }
      };

      factory.newTabAuthentication = function (patientId) {
        if (patientId) {
          personFactory.Overview(patientId).then(function (res) {
            if (res.Value) {
              factory.setPatientData(res.Value);
            }
          });
        }
      };

      // Launch the error modal for patient and user location mismatch
      factory.launchPatientLocationErrorModal = function (
        patientInfo,
        locationInfo
      ) {
        var modalInstance = $uibModal.open({
          templateUrl:
            'App/Patient/components/patient-location-validation/patient-location-validation.html',
          backdrop: 'static',
          keyboard: false,
          controller: 'PatientLocationValidationController',
          size: 'md',
          windowClass: 'center-modal',
          resolve: {
            patientData: function () {
              return patientInfo;
            },
            locationData: function () {
              return locationInfo;
            },
          },
        });
      };

      factory.launchMultiLocationPatientLocationErrorModal = function (
        patientInfo,
        locationInfo
      ) {
        var modalInstance = $uibModal.open({
          templateUrl:
            'App/Patient/components/multi-location-patient-location-validation/multi-location-patient-location-validation.html',
          backdrop: 'static',
          keyboard: false,
          controller: 'MultiLocationPatientLocationValidationController',
          size: 'md',
          windowClass: 'center-modal',
          resolve: {
            patientData: function () {
              return patientInfo;
            },
            locationData: function () {
              return locationInfo;
            },
          },
        });
      };

      // Launch the error modal for user location mismatch
      factory.launchUserLocationErrorModal = function (patientInfo, mode) {
        var modalInstance = $uibModal.open({
          templateUrl:
            'App/Common/components/userLocationAccess/user-location-access.html',
          backdrop: 'static',
          keyboard: false,
          controller: 'UserLocationValidationAccessController',
          size: 'md',
          bindtoController: true,
          windowClass: 'center-modal',
          resolve: {
            patientData: function () {
              return patientInfo;
            },
            mode: function () {
              return mode;
            },
          },
        });
      };
      // check on whether to this user has view permissions at this location
      factory.hasAccessAtLocation = function (location) {
        return patSecurityService.IsAuthorizedByAbbreviationAtLocation(
          'soar-per-perdem-search',
          location.LocationId
        );
      };

      // #endregion
      return {
        CheckPatientLocation: function (patientInfo, currentLocation) {
          return factory.checkPatientLocation(patientInfo, currentLocation);
        },
        PatientSearchValidation: function (patient) {
          return factory.patientSearchValidation(patient);
        },
        SetPatientData: function (patientData) {
          factory.setPatientData(patientData);
        },
        SetPatientProfileData: function (patientProfileData) {
          factory.setPatientProfileData(patientProfileData);
        },
        GetPatientData: function () {
          return factory.patientData;
        },
        GetPatientProfileData: function () {
          return factory.patientProfileData;
        },
        LaunchPatientLocationErrorModal: function (patientInfo, locationInfo) {
          return factory.launchPatientLocationErrorModal(
            patientInfo,
            locationInfo
          );
        },
        LaunchMultiLocationPatientLocationErrorModal: function (
          patientInfo,
          locationInfo
        ) {
          return factory.launchMultiLocationPatientLocationErrorModal(
            patientInfo,
            locationInfo
          );
        },
        LaunchUserLocationErrorModal: function (patientInfo, mode) {
          return factory.launchUserLocationErrorModal(patientInfo, mode);
        },
        ObservePatientData: function (observer) {
          observers.push(observer);
        },
        CheckingUserPatientAuthorization: false,
        SetCheckingUserPatientAuthorization: function (flag) {
          this.CheckingUserPatientAuthorization = flag;
        },
        AllAccountValidation: [],
        GetAllAccountValidation: function () {
          this.AllAccountValidation = factory.allAccountValidation;
          return this.AllAccountValidation;
        },
        NewTabAuthentication: function (patientId) {
          return factory.newTabAuthentication(patientId);
        },
        userLocationAuthorization: function (locationId) {
          return factory.userLocationAuthorization(locationId);
        },
      };
    },
  ]);
