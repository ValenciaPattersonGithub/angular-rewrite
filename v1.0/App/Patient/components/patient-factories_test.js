import { of } from 'rxjs';

describe('patientFactories tests ->', function () {

  beforeEach(module('Soar.Main', function ($provide) {
    $provide.value('FeatureFlagService', {
      getOnce$: jasmine.createSpy().and.returnValue(of(false))
    })
  }));
  beforeEach(module('Soar.Common'));
  beforeEach(module('common.factories'));
  beforeEach(module('Soar.Patient'));

  describe('PatientNotesFactory ->', function () {
    var toastrFactory, patientNotesFactory;
    var userSettingsDataService,
      appointmentViewDataLoadingService,
      appointmentViewVisibleService;
    var patientServices, q;

    //#region mocks

    var mockNoteTypes = [
      { Id: 1, Name: 'Account/Insurance' },
      { Id: 2, Name: 'Appointment' },
      { Id: 3, Name: 'Clinical' },
      { Id: 4, Name: 'General Patient Notes' },
    ];

    var mockStatusTypes = [
      { Id: 1, Name: 'Unmodified' },
      { Id: 2, Name: 'Modified' },
      { Id: 3, Name: 'Deleted' },
    ];

    var mockNote = {
      NoteId: '999',
      PatientId: 'a6993a42-6fc9-45c6-ad89-007db488a355',
      CreatedDate: new Date(),
      DateModified: new Date(),
      UserId: 'placeholder',
      Note: '<span style="color:#093;">amet porttitor massa iaculis.</span>',
      Id: null,
      ToothNumbers: null,
      IsActive: false,
      StatusTypeId: mockStatusTypes[0].Id,
      NoteTypeId: mockNoteTypes[2].Id,
      NoteTitle: 'Title',
    };

    var mockNotes = [
      {
        NoteId: '133',
        PatientId: 'a6993a42-6fc9-45c6-ad89-007db488a355',
        CreatedDate: new Date(),
        DateModified: new Date(),
        UserId: 'placeholder',
        Note: '<span style="color:#093;">Cras varius mi et sapien suscipit semper. Phasellus nec nulla ornare, molestie lorem eu, dictum tortor. Mauris et feugiat lacus. Proin enim eros, placerat ut ex vel, posuere aliquam ex. Pellentesque rhoncus, neque at sagittis porta, diam dui scelerisque ligula, sit amet tincidunt massa libero ac metus. Suspendisse bibendum, turpis a sollicitudin auctor, purus risus finibus nisi, eu gravida tellus nibh nec felis. Sed et odio pretium, commodo leo ac, dignissim turpis. Pellentesque accumsan faucibus diam a porta. Vivamus gravida vel sem ut varius. Nam venenatis arcu quis iaculis lobortis. Donec vitae malesuada purus. In pellentesque interdum imperdiet. Vivamus efficitur risus eu ipsum finibus, sit amet porttitor massa iaculis.</span>',
        Id: null,
        ToothNumbers: null,
        IsActive: false,
        StatusTypeId: mockStatusTypes[0].Id,
      },
      {
        NoteId: '134',
        PatientId: 'a6993a42-6fc9-45c6-ad89-007db488a355',
        DateModified: new Date(),
        CreatedDate: new Date(),
        UserId: 'placeholder',
        Note: '<span style="color:#093;font-weight:bold;font-style:italic;text-decoration:underline;">Lorem ipsum dolor sit amet, consectetur adipiscing elit. Quisque pharetra facilisis mollis. Cras varius mi et sapien suscipit semper. Phasellus nec nulla ornare, molestie lorem eu, dictum tortor. Mauris et feugiat lacus. Proin enim eros, placerat ut ex vel, posuere aliquam ex. Pellentesque rhoncus, neque at sagittis porta, diam dui scelerisque ligula, sit amet tincidunt massa libero ac metus. Suspendisse bibendum, turpis a sollicitudin auctor, purus risus finibus nisi, eu gravida tellus nibh nec felis. Sed et odio pretium, commodo leo ac, dignissim turpis. Pellentesque accumsan faucibus diam a porta. Vivamus gravida vel sem ut varius. Nam venenatis arcu quis iaculis lobortis. Donec vitae malesuada purus. In pellentesque interdum imperdiet. Vivamus efficitur risus eu ipsum finibus, sit amet porttitor massa iaculis.</span>',
        Id: mockNoteTypes[1].Id,
        ToothNumbers: '2,3,4',
        IsActive: false,
        StatusTypeId: mockStatusTypes[0].Id,
      },
    ];

    var mockNotesResponse = {
      Value: mockNotes,
    };

    //#endregion

    //#region before each

    beforeEach(module('Soar.Common'));
    beforeEach(module('common.factories'));
    beforeEach(
      module('Soar.Patient', function ($provide) {
        patientServices = {
          ClinicalNotes: {
            get: jasmine.createSpy().and.returnValue(mockNotesResponse),
            create: jasmine.createSpy().and.returnValue({}),
            update: jasmine.createSpy().and.returnValue({}),
            delete: jasmine.createSpy().and.returnValue({}),
            markDeleted: jasmine.createSpy().and.callFake(function () {
              var deferred = q.defer();
              deferred.$promise = deferred.promise;
              deferred.resolve({});
              return deferred;
            }),
          },
        };
        $provide.value('PatientServices', patientServices);

        toastrFactory = {};
        toastrFactory.error = jasmine.createSpy();
        toastrFactory.success = jasmine.createSpy();
        $provide.value('toastrFactory', toastrFactory);

        userSettingsDataService = {
          isNewAppointmentAreaEnabled: jasmine
            .createSpy()
            .and.returnValue(false),
        };
        $provide.value('userSettingsDataService', userSettingsDataService);

        appointmentViewVisibleService = {
          changeAppointmentViewVisible: jasmine.createSpy(),
        };
        $provide.value(
          'AppointmentViewVisibleService',
          appointmentViewVisibleService
        );

        appointmentViewDataLoadingService = {
          getViewData: jasmine.createSpy(),
        };
        $provide.value(
          'AppointmentViewDataLoadingService',
          appointmentViewDataLoadingService
        );
      })
    );

    // inject the factory
    beforeEach(inject(function ($injector, $q) {
      q = $q;
      patientNotesFactory = $injector.get('PatientNotesFactory');
    }));

    //#endregion

    describe('SetProviderLabel method -> ', function () {
      it('should set provider lable based on note.StatusTypeId and CreatedDate', function () {
        var note = angular.copy(mockNote);
        note.CreatedDate = new Date();
        note.CreatedDate.lastIndexOf = jasmine
          .createSpy('note.CreatedDate.lastIndexOf')
          .and.returnValue('Z');
        note.StatusTypeId = 3;
        expect(patientNotesFactory.SetProviderLabel(note)).toEqual(
          'Deleted by: '
        );
        note.StatusTypeId = 2;
        expect(patientNotesFactory.SetProviderLabel(note)).toEqual(
          'Created by: '
        );
        note.StatusTypeId = 1;
        expect(patientNotesFactory.SetProviderLabel(note)).toEqual(
          'Created by: '
        );
      });

      it('should set provider lable based on note.StatusTypeId and CreatedDate', function () {
        var note = angular.copy(mockNote);
        note.CreatedDate = '2017-01-01';
        note.CreatedDate.lastIndexOf = jasmine
          .createSpy('note.CreatedDate.lastIndexOf')
          .and.returnValue('Z');
        note.StatusTypeId = 3;
        expect(patientNotesFactory.SetProviderLabel(note)).toEqual(
          'Deleted by: '
        );
        note.StatusTypeId = 2;
        expect(patientNotesFactory.SetProviderLabel(note)).toEqual(
          'Updated by: '
        );
        note.StatusTypeId = 1;
        expect(patientNotesFactory.SetProviderLabel(note)).toEqual(
          'Created by: '
        );
      });
    });

    describe('NoteIsLocked method -> ', function () {
      it('should determine if the note is locked if date > 24 hours from now', function () {
        var note = angular.copy(mockNote);
        note.CreatedDate = '2017-01-01';
        var valueReturned = patientNotesFactory.NoteIsLocked(note);
        expect(valueReturned).toBe(true);
      });

      it('should determine note is not locked if date < 24 hours from now', function () {
        var note = angular.copy(mockNote);
        note.CreatedDate.lastIndexOf = jasmine
          .createSpy('note.CreatedDate.lastIndexOf')
          .and.returnValue('Z');
        var valueReturned = patientNotesFactory.NoteIsLocked(note);
        expect(valueReturned).toBe(false);
      });
    });

    describe('validateActiveNote method -> ', function () {
      it('should validate a note and return state', function () {
        var note = angular.copy(mockNote);
        note.Note = null;
        var valueReturned = patientNotesFactory.validateNote(note);
        expect(valueReturned).toBe(false);
        note.Note = 'anything';
        note.AssignedProviderId = 'test';
        valueReturned = patientNotesFactory.validateNote(note);
        expect(valueReturned).toBe(true);
      });
    });

    describe('setDataChanged method -> ', function () {
      it('should set DataHasChanged property', function () {
        patientNotesFactory.DataChanged = false;
        patientNotesFactory.setDataChanged(true);
        expect(patientNotesFactory.DataChanged).toBe(true);

        patientNotesFactory.setDataChanged(false);
        expect(patientNotesFactory.DataChanged).toBe(false);
      });
    });

    describe('setEditMode method -> ', function () {
      it('should set EditMode property', function () {
        patientNotesFactory.EditMode = false;
        patientNotesFactory.setEditMode(true);
        expect(patientNotesFactory.EditMode).toBe(true);

        patientNotesFactory.setEditMode(false);
        expect(patientNotesFactory.EditMode).toBe(false);
      });
    });

    describe('setActiveNote method -> ', function () {
      it('should set ActiveNote object', function () {
        patientNotesFactory.ActiveNote = null;
        patientNotesFactory.setActiveNote(mockNote);
        expect(patientNotesFactory.ActiveNote).toEqual(mockNote);

        patientNotesFactory.setActiveNote(null);
        expect(patientNotesFactory.ActiveNote).toBe(null);
      });
    });

    describe('getNameAndDesignation method -> ', function () {
      it('should return formatted CreatedByName and CreatedByProfessionalDesignation', function () {
        var note = angular.copy(mockNote);
        note.CreatedByName = 'Flintstone, Fred';
        note.CreatedByProfessionalDesignation = null;
        var valueReturned = patientNotesFactory.getNameAndDesignation(note);
        expect(valueReturned).toEqual('Flintstone, Fred');

        note.CreatedByProfessionalDesignation = 'QRE';
        valueReturned = patientNotesFactory.getNameAndDesignation(note);
        expect(valueReturned).toEqual('Flintstone, Fred, QRE');
      });
    });

    describe('setActiveNewNote method -> ', function () {
      it('should set ActiveNote to a new note', function () {
        patientNotesFactory.ActiveNote = null;
        patientNotesFactory.setActiveNewNote();
        expect(patientNotesFactory.ActiveNote.Note).toEqual(
          patientNotesFactory.NewNote.Note
        );
      });
    });

    describe('observeNotes method -> ', function () {
      it('should add observer to list of observers', function () {});
    });

    //TODO finish tests
    /*var deleteActiveNote = function (note) {
            var defer = $q.defer();
            var promise = defer.promise;
            patientServices.ClinicalNotes.delete({ Id: note.PatientId, NoteId: note.NoteId }).$promise.then(
                function (res) {
                    promise = $.extend(promise, { values: res });
                    defer.resolve(res);
                    removeFromNotes(note);
                    toastrFactory.success(localize.getLocalizedString('Delete successful.'), localize.getLocalizedString('Success'));
                },
                function() {
                    toastrFactory.error(localize.getLocalizedString('Failed to delete the {0}. Please try again.', ['Clinical Note']), localize.getLocalizedString('Server Error'));
                });
            return promise;
        };
        */
    describe('deleteNote -> ', function () {
      it('should call patientServices.ClinicalNotes.delete', function () {
        var note = angular.copy(mockNote);
        patientNotesFactory.deleteNote(note);
      });
    });
  });

  //TODO test the patientNotesFactory crud functions ?

  describe('PatientLogic -> ', function () {
    var patientLogic, patients, patientServices;

    beforeEach(
      module('Soar.Patient', function ($provide) {
        patientServices = {
          Patients: {
            get: jasmine.createSpy().and.returnValue({}),
          },
        };
      })
    );

    patients = [
      {
        FirstName: 'Jordan',
        LastName: 'Schlansky',
        PatientCode: 'SCHJO1',
        PreferredLocation: '4',
        PatientId: 22,
        docList: [
          {
            DocumentId: 1,
            ParentId: 22,
            Name: 'scans.pdf',
            DocumentGroupId: 33,
          },
          {
            DocumentId: 1,
            ParentId: 22,
            Name: 'xrays.png',
            DocumentGroupId: 33,
          },
        ],
      },
      {
        FirstName: 'Larry',
        LastName: 'Melman',
        PatientCode: 'MELLO1',
        PreferredLocation: '2',
        PatientId: 23,
        docList: [],
      },
    ];

    beforeEach(inject(function ($injector) {
      patientLogic = $injector.get('PatientLogic');
    }));

    describe('patientLogic', function () {
      it('should not be empty', function () {
        expect(patientLogic).not.toBe(null);
      });
    });

    describe('GetFormattedName function -> ', function () {
      it('should return last name, first name, and code if there is no middle name or suffix', function () {
        expect(patientLogic.GetFormattedName(patients[0])).toBe(
          'Schlansky, Jordan (SCHJO1)'
        );
      });

      it('should append middle name if there is one', function () {
        patients[0].MiddleName = 'M.';
        expect(patientLogic.GetFormattedName(patients[0])).toBe(
          'Schlansky, Jordan M., (SCHJO1)'
        );
      });

      it('should append suffix if there is one', function () {
        delete patients[0].MiddleName;
        patients[0].Suffix = 'Sr.';
        expect(patientLogic.GetFormattedName(patients[0])).toBe(
          'Schlansky, Jordan Sr. (SCHJO1)'
        );
      });

      it('should display them all', function () {
        patients[0].MiddleName = 'M.';
        patients[0].Suffix = 'Sr.';
        expect(patientLogic.GetFormattedName(patients[0])).toBe(
          'Schlansky, Jordan M., Sr. (SCHJO1)'
        );
      });
    });
  });

  describe('PatientLandingFactory ->', function () {
    var toastrFactory,
      patSecurityService,
      localize,
      personServices,
      q,
      locationServices,
      userServices,
      scheduleServices,
      patientLandingFactory,
      patientServices;
    var deferred, listHelper;
    beforeEach(module('Soar.Common'));
    beforeEach(module('common.factories'));

    beforeEach(
      module('Soar.Patient', function ($provide) {
        listHelper = { findItemByFieldValue: jasmine.createSpy() };
        $provide.value('ListHelper', listHelper);
        patSecurityService = {
          IsAuthorizedByAbbreviation: jasmine.createSpy().and.returnValue({}),
          generateMessage: jasmine.createSpy().and.returnValue({}),
        };
        $provide.value('PatSecurityService', patSecurityService);

        localize = {
          getLocalizedString: jasmine.createSpy().and.returnValue({}),
        };
        $provide.value('localize', localize);

        personServices = {
          Persons: {
            get: jasmine.createSpy().and.callFake(function () {
              deferred = q.defer();
              deferred.$promise = deferred.promise;
              deferred.resolve('some value in return');
              return deferred;
            }),
          },
        };
        $provide.value('PersonServices', personServices);

        userServices = {
          Users: { get: jasmine.createSpy().and.returnValue({}) },
        };
        $provide.value('UserServices', userServices);

        locationServices = {
          get: jasmine.createSpy().and.callFake(function () {
            deferred = q.defer();
            deferred.$promise = deferred.promise;
            deferred.resolve('some value in return');
            return deferred;
          }),
        };
        $provide.value('LocationServices', locationServices);

        scheduleServices = {
          Lists: {
            Appointments: {
              GetAllWithDetails: jasmine.createSpy().and.returnValue({}),
            },
          },
        };
        $provide.value('ScheduleServices', scheduleServices);

        toastrFactory = {};
        toastrFactory.error = jasmine.createSpy();
        toastrFactory.success = jasmine.createSpy();
        $provide.value('toastrFactory', toastrFactory);

        patientServices = {
          AppointmentPatientTab: {
            get: jasmine.createSpy().and.returnValue({ $promise: {} }),
          },
        };
        $provide.value('PatientServices', patientServices);
      })
    );

    // inject the factory
    beforeEach(inject(function ($injector, $q) {
      q = $q;
      patientLandingFactory = $injector.get('PatientLandingFactory');
    }));

    describe('patientLandingFactory', function () {
      it('should not be empty', function () {
        expect(patientLandingFactory).not.toBe(null);
      });
    });

    describe('Authentications -> ', function () {
      it('should return all view access to true', function () {
        var result = patientLandingFactory.access();
        expect(result).toEqual({
          PatientView: true,
          PreventiveCareView: true,
          ScheduledAppointmentView: true,
          UnScheduledAppointmentView: true,
          UnScheduledTreatmentView: true,
        });
      });
    });

    describe('GetPersons ->', function () {
      it('should get call to personServices.Persons.get service', function () {
        patientLandingFactory.access();
        patientLandingFactory.GetPersons({ FillAccount: false });

        expect(personServices.Persons.get).toHaveBeenCalled();
      });
    });

    describe('GetLocations ->', function () {
      it('should get call to locationServices.get service', function () {
        patientLandingFactory.GetLocations({});

        expect(locationServices.get).toHaveBeenCalled();
      });
    });

    describe('GetProviders ->', function () {
      it('should get call to userServices.Users.get service', function () {
        patientLandingFactory.GetProviders({});

        expect(userServices.Users.get).toHaveBeenCalled();
      });
    });

    describe('RetriveAppointments ->', function () {
      it('should get call to scheduleServices.Lists.Appointments.GetAllWithDetails', function () {
        patientLandingFactory.access();
        patientLandingFactory.RetriveAppointments({});

        expect(patientServices.AppointmentPatientTab.get).toHaveBeenCalled();
      });
    });

    describe('GetPersonName function->', function () {
      it('should set empty string to the person when person is null', function () {
        var result = patientLandingFactory.GetPersonName(null);
        expect(result).toBe('');
      });

      it('should set person as per first (preffered) middle last, suffix when the person have data', function () {
        var person = {
          FirstName: 'First',
          PreferredName: 'Preffered',
          MiddleName: 'Middle',
          LastName: 'Last',
          SuffixName: 'Suffix',
        };
        var result = patientLandingFactory.GetPersonName(person);
        expect(result).toEqual('First (Preffered) Middle. Last, Suffix');
      });

      it('should set person as per first last when the person have data', function () {
        var person = {
          FirstName: 'First',
          PreferredName: '',
          MiddleName: '',
          LastName: 'Last',
          SuffixName: '',
        };
        var result = patientLandingFactory.GetPersonName(person);
        expect(result).toBe('First Last');
      });
    });

    describe('appointmentRetrievalSuccess  function ->', function () {
      var ofcLocation = { id: 1, name: 'PattersonA' };

      it('should set appointment data to display on UI', function () {
        var result = {
          Value: [
            {
              Appointment: {
                StartTime: '2016-26-04 12:30:29',
              },
              AppointmentType: { Name: 'Appt 1' },
              ProviderUsers: [{ User: 'User1' }],
              Status: 'regular',
              Location: ofcLocation,
              Person: { LastName: 'ABC' },
            },
            {
              Appointment: {
                StartTime: '2016-26-04 02:30:29',
              },
              AppointmentType: { Name: 'Appt 2' },
              ProviderUsers: [
                {
                  User: 'User2',
                },
              ],
              Status: 'blocked',
              Location: ofcLocation,
              Person: { LastName: 'XYZ' },
            },
          ],
        };
        var ctrl = patientLandingFactory.ConvertToAppointmentsObjects(
          result,
          {}
        );
        expect(ctrl.appointmentData).not.toBeNull();
      });
    });

    describe('GetScheduleApptColumns ->', function () {
      it('should return only the columns related to scheduled appointments', function () {
        /* eslint-disable no-template-curly-in-string */
        var result = patientLandingFactory.GetScheduleApptColumns();
        expect(result).toEqual([
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
        ]);
        /* eslint-enable no-template-curly-in-string */
      });
    });

    describe('GetAllPatientsColumns ->', function () {
      it('should return only the columns related to all patients', function () {
        /* eslint-disable no-template-curly-in-string */
        var result = patientLandingFactory.GetAllPatientsColumns();
        expect(result).toEqual([
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
              dataSource: [],
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
        ]);
        /* eslint-enable no-template-curly-in-string */
      });
    });

    describe('GetLocationNameById ->', function () {
      it('should return location name based on loaction Id', function () {
        listHelper.findItemByFieldValue = jasmine
          .createSpy()
          .and.returnValue({ LocationId: 1, LocationName: 'NGP' });
        var result = patientLandingFactory.GetLocationNameById(
          { LocationId: 1, LocationName: 'NY' },
          [{ LocationId: 1, LocationName: 'NGP' }]
        );
        expect(listHelper.findItemByFieldValue).toHaveBeenCalled();
        expect(result).toEqual({ LocationId: 1, LocationName: 'NGP' });
      });

      it('should return empty based on location Id set to null', function () {
        listHelper.findItemByFieldValue = jasmine
          .createSpy()
          .and.returnValue(null);
        var result = patientLandingFactory.GetLocationNameById({}, [
          { LocationId: 1, LocationName: 'NGP' },
        ]);
        expect(result).toEqual('');
      });
    });

    describe('convertToAppointmentsObjects ->', function () {
      it('should return appointments modifeid with ', function () {
        var appointments = [
          {
            Appointment: { StartTime: '2016-26-04 12:30:29' },
            AppointmentType: { Name: 'Appt 1' },
            ProviderUsers: [],
            Status: 'regular',
            Location: location,
            PatientLastName: 'ABC',
            ContactInformation: [{ PhoneNumber: '(999) 999 9999' }],
            PreferredDentist: null,
            LastCommunication: new Date(),
          },
          {
            Appointment: {},
            AppointmentType: { Name: 'Appt 2' },
            ProviderUsers: [],
            Status: 'blocked',
            Location: location,
            PatientLastName: 'XYZ',
            ContactInformation: [{ PhoneNumber: '(999) 999 9999' }],
            PreferredDentist: null,
            LastCommunication: new Date(),
          },
        ];
        var result = patientLandingFactory.ConvertToAppointmentsObjects(
          appointments,
          []
        );
        expect(result).toEqual([
          {
            DisplayName:
              appointments[0].PatientFirstName +
              ' ' +
              appointments[0].PatientLastName,
            LastName: appointments[0].PatientLastName,
            PatientId: appointments[0].PatientId,
            DisplayNameForGlobalSearch:
              appointments[0].PatientFirstName +
              ' ' +
              appointments[0].PatientLastName,
            DateOfBirth: null,
            Age: '',
            AccountId: appointments[0].PersonAccountId,
            LocationName: appointments[0].PreferredLocationName,
            LocationId: appointments[0].PreferredLocationId,
            PreferredDentistId: appointments[0].PreferredDentist,
            PreferredDentist: 'N/A',
            PreferredHygienistId: appointments[0].PreferredHygienist,
            PreferredHygienist: 'N/A',
            ResponsiblePartyId: appointments[0].ResponsiblePartyId,
            ResponsibleParty: 'N/A',
            LastAppointmentId: appointments[0].LastAppointmentId,
            LastAppointment: null,
            LastAppointmentType: appointments[0].LastAppointmentDescription,
            NextAppointment: null,
            NextAppointmentId: appointments[0].NextAppointmentId,
            NextAppointmentType: appointments[0].NextAppointmentDescription,
            DueDate: '',
            TreatmentPlansCount: appointments[0].TreatmentPlanCount,
            TreatmentPlansTotal: appointments[0].TreatmentPlanTotalBalance,
            TreatmentPlanName: appointments[0].TreatmentPlanName,
            TreatmentPlanCreatedDate: appointments[0].TreatmentPlanCreatedDate,
            LastCommunication: moment(appointments[0].LastCommunication).format(
              'MM/DD/YYYY'
            ),
          },
          {
            DisplayName:
              appointments[1].PatientFirstName +
              ' ' +
              appointments[1].PatientLastName,
            LastName: appointments[1].PatientLastName,
            PatientId: appointments[1].PatientId,
            DisplayNameForGlobalSearch:
              appointments[1].PatientFirstName +
              ' ' +
              appointments[1].PatientLastName,
            DateOfBirth: null,
            Age: '',
            AccountId: appointments[1].PersonAccountId,
            LocationName: appointments[1].PreferredLocationName,
            LocationId: appointments[1].PreferredLocationId,
            PreferredDentistId: appointments[1].PreferredDentist,
            PreferredDentist: 'N/A',
            PreferredHygienistId: appointments[1].PreferredHygienist,
            PreferredHygienist: 'N/A',
            ResponsiblePartyId: appointments[1].ResponsiblePartyId,
            ResponsibleParty: 'N/A',
            LastAppointmentId: appointments[1].LastAppointmentId,
            LastAppointment: null,
            LastAppointmentType: appointments[1].LastAppointmentDescription,
            NextAppointment: null,
            NextAppointmentId: appointments[1].NextAppointmentId,
            NextAppointmentType: appointments[1].NextAppointmentDescription,
            DueDate: '',
            TreatmentPlansCount: appointments[1].TreatmentPlanCount,
            TreatmentPlansTotal: appointments[1].TreatmentPlanTotalBalance,
            TreatmentPlanName: appointments[1].TreatmentPlanName,
            TreatmentPlanCreatedDate: appointments[1].TreatmentPlanCreatedDate,
            LastCommunication: moment(appointments[1].LastCommunication).format(
              'MM/DD/YYYY'
            ),
          },
        ]);
      });
    });

    describe('ConvertToPersonObjects  ->', function () {
      it('should return one person', function () {
        var persons = [
          {
            Phones: [{ PhoneNumber: '(986) 073-3202' }],
            Profile: { IsActive: true },
          },
        ];

        var result = patientLandingFactory.ConvertToPersonObjects(persons);
        expect(result).toEqual([
          {
            Age: 'N/A',
            DisplayName: '',
            DisplayNameForGlobalSearch: '',
            LastName: undefined,
            PatientCode: undefined,
            DateOfBirth: '',
            PhoneNumber: '(986) 073-3202',
            UnMaskedPhoneNumber: '9860733202',
            PatientId: undefined,
            PreferredDentist: 'N/A',
            IsActive: true,
          },
        ]);
      });
    });
  });

  describe('PatientPreventiveCareFactory ->', function () {
    var toastrFactory, patientPreventiveCareFactory;
    var patientServices;
    var mockServicesDueResponse;

    //#region mocks

    var today = function () {
      return moment().startOf('day');
    };

    var msdr = {
      ExtendedStatusCode: null,
      Value: [
        {
          PatientId: '9f00f41b-9613-4c06-8771-ea32eb5b9861',
          PreventiveServiceTypeId: 'f08f35ff-19ab-4fa7-a022-6ac8afa0937f',
          PreventiveServiceTypeDescription: 'Prophy/Perio Maint.',
          DateServiceDue: today().subtract(60, 'days').format('M/D/YYYY'),
          DateServiceLastPerformed: today()
            .subtract(213, 'days')
            .format('M/D/YYYY'),
          IsTrumpService: false,
          Frequency: 6,
          PercentTimeRemaining: 0,
        },
        {
          PatientId: '9f00f41b-9613-4c06-8771-ea32eb5b9861',
          PreventiveServiceTypeId: '9a3d8820-59e8-49bf-ac94-e5afb672cdcb',
          PreventiveServiceTypeDescription: 'Exam',
          DateServiceDue: null,
          DateServiceLastPerformed: null,
          IsTrumpService: true,
          Frequency: 6,
          PercentTimeRemaining: 30,
        },
        {
          PatientId: '9f00f41b-9613-4c06-8771-ea32eb5b9861',
          PreventiveServiceTypeId: '810966e5-efda-450c-8f85-b98364faa10e',
          PreventiveServiceTypeDescription: 'FMX/Pano',
          DateServiceDue: today().add(60, 'days').format('M/D/YYYY'),
          DateServiceLastPerformed: today()
            .subtract(122, 'days')
            .format('M/D/YYYY'),
          IsTrumpService: false,
          Frequency: 6,
          PercentTimeRemaining: 40,
        },
        {
          PatientId: '9f00f41b-9613-4c06-8771-ea32eb5b9861',
          PreventiveServiceTypeId: '6254b8d1-e2d6-4403-b4b4-e69b37d27a92',
          PreventiveServiceTypeDescription: 'Bitewings',
          DateServiceDue: '6/12/2016',
          DateServiceLastPerformed: '12/12/2015',
          IsTrumpService: false,
          Frequency: 6,
          PercentTimeRemaining: null,
        },
        {
          PatientId: '9f00f41b-9613-4c06-8771-ea32eb5b9861',
          PreventiveServiceTypeId: '3b8a664f-227a-49af-bb27-53dfef5f7fc1',
          PreventiveServiceTypeDescription: 'Fluoride',
          DateServiceDue: '4/14/2016',
          DateServiceLastPerformed: '10/14/2015',
          IsTrumpService: false,
          Frequency: 6,
          PercentTimeRemaining: 90,
        },
      ],
      Count: null,
      InvalidProperties: null,
    };

    //#endregion

    //#region before each

    beforeEach(module('Soar.Common'));
    beforeEach(module('common.factories'));

    beforeEach(
      module('Soar.Patient', function ($provide) {
        patientServices = {
          ClinicalNotes: {
            get: jasmine.createSpy().and.returnValue({}),
            create: jasmine.createSpy().and.returnValue({}),
            update: jasmine.createSpy().and.returnValue({}),
          },
        };
        $provide.value('PatientServices', patientServices);

        toastrFactory = {};
        toastrFactory.error = jasmine.createSpy();
        toastrFactory.success = jasmine.createSpy();
        $provide.value('toastrFactory', toastrFactory);
      })
    );

    // inject the factory
    beforeEach(inject(function ($injector) {
      mockServicesDueResponse = msdr;
      patientPreventiveCareFactory = $injector.get(
        'PatientPreventiveCareFactory'
      );
    }));

    //#endregion

    //#region utility

    describe('setCustomPropertiesForServicesDue -> ', function () {
      it('should set custom properties for bar', function () {
        var exam = angular.copy(mockServicesDueResponse.Value[0]);
        patientPreventiveCareFactory.SetCustomPropertiesForServicesDue(
          exam,
          false
        );
        expect(exam.$$Class).toBe('progress-bar-danger');
      });

      it('should set custom properties fpr text', function () {
        var exam = angular.copy(mockServicesDueResponse.Value[2]);
        patientPreventiveCareFactory.SetCustomPropertiesForServicesDue(
          exam,
          true
        );
        expect(exam.$$Class).toBe('patientPrevCare__warning');
      });

      it('should set custom property to zero when dates are null', function () {
        var exam = angular.copy(mockServicesDueResponse.Value[1]);
        patientPreventiveCareFactory.SetCustomPropertiesForServicesDue(exam);
        expect(exam.$$Class).toBeUndefined;
      });

      it('should set $$DateLabel based on PercentTimeRemaining', function () {
        var exam = angular.copy(mockServicesDueResponse.Value[2]);
        patientPreventiveCareFactory.SetCustomPropertiesForServicesDue(
          exam,
          true
        );
        expect(exam.$$DateLabel).toBe('Due After');
        exam = angular.copy(mockServicesDueResponse.Value[0]);
        patientPreventiveCareFactory.SetCustomPropertiesForServicesDue(
          exam,
          true
        );
        expect(exam.$$DateLabel).toBe('Past Due Since');
      });
    });

    //#endregion
  });

  describe('PatientInsurancePaymentFactory ->', function () {
    beforeEach(module('Soar.Common'));
    beforeEach(module('common.factories'));
    beforeEach(module('Soar.Schedule'));
    var locationServices;
    beforeEach(module('Soar.BusinessCenter'), function ($provide) {
      locationServices = {
        get: jasmine.createSpy('locationServices.get'),
      };
      $provide.value('LocationServices', locationServices);
    });

    var patientInsurancePaymentFactory, patientServices, q,paymentGatewayService;
    var claimsMock, claimsServicesMock, patSecurityService, deferred;

    beforeEach(
      module('Soar.Patient', function ($provide) {
        patientServices = {
          ClaimServiceTransactions: {
            creditdistribution: jasmine.createSpy().and.callFake(function () {
              deferred = q.defer();
              deferred.$promise = deferred.promise;
              deferred.resolve('some value in return');
              return deferred;
            }),
            creditdistributions: jasmine.createSpy().and.callFake(function () {
              deferred = q.defer();
              deferred.$promise = deferred.promise;
              deferred.resolve('some value in return');
              return deferred;
            }),
          },
          CreditTransactions: {
            applyInsurance: jasmine.createSpy().and.callFake(function () {
              deferred = q.defer();
              deferred.$promise = deferred.promise;
              return deferred.$promise;
            }),
            applyBulkInsurancePayments: jasmine
              .createSpy()
              .and.callFake(array => {
                return {
                  $promise: {
                    then(callback) {
                      callback(array);
                    },
                  },
                };
              }),
          },
        };

        var userLocation = '{"id": "101"}';
        sessionStorage.setItem('userLocation', userLocation);

        $provide.value('PatientServices', patientServices);

        patSecurityService = {
          IsAuthorizedByAbbreviation: jasmine
            .createSpy('patSecurityService.IsAuthorizedByAbbreviation')
            .and.returnValue(true),
          generateMessage: jasmine.createSpy(
            'patSecurityService.generateMessage'
          ),
        };

        $provide.value('PatSecurityService', patSecurityService);
        paymentGatewayService={
          completeCreditTransaction: jasmine.createSpy().and.callFake(function () {
            deferred = q.defer();
            deferred.$promise = deferred.promise;
            deferred.resolve('some value in return');
            return deferred;
          }),

        }

        $provide.value('PaymentGatewayService', paymentGatewayService);
        //#region
        claimsMock = [
          {
            AccountId: '0d0a8e10-fb1b-e611-9422-005056bd4ab3',
            AccountMemberId: '0e0a8e10-fb1b-e611-9422-005056bd4ab3',
            CarrierId: '00000000-0000-0000-0000-000000000000',
            CarrierName: 'Atena',
            ClaimEntityId: '00000000-0000-0000-0000-000000000000',
            ClaimId: '6a7428de-181c-e611-9422-005056bd4ab3',
            DataTag: null,
            DateModified: '0001-01-01T00:00:00',
            DisplayDate: '5/1/2016 - 5/17/2016',
            LocationId: 3,
            MaxServiceDate: '2016-05-17T00:00:00',
            MinServiceDate: '2016-05-01T00:00:00',
            PatientId: '00000000-0000-0000-0000-000000000000',
            PatientName: ' ',
            PrimaryClaim: 'Primary Claim',
            ProviderId: '00000000-0000-0000-0000-000000000000',
            ProviderName: 'Muhammad  Iqbal',
            Status: 'Status',
            ServiceTransactionToClaimPaymentDtos: [
              {
                AccountMemberId: '0e0a8e10-fb1b-e611-9422-005056bd4ab3',
                Balance: 0,
                Charges: 8500,
                ClaimId: '6a7428de-181c-e611-9422-005056bd4ab3',
                DataTag: null,
                DateEntered: '2016-05-01T10:19:28.863',
                DateModified: '0001-01-01T00:00:00',
                Description:
                  'D0170: re-evaluation - limited, problem focused (established patient;not post-operative visit) (D0170)',
                EncounterId: 'bcf1abd6-181c-e611-9422-005056bd4ab3',
                InsuranceEstimate: 850,
                OriginalInsuranceEstimate: 850,
                PaidInsuranceEstimate: 0,
                PatientName: ' ',
                ProviderName: 'Muhammad  Iqbal',
                ProviderUserId: 'edd31811-6e1b-e611-a3af-2cd05a825b01',
                ServiceTransactionId: 'bef1abd6-181c-e611-9422-005056bd4ab3',
                ServiceTransactionToClaimId:
                  '00000000-0000-0000-0000-000000000000',
                UserModified: '00000000-0000-0000-0000-000000000000',
              },
            ],
            Type: 0,
            UserModified: '00000000-0000-0000-0000-000000000000',
          },
        ];

        claimsServicesMock = [
          {
            AccountMemberId: '0e0a8e10-fb1b-e611-9422-005056bd4ab3',
            Balance: 0,
            Charges: 8500,
            ClaimId: '6a7428de-181c-e611-9422-005056bd4ab3',
            DataTag: null,
            DateEntered: '2016-05-01T10:19:28.863',
            DateModified: '0001-01-01T00:00:00',
            Description:
              'D0170: re-evaluation - limited, problem focused (established patient;not post-operative visit) (D0170)',
            EncounterId: 'bcf1abd6-181c-e611-9422-005056bd4ab3',
            InsuranceEstimate: 850,
            OriginalInsuranceEstimate: 850,
            PaidInsuranceEstimate: 0,
            PatientName: ' ',
            ProviderName: 'Muhammad  Iqbal',
            ProviderUserId: 'edd31811-6e1b-e611-a3af-2cd05a825b01',
            ServiceTransactionId: 'bef1abd6-181c-e611-9422-005056bd4ab3',
            ServiceTransactionToClaimId: '00000000-0000-0000-0000-000000000000',
            UserModified: '00000000-0000-0000-0000-000000000000',
            IsInvalidAmount: false,
            claimDisplayDate: '5/1/2016 - 5/17/2016',
            claimProviderName: 'Muhammad  Iqbal',
            claimPatientName: ' ',
            claimDescription: 'Atena - Primary Claim',
            claimMinDate: '2016-05-01T00:00:00',
            Amount: 0,
            SortOrder: 1,
            Status: 'Status',
          },
        ];

        //#endregion
      })
    );

    // inject the factory
    beforeEach(inject(function ($injector, $q) {
      q = $q;
      patientInsurancePaymentFactory = $injector.get(
        'PatientInsurancePaymentFactory'
      );
    }));

    describe('getClaimServices method -> ', function () {
      it('should return services array related to claim we passed ->', function () {
        var result =
          patientInsurancePaymentFactory.getClaimServices(claimsMock);
        expect(result).toEqual(claimsServicesMock);
      });
    });

    describe('getClaimServices method -> ', function () {
      it('should return empty array if there are no claims  ->', function () {
        var result = patientInsurancePaymentFactory.getClaimServices([]);
        expect(result).toEqual([]);
      });
    });

    describe('distributeAmountToServices  ->', function () {
      it('should be call  CreditDistrbution Method to distrubute amount to respective service transactions', function () {
        var claims = [
          {
            ServiceTransactionToClaimPaymentDtos: [
              {
                InsuranceEstimate: 1,
                PaidInsuranceEstimate: 5,
                Charges: 10,
                Amount: 50,
              },
              {
                InsuranceEstimate: 1,
                PaidInsuranceEstimate: 5,
                Charges: 10,
                Amount: 4,
              },
            ],
          },
        ];
        patientInsurancePaymentFactory.distributeAmountToServices(50, claims);
        expect(
          patientServices.ClaimServiceTransactions.creditdistribution
        ).toHaveBeenCalled();
      });
    });

    describe('distributeCreditToServices  ->', function () {
      it('should be call  CreditDistrbution Method to distrubute amount to respective service transactions', function () {
        var claims = [
          {
            ServiceTransactionToClaimPaymentDtos: [
              {
                InsuranceEstimate: 1,
                PaidInsuranceEstimate: 5,
                Charges: 10,
                Amount: 50,
              },
              {
                InsuranceEstimate: 1,
                PaidInsuranceEstimate: 5,
                Charges: 10,
                Amount: 4,
              },
            ],
          },
        ];
        patientInsurancePaymentFactory.distributeCreditToServices(50, claims);
        expect(
          patientServices.ClaimServiceTransactions.creditdistributions
        ).toHaveBeenCalled();
      });
    });

    describe('applyInsurancePayment ->', function () {
      it('should have called locationServices.get', function () {
        patientInsurancePaymentFactory.applyInsurancePayment([]);
      });
    });

    describe('applyInsurancePayments ->', function () {
      var paymentType;
      var bulkPaymentInfo;
      var claims;
      var successCallback = {};
      var failureCallback = {};
      beforeEach(function () {
        paymentType = {
          Description: 'CreditCard',
          PaymentTypeCategory: 2,
          CurrencyTypeId: 3,
          PaymentTypeId: '123456789',
        };
        bulkPaymentInfo = {
          Amount: 6,
          BulkCreditTransactionType: 1,
          Carrier: null,
          DateEntered: new Date(),
          EraId: '',
          Locations: [2, 3],
          Note: null,
          PayerId: '44424',
          PaymentGatewayTransactionId: 2889,
          PaymentTypePromptValue: null,
        };
        claims = [{ CarrierId: '12345', Amount: 6 }];
      });

      it('should call patientServices.CreditTransactions.applyBulkInsurancePayments with PayerId if passed to method', function () {
        patientInsurancePaymentFactory.applyInsurancePayments(
          bulkPaymentInfo,
          claims,
          paymentType,
          paymentType,
          successCallback,
          failureCallback
        );
        expect(
          patientServices.CreditTransactions.applyBulkInsurancePayments.calls.first()
            .args[0]
        ).toEqual({ payerId: bulkPaymentInfo.PayerId });
      });

      it('should call patientServices.CreditTransactions.applyBulkInsurancePayments with null PayerId if no param passed to method', function () {
        bulkPaymentInfo.PayerId = undefined;
        patientInsurancePaymentFactory.applyInsurancePayments(
          bulkPaymentInfo,
          claims,
          paymentType,
          paymentType,
          successCallback,
          failureCallback
        );
        expect(
          patientServices.CreditTransactions.applyBulkInsurancePayments.calls.first()
            .args[0]
        ).toEqual({ payerId: null });
      });
    });

    describe('formatClaimDisplayDate ->', function () {
      it('should return date range when min and max services differ', function () {
        var claim = {
          MaxServiceDate: '2017-12-31T00:00:00',
          MinServiceDate: '2017-12-19T00:00:00',
        };
        expect(
          patientInsurancePaymentFactory.formatClaimDisplayDate(claim)
        ).toEqual('12/19/2017-12/31/2017');
      });
      it('should return single date min and max services are equal', function () {
        var claim = {
          MaxServiceDate: '2017-12-19T00:00:00',
          MinServiceDate: '2017-12-19T00:00:00',
        };
        expect(
          patientInsurancePaymentFactory.formatClaimDisplayDate(claim)
        ).toEqual('12/19/2017');
      });
    });

    describe('authPatientInsurancePaymentViewAccess ->', function () {
      it('', function () {
        var result = patientInsurancePaymentFactory.access();
        expect(result.InsurancePaymentView).toEqual(true);
      });
    });


    describe('completeInsurancePaymentTransaction ->', function () {
      var paymentType;
      var bulkPaymentInfo;
      var claims;
      var transactionInformation;
      var successCallback = {};
      var failureCallback = {};

      beforeEach(function () {
        paymentType = {
          Description: 'CreditCard',
          PaymentTypeCategory: 2,
          CurrencyTypeId: 3,
          PaymentTypeId: '123456789',
        };
        bulkPaymentInfo = {
          Amount: 6,
          BulkCreditTransactionType: 1,
          Carrier: null,
          DateEntered: new Date(),
          EraId: '',
          Locations: [2, 3],
          Note: null,
          PayerId: '44424',
          PaymentGatewayTransactionId: 2889,
          PaymentTypePromptValue: null,
        };

        transactionInformation={
          PaymentGatewayTransactionId:'4973'
        }
        bulkPaymentInfo = {
          Amount: 6,
          BulkCreditTransactionType: 1,
          Carrier: null,
          DateEntered: new Date(),
          EraId: '',
          Locations: [2, 3],
          Note: null,
          PayerId: '44424',
          PaymentGatewayTransactionId: 2889,
          PaymentTypePromptValue: null,
        };
        claims = [{ CarrierId: '12345', Amount: 6 }];
       
      });

      it('should call patientServices.CreditTransactions.applyBulkInsurancePayments with PayerId if passed to method', function () {
        patientInsurancePaymentFactory.completeInsurancePaymentTransaction(
          transactionInformation,
          bulkPaymentInfo,
          claims,
          successCallback,
          failureCallback
        );
        expect(paymentGatewayService.completeCreditTransaction).toHaveBeenCalled();
      });

    });

  });

  describe('PatientBenefitPlansFactory ->', function () {
    var toastrFactory, patientBenefitPlansFactory, usersFactory;
    var patientServices;

    //region factory dependencies and mocks
    var listOfPatientPlans = [
      {
        BenefitPlanId: 111,
        Priority: 1,
        $patientBenefitPlan: { Priority: 1, PatientBenefitPlanId: 1111 },
      },
      {
        BenefitPlanId: 111,
        Priority: 2,
        $patientBenefitPlan: { Priority: 2, PatientBenefitPlanId: 1112 },
      },
      {
        BenefitPlanId: 113,
        Priority: 3,
        $patientBenefitPlan: { Priority: 3, PatientBenefitPlanId: 1113 },
      },
      {
        BenefitPlanId: 114,
        Priority: 4,
        $patientBenefitPlan: { Priority: 4, PatientBenefitPlanId: 1114 },
      },
    ];

    beforeEach(module('Soar.Common'));
    beforeEach(module('common.factories'));
    beforeEach(
      module('Soar.Patient', function ($provide) {
        patientServices = {
          InsuranceInfo: {
            get: jasmine.createSpy().and.returnValue(listOfPatientPlans),
          },
          PatientBenefitPlan: {
            get: jasmine.createSpy().and.returnValue(listOfPatientPlans),
            create: jasmine.createSpy().and.returnValue({}),
            update: jasmine.createSpy().and.returnValue({}),
            delete: jasmine.createSpy().and.returnValue({}),
          },
        };
        $provide.value('PatientServices', patientServices);

        toastrFactory = {};
        toastrFactory.error = jasmine.createSpy();
        toastrFactory.success = jasmine.createSpy();
        $provide.value('toastrFactory', toastrFactory);

        usersFactory = {
          Users: jasmine.createSpy('usersFactory.Users'),
        };
        $provide.value('UsersFactory', usersFactory);
      })
    );

    // inject the factory
    beforeEach(inject(function ($injector) {
      patientBenefitPlansFactory = $injector.get('PatientBenefitPlansFactory');
    }));

    //#endregion

    describe('resetPriority method -> ', function () {
      // old priority of plan that moved = old priority
      // new priority of plan that moved = new priority

      it('if new priority is higher than plan that was at new index position it should add one to priorities of plans where priority is between old and new priority', function () {
        var oldIndex = 2;
        var newIndex = 0;
        var plans = angular.copy(listOfPatientPlans);

        for (var i = 0; i < plans.length; i++) {
          if (plans[i].$patientBenefitPlan.PatientBenefitPlanId === 1111) {
            expect(plans[i].Priority).toEqual(1);
          }
          if (plans[i].$patientBenefitPlan.PatientBenefitPlanId === 1112) {
            expect(plans[i].Priority).toEqual(2);
          }
        }

        var listWithNewPriorities = patientBenefitPlansFactory.ResetPriority(
          plans,
          oldIndex,
          newIndex
        );

        for (i = 0; i < listWithNewPriorities.length; i++) {
          if (
            listWithNewPriorities[i].$patientBenefitPlan
              .PatientBenefitPlanId === 1111
          ) {
            expect(listWithNewPriorities[i].Priority).toEqual(2);
          }
          if (
            listWithNewPriorities[i].$patientBenefitPlan
              .PatientBenefitPlanId === 1112
          ) {
            expect(listWithNewPriorities[i].Priority).toEqual(3);
          }
        }
      });

      it('if new priority is higher than plan that was at new index position it should reset plan priority of plan that moved to priority of that plan', function () {
        var oldIndex = 2;
        var newIndex = 0;
        var plans = angular.copy(listOfPatientPlans);
        expect(plans[oldIndex].BenefitPlanId).toBe(113);
        expect(plans[oldIndex].Priority).toBe(3);
        var listWithNewPriorities = patientBenefitPlansFactory.ResetPriority(
          plans,
          oldIndex,
          newIndex
        );

        for (var i = 0; i < listWithNewPriorities.length; i++) {
          if (
            listWithNewPriorities[i].$patientBenefitPlan
              .PatientBenefitPlanId === 1113
          ) {
            expect(listWithNewPriorities[i].Priority).toEqual(1);
          }
        }
      });

      it('if new priority is higher than plan that was at new index position it should not reset priority of plans whose priority was higher old priority', function () {
        var oldIndex = 2;
        var newIndex = 0;
        var plans = angular.copy(listOfPatientPlans);

        for (var i = 0; i < plans.length; i++) {
          if (plans[i].BenefitPlanId === 114) {
            expect(plans[i].Priority).toEqual(4);
          }
        }

        var listWithNewPriorities = patientBenefitPlansFactory.ResetPriority(
          plans,
          oldIndex,
          newIndex
        );

        for (i = 0; i < listWithNewPriorities.length; i++) {
          if (
            listWithNewPriorities[i].$patientBenefitPlan
              .PatientBenefitPlanId === 1114
          ) {
            expect(listWithNewPriorities[i].Priority).toEqual(4);
          }
        }
      });

      it('if new priority is lower than plan that was at new index position it should subtract one from Priority of plans where priority is between old and new priority', function () {
        var oldIndex = 1;
        var newIndex = 3;
        var plans = angular.copy(listOfPatientPlans);

        expect(plans[oldIndex].Priority).toEqual(2);
        expect(plans[oldIndex].BenefitPlanId).toEqual(111);
        expect(plans[newIndex].Priority).toEqual(4);
        expect(plans[newIndex].BenefitPlanId).toEqual(114);

        var listWithNewPriorities = patientBenefitPlansFactory.ResetPriority(
          plans,
          oldIndex,
          newIndex
        );

        for (var i = 0; i < listWithNewPriorities.length; i++) {
          if (
            listWithNewPriorities[i].$patientBenefitPlan
              .PatientBenefitPlanId === 1113
          ) {
            expect(listWithNewPriorities[i].Priority).toEqual(2);
          }
          if (
            listWithNewPriorities[i].$patientBenefitPlan
              .PatientBenefitPlanId === 1114
          ) {
            expect(listWithNewPriorities[i].Priority).toEqual(3);
          }
        }
      });

      it('if new priority is lower than plan that was at new index position it should reset plan priority of plan that moved to priority of that plan', function () {
        var oldIndex = 1;
        var newIndex = 3;
        var plans = angular.copy(listOfPatientPlans);

        for (var i = 0; i < plans.length; i++) {
          if (plans[i].$patientBenefitPlan.PatientBenefitPlanId === 1111) {
            expect(plans[i].Priority).toEqual(1);
          }
        }

        var listWithNewPriorities = patientBenefitPlansFactory.ResetPriority(
          plans,
          oldIndex,
          newIndex
        );

        for (i = 0; i < listWithNewPriorities.length; i++) {
          if (
            listWithNewPriorities[i].$patientBenefitPlan
              .PatientBenefitPlanId === 1111
          ) {
            expect(listWithNewPriorities[i].Priority).toEqual(1);
          }
        }
      });

      it('if new priority is less than plan that was at new index position it should not reset priority of plans whose priority was lower than old priority', function () {
        var oldIndex = 1;
        var newIndex = 3;
        var plans = angular.copy(listOfPatientPlans);

        for (let i = 0; i < plans.length; i++) {
          if (plans[i].$patientBenefitPlan.PatientBenefitPlanId === 1111) {
            expect(plans[i].Priority).toEqual(1);
          }
        }

        patientBenefitPlansFactory.ResetPriority(plans, oldIndex, newIndex);

        for (let i = 0; i < plans.length; i++) {
          if (plans[i].$patientBenefitPlan.PatientBenefitPlanId === 1111) {
            expect(plans[i].Priority).toEqual(1);
          }
        }
      });
    });

    describe('setPriorityLabels method -> ', function () {
      it('if should reset labels based on priority', function () {
        var plans = angular.copy(listOfPatientPlans);

        for (let i = 0; i < plans.length; i++) {
          if (plans[i].$patientBenefitPlan.PatientBenefitPlanId === 1111) {
            expect(plans[i].PriorityLabel).toBe(undefined);
          }
          if (plans[i].$patientBenefitPlan.PatientBenefitPlanId === 1114) {
            expect(plans[i].PriorityLabel).toBe(undefined);
          }
        }

        var listWithNewPriorities =
          patientBenefitPlansFactory.SetPriorityLabels(plans);

        for (let i = 0; i < listWithNewPriorities.length; i++) {
          if (listWithNewPriorities[i].Priority === 0) {
            expect(listWithNewPriorities[i].PriorityLabel).toEqual(
              'Primary Dental'
            );
          }
          if (listWithNewPriorities[i].BenefitPlanId === 1) {
            expect(listWithNewPriorities[i].Priority).toEqual(
              'Secondary Dental'
            );
          }
          if (listWithNewPriorities[i].BenefitPlanId === 2) {
            expect(listWithNewPriorities[i].Priority).toEqual(
              '3rd Supplemental Dental'
            );
          }
          if (listWithNewPriorities[i].BenefitPlanId === 3) {
            expect(listWithNewPriorities[i].Priority).toEqual(
              '4th Supplemental Dental'
            );
          }
          if (listWithNewPriorities[i].BenefitPlanId === 4) {
            expect(listWithNewPriorities[i].Priority).toEqual(
              '5th Supplemental Dental'
            );
          }
          if (listWithNewPriorities[i].BenefitPlanId === 5) {
            expect(listWithNewPriorities[i].Priority).toEqual(
              '6th Supplemental Dental'
            );
          }
        }
      });
    });
  });

  //#region PatientInvoiceFactory tests

  describe('PatientInvoiceFactory ->', function () {
    var factory, patientServices, toastrFactory, patSecurityService, $uibModal;
    var invoiceOptionsResult;
    beforeEach(
      module('Soar.Common', function ($provide) {
        toastrFactory = {
          error: jasmine.createSpy('toastrFactory.error'),
        };
        patSecurityService = {
          IsAuthorizedByAbbreviation: jasmine
            .createSpy('patSecurityService.IsAuthorizedByAbbreviation')
            .and.returnValue(true),
          logout: jasmine.createSpy('patSecurityService.logout'),
        };
        $uibModal = {
          open: jasmine.createSpy('$uibModal.open').and.returnValue({
            result: {
              then: function (callback) {
                callback('modalresult');
              },
            },
          }),
        };
        $provide.value('toastrFactory', toastrFactory);
        $provide.value('patSecurityService', patSecurityService);
        $provide.value('$uibModal', $uibModal);
      })
    );
    beforeEach(module('common.factories'));
    beforeEach(
      module('Soar.Patient', function ($provide) {
        invoiceOptionsResult = { Value: {} };
        patientServices = {
          Encounter: {
            invoiceOptions: jasmine
              .createSpy('patientServices.Encounter.invoiceOptions')
              .and.returnValue({
                $promise: {
                  then: function (callback) {
                    callback(invoiceOptionsResult);
                  },
                },
              }),
            createInvoices: jasmine
              .createSpy('patientServices.Encounter.createInvoices')
              .and.returnValue({
                $promise: {
                  then: function (callback) {
                    callback('createInvoiceResult');
                  },
                },
              }),
            createCurrentInvoice: jasmine
              .createSpy('patientServices.Encounter.createCurrentInvoice')
              .and.returnValue({
                $promise: {
                  then: function (callback) {
                    callback({ Value: {} });
                  },
                },
              }),
            createRefactorInvoices: jasmine
              .createSpy('patientServices.Encounter.createRefactorInvoices')
              .and.returnValue({
                $promise: {
                  then: function (callback) {
                    callback({ Value: {} });
                  },
                },
              }),
          },
          Patients: {
            getWithoutAccount: jasmine
              .createSpy('patientServices.Patients.getWithoutAccount')
              .and.returnValue({
                $promise: {
                  then: function (callback) {
                    callback({ Value: {} });
                  },
                },
              }),
          },
        };
        $provide.value('PatientServices', patientServices);
      })
    );

    // inject the factory
    beforeEach(inject(function ($injector) {
      var patientInvoiceFactory = $injector.get('PatientInvoiceFactory');
      factory = patientInvoiceFactory;
    }));

    describe('InvoiceOptions -> ', function () {
      it('should retrieve invoice options from server', function () {
        var res = factory.InvoiceOptions(1);
        expect(patientServices.Encounter.invoiceOptions).toHaveBeenCalledWith({
          encounterId: 1,
        });
        expect(res.$$state.value).toEqual(invoiceOptionsResult);
      });
    });

    describe('LoadInvoiceOptions method-> ', function () {
      it('should throw toastr when not authorized', function () {
        patSecurityService.IsAuthorizedByAbbreviation = jasmine
          .createSpy('patSecurityService.IsAuthorizedByAbbreviation')
          .and.returnValue(false);
        var encounterId = '111';
        var res = factory.LoadInvoiceOptions(encounterId, 'Bob Hope');
        expect(res).toBeUndefined();
        expect(patientServices.Encounter.invoiceOptions).not.toHaveBeenCalled();
      });
      it('should call patientServices.Encounter.invoiceOptions', function () {
        var encounterId = '111';
        var res = factory.LoadInvoiceOptions(encounterId, 'Bob Hope');
        expect(patientServices.Encounter.invoiceOptions).toHaveBeenCalledWith({
          encounterId: encounterId,
        });
        expect(res.$$state.value.PatientDetails.Name).toBe('Bob Hope');
        expect(res.$$state.value.InvoiceOptions.EncounterIds[0]).toBe('111');
        expect(res.$$state.value.NoInvoceEncounter).toBe(true);
      });
    });

    describe('CreateInvoices method -> ', function () {
      it('should call patientServices.Encounter.invoiceOptions', function () {
        var accountId = '111';
        var options = { EncounterIds: ['111', '222'] };
        var res = factory.CreateInvoices(accountId, options);
        expect(patientServices.Encounter.createInvoices).toHaveBeenCalled();
        expect(res.$$state.value).toEqual('createInvoiceResult');
      });
    });

    describe('GetPatientInfo -> ', function () {
      it('should call patientServices.Patients.getWithoutAccount', function () {
        var res = factory.GetPatientInfo(2);
        expect(patientServices.Patients.getWithoutAccount).toHaveBeenCalled();
        expect(res.$$state.value).toEqual({});
      });
    });

    describe('CreateCurrentInvoice method -> ', function () {
      it('should call $uibModal.open', function () {
        var encounter = [];
        var patientName = 'Patient Name';
        var patientId = '111';
        factory.CreateCurrentInvoice(encounter, patientName, patientId);
        expect($uibModal.open).toHaveBeenCalled();
      });
    });

    describe('ConfirmInvoiceOptions method ->', function () {
      it('should call modal, then call to create invoices with result', function () {
        factory.ConfirmInvoiceOptions(null, 1, true);
        expect($uibModal.open).toHaveBeenCalled();
        expect(patientServices.Encounter.createInvoices).toHaveBeenCalled();
      });
    });
  });

  //#endregion

  describe('PersonFactory ->', function () {
    var factory, personServices;
    beforeEach(module('Soar.Patient', function ($provide) {
      personServices = {};
      $provide.value('PersonServices', personServices);
    }))
    beforeEach(inject(function ($injector) {
      factory = $injector.get('PersonFactory');
    }));

    it('should exist', function () {
      expect(factory).toBeTruthy();
    });

    describe('SetPersonActiveStatus function ->', function () {
      beforeEach(function () {
        personServices.Persons = {
          setActiveStatus: jasmine
            .createSpy()
            .and.returnValue({ $promise: { then: angular.noop } }),
        };
      });

      it('should call personServices.Persons.setActiveStatus', function () {
        var personId = 'personId';
        var isActive = 'isActive';
        var unschedule = 'unschedule';

        factory.SetPersonActiveStatus(personId, isActive, unschedule);

        expect(personServices.Persons.setActiveStatus).toHaveBeenCalledWith(
          { Id: personId, unscheduleOnly: unschedule },
          isActive
        );
      });
    });
  });

  describe('PatientServicesFactory ->', function () {
    var patientServicesFactory;
    beforeEach(inject(function ($injector) {
      patientServicesFactory = $injector.get('PatientServicesFactory');
    }));

    describe(' syncAppointmentIdOnService method-> ', function () {
      var serviceTransactions = [];
      beforeEach(function () {
        serviceTransactions = [
          {
            ServiceTransactionId: 1,
            AppointmentId: '1234',
            EncounterId: '6789',
            ObjectState: 'Update',
            ServiceTransactionStatusId: 5,
          },
          {
            ServiceTransactionId: 2,
            AppointmentId: '1236',
            EncounterId: '6789',
            ObjectState: 'Delete',
            ServiceTransactionStatusId: 5,
          },
          {
            ServiceTransactionId: 3,
            AppointmentId: '1237',
            EncounterId: '6789',
            ObjectState: 'Add',
            ServiceTransactionStatusId: 1,
          },
          {
            ServiceTransactionId: 4,
            AppointmentId: '1238',
            EncounterId: '6789',
            ObjectState: 'None',
            ServiceTransactionStatusId: 5,
          },
          {
            ServiceTransactionId: 5,
            AppointmentId: '1239',
            EncounterId: '6789',
            ObjectState: 'Add',
            ServiceTransactionStatusId: 5,
          },
          {
            ServiceTransactionId: 6,
            AppointmentId: null,
            EncounterId: null,
            ObjectState: 'None',
            ServiceTransactionStatusId: 5,
          },
        ];
      });
      it('should set all AppointmentIds to match service with AppointmentId and EncounterId to sync appointment and encounter if ObjectState is Update Or Add', function () {
        patientServicesFactory.syncAppointmentIdOnService(serviceTransactions);
        expect(serviceTransactions[0].AppointmentId).toEqual('1234');
        expect(serviceTransactions[2].AppointmentId).toEqual('1234');
        expect(serviceTransactions[3].AppointmentId).toEqual('1234');
        expect(serviceTransactions[4].AppointmentId).toEqual('1234');
        expect(serviceTransactions[5].AppointmentId).toEqual('1234');
      });
      it('should set all AppointmentIds to match service with AppointmentId and has no EncounterId', function () {
        serviceTransactions = [
          {
            ServiceTransactionId: 1,
            AppointmentId: '1234',
            EncounterId: null,
            ObjectState: 'Update',
            ServiceTransactionStatusId: 5,
          },
          {
            ServiceTransactionId: 2,
            AppointmentId: null,
            EncounterId: null,
            ObjectState: 'None',
            ServiceTransactionStatusId: 5,
          },
        ];
        patientServicesFactory.syncAppointmentIdOnService(serviceTransactions);
        expect(serviceTransactions[0].AppointmentId).toEqual('1234');
        expect(serviceTransactions[1].AppointmentId).toEqual('1234');
      });

      it('should set all AppointmentIds to match service with AppointmentId and EncounterId and change ObjectState to Update to sync appointment and encounter if ObjectState is None', function () {
        patientServicesFactory.syncAppointmentIdOnService(serviceTransactions);
        expect(serviceTransactions[3].AppointmentId).toEqual('1234');
        expect(serviceTransactions[3].ObjectState).toEqual('Update');
      });
      it('should set all AppointmentId and EncounterId to null if ObjectState is Delete and change ObjectState to Update to sync appointment and encounter if ObjectState is Delete', function () {
        patientServicesFactory.syncAppointmentIdOnService(serviceTransactions);
        expect(serviceTransactions[1].AppointmentId).toEqual(null);
        expect(serviceTransactions[1].EncounterId).toEqual(null);
        expect(serviceTransactions[1].ServiceTransactionStatusId).toEqual(1);
        expect(serviceTransactions[1].ObjectState).toEqual('Update');
      });
    });
  });
});
