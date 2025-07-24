import { ComponentFixture, TestBed, waitForAsync } from '@angular/core/testing';

import { ToShortDisplayDateUtcPipe } from 'src/@shared/pipes/dates/to-short-display-date-utc.pipe';
import { EraViewComponent } from '../era-view/era-view.component';
import { EraHasPayerDetailsPipe } from '../pipes/era-has-payer-details.pipe';
import { EraPayerCityStatePipe } from '../pipes/era-payer-city-state.pipe';
import { EraPayeeAddressPipe } from '../pipes/era-payee-address.pipe';
import { EraPayeeCityStatePipe } from '../pipes/era-payee-city-state.pipe';
import { EraTotalClaimCountPipe } from '../pipes/era-total-claim-count.pipe';
import { EraTotalChargeAmountPipe } from '../pipes/era-total-charge-amount.pipe';
import { EraPatientNamePipe } from '../pipes/era-patient-name.pipe';
import { EraHasPayeeDetailsPipe } from '../pipes/era-has-payee-details.pipe';
import { EraHasFinancialInformationPipe } from '../pipes/era-has-financial-information.pipe';
import { EraHasClaimPaymentInfoPipe } from '../pipes/era-has-claim-payment-info.pipe';
import { EraTransactionTypePipe } from '../pipes/era-transaction-type.pipe';
import { EraPaymentMethodPipe } from '../pipes/era-payment-method.pipe';
import { EraClaimStatusPipe } from '../pipes/era-claim-status.pipe';
import { EraProviderAdjustmentIndexHasDataPipe } from '../pipes/era-provider-adjustment-index-has-data.pipe';
import { EraServiceAdjustmentIndexHasDataPipe } from '../pipes/era-service-adjustment-index-has-data.pipe';
import { EraClaimDatesPipe } from '../pipes/era-claim-dates.pipe';
import { EraPayerClaimOfficeFaxPipe } from '../pipes/era-payer-claim-office-fax.pipe';
import { EraPayerClaimOfficeTelephonePipe } from '../pipes/era-payer-claim-office-telephone.pipe';
import { EraContactInfosWithTelephonePipe } from '../pipes/era-contact-infos-with-telephone.pipe';
import { EraContactInfoTelephonePipe } from '../pipes/era-contact-info-telephone.pipe';
import { EraHasPayeeIdPipe } from '../pipes/era-has-payee-id.pipe';
import { EraPayeeIdPipe } from '../pipes/era-payee-id.pipe';
import { EraInsuredNamePipe } from '../pipes/era-insured-name.pipe';
import { EraCorrectedInsuredNamePipe } from '../pipes/era-corrected-insured-name.pipe';
import { EraClaimClassOfContractCodePipe } from '../pipes/era-claim-class-of-contract-code.pipe';
import { EraAmountDataPipe } from '../pipes/era-amount-data.pipe';
import { EraHasInpatientAdjudicationInfoPipe } from '../pipes/era-has-inpatient-adjudication-info.pipe';
import { EraHasOutpatientAdjudicationInfoPipe } from '../pipes/era-has-outpatient-adjudication-info.pipe';
import { FullEraDto } from 'src/@core/models/era/full-era/full-era-dto';
import { EraAdjustmentIdentifierReasonCodePipe } from '../pipes/era-adjustment-identifier-reason-code.pipe';
import { EraAdjustmentIdentifierPipe } from '../pipes/era-adjustment-identifier.pipe';
import { configureTestSuite } from 'src/configure-test-suite';
import { PlatformEraHttpService } from 'src/@core/http-services/platform-era-http.service';
import { of } from 'rxjs';
export class EraClaimDatesPipeMock {
    transform() {
        return '';
    }
}
describe('EraViewComponent', () => {
    let component: EraViewComponent;
    let fixture: ComponentFixture<EraViewComponent>;
    let routeParams: any;
    let eraServiceMock: any;
    let localize: any;
    let era: FullEraDto = {
        HeaderNumbers: [
            { ClaimPaymentInfos: [{}, { ClaimCommonId: "2", ServicePaymentInfos: [] }] }
        ]
    };

    configureTestSuite(() => {
        routeParams = {
            EraId: 1,
            ClaimCommonId: 2
        };
        eraServiceMock = {
            requestFullEra: jasmine.createSpy('PlatformEraHttpService.requestFullEra').and
                .returnValue(of(era))
        };
        localize = {};

        TestBed.configureTestingModule({
            declarations: [EraViewComponent, EraHasPayerDetailsPipe, EraPayerCityStatePipe, EraPayeeAddressPipe, EraPayeeCityStatePipe, EraTotalClaimCountPipe, EraTotalChargeAmountPipe, EraPatientNamePipe, EraHasPayeeDetailsPipe, EraHasFinancialInformationPipe, EraHasClaimPaymentInfoPipe, EraTransactionTypePipe, EraPaymentMethodPipe, EraClaimStatusPipe, EraProviderAdjustmentIndexHasDataPipe, EraServiceAdjustmentIndexHasDataPipe, EraClaimDatesPipe, EraPayerClaimOfficeFaxPipe, EraPayerClaimOfficeTelephonePipe, EraContactInfosWithTelephonePipe, EraContactInfoTelephonePipe, EraHasPayeeIdPipe, EraPayeeIdPipe, EraInsuredNamePipe, EraCorrectedInsuredNamePipe, EraClaimClassOfContractCodePipe, EraAmountDataPipe, EraHasInpatientAdjudicationInfoPipe, EraHasOutpatientAdjudicationInfoPipe, ToShortDisplayDateUtcPipe, EraAdjustmentIdentifierReasonCodePipe, EraAdjustmentIdentifierPipe],
            providers: [
                { provide: '$routeParams', useValue: routeParams },
                { provide: 'localize', useValue: localize },
                { provide: ToShortDisplayDateUtcPipe, useClass: ToShortDisplayDateUtcPipe },
                { provide: PlatformEraHttpService, useValue: eraServiceMock }
            ]
        });
    });

    beforeEach(() => {
        sessionStorage.setItem('userPractice', JSON.stringify({ id: 3 }));
        fixture = TestBed.createComponent(EraViewComponent);
        component = fixture.componentInstance;
        fixture.detectChanges();
    });

    it('should create', () => {
        expect(component).toBeTruthy();
        fixture.detectChanges();
        expect(component.era).toBeTruthy();
        expect(component.era.HeaderNumbers[0].ClaimPaymentInfos.length).toBe(1);
    });
});
