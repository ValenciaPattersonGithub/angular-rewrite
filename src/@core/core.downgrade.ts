import { downgradeInjectable } from '@angular/upgrade/static';
import { FuseReportingHttpService } from './http-services/fuse-reporting-http.service';
import { SoarTransactionHistoryHttpService } from './http-services/soar-transaction-history-http.service';
import { ClaimAttachmentHttpService } from './http-services/claim-attachment-http.service';

declare var angular: angular.IAngularStatic;

export function CoreDowngrade() {
  angular
    .module('Soar.Main')
    .factory('SoarTransactionHistoryHttpService', downgradeInjectable(SoarTransactionHistoryHttpService))
    .factory('ClaimAttachmentHttpService', downgradeInjectable(ClaimAttachmentHttpService))
    .factory('FuseReportingHttpService', downgradeInjectable(FuseReportingHttpService));
}
