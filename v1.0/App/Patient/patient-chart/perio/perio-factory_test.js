describe('PatientPerioExamFactory ->', function () {
  var patientPerioExamFactory, perioService, examDetails, q;

  //#region mocks

  examDetails = [
    {
      EntityId: '577763d2-522e-48e3-8991-4993aee35b8b',
      PracticeId: 1,
      ExamId: '11d2daaf-b382-4e0f-bed8-2d1b6554e4f8',
      ToothId: '1',
      PatientId: '74e00e01-ece9-4e10-a715-bf71f73d4a80',
      BleedingPocket: [null, null, null, null, null, null],
      DepthPocket: [4, 5, 1, null, null, null],
      FurcationGradeRoot: [null, null, null],
      GingivalMarginPocket: [null, null, null, null, null, null],
      MgjPocket: [null, null, null, null, null, null],
      Mobility: null,
      SuppurationPocket: [null, null, null, null, null, null],
      DataTag: 'AAAAAAAB3iM=',
      UserModified: '09ffbd2f-3837-e711-b798-8056f25c3d57',
      DateModified: '2017-08-09T20:43:36.5622196',
      $$FurcationReadingsAllowed: 3,
      $$MouthSide: 'Right',
      $$BuccalInputArray: [0, 1, 2],
      $$LingualInputArray: [5, 4, 3],
      ToothNumber: 1,
      ToothState: '',
      AttachmentLvl: [4, 5, 1, null, null, null],
    },
    {
      EntityId: '194fe294-92d1-4075-99d4-c75696c788f6',
      PracticeId: 1,
      ExamId: '11d2daaf-b382-4e0f-bed8-2d1b6554e4f8',
      ToothId: '2',
      PatientId: '74e00e01-ece9-4e10-a715-bf71f73d4a80',
      BleedingPocket: [null, null, null, null, null, null],
      DepthPocket: [2, 5, 2, null, null, null],
      FurcationGradeRoot: [null, null, null],
      GingivalMarginPocket: [null, null, null, null, null, null],
      MgjPocket: [null, null, null, null, null, null],
      Mobility: 2,
      SuppurationPocket: [null, null, null, null, null, null],
      DataTag: 'AAAAAAAB3h0=',
      UserModified: '09ffbd2f-3837-e711-b798-8056f25c3d57',
      DateModified: '2017-08-09T20:43:36.5672231',
      $$FurcationReadingsAllowed: 3,
      $$MouthSide: 'Right',
      $$BuccalInputArray: [0, 1, 2],
      $$LingualInputArray: [5, 4, 3],
      ToothNumber: 2,
      ToothState: '',
      AttachmentLvl: [2, 5, 2, null, null, null],
    },
  ];

  //#endregion

  //#region before each

  beforeEach(module('Soar.Common'));
  beforeEach(module('common.factories'));
  beforeEach(
    module('Soar.Patient', function ($provide) {
      perioService = {
        get: jasmine.createSpy().and.callFake(function () {
          var deferred = q.defer();
          deferred.$promise = deferred.promise;
          deferred.resolve({});
          return deferred;
        }),
      };
      $provide.value('PerioService', perioService);
      $provide.value('ExamState', {
        EditMode: 'EditMode',
        None: 'None',
        Cancel: 'Cancel',
        Continue: 'Continue',
        Start: 'Start',
        Save: 'Save',
        SaveComplete: 'SaveComplete',
        Initializing: 'Initializing',
        Loading: 'Loading',
        ViewMode: 'ViewMode',
      });
    })
  );

  // inject the factory

  beforeEach(inject(function ($injector, $q) {
    q = $q;
    patientPerioExamFactory = $injector.get('PatientPerioExamFactory');
  }));

  //#endregion

  describe('convertNullsToZero function ->', function () {
    var details;

    beforeEach(function () {
      details = angular.copy(examDetails);
    });

    it('should not set non-null values to zero', function () {
      expect(details[0].DepthPocket[0]).toBe(4);
      patientPerioExamFactory.convertNullsToZero(details);
      expect(details[0].DepthPocket[0]).toBe(4);
    });

    it('should set null values to zero', function () {
      expect(details[0].DepthPocket[3]).toBe(null);
      patientPerioExamFactory.convertNullsToZero(details);
      expect(details[0].DepthPocket[3]).toBe(0);
    });

    it('should set null values to zero if ToothState is MissingPrimary', function () {
      expect(details[0].DepthPocket[3]).toBe(null);
      details[0].ToothState = 'MissingPrimary';
      patientPerioExamFactory.convertNullsToZero(details);
      expect(details[0].DepthPocket[3]).toBe(null);
    });

    it('should not set non-null Mobility values to zero', function () {
      expect(details[1].Mobility).toBe(2);
      patientPerioExamFactory.convertNullsToZero(details);
      expect(details[1].Mobility).toBe(2);
    });

    it('should set null Mobility values to zero', function () {
      expect(details[0].Mobility).toBe(null);
      patientPerioExamFactory.convertNullsToZero(details);
      expect(details[0].Mobility).toBe(0);
    });

    it('should not do anything to properties that are not in propertiesToUpdate list', function () {
      expect(details[0].ToothNumber).toBe(1);
      patientPerioExamFactory.convertNullsToZero(details);
      expect(details[0].ToothNumber).toBe(1);
    });
  });

  describe('getNewExam function ->', function () {
    var mockPatientsTeeth = [];
    var mockPreviousExam = [];
    beforeEach(function () {
      mockPatientsTeeth = [
        '1',
        '2',
        '3,Missing',
        '4',
        '5',
        '6',
        '7',
        'E',
        'F',
        '10',
        '11',
        '12',
        '13',
        '14',
        '15',
        '17',
        '18',
        '19',
        '20',
        '21',
        '22',
        '23',
        '24',
        '25',
        '26',
        '27',
        '28',
        '29,Missing',
      ];
    });

    it('should contain ExamDetails for each tooth position in toothExam even if patient does not have tooth at that position', function () {
      var perioExam = patientPerioExamFactory.getNewExam(
        '1235',
        mockPatientsTeeth
      );
      expect(perioExam.ExamDetails[0].ToothNumber).toEqual(1);
      expect(perioExam.ExamDetails[0].ToothId).toEqual('1');

      expect(perioExam.ExamDetails[30].ToothNumber).toEqual(31);
      expect(perioExam.ExamDetails[30].ToothId).toEqual('31');

      expect(perioExam.ExamDetails[31].ToothNumber).toEqual(32);
      expect(perioExam.ExamDetails[31].ToothId).toEqual('32');
    });

    it('should contain ExamDetails with correct ToothId for position if patient does have tooth at that position', function () {
      var perioExam = patientPerioExamFactory.getNewExam(
        '1235',
        mockPatientsTeeth
      );
      expect(perioExam.ExamDetails[7].ToothNumber).toEqual(8);
      expect(perioExam.ExamDetails[7].ToothId).toEqual('E');
    });

    it('should contain ExamDetails with Missing for position if patient does have tooth at that position (Missing)', function () {
      var perioExam = patientPerioExamFactory.getNewExam(
        '1235',
        mockPatientsTeeth
      );

      expect(perioExam.ExamDetails[2].ToothNumber).toEqual(3);
      expect(perioExam.ExamDetails[2].ToothState).toEqual('Missing');
    });

    it('should contain ExamDetails with MissingPrimary for position if patient does have tooth at that position (primary)', function () {
      var perioExam = patientPerioExamFactory.getNewExam(
        '1235',
        mockPatientsTeeth
      );

      expect(perioExam.ExamDetails[31].ToothNumber).toEqual(32);
      expect(perioExam.ExamDetails[31].ToothState).toEqual('MissingPrimary');
    });
  });

  describe('getBleedingAll ->', function () {
    it('should return false if some of the bleeding pockets are not set to true', function () {
      patientPerioExamFactory.ActivePerioExam = {
        ExamDetails: [
          {
            ToothNumber: 1,
            ToothState: '',
            BleedingPocket: [null, null, true, null, null, null],
          },
          { ToothNumber: 2, ToothState: 'Missing' },
          { ToothNumber: 3, ToothState: 'MissingPrimary' },
        ],
      };

      var hasBleedingAll = patientPerioExamFactory.getBleedingAll();

      expect(hasBleedingAll).toEqual(false);
    });

    //it('should return true if all of the bleeding pockets are set to true', function () {
    //    patientPerioExamFactory.ActivePerioExam = {
    //        ExamDetails: [{ ToothNumber: 1, ToothState: '', BleedingPocket: [true, true, true, true, true, true] }]
    //    };

    //    var hasBleedingAll = patientPerioExamFactory.getBleedingAll();

    //    expect(hasBleedingAll).toEqual(true);
    //});

    it('should return false if all of the bleeding pockets are set to false', function () {
      patientPerioExamFactory.ActivePerioExam = {
        ExamDetails: [
          {
            ToothNumber: 1,
            ToothState: '',
            BleedingPocket: [false, false, false, false, false, false],
          },
        ],
      };

      var hasBleedingAll = patientPerioExamFactory.getBleedingAll();

      expect(hasBleedingAll).toEqual(false);
    });

    it('should return false if all of the bleeding pockets are set to null', function () {
      patientPerioExamFactory.ActivePerioExam = {
        ExamDetails: [
          {
            ToothNumber: 1,
            ToothState: '',
            BleedingPocket: [null, null, null, null, null, null],
          },
        ],
      };

      var hasBleedingAll = patientPerioExamFactory.getBleedingAll();

      expect(hasBleedingAll).toEqual(false);
    });

    it('should return true if toothState is null and all bleedingPockets are true', function () {
      patientPerioExamFactory.ActivePerioExam = {
        ExamDetails: [
          {
            ToothNumber: 1,
            ToothState: null,
            BleedingPocket: [true, true, true, true, true, true],
          },
        ],
      };

      var hasBleedingAll = patientPerioExamFactory.getBleedingAll();

      expect(hasBleedingAll).toEqual(true);
    });
  });

  describe('getSuppurationAll ->', function () {
    it('should return false if some of the suppuration pockets are not set to true', function () {
      patientPerioExamFactory.ActivePerioExam = {
        ExamDetails: [
          {
            ToothNumber: 1,
            ToothState: '',
            SuppurationPocket: [null, null, true, null, null, null],
          },
          { ToothNumber: 2, ToothState: 'Missing' },
          { ToothNumber: 3, ToothState: 'MissingPrimary' },
        ],
      };

      var hasSuppurationAll = patientPerioExamFactory.getSuppurationAll();

      expect(hasSuppurationAll).toEqual(false);
    });

    //it('should return true if all of the suppuration pockets are set to true', function () {
    //    patientPerioExamFactory.ActivePerioExam = {
    //        ExamDetails: [{ ToothNumber: 1, ToothState: '', SuppurationPocket: [true, true, true, true, true, true] }]
    //    };

    //    var hasBleedingAll = patientPerioExamFactory.getSuppurationAll();

    //    expect(hasBleedingAll).toEqual(true);
    //});

    it('should return false if all of the suppuration pockets are set to false', function () {
      patientPerioExamFactory.ActivePerioExam = {
        ExamDetails: [
          {
            ToothNumber: 1,
            ToothState: '',
            SuppurationPocket: [false, false, false, false, false, false],
          },
        ],
      };

      var hasSuppurationAll = patientPerioExamFactory.getSuppurationAll();

      expect(hasSuppurationAll).toEqual(false);
    });

    it('should return false if all of the suppuration pockets are set to null', function () {
      patientPerioExamFactory.ActivePerioExam = {
        ExamDetails: [
          {
            ToothNumber: 1,
            ToothState: '',
            SuppurationPocket: [null, null, null, null, null, null],
          },
        ],
      };

      var hasSuppurationAll = patientPerioExamFactory.getSuppurationAll();

      expect(hasSuppurationAll).toEqual(false);
    });

    it('should return true if toothState is null and all suppurationPockets are true', function () {
      patientPerioExamFactory.ActivePerioExam = {
        ExamDetails: [
          {
            ToothNumber: 1,
            ToothState: null,
            SuppurationPocket: [true, true, true, true, true, true],
          },
        ],
      };

      var hasSuppurationAll = patientPerioExamFactory.getSuppurationAll();

      expect(hasSuppurationAll).toEqual(true);
    });
  });

  describe('setBleedingAll ->', function () {
    it('should set all of the bleeding pockets to true when set to true', function () {
      patientPerioExamFactory.ActivePerioExam = {
        ExamDetails: [
          {
            ToothNumber: 1,
            ToothState: '',
            BleedingPocket: [true, false, null, true, false, null],
          },
        ],
      };

      patientPerioExamFactory.setBleedingAll(true);

      expect(
        patientPerioExamFactory.ActivePerioExam.ExamDetails[0].BleedingPocket[0]
      ).toEqual(true);
      expect(
        patientPerioExamFactory.ActivePerioExam.ExamDetails[0].BleedingPocket[1]
      ).toEqual(true);
      expect(
        patientPerioExamFactory.ActivePerioExam.ExamDetails[0].BleedingPocket[2]
      ).toEqual(true);
      expect(
        patientPerioExamFactory.ActivePerioExam.ExamDetails[0].BleedingPocket[3]
      ).toEqual(true);
      expect(
        patientPerioExamFactory.ActivePerioExam.ExamDetails[0].BleedingPocket[4]
      ).toEqual(true);
      expect(
        patientPerioExamFactory.ActivePerioExam.ExamDetails[0].BleedingPocket[5]
      ).toEqual(true);
    });

    it('should set all of the bleeding pockets to null when set to false', function () {
      patientPerioExamFactory.ActivePerioExam = {
        ExamDetails: [
          {
            ToothNumber: 1,
            ToothState: '',
            BleedingPocket: [true, false, null, true, false, null],
          },
        ],
      };

      patientPerioExamFactory.setBleedingAll(false);

      expect(
        patientPerioExamFactory.ActivePerioExam.ExamDetails[0].BleedingPocket[0]
      ).toEqual(null);
      expect(
        patientPerioExamFactory.ActivePerioExam.ExamDetails[0].BleedingPocket[1]
      ).toEqual(null);
      expect(
        patientPerioExamFactory.ActivePerioExam.ExamDetails[0].BleedingPocket[2]
      ).toEqual(null);
      expect(
        patientPerioExamFactory.ActivePerioExam.ExamDetails[0].BleedingPocket[3]
      ).toEqual(null);
      expect(
        patientPerioExamFactory.ActivePerioExam.ExamDetails[0].BleedingPocket[4]
      ).toEqual(null);
      expect(
        patientPerioExamFactory.ActivePerioExam.ExamDetails[0].BleedingPocket[5]
      ).toEqual(null);
    });

    it('should set all of the bleeding pockets to true when set to true and toothState is null', function () {
      patientPerioExamFactory.ActivePerioExam = {
        ExamDetails: [
          {
            ToothNumber: 1,
            ToothState: null,
            BleedingPocket: [true, false, null, true, false, null],
          },
        ],
      };

      patientPerioExamFactory.setBleedingAll(true);

      expect(
        patientPerioExamFactory.ActivePerioExam.ExamDetails[0].BleedingPocket[0]
      ).toEqual(true);
      expect(
        patientPerioExamFactory.ActivePerioExam.ExamDetails[0].BleedingPocket[1]
      ).toEqual(true);
      expect(
        patientPerioExamFactory.ActivePerioExam.ExamDetails[0].BleedingPocket[2]
      ).toEqual(true);
      expect(
        patientPerioExamFactory.ActivePerioExam.ExamDetails[0].BleedingPocket[3]
      ).toEqual(true);
      expect(
        patientPerioExamFactory.ActivePerioExam.ExamDetails[0].BleedingPocket[4]
      ).toEqual(true);
      expect(
        patientPerioExamFactory.ActivePerioExam.ExamDetails[0].BleedingPocket[5]
      ).toEqual(true);
    });

    it('should not set all of the bleeding pockets to true when set to true and toothState contains Missing', function () {
      patientPerioExamFactory.ActivePerioExam = {
        ExamDetails: [
          {
            ToothNumber: 1,
            ToothState: 'Missing',
            BleedingPocket: [true, false, null, true, false, null],
          },
        ],
      };

      patientPerioExamFactory.setBleedingAll(true);

      expect(
        patientPerioExamFactory.ActivePerioExam.ExamDetails[0].BleedingPocket[0]
      ).toEqual(true);
      expect(
        patientPerioExamFactory.ActivePerioExam.ExamDetails[0].BleedingPocket[1]
      ).toEqual(false);
      expect(
        patientPerioExamFactory.ActivePerioExam.ExamDetails[0].BleedingPocket[2]
      ).toEqual(null);
      expect(
        patientPerioExamFactory.ActivePerioExam.ExamDetails[0].BleedingPocket[3]
      ).toEqual(true);
      expect(
        patientPerioExamFactory.ActivePerioExam.ExamDetails[0].BleedingPocket[4]
      ).toEqual(false);
      expect(
        patientPerioExamFactory.ActivePerioExam.ExamDetails[0].BleedingPocket[5]
      ).toEqual(null);
    });
  });

  describe('setSuppurationAll ->', function () {
    it('should set all of the suppuration pockets to true when set to true', function () {
      patientPerioExamFactory.ActivePerioExam = {
        ExamDetails: [
          {
            ToothNumber: 1,
            ToothState: '',
            SuppurationPocket: [true, false, null, true, false, null],
          },
        ],
      };

      patientPerioExamFactory.setSuppurationAll(true);

      expect(
        patientPerioExamFactory.ActivePerioExam.ExamDetails[0]
          .SuppurationPocket[0]
      ).toEqual(true);
      expect(
        patientPerioExamFactory.ActivePerioExam.ExamDetails[0]
          .SuppurationPocket[1]
      ).toEqual(true);
      expect(
        patientPerioExamFactory.ActivePerioExam.ExamDetails[0]
          .SuppurationPocket[2]
      ).toEqual(true);
      expect(
        patientPerioExamFactory.ActivePerioExam.ExamDetails[0]
          .SuppurationPocket[3]
      ).toEqual(true);
      expect(
        patientPerioExamFactory.ActivePerioExam.ExamDetails[0]
          .SuppurationPocket[4]
      ).toEqual(true);
      expect(
        patientPerioExamFactory.ActivePerioExam.ExamDetails[0]
          .SuppurationPocket[5]
      ).toEqual(true);
    });

    it('should set all of the suppuration pockets to null when set to false', function () {
      patientPerioExamFactory.ActivePerioExam = {
        ExamDetails: [
          {
            ToothNumber: 1,
            ToothState: '',
            SuppurationPocket: [true, false, null, true, false, null],
          },
        ],
      };

      patientPerioExamFactory.setSuppurationAll(false);

      expect(
        patientPerioExamFactory.ActivePerioExam.ExamDetails[0]
          .SuppurationPocket[0]
      ).toEqual(null);
      expect(
        patientPerioExamFactory.ActivePerioExam.ExamDetails[0]
          .SuppurationPocket[1]
      ).toEqual(null);
      expect(
        patientPerioExamFactory.ActivePerioExam.ExamDetails[0]
          .SuppurationPocket[2]
      ).toEqual(null);
      expect(
        patientPerioExamFactory.ActivePerioExam.ExamDetails[0]
          .SuppurationPocket[3]
      ).toEqual(null);
      expect(
        patientPerioExamFactory.ActivePerioExam.ExamDetails[0]
          .SuppurationPocket[4]
      ).toEqual(null);
      expect(
        patientPerioExamFactory.ActivePerioExam.ExamDetails[0]
          .SuppurationPocket[5]
      ).toEqual(null);
    });

    it('should set all of the suppuration pockets to true when set to true and toothState is null', function () {
      patientPerioExamFactory.ActivePerioExam = {
        ExamDetails: [
          {
            ToothNumber: 1,
            ToothState: null,
            SuppurationPocket: [true, false, null, true, false, null],
          },
        ],
      };

      patientPerioExamFactory.setSuppurationAll(true);

      expect(
        patientPerioExamFactory.ActivePerioExam.ExamDetails[0]
          .SuppurationPocket[0]
      ).toEqual(true);
      expect(
        patientPerioExamFactory.ActivePerioExam.ExamDetails[0]
          .SuppurationPocket[1]
      ).toEqual(true);
      expect(
        patientPerioExamFactory.ActivePerioExam.ExamDetails[0]
          .SuppurationPocket[2]
      ).toEqual(true);
      expect(
        patientPerioExamFactory.ActivePerioExam.ExamDetails[0]
          .SuppurationPocket[3]
      ).toEqual(true);
      expect(
        patientPerioExamFactory.ActivePerioExam.ExamDetails[0]
          .SuppurationPocket[4]
      ).toEqual(true);
      expect(
        patientPerioExamFactory.ActivePerioExam.ExamDetails[0]
          .SuppurationPocket[5]
      ).toEqual(true);
    });

    it('should not set all of the suppuration pockets to true when set to true and toothState contains Missing', function () {
      patientPerioExamFactory.ActivePerioExam = {
        ExamDetails: [
          {
            ToothNumber: 1,
            ToothState: 'Missing',
            SuppurationPocket: [true, false, null, true, false, null],
          },
        ],
      };

      patientPerioExamFactory.setSuppurationAll(true);

      expect(
        patientPerioExamFactory.ActivePerioExam.ExamDetails[0]
          .SuppurationPocket[0]
      ).toEqual(true);
      expect(
        patientPerioExamFactory.ActivePerioExam.ExamDetails[0]
          .SuppurationPocket[1]
      ).toEqual(false);
      expect(
        patientPerioExamFactory.ActivePerioExam.ExamDetails[0]
          .SuppurationPocket[2]
      ).toEqual(null);
      expect(
        patientPerioExamFactory.ActivePerioExam.ExamDetails[0]
          .SuppurationPocket[3]
      ).toEqual(true);
      expect(
        patientPerioExamFactory.ActivePerioExam.ExamDetails[0]
          .SuppurationPocket[4]
      ).toEqual(false);
      expect(
        patientPerioExamFactory.ActivePerioExam.ExamDetails[0]
          .SuppurationPocket[5]
      ).toEqual(null);
    });
  });

  describe('merge function ->', function () {
    it('should include exam details if ToothId is null', function () {
      var examDetails = [{ ToothId: null, Id: '1' }];
      var exam = { ExamDetails: examDetails };
      var savedExam = { ExamDetails: [] };
      var retVal = patientPerioExamFactory.merge(savedExam, exam);
      expect(retVal).not.toBeNull();
      expect(retVal.ExamDetails.length).toBe(1);
      expect(retVal.ExamDetails[0].Id).toBe('1');
    });

    it('should set ToothNumber and ToothState if saved exam contains matching record', function () {
      var examDetails = [
        { ToothId: 'toothId', ToothNumber: '5', ToothState: 'state' },
      ];
      var exam = { ExamDetails: examDetails };
      var savedExam = {
        ExamDetails: [
          { ToothId: 'toothId', ToothNumber: '6', ToothState: 'oldState' },
          { ToothId: 'junk', ToothNumber: '1' },
        ],
      };
      var retVal = patientPerioExamFactory.merge(savedExam, exam);
      expect(retVal).not.toBeNull();
      expect(retVal.ExamDetails.length).toBe(2);
      expect(retVal.ExamDetails[0]).toEqual({
        ToothId: 'toothId',
        ToothNumber: 5,
        ToothState: 'state',
      });
    });

    it('should include exam details if saved exam contains no matching record', function () {
      var examDetails = [
        { ToothId: 'toothId', ToothNumber: '5', ToothState: 'state' },
      ];
      var exam = { ExamDetails: examDetails };
      var savedExam = {
        ExamDetails: [
          { ToothId: 'junk', ToothNumber: '6', ToothState: 'oldState' },
          { ToothId: 'junk', ToothNumber: '1' },
        ],
      };
      var retVal = patientPerioExamFactory.merge(savedExam, exam);
      expect(retVal).not.toBeNull();
      expect(retVal.ExamDetails.length).toBe(3);
    });

    it('should sort results by tooth number', function () {
      var examDetails = [
        { ToothId: 'toothId', ToothNumber: '5', ToothState: 'state' },
      ];
      var exam = { ExamDetails: examDetails };
      var savedExam = {
        ExamDetails: [
          { ToothId: 'junk', ToothNumber: '6', ToothState: 'oldState' },
          { ToothId: 'junk', ToothNumber: '1' },
        ],
      };
      var retVal = patientPerioExamFactory.merge(savedExam, exam);
      expect(retVal).not.toBeNull();
      expect(retVal.ExamDetails.length).toBe(3);
      expect(retVal.ExamDetails[0].ToothNumber).toEqual('1');
    });
  });

  describe('process function ->', function () {
    it('should set ToothNumber properly for permanent teeth', function () {
      var details = [{ ToothId: '5' }];
      var result = patientPerioExamFactory.process({ ExamDetails: details });
      expect(result).not.toBeNull();
      expect(result.ExamDetails.length).toBe(1);
      expect(result.ExamDetails[0].ToothNumber).toBe(5);
    });

    it('should set ToothNumber properly for primary teeth', function () {
      var details = [{ ToothId: 'A' }];
      var result = patientPerioExamFactory.process({ ExamDetails: details });
      expect(result).not.toBeNull();
      expect(result.ExamDetails.length).toBe(1);
      expect(result.ExamDetails[0].ToothNumber).toBe(4);
    });

    it('should sort results by ToothNumber', function () {
      var details = [{ ToothId: '5' }, { ToothId: 'A' }];
      var result = patientPerioExamFactory.process({ ExamDetails: details });
      expect(result).not.toBeNull();
      expect(result.ExamDetails.length).toBe(2);
      expect(result.ExamDetails[0].ToothNumber).toBe(4);
    });
  });

  describe('setActiveExamPath function ->', function () {
    beforeEach(function () {
      patientPerioExamFactory.ActiveExamPath = null;
    });

    it('should take no action if ActivePerioExam is null', function () {
      patientPerioExamFactory.ActivePerioExam = null;
      patientPerioExamFactory.setActiveExamPath('path');
      expect(patientPerioExamFactory.ActiveExamPath).toBeNull();
    });

    it('should take no action if path is null', function () {
      patientPerioExamFactory.ActivePerioExam = {};
      patientPerioExamFactory.setActiveExamPath();
      expect(patientPerioExamFactory.ActiveExamPath).toBeNull();
    });

    it('should set ActiveExamPath to a copy of the parameter', function () {
      patientPerioExamFactory.ActivePerioExam = { ExamDetails: [] };
      var path = { ToothPockets: ['1'] };
      patientPerioExamFactory.setActiveExamPath(path);
      expect(patientPerioExamFactory.ActiveExamPath).toEqual(path);
    });

    it('should filter missing teeth from ActiveExamPath', function () {
      patientPerioExamFactory.ActivePerioExam = {
        ExamDetails: [
          { ToothNumber: 1, ToothState: '' },
          { ToothNumber: 2, ToothState: 'Missing' },
          { ToothNumber: 3, ToothState: 'MissingPrimary' },
        ],
      };
      var path = { ToothPockets: ['1,0', '2,0'] };
      patientPerioExamFactory.setActiveExamPath(path);
      expect(patientPerioExamFactory.ActiveExamPath).toEqual({
        ToothPockets: ['1,0'],
      });
    });

    it('should set UnfilteredActiveExamPath to copy of ActiveExamPath', function () {
      patientPerioExamFactory.ActivePerioExam = {
        ExamDetails: [
          { ToothNumber: 1, ToothState: '' },
          { ToothNumber: 2, ToothState: 'Missing' },
        ],
      };
      patientPerioExamFactory.UnfilteredActiveExamPath = null;
      var path = { ToothPockets: ['1,0', '2,0'] };
      patientPerioExamFactory.setActiveExamPath(path);
      expect(patientPerioExamFactory.UnfilteredActiveExamPath).toEqual({
        ToothPockets: ['1,0'],
      });
    });
  });

  describe('arrowAdvanceToNextValidTooth function ->', function () {
    it('should advance to the next highest tooth number if direction is forward', function () {
      let perioExams = [
        { ToothId: '1', ToothState: '' },
        { ToothId: '2', ToothState: '' },
        { ToothId: '3', ToothState: '' },
        { ToothId: '32', ToothState: '' },
      ];
      let activeTooth = 1;
      let arrowDirection = 'forward';
      expect(
        patientPerioExamFactory.ArrowAdvanceToNextValidTooth(
          perioExams,
          activeTooth,
          arrowDirection
        )
      ).toEqual('2');
    });

    it('should advance properly if a tooth is missing', function () {
      let perioExams = [
        { ToothId: '1', ToothState: '' },
        { ToothId: '2', ToothState: 'Missing' },
        { ToothId: '3', ToothState: '' },
        { ToothId: '32', ToothState: '' },
      ];
      let activeTooth = 1;
      let arrowDirection = 'forward';
      expect(
        patientPerioExamFactory.ArrowAdvanceToNextValidTooth(
          perioExams,
          activeTooth,
          arrowDirection
        )
      ).toEqual('3');
    });

    it('should advance to the next lowest tooth number if direction is reverse', function () {
      let perioExams = [
        { ToothId: '1', ToothState: '' },
        { ToothId: '2', ToothState: 'Missing' },
        { ToothId: '3', ToothState: '' },
        { ToothId: '32', ToothState: '' },
      ];
      let activeTooth = 1;
      let arrowDirection = 'reverse';
      expect(
        patientPerioExamFactory.ArrowAdvanceToNextValidTooth(
          perioExams,
          activeTooth,
          arrowDirection
        )
      ).toEqual('32');
    });

    it('should advance to the next lowest tooth properly if direction is reverse', function () {
      let perioExams = [
        { ToothId: '1', ToothState: '' },
        { ToothId: '2', ToothState: 'Missing' },
        { ToothId: '3', ToothState: '' },
        { ToothId: '32', ToothState: '' },
      ];
      let activeTooth = 3;
      let arrowDirection = 'reverse';
      expect(
        patientPerioExamFactory.ArrowAdvanceToNextValidTooth(
          perioExams,
          activeTooth,
          arrowDirection
        )
      ).toEqual('1');
    });
  });
});
