import { downgradeInjectable } from '@angular/upgrade/static';
import { TransactionHistoryExportService } from './providers';

declare var angular: angular.IAngularStatic;

export function TransactionHistoryDowngrade() {
  angular.module('Soar.Main').factory('TransactionHistoryExportService', downgradeInjectable(TransactionHistoryExportService));
}
