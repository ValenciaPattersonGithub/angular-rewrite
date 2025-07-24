describe('patient-personal-info -> ', function () {
  var scope,
    routeParams,
    ctrl,
    patientServices,
    personServices,
    toastrFactory,
    element,
    compile,
    modalFactory;

  // #region mocks

  var appointmentService;

  beforeEach(
    module('Soar.Patient', function ($provide) {
      appointmentService = {};
      $provide.value('AppointmentService', appointmentService);
    })
  );

  var mockPerson = {
    Value: {
      Profile: {
        PatientId: '82b0cf7c-7c6b-42ed-90c9-fc181189fe73',
        FirstName: 'sample string 2',
        MiddleName: 'sample string 3',
        LastName: 'sample string 4',
        PreferredName: 'sample string 5',
        Prefix: 'sample string 6',
        Suffix: 'sample string 7',
        AddressLine1: 'sample string 8',
        AddressLine2: 'sample string 9',
        City: 'sample string 10',
        State: 'sample string 11',
        ZipCode: 'sample string 12',
        Sex: 'sample string 13',
        DateOfBirth: '2015-09-14T12:26:53.6210549-05:00',
        IsActive: true,
        IsPatient: true,
        PatientCode: 'sample string 15',
        EmailAddress: 'sample string 16',
        EmailAddress2: 'sample string 17',
        PersonAccount: {
          AccountId: '019178da-ca11-448f-8b92-9299f4706ac1',
          PersonId: '44926558-42b5-401f-9cf7-2cfbaa6e677d',
          PersonAccountMember: {
            AccountMemberId: '4a255241-16cc-43b0-be52-acb69aeb24c4',
            AccountId: '437375ae-c84e-4860-bca8-3d3f50b0bbae',
            ResponsiblePersonId: '848ed9e1-b119-4e77-8dee-27c1d4758b83',
            PersonId: '0f1d8974-e976-4543-b330-645b787e65a6',
            Balance30: 3.1,
            Balance60: 4.1,
            Balance90: 5.1,
            Balance120: 6.1,
            BalanceCurrent: 7.1,
            BalanceInsurance: 8.1,
            IsActive: true,
            DataTag: 'sample string 10',
            UserModified: 'd0d0f259-47eb-4d3e-bdff-6745a75880c4',
            DateModified: '2015-09-14T12:26:53.6230551-05:00',
          },
          DataTag: 'sample string 3',
          UserModified: '2bddf581-c436-4880-ace0-c847bcbc948f',
          DateModified: '2015-09-14T12:26:53.6230551-05:00',
        },
        ResponsiblePersonType: 1,
        ResponsiblePersonId: '792512d8-fa96-4b75-bf04-fc5c793904c4',
        PreferredLocation: 1,
        PreferredDentist: 'edfc5b3d-fbc0-47c9-9555-cf3d18f86e5a',
        PreferredHygienist: '4f61ec9f-3cc3-42d4-a6a6-780e8a668743',
        DataTag: 'sample string 18',
        UserModified: 'a46e3ff3-37bf-4ccb-9141-977f68c1a367',
        DateModified: '2015-09-14T12:26:53.6240552-05:00',
      },
      Phones: [
        {
          PatientId: '173d9b09-6636-4a8e-98a2-aae6ac97d072',
          ContactId: 'dffb0682-d83e-4612-91ba-1235fc78e4a2',
          PhoneNumber: 'sample string 3',
          Type: 'sample string 4',
          TextOk: true,
          Notes: 'sample string 6',
          ObjectState: 'sample string 7',
          FailedMessage: 'sample string 8',
          DataTag: 'sample string 9',
          UserModified: '23881c3f-b690-4dc8-8b1f-c45e682540e6',
          DateModified: '2015-09-14T12:26:53.6250553-05:00',
        },
        {
          PatientId: '173d9b09-6636-4a8e-98a2-aae6ac97d072',
          ContactId: 'dffb0682-d83e-4612-91ba-1235fc78e4a2',
          PhoneNumber: 'sample string 3',
          Type: 'sample string 4',
          TextOk: true,
          Notes: 'sample string 6',
          ObjectState: 'sample string 7',
          FailedMessage: 'sample string 8',
          DataTag: 'sample string 9',
          UserModified: '23881c3f-b690-4dc8-8b1f-c45e682540e6',
          DateModified: '2015-09-14T12:26:53.6250553-05:00',
        },
      ],
    },
  };

  var mockStateList = [
    {
      StateName: 'Alabama',
      StateId: 'AL',
    },

    {
      StateName: 'Alaska',
      StateId: 'AK',
    },
    {
      StateName: 'Arizona',
      StateId: 'AZ',
    },
    {
      StateName: 'Arkansas',
      StateId: 'AR',
    },
  ];

  mockStateList.getStateName = jasmine
    .createSpy()
    .and.returnValue(mockStateList[1].StateName);

  var mockStaticData = {
    States: jasmine.createSpy().and.returnValue(mockStateList),
  };

  // mock for boundObjectFactory
  var mockBoundObjectFactory = {
    Create: jasmine.createSpy().and.returnValue({
      AfterDeleteSuccess: null,
      AfterSaveError: null,
      AfterSaveSuccess: null,
      Data: {},
      Deleting: false,
      IdField: 'ServiceCodeId',
      Loading: true,
      Name: 'ServiceCode',
      Saving: false,
      Valid: true,
      Load: jasmine.any(Function),
      Save: jasmine.createSpy().and.returnValue(''),
      Validate: jasmine.createSpy().and.returnValue(''),
      CheckDuplicate: jasmine.createSpy().and.returnValue(''),
    }),
  };

  // #endregion Mock values

  // #region PatientPersonalInfoController
  describe('PatientPersonalInfoController when user is authorized -> ', function () {
    //#region service spies
    beforeEach(module('Soar.Common'));
    beforeEach(module('common.factories'));

    beforeEach(
      module('Soar.Patient', function ($provide) {
        toastrFactory = {};
        toastrFactory.error = jasmine.createSpy();
        toastrFactory.success = jasmine.createSpy();
        $provide.value('toastrFactory', toastrFactory);

        patientServices = {
          Patients: {
            get: jasmine.createSpy().and.returnValue(mockPerson),
          },
        };
        $provide.value('PatientServices', patientServices);

        personServices = {
          Persons: {
            get: jasmine.createSpy().and.returnValue(mockPerson),
            update: jasmine.createSpy().and.returnValue(mockPerson),
            getIsPatientPropertyMutability: jasmine.createSpy(),
          },
        };
        $provide.value('PersonServices', personServices);
        $provide.value('PatientAppointmentsFactory', {});
        $provide.value('PersonFactory', {});
      })
    );

    //#endregion

    beforeEach(inject(function (
      $route,
      $rootScope,
      $location,
      $routeParams,
      $injector,
      $controller,
      $compile,
      $q
    ) {
      //mock of ModalFactory
      modalFactory = {
        ConfirmModal: jasmine
          .createSpy('modalFactory.ConfirmModal')
          .and.callFake(function () {
            var modalFactoryDeferred = $q.defer();
            modalFactoryDeferred.resolve(1);
            return {
              result: modalFactoryDeferred.promise,
              then: function () {},
            };
          }),
      };
      compile = $compile;
      routeParams = $routeParams;
      routeParams.patientId = 1;
      scope = $rootScope.$new();
      scope.patientData = mockPerson.Value.Profile;
      scope.patientData.defaultExpandedPanel = '';
      scope.personalInfo = angular.copy(mockPerson.Value);
      ctrl = $controller('PatientPersonalInfoController', {
        $scope: scope,
        patSecurityService: _authPatSecurityService_,
        StaticData: mockStaticData,
        PersonServices: personServices,
        PatientServices: patientServices,
        BoundObjectFactory: mockBoundObjectFactory,
        ModalFactory: modalFactory,
      });
    }));

    describe('intitial setup -> ', function () {
      it('check if controller exists', function () {
        expect(ctrl).not.toBeNull();
      });

      it('should have injected services ', function () {
        expect(personServices).not.toBeNull();
        expect(patientServices).not.toBeNull();
        expect(mockBoundObjectFactory).not.toBeNull();
      });

      it('should set scope properties', function () {
        expect(scope.dataHasChanges).toBe(false);
        expect(scope.responsiblePerson).toBe(null);
        expect(scope.attemptedSave).toBe(false);
        expect(scope.validResponsiblePerson).toBe(true);
        expect(scope.disableResponsibleParty).toBe(false);
        expect(scope.validPhones).toBe(true);
        expect(scope.loading).toBe(false);
      });
    });

    describe('getPerson function -> ', function () {
      it('should call personServices.Persons.get', function () {
        scope.patientData.PatientId = 1;
        scope.getPerson();
        expect(personServices.Persons.get).toHaveBeenCalled();
      });
    });

    describe('PersonServicesGetSuccess function -> ', function () {
      it('should call set personalInfo', function () {
        ctrl.PersonServicesGetSuccess(mockPerson);
        expect(scope.personalInfo).toEqual(mockPerson.Value);
        expect(scope.original).toEqual(scope.personalInfo);
        expect(scope.dataHasChanges).toEqual(false);
        expect(scope.loading).toEqual(false);
        //$scope.$emit('personal-info-changed', $scope.dataHasChanges);
      });
    });

    describe('copyPersonToPatient function -> ', function () {
      it('should copy person object to patient object', function () {
        scope.personalInfo = mockPerson.Value;
        ctrl.copyPersonToPatient(scope.personalInfo, scope.patientData);
        expect(scope.patientData.DataTag).toEqual(
          scope.personalInfo.Profile.DataTag
        );
        expect(scope.patientData.PatientId).toEqual(
          scope.personalInfo.Profile.PatientId
        );
        expect(scope.patientData.FirstName).toEqual(
          scope.personalInfo.Profile.FirstName
        );
      });
    });

    describe('checkForDefaultFocus function -> ', function () {
      it('should set focus based on route params', function () {
        routeParams.panel = 'PI_RP';
        ctrl.checkForDefaultFocus();
        expect(scope.defaultFocusOnFirstName).toBe(false);
        expect(scope.defaultFocusOnRespParty).toBe(true);
        expect(scope.defaultExpandedPanel).toEqual('PI_RP');
      });

      it('should set focus based on route params', function () {
        routeParams.panel = '';
        ctrl.checkForDefaultFocus();
        expect(scope.defaultFocusOnFirstName).toBe(true);
        expect(scope.defaultFocusOnRespParty).toBe(false);
      });
    });

    describe('patientData.defaultExpandedPanel $watch -> ', function () {
      it('should set defaultFocusOnFirstName on change', function () {
        scope.patientData.defaultExpandedPanel = '';
        scope.$apply();
        scope.patientData.defaultExpandedPanel = 'PI_RP';
        scope.$apply();
        expect(scope.defaultFocusOnFirstName).toBe(false);
        expect(scope.defaultFocusOnRespParty).toBe(true);
      });
    });

    //TODo figure out how to mock event.target.value
    //describe('uncheckedSex function -> ', function () {
    //    it('should set sex to null', function () {
    //        var e = { event: { target: '#inpSexMale' }, temp: { Sex: '' } };
    //        scope.personalInfo = mockPerson.Value;
    //        scope.personalInfo.Profile.Sex = 'M';
    //        scope.uncheckedSex(e);
    //        expect(scope.personalInfo.Profile.Sex).toEqual(null);
    //    });
    //});

    describe('editing $watch -> ', function () {
      it('should call getPerson when editing changes', function () {
        spyOn(scope, 'getPerson');
        scope.editing = false;
        scope.$apply();
        scope.editing = true;
        scope.$apply();
        expect(scope.getPerson).toHaveBeenCalled();
      });
    });

    describe('validValue function -> ', function () {
      it('should set non defined value to null', function () {
        scope.editing = undefined;
        var retn = ctrl.validValue(scope.editing);
        expect(retn).toEqual(null);
      });
    });

    //describe('saveFunction function -> ', function () {

    //    it('should call personServices.Persons.update if scope.valid', function () {
    //        scope.personalInfo = mockPerson.Value;
    //        loadHtml();
    //        scope.$apply();
    //        dump(element)
    //        scope.saveFunction();
    //        expect(personServices.Persons.update).toHaveBeenCalled();
    //    });
    //});

    describe('savePersonalInfoSuccess function -> ', function () {
      it('should set non defined value to null', function () {
        var person = angular.copy(mockPerson);
        ctrl.savePersonalInfoSuccess(person);
        expect(scope.personalInfo).toEqual(person.Value);
        expect(scope.personalInfo.Updated).toBe(true);
        expect(scope.original).toEqual(scope.personalInfo);
        expect(scope.dataHasChanges).toBe(false);
        expect(scope.patientData.Updated).toBe(true);
        expect(scope.editing).toBe(false);
      });

      it('should call syncPhonesAfterSave', function () {
        spyOn(scope, 'syncPhonesAfterSave');
        var person = angular.copy(mockPerson);
        ctrl.savePersonalInfoSuccess(person);
        expect(scope.syncPhonesAfterSave).toHaveBeenCalled();
      });

      it('should call copyPersonToPatient', function () {
        spyOn(ctrl, 'copyPersonToPatient');
        var person = angular.copy(mockPerson);
        ctrl.savePersonalInfoSuccess(person);
        expect(ctrl.copyPersonToPatient).toHaveBeenCalled();
      });

      //TODO fix text
      //it('should broadcast soar:responsible-person-assigned event with personalInfo.Profile', function () {
      //    scope.$broadcast = jasmine.createSpy();
      //    var person = angular.copy(mockPerson);
      //    person.Value.Profile.ResponsiblePersonId = '123';
      //    person.Value.Profile.ResponsiblePersonType = 1;

      //    ctrl.savePersonalInfoSuccess(person);
      //    expect(scope.personalInfo).toEqual(person.Value);
      //    expect(scope.$broadcast).toHaveBeenCalledWith('soar:responsible-person-assigned', scope.personalInfo.Profile);
      //});
    });

    describe('savePersonalInfoFailure function -> ', function () {
      it('should call toastr', function () {
        scope.savePersonalInfoFailure();
        expect(toastrFactory.error).toHaveBeenCalled();
      });
    });

    describe('personalInfo.Profile.ResponsiblePersonId $watch -> ', function () {
      it('should set ResponsiblePersonId', function () {
        ctrl.PersonServicesGetSuccess(mockPerson);
        expect(scope.personalInfo).toEqual(mockPerson.Value);
        scope.defaultExpandedPanel = 'PI_RP';
        scope.personalInfo.Profile.ResponsiblePersonId = null;
        scope.$apply();
        scope.personalInfo.Profile.ResponsiblePersonId = '11';
        scope.$apply();
        expect(
          scope.personalInfo.Profile.PersonAccount.PersonAccountMember
            .ResponsiblePersonId
        ).toEqual(scope.personalInfo.Profile.ResponsiblePersonId);
        expect(
          scope.personalInfo.Profile.PersonAccount.PersonAccountMember
            .ResponsiblePersonType
        ).toEqual(scope.personalInfo.Profile.ResponsiblePersonType);
      });
    });

    //TODO finish this test
    describe('syncPhonesAfterSave function -> ', function () {
      it('should set successful saveState to None', function () {});
    });

    describe('hasDataChanged function -> ', function () {
      it('should set emit personal-info-changed with false if data unchanged', function () {
        scope.editing = false;
        spyOn(scope, '$emit');
        ctrl.PersonServicesGetSuccess(mockPerson);
        expect(scope.personalInfo).toEqual(mockPerson.Value);
        expect(scope.original).toEqual(mockPerson.Value);
        scope.hasDataChanged();
        expect(scope.dataHasChanges).toBe(false);
        expect(scope.$emit).toHaveBeenCalledWith(
          'personal-info-changed',
          false
        );
      });

      it('should set emit personal-info-changed with true if data changed', function () {
        scope.editing = true;
        spyOn(scope, '$emit');
        ctrl.PersonServicesGetSuccess(mockPerson);
        expect(scope.personalInfo).toEqual(mockPerson.Value);
        expect(scope.original).toEqual(mockPerson.Value);
        scope.personalInfo.Profile.FirstName = 'Bob';
        scope.hasDataChanged();
        expect(scope.dataHasChanges).toBe(true);
        expect(scope.$emit).toHaveBeenCalledWith('personal-info-changed', true);
      });
    });

    describe('buildStatusChangeModal function -> ', function () {
      it('should launch decision modal if IsActive equals true and they have permission to update it', function () {
        ctrl.buildStatusChangeModal();
        expect(modalFactory.ConfirmModal).toHaveBeenCalledWith(
          'Patient Status Change',
          'Bob (sample string 5) s. sample string 4, sample string 7 has scheduled or unscheduled appointments or has received treatment and cannot be marked as a non-patient, would you like to inactivate this patient instead?',
          'Yes',
          'No'
        );
      });

      it("should launch warning modal if IsActive is already false or they don't have permission", function () {
        scope.personalInfo.Profile.IsActive = false;
        ctrl.buildStatusChangeModal();
        expect(modalFactory.ConfirmModal).toHaveBeenCalledWith(
          'Patient Status Change',
          'Bob (sample string 5) s. sample string 4, sample string 7 has scheduled or unscheduled appointments or has received treatment and cannot be marked as a non-patient.',
          'OK'
        );
      });
    });

    describe('buildStatusChangeModal function -> ', function () {
      it('should call personServices.Persons.getIsPatientPropertyMutability if IsPatient is false', function () {
        scope.personalInfo.Profile.IsPatient = false;
        scope.isPatientBooleanChanged();
        expect(
          personServices.Persons.getIsPatientPropertyMutability
        ).toHaveBeenCalled();
      });

      it('should do nothing if IsPatient is true', function () {
        scope.personalInfo.Profile.IsPatient = true;
        scope.isPatientBooleanChanged();
        expect(
          personServices.Persons.getIsPatientPropertyMutability
        ).not.toHaveBeenCalled();
      });
    });
  });
});
