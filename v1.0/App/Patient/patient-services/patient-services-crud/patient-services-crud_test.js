describe('PatientServicesCrudController ->', function () {
  var routeParams,
    toastrFactory,
    $uibModal,
    timeout,
    scope,
    $httpBackend,
    ctrl,
    element,
    compile;
  var patientServices, staticData, referenceDataService;
  var modalInstance,
    modalFactory,
    modalFactoryDeferred,
    q,
    filter,
    listHelper,
    preSelectedTreatmentPlanId,
    financialService;
  var mockPreSelectedTreatmentPlan;

  //#region mocks

  var personIdMock = 'b3eb6f7f-7b4a-4be5-b8ac-d24cccdd42b9';

  var saveStatesMock = { Delete: -1, None: 0, Add: 1, Update: 2 };

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

  var insuranceEstimateMock = {
    EstimatedInsuranceId: null,
    AccountMemberId: undefined,
    ServiceTransactionId: null,
    ServiceCodeId: null,
    Fee: '',
    EstimatedInsurance: 0,
    IsUserOverRidden: false,
    DeductibleUsed: 0,
    CalculationDescription: '',
    ObjectState: 1,
    FailedMessage: '',
  };

  var newServiceTransactionMock = {
    DateEntered: moment.utc().format('MM/DD/YYYY'),
    Fee: null,
    ProviderUserId: null,
    Roots: null,
    ServiceCodeId: null,
    ServiceTransactionId: null,
    ServiceTransactionStatusId: 1,
    Surface: null,
    Tooth: null,
    TransactionTypeId: 1,
    TreatmentPlanId: null,
    ServiceButtonId: null,
    TypeOrMaterialId: null,
    ObjectState: 1,
    InsuranceEstimate: angular.copy(insuranceEstimateMock),
  };

  var selectedServiceDataMock = {
    IsSwiftPickCode: 1,
    SwiftPickServiceCodes: 1,
  };

  var serviceButtonsMock = [
    { ServiceButtonId: 11, Description: 'Service Button 1' },
    { ServiceButtonId: 12, Description: 'Service Button 2' },
    { ServiceButtonId: 13, Description: 'Service Button 3' },
  ];

  var typeOrMaterialsMock = [
    { TypeOrMaterialId: 21, Description: 'Type or Material 1' },
    { TypeOrMaterialId: 22, Description: 'Type or Material 2' },
    { TypeOrMaterialId: 23, Description: 'Type or Material 3' },
  ];

  var createdServiceTransactionMockResponse = {
    Value: newServiceTransactionMock,
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

  var serviceTransactionStatusesMock = {
    Value: [
      { Id: 1, Name: 'Proposed', Order: 1 },
      { Id: 2, Name: 'Referred', Order: 2 },
      { Id: 3, Name: 'Rejected', Order: 3 },
      { Id: 4, Name: 'Completed', Order: 4 },
      { Id: 5, Name: 'Pending', Order: 5 },
      { Id: 6, Name: 'Existing', Order: 6 },
    ],
  };

  var teethSelectedViaOdontogram = [{ toothId: 3 }, { toothId: 8 }];

  //#endregion

  //#region spies for services...

  beforeEach(module('Soar.Common'));
  beforeEach(module('common.factories'));
  beforeEach(module('Soar.Patient'));

  // create spies for services
  var getTreatmentPlanMockResponse = [];
  beforeEach(
    module('Soar.Patient', function ($provide) {
      patientServices = {
        ServiceTransactions: {
          update: jasmine.createSpy().and.returnValue(''),
          save: jasmine
            .createSpy()
            .and.returnValue(createdServiceTransactionMockResponse),
        },
        TreatmentPlans: {
          getHeadersWithServicesSummary: jasmine
            .createSpy()
            .and.returnValue(getTreatmentPlanMockResponse),
          addServices: jasmine
            .createSpy()
            .and.returnValue(getTreatmentPlanMockResponse),
        },
      };
      $provide.value('PatientServices', patientServices);

      referenceDataService = {
        getData: jasmine.createSpy(),
        entityNames: {
          serviceTypes: 'serviceTypes',
          preventiveServiceTypes: 'preventiveServiceTypes',
          serviceCodes: 'serviceCodes',
        },
      };

      $provide.value('referenceDataService', referenceDataService);
      staticData = {
        TeethDefinitions: function () {
          return {
            then: function () {
              return teethDefinitionsMock;
            },
          };
        },
        ServiceTransactionStatuses: function () {
          return {
            then: function () {
              return serviceTransactionStatusesMock;
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

      financialService = {
        CreateOrCloneInsuranceEstimateObject: jasmine
          .createSpy()
          .and.returnValue(insuranceEstimateMock),
      };

      $provide.value('FinancialService', financialService);
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
    filter = $injector.get('$filter');

    referenceDataService.getData.and.callFake(function () {
      return $q.resolve([]);
    });

    $uibModal = _$uibModal_;
    spyOn($uibModal, 'open').and.callThrough();

    modalInstance = {
      close: jasmine.createSpy('modalInstance.close').and.returnValue({}),
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

    //mock for listHelper service
    listHelper = {
      findItemByFieldValue: jasmine
        .createSpy('listHelper.findItemByFieldValue')
        .and.returnValue(0),
      findIndexByFieldValue: jasmine
        .createSpy('listHelper.findIndexByFieldValue')
        .and.returnValue(0),
    };

    ctrl = $controller('PatientServicesCrudController', {
      $scope: scope,
      patSecurityService: _authPatSecurityService_,
      personId: personIdMock,
      teeth: teethSelectedViaOdontogram,
      providers: providersMock,
      serviceTransaction: null,
      ModalFactory: modalFactory,
      $uibModalInstance: modalInstance,
      PatientServices: patientServices,
      StaticData: staticData,
      SaveStates: saveStatesMock,
      selectedServiceData: selectedServiceDataMock,
      serviceButtons: serviceButtonsMock,
      typeOrMaterials: typeOrMaterialsMock,
      ListHelper: listHelper,
      preSelectedTreatmentPlanId: null,
      patientInfo: null,
      preSelectedTreatmentPlan: {},
      TreatmentPlansFactory: {},
    });

    timeout.flush(200);
  }));

  describe('initial setup -> ', function () {
    it('check if controller exists', function () {
      expect(ctrl).not.toBeNull();
    });

    it('should set scope properties', function () {
      expect(scope.editMode).toBe(false);
      expect(scope.amfa).toBe('soar-clin-cpsvc-add');
      expect(scope.savingForm).toBe(false);
      expect(scope.formIsValid).toBe(false);
      expect(scope.canCloseModal).toBe(true);
      expect(scope.providers).toEqual(providersMock);
      expect(scope.preSelectedTeeth).toBe(teethSelectedViaOdontogram);
      expect(scope.toothSelectionDisabled).toBe(true);
      expect(scope.surfaceSelectionDisabled).toBe(true);
      expect(scope.rootSelectionDisabled).toBe(true);
      expect(scope.searchIsQueryingServer).toBe(false);
      expect(scope.selectAutoFocus.value).toEqual(true);
    });

    it('should set ctrl properties', function () {
      expect(scope.preSelectedServiceData).toBe(selectedServiceDataMock);
    });

    it('should set serviceTransaction to new serviceTransaction if injected serviceTransaction is null', function () {
      expect(scope.serviceTransaction).not.toBeNull();
    });

    it('should set some values to the originalServiceTransaction', function () {
      ctrl.serviceTransaction = newServiceTransactionMock;
      expect(scope.originalServiceTransaction).toEqual(
        scope.serviceTransaction
      );
    });
  });

  describe('setPreSelectedServiceData ->', function () {
    beforeEach(inject(function () {
      scope.serviceTransaction.ServiceButtonId = undefined;

      spyOn(scope, 'selectResult').and.callThrough();
      spyOn(ctrl, 'validateForm').and.callThrough();
    }));

    it('should call selectResult when preSelectedServiceData.ServiceCodeId exists', function () {
      ctrl.preSelectedServiceData = {
        ServiceCodeId: 100,
      };

      ctrl.setPreSelectedServiceData(ctrl.preSelectedServiceData);
      scope.$apply();
      expect(scope.selectResult).toHaveBeenCalledWith(
        ctrl.preSelectedServiceData
      );
      expect(scope.selectAutoFocus.value).toEqual(false);
    });

    it('should neither call selectResult nor set serviceTransaction.ServiceButtonId when preSelectedServiceData is null', function () {
      ctrl.preSelectedServiceData = null;

      ctrl.setPreSelectedServiceData();
      scope.$apply();
      expect(scope.selectResult).not.toHaveBeenCalled();
      expect(scope.serviceTransaction.ServiceButtonId).toBeUndefined();
    });
  });

  describe('skipService function ->', function () {
    beforeEach(function () {
      scope.canCloseModal = true;
      ctrl.checkForChanges = jasmine.createSpy();
      ctrl.doNextService = jasmine.createSpy();
    });

    it('should call checkForChanges and modalFactory CancelModal', function () {
      scope.canCloseModal = false;
      scope.skipService();
      expect(ctrl.checkForChanges).toHaveBeenCalled();
      expect(modalFactory.CancelModal).toHaveBeenCalled();
      expect(ctrl.doNextService).not.toHaveBeenCalled();
    });

    it('should call doNextService', function () {
      scope.skipService();
      expect(ctrl.checkForChanges).toHaveBeenCalled();
      expect(modalFactory.CancelModal).not.toHaveBeenCalled();
      expect(ctrl.doNextService).toHaveBeenCalled();
    });
  });

  describe('doNextService function ->', function () {
    beforeEach(function () {
      scope.iterationCount = 1;
      scope.servicesCount = 2;
      spyOn(ctrl, 'setPreSelectedServiceData');
    });
    it('should increament scope.iterationCount if the scope.iterationCount and scope.servicesCount are not same', function () {
      ctrl.doNextService();
      expect(scope.servicesCount).toEqual(scope.iterationCount);
      expect(ctrl.setPreSelectedServiceData).toHaveBeenCalled();
    });
  });

  describe('addSelectedTeeth -> ', function () {
    it('should populate selectedTeeth array with teeth selected via the odontogram', function () {
      scope.preSelectedTeeth = [
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
      ];
      listHelper.findItemByFieldValue = jasmine
        .createSpy('listHelper.findItemByFieldValue')
        .and.returnValue(scope.preSelectedTeeth[0]);
      scope.serviceTransaction.Roots = '2,1';
      scope.serviceTransaction.Surface = '2,1';
      ctrl.addSelectedTeeth(teethDefinitionsMock.Value.Teeth);
      expect(scope.selectedTeeth.length).toEqual(1);
    });

    it('should populate selectedTeeth array with teeth selected via the odontogram', function () {
      scope.preSelectedTeeth = [
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
      ];
      listHelper.findItemByFieldValue = jasmine
        .createSpy('listHelper.findItemByFieldValue')
        .and.returnValue(scope.preSelectedTeeth[0]);
      ctrl.addSelectedTeeth(teethDefinitionsMock.Value.Teeth);
      expect(scope.selectedTeeth).toEqual([
        teethDefinitionsMock.Value.Teeth[6],
      ]);
    });

    it('should call staticData.TeethQuadrantAbbreviations method and push item with permanent ToothStructure', function () {
      scope.preSelectedTeeth = [
        {
          toothId: 7,
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
      ];
      listHelper.findItemByFieldValue = jasmine
        .createSpy('listHelper.findItemByFieldValue')
        .and.returnValue(null);
      spyOn(staticData, 'TeethQuadrantAbbreviations').and.returnValue({
        'Upper Right': 'UR',
        'Upper Left': 'UL',
        'Lower Left': 'LL',
        'Lower Right': 'LR',
      });
      ctrl.addSelectedTeeth(teethDefinitionsMock.Value.Teeth);
      expect(staticData.TeethQuadrantAbbreviations).toHaveBeenCalled();
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
  });

  describe('createServiceTransaction -> ', function () {
    it('should create blank/new service transaction', function () {
      financialService.CreateOrCloneInsuranceEstimateObject = jasmine
        .createSpy()
        .and.returnValue(insuranceEstimateMock);

      var serviceTransaction = ctrl.createServiceTransaction(null, true);
      expect(serviceTransaction).not.toBeNull();
    });

    it('should create an actual service transaction with data', function () {
      var servTransaction = ctrl.createServiceTransaction(
        teethDefinitionsMock.Value.Teeth[0],
        false
      );
      expect(servTransaction.Tooth).toEqual('1');
    });
  });

  describe('saveServiceTransaction -> ', function () {
    beforeEach(function () {
      ctrl.validateForm = jasmine.createSpy();
      scope.hasServiceTransactionCreateAccess = true;
    });

    it('should validate form', function () {
      scope.saveServiceTransaction();
      expect(ctrl.validateForm).toHaveBeenCalled();
    });

    it('should update the ServiceTransaction', function () {
      scope.editMode = true;
      scope.formIsValid = true;
      scope.selectedTeeth = [];
      scope.saveServiceTransaction();
      expect(patientServices.ServiceTransactions.update).toHaveBeenCalled();
    });

    it('should call service if formIsValid', function () {
      scope.selectedTeeth = [];
      scope.formIsValid = true;
      scope.saveServiceTransaction();
      expect(scope.savingForm).toBe(true);
      expect(patientServices.ServiceTransactions.save).toHaveBeenCalled();
    });

    it('should set serviceTransaction objectState based on editMode', function () {
      scope.selectedTeeth = [];
      scope.editMode = false;
      scope.formIsValid = true;
      scope.saveServiceTransaction();
      expect(scope.serviceTransaction.ObjectState).toBe(saveStatesMock.Add);

      scope.editMode = true;
      scope.saveServiceTransaction();
      expect(scope.serviceTransaction.ObjectState).toBe(saveStatesMock.Update);
    });

    it('should call saveServiceTransactionsToTreatmentPlans if serviceTransaction has TreatmentPlanId ', function () {
      spyOn(ctrl, 'saveServiceTransactionsToTreatmentPlans');
      scope.selectedTeeth = [];
      scope.editMode = false;
      scope.formIsValid = true;
      scope.serviceTransaction.TreatmentPlanId = 2;
      scope.saveServiceTransaction();
      expect(ctrl.saveServiceTransactionsToTreatmentPlans).toHaveBeenCalled();
      expect(patientServices.ServiceTransactions.save).not.toHaveBeenCalled();
    });

    it('should call patientServices.ServiceTransactions.save if serviceTransaction does not have TreatmentPlanId ', function () {
      spyOn(ctrl, 'saveServiceTransactionsToTreatmentPlans');
      scope.selectedTeeth = [];
      scope.editMode = false;
      scope.formIsValid = true;
      scope.serviceTransaction.TreatmentPlanId = null;
      scope.saveServiceTransaction();
      expect(
        ctrl.saveServiceTransactionsToTreatmentPlans
      ).not.toHaveBeenCalled();
      expect(patientServices.ServiceTransactions.save).toHaveBeenCalled();
    });
  });

  describe('success -> ', function () {
    it('should call toastrFactory and display success', function () {
      ctrl.success({});
      expect(toastrFactory.success).toHaveBeenCalled();
    });

    it('should call toastrFactory and display success', function () {
      scope.editMode = true;
      ctrl.success({});
      expect(toastrFactory.success).toHaveBeenCalled();
    });

    it('should increament iterationCount by 1 and call setPreSelectedServiceData function', function () {
      scope.iterationCount = 1;
      scope.servicesCount = 2;
      spyOn(ctrl, 'setPreSelectedServiceData');
      ctrl.success({});
      expect(scope.iterationCount).toEqual(2);
      expect(ctrl.setPreSelectedServiceData).toHaveBeenCalled();
    });

    it('should call close modal', function () {
      scope.iterationCount = 2;
      scope.servicesCount = 2;
      spyOn(scope, 'closeModal');
      ctrl.success({});
      expect(scope.closeModal).toHaveBeenCalled();
    });
  });

  describe('failure -> ', function () {
    it('should call toastrFactory error', function () {
      ctrl.failure();
      expect(scope.savingForm).toBe(false);
      expect(toastrFactory.error).toHaveBeenCalled();
    });
  });

  describe('setDisabledFlags -> ', function () {
    it('should set all flags to disabled if selectedService is null', function () {
      var selectedService = null;
      ctrl.setDisabledFlags(selectedService);
      expect(scope.toothSelectionDisabled).toBe(true);
      expect(scope.rootSelectionDisabled).toBe(true);
      expect(scope.surfaceSelectionDisabled).toBe(true);
    });

    it('should enable tooth and root selector and disable surface selector if affected area is root', function () {
      var selectedService = { AffectedAreaId: 3 };
      ctrl.setDisabledFlags(selectedService);
      expect(scope.toothSelectionDisabled).toBe(false);
      expect(scope.rootSelectionDisabled).toBe(false);
      expect(scope.surfaceSelectionDisabled).toBe(true);
    });

    it('should enable tooth and surface selector and disable surface selector if affected area is surface', function () {
      var selectedService = { AffectedAreaId: 4 };
      ctrl.setDisabledFlags(selectedService);
      expect(scope.toothSelectionDisabled).toBe(false);
      expect(scope.rootSelectionDisabled).toBe(true);
      expect(scope.surfaceSelectionDisabled).toBe(false);
    });

    it('should only enable tooth selector if affected area is tooth', function () {
      var selectedService = { AffectedAreaId: 5 };
      ctrl.setDisabledFlags(selectedService);
      expect(scope.toothSelectionDisabled).toBe(false);
      expect(scope.rootSelectionDisabled).toBe(true);
      expect(scope.surfaceSelectionDisabled).toBe(true);
    });

    it('should only enable tooth selector if affected area is tooth', function () {
      var selectedService = { AffectedAreaId: 1 };
      ctrl.setDisabledFlags(selectedService);
      expect(scope.toothSelectionDisabled).toBe(true);
      expect(scope.rootSelectionDisabled).toBe(true);
      expect(scope.surfaceSelectionDisabled).toBe(true);
      var selectedService = { AffectedAreaId: 2 };
      ctrl.setDisabledFlags(selectedService);
      expect(scope.toothSelectionDisabled).toBe(false);
      expect(scope.rootSelectionDisabled).toBe(true);
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

  describe('validateForm -> ', function () {
    it('should set formIsValid to false if patientCondition or patientCondition.ConditionId are not set', function () {
      scope.serviceTransaction = null;
      ctrl.validateForm();
      expect(scope.formIsValid).toBe(false);
      scope.serviceTransaction = {};
      ctrl.validateForm();
      expect(scope.formIsValid).toBe(false);
    });

    it('should set formIsValid to false if there are no selectedTeeth', function () {
      scope.toothSelectionDisabled = false;
      scope.selectedTeeth = null;
      ctrl.validateForm();
      expect(scope.formIsValid).toBe(false);
      scope.selectedTeeth = [];
      ctrl.validateForm();
      expect(scope.formIsValid).toBe(false);
    });

    it('should set formIsValid to false if not all teeth have SelectedSurfaces', function () {
      scope.surfaceSelectionDisabled = false;
      scope.selectedTeeth = [{ SelectedSurfaces: 'MOD' }, {}];
      ctrl.validateForm();
      expect(scope.formIsValid).toBe(false);
    });

    it('should set formIsValid to false if not all teeth have SelectedSurfaces', function () {
      scope.rootSelectionDisabled = false;
      scope.selectedTeeth = [{ SelectedRoots: 'D' }, {}];
      ctrl.validateForm();
      expect(scope.formIsValid).toBe(false);
    });

    it('should set formIsValid to true if selectedTeeth and ServiceCodeId are present', function () {
      scope.serviceTransaction = ctrl.createServiceTransaction(null, true);
      scope.serviceTransaction.ServiceCodeId = 4;
      scope.existingServiceTransactionStatus = true;
      scope.selectedTeeth = [1, 2, 3];
      ctrl.validateForm();
      expect(scope.formIsValid).toBe(true);
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
      scope.cancelChanges();
      expect(modalInstance.close).toHaveBeenCalled();
    });

    it('should call modalInstance close if serviceCount is greater than 1', function () {
      scope.servicesCount = 2;
      scope.cancelChanges();
      expect(modalInstance.close).toHaveBeenCalled();
    });

    it('should call modalInstance close if serviceCount is less than 1 or equal to 1', function () {
      scope.servicesCount = 1;
      scope.cancelChanges();
      expect(modalInstance.close).toHaveBeenCalled();
    });

    it('should call modalInstance close if serviceCount is less than 1 or equal to 1', function () {
      scope.canCloseModal = false;
      scope.cancelChanges();
      expect(modalInstance.close).toHaveBeenCalled();
    });

    it('should call modalFactory.CancelModal if canCloseModal is false', function () {
      scope.selectedTeeth = [1, 2, 3];
      scope.originalSelectedTeeth = [1, 2];
      scope.patientCondition = { prop: 'new' };
      scope.originalPatientCondition = { prop: 'old' };
      ctrl.checkForChanges();
      expect(scope.canCloseModal).toBe(false);
      expect(modalInstance.close).not.toHaveBeenCalled();
    });
  });

  describe('getTreatmentPlanHeaders function -> ', function () {
    it('should call clinical notes get api', function () {
      scope.hasTreatmentPlanHeadersAddServicesAccess = true;
      ctrl.getTreatmentPlanHeaders();
      expect(
        patientServices.TreatmentPlans.getHeadersWithServicesSummary
      ).toHaveBeenCalled();
    });
  });

  var mockTreatmentPlanHeadersResponse = { Value: [] };
  describe('getTreatmentPlanHeadersSuccess function -> ', function () {
    it('should load treatmentPlanHeaders', function () {
      ctrl.getTreatmentPlanHeadersSuccess(mockTreatmentPlanHeadersResponse);
      expect(scope.treatmentPlanHeaders).toEqual(
        mockTreatmentPlanHeadersResponse.Value
      );
    });
  });

  describe('clinicalNotesGetFailure function -> ', function () {
    it('should set clinicalNotes display toastr error message', function () {
      ctrl.getTreatmentPlanHeadersFailure();
      expect(toastrFactory.error).toHaveBeenCalled();
    });
  });

  describe('buildTreatmentPlanDescription function -> ', function () {
    it('should set TreatmentPlanDescription ', function () {
      var treatmentPlanHeaderSummary = {
        ServicesCount: 3,
        ServicesFees: 2500.0,
        TreatmentPlanHeader: { TreatmentPlanName: 'TreatmentPlanSix' },
      };
      ctrl.buildTreatmentPlanDescription(treatmentPlanHeaderSummary);
      expect(treatmentPlanHeaderSummary.TreatmentPlanDescription).toEqual(
        treatmentPlanHeaderSummary.TreatmentPlanHeader.TreatmentPlanName +
          ' | ' +
          treatmentPlanHeaderSummary.ServicesCount +
          ' Services ' +
          '($2,500.00)'
      );
    });
  });

  describe('filterServiceTransactionStatuses method -> ', function () {
    it('should set load filteredServiceTransactionStatuses ', function () {
      scope.serviceTransactionStatuses = serviceTransactionStatusesMock.Value;
      scope.filteredServiceTransactionStatuses = [];
      ctrl.filterServiceTransactionStatuses();
      expect(scope.filteredServiceTransactionStatuses.length).toBe(2);
      expect(scope.filteredServiceTransactionStatuses[0].Id).toBe(1);
      expect(scope.filteredServiceTransactionStatuses[1].Id).toBe(6);
    });
  });

  describe('applyServiceTransactionRules method -> ', function () {
    it('should set fee null if stausId is 6', function () {
      scope.serviceTransaction = angular.copy(newServiceTransactionMock);
      scope.serviceTransaction.Fee = 2000.0;
      ctrl.applyServiceTransactionRules('6');
      expect(scope.serviceTransaction.Fee).toBe(null);
    });

    it('should set provider id null if status id is 6', function () {
      scope.serviceTransaction = angular.copy(newServiceTransactionMock);
      scope.serviceTransaction.ProviderUserId = providersMock[0].UserId;
      ctrl.applyServiceTransactionRules('6');
      expect(scope.serviceTransaction.ProviderUserId).toBe(null);
    });

    it('should set existingServiceTransactionStatus', function () {
      scope.existingServiceTransactionStatus = false;
      ctrl.applyServiceTransactionRules('6');
      expect(scope.existingServiceTransactionStatus).toBe(true);
    });
  });

  // clearSelectedService method
  describe('clearSelectedService Function ->', function () {
    beforeEach(inject(function () {
      spyOn(ctrl, 'setDisabledFlags');
      spyOn(ctrl, 'validateForm');
    }));
    it('should clear properties on scope for search Data , service transaction and it should call validate form method.', function () {
      scope.clearSelectedService();
      expect(scope.searchData.searchTerm).toBe('');
      expect(scope.serviceTransaction.Fee).toBeNull();
      expect(scope.serviceTransaction.ServiceCodeId).toBeNull();
      expect(scope.selectedService).toBeNull();
      expect(ctrl.validateForm).toHaveBeenCalled();
      expect(ctrl.setDisabledFlags).toHaveBeenCalledWith(scope.selectedService);
      expect(scope.bFocus).toEqual(true);
      expect(scope.typeOrMaterialsFiltered).toEqual(
        angular.copy(scope.typeOrMaterialsActual)
      );
    });
  });

  /*

    ctrl.buildTreatmentPlanDescription = function (treatmentPlanHeaderSummary) {
            var displayName = treatmentPlanHeaderSummary.TreatmentPlanHeader.TreatmentPlanName + ' | ';
            if (treatmentPlanHeaderSummary.ServicesCount) {
                displayName = treatmentPlanHeaderSummary.ServicesCount === 1 ? displayName + treatmentPlanHeaderSummary.ServicesCount + ' Service ' :
                displayName + treatmentPlanHeaderSummary.ServicesCount + ' Services ';
            };
            var formattedFees = '($0.00)';
            if (treatmentPlanHeaderSummary.ServicesFees === 0) {
                displayName = displayName + formattedFees;
            } else {
                formattedFees = $filter('currency') (treatmentPlanHeaderSummary.ServicesFees);
                displayName = displayName + '(' + formattedFees + ')';
            }
            treatmentPlanHeaderSummary.TreatmentPlanDescription = displayName;
        }

    ctrl.loadServiceTransactionsToTreatmentPlanServices = function (serviceTransactions) {
            var treatmentPlanHeader = ctrl.getSelectedTreatmentPlanHeader(serviceTransactions[0].TreatmentPlanId);
            treatmentPlanHeader.ServiceTransactionId = serviceTransactions.ServiceTransactionId;
            var treatmentPlanServices = [];

            angular.forEach(serviceTransactions, function (serviceTransaction) {
                var treatmentPlanService = { ServiceTransaction: serviceTransaction, TreatmentPlanServiceHeader: treatmentPlanHeader };
                treatmentPlanServices.push(treatmentPlanService)
            });
            console.log(treatmentPlanServices);
            return treatmentPlanServices;
        }
        */
  /*

         ctrl.addServiceSuccess = function (res) {
            if (res && res.Value && res.Value[0]) {
               $scope.$emit('soar:tx-plan-services-added', null);
               toastrFactory.success(localize.getLocalizedString('The {0} has been added to your {1}', ['proposed service', 'treatment plan']), localize.getLocalizedString('Success'));
            }
        };

        // failure callback for add service
        ctrl.addServiceFailure = function () {
            toastrFactory.error(localize.getLocalizedString('There was an error while adding the proposed service to your {0}', ['treatment plan']), localize.getLocalizedString('Server Error'));
        };

        // save the treatmentPlanServices
        ctrl.saveServiceTransactionsToTreatmentPlans = function (serviceTransactions) {
            console.log(serviceTransactions)
            if ($scope.hasTreatmentPlanHeadersAddServicesAccess) {
                var treatmentPlanServices = ctrl.loadServiceTransactionsToTreatmentPlanServices(serviceTransactions);
                patientServices.TreatmentPlans.addServices({ Id: $scope.personId, TreatmentPlanId: serviceTransactions[0].TreatmentPlanId }, treatmentPlanServices, ctrl.addServiceSuccess, ctrl.addServiceFailure);
            }
        };
        */

  /* $scope.treatmentPlan = { TreatmentPlanServices: { TreatmentPlanServiceHeader: {}, ServiceTransaction: {} } };

        ctrl.getSelectedTreatmentPlanHeader= function (treatmentPlanHeaderId){
            var index = listHelper.findIndexByFieldValue($scope.treatmentPlanHeaders, 'TreatmentPlanId', treatmentPlanHeaderId);
            if (index > -1) {
                return $scope.treatmentPlanHeaders[index];
            } else {
                return null;
            }
        }*/
});
