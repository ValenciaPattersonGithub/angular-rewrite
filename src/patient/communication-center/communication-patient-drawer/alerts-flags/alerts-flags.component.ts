import { Component, OnInit, Inject } from '@angular/core';
import { PatientCommunicationCenterService } from 'src/patient/common/http-providers/patient-communication-center.service';
import { OrderByPipe } from 'src/@shared/pipes';
import { TranslateService } from '@ngx-translate/core';

@Component({
    selector: 'alerts-flags',
    templateUrl: './alerts-flags.component.html',
    styleUrls: ['./alerts-flags.component.scss']
})
export class AlertsFlagsComponent implements OnInit {
    medicalAlerts: any;
    flags: any;
    symbolList: any
    defaultFlagOrderKey = 'Description';
    defaultMedicalAlertsOrderKey = 'MedicalHistoryAlertDescription';
    sortDirectionAsce: any = 1;

    constructor(@Inject('StaticData') private staticData,
        private patientCommunicationCenterService: PatientCommunicationCenterService,
        @Inject('$routeParams') private route,
        @Inject('toastrFactory') private toastrFactory,
        private translate: TranslateService) { }

    ngOnInit() {
        this.flags = [];
        this.medicalAlerts = [];
        this.symbolList = this.staticData.AlertIcons();
        this.getPatientFlagsAndAlert(this.route.patientId);
    }
    getPatientFlagsAndAlert = (patientId: any) => {
        this.patientCommunicationCenterService
            .getPatientFlagsAndAlertsByPatientId(patientId)
            .subscribe((data: any) => this.getPatientFlagsAndAlertsByPatientIdSuccess(data),
                error => this.getPatientFlagsAndAlertsByPatientIdFailure());
    }
    getPatientFlagsAndAlertsByPatientIdSuccess = (res: any) => {
        if (res) {
            if (res.Flags) {
                this.flags = [... this.applyOrderByPipe(res.Flags, this.sortDirectionAsce, this.defaultFlagOrderKey)];
            }
            if (res.MedicalHistoryAlerts) {
                this.medicalAlerts =
                    [... this.applyOrderByPipe(res.MedicalHistoryAlerts, this.sortDirectionAsce, this.defaultMedicalAlertsOrderKey)];
            }
        }
    }
    getPatientFlagsAndAlertsByPatientIdFailure = () => {
        this.toastrFactory.error(
            this.translate.instant('Failed to retrieve the Alerts and Flags.'),
            this.translate.instant('Server Error'));
    }
    getClass = (id) => {
        return this.symbolList.getClassById(id);
    }
    applyOrderByPipe = (data: any, sortOrder: any, orderKey: any) => {
        const orderPipe = new OrderByPipe();
        return orderPipe.transform(data, { sortColumnName: orderKey, sortDirection: sortOrder });
    }
}
