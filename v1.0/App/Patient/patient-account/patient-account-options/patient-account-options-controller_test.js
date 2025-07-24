describe('PatientAccountOptionController ->', function () {
  var ctrl,
    scope,
    listHelper,
    routeParams,
    controller,
    data,
    element,
    localize,
    timeout,
    patientServices,
    toastrFactory,
    userServices,
    usersFactory,
    userData,
    location,
    rootScope,
    shareData,
    featureFlagService,
    fuseFlag;
  function createController() {
    ctrl = controller('PatientAccountOptionController', {
      $scope: scope,
      $routeParams: routeParams,
      localize: localize,
      ListHelper: listHelper,
      PatientServices: patientServices,
      toastrFactory: toastrFactory,
      UserServices: userServices,
      $location: location,
      UsersFactory: usersFactory,
      ShareData: shareData,
      featureFlagService: featureFlagService,
      fuseFlag: fuseFlag,      
    });
  }
  beforeEach(module('Soar.Common'));
  beforeEach(module('common.factories'));
  beforeEach(module('Soar.Patient'));
  beforeEach(module(function($provide) {
    $provide.value('FeatureFlagService', featureFlagService);
    $provide.value('fuseFlag', fuseFlag);
  }));  
  beforeEach(inject(function ($rootScope, $controller, $injector) {
    scope = $rootScope.$new();
    rootScope = $rootScope;
    timeout = $injector.get('$timeout');
    controller = $controller;
    //mock for routeParams
    routeParams = {
      patientId: 100,
      Category: 'sample',
      currentPatientId: null,
    };

    shareData = {};

    var urlParams = { tab: 'Summary' };
    location = { search: jasmine.createSpy().and.returnValue(urlParams) };

    //mock for listHelper service
    listHelper = {
      findItemByFieldValue: jasmine
        .createSpy('listHelper.findItemByFieldValue')
        .and.returnValue({}),
      findIndexByFieldValue: jasmine
        .createSpy('listHelper.findItemByFieldValue')
        .and.returnValue(0),
    };
    //mock for patientServices
    patientServices = {
      Patients: {
        get: jasmine.createSpy().and.returnValue(''),
      },
      Account: {
        getByPersonId: jasmine.createSpy().and.returnValue(''),
        getAllAccountMembersByAccountId: jasmine
          .createSpy()
          .and.returnValue(''),
        getAccountMembersDetailByAccountId: jasmine
          .createSpy()
          .and.returnValue(''),
      },
      Encounter: {
        getEncounterServiceTransactionLinkByPersonId: jasmine
          .createSpy()
          .and.returnValue(''),
      },
    };
    //mock for toaster functionality
    toastrFactory = {
      success: jasmine.createSpy(),
      error: jasmine.createSpy(),
    };
    //mock for outside scope function
    scope.SelectTab = function () {};

    scope.patient = {
      Data: {
        PatientId: '3ac618be-9915-4a6a-b7f3-8ec9568dcab3',
        FirstName: 'John',
        MiddleName: null,
        LastName: 'Smith',
        PreferredName: 'John',
        Prefix: null,
        Suffix: null,
        AddressLine1: null,
        AddressLine2: null,
        City: null,
        State: null,
        ZipCode: null,
        Sex: 'M',
        DateOfBirth: '1991-12-03T00:00:00Z',
        IsPatient: true,
        PatientCode: 'KULCH1',
        EmailAddress: null,
        EmailAddress2: null,
        PersonAccount: {
          AccountId: '6d6b91ed-0347-4f01-9e9b-62f80e9ffbfa',
          PersonId: '3ac618be-9915-4a6a-b7f3-8ec9568dcab3',
          PersonAccountMember: {
            AccountMemberId: '274dcf9c-f28c-4ea3-8884-d2812b48bc8d',
            AccountId: '6d6b91ed-0347-4f01-9e9b-62f80e9ffbfa',
            ResponsiblePersonId: '3ac618be-9915-4a6a-b7f3-8ec9568dcab3',
            PersonId: '3ac618be-9915-4a6a-b7f3-8ec9568dcab3',
            Balance30: 0,
            Balance60: 0,
            Balance90: 0,
            Balance120: 0,
            BalanceCurrent: 0,
            BalanceInsurance: 0,
            DataTag:
              '{"Timestamp":"2015-07-15T11:50:03.223","RowVersion":"W/\\"datetime\'2015-07-15T11%3A50%3A03.223Z\'\\""}',
            UserModified: '00000000-0000-0000-0000-000000000000',
            DateModified: '0001-01-01T00:00:00',
          },
          DataTag:
            '{"Timestamp":"2015-07-15T11:50:02.927","RowVersion":"W/\\"datetime\'2015-07-15T11%3A50%3A02.927Z\'\\""}',
          UserModified: '00000000-0000-0000-0000-000000000000',
          DateModified: '0001-01-01T00:00:00',
        },
        ResponsiblePersonType: 1,
        ResponsiblePersonId: '3ac618be-9915-4a6a-b7f3-8ec9568dcab3',
        DataTag:
          '{"Timestamp":"2015-07-15T11:50:02.457","RowVersion":"W/\\"datetime\'2015-07-15T11%3A50%3A02.457Z\'\\""}',
        UserModified: '00000000-0000-0000-0000-000000000000',
        DateModified: '0001-01-01T00:00:00',
      },
    };
    scope.category = 'sample';

    scope.filterObject = {
      Statuses: [],
      members: [],
      dateRange: {
        start: null,
        end: null,
      },
      Teeth: [],
      transactionTypes: null,
      providers: null,
      locations: null,
      IncludePaidTransactions: true,
      IncludeUnpaidTransactions: true,
      IncludeUnappliedTransactions: true,
      IncludeAppliedTransactions: true,
      IncludeServicesWithOpenClaims: true,
      IncludeAccountNotes: true,
      IncludeDocuments: true,
    };

    data = {
      value: jasmine.createSpy().and.returnValue(1),
      text: jasmine.createSpy().and.returnValue('a'),
      dataItem: jasmine.createSpy().and.returnValue({
        name: 'Summary',
        value: 0,
        url: '#/Patient/' + routeParams.patientId + '/Account/',
        templateUrl:
          'App/Patient/patient-account/patient-summary/patient-summary.html',
      }),
      select: jasmine.createSpy(),
      focus: jasmine.createSpy(),
    };

    data = {
      value: jasmine.createSpy().and.returnValue(1),
      text: jasmine.createSpy().and.returnValue('a'),
      dataItem: jasmine.createSpy().and.returnValue({
        nname: 'Summary Beta',
        value: 8,
        url: '#/Patient/' + routeParams.PatientId + '/Account Summary Beta/',
        templateUrl:
          'App/Patient/patient-account/patient-summary/patient-summary-beta-Migration.html',
      }),
      select: jasmine.createSpy(),
      focus: jasmine.createSpy(),
    };
    element = {
      data: jasmine.createSpy().and.returnValue(data),
    };
    spyOn(angular, 'element').and.returnValue(element);
    //mock for localize service
    localize = {
      getLocalizedString: jasmine
        .createSpy('localize.getLocalizedString')
        .and.returnValue('Summary'),
    };

    //mock for userServices service
    userServices = {
      Users: {
        get: jasmine.createSpy().and.returnValue(userData),
      },
    };
    userData = [
      {
        UserId: '271442d9-f22a-4441-9ba7-921a429ed0f6',
        FirstName: 'sample',
        MiddleName: null,
        LastName: 'user',
        PreferredName: null,
        DateOfBirth: null,
        UserName: 'username1',
        UserCode: 'USESA1',
        ImageFile: null,
        EmployeeStartDate: '2015-01-06T00:00:00Z',
        EmployeeEndDate: null,
        Email: 'username1@gmail.com',
        Address: {
          AddressLine1: null,
          AddressLine2: null,
          City: null,
          State: null,
          ZipCode: null,
        },
        DepartmentId: null,
        JobTitle: null,
        ProviderTypeId: 3,
        TaxId: null,
        FederalLicense: null,
        DeaNumber: null,
        NpiTypeOne: null,
        PrimaryTaxonomyId: null,
        SecondaryTaxonomyId: null,
        StateLicense: null,
        AnesthesiaId: null,
        IsActive: true,
        StatusChangeNote: null,
      },
    ];

    usersFactory = {
      Users: jasmine.createSpy().and.returnValue({ then: function () {} }),
    };

    featureFlagService = {
      getOnce$: jasmine.createSpy().and.returnValue({ subscribe: jasmine.createSpy() })
    };

    fuseFlag = {
      EnableOrthodonticContracts: jasmine.createSpy().and.returnValue({ subscribe: jasmine.createSpy() })
    };

  }));

  //controller
  it('PatientAccountOptionController : should check if controller exists', function () {
    expect(ctrl).not.toBeNull();
  });

  //getTabNameFromParam
  describe('getTabNameFromParam function ->', function () {
    beforeEach(inject(function () {
      createController();
    }));

    it('getTabNameFromParam calls location.search', function () {
      var result = ctrl.getTabNameFromParam();
      expect(location.search).toHaveBeenCalled();
      expect(result).toBe('Summary');
    });
  });

  //getAllAccountMembersSuccess
  describe('getAllAccountMembersSuccess function ->', function () {
    beforeEach(inject(function () {
      createController();
    }));
    it('should handle success callback for get all accountmember service', function () {
      var successResponse = {
        Value: [
          {
            PatientId: '3ac618be-9915-4a6a-b7f3-8ec9568dcab3',
            FirstName: 'John',
            LastName: 'Smith',
            PreferredName: 'John',
            DateOfBirth: '1991-12-03T00:00:00Z',
            IsPatient: true,
            PhoneNumber: null,
          },
        ],
      };
      ctrl.getAllAccountMembersSuccess(successResponse);
      expect(toastrFactory.error).not.toHaveBeenCalled();
    });
    it('should show error msg if service returns blank data', function () {
      var successResponse = {};
      ctrl.getAllAccountMembersSuccess(successResponse);
      expect(toastrFactory.error).toHaveBeenCalled();
    });

    it('should call getAllAccountMembersByAccountId function of patientServices.Account service', function () {
      var successResponse = {
        Value: [
          {
            PatientId: '3ac618be-9915-4a6a-b7f3-8ec9568dcab3',
            FirstName: 'John',
            LastName: 'Smith',
            PreferredName: 'John',
            DateOfBirth: '1991-12-03T00:00:00Z',
            IsPatient: true,
            PhoneNumber: null,
          },
        ],
      };
      scope.patient.Data.PersonAccount = {};
      ctrl.getAllAccountMembersSuccess(successResponse);
      expect(
        patientServices.Account.getAllAccountMembersByAccountId
      ).toHaveBeenCalled();
    });
  });

  describe('when ResponsiblePersonType is equal to 0 ->', function () {
    it('should set showNoResponsiblePersonWarning to true', function () {
      scope.patient.Data.ResponsiblePersonType = 0;
      ctrl.patientProfileOptionIndex = 1;
      scope.accountSummaryOptions = [{ name: 'test1' }, { name: 'test2' }];
      createController();

      scope.$digest();

      expect(scope.showNoResponsiblePersonWarning).toBe(true);
    });
  });

  //getAllAccountMembersFailure
  describe('getAllAccountMembersFailure function ->', function () {
    beforeEach(inject(function () {
      createController();
    }));
    it('should handle failure callback for get all accountmembers service', function () {
      ctrl.getAllAccountMembersFailure();
      expect(toastrFactory.error).toHaveBeenCalled();
    });
  });

  //updatePersonAccount
  describe('updatePersonAccount  function ->', function () {
    beforeEach(inject(function () {
      createController();
    }));
    it('should set PersonAccount of patient data from person', function () {
      var person = {
        PersonAccount: { AccountId: 1 },
      };

      ctrl.updatePersonAccount(null, person);
      expect(scope.patient.Data.PersonAccount).toBe(person.PersonAccount);
    });
  });

  //getPracticeProviders
  describe('getPracticeProviders function ->', function () {
    beforeEach(inject(function () {
      createController();
    }));
    // should call getPracticeProviders.get function
    it('should call getPracticeProviders.get', function () {
      scope.getPracticeProviders();
      expect(usersFactory.Users).toHaveBeenCalled();
      expect(scope.loadingProviders).toBe(true);
    });

    // should set all user providers in scope
    it('userServicesGetSuccess should set scope property', function () {
      scope.loadingProviders = false;
      scope.providers = [];
      scope.userServicesGetSuccess({ Value: userData });
      expect(scope.providers).not.toBeNull();
    });

    // should set all user providers in scope
    it('userServicesGetSuccess should set scope property without ProviderId', function () {
      scope.loadingProviders = false;
      scope.providers = [];
      scope.userServicesGetSuccess({ Value: userData });
      expect(scope.providers).not.toBeNull();
    });

    // should set all user providers in scope
    it('userServicesGetSuccess when filterValue.ProviderTypeId return false ', function () {
      scope.loadingProviders = false;
      scope.providers = [{ ProviderId: 1, ProviderTypeId: 1 }];
      var userData = [
        {
          UserId: '271442d9-f22a-4441-9ba7-921a429ed0f6',
          FirstName: 'sample',
          MiddleName: null,
          LastName: 'user',
          PreferredName: null,
          DateOfBirth: null,
          UserName: 'username1',
          UserCode: 'USESA1',
          ImageFile: null,
          EmployeeStartDate: '2015-01-06T00:00:00Z',
          EmployeeEndDate: null,
          Email: 'username1@gmail.com',
          Address: {
            AddressLine1: null,
            AddressLine2: null,
            City: null,
            State: null,
            ZipCode: null,
          },
          DepartmentId: null,
          JobTitle: null,
          TaxId: null,
          FederalLicense: null,
          DeaNumber: null,
          NpiTypeOne: null,
          PrimaryTaxonomyId: null,
          SecondaryTaxonomyId: null,
          StateLicense: null,
          AnesthesiaId: null,
          IsActive: true,
          StatusChangeNote: null,
        },
      ];

      scope.userServicesGetSuccess({ Value: userData });
      expect(scope.providers.count).not.toBeNull();
      expect(scope.providers.count).toBeUndefined();
    });

    // should set scope properties after calling user service get failure function
    it('userServicesGetFailure should set scope properties', function () {
      scope.loadingProviders = true;
      scope.providers = userData;
      scope.userServicesGetFailure();
      expect(scope.providers).toEqual([]);
    });
  });

  //getAccountMembersSuccess
  describe('getAccountMembersSuccess function ->', function () {
    beforeEach(inject(function () {
      localize = {
        getLocalizedString: jasmine
          .createSpy('localize.getLocalizedString')
          .and.returnValue('All Account Members'),
      };
      createController();
      spyOn(ctrl, 'selectAccountMembers');
    }));
    it('should set showAccountMembersDropdown to false if only one account member', function () {
      var res = {
        Value: [
          {
            PatientId: '3ac618be-9915-4a6a-b7f3-8ec9568dcab3',
            FirstName: 'John',
            LastName: 'Smith',
            PreferredName: 'John',
            DateOfBirth: '1991-12-03T00:00:00Z',
            IsPatient: true,
            PhoneNumber: null,
          },
        ],
      };
      ctrl.getAccountMembersSuccess(res);
      expect(scope.showAccountMembersDropdown).toBe(false);
      expect(ctrl.selectAccountMembers).toHaveBeenCalled();
    });

    it('should set showAccountMembersDropdown to true if more than one account member and the length of accountMembersOptionsTemp should be (length+1) since All memeber item is to be added if the members are more then one', function () {
      var res = {
        Value: [
          {
            PatientId: '3ac618be-9915-4a6a-b7f3-8ec9568dcab3',
            FirstName: 'John',
            LastName: 'Smith',
            PreferredName: 'John',
            DateOfBirth: '1991-12-03T00:00:00Z',
            IsPatient: true,
            PhoneNumber: null,
          },
          {
            PatientId: '3ac618be-9915-4a6a-b7f3-8ec9568dcab3',
            FirstName: 'Babs',
            LastName: 'Smith',
            PreferredName: 'John',
            DateOfBirth: '1991-12-03T00:00:00Z',
            IsPatient: true,
            PhoneNumber: null,
          },
        ],
      };
      ctrl.getAccountMembersSuccess(res);
      expect(scope.showAccountMembersDropdown).toBe(true);
      expect(scope.accountMembersOptionsTemp[0].name).toBe(
        'All Account Members(2)'
      );
      expect(scope.accountMembersOptionsTemp.length).toBe(3);
      expect(ctrl.selectAccountMembers).toHaveBeenCalled();
    });

    it('should handle success callback for get all accountmember service', function () {
      var successResponse = {
        Value: [
          {
            PatientId: '3ac618be-9915-4a6a-b7f3-8ec9568dcab3',
            FirstName: 'John',
            LastName: 'Smith',
            PreferredName: 'John',
            DateOfBirth: '1991-12-03T00:00:00Z',
            IsPatient: true,
            PhoneNumber: null,
          },
        ],
      };
      ctrl.getAccountMembersSuccess(successResponse);
      expect(ctrl.selectAccountMembers).toHaveBeenCalled();
      expect(toastrFactory.error).not.toHaveBeenCalled();
    });
    it('should show error msg if service returns blank data', function () {
      var successResponse = {};
      ctrl.getAccountMembersSuccess(successResponse);
      expect(toastrFactory.error).toHaveBeenCalled();
    });
    it('length of accountMembersOptionsTemp should be one when only one member is added, to make sure All memeber is not added in that case', function () {
      var res = {
        Value: [
          {
            PatientId: '3ac618be-9915-4a6a-b7f3-8ec9568dcab3',
            FirstName: 'John',
            LastName: 'Smith',
            PreferredName: 'John',
            DateOfBirth: '1991-12-03T00:00:00Z',
            IsPatient: true,
            PhoneNumber: null,
          },
        ],
      };
      ctrl.getAccountMembersSuccess(res);
      expect(ctrl.selectAccountMembers).toHaveBeenCalled();
      expect(scope.accountMembersOptionsTemp.length).toBe(1);
    });
  });

  //setAccountMemberOptionData
  it('setAccountMemberOptionData should set default account memeber option data, if the patient id 0 is present in accountMembersOptions', function () {
    var index = 0;
    createController();
    scope.accountMembersOptions = [
      { personId: 0, patientDetailedName: 'Name0' },
      { personId: 1, patientDetailedName: 'Name1' },
    ];
    scope.defaultAccountMemberOptionIndex = undefined;
    scope.selectedAccountMemberOption = undefined;
    scope.currentPatientId = undefined;

    ctrl.setAccountMemberOptionData();

    expect(scope.defaultAccountMemberOptionIndex).toBe(0);
    expect(scope.selectedAccountMemberOption).toBe('Name0');
    expect(scope.currentPatientId).toBe(0);
  });

  it('setAccountMemberOptionData should set accountMembersOptionsTemp data, if it is not null', function () {
    var index = 0;
    createController();
    scope.accountMembersOptionsTemp = [
      { personId: 0, patientDetailedName: 'Name0' },
      { personId: 1, patientDetailedName: 'Name1' },
    ];
    scope.accountMembersOptions = [
      { personId: 2, patientDetailedName: 'Name2' },
      { personId: 3, patientDetailedName: 'Name3' },
    ];
    ctrl.setAccountMemberOptionData();
    expect(scope.accountMembersOptions).toBe(scope.accountMembersOptionsTemp);
    expect(scope.currentPatientId).toBe(0);
  });
  it('setAccountMemberOptionData should set accountMembersOptions data, if accountMembersOptionsTemp is null', function () {
    var index = 0;
    createController();
    scope.accountMembersOptionsTemp = null;
    scope.accountMembersOptions = [
      { personId: 2, patientDetailedName: 'Name2' },
      { personId: 3, patientDetailedName: 'Name3' },
    ];
    ctrl.setAccountMemberOptionData();
    expect(scope.accountMembersOptions).toBe(scope.accountMembersOptions);
    expect(scope.currentPatientId).toBe(2);
  });
  it('selectedAccountMemberOption should be undefined if accountMembersOptions is null', function () {
    var index = 0;
    createController();
    scope.accountMembersOptions = null;
    ctrl.setAccountMemberOptionData();
    expect(scope.selectedAccountMemberOption).toBe(undefined);
  });

  describe('ctrl.selectAccountMembers ->', function () {
    beforeEach(inject(function () {
      createController();
      scope.accountMembersOptionsTemp = [
        { personId: 2, AccountMemberId: 200 },
        { personId: 3, AccountMemberId: 300 },
        { personId: 4, AccountMemberId: 400 },
      ];
    }));
    it('should sync shareData values and set selection to current patient if shareData value is undefined', function () {
      scope.activeTab = 'Transaction History';
      spyOn(scope, '$broadcast');
      spyOn(scope, 'applyFilters');
      shareData.selectedPatients = undefined;
      routeParams.patientId = 3;
      ctrl.selectAccountMembers();
      expect(scope.filterObject.members).toEqual([3]);
      expect(shareData.selectedPatients).toEqual([3]);
      expect(shareData.currentPatientId).toBe(3);
      expect(scope.$broadcast).toHaveBeenCalledWith(
        'set-account-member-filter'
      );
      expect(scope.applyFilters).not.toHaveBeenCalled();
    });
    it('should sync shareData values and set selection to current patient if shareData value does not match routeParam currentId', function () {
      scope.activeTab = 'Transaction History';
      spyOn(scope, '$broadcast');
      spyOn(scope, 'applyFilters');
      shareData.selectedPatients = [3, 2];
      shareData.currentPatientId = 3;
      routeParams.patientId = 2;
      ctrl.selectAccountMembers();
      expect(scope.filterObject.members).toEqual([2]);
      expect(shareData.selectedPatients).toEqual([2]);
      expect(shareData.currentPatientId).toBe(2);
      expect(scope.$broadcast).toHaveBeenCalledWith(
        'set-account-member-filter'
      );
      expect(scope.applyFilters).not.toHaveBeenCalled();
    });
    it('should set selection to shareData value if shareData values defined and match routeParam currentId', function () {
      scope.activeTab = 'Transaction History';
      spyOn(scope, '$broadcast');
      spyOn(scope, 'applyFilters');
      shareData.selectedPatients = [3, 2];
      shareData.currentPatientId = 3;
      routeParams.patientId = 3;
      ctrl.selectAccountMembers();
      expect(scope.filterObject.members).toEqual([3, 2]);
      expect(shareData.selectedPatients).toEqual([3, 2]);
      expect(shareData.currentPatientId).toBe(3);
      expect(scope.$broadcast).toHaveBeenCalledWith(
        'set-account-member-filter'
      );
      expect(scope.applyFilters).not.toHaveBeenCalled();
    });
    it('should call applyFilters if insurance tab is selected', function () {
      scope.activeTab = 'Insurance Information';
      spyOn(scope, '$broadcast');
      spyOn(scope, 'applyFilters');
      shareData.selectedPatients = [3, 2];
      shareData.currentPatientId = 3;
      routeParams.patientId = 3;
      ctrl.selectAccountMembers();
      expect(scope.filterObject.members).toEqual([3, 2]);
      expect(shareData.selectedPatients).toEqual([3, 2]);
      expect(shareData.currentPatientId).toBe(3);
      expect(scope.$broadcast).toHaveBeenCalledWith(
        'set-account-member-filter'
      );
      expect(scope.applyFilters).toHaveBeenCalled();
    });
  });

  //getAccountMembersFailure
  describe('getAccountMembersFailure function ->', function () {
    beforeEach(inject(function () {
      createController();
    }));
    it('should handle failure callback for get all accountmember service', function () {
      ctrl.getAccountMembersFailure();
      expect(toastrFactory.error).toHaveBeenCalled();
    });
  });

  describe('accountMemberOptionClicked function', function () {
    beforeEach(inject(function () {
      createController();
      scope.accountMembersOptions = [
        { personId: 1, patientDetailedName: 'Name1' },
        { personId: 2, patientDetailedName: 'Name2' },
      ];
    }));

    it('should set account member to default options when passed option is not valid', function () {
      scope.accountMemberOptionClicked(null);
      timeout.flush(100);
      expect(scope.selectedAccountMemberOption).toEqual(
        scope.accountMembersOptions[0].patientDetailedName
      );
      expect(scope.transactionToSearchEncounter).toBe(null);
    });

    it('should set account member to passed option when passed option is valid', function () {
      scope.accountMemberOptionClicked(scope.accountMembersOptions[1]);
      timeout.flush(100);
      expect(scope.selectedAccountMemberOption).toEqual(
        scope.accountMembersOptions[1].patientDetailedName
      );
      expect(scope.transactionToSearchEncounter).toBe(null);
    });
  });

  //init scope.accountSummaryOptions
  it('scope.accountSummaryOptions should be not null, not empty, not undefined', function () {
    createController();
    expect(scope.accountSummaryOptions).not.toBeNull();
    expect(scope.accountSummaryOptions).not.toBeUndefined();
  });

  //init scope.selectedSummaryOption
  it('scope.selectedSummaryOption should be not null, not empty, not undefined', function () {
    createController();
    expect(scope.selectedSummaryOption).not.toBeNull();
    expect(scope.selectedSummaryOption).not.toBeUndefined();
    expect(scope.selectedSummaryOption).toEqual(
      scope.accountSummaryOptions[2].name
    );
  });

  //selectOption
  it('selectOption should set scope.accountSummaryOptionTemplate when option is not available', function () {
    createController();
    scope.accountSummaryOptionTemplate = undefined;
    scope.selectOption(null);
    expect(scope.accountSummaryOptionTemplate).toBeUndefined();
  });

  //navigate-to-related-encounters
  it('should broadcast expand-related-active-encounters with transactionToSearchEncounter on navigate-to-related-encounters', function () {
    createController();
    scope.defaultSummaryOptionIndex = 0;
    scope.currentPatientId = 1;
    scope.accountSummaryOptions = [
      { personId: 1, name: 'View1' },
      { personId: 2, name: 'View2' },
      { personId: 3, name: 'View3' },
    ];
    var transactionToSearchEncounter = {
      intent: 'SearchSingleEncounter',
      encounterId: 1,
    };
    spyOn(rootScope, '$broadcast');
    scope.$emit('navigate-to-related-encounters', transactionToSearchEncounter);
    scope.$root.$digest();

    expect(rootScope.$broadcast).toHaveBeenCalledWith(
      'expand-related-active-encounters',
      transactionToSearchEncounter
    );
  });

  //multiple-account-members-selected-flag-changed
  it('should broadcast multiple-account-members-selected-flag-changed', function () {
    createController();

    scope.$emit('multiple-account-members-selected-flag-changed', true);
    scope.$root.$digest();

    expect(scope.multipleAccountMembersSelected).toEqual(true);
  });

  describe('accountSummaryOptionClicked function', function () {
    beforeEach(inject(function () {
      createController();
      scope.accountSummaryOptions = [
        { personId: 1, name: 'View1' },
        { personId: 2, name: 'View2' },
        { personId: 3, name: 'View3' },
      ];
    }));

    it('should set account view to default options when passed option is not valid', function () {
      spyOn(scope, 'selectOption');
      scope.accountSummaryOptionClicked(null);
      expect(scope.selectedSummaryOption).toEqual(
        scope.accountSummaryOptions[0].name
      );
      expect(scope.transactionToSearchEncounter).toBe(null);
    });

    it('should set account view to passed option when passed option is valid', function () {
      spyOn(scope, 'selectOption');
      scope.accountSummaryOptionClicked(scope.accountSummaryOptions[1]);
      expect(scope.selectedSummaryOption).toEqual(
        scope.accountSummaryOptions[1].name
      );
      expect(scope.transactionToSearchEncounter).toBe(null);
    });
  });

  //resetAccountMemberToDefault
  describe('resetAccountMemberToDefault function ->', function () {
    it("resetAccountMemberToDefault should set selectedAccountMemberOption to default option's patient detailed name", function () {
      createController();
      scope.accountMembersOptions = [
        { patientDetailedName: 'test1' },
        { patientDetailedName: 'test2' },
      ];
      scope.defaultAccountMemberOptionIndex = 0;
      scope.selectedAccountMemberOption =
        scope.accountMembersOptions[1].patientDetailedName;
      scope.resetAccountMemberToDefault(false);
      timeout.flush(100);
      expect(scope.selectedAccountMemberOption).toBe('test1');
    });

    it('resetAccountMemberToDefault should set selectedAccountMemberOption to All Account Members option', function () {
      createController();
      scope.accountMembersOptions = [
        { patientDetailedName: 'test1' },
        { patientDetailedName: 'test2' },
      ];
      scope.defaultAccountMemberOptionIndex = 0;
      scope.selectedAccountMemberOption =
        scope.accountMembersOptions[1].patientDetailedName;
      scope.resetAccountMemberToDefault(true);
      timeout.flush(100);
      expect(scope.selectedAccountMemberOption).toBe('test1');
    });
  });

  //navToAccountSummaryOrTransactionHistory
  it('navToAccountSummaryOrTransactionHistory should set selectedSummaryOption', function () {
    var item = { name: 'test', value: 2 };
    var index = 1;
    listHelper.findItemByFieldValue = jasmine
      .createSpy('listHelper.findItemByFieldValue')
      .and.returnValue(item);
    createController();
    spyOn(scope, 'selectOption');
    scope.accountSummaryOptions = [item];

    scope.navToAccountSummaryOrTransactionHistory(2);

    expect(listHelper.findItemByFieldValue).toHaveBeenCalledWith(
      scope.accountSummaryOptions,
      'value',
      2
    );
    expect(scope.selectedSummaryOption).toBe(item.name);
    expect(scope.selectOption).toHaveBeenCalled();
  });

  //getSummaryOptionByValue
  it('getSummaryOptionByValue should call findItemByFieldValue function of listHelper', function () {
    var item = { name: 'test', value: 1 };
    listHelper.findItemByFieldValue = jasmine
      .createSpy('listHelper.findItemByFieldValue')
      .and.returnValue(item);
    createController();
    var optionValue = 1;
    scope.accountSummaryOptions = [item];

    var result = scope.getSummaryOptionByValue(optionValue);

    expect(listHelper.findItemByFieldValue).toHaveBeenCalledWith(
      scope.accountSummaryOptions,
      'value',
      optionValue
    );
    expect(result).toBe(item);
  });

  // filtering section
  describe('filterFunction function ->', function () {
    var filterObject;

    var resetFilter = function () {
      filterObject = {
        members: [1],
        dateRange: {
          start: '11/10/2015',
          end: '11/12/2015',
        },
        Teeth: [10],
        transactionTypes: [5],
        providers: [2],
      };
    };

    var transaction = {
      AccountMemberId: 1,
      DateEntered: '2015-11-11',
      Tooth: 10,
      TransactionTypeId: 5,
      ProviderUserId: 2,
    };

    var dateFilter = 'toShortDisplayDateUtc';

    beforeEach(inject(function () {
      createController();
      resetFilter();
    }));

    it('should return true if there is a member match', function () {
      expect(scope.filterFunction(transaction, filterObject, dateFilter)).toBe(
        true
      );
    });

    it('should return false if there is not a member match', function () {
      filterObject.members = [2];
      expect(scope.filterFunction(transaction, filterObject, dateFilter)).toBe(
        false
      );
    });

    it('should return true if there is a start date match', function () {
      expect(scope.filterFunction(transaction, filterObject, dateFilter)).toBe(
        true
      );
    });

    it('should return false if there is not a start date match', function () {
      filterObject.dateRange.start = '11/12/2015';
      expect(scope.filterFunction(transaction, filterObject, dateFilter)).toBe(
        false
      );
    });

    it('should return true if there is a end date match', function () {
      expect(scope.filterFunction(transaction, filterObject, dateFilter)).toBe(
        true
      );
    });

    it('should return false if there is not a end date match', function () {
      filterObject.dateRange.start = '11/12/2015';
      expect(scope.filterFunction(transaction, filterObject, dateFilter)).toBe(
        false
      );
    });

    it('should return true if there is a tooth match', function () {
      expect(scope.filterFunction(transaction, filterObject, dateFilter)).toBe(
        true
      );
    });

    it('should return false if there is not a tooth match', function () {
      filterObject.Teeth = [2];
      expect(scope.filterFunction(transaction, filterObject, dateFilter)).toBe(
        false
      );
    });

    it('should return true if there is a transaction type match', function () {
      expect(scope.filterFunction(transaction, filterObject, dateFilter)).toBe(
        true
      );
    });

    it('should return false if there is not a transaction type match', function () {
      filterObject.transactionTypes = [3];
      expect(scope.filterFunction(transaction, filterObject, dateFilter)).toBe(
        false
      );
    });

    it('should return true if there is a provider match', function () {
      expect(scope.filterFunction(transaction, filterObject, dateFilter)).toBe(
        true
      );
    });

    it('should return false if there is not a provider match', function () {
      filterObject.providers = [8];
      expect(scope.filterFunction(transaction, filterObject, dateFilter)).toBe(
        false
      );
    });
  });

  // filtering section
  describe('filtersAreApplied function ->', function () {
    var filterObject;

    var resetFilter = function () {
      filterObject = {
        members: [1],
        dateRange: {
          start: null,
          end: null,
        },
        Teeth: [],
        transactionTypes: [],
        providers: [],
      };
    };

    beforeEach(inject(function () {
      createController();
      resetFilter();
    }));

    it('should return true if the filterObject has changed', function () {
      // members
      filterObject.members.push(2);
      expect(scope.filtersAreApplied(filterObject)).toBe(true);
      resetFilter();
      expect(scope.filtersAreApplied(filterObject)).toBe(false);
      // date
      filterObject.dateRange.start = 'startDate';
      filterObject.dateRange.end = 'endDate';
      expect(scope.filtersAreApplied(filterObject)).toBe(true);
      resetFilter();
      expect(scope.filtersAreApplied(filterObject)).toBe(false);
      // teeth
      filterObject.Teeth.push(1);
      expect(scope.filtersAreApplied(filterObject)).toBe(true);
      resetFilter();
      expect(scope.filtersAreApplied(filterObject)).toBe(false);
      // transactionTypes
      filterObject.transactionTypes.push(1);
      expect(scope.filtersAreApplied(filterObject)).toBe(true);
      resetFilter();
      expect(scope.filtersAreApplied(filterObject)).toBe(false);
      // providers
      filterObject.providers.push(1);
      expect(scope.filtersAreApplied(filterObject)).toBe(true);
      resetFilter();
      expect(scope.filtersAreApplied(filterObject)).toBe(false);
    });

    it('should return false if the filterObject has not changed', function () {
      expect(scope.filtersAreApplied(filterObject)).toBe(false);
    });
  });

  describe('scope.applyFilters ->', function () {
    beforeEach(inject(function () {
      createController();
    }));
    it('should sync shareData selection and broadcast that filters have been applied', function () {
      var initialFilterObject = {
        Statuses: [1],
        members: [1, 2],
        dateRange: Object({ start: null, end: null }),
        Teeth: [],
        transactionTypes: null,
        providers: null,
        locations: null,
        IncludePaidTransactions: true,
        IncludeUnpaidTransactions: true,
        IncludeUnappliedTransactions: true,
        IncludeAppliedTransactions: true,
        IncludeServicesWithOpenClaims: true,
        IncludeAccountNotes: true,
        IncludeDocuments: true,
      };
      spyOn(scope, '$broadcast');
      scope.filterObject.members = [1, 2];
      scope.applyFilters();
      expect(shareData.selectedPatients).toEqual(scope.filterObject.members);
      expect(scope.$broadcast).toHaveBeenCalledWith(
        'apply-account-filters',
        initialFilterObject
      );
    });
  });
});
