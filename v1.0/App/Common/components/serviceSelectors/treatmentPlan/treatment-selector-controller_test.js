describe('TreatmentSelectorController -> ', function () {
  var patientServices, scope, rootScope, timeout, q, ctrl, filter;
  var treatmentPlansFactory,
    treatmentPlansApiFactory,
    listHelper,
    toastrFactory,
    usersFactory,
    financialService,
    patientValidationFactory;
  var patientAppointmentsFactory,
    locationService,
    timeZones,
    referenceDataService,
    scheduleDisplayPlannedServicesService;
  var mockModalFactory = {
    ConfirmModal: jasmine.createSpy('modalFactory.ConfirmModal'),
  };
  beforeEach(module('Soar.Common'));
  beforeEach(module('common.factories'));
  beforeEach(module('Soar.Patient'));

  var treatmentPlansMock = [
    {
      TreatmentPlanHeader: {
        TreatmentPlanId: '664dc291-164f-46a7-b026-1d70c993b386',
        PersonId: '1e057990-81f7-4fed-a4b1-b991cc3a99bb',
        Status: 'Proposed',
        TreatmentPlanName: 'Optimus Prime',
        TreatmentPlanDescription: null,
        RejectedReason: null,
        CreatedDate: '2017-05-23T20:23:52.7004429',
        AlternateGroupId: '9eb71989-9a4b-40f2-81d4-2ca80abd5be5',
        Note: null,
        IsRecommended: false,
        SignatureFileAllocationId: null,
        PredeterminationMessage: '',
        HasAtLeastOnePredetermination: false,
        DataTag: 'AAAAAAACPAQ=',
        UserModified: '331d1784-862a-e711-8cd3-f0d5bf93e9cc',
        DateModified: '2017-05-23T20:23:52.7014457',
      },
      TreatmentPlanServices: [
        {
          TreatmentPlanServiceHeader: {
            TreatmentPlanServiceId: 'c9c8ee8a-1cd6-4cfc-80d8-247501295f64',
            Priority: 0,
            TreatmentPlanId: '664dc291-164f-46a7-b026-1d70c993b386',
            TreatmentPlanGroupNumber: 1,
            EstimatedInsurance: 0,
            PatientPortion: 0,
            ServiceTransactionId: 'ea4753b4-9db5-4d39-baa2-551f30bd18a8',
            PersonId: '1e057990-81f7-4fed-a4b1-b991cc3a99bb',
            DataTag: 'AAAAAAACPAk=',
            UserModified: '331d1784-862a-e711-8cd3-f0d5bf93e9cc',
            DateModified: '2017-05-23T20:24:04.7438016',
          },
          ServiceTransaction: {
            AccountMemberId: '2172adc6-0298-491f-b5d0-37e24d6de5a4',
            Amount: 250,
            AppointmentId: null,
            DateCompleted: '2017-05-24T00:00:00',
            DateEntered: '2017-05-08T13:27:08.048',
            Description: 'D2782: crown - 3/4 cast noble metal (D2782)',
            Discount: 0,
            EncounterId: 'a97ae7d7-1b6b-4652-b387-f8247b91bdb8',
            EnteredByUserId: '331d1784-862a-e711-8cd3-f0d5bf93e9cc',
            Fee: 250,
            LocationId: 3,
            Note: '',
            ProviderUserId: '331d1784-862a-e711-8cd3-f0d5bf93e9cc',
            RejectedReason: null,
            ServiceCodeId: '0619cb3e-9c91-498a-9211-779ec7fc67a2',
            ServiceTransactionId: 'ea4753b4-9db5-4d39-baa2-551f30bd18a8',
            ServiceTransactionStatusId: 4,
            Surface: null,
            SurfaceSummaryInfo: null,
            Roots: null,
            RootSummaryInfo: null,
            Tax: 0,
            Tooth: '2',
            TransactionTypeId: 1,
            ObjectState: 'None',
            FailedMessage: null,
            Balance: 115,
            AgingDate: '2017-05-08T13:27:08.048',
            InsuranceEstimates: [],
            TotalEstInsurance: 0,
            TotalInsurancePaidAmount: 0,
            TotalAdjEstimate: 0,
            CreatedDate: '2017-05-08T13:26:03.5190278',
            IsDeleted: false,
            IsBalanceAlreadyUpdated: null,
            IsForClosingClaim: null,
            PredeterminationHasResponse: false,
            IsDiscounted: false,
            ProviderOnClaimsId: '331d1784-862a-e711-8cd3-f0d5bf93e9cc',
            DataTag: 'AAAAAAACPIk=',
            UserModified: '331d1784-862a-e711-8cd3-f0d5bf93e9cc',
            DateModified: '2017-05-24T13:27:14.1866339',
          },
        },
        {
          TreatmentPlanServiceHeader: {
            TreatmentPlanServiceId: 'aa7e28b4-a896-437e-9a0d-3503654fdd62',
            Priority: 0,
            TreatmentPlanId: '664dc291-164f-46a7-b026-1d70c993b386',
            TreatmentPlanGroupNumber: 1,
            EstimatedInsurance: 0,
            PatientPortion: 0,
            ServiceTransactionId: 'a6c98002-e30e-4187-a0f4-e80abb2a9457',
            PersonId: '1e057990-81f7-4fed-a4b1-b991cc3a99bb',
            DataTag: 'AAAAAAACPAU=',
            UserModified: '331d1784-862a-e711-8cd3-f0d5bf93e9cc',
            DateModified: '2017-05-23T20:23:52.9911151',
          },
          ServiceTransaction: {
            AccountMemberId: '2172adc6-0298-491f-b5d0-37e24d6de5a4',
            Amount: 120,
            AppointmentId: 'fe997bd2-c34c-4288-96f8-a4aed058aede',
            DateCompleted: null,
            DateEntered: '2017-05-01T14:27:23.734',
            Description:
              'D0140: limited oral evaluation - problem focused (D0140)',
            Discount: 0,
            EncounterId: null,
            EnteredByUserId: '331d1784-862a-e711-8cd3-f0d5bf93e9cc',
            Fee: 120,
            LocationId: 5,
            Note: null,
            ProviderUserId: '04caf6a3-042a-e711-8cd3-f0d5bf93e9cc',
            RejectedReason: null,
            ServiceCodeId: '702cecd4-33cd-4879-ae0a-8a6b01d0434f',
            ServiceTransactionId: 'a6c98002-e30e-4187-a0f4-e80abb2a9457',
            ServiceTransactionStatusId: 1,
            Surface: null,
            SurfaceSummaryInfo: null,
            Roots: null,
            RootSummaryInfo: null,
            Tax: 0,
            Tooth: null,
            TransactionTypeId: 1,
            ObjectState: 'None',
            FailedMessage: null,
            Balance: 24,
            AgingDate: '2017-05-01T14:27:23.734',
            InsuranceEstimates: [],
            TotalEstInsurance: 0,
            TotalInsurancePaidAmount: 0,
            TotalAdjEstimate: 0,
            CreatedDate: '2017-05-01T14:27:23.9803899',
            IsDeleted: false,
            IsBalanceAlreadyUpdated: null,
            IsForClosingClaim: null,
            PredeterminationHasResponse: false,
            IsDiscounted: false,
            ProviderOnClaimsId: '00000000-0000-0000-0000-000000000000',
            DataTag: 'AAAAAAACPKQ=',
            UserModified: '384410cb-61ff-e611-b786-a4db3021bfa0',
            DateModified: '2017-05-24T16:21:34.8662526',
          },
        },
        {
          TreatmentPlanServiceHeader: {
            TreatmentPlanServiceId: '1014eec6-5ace-4cfe-ab85-40a66ba1eca8',
            Priority: 0,
            TreatmentPlanId: '664dc291-164f-46a7-b026-1d70c993b386',
            TreatmentPlanGroupNumber: 1,
            EstimatedInsurance: 0,
            PatientPortion: 0,
            ServiceTransactionId: 'a0428caa-7663-4b29-9a07-9a9c97e4bb77',
            PersonId: '1e057990-81f7-4fed-a4b1-b991cc3a99bb',
            DataTag: 'AAAAAAACPAg=',
            UserModified: '331d1784-862a-e711-8cd3-f0d5bf93e9cc',
            DateModified: '2017-05-23T20:24:02.5655756',
          },
          ServiceTransaction: {
            AccountMemberId: '2172adc6-0298-491f-b5d0-37e24d6de5a4',
            Amount: 325,
            AppointmentId: null,
            DateCompleted: null,
            DateEntered: '2017-05-01T21:09:17.264',
            Description: 'D2782: crown - 3/4 cast noble metal (D2782)',
            Discount: 0,
            EncounterId: null,
            EnteredByUserId: '331d1784-862a-e711-8cd3-f0d5bf93e9cc',
            Fee: 325,
            LocationId: 5,
            Note: null,
            ProviderUserId: '331d1784-862a-e711-8cd3-f0d5bf93e9cc',
            RejectedReason: null,
            ServiceCodeId: '0619cb3e-9c91-498a-9211-779ec7fc67a2',
            ServiceTransactionId: 'a0428caa-7663-4b29-9a07-9a9c97e4bb77',
            ServiceTransactionStatusId: 1,
            Surface: null,
            SurfaceSummaryInfo: null,
            Roots: null,
            RootSummaryInfo: null,
            Tax: 0,
            Tooth: '4',
            TransactionTypeId: 1,
            ObjectState: 'None',
            FailedMessage: null,
            Balance: 325,
            AgingDate: '2017-05-01T21:09:17.264',
            InsuranceEstimates: [],
            TotalEstInsurance: 0,
            TotalInsurancePaidAmount: 0,
            TotalAdjEstimate: 0,
            CreatedDate: '2017-05-01T21:09:17.8242962',
            IsDeleted: false,
            IsBalanceAlreadyUpdated: null,
            IsForClosingClaim: null,
            PredeterminationHasResponse: false,
            IsDiscounted: false,
            ProviderOnClaimsId: '00000000-0000-0000-0000-000000000000',
            DataTag: 'AAAAAAABQPk=',
            UserModified: '4c0b6e7e-6b2f-e711-8cd8-f0d5bf93e9cc',
            DateModified: '2017-05-02T20:51:35.8030333',
          },
        },
        {
          TreatmentPlanServiceHeader: {
            TreatmentPlanServiceId: '02b38c7c-ebdd-40d3-bebd-c63305f37dc7',
            Priority: 0,
            TreatmentPlanId: '664dc291-164f-46a7-b026-1d70c993b386',
            TreatmentPlanGroupNumber: 1,
            EstimatedInsurance: 0,
            PatientPortion: 0,
            ServiceTransactionId: 'a10354f2-1a94-4290-a218-b8fec1162c53',
            PersonId: '1e057990-81f7-4fed-a4b1-b991cc3a99bb',
            DataTag: 'AAAAAAACPAY=',
            UserModified: '331d1784-862a-e711-8cd3-f0d5bf93e9cc',
            DateModified: '2017-05-23T20:23:57.4036036',
          },
          ServiceTransaction: {
            AccountMemberId: '2172adc6-0298-491f-b5d0-37e24d6de5a4',
            Amount: 500,
            AppointmentId: null,
            DateCompleted: null,
            DateEntered: '2017-04-28T21:24:01.427',
            Description:
              'D2161: amalgam - four or more surfaces, primary or permanent (D2161)',
            Discount: 0,
            EncounterId: null,
            EnteredByUserId: '331d1784-862a-e711-8cd3-f0d5bf93e9cc',
            Fee: 500,
            LocationId: 5,
            Note: null,
            ProviderUserId: '331d1784-862a-e711-8cd3-f0d5bf93e9cc',
            RejectedReason: null,
            ServiceCodeId: '59bcee86-f705-4716-8f97-086447761e40',
            ServiceTransactionId: 'a10354f2-1a94-4290-a218-b8fec1162c53',
            ServiceTransactionStatusId: 1,
            Surface: 'M,O,D,B,L',
            SurfaceSummaryInfo: 'MODBL',
            Roots: null,
            RootSummaryInfo: null,
            Tax: 0,
            Tooth: '4',
            TransactionTypeId: 1,
            ObjectState: 'None',
            FailedMessage: null,
            Balance: 500,
            AgingDate: '2017-04-28T21:24:01.427',
            InsuranceEstimates: [],
            TotalEstInsurance: 0,
            TotalInsurancePaidAmount: 0,
            TotalAdjEstimate: 0,
            CreatedDate: '2017-04-28T21:24:01.7627267',
            IsDeleted: false,
            IsBalanceAlreadyUpdated: null,
            IsForClosingClaim: null,
            PredeterminationHasResponse: false,
            IsDiscounted: false,
            ProviderOnClaimsId: '00000000-0000-0000-0000-000000000000',
            DataTag: 'AAAAAAABQPo=',
            UserModified: '331d1784-862a-e711-8cd3-f0d5bf93e9cc',
            DateModified: '2017-05-02T19:50:28.8940076',
          },
        },
        {
          TreatmentPlanServiceHeader: {
            TreatmentPlanServiceId: 'a6b3123a-0ea4-4595-a090-d81e4171b0a2',
            Priority: 0,
            TreatmentPlanId: '664dc291-164f-46a7-b026-1d70c993b386',
            TreatmentPlanGroupNumber: 1,
            EstimatedInsurance: 0,
            PatientPortion: 0,
            ServiceTransactionId: 'dd29c019-2669-462b-ba04-fd7f17550daf',
            PersonId: '1e057990-81f7-4fed-a4b1-b991cc3a99bb',
            DataTag: 'AAAAAAACPAc=',
            UserModified: '331d1784-862a-e711-8cd3-f0d5bf93e9cc',
            DateModified: '2017-05-23T20:24:00.6157704',
          },
          ServiceTransaction: {
            AccountMemberId: '2172adc6-0298-491f-b5d0-37e24d6de5a4',
            Amount: 500,
            AppointmentId: 'fe997bd2-c34c-4288-96f8-a4aed058aede',
            DateCompleted: null,
            DateEntered: '2017-04-27T21:14:37.31',
            Description:
              'D2161: amalgam - four or more surfaces, primary or permanent (D2161)',
            Discount: 0,
            EncounterId: null,
            EnteredByUserId: '331d1784-862a-e711-8cd3-f0d5bf93e9cc',
            Fee: 500,
            LocationId: 5,
            Note: null,
            ProviderUserId: '331d1784-862a-e711-8cd3-f0d5bf93e9cc',
            RejectedReason: null,
            ServiceCodeId: '59bcee86-f705-4716-8f97-086447761e40',
            ServiceTransactionId: 'dd29c019-2669-462b-ba04-fd7f17550daf',
            ServiceTransactionStatusId: 1,
            Surface: 'M,O,D,B,L,L5,B5',
            SurfaceSummaryInfo: 'MODBL5',
            Roots: null,
            RootSummaryInfo: null,
            Tax: 0,
            Tooth: '2',
            TransactionTypeId: 1,
            ObjectState: 'None',
            FailedMessage: null,
            Balance: 0,
            AgingDate: '2017-04-27T21:14:37.31',
            InsuranceEstimates: [],
            TotalEstInsurance: 0,
            TotalInsurancePaidAmount: 0,
            TotalAdjEstimate: 0,
            CreatedDate: '2017-04-27T21:14:37.5185396',
            IsDeleted: false,
            IsBalanceAlreadyUpdated: null,
            IsForClosingClaim: null,
            PredeterminationHasResponse: false,
            IsDiscounted: false,
            ProviderOnClaimsId: '00000000-0000-0000-0000-000000000000',
            DataTag: 'AAAAAAACPKU=',
            UserModified: '384410cb-61ff-e611-b786-a4db3021bfa0',
            DateModified: '2017-05-24T16:21:34.732063',
          },
        },
      ],
    },
    {
      TreatmentPlanHeader: {
        TreatmentPlanId: 'cf960b24-daa4-4ed5-9d70-1dcd56802f87',
        PersonId: '1e057990-81f7-4fed-a4b1-b991cc3a99bb',
        Status: 'Proposed',
        TreatmentPlanName: 'Treatment Plan',
        TreatmentPlanDescription: null,
        RejectedReason: null,
        CreatedDate: '2017-04-26T18:48:23.931073',
        AlternateGroupId: 'd4de812f-42af-47b2-842c-5dbc5830f57e',
        Note: null,
        IsRecommended: false,
        SignatureFileAllocationId: null,
        PredeterminationMessage: '',
        HasAtLeastOnePredetermination: false,
        DataTag: 'AAAAAAAAhdc=',
        UserModified: '00000000-0000-0000-0000-000000000000',
        DateModified: '2017-04-26T18:48:23.933078',
      },
      TreatmentPlanServices: [
        {
          TreatmentPlanServiceHeader: {
            TreatmentPlanServiceId: '4bb242c6-e7f6-4ba7-8a0c-6fd7202a6d28',
            Priority: 0,
            TreatmentPlanId: 'cf960b24-daa4-4ed5-9d70-1dcd56802f87',
            TreatmentPlanGroupNumber: 1,
            EstimatedInsurance: 0,
            PatientPortion: 0,
            ServiceTransactionId: '2cbb937c-62a2-4cc0-9f85-69a4f19907fe',
            PersonId: '1e057990-81f7-4fed-a4b1-b991cc3a99bb',
            DataTag: 'AAAAAAAAhdk=',
            UserModified: '00000000-0000-0000-0000-000000000000',
            DateModified: '2017-04-26T18:48:23.997247',
          },
          ServiceTransaction: {
            AccountMemberId: '2172adc6-0298-491f-b5d0-37e24d6de5a4',
            Amount: 900,
            AppointmentId: null,
            DateCompleted: '2017-04-27T00:00:00',
            DateEntered: '2017-04-26T15:30:21.33',
            Description:
              'D6791: crown - full cast predominantly base metal (D6791)',
            Discount: 0,
            EncounterId: '6c517a96-05bc-4660-b595-5f915a86f5e8',
            EnteredByUserId: '331d1784-862a-e711-8cd3-f0d5bf93e9cc',
            Fee: 900,
            LocationId: 3,
            Note: '',
            ProviderUserId: '331d1784-862a-e711-8cd3-f0d5bf93e9cc',
            RejectedReason: null,
            ServiceCodeId: 'd916463a-5fdd-4b4c-a299-2bb4b8abc7d7',
            ServiceTransactionId: '2cbb937c-62a2-4cc0-9f85-69a4f19907fe',
            ServiceTransactionStatusId: 4,
            Surface: null,
            SurfaceSummaryInfo: null,
            Roots: null,
            RootSummaryInfo: null,
            Tax: 0,
            Tooth: '5',
            TransactionTypeId: 1,
            ObjectState: 'None',
            FailedMessage: null,
            Balance: 900,
            AgingDate: '2017-04-26T15:30:21.33',
            InsuranceEstimates: [],
            TotalEstInsurance: 0,
            TotalInsurancePaidAmount: 0,
            TotalAdjEstimate: 0,
            CreatedDate: '2017-04-26T18:48:23.0507324',
            IsDeleted: false,
            IsBalanceAlreadyUpdated: null,
            IsForClosingClaim: null,
            PredeterminationHasResponse: false,
            IsDiscounted: false,
            ProviderOnClaimsId: '331d1784-862a-e711-8cd3-f0d5bf93e9cc',
            DataTag: 'AAAAAAAAxC0=',
            UserModified: '00000000-0000-0000-0000-000000000000',
            DateModified: '2017-04-27T15:30:50.3945108',
          },
        },
        {
          TreatmentPlanServiceHeader: {
            TreatmentPlanServiceId: '048deec1-d404-4f0b-a679-82e020e8672e',
            Priority: 0,
            TreatmentPlanId: 'cf960b24-daa4-4ed5-9d70-1dcd56802f87',
            TreatmentPlanGroupNumber: 1,
            EstimatedInsurance: 0,
            PatientPortion: 0,
            ServiceTransactionId: '2c8e1a18-bcde-4efd-b0a3-978bec158cc1',
            PersonId: '1e057990-81f7-4fed-a4b1-b991cc3a99bb',
            DataTag: 'AAAAAAAAhdg=',
            UserModified: '00000000-0000-0000-0000-000000000000',
            DateModified: '2017-04-26T18:48:24.0483839',
          },
          ServiceTransaction: {
            AccountMemberId: '2172adc6-0298-491f-b5d0-37e24d6de5a4',
            Amount: 800,
            AppointmentId: null,
            DateCompleted: null,
            DateEntered: '2017-04-26T18:48:22.147',
            Description:
              'D6791: crown - full cast predominantly base metal (D6791)',
            Discount: 0,
            EncounterId: null,
            EnteredByUserId: '331d1784-862a-e711-8cd3-f0d5bf93e9cc',
            Fee: 800,
            LocationId: 3,
            Note: null,
            ProviderUserId: '331d1784-862a-e711-8cd3-f0d5bf93e9cc',
            RejectedReason: null,
            ServiceCodeId: 'd916463a-5fdd-4b4c-a299-2bb4b8abc7d7',
            ServiceTransactionId: '2c8e1a18-bcde-4efd-b0a3-978bec158cc1',
            ServiceTransactionStatusId: 1,
            Surface: null,
            SurfaceSummaryInfo: null,
            Roots: null,
            RootSummaryInfo: null,
            Tax: 0,
            Tooth: '7',
            TransactionTypeId: 1,
            ObjectState: 'None',
            FailedMessage: null,
            Balance: 800,
            AgingDate: '2017-04-26T18:48:22.147',
            InsuranceEstimates: [],
            TotalEstInsurance: 0,
            TotalInsurancePaidAmount: 0,
            TotalAdjEstimate: 0,
            CreatedDate: '2017-04-26T18:48:23.0908394',
            IsDeleted: false,
            IsBalanceAlreadyUpdated: null,
            IsForClosingClaim: null,
            PredeterminationHasResponse: false,
            IsDiscounted: false,
            ProviderOnClaimsId: '00000000-0000-0000-0000-000000000000',
            DataTag: 'AAAAAAABnmQ=',
            UserModified: '384410cb-61ff-e611-b786-a4db3021bfa0',
            DateModified: '2017-05-10T15:25:47.1341163',
          },
        },
      ],
    },
    {
      TreatmentPlanHeader: {
        TreatmentPlanId: 'db809f06-2a9c-4844-9cb3-f3fab003888b',
        PersonId: '1e057990-81f7-4fed-a4b1-b991cc3a99bb',
        Status: 'Rejected',
        TreatmentPlanName: 'Treatment Plan',
        TreatmentPlanDescription: null,
        RejectedReason: null,
        CreatedDate: '2017-05-09T19:52:54.773062',
        AlternateGroupId: '07058a60-c32a-45cf-be67-686de98f7c9a',
        Note: null,
        IsRecommended: false,
        SignatureFileAllocationId: null,
        PredeterminationMessage: '',
        HasAtLeastOnePredetermination: false,
        DataTag: 'AAAAAAACPI4=',
        UserModified: '331d1784-862a-e711-8cd3-f0d5bf93e9cc',
        DateModified: '2017-05-24T13:28:30.3720979',
      },
      TreatmentPlanServices: [
        {
          TreatmentPlanServiceHeader: {
            TreatmentPlanServiceId: '6d25f28f-b3a5-4b73-9efd-68bf60d0ec6a',
            Priority: 0,
            TreatmentPlanId: 'db809f06-2a9c-4844-9cb3-f3fab003888b',
            TreatmentPlanGroupNumber: 1,
            EstimatedInsurance: 0,
            PatientPortion: 0,
            ServiceTransactionId: '2c8e1a18-bcde-4efd-b0a3-978bec158cc1',
            PersonId: '1e057990-81f7-4fed-a4b1-b991cc3a99bb',
            DataTag: 'AAAAAAABnmY=',
            UserModified: '384410cb-61ff-e611-b786-a4db3021bfa0',
            DateModified: '2017-05-10T15:25:47.1967835',
          },
          ServiceTransaction: {
            AccountMemberId: '2172adc6-0298-491f-b5d0-37e24d6de5a4',
            Amount: 800,
            AppointmentId: null,
            DateCompleted: null,
            DateEntered: '2017-04-26T18:48:22.147',
            Description:
              'D6791: crown - full cast predominantly base metal (D6791)',
            Discount: 0,
            EncounterId: null,
            EnteredByUserId: '331d1784-862a-e711-8cd3-f0d5bf93e9cc',
            Fee: 800,
            LocationId: 3,
            Note: null,
            ProviderUserId: '331d1784-862a-e711-8cd3-f0d5bf93e9cc',
            RejectedReason: null,
            ServiceCodeId: 'd916463a-5fdd-4b4c-a299-2bb4b8abc7d7',
            ServiceTransactionId: '2c8e1a18-bcde-4efd-b0a3-978bec158cc1',
            ServiceTransactionStatusId: 1,
            Surface: null,
            SurfaceSummaryInfo: null,
            Roots: null,
            RootSummaryInfo: null,
            Tax: 0,
            Tooth: '7',
            TransactionTypeId: 1,
            ObjectState: 'None',
            FailedMessage: null,
            Balance: 800,
            AgingDate: '2017-04-26T18:48:22.147',
            InsuranceEstimates: [],
            TotalEstInsurance: 0,
            TotalInsurancePaidAmount: 0,
            TotalAdjEstimate: 0,
            CreatedDate: '2017-04-26T18:48:23.0908394',
            IsDeleted: false,
            IsBalanceAlreadyUpdated: null,
            IsForClosingClaim: null,
            PredeterminationHasResponse: false,
            IsDiscounted: false,
            ProviderOnClaimsId: '00000000-0000-0000-0000-000000000000',
            DataTag: 'AAAAAAABnmQ=',
            UserModified: '384410cb-61ff-e611-b786-a4db3021bfa0',
            DateModified: '2017-05-10T15:25:47.1341163',
          },
        },
        {
          TreatmentPlanServiceHeader: {
            TreatmentPlanServiceId: '578b3412-4fb9-4d56-ac70-b2f7eaaa217e',
            Priority: 0,
            TreatmentPlanId: 'db809f06-2a9c-4844-9cb3-f3fab003888b',
            TreatmentPlanGroupNumber: 1,
            EstimatedInsurance: 0,
            PatientPortion: 0,
            ServiceTransactionId: 'e0a019e4-725c-433f-827a-0172e2897d01',
            PersonId: '1e057990-81f7-4fed-a4b1-b991cc3a99bb',
            DataTag: 'AAAAAAABgLE=',
            UserModified: '331d1784-862a-e711-8cd3-f0d5bf93e9cc',
            DateModified: '2017-05-09T19:52:54.980792',
          },
          ServiceTransaction: {
            AccountMemberId: '2172adc6-0298-491f-b5d0-37e24d6de5a4',
            Amount: 0,
            AppointmentId: 'fe997bd2-c34c-4288-96f8-a4aed058aede',
            DateCompleted: null,
            DateEntered: '2017-04-27T21:12:18.139',
            Description:
              'D0120: periodic oral evaluation - established patient (D0120)',
            Discount: 0,
            EncounterId: null,
            EnteredByUserId: '331d1784-862a-e711-8cd3-f0d5bf93e9cc',
            Fee: 0,
            LocationId: 5,
            Note: null,
            ProviderUserId: '331d1784-862a-e711-8cd3-f0d5bf93e9cc',
            RejectedReason: null,
            ServiceCodeId: '3115df6b-999d-4b7e-b4ce-f54b3c2fc12a',
            ServiceTransactionId: 'e0a019e4-725c-433f-827a-0172e2897d01',
            ServiceTransactionStatusId: 1,
            Surface: null,
            SurfaceSummaryInfo: null,
            Roots: null,
            RootSummaryInfo: null,
            Tax: 0,
            Tooth: null,
            TransactionTypeId: 1,
            ObjectState: 'None',
            FailedMessage: null,
            Balance: 0,
            AgingDate: '2017-04-27T21:12:18.139',
            InsuranceEstimates: [],
            TotalEstInsurance: 0,
            TotalInsurancePaidAmount: 0,
            TotalAdjEstimate: 0,
            CreatedDate: '2017-04-27T21:12:18.4910374',
            IsDeleted: false,
            IsBalanceAlreadyUpdated: null,
            IsForClosingClaim: null,
            PredeterminationHasResponse: false,
            IsDiscounted: false,
            ProviderOnClaimsId: '00000000-0000-0000-0000-000000000000',
            DataTag: 'AAAAAAACPKY=',
            UserModified: '384410cb-61ff-e611-b786-a4db3021bfa0',
            DateModified: '2017-05-24T16:21:34.5942349',
          },
        },
      ],
    },
  ];
  var serviceCodesMock = [
    {
      ServiceCodeId: '0619cb3e-9c91-498a-9211-779ec7fc67a2',
      Code: 'code1',
      CdtCodeName: 'cdtCode1',
      Description: 'desc1',
    },
    {
      ServiceCodeId: '702cecd4-33cd-4879-ae0a-8a6b01d0434f',
      Code: 'code2',
      CdtCodeName: 'cdtCode2',
      Description: 'desc2',
    },
    {
      ServiceCodeId: '0619cb3e-9c91-498a-9211-779ec7fc67a2',
      Code: 'code3',
      CdtCodeName: 'cdtCode3',
      Description: 'desc3',
    },
    {
      ServiceCodeId: '59bcee86-f705-4716-8f97-086447761e40',
      Code: 'code4',
      CdtCodeName: 'cdtCode4',
      Description: 'desc4',
    },
    {
      ServiceCodeId: '59bcee86-f705-4716-8f97-086447761e40',
      Code: 'cole5',
      CdtCodeName: 'cdtCode',
      Description: 'desc5',
    },
  ];

  beforeEach(
    module('Soar.Schedule', function ($provide) {
      //mock for referenceDataService
      referenceDataService = {
        get: jasmine.createSpy(),
        registerForLocationSpecificDataChanged: jasmine.createSpy(),
        unregisterForLocationSpecificDataChanged: jasmine.createSpy(),
        entityNames: {
          serviceCodes: 'serviceCodes',
          feeLists: 'feeLists',
          locations: 'locations',
          holidays: 'holidays',
          appointmentTypes: 'appointmentTypes',
          users: 'users',
          locationRooms: 'locationRooms',
          locationHours: 'locationHours',
          serviceTypes: 'serviceTypes',
          conditions: 'conditions',
          drawTypes: 'drawTypes',
          preventiveServiceTypes: 'preventiveServiceTypes',
          preventiveServicesOverview: 'preventiveServicesOverview',
          practiceSettings: 'practiceSettings',
        },
      };
      $provide.value('referenceDataService', referenceDataService);
    })
  );

  beforeEach(
    module('Soar.Patient', function ($provide) {
      financialService = {
        CreateInsuranceEstimateObject: jasmine.createSpy().and.returnValue({}),
        RecalculateInsuranceWithCascadingEstimates: jasmine
          .createSpy()
          .and.returnValue({}),
        CreateOrCloneInsuranceEstimateObject: jasmine
          .createSpy()
          .and.returnValue({}),
      };
      $provide.value('FinancialService', financialService);

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
      };
      $provide.value('PatientValidationFactory', patientValidationFactory);

      treatmentPlansFactory = {
        Headers: jasmine.createSpy().and.returnValue({
          then: jasmine
            .createSpy()
            .and.returnValue({ Value: treatmentPlansMock }),
        }),
        GetTreatmentPlanById: jasmine.createSpy().and.returnValue({}),
      };
      $provide.value('TreatmentPlansFactory', treatmentPlansFactory);

      treatmentPlansApiFactory = {
        getTreatmentPlansWithSevices: jasmine.createSpy().and.returnValue({
          then: jasmine.createSpy().and.returnValue({}),
        }),
      };
      $provide.value('TreatmentPlansApiFactory', treatmentPlansApiFactory);

      //mock for listHelper service
      listHelper = {
        findItemByFieldValue: jasmine
          .createSpy('listHelper.findItemByFieldValue')
          .and.returnValue(1),
      };
      usersFactory = {
        Users: jasmine.createSpy().and.returnValue({ then: function () {} }),
      };
      patientAppointmentsFactory = {
        AppointmentDataWithoutDetails: jasmine.createSpy().and.returnValue({
          then: jasmine.createSpy().and.returnValue({ Value: 1 }),
        }),
      };
      $provide.value('PatientAppointmentsFactory', patientAppointmentsFactory);

      scheduleDisplayPlannedServicesService = {
        getSurfacesInSummaryFormat: jasmine.createSpy().and.returnValue('BCS'),
      };
      $provide.value(
        'ScheduleDisplayPlannedServicesService',
        scheduleDisplayPlannedServicesService
      );

      $provide.value('UsersFactory', usersFactory);

      var serviceCodeData = [
        {
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
          UseCodeForRangeOfTeeth: false,
          IsActive: true,
          IsEligibleForDiscount: true,
          Notes: 'text',
          SubmitOnInsurance: true,
          IsSwiftPickCode: false,
          SwiftPickServiceCodes: null,
        },
        {
          Surface: '',
          Tooth: '',
          CreationDate: '',
          ServiceCodeId: 'c70100db-aae1-49df-94da-e727cd9afbe3',
          CdtCodeId: '00000000-0000-0000-0000-000000000000',
          CdtCodeName: '',
          Code: 'spcTest',
          Description: 'spcTest desc',
          ServiceTypeId: '00000000-0000-0000-0000-000000000000',
          ServiceTypeDescription: '',
          DisplayAs: 'spcTest',
          Fee: 114,
          TaxableServiceTypeId: 0,
          AffectedAreaId: 0,
          UsuallyPerformedByProviderTypeId: null,
          UseCodeForRangeOfTeeth: false,
          IsActive: true,
          IsEligibleForDiscount: false,
          Notes: null,
          SubmitOnInsurance: false,
          IsSwiftPickCode: true,
          SwiftPickServiceCodes: [
            {
              SwiftPickServiceCodeId: 'ebfc4ad6-7f97-43dc-80c8-090bf398899b',
              SwiftPickCodeId: 'c70100db-aae1-49df-94da-e727cd9afbe3',
              ServiceCodeId: '52331da3-45c1-4d58-be35-197f96d23918',
              Code: 'scTest1',
              CdtCodeName: 'D9211',
              Description: 'scTest1 deswc',
              Fee: 57,
            },
            {
              SwiftPickServiceCodeId: '1bf3c75e-c52a-4c32-8d80-42a99bad0be5',
              SwiftPickCodeId: 'c70100db-aae1-49df-94da-e727cd9afbe3',
              ServiceCodeId: '52331da3-45c1-4d58-be35-197f96d23918',
              Code: 'scTest1',
              CdtCodeName: 'D9211',
              Description: 'scTest1 deswc',
              Fee: 57,
            },
          ],
        },
      ];

      patientServices = {
        ServiceTransactions: {
          get: jasmine.createSpy().and.returnValue({ Value: serviceCodeData }),
        },
      };
      //mock for toaster functionality
      toastrFactory = {
        success: jasmine.createSpy(),
        error: jasmine.createSpy(),
      };

      q = {
        all: jasmine.createSpy().and.returnValue({
          then: jasmine.createSpy(),
        }),
        defer: jasmine.createSpy().and.returnValue({
          resolve: jasmine.createSpy(),
        }),
        when: jasmine.createSpy().and.returnValue({
          then: jasmine.createSpy().and.returnValue({
            then: jasmine.createSpy(),
          }),
        }),
      };
      $provide.value('ModalFactory', mockModalFactory);
      $provide.value('PersonFactory', {});
    })
  );
  // Create controller and scope
  beforeEach(inject(function ($rootScope, $controller, $injector, $filter) {
    scope = $rootScope.$new();
    filter = $filter;
    rootScope = $rootScope;
    scope.onAdd = function () {};
    ctrl = $controller('TreatmentSelectorController', {
      PatientServices: patientServices,
      PatientAppointmentsFactory: patientAppointmentsFactory,
      $scope: scope,
      $rootScope: rootScope,
      TreatmentPlansFactory: treatmentPlansFactory,
      ListHelper: listHelper,
      toastrFactory: toastrFactory,
      FinancialService: financialService,
      LocationService: locationService,
      TimeZones: timeZones,
      $filter: filter,
      $q: q,
    });
    timeout = $injector.get('$timeout');
    spyOn(timeout, 'cancel');
    scope.serviceCodestx = serviceCodesMock;
  }));

  it('should initialize controller', function () {
    expect(ctrl).not.toBeNull();
  });

  describe('onInit function -> ', function () {
    it('should call getTreatmentPlans', function () {
      spyOn(ctrl, 'getTreatmentPlans');
      scope.flyout = false;
      scope.serviceFilter = 'appointment';
      scope.patient = { PersonAccount: { PersonId: '' } };
      ctrl.$onInit();
      expect(ctrl.getTreatmentPlans).toHaveBeenCalled();
    });
  });

  describe('initializeServiceCodes function -> ', function () {
    it('should call referenceDataService.get', function () {
      scope.initializeServiceCodes();
      expect(referenceDataService.get).toHaveBeenCalledWith(
        referenceDataService.entityNames.serviceCodes
      );
    });
  });

  describe('getProviders function -> ', function () {
    it('should call referenceDataService.get', function () {
      scope.getProviders();
      expect(referenceDataService.get).toHaveBeenCalledWith(
        referenceDataService.entityNames.users
      );
    });
  });

  describe('$on openTreatmentPlanFlyout function ->', function () {
    var deferred;
    beforeEach(function () {
      spyOn(ctrl, 'getLastInsuranceOrderOnServicesAdded');
      deferred = q.defer();
      scope.treatmentPlans = [{}, {}];
      spyOn(ctrl, 'processServicesForEncounter');
      spyOn(ctrl, 'setQuickAddDisabledOnPlans');
    });

    it('should call ctrl.getLastInsuranceOrderOnServicesAdded if firstLoad is false and scope.serviceFilter is encounter or encounter-refactored', function () {
      scope.serviceFilter = 'encounter-refactored';
      scope.firstLoad = false;
      scope.$broadcast('openTreatmentPlanFlyout');
      expect(ctrl.getLastInsuranceOrderOnServicesAdded).toHaveBeenCalled();
    });

    it('should call ctrl.processServicesForEncounter if firstLoad is false and scope.serviceFilter is encounter or encounter-refactored', function () {
      scope.serviceFilter = 'encounter-refactored';
      scope.firstLoad = false;
      scope.$broadcast('openTreatmentPlanFlyout');
      expect(ctrl.processServicesForEncounter).toHaveBeenCalled();
    });

    it('should call ctrl.setQuickAddDisabledOnPlans if firstLoad is false and scope.serviceFilter is encounter or encounter-refactored', function () {
      scope.serviceFilter = 'encounter-refactored';
      scope.firstLoad = false;
      scope.$broadcast('openTreatmentPlanFlyout');
      expect(ctrl.setQuickAddDisabledOnPlans).toHaveBeenCalledWith(
        scope.treatmentPlans
      );
    });

    it('should call ctrl.getTreatmentPlans', function () {
      scope.$broadcast('openTreatmentPlanFlyout');
      expect(q.when().then).toHaveBeenCalled();
    });
  });

  describe('$on TreatmentPlansUpdated function ->', function () {
    it('should call ctrl.getTreatmentPlans', function () {
      spyOn(ctrl, 'getTreatmentPlans');
      scope.$broadcast('TreatmentPlansUpdated');
      expect(ctrl.getTreatmentPlans).toHaveBeenCalled();
    });
  });

  describe('watch patient ->', function () {
    it('should call getTreatmentPlans if patient changes', function () {
      spyOn(ctrl, 'getTreatmentPlans');
      scope.patient = { PatientId: '123456789' };
      scope.$apply();
      scope.patient = { PatientId: '123456788' };
      scope.$apply();
      expect(ctrl.getTreatmentPlans).toHaveBeenCalled();
    });
  });

  describe('ctrl.loadTreatmentPlanServiceData function ->', function () {
    beforeEach(function () {
      spyOn(ctrl, 'processServicesForAppointment');
      spyOn(ctrl, 'getLastInsuranceOrderOnServicesAdded').and.callFake(
        function () {
          return 2;
        }
      );
    });

    it('should set treatmentPlanCount ', function () {
      var treatmentPlans = angular.copy(treatmentPlansMock);
      ctrl.loadTreatmentPlanServiceData(treatmentPlans);
      expect(scope.treatmentPlanCount).toEqual(treatmentPlans.length);
    });

    it('should set call financialService.CreateOrCloneInsuranceEstimateObject for each treatmentPlans serviceTransaction ', function () {
      var treatmentPlans = angular.copy(treatmentPlansMock);
      ctrl.loadTreatmentPlanServiceData(treatmentPlans);
      angular.forEach(treatmentPlans, function (tp) {
        angular.forEach(tp.TreatmentPlanServices, function (tps) {
          expect(
            financialService.CreateOrCloneInsuranceEstimateObject
          ).toHaveBeenCalledWith(tps.ServiceTransaction);
        });
      });
    });

    it('should set call financialService.RecalculateInsuranceWithCascadingEstimates for each treatmentPlans services if for encounter ', function () {
      var treatmentPlans = angular.copy(treatmentPlansMock);
      scope.serviceFilter = 'encounter';
      ctrl.loadTreatmentPlanServiceData(treatmentPlans);
      angular.forEach(treatmentPlans, function (tp) {
        expect(
          financialService.RecalculateInsuranceWithCascadingEstimates
        ).toHaveBeenCalled();
      });
    });

    it('should set $$Collapsed to true on all treatment plans', function () {
      var treatmentPlans = angular.copy(treatmentPlansMock);
      ctrl.loadTreatmentPlanServiceData(treatmentPlans);
      _.forEach(treatmentPlans, function (tp) {
        expect(tp.$$Collapsed).toEqual(false);
      });
    });

    it('should set $$Selected to false on all treatment plan services', function () {
      var treatmentPlans = angular.copy(treatmentPlansMock);
      ctrl.loadTreatmentPlanServiceData(treatmentPlans);
      _.forEach(treatmentPlans, function (tp) {
        _.forEach(tp.TreatmentPlanServices, function (tps) {
          expect(tps.ServiceTransaction.$$Selected).toEqual(false);
        });
      });
    });

    it('should call ctrl.processServicesForEncounter if scope.serviceFilter is encounter-refactored', function () {
      spyOn(ctrl, 'processServicesForEncounter');
      scope.serviceFilter = 'encounter-refactored';
      var treatmentPlans = angular.copy(treatmentPlansMock);
      ctrl.loadTreatmentPlanServiceData(treatmentPlans);
      expect(ctrl.processServicesForEncounter).toHaveBeenCalled();
    });

    it('should set $$RootOrSurface based on Roots on Roots if ServiceTransaction.Roots is not null', function () {
      var treatmentPlans = angular.copy(treatmentPlansMock);
      _.forEach(treatmentPlans, function (tp) {
        _.forEach(tp.TreatmentPlanServices, function (tps) {
          tps.ServiceTransaction.Roots = 'ABC';
        });
      });
      ctrl.loadTreatmentPlanServiceData(treatmentPlans);
      _.forEach(treatmentPlans, function (tp) {
        _.forEach(tp.TreatmentPlanServices, function (tps) {
          if (!_.isNil(tps.ServiceTransaction.Roots)) {
            expect(tps.ServiceTransaction.$$RootOrSurface).toEqual(
              tps.ServiceTransaction.Roots
            );
          }
        });
      });
    });

    it('should set $$RootOrSurface based on Surfaces if ServiceTransaction.Roots is null', function () {
      var treatmentPlans = angular.copy(treatmentPlansMock);
      _.forEach(treatmentPlans, function (tp) {
        _.forEach(tp.TreatmentPlanServices, function (tps) {
          tps.ServiceTransaction.Roots = null;
          tps.ServiceTransaction.Surface = 'CBS';
        });
      });
      ctrl.loadTreatmentPlanServiceData(treatmentPlans);
      _.forEach(treatmentPlans, function (tp) {
        _.forEach(tp.TreatmentPlanServices, function (tps) {
          if (_.isNil(tps.ServiceTransaction.Roots)) {
            expect(tps.ServiceTransaction.$$RootOrSurface).toEqual('BCS');
          }
        });
      });
    });

    it('should call ctrl.processServicesForAppointment();   ', function () {
      var treatmentPlans = angular.copy(treatmentPlansMock);
      _.forEach(treatmentPlans, function (tp) {
        _.forEach(tp.TreatmentPlanServices, function (tps) {
          tps.ServiceTransaction.Roots = null;
          tps.ServiceTransaction.Surface = 'CBS';
        });
      });
      ctrl.loadTreatmentPlanServiceData(treatmentPlans);
      expect(ctrl.processServicesForAppointment).toHaveBeenCalled();
    });

    it('should set the order of the services based on TreatmentPlanGroupNumber, then Priority, then DateModified ', function () {
      var treatmentPlans = angular.copy(treatmentPlansMock);
      var treatmentPlan = treatmentPlans[0];
      var i = 6;
      var serviceTransactionId = 10;
      _.forEach(treatmentPlan.TreatmentPlanServices, function (tps) {
        i--;
        serviceTransactionId++;
        tps.TreatmentPlanServiceHeader.TreatmentPlanGroupNumber = 1;
        tps.ServiceTransaction.ServiceTransactionId = serviceTransactionId;
        tps.TreatmentPlanServiceHeader.TreatmentPlanServiceId =
          'a6b3123a-0ea4-4595-a090-d81e4171b0a2';
        tps.TreatmentPlanServiceHeader.Priority = i;
        tps.TreatmentPlanServiceHeader.DateModified = '2019-02-12';
      });
      expect(
        treatmentPlan.TreatmentPlanServices[0].ServiceTransaction
          .ServiceTransactionId
      ).toEqual(11);
      expect(
        treatmentPlan.TreatmentPlanServices[1].ServiceTransaction
          .ServiceTransactionId
      ).toEqual(12);
      expect(
        treatmentPlan.TreatmentPlanServices[2].ServiceTransaction
          .ServiceTransactionId
      ).toEqual(13);
      expect(
        treatmentPlan.TreatmentPlanServices[3].ServiceTransaction
          .ServiceTransactionId
      ).toEqual(14);
      expect(
        treatmentPlan.TreatmentPlanServices[4].ServiceTransaction
          .ServiceTransactionId
      ).toEqual(15);

      expect(
        treatmentPlan.TreatmentPlanServices[0].TreatmentPlanServiceHeader
          .Priority
      ).toEqual(5);
      expect(
        treatmentPlan.TreatmentPlanServices[1].TreatmentPlanServiceHeader
          .Priority
      ).toEqual(4);
      expect(
        treatmentPlan.TreatmentPlanServices[2].TreatmentPlanServiceHeader
          .Priority
      ).toEqual(3);
      expect(
        treatmentPlan.TreatmentPlanServices[3].TreatmentPlanServiceHeader
          .Priority
      ).toEqual(2);
      expect(
        treatmentPlan.TreatmentPlanServices[4].TreatmentPlanServiceHeader
          .Priority
      ).toEqual(1);

      ctrl.loadTreatmentPlanServiceData([treatmentPlan]);

      expect(
        ctrl.treatmentPlanServices[0].TreatmentPlanServiceHeader.Priority
      ).toEqual(1);
      expect(
        ctrl.treatmentPlanServices[1].TreatmentPlanServiceHeader.Priority
      ).toEqual(2);
      expect(
        ctrl.treatmentPlanServices[2].TreatmentPlanServiceHeader.Priority
      ).toEqual(3);
      expect(
        ctrl.treatmentPlanServices[3].TreatmentPlanServiceHeader.Priority
      ).toEqual(4);
      expect(
        ctrl.treatmentPlanServices[4].TreatmentPlanServiceHeader.Priority
      ).toEqual(5);

      expect(
        ctrl.treatmentPlanServices[0].ServiceTransaction.ServiceTransactionId
      ).toEqual(15);
      expect(
        ctrl.treatmentPlanServices[1].ServiceTransaction.ServiceTransactionId
      ).toEqual(14);
      expect(
        ctrl.treatmentPlanServices[2].ServiceTransaction.ServiceTransactionId
      ).toEqual(13);
      expect(
        ctrl.treatmentPlanServices[3].ServiceTransaction.ServiceTransactionId
      ).toEqual(12);
      expect(
        ctrl.treatmentPlanServices[4].ServiceTransaction.ServiceTransactionId
      ).toEqual(11);
    });
  });

  describe('$scope.onSelectedCodes method ->', function () {
    beforeEach(function () {
      scope.flyout = true;
      spyOn(
        ctrl,
        'getSelectedServiceTransactions'
      ).and.callFake(function () {});
      spyOn(ctrl, 'updateCheckedRowsServices').and.callFake(function () {});
    });
    it('should call ctrl.getSelectedServiceTransactions if serviceFilter is appointment and flyout is true ', function () {
      scope.serviceFilter = 'appointment';
      scope.onSelectedCodes();
      expect(ctrl.getSelectedServiceTransactions).toHaveBeenCalled();
    });

    it('should call ctrl.getSelectedServiceTransactions if serviceFilter is not appointment and flyout is true ', function () {
      scope.serviceFilter = 'encounter';
      scope.onSelectedCodes();
      expect(ctrl.getSelectedServiceTransactions).toHaveBeenCalled();
    });

    it('should call ctrl.updateCheckedRowsServices if serviceFilter is not appointment and flyout is true ', function () {
      scope.serviceFilter = 'encounter';
      scope.onSelectedCodes();
      expect(ctrl.updateCheckedRowsServices).toHaveBeenCalled();
    });
  });

  describe('ctrl.getSelectedServices method ->', function () {
    beforeEach(function () {
      // set all treatment plan services selected in first plan
      scope.treatmentPlans = angular.copy(treatmentPlansMock);
      _.forEach(scope.treatmentPlans[0].TreatmentPlanServices, function (tps) {
        tps.ServiceTransaction.$$Selected = true;
      });
      spyOn(ctrl, 'getLastInsuranceOrderOnServicesAdded').and.callFake(
        function () {
          return 2;
        }
      );
    });
    it('should create list of selectedServices to return to parent ', function () {
      var result = ctrl.getSelectedServices();
      expect(result.length).toEqual(
        scope.treatmentPlans[0].TreatmentPlanServices.length
      );
    });

    it('should call ctrl.getLastInsuranceOrderOnServicesAdded to get lastInsuranceOrderNumber ', function () {
      ctrl.getSelectedServices();
      expect(ctrl.getLastInsuranceOrderOnServicesAdded).toHaveBeenCalled();
    });

    it('should set InsuranceOrder on selectedServices', function () {
      var selectedServices = ctrl.getSelectedServices();
      expect(selectedServices[0].InsuranceOrder).toEqual(3);
      expect(selectedServices[1].InsuranceOrder).toEqual(4);
      expect(selectedServices[2].InsuranceOrder).toEqual(5);
      expect(selectedServices[3].InsuranceOrder).toEqual(6);
    });
  });

  describe('ctrl.getSelectedServices method ->', function () {
    var services;
    beforeEach(function () {
      services = [
        {
          showCode: '1234',
          ServiceCode: null,
          Description: null,
          showDesc: '',
          ServiceCodeId: '0619cb3e-9c91-498a-9211-779ec7fc67a2',
          $$Selected: true,
        },
        {
          showCode: '3456',
          ServiceCode: null,
          Description: null,
          showDesc: '',
          ServiceCodeId: '702cecd4-33cd-4879-ae0a-8a6b01d0434f',
          $$Selected: true,
        },
        {
          showCode: '5678',
          ServiceCode: null,
          Description: null,
          showDesc: '',
          ServiceCodeId: '0619cb3e-9c91-498a-9211-779ec7fc67a2',
          $$Selected: true,
        },
      ];
      spyOn(ctrl, 'getLastInsuranceOrderOnServicesAdded').and.callFake(
        function () {
          return 2;
        }
      );
    });

    it('should set properties on selectedServices from serviceCodes and return list of service codes to match ', function () {
      var serviceCodes = ctrl.getServiceCodesForSelectedServices(services);

      expect(services[0].ServiceCode).toEqual(services[0].showCode);
      expect(services[1].ServiceCode).toEqual(services[1].showCode);
      expect(services[2].ServiceCode).toEqual(services[2].showCode);

      expect(services[0].DisplayAs).toEqual(serviceCodes[0].DisplayAs);
      expect(services[0].AffectedAreaId).toEqual(
        serviceCodes[0].AffectedAreaId
      );
      expect(services[0].ObjectState).toEqual('Update');
      expect(services[0].$$isProposed).toEqual(true);
    });

    it('should return list of service codes to match ', function () {
      var serviceCodes = ctrl.getServiceCodesForSelectedServices(services);
      expect(serviceCodes[0].ServiceCodeId).toEqual(services[0].ServiceCodeId);
      expect(serviceCodes[1].ServiceCodeId).toEqual(services[1].ServiceCodeId);
      expect(serviceCodes[2].ServiceCodeId).toEqual(services[2].ServiceCodeId);
    });
  });

  describe('ctrl.getSelectedServiceTransactions method ->', function () {
    var mockServices = [
      {
        showCode: '1234',
        ServiceCode: null,
        Description: null,
        showDesc: '',
        ServiceCodeId: '0619cb3e-9c91-498a-9211-779ec7fc67a2',
        $$Selected: true,
        ServiceTransactionId: '1',
      },
      {
        showCode: '3456',
        ServiceCode: null,
        Description: null,
        showDesc: '',
        ServiceCodeId: '702cecd4-33cd-4879-ae0a-8a6b01d0434f',
        $$Selected: true,
        ServiceTransactionId: '2',
      },
    ];
    beforeEach(function () {
      spyOn(ctrl, 'addServicesToEncounter');
      scope.serviceFilter = 'encounter-refactored';
    });

    it('should call ctrl.getSelectedServices', function () {
      spyOn(ctrl, 'getSelectedServices');
      ctrl.getSelectedServiceTransactions();
      expect(ctrl.getSelectedServices).toHaveBeenCalled();
    });

    it('should call addServicesToEncounter function when called from encounter page and no service exists on future appointment(s)', function () {
      spyOn(ctrl, 'getSelectedServices').and.callFake(function () {
        return mockServices;
      });

      ctrl.getSelectedServiceTransactions();
      expect(ctrl.addServicesToEncounter).toHaveBeenCalledWith(mockServices);
    });

    it('should call promptServiceOnFutureAppointment function when called from encounter page and a service exists on future appointment(s)', function () {
      var mockModifiedServices = [
        {
          showCode: '1234',
          ServiceCode: null,
          Description: null,
          showDesc: '',
          ServiceCodeId: '0619cb3e-9c91-498a-9211-779ec7fc67a2',
          $$Selected: true,
          ServiceTransactionId: '1',
          AppointmentId: '1',
          StartTime: new Date(Date.now() + 1000000).toISOString(),
        },
        {
          showCode: '3456',
          ServiceCode: null,
          Description: null,
          showDesc: '',
          ServiceCodeId: '702cecd4-33cd-4879-ae0a-8a6b01d0434f',
          $$Selected: true,
          ServiceTransactionId: '2',
        },
      ];
      spyOn(
        ctrl,
        'promptServiceOnFutureAppointment'
      ).and.callFake(function () {});
      spyOn(ctrl, 'getSelectedServices').and.callFake(function () {
        return mockModifiedServices;
      });

      ctrl.getSelectedServiceTransactions();
      expect(ctrl.promptServiceOnFutureAppointment).toHaveBeenCalledWith(
        [mockServices[0].ServiceTransactionId],
        mockModifiedServices
      );
      expect(ctrl.addServicesToEncounter).not.toHaveBeenCalled();
    });
  });

  describe('ctrl.addServicesToEncounter method ->', function () {
    beforeEach(function () {
      spyOn(ctrl, 'getServiceCodesForSelectedServices');
      spyOn(scope, 'hideFilters');
      scope.addSelectedServices = jasmine
        .createSpy('addSelectedServices')
        .and.callFake(function () {});
    });

    it('should call ctrl.getServiceCodesForSelectedServices', function () {
      ctrl.addServicesToEncounter();
      expect(ctrl.getServiceCodesForSelectedServices).toHaveBeenCalled();
    });

    it('should call ctrl.hideFilters', function () {
      ctrl.addServicesToEncounter();
      expect(scope.hideFilters).toHaveBeenCalled();
    });

    it('should call scope.addSelectedServices', function () {
      scope.includeEstIns = false;
      ctrl.getSelectedTreatmentPlanServices = jasmine
        .createSpy()
        .and.returnValue('txPlanServices');

      ctrl.addServicesToEncounter();
      expect(scope.addSelectedServices).toHaveBeenCalledWith(
        {
          PlannedServices: undefined,
          TreatmentPlanServices: null,
          ServiceCodes: undefined,
        },
        false
      );
    });

    it('should call scope.addSelectedServices with TreatmentPlanServices when flag is enabled', function () {
      scope.includeEstIns = true;
      ctrl.getSelectedTreatmentPlanServices = jasmine
        .createSpy()
        .and.returnValue('txPlanServices');

      ctrl.addServicesToEncounter();
      expect(scope.addSelectedServices).toHaveBeenCalledWith(
        {
          PlannedServices: undefined,
          TreatmentPlanServices: 'txPlanServices',
          ServiceCodes: undefined,
        },
        false
      );
    });
  });

  describe('promptServiceOnFutureAppointment function ->', function () {
    var mockServices = [
      { ServiceTransactionId: '1', AppointmentId: '1' },
      { ServiceTransactionId: '2' },
    ];

    it('should set future appointment service AppointmentId to null and call addServicesToEncoutner when user selects confirm', function () {
      mockModalFactory.ConfirmModal = jasmine
        .createSpy('modalFactory.ConfirmModal')
        .and.returnValue({
          then: function (callback) {
            callback();
          },
        });
      spyOn(ctrl, 'addServicesToEncounter').and.callFake(function () {});
      var mockModifiedServices = [
        { ServiceTransactionId: '1', AppointmentId: null },
        { ServiceTransactionId: '2' },
      ];

      ctrl.promptServiceOnFutureAppointment(
        mockServices[0].ServiceTransactionId,
        mockServices
      );
      expect(ctrl.addServicesToEncounter).toHaveBeenCalledWith(
        mockModifiedServices
      );
    });

    it('should call ctrl.hideFilters when user selects cancel', function () {
      mockModalFactory.ConfirmModal = jasmine
        .createSpy('modalFactory.ConfirmModal')
        .and.returnValue({
          then: function (callback, declineCallback) {
            declineCallback();
          },
        });
      spyOn(scope, 'hideFilters');

      ctrl.promptServiceOnFutureAppointment(
        mockServices[0].ServiceTransactionId,
        mockServices
      );
      expect(scope.hideFilters).toHaveBeenCalled();
    });
  });

  describe('ctrl.updateCheckedRows method ->', function () {
    beforeEach(function () {
      // set all treatment plan services selected in first plan
      scope.treatmentPlans = angular.copy(treatmentPlansMock);
      _.forEach(scope.treatmentPlans[0].TreatmentPlanServices, function (tps) {
        tps.ServiceTransaction.$$Selected = true;
      });
    });
    it('should create checkedRows list ', function () {
      ctrl.updateCheckedRows();
      expect(scope.checkedRows.length).toEqual(
        scope.treatmentPlans[0].TreatmentPlanServices.length
      );
    });
  });

  describe('scope.quickAdd method ->', function () {
    var tps;
    beforeEach(function () {
      // set all treatment plan services selected in first plan
      tps = { ServiceTransaction: { $$Selected: false } };
      spyOn(scope, 'onSelectedCodes');
    });
    it('should set the treatmentPlanService.ServiceTransaction.$$Selected to true', function () {
      scope.quickAdd(tps);
      expect(tps.ServiceTransaction.$$Selected).toEqual(true);
    });

    it('should call onSelectedCodes', function () {
      scope.quickAdd(tps);
      expect(scope.onSelectedCodes).toHaveBeenCalled();
    });
  });

  describe('scope.selectServicesOnPlan method ->', function () {
    var treatmentPlan;
    beforeEach(function () {
      // set all treatment plan services selected in first plan
      scope.treatmentPlans = angular.copy(treatmentPlansMock);
      treatmentPlan = angular.copy(scope.treatmentPlans[0]);
      treatmentPlan.$$Selected = true;
      _.forEach(treatmentPlan.TreatmentPlanServices, function (tps) {
        tps.ServiceTransaction.serviceIsActive = true;
      });
      scope.allowInactive = false;
    });

    it('should select all serviceTransactions on plan that do not have $$DisableService equals true', function () {
      treatmentPlan.TreatmentPlanServices[0].$$disableAddService = true;
      treatmentPlan.TreatmentPlanServices[1].$$disableAddService = false;
      treatmentPlan.TreatmentPlanServices[2].$$disableAddService = false;
      treatmentPlan.TreatmentPlanServices[3].$$disableAddService = true;
      treatmentPlan.TreatmentPlanServices[4].$$disableAddService = false;

      _.forEach(treatmentPlan.TreatmentPlanServices, function (tps) {
        tps.ServiceTransaction.serviceIsActive = true;
        tps.ServiceTransaction.$$Selected = false;
      });

      scope.selectServicesOnPlan(treatmentPlan, false);

      _.forEach(treatmentPlan.TreatmentPlanServices, function (tps) {
        if (tps.$$disableAddService === true) {
          expect(tps.ServiceTransaction.$$Selected).toEqual(false);
        }
        if (tps.$$disableAddService === false) {
          expect(tps.ServiceTransaction.$$Selected).toEqual(true);
        }
      });
    });
  });

  describe('scope.selectServicesOnPlan method ->', function () {
    var treatmentPlan;
    var stage = [];
    beforeEach(function () {
      // set all treatment plan services selected in first plan
      scope.treatmentPlans = angular.copy(treatmentPlansMock);
      treatmentPlan = angular.copy(scope.treatmentPlans[0]);
      // load stage param
      _.forEach(treatmentPlan.TreatmentPlanServices, function (tps) {
        tps.ServiceTransaction.serviceIsActive = true;
        stage.push(tps);
      });
      scope.group = [true];
      scope.allowInactive = false;
      stage[0].$$disableAddService = true;
      stage[1].$$disableAddService = false;
      stage[2].$$disableAddService = false;
      stage[3].$$disableAddService = true;
      stage[4].$$disableAddService = false;

      _.forEach(stage, function (st) {
        st.ServiceTransaction.serviceIsActive = true;
        st.ServiceTransaction.$$Selected = false;
      });
      spyOn(ctrl, 'updateCheckedRows');
      spyOn(ctrl, 'setQuickAddDisabled');
      spyOn(scope, 'onSelectedCodes');
    });

    it('should select all serviceTransactions on stage that do not have $$DisableService equals true if quick add', function () {
      scope.group = [];
      scope.selectServicesOnStage(0, stage, true);
      _.forEach(stage, function (tps) {
        if (tps.$$disableAddService === true) {
          expect(tps.ServiceTransaction.$$Selected).toEqual(false);
        }
        if (tps.$$disableAddService === false) {
          expect(tps.ServiceTransaction.$$Selected).toEqual(true);
        }
      });
    });

    it('should select all serviceTransactions on stage that do not have $$DisableService equals true if not quick add', function () {
      scope.selectServicesOnStage(0, stage, false);
      _.forEach(stage, function (tps) {
        if (tps.$$disableAddService === true) {
          expect(tps.ServiceTransaction.$$Selected).toEqual(false);
        }
        if (tps.$$disableAddService === false) {
          expect(tps.ServiceTransaction.$$Selected).toEqual(true);
        }
      });
    });

    it('should call ctrl.updateCheckedRows', function () {
      scope.selectServicesOnStage(0, stage, false);
      expect(ctrl.updateCheckedRows).toHaveBeenCalled();
    });

    it('should call ctrl.setQuickAddDisabled', function () {
      scope.selectServicesOnStage(0, stage, false);
      expect(ctrl.setQuickAddDisabled).toHaveBeenCalled();
    });

    it('should call scope.onSelectedCodes if quick add', function () {
      scope.selectServicesOnStage(0, stage, true);
      expect(scope.onSelectedCodes).toHaveBeenCalled();
    });
  });

  describe('ctrl.processServicesForAppointment method ->', function () {
    beforeEach(function () {
      ctrl.treatmentPlanServices = [
        {
          ServiceTransaction: {
            LocationId: 123,
            ServiceTransactionId: 3,
            AppointmentId: null,
          },
        },
      ];
      scope.chosenLocation = { LocationId: 123 };
      scope.serviceFilter = 'appointment';
      // service already on appointment or encounter
      scope.servicesAdded = [
        { ServiceTransactionId: '1234', InsuranceOrder: 0 },
        { ServiceTransactionId: '1235', InsuranceOrder: 2 },
      ];
    });
    it(
      'should set $$disableAddService equals false if serviceFilter is appointment and chosenLocation equals serviceTransaction.LocationId' +
        'and AppointmentId is null and serviceTransaction.ServiceTransactionId is not in serviceFilter list',
      function () {
        ctrl.processServicesForAppointment();
        expect(ctrl.treatmentPlanServices[0].$$disableAddService).toEqual(
          false
        );
      }
    );
    it('should set $$disableAddService equals false if serviceFilter is appointment and chosenLocation not equal serviceTransaction.LocationId', function () {
      ctrl.treatmentPlanServices[0].ServiceTransaction.LocationId = 456;
      ctrl.processServicesForAppointment();
      expect(ctrl.treatmentPlanServices[0].$$disableAddService).toEqual(false);
    });
    it('should set $$disableAddService equals false if serviceFilter is appointment and serviceTransaction.ServiceTransactionId is not in serviceFilter list', function () {
      ctrl.treatmentPlanServices[0].ServiceTransaction.ServiceTransactionId = 1239;
      ctrl.treatmentPlanServices[0].ServiceTransaction.AppointmentId = 1;
      ctrl.processServicesForAppointment();
      expect(ctrl.treatmentPlanServices[0].$$disableAddService).toEqual(true);
    });
    it('should set $$disableAddService equals true if serviceFilter is appointment and serviceTransaction.AppointmentId is not null', function () {
      ctrl.treatmentPlanServices[0].ServiceTransaction.AppointmentId = 145;
      ctrl.processServicesForAppointment();
      expect(ctrl.treatmentPlanServices[0].$$disableAddService).toEqual(true);
    });

    it('should set $$disableAddService equals true if serviceFilter is appointment and serviceTransaction.ServiceTransactionStatusId is 3', function () {
      ctrl.treatmentPlanServices[0].ServiceTransaction.ServiceTransactionStatusId = 3;
      ctrl.processServicesForAppointment();
      expect(ctrl.treatmentPlanServices[0].$$disableAddService).toEqual(true);
    });
    it('should set $$disableAddService equals true if serviceFilter is appointment and serviceTransaction.ServiceTransactionStatusId is 2', function () {
      ctrl.treatmentPlanServices[0].ServiceTransaction.ServiceTransactionStatusId = 2;
      ctrl.processServicesForAppointment();
      expect(ctrl.treatmentPlanServices[0].$$disableAddService).toEqual(true);
    });
    it('should set $$disableAddService equals true if serviceFilter is appointment and serviceTransaction.ServiceTransactionStatusId is 8', function () {
      ctrl.treatmentPlanServices[0].ServiceTransaction.ServiceTransactionStatusId = 8;
      ctrl.processServicesForAppointment();
      expect(ctrl.treatmentPlanServices[0].$$disableAddService).toEqual(true);
    });
    it('should set $$disableAddService equals true if serviceFilter is appointment and serviceTransaction.ServiceTransactionStatusId is 4(completed)', function () {
      ctrl.treatmentPlanServices[0].ServiceTransaction.ServiceTransactionStatusId = 4;
      ctrl.processServicesForAppointment();
      expect(ctrl.treatmentPlanServices[0].$$disableAddService).toEqual(true);
    });
    it('should set $$disableAddService equals true if serviceFilter is appointment and serviceTransaction.ServiceTransactionStatusId is 5(pending)', function () {
      ctrl.treatmentPlanServices[0].ServiceTransaction.ServiceTransactionStatusId = 5;
      ctrl.processServicesForAppointment();
      expect(ctrl.treatmentPlanServices[0].$$disableAddService).toEqual(true);
    });
  });

  describe('ctrl.unselectAllServices method ->', function () {
    beforeEach(function () {
      scope.treatmentPlans = angular.copy(treatmentPlansMock);
      _.forEach(scope.treatmentPlans, function (tp) {
        tp.$$Selected = true;
        _.forEach(tp.TreatmentPlanServices, function (tps) {
          tps.ServiceTransaction.$$Selected = true;
        });
      });

      scope.group = [true];
      scope.checkedRows = [{}, {}];
    });
    it('should set the treatmentPlan.$$Selected to false on all treatment plans', function () {
      ctrl.unselectAllServices();
      _.forEach(scope.treatmnetPlans, function (tp) {
        expect(tp.$$Selected).toEqual(false);
      });
    });
    it('should set the treatmentPlanService.ServiceTransaction.$$Selected to false on all treatment plans services', function () {
      ctrl.unselectAllServices();
      _.forEach(scope.treatmentPlans, function (tp) {
        _.forEach(tp.TreatmentPlanServices, function (tps) {
          expect(tps.ServiceTransaction.$$Selected).toEqual(false);
        });
      });
    });
    it('should set the treatmentPlan.$$Selected to false', function () {
      ctrl.unselectAllServices();
      expect(scope.checkedRows).toEqual([]);
      expect(scope.group).toEqual([]);
    });
  });

  describe('ctrl.setQuickAddDisabled.quickAdd method ->', function () {
    beforeEach(function () {
      scope.checkedRows = [{}, {}];
    });
    it('should set scope.quickAddDisabled to true if checkedRows.length is more 0', function () {
      ctrl.setQuickAddDisabled();
      expect(scope.quickAddDisabled).toEqual(true);
    });

    it('should set scope.quickAddDisabled to false if checkedRows.length equals 0', function () {
      scope.checkedRows = [];
      ctrl.setQuickAddDisabled();
      expect(scope.quickAddDisabled).toEqual(false);
    });
  });

  describe('scope.togglePlan method ->', function () {
    var treatmentPlan = { $$Collapsed: true };

    it('should set treatmentPlan.$$Collapsed to !treatmentPlan.$$Collapsed', function () {
      scope.togglePlan(treatmentPlan);
      expect(treatmentPlan.$$Collapsed).toEqual(false);
      scope.togglePlan(treatmentPlan);
      expect(treatmentPlan.$$Collapsed).toEqual(true);
    });
  });

  describe('ctrl.setQuickAddDisabledOnPlans method ->', function () {
    beforeEach(function () {
      // set all treatment plan services selected in first plan
      scope.treatmentPlans = angular.copy(treatmentPlansMock);
      // set tps.$$disableAddService = false
      _.forEach(scope.treatmentPlans[0].TreatmentPlanServices, function (tps) {
        tps.$$disableAddService = true;
      });
    });

    it('should return true if treatment plan has no services that have $$disableAddService equal true', function () {
      ctrl.setQuickAddDisabledOnPlans(scope.treatmentPlans);
      expect(scope.treatmentPlans[0].$$disableQuickAdd).toBe(true);
    });

    it('should return false if treatment plan has one or more services that have $$disableAddService equal false', function () {
      // set all tps services disabled
      scope.treatmentPlans[0].TreatmentPlanServices[0].$$disableAddService = false;
      ctrl.setQuickAddDisabledOnPlans(scope.treatmentPlans);
      expect(scope.treatmentPlans[0].$$disableQuickAdd).toBe(false);
    });
  });

  describe('ctrl.stageIsDisabled method ->', function () {
    var stage = [];
    beforeEach(function () {
      // set all treatment plan services selected in first plan
      scope.treatmentPlans = angular.copy(treatmentPlansMock);
      var treatmentPlan = angular.copy(scope.treatmentPlans[0]);
      // set tps.$$disableAddService = false
      _.forEach(treatmentPlan.TreatmentPlanServices, function (tps) {
        tps.$$disableAddService = false;
        stage.push(tps);
      });
    });

    it('should return true if treatment plan has one or more services with tps.$$disableAddService equal to false', function () {
      scope.stageIsDisabled(stage);
      _.forEach(stage, function (tps) {
        expect(tps.$$stageIsDisabled).toBe(false);
      });
    });

    it('should return false if treatmentPlan does not have one or more services with tps.$$disableAddService equal to false', function () {
      // set all tps services disabled
      _.forEach(stage, function (tps) {
        tps.$$disableAddService = true;
        stage.push(tps);
      });
      scope.stageIsDisabled(stage);
      _.forEach(stage, function (tps) {
        expect(tps.$$stageIsDisabled).toBe(true);
      });
    });
  });

  describe('ctrl.getSelectedTreatmentPlanServices method ->', function () {
    beforeEach(function () {
      // set all treatment plan services selected in first plan
      scope.treatmentPlans = angular.copy(treatmentPlansMock);
      _.forEach(scope.treatmentPlans[0].TreatmentPlanServices, function (tps) {
        tps.ServiceTransaction.$$Selected = true;
      });
      spyOn(ctrl, 'getLastInsuranceOrderOnServicesAdded').and.callFake(
        function () {
          return 2;
        }
      );
    });
    it('should create list of selectedServices to return to parent ', function () {
      scope.treatmentPlans = angular.copy(treatmentPlansMock);
      //_.forEach(scope.treatmentPlans[0].TreatmentPlanServices, function (tps) {
      //    tps.ServiceTransaction.$$Selected = true;
      //});
      scope.treatmentPlans[0].TreatmentPlanServices[0].ServiceTransaction.$$Selected = true;

      var result = ctrl.getSelectedTreatmentPlanServices();

      //expect(result.length).toEqual(scope.treatmentPlans[0].TreatmentPlanServices.length);
      expect(result).toEqual([
        scope.treatmentPlans[0].TreatmentPlanServices[0],
      ]);
    });

    it('should call ctrl.getLastInsuranceOrderOnServicesAdded to get lastInsuranceOrderNumber ', function () {
      ctrl.getSelectedTreatmentPlanServices();
      expect(ctrl.getLastInsuranceOrderOnServicesAdded).toHaveBeenCalled();
    });

    it('should set InsuranceOrder on selectedServices', function () {
      var selectedServices = ctrl.getSelectedTreatmentPlanServices();
      expect(selectedServices[0].ServiceTransaction.InsuranceOrder).toEqual(3);
      expect(selectedServices[1].ServiceTransaction.InsuranceOrder).toEqual(4);
      expect(selectedServices[2].ServiceTransaction.InsuranceOrder).toEqual(5);
      expect(selectedServices[3].ServiceTransaction.InsuranceOrder).toEqual(6);
    });
  });

  describe('ctrl.getLastInsuranceOrderOnServicesAdded method ->', function () {
    beforeEach(function () {
      // service already on appointment or encounter
      scope.servicesAdded = [
        { ServiceTransactionId: '1234', InsuranceOrder: 0 },
        { ServiceTransactionId: '1235', InsuranceOrder: 2 },
      ];

      // treatment plan services for selection
      var tps = [
        {
          ServiceTransaction: {
            $$Selected: false,
            ServiceTransactionId: '1234',
            InsuranceOrder: 3,
          },
        },
        {
          ServiceTransaction: {
            $$Selected: false,
            ServiceTransactionId: '1235',
            InsuranceOrder: null,
          },
        },
        {
          ServiceTransaction: {
            $$Selected: false,
            ServiceTransactionId: '1236',
            InsuranceOrder: null,
          },
        },
        {
          ServiceTransaction: {
            $$Selected: false,
            ServiceTransactionId: '1237',
            InsuranceOrder: 1,
          },
        },
        {
          ServiceTransaction: {
            $$Selected: false,
            ServiceTransactionId: '1238',
            InsuranceOrder: 1,
          },
        },
      ];
      scope.services = tps;
    });

    it('should get the last InsuranceOrder on services already on the appointment or encounter', function () {
      var returnValue = ctrl.getLastInsuranceOrderOnServicesAdded();
      expect(returnValue).toEqual(2);
    });

    it('should set the last InsuranceOrder on services already on the appointment to 0 if InsuranceOrder was null on all', function () {
      scope.servicesAdded[0].InsuranceOrder = null;
      scope.servicesAdded[1].InsuranceOrder = null;
      var returnValue = ctrl.getLastInsuranceOrderOnServicesAdded();
      expect(returnValue).toEqual(0);
    });
  });

  describe('ctrl.setPriorityOnPlans method ->', function () {
    var treatmentPlans = [];
    beforeEach(function () {
      treatmentPlans = _.cloneDeep(treatmentPlansMock);
      // treatment plan services for selection
      var tps = [
        {
          ServiceTransaction: {
            $$Selected: false,
            ServiceTransactionId: '1234',
            InsuranceOrder: 3,
          },
        },
        {
          ServiceTransaction: {
            $$Selected: false,
            ServiceTransactionId: '1235',
            InsuranceOrder: null,
          },
        },
        {
          ServiceTransaction: {
            $$Selected: false,
            ServiceTransactionId: '1236',
            InsuranceOrder: null,
          },
        },
        {
          ServiceTransaction: {
            $$Selected: false,
            ServiceTransactionId: '1237',
            InsuranceOrder: 1,
          },
        },
        {
          ServiceTransaction: {
            $$Selected: false,
            ServiceTransactionId: '1238',
            InsuranceOrder: 1,
          },
        },
      ];
      scope.services = tps;
      spyOn(ctrl, 'setPriorityOnServices');
    });
    it('should not call setPriorityOnServices for each plan in treatmentPlans that does have at least one service with Priority more than 0', function () {
      _.forEach(treatmentPlans, function (tp) {
        tp.TreatmentPlanServices[0].TreatmentPlanServiceHeader.Priority = 2;
      });
      ctrl.setPriorityOnPlans(treatmentPlans);
      _.forEach(treatmentPlans, function (tp) {
        expect(ctrl.setPriorityOnServices).not.toHaveBeenCalled();
      });
    });

    it('should call setPriorityOnServices for each plan in treatmentPlans that does have at least one service with Priority more than 0', function () {
      _.forEach(treatmentPlans, function (tp) {
        tp.TreatmentPlanServices[0].TreatmentPlanServiceHeader.Priority = 0;
      });
      ctrl.setPriorityOnPlans(treatmentPlans);
      _.forEach(treatmentPlans, function (tp) {
        expect(ctrl.setPriorityOnServices).toHaveBeenCalled();
      });
    });
  });

  describe('ctrl.setPriorityOnServices  method ->', function () {
    var treatmentPlan = { TreatmentPlanHeader: {} };
    beforeEach(function () {
      // treatment plan services for selection
      var tps = [
        {
          TreatmentPlanServiceHeader: { TreatmentPlanGroupNumber: 1 },
          ServiceTransaction: {
            $$Selected: false,
            ServiceTransactionId: '1234',
            InsuranceOrder: 3,
          },
        },
        {
          TreatmentPlanServiceHeader: { TreatmentPlanGroupNumber: 1 },
          ServiceTransaction: {
            $$Selected: false,
            ServiceTransactionId: '1235',
            InsuranceOrder: null,
          },
        },
        {
          TreatmentPlanServiceHeader: { TreatmentPlanGroupNumber: 1 },
          ServiceTransaction: {
            $$Selected: false,
            ServiceTransactionId: '1236',
            InsuranceOrder: null,
          },
        },
        {
          TreatmentPlanServiceHeader: { TreatmentPlanGroupNumber: 2 },
          ServiceTransaction: {
            $$Selected: false,
            ServiceTransactionId: '1237',
            InsuranceOrder: 1,
          },
        },
        {
          TreatmentPlanServiceHeader: { TreatmentPlanGroupNumber: 2 },
          ServiceTransaction: {
            $$Selected: false,
            ServiceTransactionId: '1238',
            InsuranceOrder: 1,
          },
        },
      ];
      scope.services = tps;

      treatmentPlan.TreatmentPlanServices = tps;
      spyOn(ctrl, 'setPriorityForServicesOnStage');
    });
    it('should call ctrl.setPriorityForServicesOnStage with services for each stage', function () {
      var stageOneServices = [
        {
          TreatmentPlanServiceHeader: { TreatmentPlanGroupNumber: 1 },
          ServiceTransaction: {
            $$Selected: false,
            ServiceTransactionId: '1234',
            InsuranceOrder: 3,
          },
        },
        {
          TreatmentPlanServiceHeader: { TreatmentPlanGroupNumber: 1 },
          ServiceTransaction: {
            $$Selected: false,
            ServiceTransactionId: '1235',
            InsuranceOrder: null,
          },
        },
        {
          TreatmentPlanServiceHeader: { TreatmentPlanGroupNumber: 1 },
          ServiceTransaction: {
            $$Selected: false,
            ServiceTransactionId: '1236',
            InsuranceOrder: null,
          },
        },
      ];

      ctrl.setPriorityOnServices(treatmentPlan);
      expect(ctrl.setPriorityForServicesOnStage).toHaveBeenCalledWith(
        stageOneServices,
        1,
        []
      );
    });
  });

  describe('ctrl.setPriorityForServicesOnStage  method ->', function () {
    var treatmentPlanServicesInStage = [];
    var sortSettings = [];
    var nextPriorityNumber = 1;
    beforeEach(function () {
      // treatment plan services for selection
      treatmentPlanServicesInStage = [
        {
          TreatmentPlanServiceHeader: {
            TreatmentPlanGroupNumber: 1,
            DateModified: '2019-01-01',
            Priority: 0,
          },
          ServiceTransaction: {
            $$Selected: false,
            Tooth: 5,
            ServiceTransactionId: '1234',
            InsuranceOrder: 3,
          },
        },
        {
          TreatmentPlanServiceHeader: {
            TreatmentPlanGroupNumber: 1,
            DateModified: '2019-02-01',
            Priority: 0,
          },
          ServiceTransaction: {
            $$Selected: false,
            Tooth: 1,
            ServiceTransactionId: '1235',
            InsuranceOrder: null,
          },
        },
        {
          TreatmentPlanServiceHeader: {
            TreatmentPlanGroupNumber: 1,
            DateModified: '2019-01-05',
            Priority: 0,
          },
          ServiceTransaction: {
            $$Selected: false,
            Tooth: 12,
            ServiceTransactionId: '1236',
            InsuranceOrder: null,
          },
        },
      ];
      sortSettings = [
        { Stage: 1, SortProperty: 'ServiceTransaction.Tooth' },
        { Stage: 2, SortProperty: '-ServiceTransaction.Tooth' },
      ];
      nextPriorityNumber = 1;
    });
    it('should set Priority based on SortSettings if we have TreatmentPlanHeader.SortSettings for this stage and ServiceTransaction.Priority is 0 ', function () {
      sortSettings[0].SortProperty = 'ServiceTransaction.Tooth';
      ctrl.setPriorityForServicesOnStage(
        treatmentPlanServicesInStage,
        nextPriorityNumber,
        sortSettings
      );

      _.forEach(treatmentPlanServicesInStage, function (treatmentPlanService) {
        if (treatmentPlanService.TreatmentPlanServiceHeader.Priority === 1) {
          expect(treatmentPlanService.ServiceTransaction.Tooth).toEqual(1);
        }
        if (treatmentPlanService.TreatmentPlanServiceHeader.Priority === 2) {
          expect(treatmentPlanService.ServiceTransaction.Tooth).toEqual(5);
        }
        if (treatmentPlanService.TreatmentPlanServiceHeader.Priority === 3) {
          expect(treatmentPlanService.ServiceTransaction.Tooth).toEqual(12);
        }
      });
    });

    it('should set Priority based on SortSettings if we have TreatmentPlanHeader.SortSettings for this stage and ServiceTransaction.Priority is 0 ', function () {
      sortSettings[0].SortProperty = '-ServiceTransaction.Tooth';
      ctrl.setPriorityForServicesOnStage(
        treatmentPlanServicesInStage,
        nextPriorityNumber,
        sortSettings
      );

      _.forEach(treatmentPlanServicesInStage, function (treatmentPlanService) {
        if (treatmentPlanService.TreatmentPlanServiceHeader.Priority === 1) {
          expect(treatmentPlanService.ServiceTransaction.Tooth).toEqual(12);
        }
        if (treatmentPlanService.TreatmentPlanServiceHeader.Priority === 2) {
          expect(treatmentPlanService.ServiceTransaction.Tooth).toEqual(5);
        }
        if (treatmentPlanService.TreatmentPlanServiceHeader.Priority === 3) {
          expect(treatmentPlanService.ServiceTransaction.Tooth).toEqual(1);
        }
      });
    });

    it('should return nextPriorityNumber with one added to passed in number for each service ', function () {
      var returnedValue = ctrl.setPriorityForServicesOnStage(
        treatmentPlanServicesInStage,
        nextPriorityNumber,
        sortSettings
      );
      expect(returnedValue).toBe(4);
    });

    it('should set Priority based on TreatmentPlanServiceHeader.DateModified if we do not have TreatmentPlanHeader.SortSettings ', function () {
      sortSettings = [];
      ctrl.setPriorityForServicesOnStage(
        treatmentPlanServicesInStage,
        nextPriorityNumber,
        sortSettings
      );
      expect(
        treatmentPlanServicesInStage[0].TreatmentPlanServiceHeader.Priority
      ).toBe(1);
      expect(
        treatmentPlanServicesInStage[1].TreatmentPlanServiceHeader.Priority
      ).toBe(3);
      expect(
        treatmentPlanServicesInStage[2].TreatmentPlanServiceHeader.Priority
      ).toBe(2);
    });
  });

  describe('ctrl.checkForDuplicates method ->', function () {
    beforeEach(function () {
      scope.servicesAdded = [
        {
          ServiceTransactionId: '1234',
        },
        {
          ServiceTransactionId: '5678',
        },
      ];
    });

    it('should return true when the id passed is already added', function () {
      var result = ctrl.checkForDuplicates('1234');
      expect(result).toBe(true);
    });
    it('should return false when the id passed is NOT already added', function () {
      var result = ctrl.checkForDuplicates('5643');
      expect(result).toBe(false);
    });
  });

  describe('ctrl.processServicesForEncounter method ->', function () {
    beforeEach(function () {
      ctrl.treatmentPlanServices = [
        {
          ServiceTransaction: {
            ServiceTransactionId: '1233',
            LocationId: 123,
            EncounterId: null,
            ServiceTransactionStatusId: 1,
          },
        },
      ];
      scope.chosenLocation = { LocationId: 123 };
      scope.serviceFilter = 'encounter-refactored';
      // services already on encounter
      scope.servicesAdded = [
        { ServiceTransactionId: '1234', InsuranceOrder: 0 },
        { ServiceTransactionId: '1235', InsuranceOrder: 2 },
      ];
    });
    it(
      'should set treatmentPlanService.$$disableAddService equals false if serviceFilter is encounter-refactored and chosenLocation equals serviceTransaction.LocationId' +
        'and EncounterId is null and serviceTransaction.ServiceTransactionId is not in scope.servicesAdded list ' +
        'and serviceTransaction.ServiceTransactionStatusId is not one of the statuses in list of statuses to disable',
      function () {
        ctrl.processServicesForEncounter();
        expect(ctrl.treatmentPlanServices[0].$$disableAddService).toEqual(
          false
        );
      }
    );

    it(
      'should set treatmentPlanService.$$disableAddService equals true if serviceFilter is encounter-refactored ' +
        'and chosenLocation does not equal serviceTransaction.LocationId',
      function () {
        scope.chosenLocation = { LocationId: 124 };
        ctrl.processServicesForEncounter();
        expect(ctrl.treatmentPlanServices[0].$$disableAddService).toEqual(true);
      }
    );

    it(
      'should set treatmentPlanService.$$disableAddService equals true if serviceFilter is encounter-refactored ' +
        'and treatmentPlanService.ServiceTransaction.EncounterId is not null',
      function () {
        ctrl.treatmentPlanServices[0].ServiceTransaction.EncounterId = '1245';
        ctrl.processServicesForEncounter();
        expect(ctrl.treatmentPlanServices[0].$$disableAddService).toEqual(true);
      }
    );

    it(
      'should set treatmentPlanService.$$disableAddService equals true if serviceFilter is encounter-refactored ' +
        'and treatmentPlanService.ServiceTransaction.ServiceTransactionStatusId is in list of serviceTransaction statuses to disable',
      function () {
        ctrl.treatmentPlanServices[0].ServiceTransaction.ServiceTransactionStatusId = 4;
        ctrl.processServicesForEncounter();
        expect(ctrl.treatmentPlanServices[0].$$disableAddService).toEqual(true);
      }
    );

    it(
      'should set treatmentPlanService.$$disableAddService equals true if serviceFilter is encounter-refactored ' +
        'and treatmentPlanService.ServiceTransaction.ServiceTransactionId is in list of serviceTransactionIds already on encounter',
      function () {
        ctrl.treatmentPlanServices[0].ServiceTransaction.ServiceTransactionId =
          '1234';
        ctrl.processServicesForEncounter();
        expect(ctrl.treatmentPlanServices[0].$$disableAddService).toEqual(true);
      }
    );
  });

  describe('ctrl.getTreatmentPlans method ->', function () {
    var result;
    var treatmentPlans;
    beforeEach(function () {
      treatmentPlans = [
        {
          TreatmentPlanHeader: {
            TreatmentPlanId: '2345',
            PersonId: '1234',
            Status: 'Proposed',
            CreatedDate: '2017-05-23',
            TreatmentPlanServices: [
              {
                TreatmentPlanServiceHeader: {
                  TreatmentPlanServiceId: '3456',
                  Priority: 0,
                  TreatmentPlanId: '2345',
                  ServiceTransactionId: '4567',
                },
                ServiceTransaction: {
                  AccountMemberId: '2172',
                  Amount: 250,
                  EncounterId: null,
                  ServiceTransactionId: '8974',
                  ServiceTransactionStatusId: 4,
                },
              },
            ],
          },
        },
        {
          TreatmentPlanHeader: {
            TreatmentPlanId: '3345',
            PersonId: '3234',
            Status: 'Completed',
            CreatedDate: '2017-05-23',
            TreatmentPlanServices: [
              {
                TreatmentPlanServiceHeader: {
                  TreatmentPlanServiceId: '4456',
                  Priority: 0,
                  TreatmentPlanId: '4345',
                  ServiceTransactionId: '4567',
                },
                ServiceTransaction: {
                  AccountMemberId: '5172',
                  Amount: 250,
                  EncounterId: null,
                  ServiceTransactionId: '5974',
                  ServiceTransactionStatusId: 4,
                },
              },
            ],
          },
        },
      ];

      scope.patient = { PatientId: '1234' };
      result = _.cloneDeep(treatmentPlans);
      spyOn(ctrl, 'setPriorityOnPlans');
      spyOn(ctrl, 'getTreatmentPlanServices');
      treatmentPlansApiFactory.getTreatmentPlansWithSevices = jasmine
        .createSpy('treatmentPlansApiFactory.getTreatmentPlansWithSevices')
        .and.returnValue({ then: cb => cb(result) });
    });

    it('should call treatmentPlansApiFactory.getTreatmentPlansWithSevices with scope.patient.PatientId', function () {
      ctrl.getTreatmentPlans();
      expect(
        treatmentPlansApiFactory.getTreatmentPlansWithSevices
      ).toHaveBeenCalledWith(scope.patient.PatientId);
    });

    it('should filter out plans with Status of Completed  after treatmentPlansApiFactory.getTreatmentPlansWithSevices resolves', function (done) {
      ctrl.getTreatmentPlans();
      treatmentPlansApiFactory
        .getTreatmentPlansWithSevices(scope.patient.PatientId)
        .then(function (res) {
          var filteredTreatmentPlans = _.filter(res, function (treatmentPlan) {
            return treatmentPlan.TreatmentPlanHeader.Status !== 'Completed';
          });
          expect(res.length).toEqual(2);
          expect(scope.treatmentPlans.length).toEqual(1);
          expect(scope.treatmentPlans).toEqual(filteredTreatmentPlans);
          expect(scope.treatmentPlanCount).toEqual(1);
          done();
        });
    });

    it('should call ctrl.setPriorityOnPlans with filtered treatmentPlans after treatmentPlansApiFactory.getTreatmentPlansWithSevices resolves', function (done) {
      ctrl.getTreatmentPlans();
      treatmentPlansApiFactory
        .getTreatmentPlansWithSevices(scope.patient.PatientId)
        .then(function (res) {
          var filteredTreatmentPlans = _.filter(res, function (treatmentPlan) {
            return treatmentPlan.TreatmentPlanHeader.Status !== 'Completed';
          });
          expect(ctrl.setPriorityOnPlans).toHaveBeenCalledWith(
            filteredTreatmentPlans
          );
          done();
        });
    });

    it('should call ctrl.getTreatmentPlanServices with filtered treatmentPlans after treatmentPlansApiFactory.getTreatmentPlansWithSevices resolves', function (done) {
      ctrl.getTreatmentPlans();
      treatmentPlansApiFactory
        .getTreatmentPlansWithSevices(scope.patient.PatientId)
        .then(function (res) {
          var filteredTreatmentPlans = _.filter(res, function (treatmentPlan) {
            return treatmentPlan.TreatmentPlanHeader.Status !== 'Completed';
          });
          expect(ctrl.getTreatmentPlanServices).toHaveBeenCalledWith(
            scope.patient.PatientId,
            filteredTreatmentPlans
          );
          done();
        });
    });
  });
});
