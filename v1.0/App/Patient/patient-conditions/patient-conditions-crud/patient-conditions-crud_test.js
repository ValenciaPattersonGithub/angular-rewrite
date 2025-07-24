describe('PatientConditionsCrudController ->', function () {
  var routeParams,
    toastrFactory,
    $uibModal,
    timeout,
    scope,
    $httpBackend,
    ctrl,
    element,
    compile,
    listHelper,
    setDateTimeFilter;
  var patientServices, staticData;
  var modalInstance, modalFactory, modalFactoryDeferred, q;

  var conditionsMockList = [
    {
      ConditionId: '1234',
      Description: 'First Condition',
      AffectedAreaId: 1,
    },
    {
      ConditionId: '2345',
      Description: 'Second Condition',
      AffectedAreaId: 4,
    },
    {
      ConditionId: '3456',
      Description: 'Third Condition',
      AffectedAreaId: 5,
    },
    {
      ConditionId: '1235',
      Description: 'Fourth Condition',
      AffectedAreaId: 3,
    },
  ];

  var conditionsMockResult = {
    Value: conditionsMockList,
  };

  var personIdMock = 'b3eb6f7f-7b4a-4be5-b8ac-d24cccdd42b9';

  var providersMockResponse = {
    Value: [
      {
        UserId: 10,
        FirstName: 'Bill',
        LastName: 'Murray',
        IsActive: false,
      },
      {
        UserId: 11,
        FirstName: 'Dan',
        LastName: 'Belushi',
        IsActive: true,
      },
    ],
  };

  var providersMock = providersMockResponse.Value;

  var mockSurface = 'SU';
  var mockTooth = '66';
  var newPatientConditionMock = {
    PatientConditionId: null,
    PatientId: personIdMock,
    ProviderId: null,
    ConditionId: '',
    ConditionDate: moment.utc().format('MM/DD/YYYY'),
    Tooth: null,
    Surfaces: null,
    Roots: null,
    IsActive: true,
  };

  var newPatientConditionIdMock = '123456789eee';
  var createdConditionMock = {
    PersonId: personIdMock,
    PatientCondition: newPatientConditionMock,
    ConditionDate: moment.utc().format('MM/DD/YYYY'),
    ProviderId: providersMock[0],
    Surfaces: mockSurface,
    Tooth: mockTooth,
    IsActive: true,
    ConditionId: conditionsMockList[0],
  };

  var createdConditionMockResponse = {
    Value: createdConditionMock,
  };

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

  var teethSelectedViaOdontogram = [{ toothId: 3 }, { toothId: 8 }];

  var selectedConditionDataMock = {
    ConditionId: 121,
    AffectedAreaId: 2,
  };

  //#endregion

  //#region spies for services...

  beforeEach(module('Soar.Common'));
  beforeEach(module('common.factories'));
  beforeEach(module('Soar.Patient'));

  // create spies for services

  beforeEach(
    module('Soar.Patient', function ($provide) {
      patientServices = {
        Conditions: {
          save: jasmine
            .createSpy()
            .and.returnValue(createdConditionMockResponse),
        },
      };
      $provide.value('PatientServices', patientServices);

      staticData = {
        TeethDefinitions: function () {
          return {
            then: function () {
              return teethDefinitionsMock;
            },
          };
        },
        TeethQuadrantAbbreviations: function () {
          return {
            then: function () {
              return {
                'Upper Right': 'UR',
                'Upper Left': 'UL',
                'Lower Left': 'LL',
                'Lower Right': 'LR',
              };
            },
          };
        },
      };
      $provide.value('StaticData', staticData);

      toastrFactory = {};
      toastrFactory.error = jasmine.createSpy();
      toastrFactory.success = jasmine.createSpy();
      $provide.value('toastrFactory', toastrFactory);

      setDateTimeFilter = jasmine.createSpy().and.returnValue('fakeDateTime');
      $provide.value('setDateTimeFilter', setDateTimeFilter);
    })
  );

  //#endregion

  // create controller and scope
  beforeEach(inject(function (
    $rootScope,
    $controller,
    $injector,
    $route,
    $routeParams,
    $compile,
    $timeout,
    $location,
    _$uibModal_,
    $q
  ) {
    q = $q;
    timeout = $timeout;
    compile = $compile;
    routeParams = $routeParams;

    $uibModal = _$uibModal_;
    spyOn($uibModal, 'open').and.callThrough();

    modalInstance = {
      close: jasmine
        .createSpy('modalInstance.close')
        .and.returnValue(createdConditionMock),
      dismiss: jasmine.createSpy('modalInstance.dismiss'),
      result: {
        then: jasmine.createSpy('modalInstance.result.then'),
      },
    };

    //mock for modalFactory
    modalFactory = {
      DeleteModal: jasmine
        .createSpy('modalFactory.DeleteModal')
        .and.callFake(function () {
          modalFactoryDeferred = q.defer();
          modalFactoryDeferred.resolve(1);
          return {
            result: modalFactoryDeferred.promise,
            then: function () {},
          };
        }),
      CancelModal: jasmine
        .createSpy('modalFactory.CancelModal')
        .and.callFake(function () {
          modalFactoryDeferred = q.defer();
          modalFactoryDeferred.resolve(1);
          return {
            result: modalFactoryDeferred.promise,
            then: function () {},
          };
        }),
    };

    scope = $rootScope.$new();

    scope.chartLedgerServices = [];

    ctrl = $controller('PatientConditionCrudController', {
      $scope: scope,
      patSecurityService: _authPatSecurityService_,
      personId: personIdMock,
      patientInfo: {},
      teeth: teethSelectedViaOdontogram,
      selectedConditionData: selectedConditionDataMock,
      conditions: conditionsMockList,
      providers: providersMock,
      patientCondition: null,
      ModalFactory: modalFactory,
      $uibModalInstance: modalInstance,
      PatientServices: patientServices,
      StaticData: staticData,
    });
  }));

  describe('initial setup -> ', function () {
    it('check if controller exists', function () {
      expect(ctrl).not.toBeNull();
    });

    it('should set scope properties', function () {
      expect(scope.editMode).toBe(false);
      expect(scope.savingForm).toBe(false);
      expect(scope.canCloseModal).toBe(true);
      expect(scope.previewTextColor).toBe('ff0000');
      expect(scope.providers).toEqual(providersMock);
      expect(scope.conditions).toEqual(conditionsMockList);
      expect(scope.preSelectedTeeth).toBe(teethSelectedViaOdontogram);
      expect(scope.surfaceSelectionDisabled).toBe(true);
    });

    it('should set ctrl properties', function () {
      expect(ctrl.preSelectedConditionData).toEqual(selectedConditionDataMock);
    });
  });

  describe('addSelectedTeeth -> ', function () {
    it('should populate selectedTeeth array with teeth selected via the odontogram', function () {
      ctrl.addSelectedTeeth(teethDefinitionsMock.Value.Teeth);
      expect(scope.selectedTeeth).toEqual([
        teethDefinitionsMock.Value.Teeth[2],
        teethDefinitionsMock.Value.Teeth[7],
      ]);
    });

    it('should create empty list if no teeth were selected via the odontogram', function () {
      scope.preSelectedTeeth = [];
      ctrl.addSelectedTeeth(teethDefinitionsMock.Value.Teeth);
      expect(scope.selectedTeeth).toEqual([]);
    });

    it('should create originalSelectedTeeth', function () {
      scope.preSelectedTeeth = [];
      ctrl.addSelectedTeeth(teethDefinitionsMock.Value.Teeth);
      expect(scope.originalSelectedTeeth).toEqual([]);
    });

    //it('should set roots on selected teeth if patientCondition.Roots has value', function () {
    //    var editedCondition = {
    //        PersonId: personIdMock,
    //        PatientCondition: newPatientConditionMock,
    //        ConditionDate: moment.utc().format('MM/DD/YYYY'),
    //        ProviderId: providersMock[0],
    //        Surfaces: mockSurface,
    //        Roots: 'DB, P',
    //        Tooth: mockTooth,
    //        IsActive: true,
    //        ConditionId: conditionsMockList[0]
    //    }
    //    scope.patientCondition = editedCondition;
    //    dump(scope.patientCondition);
    //    jasmine.createSpy('listHelper.findItemByFieldValue').and.returnValue({ Tooth: mockTooth});
    //    ctrl.addSelectedTeeth(scope.preSelectedTeeth);
    //    console.log(teethDefinitionsMock.Value.Teeth[2].Roots)
    //    console.log(scope.preSelectedTeeth)
    //    expect(teethDefinitionsMock.Value.Teeth[2].Roots).toEqual('DB, P');
    //});

    it('should set roots on selected teeth if patientCondition.Roots does not value', function () {});
  });

  describe('getTeethDefinitions -> ', function () {
    it('should call addSelectedTeeth', function () {
      spyOn(ctrl, 'addSelectedTeeth');
      ctrl.getTeethDefinitions();
      // expect(ctrl.addSelectedTeeth).toHaveBeenCalled();
    });
  });

  describe('createPatientCondition -> ', function () {
    it('should create blank/new condition', function () {
      newPatientConditionMock.ConditionDate = 'fakeDateTime';
      scope.patientCondition = ctrl.createPatientCondition(null, true);
      expect(setDateTimeFilter).toHaveBeenCalled();
      expect(scope.patientCondition).toEqual(newPatientConditionMock);
    });

    it('should create an actual with data', function () {
      var patientCond = ctrl.createPatientCondition(
        teethDefinitionsMock.Value.Teeth[0],
        false
      );
      expect(patientCond.Tooth).toEqual('1');
    });

    it('should add roots to patientCondition if tooth has roots and rootSelectionDisabled equals false', function () {
      var tooth = angular.copy(teethDefinitionsMock.Value.Teeth[0]);
      tooth.Roots = 'DB';
      scope.rootSelectionDisabled = false;
      var patientCondition = ctrl.createPatientCondition(tooth, false);
      expect(patientCondition.Roots).toEqual('DB');
    });

    it('should not roots to patientCondition if tooth has roots and rootSelectionDisabled equals true', function () {
      var tooth = angular.copy(teethDefinitionsMock.Value.Teeth[0]);
      tooth.Roots = 'DB';
      scope.rootSelectionDisabled = true;
      var patientCondition = ctrl.createPatientCondition(tooth, false);
      expect(patientCondition.Roots).toEqual(null);
    });

    it('should add surfaces to patientCondition if tooth has surfaces and surfaceSelectionDisabled equals false', function () {
      var tooth = angular.copy(teethDefinitionsMock.Value.Teeth[0]);
      tooth.SelectedSurfaces = [
        { Surface: 'M' },
        { Surface: 'O' },
        { Surface: 'B' },
      ];
      scope.surfaceSelectionDisabled = false;
      var patientCondition = ctrl.createPatientCondition(tooth, false);
      expect(patientCondition.Surfaces).toEqual('M,O,B');
    });

    it('should not surfaces to patientCondition if tooth has surfaces and surfaceSelectionDisabled equals true', function () {
      var tooth = angular.copy(teethDefinitionsMock.Value.Teeth[0]);
      tooth.SelectedSurfaces = [
        { Surface: 'M' },
        { Surface: 'O' },
        { Surface: 'B' },
      ];
      scope.surfaceSelectionDisabled = true;
      var patientCondition = ctrl.createPatientCondition(tooth, false);
      expect(patientCondition.Surfaces).toEqual('');
    });
  });

  describe('init ->', function () {
    var createdPatientCondition = { ConditionId: null };

    beforeEach(inject(function () {
      scope.patientCondition = null;
      scope.originalPatientCondition = null;

      spyOn(ctrl, 'createPatientCondition').and.returnValue(
        createdPatientCondition
      );
      spyOn(ctrl, 'setPreSelectedConditionData');
    }));

    it('should call createPatientCondition and setPreSelectedConditionData functions when injected patientCondition is null', function () {
      ctrl.init();

      expect(ctrl.createPatientCondition).toHaveBeenCalledWith(null, true);
      expect(ctrl.setPreSelectedConditionData).toHaveBeenCalled();
      expect(scope.patientCondition).toBe(createdPatientCondition);
      expect(scope.originalPatientCondition).toEqual(createdPatientCondition);
    });
  });

  describe('setPreSelectedConditionData ->', function () {
    beforeEach(inject(function () {
      scope.patientCondition = { ConditionId: null };
      spyOn(ctrl, 'setAreaDisabledFlag');
    }));

    it("should set scope.patientCondition.ConditionId to preselected condition's id when it exists", function () {
      ctrl.preSelectedConditionData = { ConditionId: 301 };

      ctrl.setPreSelectedConditionData();

      expect(scope.patientCondition.ConditionId).toEqual(
        ctrl.preSelectedConditionData.ConditionId
      );
      expect(ctrl.setAreaDisabledFlag).toHaveBeenCalled();
    });

    it("should not set scope.patientCondition.ConditionId to preselected condition's id when it does not exists", function () {
      ctrl.preSelectedConditionData = null;

      ctrl.setPreSelectedConditionData();

      expect(scope.patientCondition.ConditionId).toBeNull();
      expect(ctrl.setAreaDisabledFlag).not.toHaveBeenCalled();
    });
  });

  describe('patientCondition -> ', function () {
    it('should set patientCondition to new patientCondition if injected patientConditionId is null', function () {
      scope.patientConditionId = null;
      expect(scope.patientCondition.PatientConditionId).toEqual(
        newPatientConditionMock.PatientConditionId
      );
    });
  });

  describe('savePatientCondition -> ', function () {
    it('should validate form', function () {
      spyOn(ctrl, 'validateForm');
      scope.savePatientCondition();
      expect(ctrl.validateForm).toHaveBeenCalled();
    });

    it('should call service if formIsValid', function () {
      spyOn(ctrl, 'validateForm').and.callFake(function () {});
      scope.formIsValid = true;
      scope.savePatientCondition();
      expect(scope.savingForm).toBe(true);
      expect(patientServices.Conditions.save).toHaveBeenCalled();
    });
  });

  describe('createPatientConditionSuccess -> ', function () {
    it('should call toastrFactory and display success', function () {
      scope.patientConditionSuccess(createdConditionMockResponse);
      expect(toastrFactory.success).toHaveBeenCalled();
    });

    it('should call close modal', function () {
      spyOn(scope, 'closeModal');
      scope.patientConditionSuccess(createdConditionMockResponse);
      expect(scope.closeModal).toHaveBeenCalled();
    });
  });

  describe('createPatientConditionFailed -> ', function () {
    it('should call toastrFactory error', function () {
      scope.patientConditionFailed();
      expect(scope.savingForm).toBe(false);
      expect(toastrFactory.error).toHaveBeenCalled();
    });
  });

  describe('watch patientCondition.ConditionId -> ', function () {
    it('should set surfaceSelectionDisabled to true if condition.AffectedAreaId equals 5', function () {
      var condition = conditionsMockList[2];
      scope.patientCondition = ctrl.createPatientCondition(null, true);
      scope.$apply();
      scope.patientCondition.ConditionId = condition.ConditionId;
      scope.$apply();
      expect(scope.surfaceSelectionDisabled).toBe(true);
    });

    it('should set surfaceSelectionDisabled to false if condition.AffectedAreaId equals 4', function () {
      var condition = conditionsMockList[1];
      scope.patientCondition = ctrl.createPatientCondition(null, true);
      scope.$apply();
      scope.patientCondition.ConditionId = condition.ConditionId;
      scope.$apply();
      expect(scope.surfaceSelectionDisabled).toBe(false);
    });

    it('should set surfaceSelectionDisabled to true otherwise', function () {
      var condition = conditionsMockList[0];
      scope.patientCondition = ctrl.createPatientCondition(null, true);
      scope.$apply();
      scope.patientCondition.ConditionId = condition.ConditionId;
      scope.$apply();
      expect(scope.surfaceSelectionDisabled).toBe(true);
      scope.patientCondition = ctrl.createPatientCondition(null, true);
      scope.$apply();
      scope.patientCondition.ConditionId = '4000';
      scope.$apply();
      expect(scope.surfaceSelectionDisabled).toBe(true);
    });
  });

  describe('checkForChanges -> ', function () {
    it('should set canCloseModal to true if old and new objects are equal', function () {
      scope.selectedTeeth = [];
      scope.originalSelectedTeeth = [];
      scope.patientCondition = {};
      scope.originalPatientCondition = {};
      ctrl.checkForChanges();
      expect(scope.canCloseModal).toBe(true);
    });

    it('should set canCloseModal to false if old and new objects are not equal', function () {
      scope.selectedTeeth = [1, 2, 3];
      scope.originalSelectedTeeth = [1, 2];
      scope.patientCondition = { prop: 'new' };
      scope.originalPatientCondition = { prop: 'old' };
      ctrl.checkForChanges();
      expect(scope.canCloseModal).toBe(false);
    });
  });

  describe('watch patientCondition -> ', function () {
    it('should call checkForChanges and validateForm', function () {
      spyOn(ctrl, 'checkForChanges');
      spyOn(ctrl, 'validateForm');
      var condition = conditionsMockList[1];
      scope.patientCondition = ctrl.createPatientCondition(null, true);
      scope.$apply();
      scope.patientCondition.ConditionId = condition.ConditionId;
      scope.$apply();
      expect(ctrl.checkForChanges).toHaveBeenCalled();
      expect(ctrl.validateForm).toHaveBeenCalled();
    });
  });

  describe('closeModal ->', function () {
    it('should call modalInstance.close with patientCondition', function () {
      scope.closeModal({});
      expect(modalInstance.close).toHaveBeenCalledWith({});
    });
  });

  describe('showCancelModal function ->', function () {
    it('should open modal object with CancelModal parameters', function () {
      scope.showCancelModal();
      expect(modalInstance.close).not.toHaveBeenCalled();
    });
  });

  describe('confirmCancel function ->', function () {
    it('should call modalInstance close', function () {
      scope.confirmCancel();
      expect(modalInstance.close).toHaveBeenCalled();
    });
  });

  describe('cancelChanges function ->', function () {
    it('should call modalInstance close if canCloseModal is true', function () {
      scope.canCloseModal = true;
      scope.cancelChanges();
      expect(modalInstance.close).toHaveBeenCalled();
    });

    it('should call modalFactory.CancelModal if canCloseModal is false', function () {
      scope.canCloseModal = false;
      scope.cancelChanges();
      expect(modalInstance.close).not.toHaveBeenCalled();
    });
  });

  describe('addRootsToCondition function ->', function () {
    it('should set tooth.Roots value if rootSelectionDisabled is false and tooth has roots', function () {
      scope.rootSelectionDisabled = false;
      var tooth = { USNumber: 8, Roots: 'DB' };
      var root = ctrl.addRootsToCondition(tooth);
      expect(root).toEqual('DB');
    });

    it('should set tooth.Roots value if rootSelectionDisabled is true or tooth does not have roots', function () {
      scope.rootSelectionDisabled = true;
      var tooth = { USNumber: 8, Roots: null };
      var root = ctrl.addRootsToCondition(tooth);
      expect(root).toBe(null);
    });
  });

  describe('setAreaDisabledFlag function ->', function () {
    it('should set surfaceSelectionDisabled to false if condition has AffectedAreaId equal to 4 ', function () {
      scope.surfaceSelectionDisabled = true;
      jasmine
        .createSpy('listHelper.findItemByFieldValue')
        .and.returnValue(scope.conditions[0]);
      ctrl.setAreaDisabledFlag('2345');
      expect(scope.surfaceSelectionDisabled).toBe(false);
    });

    it('should set rootSelectionDisabled to false if condition has AffectedAreaId equal to 3 ', function () {
      scope.rootSelectionDisabled = true;
      jasmine
        .createSpy('listHelper.findItemByFieldValue')
        .and.returnValue(scope.conditions[3]);
      ctrl.setAreaDisabledFlag('1235');
      expect(scope.rootSelectionDisabled).toBe(false);
    });

    it('should set rootSelectionDisabled to true if condition has AffectedAreaId not equal to 3 ', function () {
      scope.rootSelectionDisabled = false;
      jasmine
        .createSpy('listHelper.findItemByFieldValue')
        .and.returnValue(scope.conditions[2]);
      ctrl.setAreaDisabledFlag('3456');
      expect(scope.rootSelectionDisabled).toBe(true);
    });

    it('should set surfaceSelectionDisabled to true if condition has AffectedAreaId not equal to 4 ', function () {
      scope.surfaceSelectionDisabled = false;
      jasmine
        .createSpy('listHelper.findItemByFieldValue')
        .and.returnValue(scope.conditions[2]);
      ctrl.setAreaDisabledFlag('3456');
      expect(scope.surfaceSelectionDisabled).toBe(true);
    });

    it('should set surfaceSelectionDisabled and rootSelectionDisabled to true if no condition', function () {
      scope.rootSelectionDisabled = false;
      scope.surfaceSelectionDisabled = false;
      ctrl.setAreaDisabledFlag(null);
      expect(scope.surfaceSelectionDisabled).toBe(true);
      expect(scope.rootSelectionDisabled).toBe(true);
    });
  });

  describe('teethHaveRoots function ->', function () {
    it('should return false if any of the selectedTeeth should have roots and dont', function () {
      scope.rootSelectionDisabled = false;
      scope.selectedTeeth = [
        {
          USNumber: 7,
          SelectedRoots: [{ Roots: 'DB' }],
          Roots: 'DB',
        },
        { USNumber: 8, SelectedRoots: null, Roots: null },
      ];
      var returnedVal = ctrl.teethHaveRoots();
      expect(returnedVal).toBe(false);
    });

    it('should return true if the selectedTeeth should have roots all have roots', function () {
      scope.rootSelectionDisabled = false;
      scope.selectedTeeth = [
        {
          USNumber: 7,
          SelectedRoots: [{ Roots: 'DB' }],
          Roots: 'DB',
        },
        { USNumber: 8, SelectedRoots: [{ Roots: 'P' }], Roots: 'P' },
      ];
      var returnedVal = ctrl.teethHaveRoots();
      expect(returnedVal).toBe(true);
    });
  });

  describe('teethHaveSurfaces function ->', function () {
    it('should return false if any of the selectedTeeth should have surfaces and dont', function () {
      scope.surfaceSelectionDisabled = false;
      scope.selectedTeeth = [
        {
          USNumber: 7,
          SelectedSurfaces: [{ Surfaces: 'O' }],
          Surfaces: 'O',
        },
        { USNumber: 8, SelectedSurfaces: null, Surfaces: null },
      ];
      var returnedVal = ctrl.teethHaveSurfaces();
      expect(returnedVal).toBe(false);
    });

    it('should return true if the selectedTeeth should have surfaces and all have surfaces', function () {
      scope.surfaceSelectionDisabled = false;
      scope.selectedTeeth = [
        {
          USNumber: 7,
          SelectedSurfaces: [{ Roots: 'O' }],
          Surfaces: 'O',
        },
        { USNumber: 8, SelectedSurfaces: [{ Surfaces: 'M' }], Surfaces: 'M' },
      ];
      var returnedVal = ctrl.teethHaveSurfaces();
      expect(returnedVal).toBe(true);
    });
  });

  describe('validateForm -> ', function () {
    it('should set formIsValid to false if patientCondition or patientCondition.ConditionId are not set', function () {
      scope.patientCondition = null;
      ctrl.validateForm();
      expect(scope.formIsValid).toBe(false);
      scope.patientCondition = {};
      ctrl.validateForm();
      expect(scope.formIsValid).toBe(false);
    });

    it('should set formIsValid to false if there are no selectedTeeth', function () {
      scope.selectedTeeth = null;
      ctrl.validateForm();
      expect(scope.formIsValid).toBe(false);
      scope.selectedTeeth = [];
      ctrl.validateForm();
      expect(scope.formIsValid).toBe(false);
    });

    it('should set formIsValid to false if selectedTeeth and surfaceSelectionDisabled and all teeth dont have surfaces', function () {
      scope.patientCondition = ctrl.createPatientCondition(null, true);
      scope.patientCondition.ConditionId = 4;
      scope.selectedTeeth = [
        { USNumber: 7, SelectedSurfaces: null, Surfaces: null },
      ];
      scope.surfaceSelectionDisabled = false;
      ctrl.validateForm();
      expect(scope.formIsValid).toBe(false);
    });

    it('should set formIsValid to false if selectedTeeth and surfaceSelectionDisabled is false and all teeth have surfaces', function () {
      scope.patientCondition = ctrl.createPatientCondition(null, true);
      scope.patientCondition.ConditionId = 4;
      scope.patientCondition.ProviderId = 1;
      scope.surfaceSelectionDisabled = false;
      scope.selectedTeeth = [
        {
          USNumber: 7,
          SelectedSurfaces: [{ Surfaces: 'O' }],
          Surfaces: 'O',
        },
        { USNumber: 8, SelectedSurfaces: [{ Surfaces: 'M' }], Surfaces: 'M' },
      ];
      ctrl.validateForm();
      expect(scope.formIsValid).toBe(true);
    });

    it('should set formIsValid to false if selectedTeeth and rootSelectionDisabled is false and all teeth dont have roots', function () {
      scope.patientCondition = ctrl.createPatientCondition(null, true);
      scope.patientCondition.ConditionId = 4;
      scope.rootSelectionDisabled = false;
      scope.selectedTeeth = [
        {
          USNumber: 7,
          SelectedRoots: null,
          Roots: null,
        },
        { USNumber: 8, SelectedRoots: [{ Roots: 'M' }], Roots: 'M' },
      ];
      ctrl.validateForm();
      expect(scope.formIsValid).toBe(false);
    });

    it('should set formIsValid to true if selectedTeeth and rootSelectionDisabled is false and all teeth have roots', function () {
      scope.patientCondition = ctrl.createPatientCondition(null, true);
      scope.rootSelectionDisabled = false;
      scope.patientCondition.ConditionId = 4;
      scope.patientCondition.ProviderId = 1;
      scope.selectedTeeth = [
        {
          USNumber: 7,
          SelectedRoots: [{ Roots: 'O' }],
          Roots: 'O',
        },
        { USNumber: 8, SelectedRoots: [{ Roots: 'M' }], Roots: 'M' },
      ];
      ctrl.validateForm();
      expect(scope.formIsValid).toBe(true);
    });
  });
});
