import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { SharedModule } from 'src/@shared/shared.module';
import { ClaimsManagementMassUpdateComponent } from './mass-update/claims-management-mass-update.component';
import { ClaimsManagementMassUpdateDialogComponent } from './mass-update/claims-management-mass-update-dialog.component';
import { TranslateModule } from '@ngx-translate/core';
import { AppKendoUIModule } from 'src/app-kendo-ui/app-kendo-ui.module';
import { ClaimAlertHistoryModalComponent } from './claim-alert-history-modal/claim-alert-history-modal.component';
import { ClaimsManagementHttpService } from './claims-management-http.service';

@NgModule({
    declarations: [ClaimsManagementMassUpdateComponent
        , ClaimsManagementMassUpdateDialogComponent, ClaimAlertHistoryModalComponent],
    entryComponents: [ClaimsManagementMassUpdateComponent, ClaimAlertHistoryModalComponent
        , ClaimsManagementMassUpdateDialogComponent],
    providers: [ClaimsManagementHttpService],
    imports: [
    CommonModule,
    SharedModule,
    TranslateModule,
    AppKendoUIModule
  ]
})
export class ClaimsManagementModule { }
