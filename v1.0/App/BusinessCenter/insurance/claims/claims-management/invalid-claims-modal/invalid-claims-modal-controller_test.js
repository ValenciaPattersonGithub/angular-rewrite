describe('invalid-claims-modal', function () {
  var ctrl,
    scope,
    location,
    localize,
    mInstance,
    claimSubmissionResultsDto,
    claimStatusDtos,
    validateClaimMessagesFactory,
    compile,
    patientServiceMock,
    tabLauncher,
    mockFeatureFlagService,
    mockFuseFlag,
    mockModalFactory,
    toastrFactory;

  beforeEach(module('Soar.Patient'));
  beforeEach(
    module('Soar.BusinessCenter', function ($provide) {
      patientServiceMock = {
        ClaimsAndPredeterminations: {
          submit: jasmine.createSpy(),
        },
      };
      $provide.value('PatientServices', patientServiceMock);

      validateClaimMessagesFactory = {
        SetupMessages: jasmine
          .createSpy()
          .and.returnValue(claimSubmissionResultsDto),
      };
      $provide.value(
        'ValidateClaimMessagesFactory',
        validateClaimMessagesFactory
      );

      mockFeatureFlagService = {
        getOnce$: jasmine.createSpy().and.returnValue({ subscribe: jasmine.createSpy() })
      };
      $provide.value('FeatureFlagService', mockFeatureFlagService );

      mockModalFactory = {};
      $provide.value('ModalFactory', mockModalFactory );
  
      mockFuseFlag = {};
      $provide.value('FuseFlag', mockFuseFlag );
    })
  );
  beforeEach(inject(function ($rootScope, $controller, $injector, $compile) {
    scope = $rootScope.$new();
    compile = $compile;

    //mock for localize
    localize = {
      getLocalizedString: jasmine.createSpy().and.returnValue(''),
    };

    //mock for location
    location = {
      path: 'path/',
      $$path: {
        substr: jasmine.createSpy(),
        indexOf: jasmine.createSpy(),
      },
    };

    claimSubmissionResultsDto = {
        InvalidClaims: [
            {
              InvalidProperties: [
                {
                  AdditionalProperty: null,
                  PropertyName: 'PolicyHolderAddress1',
                  ValidationCode: 7,
                  ValidationMessage:
                    "The policy holder /subscriber does not have a valid Home Address. Please update the policy holder's Patient Profile",
                },
                {
                  AdditionalProperty: null,
                  PropertyName: 'ToothNumbers',
                  ValidationCode: null,
                },
              ],
            },
            {
              InvalidProperties: [
                {
                  AdditionalProperty: null,
                  PropertyName: 'PolicyHolderId',
                  ValidationCode: 7,
                  ValidationMessage:
                    "The policy holder / subscriber does not have a valid Policy Holder ID that is at least 2 characters in length.  Please update the policy holder's Insurance Information",
                  }
                ],
                // eslint-disable-next-line no-undef
                TransformPolicyHolderIdProperty = true
            },
            {
                InvalidProperties: [
                    {
                        AdditionalProperty: null,
                        PropertyName: 'OtherPolicyHolderId',
                        ValidationCode: 7,
                        ValidationMessage:
                            "The other insurance policy holder / subscriber does not have a valid Policy Holder ID that is at least 2 characters in length.  Please update the policy holder's Insurance Information",
                    }
                ],
                // eslint-disable-next-line no-undef
                TransformPolicyHolderIdProperty = true
            }
      ],
      ValidClaims: [{}],
    };

    tabLauncher = {
      launchNewTab: jasmine.createSpy(),
    };

    //mock uibModalInstance
    mInstance = {
      close: jasmine.createSpy(),
      dismiss: jasmine.createSpy(),
    };

    //mock controller
    ctrl = $controller('InvalidClaimsModalController', {
      $scope: scope,
      $uibModalInstance: mInstance,
      $location: location,
      localize: localize,
      claimSubmissionResultsDto: claimSubmissionResultsDto,
      claimStatusDtos: claimStatusDtos,
      PatientServices: patientServiceMock,
      tabLauncher: tabLauncher,
      toastrFactory: toastrFactory,
    });
  }));

  describe('initial values -> ', function () {
    it('controller should exist', function () {
      expect(ctrl).not.toBeNull();
    });

    it('should call the validateClaimMessagesFactory', function () {
      expect(validateClaimMessagesFactory.SetupMessages).toHaveBeenCalled();
    });
  });

  describe('scope.cancel -> ', function () {
    it('mInstance.dismiss should be called', function () {
      scope.cancel();
      expect(mInstance.dismiss).toHaveBeenCalled();
    });
  });

  describe('scope.getPatientName -> ', function () {
    it('should return concatinated name string', function () {
      var name = scope.getPatientName('First', 'M', 'Last', 'Jr');
      expect(name).toBe('First M. Last, Jr');
    });
  });

  describe('scope.getDate -> ', function () {
    it('should return first date string', function () {
      var date = scope.getDate('12/12/2016', '12/12/2016');
      expect(date).toBe('12/12/2016');
    });
    it('should return concatinated date string', function () {
      var date = scope.getDate('12/12/2016', '12/13/2016');
      expect(date).toBe('12/12/2016 - 12/13/2016');
    });
  });

  describe('scope.viewClaimAlerts -> ', function () {
    it('should call tabLauncher.launchNewTab', function () {
      scope.viewClaimAlerts();
      expect(tabLauncher.launchNewTab).toHaveBeenCalled();
    });
  });

  describe('scope.submitValidClaims -> ', function () {
    it('should call patientServiceMock.ClaimsAndPredeterminations.submit', function () {
      scope.submitValidClaims();
      expect(
        patientServiceMock.ClaimsAndPredeterminations.submit
      ).toHaveBeenCalled();
    });
  });

  describe('validateClaimMessagesFactory.SetupMessages -> ', function () {
    it('should set the correct validation for claim messages', function () {
      ctrl.init();

      expect(validateClaimMessagesFactory.SetupMessages).toHaveBeenCalled();
      expect(
        scope.claimSubmissionResultsDto.InvalidClaims[0].InvalidProperties[0]
          .ValidationMessage
      ).toBe(
        "The policy holder /subscriber does not have a valid Home Address. Please update the policy holder's Patient Profile"
      );
      expect(
        scope.claimSubmissionResultsDto.InvalidClaims[0].InvalidProperties[1]
          .ValidationCode
      ).toBe(null);
    });
    it('should transform policyholderid message when member id is required and missing', function () {
      ctrl.init();

      expect(validateClaimMessagesFactory.SetupMessages).toHaveBeenCalled();
      expect(scope.claimSubmissionResultsDto.PropertyName.toBe("MemberId"));
      expect(scope.claimSubmissionResultsDto.InvalidClaims[1].InvalidProperties[0].ValidationMessage).toBe(
          "The policy holder / subscriber does not have a valid Member ID that is at least 2 characters in length.  Please update the policy holder's Insurance Information"
      );
    });
    it('should transform otherpolicyholderidmessage when member id is required and missing', function () {
      ctrl.init();

      expect(validateClaimMessagesFactory.SetupMessages).toHaveBeenCalled();
      expect(scope.claimSubmissionResultsDto.PropertyName.toBe("OtherMemberId"));
      expect(scope.claimSubmissionResultsDto.InvalidClaims[2].InvalidProperties[0].ValidationMessage).toBe(
          "The policy holder / subscriber does not have a valid Member ID that is at least 2 characters in length.  Please update the policy holder's Insurance Information"
      );
    });
  });
});
