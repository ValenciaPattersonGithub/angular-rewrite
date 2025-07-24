describe('PatientAppointmentsTabController tests ->', function () {
  var ctrl,
    mockAccountMembersResponse,
    scope,
    toastrFactory,
    patientValidationFactory,
    patientAppointmentsFactory;

  var mockAppointments = {
    ExtendedStatusCode: null,
    Value: [
      {
        Appointment: {
          AppointmentId: '0efed222-a72d-e611-bbe6-8086f2269c78',
          AppointmentTypeId: 'c9b06a48-ed2c-e611-a111-34e6d703c2d2',
          PersonId: '76282d16-3824-e611-8c66-8086f2269c78',
          TreatmentRoomId: 'c7c03d7e-7c2d-e611-bbe6-8086f2269c78',
          UserId: null,
          Classification: 0,
          Description: null,
          Note: null,
          StartTime: '2016-06-08T15:45:00',
          EndTime: '2016-06-08T17:15:00',
          ActualStartTime: null,
          ActualEndTime: null,
          ProposedDuration: null,
          Status: 2,
          StatusNote: null,
          ReminderMethod: null,
          ExaminingDentist: null,
          IsExamNeeded: true,
          ProviderAppointments: [
            {
              ProviderAppointmentId: '0ffed222-a72d-e611-bbe6-8086f2269c78',
              UserId: 'dceaa433-7c2d-e611-bbe6-8086f2269c78',
              EndTime: '2016-06-08T17:15:00',
              StartTime: '2016-06-08T15:45:00',
              ObjectState: null,
              FailedMessage: null,
              DataTag: '{"RowVersion":"AAAAAAABnhM="}',
              UserModified: '00000000-0000-0000-0000-000000000000',
              DateModified: '2016-06-08T18:30:55.8530121',
            },
          ],
          PlannedServices: [],
          IsDeleted: null,
          DeletedReason: null,
          DataTag: '{"RowVersion":"AAAAAAABnh8="}',
          UserModified: '00000000-0000-0000-0000-000000000000',
          DateModified: '2016-06-08T18:53:23.1657299',
        },
        ContactInformation: null,
        Alerts: null,
        Person: {
          PatientId: '5c116671-811b-e611-9167-8086f2269c78',
          FirstName: 'Grizzly',
          MiddleName: '',
          LastName: 'Adams',
          PreferredName: '',
          Prefix: '',
          Suffix: '',
          AddressLine1: '',
          AddressLine2: '',
          City: '',
          State: '',
          ZipCode: '',
          Sex: '',
          DateOfBirth: null,
          IsPatient: true,
          PatientSince: '2016-06-08T13:15:53.0762064',
          PatientCode: 'ADAGR1',
          EmailAddress: '',
          EmailAddressRemindersOk: false,
          EmailAddress2: '',
          EmailAddress2RemindersOk: false,
          PersonAccount: {
            AccountId: '6133f620-7b2d-e611-bbe6-8086f2269c78',
            PersonId: '6033f620-7b2d-e611-bbe6-8086f2269c78',
            PersonAccountMember: {
              AccountMemberId: '6233f620-7b2d-e611-bbe6-8086f2269c78',
              AccountId: '6133f620-7b2d-e611-bbe6-8086f2269c78',
              ResponsiblePersonId: '6033f620-7b2d-e611-bbe6-8086f2269c78',
              PersonId: '6033f620-7b2d-e611-bbe6-8086f2269c78',
              Balance30: 0,
              Balance60: 0,
              Balance90: 0,
              Balance120: 0,
              BalanceCurrent: 0,
              BalanceInsurance: 0,
              EstimatedInsurance30: 0,
              EstimatedInsurance60: 0,
              EstimatedInsurance90: 0,
              EstimatedInsurance120: 0,
              EstimatedInsuranceCurrent: 0,
              IsActive: true,
              DataTag: '{"RowVersion":"AAAAAAAAZZQ="}',
              UserModified: '00000000-0000-0000-0000-000000000000',
              DateModified: '2016-06-08T13:15:55.0962064',
            },
            DataTag: '{"RowVersion":"AAAAAAAAZZM="}',
            UserModified: '00000000-0000-0000-0000-000000000000',
            DateModified: '2016-06-08T13:15:55.0612064',
          },
          ResponsiblePersonType: 1,
          ResponsiblePersonId: '6033f620-7b2d-e611-bbe6-8086f2269c78',
          IsResponsiblePersonEditable: false,
          PreferredLocation: 4,
          PreferredDentist: '00bee76b-472e-e611-9558-8086f2269c78',
          PreferredHygienist: null,
          DataTag: '{"RowVersion":"AAAAAAAC9dI="}',
          UserModified: '00000000-0000-0000-0000-000000000000',
          DateModified: '2016-06-09T15:48:09.7891921',
        },
        ServiceCodes: [],
        Room: {
          RoomId: 'c7c03d7e-7c2d-e611-bbe6-8086f2269c78',
          LocationId: 4,
          Name: 'Room 1',
          ObjectState: null,
          FailedMessage: null,
          DataTag: '{"RowVersion":"AAAAAAAAZaU="}',
          UserModified: '00000000-0000-0000-0000-000000000000',
          DateModified: '2016-06-08T13:25:40.8529709',
        },
        Location: {
          LocationId: 4,
          NameLine1: 'Effingham',
          NameLine2: null,
          NameAbbreviation: 'Effingham',
          ImageFile: null,
          LogoFile: null,
          Website: null,
          AddressLine1: '123',
          AddressLine2: null,
          City: 'Effingham',
          State: 'IL',
          ZipCode: '62401',
          Email: 'v@gmail.com',
          PrimaryPhone: null,
          SecondaryPhone: null,
          Fax: null,
          TaxId: null,
          TypeTwoNpi: null,
          TaxonomyId: null,
          LicenseNumber: null,
          ProviderTaxRate: null,
          SalesAndUseTaxRate: null,
          DefaultFinanceCharge: null,
          AccountsOverDue: null,
          MinimumFinanceCharge: null,
          Rooms: [
            {
              RoomId: 'c7c03d7e-7c2d-e611-bbe6-8086f2269c78',
              LocationId: 4,
              Name: 'Room 1',
              ObjectState: null,
              FailedMessage: null,
              DataTag: '{"RowVersion":"AAAAAAAAZaU="}',
              UserModified: '00000000-0000-0000-0000-000000000000',
              DateModified: '2016-06-08T13:25:40.8529709',
            },
            {
              RoomId: '1987bfb0-7c2d-e611-bbe6-8086f2269c78',
              LocationId: 4,
              Name: 'Room 2',
              ObjectState: null,
              FailedMessage: null,
              DataTag: '{"RowVersion":"AAAAAAAAZaY="}',
              UserModified: '00000000-0000-0000-0000-000000000000',
              DateModified: '2016-06-08T13:27:05.5895423',
            },
          ],
          DataTag: '{"RowVersion":"AAAAAAAARlU="}',
          UserModified: '00000000-0000-0000-0000-000000000000',
          DateModified: '2016-06-08T02:22:39.0720195',
        },
        AppointmentType: {
          AppointmentTypeId: 'c9b06a48-ed2c-e611-a111-34e6d703c2d2',
          Name: 'Crown Bridge Prep',
          AppointmentTypeColor: '#FFFF00',
          FontColor: '#000000',
          PerformedByProviderTypeId: 2,
          DefaultDuration: 90,
          UsualAmount: null,
          DataTag: '{"RowVersion":"AAAAAAAAJxw="}',
          UserModified: '00000000-0000-0000-0000-000000000000',
          DateModified: '2016-06-07T20:20:35.3971726',
        },
        ProviderUsers: [
          {
            UserId: 'dceaa433-7c2d-e611-bbe6-8086f2269c78',
            FirstName: 'Van',
            MiddleName: null,
            LastName: 'Nostrand',
            PreferredName: null,
            DateOfBirth: null,
            UserName: 'dvn@pattcom.onmicrosoft.com',
            UserCode: 'NOSVA1',
            Color: '#7F7F7F',
            ImageFile: null,
            EmployeeStartDate: null,
            EmployeeEndDate: null,
            Email: 'dvn@gmail.com',
            Address: {
              AddressLine1: null,
              AddressLine2: null,
              City: null,
              State: null,
              ZipCode: null,
            },
            DepartmentId: null,
            JobTitle: null,
            ProviderTypeId: 1,
            ProviderOnClaimsRelationship: 1,
            ProviderOnClaimsId: '00000000-0000-0000-0000-000000000000',
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
            ProfessionalDesignation: null,
            Locations: null,
            Roles: null,
            DataTag: '{"RowVersion":"AAAAAAAAZZ4="}',
            UserModified: '00000000-0000-0000-0000-000000000000',
            DateModified: '2016-06-08T13:23:40.0119293',
          },
        ],
        DataTag: null,
        UserModified: '00000000-0000-0000-0000-000000000000',
        DateModified: '0001-01-01T00:00:00',
      },
    ],
    Count: null,
    InvalidProperties: null,
  };
  mockAccountMembersResponse = {
    ExtendedStatusCode: null,
    Value: [
      {
        PatientId: '76282d16-3824-e611-8c66-8086f2269c78',
        FirstName: 'Jimmy',
        LastName: 'Danson',
        MiddleName: '',
        PreferredName: '',
        SuffixName: '',
        DateOfBirth: null,
        IsPatient: true,
        PhoneNumber: null,
        IsResponsiblePerson: false,
        IsActiveAccountMember: true,
        RelationshipToPolicyHolder: null,
      },
      {
        PatientId: '5c116671-811b-e611-9167-8086f2269c78',
        FirstName: 'Ted',
        LastName: 'Danson',
        MiddleName: '',
        PreferredName: '',
        SuffixName: '',
        DateOfBirth: null,
        IsPatient: true,
        PhoneNumber: null,
        IsResponsiblePerson: true,
        IsActiveAccountMember: true,
        RelationshipToPolicyHolder: null,
      },
    ],
    Count: null,
    InvalidProperties: null,
  };

  var patientHistoryResolve = {
    PersonId: 'ebfa2074-bdcb-487a-8012-b8f5c507c47d',
    Missed: 28,
    Canceled: 10,
    Completed: 1,
  };
  var accountHistoryResolve = [
    {
      PersonId: 'ebfa2074-bdcb-487a-8012-123123123ddd',
      Missed: 28,
      Canceled: 10,
      Completed: 1,
    },
    {
      PersonId: 'ebfa2074-bdcb-487a-8012-456456456ddd',
      Missed: 2,
      Canceled: 1,
      Completed: 3,
    },
    {
      PersonId: 'ebfa2074-bdcb-487a-8012-7879789789dd',
      Missed: 3,
      Canceled: 2,
      Completed: 1,
    },
  ];

  beforeEach(
    module('Soar.Patient', function ($provide) {
      toastrFactory = {};
      toastrFactory.error = jasmine.createSpy();
      toastrFactory.success = jasmine.createSpy();
      $provide.value('toastrFactory', toastrFactory);

      patientAppointmentsFactory = {
        AccountHistory: jasmine.createSpy().and.returnValue({
          then: jasmine.createSpy().and.returnValue(accountHistoryResolve),
        }),
        PatientHistory: jasmine.createSpy().and.returnValue({
          then: jasmine.createSpy().and.returnValue(patientHistoryResolve),
        }),
        access: jasmine.createSpy().and.returnValue({
          View: true,
        }),
      };
      $provide.value('PatientAppointmentsFactory', patientAppointmentsFactory);

      patientValidationFactory = {
        ObservePatientData: jasmine.createSpy().and.returnValue({
          then: jasmine.createSpy(),
        }),
        GetPatientData: jasmine.createSpy().and.returnValue({
          then: jasmine.createSpy(),
        }),
        CheckPatientLocation: jasmine.createSpy().and.returnValue({
          then: jasmine.createSpy(),
        }),
        PatientSearchValidation: jasmine.createSpy().and.returnValue({
          then: jasmine.createSpy().and.returnValue({
            authorization: {
              UserIsAuthorizedToAtLeastOnePatientLocation: false,
            },
          }),
        }),
        LaunchPatientLocationErrorModal: jasmine.createSpy(),
      };
      $provide.value('PatientValidationFactory', patientValidationFactory);

      $provide.value('PatientPreventiveCareFactory', {
        GetAllServicesDueForAccount: jasmine.createSpy().and.returnValue(new Promise(resolve => resolve()))
      });
    })
  );

  beforeEach(inject(function ($rootScope, $controller) {
    scope = $rootScope.$new();
    ctrl = $controller('PatientAppointmentsTabController', {
      $scope: scope,
    });
    scope.patient = {};
    scope.patient.Data = {};
    scope.patient.Data.PatientId = 0;
    ctrl.$onInit();
  }));

  describe('createCustomProperties function -> ', function () {
    it('should add custom properties to member', function () {
      scope.allAccountMembers = angular.copy(mockAccountMembersResponse.Value);
      ctrl.createCustomProperties();
      angular.forEach(scope.allAccountMembers, function (item, $index) {
        if ($index === 0) {
          expect(item.$$DisplayName).toBe('Jimmy Danson');
          expect(item.$$HealthPanelTitle).toBe("Jimmy's History");
          expect(item.$$PrevCarePanelTitle).toBe("Jimmy's Preventive Care");
          expect(item.$$PatientSince).toBe('');
        }
      });
    });
  });

  describe('getAccountMembersSuccess function -> ', function () {
    it('should set allAccountMembers to api response', function () {
      scope.allAccountMembers = [];
      ctrl.getAccountMembersSuccess(angular.copy(mockAccountMembersResponse));
      expect(scope.allAccountMembers[1].FirstName).toBe('Jimmy');
      expect(scope.allAccountMembers[2].FirstName).toBe('Ted');
    });

    it('should add all account members to the list', function () {
      scope.allAccountMembers = [];
      ctrl.getAccountMembersSuccess(angular.copy(mockAccountMembersResponse));
      expect(scope.allAccountMembers[0].$$DisplayName).toBe(
        'All Account Members'
      );
    });

    it('should call ctrl.setMemberTitles', function () {
      spyOn(ctrl, 'setMemberTitles');
      scope.allAccountMembers = [];
      ctrl.getAccountMembersSuccess(angular.copy(mockAccountMembersResponse));
      expect(ctrl.setMemberTitles).toHaveBeenCalled();
    });
  });

  describe('setVisibleFlags function -> ', function () {
    it('should set all to $$Visible true if no patientId is passed', function () {
      scope.allAccountMembers = angular.copy(mockAccountMembersResponse.Value);
      ctrl.setVisibleFlags();
      angular.forEach(scope.allAccountMembers, function (item) {
        expect(item.$$Visible).toBe(true);
      });
    });

    it('should set only member with matching patientId to $$Visible true', function () {
      scope.allAccountMembers = angular.copy(mockAccountMembersResponse.Value);
      ctrl.setVisibleFlags('76282d16-3824-e611-8c66-8086f2269c78');
      expect(scope.allAccountMembers[0].$$Visible).toBe(true);
      expect(scope.allAccountMembers[1].$$Visible).toBe(false);
    });
  });

  describe('accountMemberSelected function -> ', function () {
    beforeEach(function () {
      spyOn(scope, 'validateAccountMember').and.returnValue(true);
    });

    it('should set $scope.patient.Data.PatientId to zero if all account members is selected', function () {
      ctrl.getAccountMembersSuccess(angular.copy(mockAccountMembersResponse));
      scope.accountMemberSelected(scope.allAccountMembers[0]);
      expect(scope.patientCopy.Data.PatientId).toBe(0);
      expect(scope.patientCopy.Data.$$DisplayName).toBe('All Account Members');
    });

    it('should set showAllAccountMembers to true if all account members is selected', function () {
      ctrl.getAccountMembersSuccess(angular.copy(mockAccountMembersResponse));
      scope.accountMemberSelected(scope.allAccountMembers[0]);
      expect(scope.showAllAccountMembers).toBe(true);
    });

    it('should set $scope.patient.Data.PatientId to patientId when patient is selected', function () {
      ctrl.getAccountMembersSuccess(angular.copy(mockAccountMembersResponse));
      scope.accountMemberSelected(scope.allAccountMembers[2]);
      expect(scope.patientCopy.Data.PatientId).toBe(
        '5c116671-811b-e611-9167-8086f2269c78'
      );
      expect(scope.patientCopy.Data.$$DisplayName).toBe('Ted Danson');
    });

    it('should showAllAccountMembers to false when patient is selected', function () {
      ctrl.getAccountMembersSuccess(angular.copy(mockAccountMembersResponse));
      scope.accountMemberSelected(scope.allAccountMembers[2]);
      expect(scope.showAllAccountMembers).toBe(false);
    });

    it('should showAllAccountMembers to false when patient is selected', function () {
      spyOn(ctrl, 'getAppointmentsHistory');
      ctrl.getAccountMembersSuccess(angular.copy(mockAccountMembersResponse));
      scope.accountMemberSelected(scope.allAccountMembers[2]);
      expect(ctrl.getAppointmentsHistory).toHaveBeenCalled();
    });
  });

  describe('titleUpdated function -> ', function () {
    it('should set $$PatientSince to patientSince param', function () {
      ctrl.getAccountMembersSuccess(angular.copy(mockAccountMembersResponse));
      scope.titleUpdated('76282d16-3824-e611-8c66-8086f2269c78', '1967');
      expect(scope.allAccountMembers[1].$$PatientSince).toBe('1967');
      ctrl.getAccountMembersSuccess(angular.copy(mockAccountMembersResponse));
      scope.titleUpdated('bad', '1967');
      expect(scope.allAccountMembers[0].$$PatientSince).toBeUndefined();
      expect(scope.allAccountMembers[1].$$PatientSince).toBe('');
      expect(scope.allAccountMembers[2].$$PatientSince).toBe('');
    });
  });

  describe('validateAccountMember function -> ', function () {
    it('should call the patient validation factory', function () {
      scope.validateAccountMember(mockAccountMembersResponse.Value[0]);
      expect(
        patientValidationFactory.PatientSearchValidation
      ).toHaveBeenCalledWith(mockAccountMembersResponse.Value[0]);
    });
  });

  describe('appointmentRetrievalSuccess function -> ', function () {
    it('should call ctrl.setMemberTitles', function () {
      spyOn(ctrl, 'setMemberTitles');
      ctrl.appointmentRetrievalSuccess({});
      expect(ctrl.setMemberTitles).toHaveBeenCalled();
    });
  });

  describe('setMemberTitles function -> ', function () {
    beforeEach(function () {
      scope.allAccountMembers = angular.copy(mockAccountMembersResponse.Value);
      scope.appointments = angular.copy(mockAppointments.Value);
    });
    it('should set accountMember.PatientSince to full year of most recent appointment if appointments', function () {
      angular.forEach(scope.appointments, function (appointment) {
        appointment.Person.PatientId = scope.allAccountMembers[0].PatientId;
      });
      ctrl.setMemberTitles();
      expect(scope.allAccountMembers[0].$$PatientSince).toEqual(
        new Date(scope.appointments[0].Person.PatientSince).getFullYear()
      );
    });

    it('should set accountMember.PatientSince to undefined if no appointment for the patient', function () {
      angular.forEach(scope.appointments, function (appointment) {
        appointment.Person.PatientId = '123466655';
      });
      ctrl.setMemberTitles();
      angular.forEach(scope.allAccountMembers, function (accountMember) {
        expect(accountMember.$$PatientSince).toEqual(undefined);
      });
    });
  });

  describe('getAppointmentsHistory function -> ', function () {
    it('should call patientAppointmentsFactory.PatientHistory if scope.showAllAccountMembers', function () {
      scope.access.View = true;
      scope.patientCopy.Data.PatientId = '123456';
      scope.showAllAccountMembers = false;
      ctrl.getAppointmentsHistory();
      expect(patientAppointmentsFactory.PatientHistory).toHaveBeenCalledWith(
        scope.patientCopy.Data.PatientId
      );
    });

    it('should call patientAppointmentsFactory.AccountHistory if scope.showAllAccountMembers is false', function () {
      scope.access.View = true;
      scope.accountId = '123456';
      scope.showAllAccountMembers = true;
      ctrl.getAppointmentsHistory();
      expect(patientAppointmentsFactory.AccountHistory).toHaveBeenCalledWith(
        '123456'
      );
    });
  });
  describe('appointmentRetrievalSuccess function -> ', function () {
    it('should call ctrl.setMemberTitles', function () {
      spyOn(ctrl, 'setMemberTitles');
      ctrl.appointmentRetrievalSuccess({});
      expect(ctrl.setMemberTitles).toHaveBeenCalled();
    });
  });

  describe('setPatientAppointmentsTitle function -> ', function () {
    it('should return the correct title based on member data', function () {
      const mockMemberData = {
        $$HealthPanelTitle: "John's History",
        $$PatientSince: '2000',
      };
      const title = scope.setPatientAppointmentsTitle(mockMemberData);
      expect(title).toBe("John's History - Patient since 2000");
    });
  });
});
