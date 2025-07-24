import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { EraViewComponent } from './era-view/era-view.component';
import { EraHasPayerDetailsPipe } from './pipes/era-has-payer-details.pipe';
import { EraPayerCityStatePipe } from './pipes/era-payer-city-state.pipe';
import { EraPayeeAddressPipe } from './pipes/era-payee-address.pipe';
import { EraPayeeCityStatePipe } from './pipes/era-payee-city-state.pipe';
import { EraTotalClaimCountPipe } from './pipes/era-total-claim-count.pipe';
import { EraTotalChargeAmountPipe } from './pipes/era-total-charge-amount.pipe';
import { EraPatientNamePipe } from './pipes/era-patient-name.pipe';
import { EraHasPayeeDetailsPipe } from './pipes/era-has-payee-details.pipe';
import { EraHasFinancialInformationPipe } from './pipes/era-has-financial-information.pipe';
import { EraHasClaimPaymentInfoPipe } from './pipes/era-has-claim-payment-info.pipe';
import { EraTransactionTypePipe } from './pipes/era-transaction-type.pipe';
import { EraPaymentMethodPipe } from './pipes/era-payment-method.pipe';
import { EraClaimStatusPipe } from './pipes/era-claim-status.pipe';
import { EraProviderAdjustmentIndexHasDataPipe } from './pipes/era-provider-adjustment-index-has-data.pipe';
import { EraServiceAdjustmentIndexHasDataPipe } from './pipes/era-service-adjustment-index-has-data.pipe';
import { EraClaimDatesPipe } from './pipes/era-claim-dates.pipe';
import { SharedModule } from 'src/@shared/shared.module';
import { TranslateModule } from '@ngx-translate/core';
import { ToShortDisplayDateUtcPipe } from 'src/@shared/pipes/dates/to-short-display-date-utc.pipe';
import { EraPayerClaimOfficeFaxPipe } from './pipes/era-payer-claim-office-fax.pipe';
import { EraPayerClaimOfficeTelephonePipe } from './pipes/era-payer-claim-office-telephone.pipe';
import { EraContactInfosWithTelephonePipe } from './pipes/era-contact-infos-with-telephone.pipe';
import { EraContactInfoTelephonePipe } from './pipes/era-contact-info-telephone.pipe';
import { EraHasPayeeIdPipe } from './pipes/era-has-payee-id.pipe';
import { EraPayeeIdPipe } from './pipes/era-payee-id.pipe';
import { EraInsuredNamePipe } from './pipes/era-insured-name.pipe';
import { EraCorrectedInsuredNamePipe } from './pipes/era-corrected-insured-name.pipe';
import { EraClaimClassOfContractCodePipe } from './pipes/era-claim-class-of-contract-code.pipe';
import { EraAmountDataPipe } from './pipes/era-amount-data.pipe';
import { EraHasInpatientAdjudicationInfoPipe } from './pipes/era-has-inpatient-adjudication-info.pipe';
import { EraHasOutpatientAdjudicationInfoPipe } from './pipes/era-has-outpatient-adjudication-info.pipe';
import { EraAdjustmentIdentifierReasonCodePipe } from './pipes/era-adjustment-identifier-reason-code.pipe';
import { EraAdjustmentIdentifierPipe } from './pipes/era-adjustment-identifier.pipe';
import { EraLandingComponent } from './era-landing/era-landing.component';
import { EraGridComponent } from './era-grid/era-grid.component';
import { EllipsisSelectComponent } from './ellipsis-select/ellipsis-select.component';
import { EraServiceAdjustmentIdentifierReasonPipe } from './pipes/era-service-adjustment-identifier-reason.pipe';
import { EraPayeeTaxIdPipe } from './pipes/era-payee-tax-id.pipe';
import { EraHasPayeeTaxIdPipe } from './pipes/era-has-payee-tax-id.pipe';
import { EraPayerIdPipe } from './pipes/era-payer-id.pipe';
import { EraHasPayerIdPipe } from './pipes/era-has-payer-id.pipe';
import { PaymentTypesService } from 'src/@shared/providers/payment-types.service';

@NgModule({
    declarations: [EraViewComponent, EraHasPayerDetailsPipe, EraPayerCityStatePipe, EraPayeeAddressPipe, EraPayeeCityStatePipe, EraTotalClaimCountPipe, EraTotalChargeAmountPipe, EraPatientNamePipe, EraHasPayeeDetailsPipe, EraHasFinancialInformationPipe, EraHasClaimPaymentInfoPipe, EraTransactionTypePipe, EraPaymentMethodPipe, EraClaimStatusPipe, EraProviderAdjustmentIndexHasDataPipe, EraServiceAdjustmentIndexHasDataPipe, EraClaimDatesPipe, EraPayerClaimOfficeFaxPipe, EraPayerClaimOfficeTelephonePipe, EraContactInfosWithTelephonePipe, EraContactInfoTelephonePipe, EraHasPayeeIdPipe, EraPayeeIdPipe, EraInsuredNamePipe, EraCorrectedInsuredNamePipe, EraClaimClassOfContractCodePipe, EraAmountDataPipe, EraHasInpatientAdjudicationInfoPipe, EraHasOutpatientAdjudicationInfoPipe, EraAdjustmentIdentifierReasonCodePipe, EraAdjustmentIdentifierPipe, EraLandingComponent, EraGridComponent, EllipsisSelectComponent, EraServiceAdjustmentIdentifierReasonPipe, EraPayeeTaxIdPipe, EraHasPayeeTaxIdPipe,  EraPayerIdPipe, EraHasPayerIdPipe],
  entryComponents: [EraViewComponent, EraLandingComponent],
  providers: [ 
    //TODO: Replace with Angular Factory once httpclient is configured with required fuse headers
    { provide: '$q', useFactory: ($injector: any) => $injector.get('$q'), deps: ['$injector'] },
    { provide: 'AmfaInfo', useFactory: ($injector: any) => $injector.get('AmfaInfo'), deps: ['$injector'] },
    { provide: '$location', useFactory: ($injector: any) => $injector.get('$location'), deps: ['$injector'] },    
    { provide: 'CommonServices', useFactory: ($injector: any) => $injector.get('CommonServices'), deps: ['$injector'] },
    { provide: 'LocationServices', useFactory: ($injector: any) => $injector.get('LocationServices'), deps: ['$injector'] },
      ToShortDisplayDateUtcPipe,
      PaymentTypesService

  ],
  imports: [
    CommonModule,
    SharedModule,
    TranslateModule,
  ],
  exports: [
    EraPayeeTaxIdPipe,
    EraHasPayeeTaxIdPipe
  ]
})
export class EraModule { }
