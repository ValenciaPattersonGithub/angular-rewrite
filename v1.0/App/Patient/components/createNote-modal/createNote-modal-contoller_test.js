describe('CreateNoteModalController ->', function () {
  var scope,
    ctrl,
    mockAccountNoteFactory,
    mockLocalize,
    mockReferenceDataService,
    mockToastrFactory,
    filter,
    modalFactory;

  beforeEach(module('common.factories'));
  beforeEach(module('Soar.Patient'));
  beforeEach(inject(function ($rootScope, $controller, $filter) {
    filter = $filter;

    mockToastrFactory = {
      success: jasmine.createSpy('toastrFactory.success'),
      error: jasmine.createSpy('toastrFactory.error'),
    };

    mockReferenceDataService = {
      getData: jasmine
        .createSpy('mockReferenceDataService.get')
        .and.returnValue([
          { LocationId: 1, Timezone: 'Central Standard Time' },
          { LocationId: 2, Timezone: 'Central Standard Time' },
          { LocationId: 3, Timezone: 'Central Standard Time' },
          { LocationId: 4, Timezone: 'Central Standard Time' },
        ]),
      entityNames: {
        locations: 'locations',
      },
    };

    mockLocalize = {
      getLocalizedString: jasmine
        .createSpy('localize.getLocalizedString')
        .and.callFake(function (text) {
          return text;
        }),
    };

    mockAccountNoteFactory = {
      editAccountNote: jasmine.createSpy(),
      createAccountNote: jasmine.createSpy(),
    };

    modalFactory = {
      CancelModal: jasmine
        .createSpy('modalFactory.CancelModal')
        .and.callFake(function () {
          return {
            then: function () {},
          };
        }),
    };

    scope = $rootScope.$new();
    scope.accountMembers = [
      {
        index: 1,
        PatientId: 100,
        LastName: 'Turner',
        FirstName: 'Timmy',
        IsPatient: true,
        IsActive: true,
        IsResponsiblePerson: true,
      },
    ];
    scope.mode = 'add';
    scope.$parent.data = {
      currentPatient: { AccountId: 150 },
      PatientId: 100,
    };
    scope.$parent.selectedPatientId = 100;

    sessionStorage.setItem('userLocation', JSON.stringify({ id: 4 }));

    ctrl = $controller('CreateNoteModalController', {
      $scope: scope,
      toastrFactory: mockToastrFactory,
      localize: mockLocalize,
      referenceDataService: mockReferenceDataService,
      AccountNoteFactory: mockAccountNoteFactory,
      $filter: filter,
      ModalFactory: modalFactory,
    });

    // apply to trigger digest required for resolving $q promises
    scope.$apply();
  }));

  describe('controller initialize ->', function () {
    it('should initialize variables', function () {
      expect(ctrl).not.toBeNull();
      expect(scope.dataPersonAccountNote.AccountId).toBe(null);
      expect(scope.dataPersonAccountNote.PatientId).toBe(100);
      //TODO: Fix this expect statement
      // expect(
      //   moment(scope.dataPersonAccountNote.Date).format('MM/DD/YYYY')
      // ).toBe(moment(new Date()).format('MM/DD/YYYY'));
      expect(scope.dataPersonAccountNote.Description).toBe('');
      expect(scope.dataPersonAccountNote.DataTag).toBe(null);
      expect(scope.dataPersonAccountNote.Type).toBe('Account Note');
      expect(scope.dataPersonAccountNote.LocationId).toBe(4);
      expect(ctrl.patientId).toBe(100);
      expect(scope.isAddmode).toBe(true);
      expect(scope.patientIndex).toBe(0);
      expect(scope.locations.length).toBe(4);
    });
  });

  describe('ctrl.init ->', function () {
    beforeEach(inject(function () {
      scope.personAccountNote = {
        Id: 2,
        AccountId: 500,
        DataTag: 'ADEFF45',
        DateEntered: '2024-01-01T00:00:00.000Z',
        PatientId: 100,
        LocationId: 1,
        Description: 'Test',
      };
    }));
    it('should initialize variables in view mode', function () {
      scope.mode = 'view';
      var spy = spyOn(ctrl, 'initializeDefault');
      ctrl.init();
      expect(scope.dataPersonAccountNote.Id).toBe(2);
      expect(scope.dataPersonAccountNote.AccountId).toBe(500);
      expect(scope.dataPersonAccountNote.PatientId).toBe(100);
      expect(
        moment(scope.dataPersonAccountNote.Date).format('MM/DD/YYYY')
      ).toBe('12/31/2023');
      expect(scope.dataPersonAccountNote.Description).toBe('Test');
      expect(scope.dataPersonAccountNote.DataTag).toBe('ADEFF45');
      expect(scope.dataPersonAccountNote.Type).toBe('Account Note');
      expect(scope.dataPersonAccountNote.LocationId).toBe(1);
      expect(spy).toHaveBeenCalled();
      expect(scope.selectedAccountMember).not.toBe(undefined);
      expect(scope.patientIndex).toBe(0);
      expect(scope.isAddmode).toBe(false);
      expect(ctrl.accountId).toBe(150);
      expect(ctrl.patientId).toBe(100);
    });
    it('should initialize variables in edit mode', function () {
      scope.mode = 'edit';
      var spy = spyOn(ctrl, 'initializeDefault');
      scope.$parent.data = undefined;
      ctrl.init();
      expect(scope.dataPersonAccountNote.Id).toBe(2);
      expect(scope.dataPersonAccountNote.AccountId).toBe(500);
      expect(scope.dataPersonAccountNote.PatientId).toBe(100);
      expect(
        moment(scope.dataPersonAccountNote.Date).format('MM/DD/YYYY')
      ).toBe('12/31/2023');
      expect(scope.dataPersonAccountNote.Description).toBe('Test');
      expect(scope.dataPersonAccountNote.DataTag).toBe('ADEFF45');
      expect(scope.dataPersonAccountNote.Type).toBe('Account Note');
      expect(scope.dataPersonAccountNote.LocationId).toBe(1);
      expect(spy).toHaveBeenCalled();
      expect(scope.selectedAccountMember).not.toBe(undefined);
      expect(scope.patientIndex).toBe(0);
      expect(scope.isAddmode).toBe(true);
      expect(ctrl.accountId).toBe(500);
      expect(ctrl.patientId).toBe(100);
    });
    it('should initialize variables in add mode', function () {
      scope.mode = 'add';
      var spy = spyOn(ctrl, 'initializeDefault');
      scope.window = 'receivables';
      scope.accountMemberLists = [
        {
          index: 1,
          PatientId: 100,
          LastName: 'Turner',
          FirstName: 'Timmy',
          IsPatient: true,
          IsActive: true,
          IsResponsiblePerson: true,
          PreferredName: null,
          MiddleName: 'T',
          SuffixName: null,
        },
        {
          index: 2,
          PatientId: 200,
          LastName: 'Turner2',
          FirstName: 'Timmy2',
          IsPatient: false,
          IsActive: true,
          IsResponsiblePerson: true,
          PreferredName: null,
          MiddleName: 'T',
          SuffixName: null,
        },
        {
          index: 3,
          PatientId: 300,
          LastName: 'Turner3',
          FirstName: 'Timmy3',
          IsPatient: true,
          IsActive: false,
          IsResponsiblePerson: true,
          PreferredName: null,
          MiddleName: 'T',
          SuffixName: null,
        },
      ];
      scope.patientInfo = { AccountId: 400, ResponsiblePartyId: 200 };
      ctrl.init();
      expect(scope.dataPersonAccountNote.AccountId).toBe(null);
      expect(scope.dataPersonAccountNote.PatientId).toBe(200);
      //TODO: Fix this expect statement
      // expect(
      //   moment(scope.dataPersonAccountNote.Date).format('MM/DD/YYYY')
      // ).toBe(moment(new Date()).format('MM/DD/YYYY'));
      expect(scope.dataPersonAccountNote.Description).toBe('');
      expect(scope.dataPersonAccountNote.DataTag).toBe(null);
      expect(scope.dataPersonAccountNote.Type).toBe('Account Note');
      expect(scope.dataPersonAccountNote.LocationId).toBe(4);
      expect(spy).toHaveBeenCalled();
      expect(scope.selectedAccountMember).not.toBe(undefined);
      expect(scope.patientIndex).toBe(2);
      expect(scope.isAddmode).toBe(true);
      expect(ctrl.accountId).toBe(400);
      expect(ctrl.patientId).toBe(200);
    });
    it('should initialize variables in add mode when selectedPatientId is an array', function () {
      scope.mode = 'add';
      var spy = spyOn(ctrl, 'initializeDefault');
      scope.accountMemberLists = [
        {
          index: 1,
          PatientId: 100,
          LastName: 'Turner',
          FirstName: 'Timmy',
          IsPatient: true,
          IsActive: true,
          IsResponsiblePerson: true,
          PreferredName: null,
          MiddleName: 'T',
          SuffixName: null,
        },
        {
          index: 2,
          PatientId: 200,
          LastName: 'Turner2',
          FirstName: 'Timmy2',
          IsPatient: false,
          IsActive: true,
          IsResponsiblePerson: true,
          PreferredName: null,
          MiddleName: 'T',
          SuffixName: null,
        },
        {
          index: 3,
          PatientId: 300,
          LastName: 'Turner3',
          FirstName: 'Timmy3',
          IsPatient: true,
          IsActive: false,
          IsResponsiblePerson: true,
          PreferredName: null,
          MiddleName: 'T',
          SuffixName: null,
        },
      ];
      scope.patientInfo = { AccountId: 400, ResponsiblePartyId: 200 };
      scope.$parent.selectedPatientId = [100];
      ctrl.init();
      expect(scope.dataPersonAccountNote.AccountId).toBe(null);
      expect(scope.dataPersonAccountNote.PatientId).toBe(100);
      //TODO: Fix this expect statement
      // expect(
      //   moment(scope.dataPersonAccountNote.Date).format('MM/DD/YYYY')
      // ).toBe(moment(new Date()).format('MM/DD/YYYY'));
      expect(scope.dataPersonAccountNote.Description).toBe('');
      expect(scope.dataPersonAccountNote.DataTag).toBe(null);
      expect(scope.dataPersonAccountNote.Type).toBe('Account Note');
      expect(scope.dataPersonAccountNote.LocationId).toBe(4);
      expect(spy).toHaveBeenCalled();
      expect(scope.selectedAccountMember).not.toBe(undefined);
      expect(scope.patientIndex).toBe(1);
      expect(scope.isAddmode).toBe(true);
      expect(ctrl.accountId).toBe(150);
      expect(ctrl.patientId).toBe(100);
    });
  });

  describe('scope.getTitle ->', function () {
    it('should return title for add when mode is set to add', function () {
      scope.mode = 'add';
      var title = scope.getTitle();
      expect(title).toBe('Add an Account Note');
    });
    it('should return title for view when mode is set to view', function () {
      scope.mode = 'view';
      var title = scope.getTitle();
      expect(title).toBe('View Account Note');
    });
    it('should return title for edit when mode is set to edit', function () {
      scope.mode = 'edit';
      var title = scope.getTitle();
      expect(title).toBe('Edit Account Note');
    });
    it('should return default title when mode is not set', function () {
      scope.mode = '';
      var title = scope.getTitle();
      expect(title).toBe('Account Note');
    });
  });

  describe('ctrl.setLocation ->', function () {
    beforeEach(inject(function ($filter) {
      filter = $filter('orderBy');
    }));
    it('should order location list', function () {
      scope.locations = [
        { NameLine1: 'Zebra', Timezone: 'Central Standard Time' },
        { NameLine1: 'Alpha', Timezone: 'Central Standard Time' },
        { NameLine1: 'Beta', Timezone: 'Central Standard Time' },
      ];
      scope.dataPersonAccountNote = { LocationId: 1 };
      ctrl.setLocation();
      expect(scope.locations[0].NameLine1).toBe('Alpha');
      expect(scope.locations[1].NameLine1).toBe('Beta');
      expect(scope.locations[2].NameLine1).toBe('Zebra');
      expect(scope.dataPersonAccountNote.LocationId).toBe(1);
    });
    it('should default location to logged in location', function () {
      scope.locations = [
        { NameLine1: 'Zebra', Timezone: 'Central Standard Time' },
        { NameLine1: 'Alpha', Timezone: 'Central Standard Time' },
        { NameLine1: 'Beta', Timezone: 'Central Standard Time' },
      ];
      scope.dataPersonAccountNote = {};
      ctrl.setLocation();
      expect(scope.dataPersonAccountNote.LocationId).toBe(4);
    });
  });

  describe('ctrl.setAccountMembers ->', function () {
    it('should set account member options correctly', function () {
      var accountMembers = [
        {
          index: 1,
          PatientId: 100,
          LastName: 'Turner',
          FirstName: 'Timmy',
          IsPatient: true,
          IsActive: true,
          IsResponsiblePerson: true,
          PreferredName: null,
          MiddleName: 'T',
          SuffixName: null,
        },
        {
          index: 2,
          PatientId: 200,
          LastName: 'Turner2',
          FirstName: 'Timmy2',
          IsPatient: false,
          IsActive: true,
          IsResponsiblePerson: true,
          PreferredName: null,
          MiddleName: 'T',
          SuffixName: null,
        },
        {
          index: 3,
          PatientId: 300,
          LastName: 'Turner3',
          FirstName: 'Timmy3',
          IsPatient: true,
          IsActive: false,
          IsResponsiblePerson: true,
          PreferredName: null,
          MiddleName: 'T',
          SuffixName: null,
        },
      ];
      ctrl.setAccountMembers(accountMembers);
      expect(scope.accountMemberLists[0].index).toBe(0);
      expect(scope.accountMemberLists[0].FirstName).toBe('Timmy');
      expect(scope.accountMemberLists[0].Name).toBe('Timmy Turner');
      expect(scope.accountMemberLists[0].DisplayName).toBe('Timmy T.');
      expect(scope.accountMemberLists[0].PatientId).toBe(100);
      expect(scope.accountMemberLists[1].PatientId).toBe(200);
      expect(scope.accountMemberLists[2].PatientId).toBe(300);
      expect(scope.accountMemberLists[0].IsResponsiblePerson).toBe(true);
      expect(scope.accountMemberLists[0].PatientDetailedName).toBe(
        'Timmy T. Turner (RP)'
      );
      expect(scope.accountMemberLists[1].PatientDetailedName).toBe(
        'Timmy2 T. Turner2 (RP)'
      );
      expect(scope.accountMemberLists[2].PatientDetailedName).toBe(
        'Timmy3 T. Turner3 (RP)'
      );
      expect(scope.accountMemberLists.length).toBe(3);
    });
  });

  describe('scope.cancelChanges ->', function () {
    beforeEach(inject(function () {
      var date = moment('2024-01-01T00:00:00.000Z')
        .tz('America/Chicago')
        .local(true);
      scope.dataPersonAccountNote = {
        Date: date,
        PatientId: 100,
        LocationId: 1,
        Description: 'Test',
      };
      ctrl.accountNoteTemp = {
        DateEntered: date,
        PatientId: 100,
        LocationId: 1,
        Description: 'Test',
      };
    }));
    it('should call close modal if mode is set to view', function () {
      scope.mode = 'view';
      var spy = spyOn(ctrl, 'closeModal');
      scope.cancelChanges();
      expect(spy).toHaveBeenCalled();
    });
    it('should call close modal if mode is not set to view and no changes', function () {
      scope.mode = 'edit';
      var spy = spyOn(ctrl, 'closeModal');
      scope.cancelChanges();
      expect(spy).toHaveBeenCalled();
    });
    it('should call cancel modal if mode is not set to view and changes', function () {
      scope.mode = 'edit';
      scope.dataPersonAccountNote.PatientId = 200;
      scope.cancelChanges();
      expect(modalFactory.CancelModal).toHaveBeenCalled();
    });
  });

  describe('scope.save ->', function () {
    beforeEach(inject(function () {
      var date = moment('2024-01-01T00:00:00.000Z')
        .tz('America/Chicago')
        .local(true);
      scope.dataPersonAccountNote = {
        Id: 2,
        AccountId: 500,
        DataTag: 'ADEFF45',
        Date: date,
        PatientId: 100,
        LocationId: 1,
        Description: 'Test',
      };
    }));
    it('should not add or edit the account note if mode is view', function () {
      scope.mode = 'view';
      ctrl.accountId = 32;
      scope.save();
      expect(scope.dataPersonAccountNote.Id).toBe(2);
      expect(scope.dataPersonAccountNote.AccountId).toBe(32);
      expect(scope.dataPersonAccountNote.PatientId).toBe(100);
      expect(
        moment(scope.dataPersonAccountNote.Date).format('MM/DD/YYYY')
      ).toBe('12/31/2023');
      expect(scope.dataPersonAccountNote.Description).toBe('Test');
      expect(scope.dataPersonAccountNote.DataTag).toBe('ADEFF45');
      expect(scope.dataPersonAccountNote.LocationId).toBe(1);
      expect(scope.personAccountNoteId).toBe(2);
      expect(mockAccountNoteFactory.editAccountNote).not.toHaveBeenCalled();
      expect(mockAccountNoteFactory.createAccountNote).not.toHaveBeenCalled();
    });
    it('should edit the account note in edit mode', function () {
      scope.mode = 'edit';
      var accountNote = {
        PersonAccountNoteId: 2,
        AccountId: 32,
        DataTag: 'ADEFF45',
        DateEntered: '2024-01-01T00:00:00.000Z',
        PersonId: 100,
        LocationId: 1,
        Description: 'Test',
        Type: 1,
      };
      ctrl.accountId = 32;
      scope.save();
      expect(scope.dataPersonAccountNote.Id).toBe(2);
      expect(scope.dataPersonAccountNote.AccountId).toBe(32);
      expect(scope.dataPersonAccountNote.PatientId).toBe(100);
      expect(
        moment(scope.dataPersonAccountNote.Date).format('MM/DD/YYYY')
      ).toBe('12/31/2023');
      expect(scope.dataPersonAccountNote.Description).toBe('Test');
      expect(scope.dataPersonAccountNote.DataTag).toBe('ADEFF45');
      expect(scope.dataPersonAccountNote.LocationId).toBe(1);
      expect(scope.personAccountNoteId).toBe(2);
      expect(mockAccountNoteFactory.editAccountNote).toHaveBeenCalledWith(
        accountNote,
        ctrl.saveSuccess
      );
      expect(mockAccountNoteFactory.createAccountNote).not.toHaveBeenCalled();
    });
    it('should edit the account note in add mode', function () {
      scope.mode = 'add';
      var accountNote = {
        PersonAccountNoteId: 2,
        AccountId: 32,
        DataTag: 'ADEFF45',
        DateEntered: '2024-01-01T00:00:00.000Z',
        PersonId: 100,
        LocationId: 1,
        Description: 'Test',
        Type: 1,
      };
      ctrl.accountId = 32;
      scope.save();
      expect(scope.dataPersonAccountNote.Id).toBe(2);
      expect(scope.dataPersonAccountNote.AccountId).toBe(32);
      expect(scope.dataPersonAccountNote.PatientId).toBe(100);
      expect(
        moment(scope.dataPersonAccountNote.Date).format('MM/DD/YYYY')
      ).toBe('12/31/2023');
      expect(scope.dataPersonAccountNote.Description).toBe('Test');
      expect(scope.dataPersonAccountNote.DataTag).toBe('ADEFF45');
      expect(scope.dataPersonAccountNote.LocationId).toBe(1);
      expect(scope.personAccountNoteId).toBe(2);
      expect(mockAccountNoteFactory.createAccountNote).toHaveBeenCalledWith(
        accountNote,
        ctrl.saveSuccess
      );
      expect(mockAccountNoteFactory.editAccountNote).not.toHaveBeenCalled();
    });
    it('should not add or edit the account note if description is empty', function () {
      scope.mode = 'edit';
      ctrl.accountId = 32;
      scope.dataPersonAccountNote.Description = '';
      scope.save();
      expect(scope.dataPersonAccountNote.Id).toBe(2);
      expect(scope.dataPersonAccountNote.AccountId).toBe(32);
      expect(scope.dataPersonAccountNote.PatientId).toBe(100);
      expect(
        moment(scope.dataPersonAccountNote.Date).format('MM/DD/YYYY')
      ).toBe('12/31/2023');
      expect(scope.dataPersonAccountNote.Description).toBe('');
      expect(scope.dataPersonAccountNote.DataTag).toBe('ADEFF45');
      expect(scope.dataPersonAccountNote.LocationId).toBe(1);
      expect(scope.personAccountNoteId).toBe(2);
      expect(mockAccountNoteFactory.editAccountNote).not.toHaveBeenCalled();
      expect(mockAccountNoteFactory.createAccountNote).not.toHaveBeenCalled();
    });

    it('should not add or edit the account note if disableSave is true', function () {
      scope.disableSave = true;
      ctrl.accountId = 32;
      scope.dataPersonAccountNote.Description = 'Account Note';
      scope.save();
      expect(mockAccountNoteFactory.editAccountNote).not.toHaveBeenCalled();
      expect(mockAccountNoteFactory.createAccountNote).not.toHaveBeenCalled();
    });
  });

  describe('ctrl.initializeDefault ->', function () {
    it('should set account note temp object properties to dataPersonAccountNote object properties', function () {
      scope.dataPersonAccountNote = {
        Date: moment('2024-01-01T00:00:00.000Z'),
        PatientId: 100,
        LocationId: 1,
        Description: 'Test',
      };
      ctrl.initializeDefault();
      expect(ctrl.accountNoteTemp.LocationId).toBe(1);
      expect(ctrl.accountNoteTemp.PatientId).toBe(100);
      expect(
        moment(ctrl.accountNoteTemp.DateEntered).format('MM/DD/YYYY')
      ).toBe(moment(scope.dataPersonAccountNote.Date).format('MM/DD/YYYY'));
      expect(ctrl.accountNoteTemp.Description).toBe('Test');
    });
    it('should set account note temp object properties if dataPersonAccountNote object properties are not set', function () {
      var date = new Date();
      scope.dataPersonAccountNote = {
        Date: null,
        PatientId: null,
        LocationId: null,
        Description: '',
      };
      scope.selectedLocation = { LocationId: 2 };
      scope.selectedAccountMember = { PatientId: 200 };
      ctrl.initializeDefault();
      expect(ctrl.accountNoteTemp.LocationId).toBe(2);
      expect(ctrl.accountNoteTemp.PatientId).toBe(200);
      //TODO: Fix this expect statement
      // expect(
      //   moment(ctrl.accountNoteTemp.DateEntered).format('MM/DD/YYYY')
      // ).toBe(moment(date).format('MM/DD/YYYY'));
      expect(ctrl.accountNoteTemp.Description).toBe('');
    });
  });

  describe('ctrl.validateDefault ->', function () {
    beforeEach(inject(function () {
      var date = moment('2024-01-01T00:00:00.000Z')
        .tz('America/Chicago')
        .local(true);
      scope.dataPersonAccountNote = {
        Date: date,
        PatientId: 100,
        LocationId: 1,
        Description: 'Test',
      };
      ctrl.accountNoteTemp = {
        DateEntered: date,
        PatientId: 100,
        LocationId: 1,
        Description: 'Test',
      };
    }));
    it('should return false if nothing changed', function () {
      var hasChanged = ctrl.validateDefault();
      expect(hasChanged).toBe(false);
    });
    it('should return true if patient changed', function () {
      scope.dataPersonAccountNote.PatientId = 200;
      var hasChanged = ctrl.validateDefault();
      expect(hasChanged).toBe(true);
    });
    it('should return false if description changed', function () {
      scope.dataPersonAccountNote.Description = 'Test2';
      var hasChanged = ctrl.validateDefault();
      expect(hasChanged).toBe(true);
    });
    it('should return false if date changed', function () {
      scope.dataPersonAccountNote.Date = new Date(
        1000,
        12,
        31,
        23,
        59,
        59,
        999
      );
      var hasChanged = ctrl.validateDefault();
      expect(hasChanged).toBe(true);
    });
    it('should return false if location changed', function () {
      scope.dataPersonAccountNote.LocationId = 4;
      var hasChanged = ctrl.validateDefault();
      expect(hasChanged).toBe(true);
    });
  });

  describe('ctrl.validateChange ->', function () {
    beforeEach(inject(function () {
      var date = moment('2024-01-01T00:00:00.000Z')
        .tz('America/Chicago')
        .local(true);
      scope.dataPersonAccountNote = {
        Date: date,
        PatientId: 100,
        LocationId: 1,
        Description: 'Test',
      };
      ctrl.accountNoteTemp = {
        DateEntered: date,
        PatientId: 100,
        LocationId: 1,
        Description: 'Test',
      };
    }));
    it('should set validChange to false if nothing changed', function () {
      ctrl.validateChange();
      expect(scope.validChange).toBe(false);
    });
    it('should set validChange to true if something changed', function () {
      scope.dataPersonAccountNote.PatientId = 200;
      ctrl.validateChange();
      expect(scope.validChange).toBe(true);
    });
    it('should set validChange to false if description is undefined', function () {
      scope.dataPersonAccountNote.Description =
        ctrl.accountNoteTemp.Description = undefined;
      ctrl.validateChange();
      expect(scope.validChange).toBe(false);
    });
    it('should set validChange to false if date is null', function () {
      scope.dataPersonAccountNote.Date = ctrl.accountNoteTemp.DateEntered =
        null;
      ctrl.validateChange();
      expect(scope.validChange).toBe(false);
    });
    it('should set validChange to false if description is null', function () {
      scope.dataPersonAccountNote.Description =
        ctrl.accountNoteTemp.Description = null;
      ctrl.validateChange();
      expect(scope.validChange).toBe(false);
    });
    it('should set validChange to false if description is whitespace', function () {
      scope.dataPersonAccountNote.Description =
        ctrl.accountNoteTemp.Description = ' ';
      ctrl.validateChange();
      expect(scope.validChange).toBe(false);
    });
  });

  describe('scope.patientChanged ->', function () {
    beforeEach(inject(function ($filter) {
      filter = $filter('filter');
    }));
    it('should call validate method', function () {
      var spy = spyOn(ctrl, 'validateChange');
      scope.accountMemberLists = [
        { PatientId: 100, index: 1 },
        { PatientId: 200, index: 2 },
        { PatientId: 300, index: 3 },
      ];
      scope.dataPersonAccountNote = { PatientId: 100 };
      scope.patientIndex = 1;
      scope.patientChanged(2);
      expect(spy).toHaveBeenCalled();
      expect(scope.patientIndex).toBe(2);
      expect(scope.dataPersonAccountNote.PatientId).toBe(200);
    });
    it('should return if no accountMembers', function () {
      var spy = spyOn(ctrl, 'validateChange');
      scope.accountMemberLists = null;
      scope.dataPersonAccountNote = { PatientId: 100 };
      scope.patientIndex = 1;
      scope.patientChanged(2);
      expect(spy).not.toHaveBeenCalled();
      expect(scope.patientIndex).toBe(1);
      expect(scope.dataPersonAccountNote.PatientId).toBe(100);
    });
    it('should return if no new value', function () {
      var spy = spyOn(ctrl, 'validateChange');
      scope.accountMemberLists = [
        { PatientId: 100 },
        { PatientId: 200 },
        { PatientId: 300 },
      ];
      scope.dataPersonAccountNote = { PatientId: 100 };
      scope.patientIndex = 1;
      scope.patientChanged();
      expect(spy).not.toHaveBeenCalled();
      expect(scope.patientIndex).toBe(1);
      expect(scope.dataPersonAccountNote.PatientId).toBe(100);
    });
  });

  describe('scope.locationChanged ->', function () {
    beforeEach(inject(function ($filter) {
      filter = $filter('filter');
    }));
    it('should call validate method', function () {
      var spy = spyOn(ctrl, 'validateChange');
      scope.locations = [
        {
          NameLine1: 'Zebra',
          LocationId: 1,
          Timezone: 'Central Standard Time',
        },
        {
          NameLine1: 'Alpha',
          LocationId: 2,
          Timezone: 'Central Standard Time',
        },
        { NameLine1: 'Beta', LocationId: 3, Timezone: 'Central Standard Time' },
      ];
      scope.dataPersonAccountNote = { LocationId: 1 };
      scope.locationChanged(2);
      expect(spy).toHaveBeenCalled();
      expect(scope.dataPersonAccountNote.LocationId).toBe(2);
    });
    it('should return if locations is null', function () {
      var spy = spyOn(ctrl, 'validateChange');
      scope.locations = null;
      scope.dataPersonAccountNote = { LocationId: 1 };
      scope.locationChanged(2);
      expect(spy).not.toHaveBeenCalled();
      expect(scope.dataPersonAccountNote.LocationId).toBe(1);
    });
    it('should return if no new value', function () {
      var spy = spyOn(ctrl, 'validateChange');
      scope.locations = [
        {
          NameLine1: 'Zebra',
          LocationId: 1,
          Timezone: 'Central Standard Time',
        },
        {
          NameLine1: 'Alpha',
          LocationId: 2,
          Timezone: 'Central Standard Time',
        },
        { NameLine1: 'Beta', LocationId: 3, Timezone: 'Central Standard Time' },
      ];
      scope.dataPersonAccountNote = { LocationId: 1 };
      scope.locationChanged();
      expect(spy).not.toHaveBeenCalled();
      expect(scope.dataPersonAccountNote.LocationId).toBe(1);
    });
  });

  describe('scope.descriptionChanged ->', function () {
    it('should call validate method', function () {
      var spy = spyOn(ctrl, 'validateChange');
      scope.descriptionChanged();
      expect(spy).toHaveBeenCalled();
    });
  });
});
