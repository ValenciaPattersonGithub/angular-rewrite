import { NgModule, Pipe, PipeTransform } from '@angular/core';
import { CommonModule } from '@angular/common';
import { EncounterCartComponent } from './encounter-cart/encounter-cart.component';
import { PatientCheckoutComponent } from './patient-checkout/patient-checkout.component';
import { SharedModule } from 'src/@shared/shared.module';
import { TranslateModule } from '@ngx-translate/core';
import { EncounterCartCardComponent } from './encounter-cart-card/encounter-cart-card.component';
import { AppKendoUIModule } from '../../app-kendo-ui/app-kendo-ui.module';
import { EncounterCartBalanceBarComponent } from './encounter-cart-balance-bar/encounter-cart-balance-bar.component';
import {
    EncounterTotalAmountPipe, EncounterTotalTaxPipe, EncounterTotalDiscountPipe,
    EncounterTotalFeePipe, EncounterTotalAdjEstPipe, EncounterTotalEstinsPipe, EncounterTotalPatientPortionPipe, EncounterTotalAllowedAmountPipe
} from 'src/@shared/pipes/encounter/encounter-totals.pipe';
import { PatientCheckoutSummaryComponent } from './patient-checkout-summary/patient-checkout-summary.component';
import { ServiceTotalEstinsPipe, ServiceAdjEstPipe } from '../../@shared/pipes/service/service-totals.pipe';
import { PatientCheckoutService } from './providers/patient-checkout.service';
import { PatientCheckoutPaymentsComponent } from './patient-checkout-payments/patient-checkout-payments.component';
import { TeamMemberLocationService } from 'src/business-center/practice-settings/team-members/team-member-crud/team-member-locations/team-member-location.service';



@NgModule({
    declarations: [EncounterCartComponent, PatientCheckoutComponent, EncounterCartCardComponent,
        EncounterCartBalanceBarComponent, EncounterTotalAmountPipe, EncounterTotalTaxPipe, EncounterTotalDiscountPipe,
        EncounterTotalFeePipe, EncounterTotalAdjEstPipe, EncounterTotalEstinsPipe, EncounterTotalPatientPortionPipe,
        PatientCheckoutSummaryComponent, ServiceTotalEstinsPipe, ServiceAdjEstPipe, PatientCheckoutPaymentsComponent,
        EncounterTotalAllowedAmountPipe],
  imports: [
      CommonModule, SharedModule, TranslateModule, AppKendoUIModule
  ],
  entryComponents: [
      EncounterCartComponent, PatientCheckoutComponent
  ],
  providers: [
      PatientCheckoutService,
      TeamMemberLocationService,
      // tslint:disable-next-line: max-line-length
      { provide: 'PatientOdontogramFactory', useFactory: ($injector: any) => $injector.get('PatientOdontogramFactory'), deps: ['$injector'] },
      { provide: 'ModalDataFactory', useFactory: ($injector: any) => $injector.get('ModalDataFactory'), deps: ['$injector'] },
      { provide: '$location', useFactory: ($injector: any) => $injector.get('$location'), deps: ['$injector'] },
      { provide: 'FinancialService', useFactory: ($injector: any) => $injector.get('FinancialService'), deps: ['$injector'] },      
      { provide: 'ProviderOnClaimsFactory', useFactory: ($injector: any) => $injector.get('ProviderOnClaimsFactory'), deps: ['$injector'] },
      { provide: 'SaveStates', useFactory: ($injector: any) => $injector.get('SaveStates'), deps: ['$injector'] },
      { provide: 'LocationServices', useFactory: ($injector: any) => $injector.get('LocationServices'), deps: ['$injector'] },
      { provide: '$uibModal', useFactory: ($injector: any) => $injector.get('$uibModal'), deps: ['$injector'] },
      { provide: 'tabLauncher', useFactory: ($injector: any) => $injector.get('tabLauncher'), deps: ['$injector'] },
      { provide: 'DiscardChangesService', useFactory: ($injector: any) => $injector.get('DiscardChangesService'), deps: ['$injector'] },
      { provide: 'PaymentGatewayService', useFactory: ($injector: any) => $injector.get('PaymentGatewayService'), deps: ['$injector'] },
      { provide: 'UserServices', useFactory: ($injector: any) => $injector.get('UserServices'), deps: ['$injector'] },
      { provide: '$resource', useFactory: ($injector: any) => $injector.get('$resource'), deps: ['$injector'] }, 
      EncounterTotalPatientPortionPipe   
    ],
})
// TODO alternative to using $location
export class EncounterModule {

}
