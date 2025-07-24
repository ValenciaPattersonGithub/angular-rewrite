describe('PatientNotesLandingController ->', function () {
  //#region mocks

  var toastrFactory, $uibModal, scope, ctrl, localize, listHelper, tabLauncher;
  var patientServices, staticData;
  var modalFactory, patientNotesFactory;

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

  var newNote = {
    NoteId: null,
    PatientId: 'a6993a42-6fc9-45c6-ad89-007db488a355',
    Note: '',
    Id: null,
    ToothNumbers: null,
    StatusTypeId: 1,
    NoteTypeId: 3,
    Date: new Date(),
  };

  var mockNotes = [
    {
      NoteId: '135',
      PatientId: 'a6993a42-6fc9-45c6-ad89-007db488a355',
      CreatedDate: '2016-12-01',
      $$OriginalCreatedDate: '2016-12-01',
      DateModified: new Date(),
      UserId: 'placeholder',
      Note: '<span style="color:#093;font-weight:bold;font-style:italic;text-decoration:underline;">Beetlejuice, Beetlejuice, Beetlejuice</span>',
      Id: mockNoteTypes[1].Id,
      ToothNumbers: '2,3,4',
      IsActive: false,
      StatusTypeId: mockStatusTypes[0].Id,
    },
    {
      NoteId: '134',
      PatientId: 'a6993a42-6fc9-45c6-ad89-007db488a355',
      CreatedDate: '2016-06-01',
      $$OriginalCreatedDate: '2016-06-01',
      DateModified: new Date(),
      UserId: 'placeholder',
      Note: '<span style="color:#093;font-weight:bold;font-style:italic;text-decoration:underline;">Lorem ipsum dolor sit amet, consectetur adipiscing elit. Quisque pharetra facilisis mollis. Cras varius mi et sapien suscipit semper. Phasellus nec nulla ornare, molestie lorem eu, dictum tortor. Mauris et feugiat lacus. Proin enim eros, placerat ut ex vel, posuere aliquam ex. Pellentesque rhoncus, neque at sagittis porta, diam dui scelerisque ligula, sit amet tincidunt massa libero ac metus. Suspendisse bibendum, turpis a sollicitudin auctor, purus risus finibus nisi, eu gravida tellus nibh nec felis. Sed et odio pretium, commodo leo ac, dignissim turpis. Pellentesque accumsan faucibus diam a porta. Vivamus gravida vel sem ut varius. Nam venenatis arcu quis iaculis lobortis. Donec vitae malesuada purus. In pellentesque interdum imperdiet. Vivamus efficitur risus eu ipsum finibus, sit amet porttitor massa iaculis.</span>',
      Id: mockNoteTypes[1].Id,
      ToothNumbers: '2,3,4',
      IsActive: false,
      StatusTypeId: mockStatusTypes[0].Id,
    },
    {
      NoteId: '133',
      PatientId: 'a6993a42-6fc9-45c6-ad89-007db488a355',
      CreatedDate: '2016-01-01',
      $$OriginalCreatedDate: '2016-01-01',
      DateModified: new Date(),
      UserId: 'placeholder',
      Note: '<span style="color:#093;">Cras varius culis.</span>',
      Id: null,
      ToothNumbers: null,
      IsActive: false,
      StatusTypeId: mockStatusTypes[0].Id,
    },
  ];

  var mockNotesResponse = {
    Value: mockNotes,
  };

  var filteredNotes = angular.copy(mockNotes);

  //#endregion

  //#region before each

  beforeEach(module('Soar.Common'));
  beforeEach(module('common.factories'));
  beforeEach(module('Soar.Patient'));

  beforeEach(
    module('Soar.Patient', function ($provide) {
      tabLauncher = {
        launchNewTab: jasmine.createSpy(),
      };

      //mock staticData service
      staticData = {
        NoteTypes: jasmine.createSpy().and.returnValue({
          then: jasmine.createSpy().and.returnValue(mockNoteTypes),
        }),
        StatusTypes: jasmine.createSpy().and.returnValue({
          then: jasmine.createSpy().and.returnValue(mockStatusTypes),
        }),
      };

      patientServices = {
        ClinicalNotes: {
          get: jasmine.createSpy().and.returnValue(mockNotesResponse),
        },
      };
      $provide.value('PatientServices', patientServices);

      localize = {
        getLocalizedString: jasmine.createSpy(),
      };
      $provide.value('localize', localize);

      patientNotesFactory = {
        getNotesList: jasmine.createSpy().and.returnValue([{}]),
        SetProviderLabel: jasmine.createSpy().and.returnValue({}),
        validateNote: jasmine.createSpy().and.returnValue({}),
        getNameAndDesignation: jasmine.createSpy().and.returnValue({}),
        setDataChanged: jasmine.createSpy().and.returnValue({}),
        setActiveNote: jasmine.createSpy().and.returnValue({}),
        setActiveNewNote: jasmine.createSpy().and.returnValue({}),
        setEditMode: jasmine.createSpy().and.returnValue({}),
        ActiveNote: jasmine.createSpy().and.returnValue({}),
        load: jasmine.createSpy().and.returnValue({}),
        save: jasmine.createSpy().and.returnValue({
          then: jasmine.createSpy(),
        }),
        getById: jasmine.createSpy().and.returnValue({
          then: jasmine.createSpy().and.returnValue(),
        }),
        get: jasmine.createSpy().and.returnValue({
          then: jasmine.createSpy().and.returnValue(mockNotesResponse),
        }),
        mapClinicalNotesToVm: jasmine.createSpy().and.returnValue({}),
        access: jasmine
          .createSpy()
          .and.returnValue({
            View: true,
            Create: true,
            Delete: true,
            Edit: true,
          }),
        observeNotes: jasmine.createSpy().and.returnValue({}),
      };
      $provide.value('PatientNotesFactory', patientNotesFactory);

      // mock personFactory
      var personFactory = {
        getById: jasmine.createSpy().and.returnValue({
          then: jasmine.createSpy(),
        }),
      };
      $provide.value('PersonFactory', personFactory);

      toastrFactory = {};
      toastrFactory.error = jasmine.createSpy();
      toastrFactory.success = jasmine.createSpy();
      $provide.value('toastrFactory', toastrFactory);
    })
  );

  beforeEach(inject(function ($rootScope, $controller, $injector, _$uibModal_) {
    listHelper = $injector.get('ListHelper');

    $uibModal = _$uibModal_;
    spyOn($uibModal, 'open').and.callThrough();

    scope = $rootScope.$new();
    scope.viewSettings = { expandView: false, activeExpand: 1 };
    ctrl = $controller('PatientNotesLandingController', {
      $scope: scope,
      ModalFactory: modalFactory,
      PatientServices: patientServices,
      ListHelper: listHelper,
      tabLauncher: tabLauncher,
      StaticData: staticData,
      PatientNotesFactory: patientNotesFactory,
    });

    scope.onChange = jasmine.createSpy('onChange');
    scope.onSave = jasmine.createSpy('onSave');
  }));

  //#endregion

  describe('properties -> ', function () {
    describe('expandNote function -> ', function () {
      it('should set scope properties', function () {
        scope.viewSettings.expandView = true;
        scope.expandNote();
        expect(scope.viewSettings.expandView).toBe(false);
      });
    });

    describe('patientNotesFactory.EditMode -> ', function () {
      it('should set noteEditMode', function () {
        scope.noteEditMode = true;
        patientNotesFactory.EditMode = true;
        scope.$digest();
        patientNotesFactory.EditMode = false;
        scope.$digest();
        expect(scope.noteEditMode).toBe(false);
      });
    });

    describe('patientNotesFactory.EditMode -> ', function () {
      it('should set noteEditMode', function () {
        patientNotesFactory.EditMode = true;
        scope.$digest();
        expect(scope.noteEditMode).toBe(true);

        patientNotesFactory.EditMode = false;
        scope.$digest();
        expect(scope.noteEditMode).toBe(false);
      });
    });

    describe('updateClinicalNotes method -> ', function () {
      it('should load the clinicalNotes list when list changes', function () {
        var updateNotesList = angular.copy(mockNotes);
        ctrl.clinicalNotes = mockNotes;
        expect(ctrl.clinicalNotes.length).toBe(3);

        updateNotesList.push(newNote);
        ctrl.updateClinicalNotes(updateNotesList);
        expect(ctrl.clinicalNotes.length).toBe(4);
      });

      it('should call ctrl.setProviderLabel', function () {
        spyOn(ctrl, 'setProviderLabel');
        var updateNotesList = angular.copy(mockNotes);
        ctrl.clinicalNotes = mockNotes;
        updateNotesList.push(newNote);
        ctrl.updateClinicalNotes(updateNotesList);
        expect(ctrl.setProviderLabel).toHaveBeenCalledWith(updateNotesList);
      });

      it('should call addDisplayNames', function () {
        spyOn(ctrl, 'addDisplayNames');
        spyOn(ctrl, 'setProviderLabel');
        spyOn(ctrl, 'loadRecentNotes');
        var updateNotesList = angular.copy(mockNotes);
        ctrl.clinicalNotes = mockNotes;
        updateNotesList.push(newNote);
        ctrl.updateClinicalNotes(updateNotesList);
        expect(ctrl.addDisplayNames).toHaveBeenCalledWith(ctrl.clinicalNotes);
        expect(ctrl.loadRecentNotes).toHaveBeenCalled();
        expect(patientNotesFactory.mapClinicalNotesToVm).toHaveBeenCalledWith(
          ctrl.recentNotes
        );
      });
    });

    describe('note history -> ', function () {
      it('It arranges note templates and history ', function () {
        var mockNotes = [
          { NoteId: 1, NoteTitle: 'A' },
          { NoteId: 1, NoteTitle: 'A1' },
          { NoteId: 1, NoteTitle: 'A2' },
          { NoteId: 1, NoteTitle: 'A3' },
          { NoteId: 2, NoteTitle: 'B' },
          { NoteId: 2, NoteTitle: 'B1' },
          { NoteId: 3, NoteTitle: 'C' },
        ];

        ctrl.clinicalNotes = mockNotes;
      });
    });

    var note;
    describe('noteFilter method -> ', function () {
      beforeEach(function () {
        note = angular.copy(mockNotes[0]);
        note.CreatedDate = '2017-03-01';
        note.$$OriginalCreatedDate = '2017-03-01';
        note.StatusTypeId = 1;
        scope.filterObject.StartDate = '2017-01-01';
        scope.filterObject.EndDate = '2017-05-01';
        scope.dateRangeError = false;
      });

      it('returns true if note is between filter start date and filter end date and status id is not 3', function () {
        expect(scope.noteFilter(note)).toEqual(true);
      });

      it('returns false if note is not between filter start date and filter end date and status id is not 3', function () {
        note.$$OriginalCreatedDate = '2017-06-01';
        expect(scope.noteFilter(note)).toEqual(false);
      });

      it('returns true if note status id is not 3 and filter start date is null or filter end date is null', function () {
        scope.filterObject.StartDate = null;
        expect(scope.noteFilter(note)).toEqual(true);
      });

      it('returns false if note status id is 3', function () {
        note.StatusTypeId = 3;
        expect(scope.noteFilter(note)).toEqual(false);
      });

      it('sets dateRangeError to true if filter start date more than filter end date', function () {
        scope.filterObject.StartDate = '2017-06-01';
        scope.filterObject.EndDate = '2017-05-01';
        expect(scope.noteFilter(note)).toEqual(true);
        expect(scope.dateRangeError).toEqual(true);
      });

      it('sets dateRangeError to false if filter start date less than filter end date', function () {
        expect(scope.noteFilter(note)).toEqual(true);
        expect(scope.dateRangeError).toEqual(false);
      });

      it('returns true if other filters are true and note.StatusTypeId not equal statusToFilter ', function () {
        note.StatusTypeId = 3;
        ctrl.statusToFilter = null;
        expect(scope.noteFilter(note)).toEqual(true);
      });

      it('returns false if other filters are true and note.StatusTypeId equal statusToFilter ', function () {
        note.StatusTypeId = 3;
        ctrl.statusToFilter = 3;
        expect(scope.noteFilter(note)).toEqual(false);
      });

      it('returns true if no other filters and note.StatusTypeId not equal statusToFilter ', function () {
        note.StatusTypeId = 3;
        ctrl.statusToFilter = null;
        expect(scope.noteFilter(note)).toEqual(true);
      });

      it('returns false if no other filters and note.StatusTypeId equal statusToFilter ', function () {
        note.StatusTypeId = 3;
        ctrl.statusToFilter = 3;
        expect(scope.noteFilter(note)).toEqual(false);
      });
    });

    //#region printNotes

    describe('printNotes method -> ', function () {
      beforeEach(function () {
        scope.personId = 'a6993a42-6fc9-45c6-ad89-007db488a355';
        ctrl.clinicalNotes = mockNotes;
      });

      it('should create storage item and call localStorage.setItem', function () {
        scope.filterObject.StartDate = '2017-01-01';
        scope.filterObject.EndDate = '2017-05-01';
        scope.printNotes(filteredNotes);

        var storageItem = {
          DateFrom: scope.filterObject.StartDate,
          DateTo: scope.filterObject.EndDate,
          Notes: ctrl.clinicalNotesDateFilterd,
        };
        var temp = JSON.stringify(storageItem);

        expect(localStorage.setItem).toHaveBeenCalledWith(
          'clinicalNotes_' + ctrl.storageId,
          temp
        );
      });

      it('should create storage item with first and last dates if no filter and call localStorage.setItem', function () {
        scope.filterObject.StartDate = null;
        scope.filterObject.EndDate = null;
        scope.printNotes(filteredNotes);

        var storageItem = {
          DateFrom: '2016-01-01',
          DateTo: '2016-12-01',
          Notes: filteredNotes,
        };
        var temp = JSON.stringify(storageItem);
        expect(localStorage.setItem).toHaveBeenCalledWith(
          'clinicalNotes_' + ctrl.storageId,
          temp
        );
      });

      it('should create storage item with filter dates if filter and call localStorage.setItem', function () {
        scope.filterObject.StartDate = '2017-01-01';
        scope.filterObject.EndDate = '2017-05-01';

        scope.printNotes(filteredNotes);

        var storageItem = {
          DateFrom: scope.filterObject.StartDate,
          DateTo: scope.filterObject.EndDate,
          Notes: ctrl.clinicalNotesDateFilterd,
        };
        var temp = JSON.stringify(storageItem);
        expect(localStorage.setItem).toHaveBeenCalledWith(
          'clinicalNotes_' + ctrl.storageId,
          temp
        );
        expect(tabLauncher.launchNewTab).toHaveBeenCalledWith(
          '#/Patient/' +
            scope.personId +
            '/Clinical/PrintNotes/' +
            ctrl.storageId
        );
      });

      it('should call tabLauncher', function () {
        scope.filterObject.StartDate = '2017-01-01';
        scope.filterObject.EndDate = '2017-05-01';

        scope.printNotes(filteredNotes);
        expect(tabLauncher.launchNewTab).toHaveBeenCalledWith(
          '#/Patient/' +
            scope.personId +
            '/Clinical/PrintNotes/' +
            ctrl.storageId
        );
      });
    });

    describe('toggleDeleted method -> ', function () {
      it('should toggle showDeleted', function () {
        ctrl.showDeleted = true;
        scope.toggleDeleted();
        expect(ctrl.showDeleted).toEqual(false);
        scope.toggleDeleted();
        expect(ctrl.showDeleted).toEqual(true);
      });

      it('should set toggleLabel based on showDeleted ', function () {
        ctrl.showDeleted = true;
        scope.toggleDeleted();
        expect(localize.getLocalizedString).toHaveBeenCalledWith('Show {0}', [
          'Deleted',
        ]);

        scope.toggleDeleted();
        expect(localize.getLocalizedString).toHaveBeenCalledWith('Hide {0}', [
          'Deleted',
        ]);
      });

      it('should reset statusToFilter', function () {
        ctrl.statusToFilter = 3;
        scope.toggleDeleted();
        expect(ctrl.statusToFilter).toEqual(null);
      });
    });

    describe('setProviderLabel method -> ', function () {
      it('should call patientNotesFactory.SetProviderLabel with each note in clinicalNotes', function () {
        var clinicalNotes = angular.copy(mockNotes);
        ctrl.setProviderLabel(clinicalNotes);
        angular.forEach(clinicalNotes, function (note) {
          expect(patientNotesFactory.SetProviderLabel).toHaveBeenCalledWith(
            note
          );
          expect(note.$$providerLabel).not.toEqual(null);
        });
      });

      it('should setProviderLabel withnote.$$providerLabel on each note in clinicalNotes', function () {
        var clinicalNotes = angular.copy(mockNotes);
        angular.forEach(clinicalNotes, function (note) {
          expect(note.$$providerLabel).toBeUndefined();
        });
        ctrl.setProviderLabel(clinicalNotes);
        angular.forEach(clinicalNotes, function (note) {
          expect(patientNotesFactory.SetProviderLabel).toHaveBeenCalledWith(
            note
          );
          expect(note.$$providerLabel).not.toBeUndefined();
        });
      });
    });

    describe('watch data -->', function () {
      it('should call ctrl.loadNotes if clinicalDataLoaded is false and notes not null ', function () {
        scope.clinicalDataLoaded = false;
        spyOn(ctrl, 'loadNotes');
        scope.data = null;
        scope.$apply();
        scope.data = { Notes: [] };
        scope.$apply();
        expect(ctrl.loadNotes).toHaveBeenCalled();
      });

      it('should not call ctrl.loadNotes if clinicalDataLoaded is true or notes is null ', function () {
        scope.clinicalDataLoaded = false;
        spyOn(ctrl, 'loadNotes');
        scope.data = null;
        scope.$apply();
        scope.data = null;
        scope.$apply();
        expect(ctrl.loadNotes).not.toHaveBeenCalled();
      });

      it('should not call ctrl.loadNotes if clinicalDataLoaded is true ', function () {
        scope.clinicalDataLoaded = true;
        spyOn(ctrl, 'loadNotes');
        scope.data = null;
        scope.$apply();
        scope.data = { Notes: [] };
        scope.$apply();
        expect(ctrl.loadNotes).not.toHaveBeenCalled();
      });
    });

    describe('loadNotes method -> ', function () {
      it('should load clinicalNotes', function () {
        ctrl.loadNotes();
        expect(ctrl.clinicalNotes).toEqual([]);
      });

      it('should call ctrl.setProviderLabel with ctrl.clinicalNotes', function () {
        spyOn(ctrl, 'setProviderLabel');
        scope.data = { Notes: [{}] };
        ctrl.loadNotes();
        expect(ctrl.setProviderLabel).toHaveBeenCalledWith(ctrl.clinicalNotes);
      });

      it('should call ctrl.setProviderLabel with ctrl.clinicalNotes', function () {
        spyOn(ctrl, 'setProviderLabel');
        spyOn(ctrl, 'addDisplayNames');
        scope.data = { Notes: [{}] };
        ctrl.loadNotes();
        expect(patientNotesFactory.load).toHaveBeenCalledWith(
          ctrl.clinicalNotes
        );
      });
    });
  });
});
