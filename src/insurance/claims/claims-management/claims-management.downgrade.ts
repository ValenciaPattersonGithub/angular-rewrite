import { downgradeComponent, downgradeInjectable } from '@angular/upgrade/static';
import { ClaimsManagementMassUpdateComponent } from './mass-update/claims-management-mass-update.component';
import { ClaimAlertHistoryModalService } from './claim-alert-history-modal.service';
import { ClaimEnumService } from '../../../@core/data-services/claim-enum.service';
declare var angular: angular.IAngularStatic;

export function ClaimsManagementDowngrade() {
    angular
        .module('Soar.Main')
        .factory('ClaimAlertHistoryModalService', downgradeInjectable(ClaimAlertHistoryModalService))
        .directive('claimsManagementMassUpdate', downgradeComponent({ component: ClaimsManagementMassUpdateComponent }))
        .factory('ClaimEnumService', downgradeInjectable(ClaimEnumService));
}