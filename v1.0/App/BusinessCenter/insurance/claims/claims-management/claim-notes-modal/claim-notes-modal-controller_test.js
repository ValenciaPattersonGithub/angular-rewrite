describe('claim-notes-modal', function () {
  var ctrl,
    scope,
    mInstance,
    location,
    localize,
    toastrFactory,
    claimSubmissionResultsDto,
    patientServices,
    personServices,
    deferred,
    modalFactory,
    q,
    timeZoneFactory;

  beforeEach(module('Soar.Patient'));
  beforeEach(module('Soar.BusinessCenter'));

  beforeEach(inject(function (
    $rootScope,
    $controller,
    $injector,
    $compile,
    $q
  ) {
    q = $q;
    deferred = q.defer();
    scope = $rootScope.$new();

    //mock for localize
    localize = {
      getLocalizedString: jasmine.createSpy().and.returnValue(''),
    };

    modalFactory = {
      ConfirmModal: jasmine.createSpy().and.returnValue({
        then: jasmine.createSpy().and.callFake(function () {
          patientServices.ClaimNotes.delete();
        }),
      }),
    };

    claimSubmissionResultsDto = {
      InvalidClaims: [{}],
      ValidClaims: [{}],
      LocationId: 1,
    };

    // mock patientServices
    patientServices = {
      ClaimNotes: {
        GetClaimNotesByClaimId: jasmine
          .createSpy('patientServices.ClaimNotes.GetClaimNotesByClaimId')
          .and.returnValue({ $promise: deferred.promise }),
        delete: jasmine
          .createSpy('patientServices.ClaimNotes.delete')
          .and.returnValue({ $promise: deferred.promise }),
        get: jasmine
          .createSpy('patientServices.ClaimNotes.get')
          .and.returnValue({ $promise: deferred.promise }),
      },
      PatientBenefitPlan: {
        getPatientBenefitPlansByAccountId: jasmine
          .createSpy(
            'patientServices.PatientBenefitPlan.getPatientBenefitPlansByAccountId'
          )
          .and.returnValue({ $promise: deferred.promise }),
        getPatientBenefitPlansByPatientId: jasmine
          .createSpy(
            'patientServices.PatientBenefitPlan.getPatientBenefitPlansByPatientId'
          )
          .and.returnValue({ $promise: deferred.promise }),
      },
      Claim: {
        getServiceTransactionForClaim: jasmine
          .createSpy('patientServices.Claim.getServiceTransactionForClaim')
          .and.returnValue({ $promise: deferred.promise }),
      },
    };

    // mock personServices
    personServices = {
      Persons: {
        get: jasmine
          .createSpy('patientServices.ClaimNotes.get')
          .and.returnValue({ $promise: deferred.promise }),
      },
    };

    //mock for location
    location = {
      path: 'path/',
      $$path: {
        substr: jasmine.createSpy(),
        indexOf: jasmine.createSpy(),
      },
    };

    //mock for toastrFactory
    toastrFactory = {
      success: jasmine.createSpy(),
      error: jasmine.createSpy(),
    };

    //mock uibModalInstance
    mInstance = {
      close: jasmine.createSpy(),
      dismiss: jasmine.createSpy(),
    };

    timeZoneFactory = {
      ConvertDateToMomentTZ: jasmine
        .createSpy('mockTimeZoneFactory.ConvertDateToMomentTZ')
        .and.callFake(function (date) {
          return date;
        }),
    };

    //mock controller
    ctrl = $controller('ClaimNotesModalController', {
      $scope: scope,
      $location: location,
      $uibModalInstance: mInstance,
      claimSubmissionResultsDto: claimSubmissionResultsDto,
      toastrFactory: toastrFactory,
      localize: localize,
      PatientServices: patientServices,
      PersonServices: personServices,
      ModalFactory: modalFactory,
      TimeZoneFactory: timeZoneFactory,
    });
  }));

  describe('initial values -> ', function () {
    it('controller should exist', function () {
      expect(ctrl).not.toBeNull();
    });

    it('personServices.Persons.get should be called', function () {
      ctrl.loadPersonInfo(123);
      expect(personServices.Persons.get).toHaveBeenCalled();
    });

    it('patientServices.PatientBenefitPlan.getPatientBenefitPlansByPatientId should be called', function () {
      ctrl.loadBenifitPlan(123);
      expect(
        patientServices.PatientBenefitPlan.getPatientBenefitPlansByPatientId
      ).toHaveBeenCalled();
    });

    it('patientServices.Claim.getServiceTransactions should be called', function () {
      ctrl.loadServiceTransactions();
      expect(
        patientServices.Claim.getServiceTransactionForClaim
      ).toHaveBeenCalled();
    });
  });

  describe('scope.close -> ', function () {
    it('mInstance.dismiss should be called', function () {
      scope.close();
      expect(mInstance.close).toHaveBeenCalled();
    });
  });

  describe('scope.delete -> ', function () {
    it('patientServices.ClaimNotes.delete should be called', function () {
      var note = {
        claimNoteId: 1,
        Type: 2,
      };
      scope.delete(note);
      expect(patientServices.ClaimNotes.delete).toHaveBeenCalled();
      expect(
        patientServices.ClaimNotes.GetClaimNotesByClaimId
      ).toHaveBeenCalled();
    });
  });

  describe('ctrl.getClaimNoteHistory ->', function () {
    it('should call GetClaimNotesByClaimId', function () {
      ctrl.getClaimNoteHistory();
      expect(
        patientServices.ClaimNotes.GetClaimNotesByClaimId
      ).toHaveBeenCalled();
    });
  });

  describe('ctrl.getClaimNoteHistorySuccess ->', function () {
    it('should create and format display date based on timezone', function () {
      claimSubmissionResultsDto.LocationId = 1;
      ctrl.locations = [
        { LocationId: 1, Timezone: 'Central' },
        { LocationId: 2, Timezone: 'Mountain' },
      ];
      var date = moment(new Date());
      var res = { Value: [{ CreatedDate: date }] };
      ctrl.getClaimNoteHistorySuccess(res);
      expect(timeZoneFactory.ConvertDateToMomentTZ).toHaveBeenCalled();
      expect(res.Value[0].displayDate).toBe(date.format('MM/DD/YYYY'));
      expect(res.Value[0].CreatedDate).toBe(date);
    });
    it('should create and format display date if location not found', function () {
      claimSubmissionResultsDto.LocationId = 1;
      ctrl.locations = [{ LocationId: 2, Timezone: 'Mountain' }];
      var date = new Date();
      var dateMoment = moment(date);
      var res = { Value: [{ CreatedDate: date }] };
      ctrl.getClaimNoteHistorySuccess(res);
      expect(timeZoneFactory.ConvertDateToMomentTZ).not.toHaveBeenCalled();
      expect(res.Value[0].displayDate).toBe(dateMoment.format('MM/DD/YYYY'));
      expect(res.Value[0].CreatedDate).toBe(date);
    });
  });

  describe('scope.getTotal', function () {
    it('should return totals of a column', function () {
      scope.serviceTransactions = [
        { id: 1, charge: 100.0 },
        { id: 1, charge: 200.0 },
        { id: 1, charge: 300.0 },
      ];
      var result = scope.getTotal('charge');
      expect(result).toEqual((600).toFixed(2));
    });
  });

  describe('ctrl.calculateIndividualAnnualMaxRemaining ->', () => {
    it('should return correct amount when AnnualBenefitMaxPerIndividual is greater than zero', () => {
      let patientBenefitPlanDto = {
        PolicyHolderBenefitPlanDto: {
          BenefitPlanDto: {
            AnnualBenefitMaxPerIndividual: 1000,
          },
        },
        AdditionalBenefits: 300,
        IndividualMaxUsed: 500,
      };

      let result = ctrl.calculateIndividualAnnualMaxRemaining(
        patientBenefitPlanDto
      );

      expect(result).toBe(800);
    });

    it('should return zero when AnnualBenefitMaxPerIndividual is not greater than zero', () => {
      let patientBenefitPlanDto = {
        PolicyHolderBenefitPlanDto: {
          BenefitPlanDto: {
            AnnualBenefitMaxPerIndividual: 0,
          },
        },
        AdditionalBenefits: 300,
        IndividualMaxUsed: 500,
      };

      let result = ctrl.calculateIndividualAnnualMaxRemaining(
        patientBenefitPlanDto
      );

      expect(result).toBe(0);
    });
  });
});
