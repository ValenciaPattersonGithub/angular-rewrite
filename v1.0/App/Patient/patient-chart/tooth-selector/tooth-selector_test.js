describe('toothSelector directive ->', function () {
  beforeEach(module('Soar.Common'));
  beforeEach(module('common.factories'));
  beforeEach(module('Soar.Patient'));

  var teethDefinitionsMock = {
    Value: {
      Teeth: [
        {
          ToothId: 1,
          USNumber: '1',
          UniversalNumber: 18,
          ToothStructure: 'Permanent',
          ArchName: 'Maxillary',
          MouthSide: 'Right',
          ToothType: 'Third Molar',
          QuadrantName: 'Upper Right',
          ArchPosition: 'Upper',
          ToothPosition: 'Posterior',
          Description: 'Permanent Maxillary Right Third Molar',
          DetailedSurfaceGroupId: 1,
        },
        {
          ToothId: 2,
          USNumber: '2',
          UniversalNumber: 17,
          ToothStructure: 'Permanent',
          ArchName: 'Maxillary',
          MouthSide: 'Right',
          ToothType: 'Second Molar',
          QuadrantName: 'Upper Right',
          ArchPosition: 'Upper',
          ToothPosition: 'Posterior',
          Description: 'Permanent Maxillary Right Second Molar',
          DetailedSurfaceGroupId: 1,
        },
        {
          ToothId: 3,
          USNumber: '3',
          UniversalNumber: 16,
          ToothStructure: 'Permanent',
          ArchName: 'Maxillary',
          MouthSide: 'Right',
          ToothType: 'First Molar',
          QuadrantName: 'Upper Right',
          ArchPosition: 'Upper',
          ToothPosition: 'Posterior',
          Description: 'Permanent Maxillary Right First Molar',
          DetailedSurfaceGroupId: 2,
        },
        {
          ToothId: 4,
          USNumber: '4',
          UniversalNumber: 15,
          ToothStructure: 'Permanent',
          ArchName: 'Maxillary',
          MouthSide: 'Right',
          ToothType: 'Second Premolar',
          QuadrantName: 'Upper Right',
          ArchPosition: 'Upper',
          ToothPosition: 'Posterior',
          Description: 'Permanent Maxillary Right Second Premolar',
          DetailedSurfaceGroupId: 4,
        },
        {
          ToothId: 5,
          USNumber: '5',
          UniversalNumber: 14,
          ToothStructure: 'Permanent',
          ArchName: 'Maxillary',
          MouthSide: 'Right',
          ToothType: 'First Premolar',
          QuadrantName: 'Upper Right',
          ArchPosition: 'Upper',
          ToothPosition: 'Posterior',
          Description: 'Permanent Maxillary Right First Premolar',
          DetailedSurfaceGroupId: 4,
        },
        {
          ToothId: 6,
          USNumber: '6',
          UniversalNumber: 13,
          ToothStructure: 'Permanent',
          ArchName: 'Maxillary',
          MouthSide: 'Right',
          ToothType: 'Canine',
          QuadrantName: 'Upper Right',
          ArchPosition: 'Upper',
          ToothPosition: 'Anterior',
          Description: 'Permanent Maxillary Right Canine',
          DetailedSurfaceGroupId: 5,
        },
        {
          ToothId: 7,
          USNumber: '7',
          UniversalNumber: 12,
          ToothStructure: 'Permanent',
          ArchName: 'Maxillary',
          MouthSide: 'Right',
          ToothType: 'Lateral Incisor',
          QuadrantName: 'Upper Right',
          ArchPosition: 'Upper',
          ToothPosition: 'Anterior',
          Description: 'Permanent Maxillary Right Lateral Incisor',
          DetailedSurfaceGroupId: 5,
        },
        {
          ToothId: 8,
          USNumber: '8',
          UniversalNumber: 11,
          ToothStructure: 'Permanent',
          ArchName: 'Maxillary',
          MouthSide: 'Right',
          ToothType: 'Central Incisor',
          QuadrantName: 'Upper Right',
          ArchPosition: 'Upper',
          ToothPosition: 'Anterior',
          Description: 'Permanent Maxillary Right Central Incisor',
          DetailedSurfaceGroupId: 5,
        },
        {
          ToothId: 9,
          USNumber: '9',
          UniversalNumber: 21,
          ToothStructure: 'Permanent',
          ArchName: 'Maxillary',
          MouthSide: 'Left',
          ToothType: 'Central Incisor',
          QuadrantName: 'Upper Left',
          ArchPosition: 'Upper',
          ToothPosition: 'Anterior',
          Description: 'Permanent Maxillary Left Central Incisor',
          DetailedSurfaceGroupId: 5,
        },
        {
          ToothId: 10,
          USNumber: '10',
          UniversalNumber: 22,
          ToothStructure: 'Permanent',
          ArchName: 'Maxillary',
          MouthSide: 'Left',
          ToothType: 'Lateral Incisor',
          QuadrantName: 'Upper Left',
          ArchPosition: 'Upper',
          ToothPosition: 'Anterior',
          Description: 'Permanent Maxillary Left Lateral Incisor',
          DetailedSurfaceGroupId: 5,
        },
        {
          ToothId: 11,
          USNumber: '11',
          UniversalNumber: 23,
          ToothStructure: 'Permanent',
          ArchName: 'Maxillary',
          MouthSide: 'Left',
          ToothType: 'Canine',
          QuadrantName: 'Upper Left',
          ArchPosition: 'Upper',
          ToothPosition: 'Anterior',
          Description: 'Permanent Maxillary Left Canine',
          DetailedSurfaceGroupId: 5,
        },
        {
          ToothId: 12,
          USNumber: '12',
          UniversalNumber: 24,
          ToothStructure: 'Permanent',
          ArchName: 'Maxillary',
          MouthSide: 'Left',
          ToothType: 'First Premolar',
          QuadrantName: 'Upper Left',
          ArchPosition: 'Upper',
          ToothPosition: 'Posterior',
          Description: 'Permanent Maxillary Left First Premolar',
          DetailedSurfaceGroupId: 4,
        },
        {
          ToothId: 13,
          USNumber: '13',
          UniversalNumber: 25,
          ToothStructure: 'Permanent',
          ArchName: 'Maxillary',
          MouthSide: 'Left',
          ToothType: 'Second Premolar',
          QuadrantName: 'Upper Left',
          ArchPosition: 'Upper',
          ToothPosition: 'Posterior',
          Description: 'Permanent Maxillary Left Second Premolar',
          DetailedSurfaceGroupId: 4,
        },
        {
          ToothId: 14,
          USNumber: '14',
          UniversalNumber: 26,
          ToothStructure: 'Permanent',
          ArchName: 'Maxillary',
          MouthSide: 'Left',
          ToothType: 'First Molar',
          QuadrantName: 'Upper Left',
          ArchPosition: 'Upper',
          ToothPosition: 'Posterior',
          Description: 'Permanent Maxillary Left First Molar',
          DetailedSurfaceGroupId: 2,
        },
        {
          ToothId: 15,
          USNumber: '15',
          UniversalNumber: 27,
          ToothStructure: 'Permanent',
          ArchName: 'Maxillary',
          MouthSide: 'Left',
          ToothType: 'Second Molar',
          QuadrantName: 'Upper Left',
          ArchPosition: 'Upper',
          ToothPosition: 'Posterior',
          Description: 'Permanent Maxillary Left Second Molar',
          DetailedSurfaceGroupId: 1,
        },
        {
          ToothId: 16,
          USNumber: '16',
          UniversalNumber: 28,
          ToothStructure: 'Permanent',
          ArchName: 'Maxillary',
          MouthSide: 'Left',
          ToothType: 'Third Molar',
          QuadrantName: 'Upper Left',
          ArchPosition: 'Upper',
          ToothPosition: 'Posterior',
          Description: 'Permanent Maxillary Left Third Molar',
          DetailedSurfaceGroupId: 1,
        },
        {
          ToothId: 17,
          USNumber: '17',
          UniversalNumber: 38,
          ToothStructure: 'Permanent',
          ArchName: 'Mandibular',
          MouthSide: 'Left',
          ToothType: 'Third Molar',
          QuadrantName: 'Lower Left',
          ArchPosition: 'Lower',
          ToothPosition: 'Posterior',
          Description: 'Permanent Mandibular Left Third Molar',
          DetailedSurfaceGroupId: 1,
        },
        {
          ToothId: 18,
          USNumber: '18',
          UniversalNumber: 37,
          ToothStructure: 'Permanent',
          ArchName: 'Mandibular',
          MouthSide: 'Left',
          ToothType: 'Second Molar',
          QuadrantName: 'Lower Left',
          ArchPosition: 'Lower',
          ToothPosition: 'Posterior',
          Description: 'Permanent Mandibular Left Second Molar',
          DetailedSurfaceGroupId: 1,
        },
        {
          ToothId: 19,
          USNumber: '19',
          UniversalNumber: 36,
          ToothStructure: 'Permanent',
          ArchName: 'Mandibular',
          MouthSide: 'Left',
          ToothType: 'First Molar',
          QuadrantName: 'Lower Left',
          ArchPosition: 'Lower',
          ToothPosition: 'Posterior',
          Description: 'Permanent Mandibular Left First Molar',
          DetailedSurfaceGroupId: 3,
        },
        {
          ToothId: 20,
          USNumber: '20',
          UniversalNumber: 35,
          ToothStructure: 'Permanent',
          ArchName: 'Mandibular',
          MouthSide: 'Left',
          ToothType: 'Second Premolar',
          QuadrantName: 'Lower Left',
          ArchPosition: 'Lower',
          ToothPosition: 'Posterior',
          Description: 'Permanent Mandibular Left Second Premolar',
          DetailedSurfaceGroupId: 4,
        },
        {
          ToothId: 21,
          USNumber: '21',
          UniversalNumber: 34,
          ToothStructure: 'Permanent',
          ArchName: 'Mandibular',
          MouthSide: 'Left',
          ToothType: 'First Premolar',
          QuadrantName: 'Lower Left',
          ArchPosition: 'Lower',
          ToothPosition: 'Posterior',
          Description: 'Permanent Mandibular Left First Premolar',
          DetailedSurfaceGroupId: 4,
        },
        {
          ToothId: 22,
          USNumber: '22',
          UniversalNumber: 33,
          ToothStructure: 'Permanent',
          ArchName: 'Mandibular',
          MouthSide: 'Left',
          ToothType: 'Canine',
          QuadrantName: 'Lower Left',
          ArchPosition: 'Lower',
          ToothPosition: 'Anterior',
          Description: 'Permanent Mandibular Left Canine',
          DetailedSurfaceGroupId: 5,
        },
        {
          ToothId: 23,
          USNumber: '23',
          UniversalNumber: 32,
          ToothStructure: 'Permanent',
          ArchName: 'Mandibular',
          MouthSide: 'Left',
          ToothType: 'Lateral Incisor',
          QuadrantName: 'Lower Left',
          ArchPosition: 'Lower',
          ToothPosition: 'Anterior',
          Description: 'Permanent Mandibular Left Lateral Incisor',
          DetailedSurfaceGroupId: 5,
        },
        {
          ToothId: 24,
          USNumber: '24',
          UniversalNumber: 31,
          ToothStructure: 'Permanent',
          ArchName: 'Mandibular',
          MouthSide: 'Left',
          ToothType: 'Central Incisor',
          QuadrantName: 'Lower Left',
          ArchPosition: 'Lower',
          ToothPosition: 'Anterior',
          Description: 'Permanent Mandibular Left Central Incisor',
          DetailedSurfaceGroupId: 5,
        },
        {
          ToothId: 25,
          USNumber: '25',
          UniversalNumber: 41,
          ToothStructure: 'Permanent',
          ArchName: 'Mandibular',
          MouthSide: 'Right',
          ToothType: 'Central Incisor',
          QuadrantName: 'Lower Right',
          ArchPosition: 'Lower',
          ToothPosition: 'Anterior',
          Description: 'Permanent Mandibular Right Central Incisor',
          DetailedSurfaceGroupId: 5,
        },
        {
          ToothId: 26,
          USNumber: '26',
          UniversalNumber: 42,
          ToothStructure: 'Permanent',
          ArchName: 'Mandibular',
          MouthSide: 'Right',
          ToothType: 'Lateral Incisor',
          QuadrantName: 'Lower Right',
          ArchPosition: 'Lower',
          ToothPosition: 'Anterior',
          Description: 'Permanent Mandibular Right Lateral Incisor',
          DetailedSurfaceGroupId: 5,
        },
        {
          ToothId: 27,
          USNumber: '27',
          UniversalNumber: 43,
          ToothStructure: 'Permanent',
          ArchName: 'Mandibular',
          MouthSide: 'Right',
          ToothType: 'Canine',
          QuadrantName: 'Lower Right',
          ArchPosition: 'Lower',
          ToothPosition: 'Anterior',
          Description: 'Permanent Mandibular Right Canine',
          DetailedSurfaceGroupId: 5,
        },
        {
          ToothId: 28,
          USNumber: '28',
          UniversalNumber: 44,
          ToothStructure: 'Permanent',
          ArchName: 'Mandibular',
          MouthSide: 'Right',
          ToothType: 'First Premolar',
          QuadrantName: 'Lower Right',
          ArchPosition: 'Lower',
          ToothPosition: 'Posterior',
          Description: 'Permanent Mandibular Right First Premolar',
          DetailedSurfaceGroupId: 4,
        },
        {
          ToothId: 29,
          USNumber: '29',
          UniversalNumber: 45,
          ToothStructure: 'Permanent',
          ArchName: 'Mandibular',
          MouthSide: 'Right',
          ToothType: 'Second Premolar',
          QuadrantName: 'Lower Right',
          ArchPosition: 'Lower',
          ToothPosition: 'Posterior',
          Description: 'Permanent Mandibular Right Second Premolar',
          DetailedSurfaceGroupId: 4,
        },
        {
          ToothId: 30,
          USNumber: '30',
          UniversalNumber: 46,
          ToothStructure: 'Permanent',
          ArchName: 'Mandibular',
          MouthSide: 'Right',
          ToothType: 'First Molar',
          QuadrantName: 'Lower Right',
          ArchPosition: 'Lower',
          ToothPosition: 'Posterior',
          Description: 'Permanent Mandibular Right First Molar',
          DetailedSurfaceGroupId: 3,
        },
        {
          ToothId: 31,
          USNumber: '31',
          UniversalNumber: 47,
          ToothStructure: 'Permanent',
          ArchName: 'Mandibular',
          MouthSide: 'Right',
          ToothType: 'Second Molar',
          QuadrantName: 'Lower Right',
          ArchPosition: 'Lower',
          ToothPosition: 'Posterior',
          Description: 'Permanent Mandibular Right Second Molar',
          DetailedSurfaceGroupId: 1,
        },
        {
          ToothId: 32,
          USNumber: '32',
          UniversalNumber: 48,
          ToothStructure: 'Permanent',
          ArchName: 'Mandibular',
          MouthSide: 'Right',
          ToothType: 'Third Molar',
          QuadrantName: 'Lower Right',
          ArchPosition: 'Lower',
          ToothPosition: 'Posterior',
          Description: 'Permanent Mandibular Right Third Molar',
          DetailedSurfaceGroupId: 1,
        },
        {
          ToothId: 33,
          USNumber: 'A',
          UniversalNumber: 55,
          ToothStructure: 'Primary',
          ArchName: 'Maxillary',
          MouthSide: 'Right',
          ToothType: 'Second Molar',
          QuadrantName: 'Upper Right',
          ArchPosition: 'Upper',
          ToothPosition: 'Posterior',
          Description: 'Primary Maxillary Right Second Molar',
          DetailedSurfaceGroupId: 1,
        },
        {
          ToothId: 34,
          USNumber: 'B',
          UniversalNumber: 54,
          ToothStructure: 'Primary',
          ArchName: 'Maxillary',
          MouthSide: 'Right',
          ToothType: 'First Molar',
          QuadrantName: 'Upper Right',
          ArchPosition: 'Upper',
          ToothPosition: 'Posterior',
          Description: 'Primary Maxillary Right First Molar',
          DetailedSurfaceGroupId: 1,
        },
        {
          ToothId: 35,
          USNumber: 'C',
          UniversalNumber: 53,
          ToothStructure: 'Primary',
          ArchName: 'Maxillary',
          MouthSide: 'Right',
          ToothType: 'Canine',
          QuadrantName: 'Upper Right',
          ArchPosition: 'Upper',
          ToothPosition: 'Anterior',
          Description: 'Primary Maxillary Right Canine',
          DetailedSurfaceGroupId: 5,
        },
        {
          ToothId: 36,
          USNumber: 'D',
          UniversalNumber: 52,
          ToothStructure: 'Primary',
          ArchName: 'Maxillary',
          MouthSide: 'Right',
          ToothType: 'Lateral Incisor',
          QuadrantName: 'Upper Right',
          ArchPosition: 'Upper',
          ToothPosition: 'Anterior',
          Description: 'Primary Maxillary Right Lateral Incisor',
          DetailedSurfaceGroupId: 5,
        },
        {
          ToothId: 37,
          USNumber: 'E',
          UniversalNumber: 51,
          ToothStructure: 'Primary',
          ArchName: 'Maxillary',
          MouthSide: 'Right',
          ToothType: 'Central Incisor',
          QuadrantName: 'Upper Right',
          ArchPosition: 'Upper',
          ToothPosition: 'Anterior',
          Description: 'Primary Maxillary Right Central Incisor',
          DetailedSurfaceGroupId: 5,
        },
        {
          ToothId: 38,
          USNumber: 'F',
          UniversalNumber: 61,
          ToothStructure: 'Primary',
          ArchName: 'Maxillary',
          MouthSide: 'Left',
          ToothType: 'Central Incisor',
          QuadrantName: 'Upper Left',
          ArchPosition: 'Upper',
          ToothPosition: 'Anterior',
          Description: 'Primary Maxillary Left Central Incisor',
          DetailedSurfaceGroupId: 5,
        },
        {
          ToothId: 39,
          USNumber: 'G',
          UniversalNumber: 62,
          ToothStructure: 'Primary',
          ArchName: 'Maxillary',
          MouthSide: 'Left',
          ToothType: 'Lateral Incisor',
          QuadrantName: 'Upper Left',
          ArchPosition: 'Upper',
          ToothPosition: 'Anterior',
          Description: 'Primary Maxillary Left Lateral Incisor',
          DetailedSurfaceGroupId: 5,
        },
        {
          ToothId: 40,
          USNumber: 'H',
          UniversalNumber: 63,
          ToothStructure: 'Primary',
          ArchName: 'Maxillary',
          MouthSide: 'Left',
          ToothType: 'Canine',
          QuadrantName: 'Upper Left',
          ArchPosition: 'Upper',
          ToothPosition: 'Anterior',
          Description: 'Primary Maxillary Left Canine',
          DetailedSurfaceGroupId: 5,
        },
        {
          ToothId: 41,
          USNumber: 'I',
          UniversalNumber: 64,
          ToothStructure: 'Primary',
          ArchName: 'Maxillary',
          MouthSide: 'Left',
          ToothType: 'First Molar',
          QuadrantName: 'Upper Left',
          ArchPosition: 'Upper',
          ToothPosition: 'Posterior',
          Description: 'Primary Maxillary Left First Molar',
          DetailedSurfaceGroupId: 1,
        },
        {
          ToothId: 42,
          USNumber: 'J',
          UniversalNumber: 65,
          ToothStructure: 'Primary',
          ArchName: 'Maxillary',
          MouthSide: 'Left',
          ToothType: 'Second Molar',
          QuadrantName: 'Upper Left',
          ArchPosition: 'Upper',
          ToothPosition: 'Posterior',
          Description: 'Primary Maxillary Left Second Molar',
          DetailedSurfaceGroupId: 1,
        },
        {
          ToothId: 43,
          USNumber: 'K',
          UniversalNumber: 75,
          ToothStructure: 'Primary',
          ArchName: 'Mandibular',
          MouthSide: 'Left',
          ToothType: 'Second Molar',
          QuadrantName: 'Lower Left',
          ArchPosition: 'Lower',
          ToothPosition: 'Posterior',
          Description: 'Primary Mandibular Left Second Molar',
          DetailedSurfaceGroupId: 1,
        },
        {
          ToothId: 44,
          USNumber: 'L',
          UniversalNumber: 74,
          ToothStructure: 'Primary',
          ArchName: 'Mandibular',
          MouthSide: 'Left',
          ToothType: 'First Molar',
          QuadrantName: 'Lower Left',
          ArchPosition: 'Lower',
          ToothPosition: 'Posterior',
          Description: 'Primary Mandibular Left First Molar',
          DetailedSurfaceGroupId: 1,
        },
        {
          ToothId: 45,
          USNumber: 'M',
          UniversalNumber: 73,
          ToothStructure: 'Primary',
          ArchName: 'Mandibular',
          MouthSide: 'Left',
          ToothType: 'Canine',
          QuadrantName: 'Lower Left',
          ArchPosition: 'Lower',
          ToothPosition: 'Anterior',
          Description: 'Primary Mandibular Left Canine',
          DetailedSurfaceGroupId: 5,
        },
        {
          ToothId: 46,
          USNumber: 'N',
          UniversalNumber: 72,
          ToothStructure: 'Primary',
          ArchName: 'Mandibular',
          MouthSide: 'Left',
          ToothType: 'Lateral Incisor',
          QuadrantName: 'Lower Left',
          ArchPosition: 'Lower',
          ToothPosition: 'Anterior',
          Description: 'Primary Mandibular Left Lateral Incisor',
          DetailedSurfaceGroupId: 5,
        },
        {
          ToothId: 47,
          USNumber: 'O',
          UniversalNumber: 71,
          ToothStructure: 'Primary',
          ArchName: 'Mandibular',
          MouthSide: 'Left',
          ToothType: 'Central Incisor',
          QuadrantName: 'Lower Left',
          ArchPosition: 'Lower',
          ToothPosition: 'Anterior',
          Description: 'Primary Mandibular Left Central Incisor',
          DetailedSurfaceGroupId: 5,
        },
        {
          ToothId: 48,
          USNumber: 'P',
          UniversalNumber: 81,
          ToothStructure: 'Primary',
          ArchName: 'Mandibular',
          MouthSide: 'Right',
          ToothType: 'Central Incisor',
          QuadrantName: 'Lower Right',
          ArchPosition: 'Lower',
          ToothPosition: 'Anterior',
          Description: 'Primary Mandibular Right Central Incisor',
          DetailedSurfaceGroupId: 5,
        },
        {
          ToothId: 49,
          USNumber: 'Q',
          UniversalNumber: 82,
          ToothStructure: 'Primary',
          ArchName: 'Mandibular',
          MouthSide: 'Right',
          ToothType: 'Lateral Incisor',
          QuadrantName: 'Lower Right',
          ArchPosition: 'Lower',
          ToothPosition: 'Anterior',
          Description: 'Primary Mandibular Right Lateral Incisor',
          DetailedSurfaceGroupId: 5,
        },
        {
          ToothId: 50,
          USNumber: 'R',
          UniversalNumber: 83,
          ToothStructure: 'Primary',
          ArchName: 'Mandibular',
          MouthSide: 'Right',
          ToothType: 'Canine',
          QuadrantName: 'Lower Right',
          ArchPosition: 'Lower',
          ToothPosition: 'Anterior',
          Description: 'Primary Mandibular Right Canine',
          DetailedSurfaceGroupId: 5,
        },
        {
          ToothId: 51,
          USNumber: 'S',
          UniversalNumber: 84,
          ToothStructure: 'Primary',
          ArchName: 'Mandibular',
          MouthSide: 'Right',
          ToothType: 'First Molar',
          QuadrantName: 'Lower Right',
          ArchPosition: 'Lower',
          ToothPosition: 'Posterior',
          Description: 'Primary Mandibular Right First Molar',
          DetailedSurfaceGroupId: 1,
        },
        {
          ToothId: 52,
          USNumber: 'T',
          UniversalNumber: 85,
          ToothStructure: 'Primary',
          ArchName: 'Mandibular',
          MouthSide: 'Right',
          ToothType: 'Second Molar',
          QuadrantName: 'Lower Right',
          ArchPosition: 'Lower',
          ToothPosition: 'Posterior',
          Description: 'Primary Mandibular Right Second Molar',
          DetailedSurfaceGroupId: 1,
        },
      ],
    },
  };

  describe('controller -> ', function () {
    var scope, ctrl, listHelper, staticData, toothSelectionService, deferred, q;

    // create spies for services
    beforeEach(
      module('Soar.Patient', function ($provide) {
        staticData = {};
        //mock for staticData.TeethDefinitions
        staticData.TeethDefinitions = jasmine.createSpy().and.callFake(function () {
          deferred = q.defer();
          deferred.resolve(teethDefinitionsMock);
          return deferred.promise;
        });
        $provide.value('StaticData', staticData);

        var tooth = { permanentNumber: 32, primaryLetter: 'A' };

        toothSelectionService = {
          getToothDataByTooth: jasmine.createSpy().and.returnValue(tooth),
        };
        $provide.value('ToothSelectionService', toothSelectionService);
      })
    );

    beforeEach(inject(function ($rootScope, $controller, $injector, $q) {
      scope = $rootScope.$new();
      q = $q;
      scope.allTeeth = teethDefinitionsMock.Value.Teeth;
      scope.selectedTeeth = [];

      //mock for listHelper service
      listHelper = {
        findItemByFieldValue: jasmine.createSpy('listHelper.findItemByFieldValue').and.returnValue(null),
        findIndexByFieldValue: jasmine.createSpy('listHelper.findIndexByFieldValue').and.returnValue(-1),
      };

      ctrl = $controller('ToothSelectorController', {
        $scope: scope,
        ListHelper: listHelper,
        StaticData: staticData,
        ToothSelectionService: toothSelectionService,
      });
      var soarConfig = $injector.get('SoarConfig');
      var $httpBackend = $injector.get('$httpBackend');
      $httpBackend.expectGET(soarConfig.domainUrl + '/applicationsettings/teethdefinitions');
    }));

    describe('initial setup -> ', function () {
      it('controller should exist', function () {
        expect(ctrl).toBeDefined();
      });
    });

    describe('getTeethDefinitions function -> ', function () {
      it('should call staticData.TeethDefinitions', function () {
        ctrl.getTeethDefinitions();
        expect(staticData.TeethDefinitions).toHaveBeenCalled();
      });
    });

    describe('updatedSelectedTeethList function -> ', function () {
      it('should add tooth to list if it is not already there', function () {
        scope.clearTeeth();
        ctrl.updatedSelectedTeethList(scope.allTeeth[41]);
        expect(scope.selectedTeeth[0].USNumber).toBe('J');
      });

      it('should remove tooth from list if it is already there', function () {
        scope.clearTeeth();
        scope.selectTooth(scope.allTeeth[22]);
        listHelper.findIndexByFieldValue = jasmine.createSpy('listHelper.findIndexByFieldValue').and.returnValue(0);
        expect(scope.selectedTeeth[0].USNumber).toBe('23');
        ctrl.updatedSelectedTeethList(scope.allTeeth[22]);
        expect(scope.selectedTeeth.length).toBe(0);
      });
    });

    describe('selectTooth function -> ', function () {
      it('should call updatedSelectedTeethList', function () {
        spyOn(ctrl, 'updatedSelectedTeethList');
        scope.selectTooth(scope.allTeeth[22]);
        expect(ctrl.updatedSelectedTeethList).toHaveBeenCalled();
      });

      it('should call validateToothSelection when validateSelection is true', function () {
        scope.validateSelection = true;
        spyOn(scope, 'validateToothSelection');
        spyOn(ctrl, 'updatedSelectedTeethList');
        scope.selectTooth(scope.allTeeth[22]);
        expect(scope.validateToothSelection).toHaveBeenCalled();
        expect(ctrl.updatedSelectedTeethList).toHaveBeenCalled();
      });

      it("should again call updatedSelectedTeethList to deselect previously selected tooth if selectedTeeth length is '2'", function () {
        scope.multiselectEnabled = false;
        spyOn(ctrl, 'updatedSelectedTeethList');
        scope.selectedTeeth.push(scope.allTeeth[21]);
        scope.selectedTeeth.push(scope.allTeeth[22]);
        listHelper.findItemByFieldValue = jasmine
          .createSpy('listHelper.findItemByFieldValue')
          .and.returnValue(scope.allTeeth[21]);
        scope.selectTooth(scope.allTeeth[22]);
        expect(ctrl.updatedSelectedTeethList).toHaveBeenCalled();
      });
    });

    describe('selectMultipleTeeth function -> ', function () {
      it('should add 18 permanent upper teeth to list', function () {
        scope.multiselectEnabled = true;
        scope.selectedToothStructure = 'Permanent';
        scope.selectMultipleTeeth('Upper', 'ArchPosition');
        expect(scope.selectedTeeth.length).toBe(16);
        angular.forEach(scope.selectedTeeth, function (tooth) {
          expect(tooth.ArchPosition).toBe('Upper');
          expect(tooth.ToothStructure).toBe('Permanent');
        });
      });

      it('should remove selected tooth from list if a multi-selection does not include it', function () {
        scope.multiselectEnabled = true;
        scope.selectedToothStructure = 'Primary';
        scope.selectMultipleTeeth('Lower Left', 'QuadrantName');
        expect(scope.selectedTeeth.length).toBe(5);
        scope.selectTooth(scope.allTeeth[7]);
        expect(scope.selectedTeeth.length).toBe(6);
        scope.selectMultipleTeeth('Lower Left', 'QuadrantName');
        expect(scope.selectedTeeth.length).toBe(1);
      });

      it('should add 5 primary lower right eeth to list', function () {
        scope.multiselectEnabled = true;
        scope.selectedToothStructure = 'Primary';
        scope.selectMultipleTeeth('Lower Right', 'QuadrantName');
        expect(scope.selectedTeeth.length).toBe(5);
        angular.forEach(scope.selectedTeeth, function (tooth) {
          expect(tooth.QuadrantName).toBe('Lower Right');
          expect(tooth.ToothStructure).toBe('Primary');
        });
      });

      it('should add teeth to the selectedTeeth array when a quadrant is selected', function () {
        scope.multiselectEnabled = true;
        scope.selectedToothStructure = 'Permanent';
        scope.selectMultipleTeeth('Upper Right', 'QuadrantName');
        expect(scope.selectedTeeth.length).toBe(8);
        angular.forEach(scope.selectedTeeth, function (tooth) {
          expect(tooth.QuadrantName).toBe('Upper Right');
          expect(tooth.ToothStructure).toBe('Permanent');
        });
      });

      it('should remove teeth from the selectedTeeth array when a quadrant is deselected', function () {
        scope.multiselectEnabled = true;
        scope.selectedToothStructure = 'Permanent';

        scope.selectMultipleTeeth('Upper Right', 'QuadrantName');
        expect(scope.selectedTeeth.length).toBe(8);

        scope.selectMultipleTeeth('Upper Right', 'QuadrantName');
        expect(scope.selectedTeeth.length).toBe(0);
      });
    });

    describe('clearTeeth function -> ', function () {
      it('should clear selectedTeeth list', function () {
        scope.clearTeeth();
        expect(scope.selectedTeeth).toEqual([]);
      });

      it('should set all teeth to unselected', function () {
        scope.clearTeeth();
        angular.forEach(scope.allTeeth, function (tooth) {
          expect(tooth.Selected).toBe(false);
        });
      });
    });

    describe('toggleToothStructure function -> ', function () {
      it('should set selectedToothStructure to Primary', function () {
        scope.selectedToothStructure = 'Permanent';
        scope.toggleToothStructure();
        expect(scope.selectedToothStructure).toBe('Primary');
      });

      it('should set selectedToothStructure to Permanent', function () {
        scope.selectedToothStructure = 'Primary';
        scope.toggleToothStructure();
        expect(scope.selectedToothStructure).toBe('Permanent');
      });
    });

    describe('setWidgetDefaults function -> ', function () {
      it('should set disableSelection false if undefined', function () {
        ctrl.setWidgetDefaults();
        expect(scope.disableSelection).toBe(false);
      });

      it('should multiselectEnabled true if undefined', function () {
        ctrl.setWidgetDefaults();
        expect(scope.multiselectEnabled).toBe(true);
      });

      it('should quadrantSelectionOnly false if undefined', function () {
        ctrl.setWidgetDefaults();
        expect(scope.quadrantSelectionOnly).toBe(false);
      });
    });

    describe('$onInit function -> ', function () {
      it('should call getTeethDefinitions if widget is true', function () {
        scope.widget = true;
        spyOn(ctrl, 'getTeethDefinitions');
        ctrl.$onInit();
        expect(ctrl.getTeethDefinitions).toHaveBeenCalled();
      });

      it('should call setWidgetDefaults if widget is true', function () {
        scope.widget = true;
        spyOn(ctrl, 'setWidgetDefaults');
        ctrl.$onInit();
        expect(ctrl.setWidgetDefaults).toHaveBeenCalled();
      });

      it('should not call setWidgetDefaults if widget is false', function () {
        scope.widget = false;
        spyOn(ctrl, 'setWidgetDefaults');
        ctrl.$onInit();
        expect(ctrl.setWidgetDefaults).not.toHaveBeenCalled();
      });
    });

    describe('applyTeeth function -> ', function () {
      it('should emit tooth-selection-save and tooth-selection-ui-update with individual teeth when selectedQuadrant exists', function () {
        spyOn(scope, '$emit');

        // Set up selectedQuadrant with "Upper Left"
        scope.selectedQuadrant = [];
        scope.selectedQuadrant.push({ TeethOrQuadrant: 'UL' });
        scope.selectedToothStructure = 'Permanent';

        // Expected individual teeth for Upper Left quadrant (teeth 9-16)
        var expectedSaveTeeth = [
          { USNumber: '9' },
          { USNumber: '10' },
          { USNumber: '11' },
          { USNumber: '12' },
          { USNumber: '13' },
          { USNumber: '14' },
          { USNumber: '15' },
          { USNumber: '16' },
        ];

        var expectedUITeeth = [
          { TeethOrQuadrant: '9' },
          { TeethOrQuadrant: '10' },
          { TeethOrQuadrant: '11' },
          { TeethOrQuadrant: '12' },
          { TeethOrQuadrant: '13' },
          { TeethOrQuadrant: '14' },
          { TeethOrQuadrant: '15' },
          { TeethOrQuadrant: '16' },
        ];

        scope.applyTeeth();

        expect(scope.$emit).toHaveBeenCalledWith('tooth-selection-save', expectedSaveTeeth);
        expect(scope.$emit).toHaveBeenCalledWith('tooth-selection-ui-update', expectedUITeeth);
      });

      it('should emit tooth-selection-applied with selected teeth USNumber values if not selectedQuadrant', function () {
        spyOn(scope, '$emit');
        // setup selected Teeth
        scope.selectedQuadrant = [];
        var teeth = teethDefinitionsMock.Value.Teeth;
        scope.selectedTeeth.push(teeth[0]);
        scope.selectedTeeth.push(teeth[1]);
        var selectedToothArray = [];
        angular.forEach(scope.selectedTeeth, function (tooth) {
          selectedToothArray.push({ TeethOrQuadrant: tooth.USNumber });
        });
        scope.applyTeeth();
        expect(scope.$emit).toHaveBeenCalledWith('tooth-selection-ui-update', selectedToothArray);
      });
    });

    describe('quadrantSelected function -> ', function () {
      it('should set selectedQuadrant', function () {
        var quadrantMock = 'UR';
        scope.quadrantSelected(quadrantMock);
        expect(scope.selectedQuadrant[0].TeethOrQuadrant).toEqual(quadrantMock);
      });
    });

    describe('cancel function -> ', function () {
      it('should call clearTeeth', function () {
        spyOn(scope, 'clearTeeth');
        spyOn(scope, 'resetToOriginalValue');
        scope.isClinicalNote = false;
        scope.cancel();
        expect(scope.clearTeeth).toHaveBeenCalled();
        expect(scope.resetToOriginalValue).not.toHaveBeenCalled();
      });

      it('should call resetToOriginalValue when isClinicalNote is true', function () {
        spyOn(scope, 'clearTeeth');
        spyOn(scope, 'resetToOriginalValue');
        scope.isClinicalNote = true;
        scope.cancel();
        expect(scope.clearTeeth).not.toHaveBeenCalled();
        expect(scope.resetToOriginalValue).toHaveBeenCalled();
      });

      it('should set tChartPopoverActive false', function () {
        spyOn(scope, 'clearTeeth');
        scope.cancel();
        expect(scope.tChartPopoverActive).toBe(false);
      });
    });

    describe('toggleTChartActive function -> ', function () {
      it('should set tChartPopoverActive to opposite value', function () {
        scope.tChartPopoverActive = true;
        scope.toggleTChartActive();
        expect(scope.tChartPopoverActive).toBe(false);
      });

      it('should set originalSelectedTeeth to selectedTeeth when popoverActive switches to true', function () {
        scope.tChartPopoverActive = false;
        scope.selectedTeeth = 'updated';
        scope.originalSelectedTeeth = 'original';
        scope.toggleTChartActive();
        expect(scope.originalSelectedTeeth).toEqual('updated');
      });

      it('should set originalSelectedTeeth to selectedTeeth when popoverActive switches to false', function () {
        scope.tChartPopoverActive = true;
        scope.selectedTeeth = 'updated';
        scope.originalSelectedTeeth = 'original';
        scope.toggleTChartActive();
        expect(scope.originalSelectedTeeth).toEqual('original');
      });
    });

    //validateToothSelection
    describe('validateToothSelection function -> ', function () {
      it('should call toothSelector.getToothDataByTooth method and deselect matching tooth by ToothId', function () {
        scope.clearTeeth();
        scope.selectTooth(scope.allTeeth[31]);
        ctrl.updatedSelectedTeethList(scope.allTeeth[31]);
        listHelper.findIndexByFieldValue = jasmine.createSpy('listHelper.findIndexByFieldValue').and.returnValue(0);

        scope.validateToothSelection(scope.allTeeth[31]);

        expect(toothSelectionService.getToothDataByTooth).toHaveBeenCalled();
      });

      it('should call toothSelector.getToothDataByTooth method and deselect matching tooth by USNumber', function () {
        scope.clearTeeth();
        scope.selectTooth(scope.allTeeth[32]);
        ctrl.updatedSelectedTeethList(scope.allTeeth[32]);
        listHelper.findIndexByFieldValue = jasmine.createSpy('listHelper.findIndexByFieldValue').and.returnValue(0);

        scope.validateToothSelection(scope.allTeeth[32]);

        expect(toothSelectionService.getToothDataByTooth).toHaveBeenCalled();
      });

      it('should call toothSelector.getToothDataByTooth method and not deselect when matching tooth is not found by USNumber', function () {
        scope.clearTeeth();
        scope.selectTooth(scope.allTeeth[32]);
        ctrl.updatedSelectedTeethList(scope.allTeeth[32]);
        listHelper.findIndexByFieldValue = jasmine.createSpy('listHelper.findIndexByFieldValue').and.returnValue(-1);

        scope.validateToothSelection(scope.allTeeth[32]);

        expect(toothSelectionService.getToothDataByTooth).toHaveBeenCalled();
      });
    });
  });
});
