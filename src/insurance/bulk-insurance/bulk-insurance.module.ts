import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ToShortDisplayDateUtcPipe } from 'src/@shared/pipes/dates/to-short-display-date-utc.pipe';
import { SharedModule } from 'src/@shared/shared.module';
import { TranslateModule } from '@ngx-translate/core';
import { ClaimPaymentTableComponent } from './claim-payment-table/claim-payment-table.component';
import {ScrollingModule} from '@angular/cdk/scrolling';
import { CloseInsuranceclaimModalComponent } from './close-insuranceclaim-modal/close-insuranceclaim-modal.component';
import { AppKendoUIModule } from 'src/app-kendo-ui/app-kendo-ui.module';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { CloseClaimOptionsService } from './close-claim-options.service';
import { CloseClaimOptionsComponent } from './close-claim-options/close-claim-options.component';
import { BulkPaymentComponent } from './bulk-payment/bulk-payment.component';
import { SoarEraHttpService } from '../../@core/http-services/soar-era-http.service';
import { SoarBulkPaymentHttpService } from 'src/@core/http-services/soar-bulk-payment-http.service';
import { PaymentTypesService } from 'src/@shared/providers/payment-types.service';





@NgModule({
  declarations: [ ClaimPaymentTableComponent, CloseInsuranceclaimModalComponent, CloseClaimOptionsComponent, BulkPaymentComponent
    ],
  entryComponents: [ClaimPaymentTableComponent, CloseInsuranceclaimModalComponent, CloseClaimOptionsComponent, BulkPaymentComponent],
  providers: [ 
    //TODO: Replace with Angular Factory once httpclient is configured with required fuse headers
    { provide: '$q', useFactory: ($injector: any) => $injector.get('$q'), deps: ['$injector'] },
    { provide: 'AmfaInfo', useFactory: ($injector: any) => $injector.get('AmfaInfo'), deps: ['$injector'] },
    { provide: '$location', useFactory: ($injector: any) => $injector.get('$location'), deps: ['$injector'] },    
    { provide: 'CommonServices', useFactory: ($injector: any) => $injector.get('CommonServices'), deps: ['$injector'] },
    { provide: 'LocationServices', useFactory: ($injector: any) => $injector.get('LocationServices'), deps: ['$injector'] },
    { provide: 'ClaimsService', useFactory: ($injector: any) => $injector.get('ClaimsService'), deps: ['$injector'] },
    { provide: 'UsersFactory', useFactory: ($injector: any) => $injector.get('UsersFactory'), deps: ['$injector'] },
    { provide: 'CloseClaimService', useFactory: ($injector: any) => $injector.get('CloseClaimService'), deps: ['$injector'] },
    { provide: 'ModalFactory', useFactory: ($injector: any) => $injector.get('ModalFactory'), deps: ['$injector'] },
    { provide: 'TimeZoneFactory', useFactory: ($injector: any) => $injector.get('TimeZoneFactory'), deps: ['$injector'] },
    { provide: 'BusinessCenterServices', useFactory: ($injector: any) => $injector.get('BusinessCenterServices'), deps: ['$injector'] },
    { provide: 'tabLauncher', useFactory: ($injector: any) => $injector.get('tabLauncher'), deps: ['$injector'] },
    { provide: 'PatientInsurancePaymentFactory', useFactory: ($injector: any) => $injector.get('PatientInsurancePaymentFactory'), deps: ['$injector'] },    
      SoarEraHttpService,
      ToShortDisplayDateUtcPipe,
      CloseClaimOptionsService,
      SoarBulkPaymentHttpService,
      PaymentTypesService
  ],
  imports: [
    CommonModule,
    SharedModule,
    TranslateModule,
    ScrollingModule,
    AppKendoUIModule,
    FormsModule,
    ReactiveFormsModule,
  ]
})
export class BulkInsuranceModule { }
