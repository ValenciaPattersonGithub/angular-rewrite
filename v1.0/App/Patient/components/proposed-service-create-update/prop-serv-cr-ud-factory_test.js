describe('ProposedServiceFactory', function () {
  var patientOdontogramFactory;
  var proposedServiceFactory;

  var currentServiceCode = {
    UseSmartCodes: true,
    SmartCode1Id: 1,
    SmartCode2Id: 2,
    SmartCode3Id: 3,
    SmartCode4Id: 4,
    SmartCode5Id: 5,
  };

  beforeEach(module('Soar.Common'));
  beforeEach(module('common.factories'));
  beforeEach(
    module('Soar.Patient', function ($provide) {
      patientOdontogramFactory = {
        TeethDefinitions: jasmine.createSpy().and.returnValue({
          then: jasmine.createSpy(),
        }),
      };
      $provide.value('PatientOdontogramFactory', patientOdontogramFactory);
    })
  );

  beforeEach(inject(function ($injector) {
    proposedServiceFactory = $injector.get('ProposedServiceFactory');
  }));

  //controller
  it('ProposedServiceFactory should check if controller exists', function () {
    expect(proposedServiceFactory).not.toBeNull();
    expect(proposedServiceFactory).not.toBeUndefined();
  });

  describe('GetSmartCode function -> ', function () {
    beforeEach(function () {
      proposedServiceFactory.getSmartCode = jasmine.createSpy({});
    });
    it('should set the correct smart code based on number of surfaces or roots selected', function () {
      proposedServiceFactory.GetSmartCode(4, currentServiceCode);
      //expect(proposedServiceFactory.GetSmartCode(4, currentServiceCode)).toContain(4);
    });
  });

  describe('GetNumberOfSurfaces function -> ', function () {
    var activeSurfaces;

    beforeEach(function () {
      proposedServiceFactory.getNumberOfSurfaces = jasmine.createSpy({});
    });

    it('should count pairing of B/F & B5/F5 as one surface', function () {
      activeSurfaces = [];
      activeSurfaces.push({ SurfaceAbbreviation: 'B/F' });
      activeSurfaces.push({ SurfaceAbbreviation: 'B5/F5' });
      expect(proposedServiceFactory.GetNumberOfSurfaces(activeSurfaces)).toBe(
        1
      );
    });

    it('should count pairing of L & L5 as one surface', function () {
      activeSurfaces = [];
      activeSurfaces.push({ SurfaceAbbreviation: 'L' });
      activeSurfaces.push({ SurfaceAbbreviation: 'L5' });
      expect(proposedServiceFactory.GetNumberOfSurfaces(activeSurfaces)).toBe(
        1
      );
    });

    it('should work in conjunction with other surfaces', function () {
      activeSurfaces = [];
      activeSurfaces.push({ SurfaceAbbreviation: 'B/F' });
      activeSurfaces.push({ SurfaceAbbreviation: 'D' });
      activeSurfaces.push({ SurfaceAbbreviation: 'B5/F5' });
      activeSurfaces.push({ SurfaceAbbreviation: 'L' });
      activeSurfaces.push({ SurfaceAbbreviation: 'L5' });
      expect(proposedServiceFactory.GetNumberOfSurfaces(activeSurfaces)).toBe(
        3
      );
    });
  });

  describe('GetNumberOfRoots function -> ', function () {
    var tooth, numberOfRoots;
    beforeEach(function () {
      proposedServiceFactory.getNumberOfRoots = jasmine.createSpy({});
    });

    it('should set the correct number of roots based on the tooth or teeth selected -> 1 root', function () {
      tooth = '6';
      numberOfRoots = proposedServiceFactory.GetNumberOfRoots(tooth);
      expect(numberOfRoots).toEqual([1]);

      tooth = '6, 56';
      numberOfRoots = proposedServiceFactory.GetNumberOfRoots(tooth);
      expect(numberOfRoots).toEqual([1]);
    });

    it('should set the correct number of roots based on the tooth or teeth selected -> 2 root', function () {
      tooth = '4';
      var numberOfRoots = proposedServiceFactory.GetNumberOfRoots(tooth);
      expect(numberOfRoots).toEqual([1, 2]);

      tooth = '4, 54';
      numberOfRoots = proposedServiceFactory.GetNumberOfRoots(tooth);
      expect(numberOfRoots).toEqual([1, 2]);
    });

    it('should set the correct number of roots based on the tooth or teeth selected -> 3 root', function () {
      tooth = '1';
      var numberOfRoots = proposedServiceFactory.GetNumberOfRoots(tooth);
      expect(numberOfRoots).toEqual([1, 2, 3]);

      tooth = '1, 51';
      numberOfRoots = proposedServiceFactory.GetNumberOfRoots(tooth);
      expect(numberOfRoots).toEqual([1, 2, 3]);
    });

    it('should set the correct number of roots based on the tooth or teeth selected -> 0 - default', function () {
      tooth = '';
      var numberOfRoots = proposedServiceFactory.GetNumberOfRoots(tooth);
      expect(numberOfRoots).toEqual([]);
    });
  });

  describe('checkPropertiesByAffectedArea function -> ', function () {
    var serviceCodes = [];
    var serviceTransaction = {};
    beforeEach(function () {
      // ServiceCode.AffectedAreaId was 5 at time that the service transaction was created
      serviceTransaction = {
        AffectedAreaId: 5,
        ServiceCodeId: '123456789',
        Tooth: '11',
      };
      // ServiceCode.AffectedAreaId has been modified to Mouth
      serviceCodes = [
        { ServiceCodeId: '123456789', AffectedAreaId: 1 },
        { ServiceCodeId: '123456787', AffectedAreaId: 5 },
        { ServiceCodeId: '123456788', AffectedAreaId: 3 },
      ];
    });
    it('should set property null if not valid for affected area', function () {
      expect(serviceTransaction.Tooth).toEqual('11');
      proposedServiceFactory.checkPropertiesByAffectedArea(
        serviceTransaction,
        serviceCodes
      );
      expect(serviceTransaction.Tooth).toEqual(null);
    });

    it('should not set property null if valid for affected area ', function () {
      serviceCodes[0].AffectedAreaId = 5;
      expect(serviceTransaction.Tooth).toEqual('11');
      proposedServiceFactory.checkPropertiesByAffectedArea(
        serviceTransaction,
        serviceCodes
      );
      expect(serviceTransaction.Tooth).toEqual('11');
    });
  });
});
