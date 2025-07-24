import { downgradeComponent, downgradeInjectable } from '@angular/upgrade/static';
import { CloseClaimOptionsService } from './close-claim-options.service';
import { ClaimPaymentTableComponent } from './claim-payment-table/claim-payment-table.component';
import { CloseInsuranceclaimModalComponent } from './close-insuranceclaim-modal/close-insuranceclaim-modal.component';
import { BulkPaymentComponent } from './bulk-payment/bulk-payment.component';

declare var angular: angular.IAngularStatic;

export function BulkInsuranceDowngrade() {
  angular
    .module('Soar.Main')
    .factory('CloseClaimOptionsService', downgradeInjectable(CloseClaimOptionsService))
    .directive('claimPaymentTable', downgradeComponent({ component: ClaimPaymentTableComponent }))
    .directive('closeInsuranceclaimModal', downgradeComponent({ component: CloseInsuranceclaimModalComponent }))
    .directive('bulkPaymentNg', downgradeComponent({ component: BulkPaymentComponent }));
}
