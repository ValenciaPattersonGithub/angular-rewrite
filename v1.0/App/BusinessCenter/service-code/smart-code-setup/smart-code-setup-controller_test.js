describe('SmartCodeSetupController -> ', function () {
  var scope, rootScope, ctrl;
  var toastrFactory;
  var serviceCode, allServiceCodes;

  // Create spies for services
  beforeEach(
    module('Soar.BusinessCenter', function ($provide) {
      serviceCode = {
        Data: {
          $$FeeString: '$50',
          $$locationFee: 50,
          $$locationTaxableServiceId: 3,
          $$serviceTransactionFee: 50,
          $$useCodeForAllSurfaces: true,
          Surface: '',
          Tooth: '',
          CreationDate: '',
          ServiceCodeId: '52331da3-45c1-4d58-be35-197f96d23918',
          CdtCodeId: '08e058d1-e313-4a56-8a46-b877dc9feebb',
          CdtCodeName: 'D9211',
          Code: 'scTest1',
          Description: 'scTest1 deswc',
          ServiceTypeId: 'cc08eb08-425d-43af-9d9d-ce976a208489',
          ServiceTypeDescription: 'Diagnostic',
          DisplayAs: 'scTest1',
          Fee: 57,
          TaxableServiceTypeId: 3,
          AffectedAreaId: 4,
          UsuallyPerformedByProviderTypeId: 2,
          UseSmartCodes: false,
          SmartCode1Id: null,
          SmartCode2Id: null,
          SmartCode3Id: null,
          SmartCode4Id: null,
          SmartCode5Id: null,
          UseCodeForRangeOfTeeth: false,
          IsActive: true,
          IsEligibleForDiscount: true,
          Notes: 'text',
          SubmitOnInsurance: true,
          IsSwiftPickCode: false,
          SwiftPickServiceCodes: null,
        },
      };
      $provide.value('ServiceCode', serviceCode);

      allServiceCodes = [serviceCode];
      $provide.value('AllServiceCodes', allServiceCodes);

      var modalInstance = {
        close: jasmine.createSpy(),
        dismiss: jasmine.createSpy(),
      };

      $provide.value('$uibModalInstance', modalInstance);

      //mock for toaster functionality
      toastrFactory = {
        success: jasmine.createSpy(),
        error: jasmine.createSpy(),
      };
    })
  );
  // Create controller and scope
  beforeEach(inject(function ($rootScope, $controller) {
    scope = $rootScope.$new();
    rootScope = $rootScope;

    ctrl = $controller('SmartCodeSetupController', {
      $scope: scope,
      $rootScope: rootScope,
      toastrFactory: toastrFactory,
    });
    scope.serviceCode = serviceCode;
  }));
  it('should initialize controller', function () {
    expect(ctrl).not.toBeNull();
  });

  describe('init -> funciton', function () {
    it('should set initial values', function () {
      spyOn(scope, 'setCodesByAffectedArea');
      ctrl.init();
      expect(scope.setCodesByAffectedArea).toHaveBeenCalled();
    });
  });

  describe('scope.setCodesByAffectedArea -> function', function () {
    beforeEach(function () {
      scope.codesByArea = {
        count: 0,
        label: '',
      };
    });
    it('should set the correct number of view items for affected area of root', function () {
      scope.serviceCode.AffectedAreaId = 3;
      scope.setCodesByAffectedArea();
      expect(scope.codesByArea.count).toBe(3);
      expect(scope.codesByArea.label).toBe('Channel(s)');
    });

    it('should set the correct number of view items for affected area of surface', function () {
      scope.serviceCode.AffectedAreaId = 4;
      scope.setCodesByAffectedArea();
      expect(scope.codesByArea.count).toBe(5);
      expect(scope.codesByArea.label).toBe('Surface(s)');
    });

    it('should set the correct number of view items for affected area of range of teeth', function () {
      scope.serviceCode.AffectedAreaId = 5;
      scope.setCodesByAffectedArea();
      expect(scope.codesByArea.count).toBe(2);
      expect(scope.codesByArea.RoT.length).toBe(2);
    });
  });

  describe('scope.setSearchData -> function', function () {
    beforeEach(function () {
      scope.codesByArea = {
        count: 3,
        label: 'Channel',
      };
      scope.searchData = {
        searchTerms: [],
      };
    });
    it('should set the search term to null if there is no matching service code selected', function () {
      scope.setSearchData();
      expect(scope.searchData.searchTerms[0].term).toBe(null);
    });
  });

  describe('scope.toggle -> function', function () {
    beforeEach(function () {
      spyOn(scope, 'validateOptions');
    });

    it('should call the validateOptions function', function () {
      scope.serviceCode.AffectedAreaId = 5;
      scope.serviceCode.UseCodeForRangeOfTeeth = false;
      scope.toggle();
      expect(scope.validateOptions).toHaveBeenCalled();
    });
  });

  describe('ctrl.validateSmartCodeSelection -> function', function () {
    beforeEach(function () {
      scope.searchData = {
        searchTerms: [{ term: '05213' }],
      };
      scope.serviceCode = {
        ServiceCodeId: '45F564AF-F6BC-48AA-A644-6E627ACA827C',
        Code: 'D5213',
        Description:
          'maxillary partial denture - cast metal framework with resin denture bases (including any conventional clasps, rests and teeth)',
        DisplayAs: 'PartialMax-Metal',
        AffectedAreaId: 5,
        UseCodeForRangeOfTeeth: true,
        UseSmartCodes: true,
      };

      scope.allServiceCodes = [
        {
          ServiceCodeId: '98B0EEAC-C9FC-4671-B065-7EB4FEB20597',
          Code: 'D1110',
          Description: 'prophylaxis, adult',
          DisplayAs: 'AdultPro',
          AffectedAreaId: 1,
          UseCodeForRangeOfTeeth: false,
          UseSmartCodes: false,
        },
        {
          ServiceCodeId: '4A8A6CAB-A18B-41AF-A7F2-0BA0C5E3FDBE',
          Code: 'D1320',
          Description:
            'tobacco counseling for the control and prevention of oral disease',
          DisplayAs: 'D1320',
          AffectedAreaId: 1,
          UseCodeForRangeOfTeeth: false,
          UseSmartCodes: false,
        },
        {
          ServiceCodeId: '574EFC00-484F-4372-90C7-0714D6CB2D72',
          Code: 'D1550',
          Description: 're-cement or re-bond space maintainer',
          DisplayAs: 'D1550',
          AffectedAreaId: 1,
          UseCodeForRangeOfTeeth: false,
          UseSmartCodes: false,
        },
        {
          ServiceCodeId: '62AE023F-804F-473E-B015-272235329FC6',
          Code: 'D2140',
          Description: 'amalgam - one surface, primary or permanent',
          DisplayAs: 'Amal1S',
          AffectedAreaId: 4,
          UseCodeForRangeOfTeeth: false,
          UseSmartCodes: false,
        },
        {
          ServiceCodeId: '940A0368-8E5B-4AF8-9430-C7710CF51B3A',
          Code: 'D2150',
          Description: 'amalgam - two surfaces, primary or permanent',
          DisplayAs: 'Amal2S',
          AffectedAreaId: 4,
          UseCodeForRangeOfTeeth: false,
          UseSmartCodes: false,
        },
        {
          ServiceCodeId: '45F564AF-F6BC-48AA-A644-6E627ACA827C',
          Code: 'D5213',
          Description:
            'maxillary partial denture - cast metal framework with resin denture bases (including any conventional clasps, rests and teeth)',
          DisplayAs: 'PartialMax-Metal',
          AffectedAreaId: 5,
          UseCodeForRangeOfTeeth: true,
          UseSmartCodes: true,
        },
        {
          ServiceCodeId: '45F564AF-F6BC-48AA-A644-6E627ACA827E',
          Code: 'D5214',
          Description:
            'maxillary partial denture - cast metal framework with resin denture bases (including any conventional clasps, rests and teeth)',
          DisplayAs: 'PartialMan-Metal',
          AffectedAreaId: 4,
          UseCodeForRangeOfTeeth: true,
          UseSmartCodes: false,
        },
        {
          ServiceCodeId: '98B0EEAC-C9FC-4671-B065-7EB4FEB20591',
          Code: '01110',
          Description: 'prophylaxis, adult',
          DisplayAs: 'AdultPro',
          AffectedAreaId: 2,
          UseCodeForRangeOfTeeth: false,
          UseSmartCodes: false,
        },
        {
          ServiceCodeId: '1C6CB2ED-98DB-4322-B072-0213891CA89F',
          Code: '02921',
          Description: 'reattachment of tooth fragment, incisal edge or cusp',
          DisplayAs: 'D2921',
          AffectedAreaId: 5,
          UseCodeForRangeOfTeeth: false,
          UseSmartCodes: false,
        },
        {
          ServiceCodeId: '1C6CB2ED-98DB-4322-B072-0213891CA89G',
          Code: 'D2921',
          Description: 'reattachment of tooth fragment, incisal edge or cusp',
          DisplayAs: 'D2921',
          AffectedAreaId: 5,
          UseCodeForRangeOfTeeth: false,
          UseSmartCodes: false,
        },
        {
          ServiceCodeId: '45F564AF-F6BC-48AA-A644-6E627ACA827f',
          Code: '05214',
          Description:
            'maxillary partial denture - cast metal framework with resin denture bases (including any conventional clasps, rests and teeth)',
          DisplayAs: 'PartialMan-Metal',
          AffectedAreaId: 5,
          UseCodeForRangeOfTeeth: false,
          UseSmartCodes: false,
        },
        {
          ServiceCodeId: '45F564AF-F6BC-48AA-A644-6E627ACA827D',
          Code: '05213',
          Description:
            'maxillary partial denture - cast metal framework with resin denture bases (including any conventional clasps, rests and teeth)',
          DisplayAs: 'PartialMax-Metal',
          AffectedAreaId: 5,
          UseCodeForRangeOfTeeth: true,
          UseSmartCodes: false,
        },
      ];
    });

    it('should set $$invalidCode to true if no serviceCode matches entry', function () {
      scope.serviceCode.Code = 'D5213';
      scope.serviceCode.AffectedAreaId = 5;
      scope.serviceCode.UseCodeForRangeOfTeeth = true;

      scope.searchData.searchTerms = [{ term: '05215' }];
      ctrl.validateSmartCodeSelection(scope.searchData.searchTerms);
      expect(scope.hasErrors).toBe(true);
      expect(scope.searchData.searchTerms[0].$$invalidCode).toEqual(true);
      expect(scope.searchData.searchTerms[0].$$validationMessage).toEqual(
        'Smart codes for this service code must have the same affected area as this service code.'
      );
    });

    it('should set $$invalidCode to true if matching service with the same AffectedAreaId of 5 but  scope.serviceCode.UseCodeForRangeOfTeeth is true and match.UseCodeForRangeOfTeeth is false', function () {
      scope.serviceCode.Code = '05213';
      scope.serviceCode.AffectedAreaId = 5;
      scope.serviceCode.UseCodeForRangeOfTeeth = true;
      scope.searchData.searchTerms = [{ term: '05214' }];
      ctrl.validateSmartCodeSelection(scope.searchData.searchTerms);
      expect(scope.hasErrors).toBe(true);
      expect(scope.searchData.searchTerms[0].$$invalidCode).toEqual(true);
      expect(scope.searchData.searchTerms[0].$$validationMessage).toEqual(
        'Smart codes for this service code must all be allowed to be used with a range of teeth.'
      );
    });

    it(
      'should set $$invalidCode to true if scope.serviceCode.AffectedAreaId = 5 and scope.serviceCode.UseCodeForRangeOfTeeth is false ' +
        'and match.AffectedAreaId is not 5',
      function () {
        scope.serviceCode.Code = 'D5213';
        scope.serviceCode.AffectedAreaId = 5;
        scope.serviceCode.UseCodeForRangeOfTeeth = false;
        scope.searchData.searchTerms = [{ term: 'D5214' }];
        ctrl.validateSmartCodeSelection(scope.searchData.searchTerms);
        expect(scope.hasErrors).toBe(true);
        expect(scope.searchData.searchTerms[0].$$invalidCode).toEqual(true);
        expect(scope.searchData.searchTerms[0].$$validationMessage).toEqual(
          'Smart codes for this service code must have the same affected area as this service code.'
        );
      }
    );

    it('should set $$invalidCode to true if matching service has a different AffectedAreaId than serviceCode.AffectedAreaId ', function () {
      scope.serviceCode.Code = 'D2921';
      scope.serviceCode.AffectedAreaId = 5;

      scope.searchData.searchTerms = [{ term: '02921' }];
      ctrl.validateSmartCodeSelection(scope.searchData.searchTerms);
      expect(scope.hasErrors).toBe(true);
      expect(scope.searchData.searchTerms[0].$$invalidCode).toEqual(true);
      expect(scope.searchData.searchTerms[0].$$validationMessage).toEqual(
        'Smart codes for this service code must all be allowed to be used with a range of teeth.'
      );
    });

    it(
      'should set $$invalidCode to false if matching service has same AffectedAreaId as serviceCode.AffectedAreaId ' +
        ' and serviceCode.UseCodeForRangeOfTeeth is false ',
      function () {
        scope.serviceCode.Code = 'D2921';
        scope.serviceCode.AffectedAreaId = 5;
        scope.serviceCode.UseCodeForRangeOfTeeth = false;

        scope.searchData.searchTerms = [{ term: '02921' }];
        ctrl.validateSmartCodeSelection(scope.searchData.searchTerms);
        expect(scope.hasErrors).toBe(false);
        expect(scope.searchData.searchTerms[0].$$invalidCode).toEqual(false);
        expect(scope.searchData.searchTerms[0].$$validationMessage).toEqual('');
      }
    );

    it('should set $$invalidCode to false if term is empty or null', function () {
      scope.serviceCode.Code = 'D2921';
      scope.serviceCode.AffectedAreaId = 5;
      scope.serviceCode.UseCodeForRangeOfTeeth = false;

      scope.searchData.searchTerms = [{ term: null }];
      ctrl.validateSmartCodeSelection(scope.searchData.searchTerms);
      expect(scope.hasErrors).toBe(false);
      expect(scope.searchData.searchTerms[0].$$invalidCode).toEqual(false);
      expect(scope.searchData.searchTerms[0].$$validationMessage).toEqual('');

      scope.serviceCode.Code = 'D2921';
      scope.serviceCode.AffectedAreaId = 5;
      scope.serviceCode.UseCodeForRangeOfTeeth = false;

      scope.searchData.searchTerms = [{ term: '' }];
      ctrl.validateSmartCodeSelection(scope.searchData.searchTerms);
      expect(scope.hasErrors).toBe(false);
      expect(scope.searchData.searchTerms[0].$$invalidCode).toEqual(false);
      expect(scope.searchData.searchTerms[0].$$validationMessage).toEqual('');
    });

    it('should set scope.hasErrors to true if one of many is invalid', function () {
      scope.serviceCode.Code = '05213';
      scope.serviceCode.AffectedAreaId = 5;
      scope.serviceCode.UseCodeForRangeOfTeeth = true;

      scope.searchData.searchTerms = [{ term: '05213' }, { term: '05214' }];
      ctrl.validateSmartCodeSelection(scope.searchData.searchTerms);
      expect(scope.hasErrors).toBe(true);
      expect(scope.searchData.searchTerms[0].$$invalidCode).toEqual(false);
      expect(scope.searchData.searchTerms[0].$$validationMessage).toEqual('');

      expect(scope.searchData.searchTerms[1].$$invalidCode).toEqual(true);
      expect(scope.searchData.searchTerms[1].$$validationMessage).toEqual(
        'Smart codes for this service code must all be allowed to be used with a range of teeth.'
      );
    });
  });
});
