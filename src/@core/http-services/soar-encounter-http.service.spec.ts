import { HttpClientTestingModule } from '@angular/common/http/testing';
import { TestBed } from '@angular/core/testing';
import { SoarEncounterHttpService } from './soar-encounter-http.service';

describe('SoarEncounterHttpService', () => {
    let service: SoarEncounterHttpService;

    let serviceTransactionEstimateDtos = [{
        AccountMemberId: '123',
        Amount: 123,
        AppointmentId: '123',
        RelatedRecordId: '123',
        DateCompleted: new Date(),
        DateEntered: new Date(),
        Description: 'serviceTransaction.Description',
        Discount: 0,
        EncounterId: null,
        EnteredByUserId: '1125',
        Fee: 140,
        PriorFee: 0,
        LocationId: 1258,
        Note: 'serviceTransaction.Note',
        ProviderUserId: '3358',
        RejectedReason: 'serviceTransaction.RejectedReason',
        ServiceCodeId: '22358',
        ServiceTransactionId: '11258',
        ServiceTransactionStatusId: 11225,
        Surface: 'Surface',
        SurfaceSummaryInfo: 'SurfaceSummaryInfo',
        Roots: '',
        RootSummaryInfo: '',
        Tax: 0,
        Tooth: 'Tooth',
        TransactionTypeId: '123',
        ObjectState: 'None',
        FailedMessage: 'FailedMessage',
        Balance: 20,
        AgingDate: new Date(),
        ProposedAtLocationId: '123',
        InsuranceEstimates: [],
        TotalEstInsurance: 100,
        TotalInsurancePaidAmount: 20,
        TotalAdjEstimate: 20,
        TotalAdjPaidAmount: 20,
        TotalUnpaidBalance: 120,
        CreatedDate: new Date(),
        IsDeleted: false,
        IsBalanceAlreadyUpdated: false,
        IsForClosingClaim: false,
        PredeterminationHasResponse: false,
        IsDiscounted: false,
        ProviderOnClaimsId: '1234',
        IsOnInformedConsent: false,
        InsuranceOrder: 1,
        MasterDiscountTypeId: '1234',
        OldServiceTransactionId: '1234',
        AgingCategoryId: '1234',
        BypassSnapshotQueue: false,
        OnClaimBeingClosed: false,
        ProposedProviderId: '12345',
        DataTag: '12358',
        DateModified: new Date(),
        UserModified: '12347',
        $toothAreaData: '123',
    }];

    let encounterDtos = [{
        AccountMemberId: '123',
        AdjustmentAmount: 10,
        Date: new Date(),
        Description: 'encounter.Description',
        EncounterId: '123',
        ObjectState: 'None',
        ServiceTransactionDtos: serviceTransactionEstimateDtos,
        Status: 2
    }];

    beforeEach((() => {
        TestBed.configureTestingModule({

            imports: [HttpClientTestingModule],
            declarations: [],
            providers: [SoarEncounterHttpService,
                { provide: 'SoarConfig', useValue: {} },
            ]
        });
        service = TestBed.inject(SoarEncounterHttpService);
    }));

    it('should be created', () => {
        expect(service).toBeTruthy();
    });

    describe('create', () => {
        it('should call mapToEncounterDto', function () {
            spyOn(service, 'mapToEncounterDto');

            service.create(encounterDtos[0]);
            expect(service.mapToEncounterDto).toHaveBeenCalled();
        });
    });

    describe('update', () => {
        it('should call mapToEncounterDto', function () {
            spyOn(service, 'mapToEncounterDto');

            service.update(encounterDtos);
            expect(service.mapToEncounterDto).toHaveBeenCalled();
        });
    });

    describe('mapToEncounterDto', () => {
        it('should map IEncounterDto list without dynamic properties', function () {
            spyOn(service, 'mapToServiceTransactionDto');
            let mappedEncounters = service.mapToEncounterDto(encounterDtos);
            expect(mappedEncounters[0].AccountMemberId).toEqual(encounterDtos[0].AccountMemberId);
            expect(mappedEncounters[0].EncounterId).toEqual(encounterDtos[0].EncounterId);
            expect(mappedEncounters[0]['AdjustmentAmount']).toBe(undefined);
            expect(service.mapToServiceTransactionDto).toHaveBeenCalled();
        });
    });

    describe('mapToServiceTransactionDto', () => {
        it('should map IServiceTransactionDto list without dynamic properties', function () {
            let mappedServices = service.mapToServiceTransactionDto(serviceTransactionEstimateDtos);
            expect(mappedServices[0].AccountMemberId).toEqual(serviceTransactionEstimateDtos[0].AccountMemberId);
            expect(mappedServices[0].Amount).toEqual(serviceTransactionEstimateDtos[0].Amount);
            expect(mappedServices[0].Discount).toEqual(serviceTransactionEstimateDtos[0].Discount);
            expect(mappedServices[0]['$toothAreaData']).toBe(undefined);
        });
    });
});