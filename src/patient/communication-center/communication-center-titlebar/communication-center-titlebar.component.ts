import { Component, OnInit, Inject } from '@angular/core';
import { PatientCommunicationCenterService } from 'src/patient/common/http-providers/patient-communication-center.service';
import { CommunicationEvent, CommunicationTab, FormMode, CommunicationHeader } from 'src/patient/common/models/enums';
import { CommunicationCustomEvent } from 'src/patient/common/models/communication-custom-event.model';
import { takeUntil } from 'rxjs/operators';
import { Subject } from 'rxjs';
@Component({
    selector: 'communication-center-titlebar',
    templateUrl: './communication-center-titlebar.component.html',
    styleUrls: ['./communication-center-titlebar.component.scss']
})
export class CommunicationCenterTitlebarComponent implements OnInit {

    createAuthAbbreviation = 'soar-per-pcomm-add';
    hasCreateAccess: any;
    showAddRecord = true;
    checkValue: any;
    CommunicationTab = CommunicationTab;
    private unsubscribe$: Subject<any> = new Subject<any>();
    showCount: boolean;
    inCompleteToDoCount: number;
    toDoCommunications: any[];

    constructor(
        @Inject('patSecurityService') private patSecurityService,
        private patientCommunicationCenterService: PatientCommunicationCenterService,
        @Inject('$routeParams') private route) { }

    ngOnInit() {
        this.authAccess();
        this.showAddRecord = !this.patientCommunicationCenterService.isDrawerOpened;
        this.patientCommunicationCenterService.getCommunicationEvent().pipe(takeUntil(this.unsubscribe$)).subscribe(
            (event: CommunicationCustomEvent) => {
                if (event) {
                    switch (event.eventtype) {
                        case CommunicationEvent.DrawerVisibility:
                            this.handleDrawerVisibilityEvent(event.data);
                            this.getIncompleteToDoCount();
                            break;
                        case CommunicationEvent.LaunchFromHeader:
                            if (this.showAddRecord) {
                                this.openDrawer(CommunicationTab.Communication);
                                this.patientCommunicationCenterService.setCommunicationEvent(
                                    { eventtype: CommunicationEvent.SetDefaultValues, data: event.data }
                                );
                                this.getIncompleteToDoCount();
                            }
                            break;
                        case CommunicationEvent.UpdateToDoCommunication:
                            this.getIncompleteToDoCount();
                            break;
                    }
                }
            });

    }
    handleDrawerVisibilityEvent = (event: any) => {
        this.showAddRecord = !event.data;
    }
    openDrawer = (communicationTab: CommunicationTab) => {
        if (this.hasCreateAccess) {
            if (this.patientCommunicationCenterService.drawerMode === FormMode.default) {
                this.patientCommunicationCenterService.cachedCommunicationTab = null;
                this.patientCommunicationCenterService.activeTab = communicationTab;
                this.patientCommunicationCenterService.setCommunicationEvent(
                    { eventtype: CommunicationEvent.DrawerVisibility, data: { drawerType: CommunicationHeader.CommunicationDrawer, data: true } });
                this.patientCommunicationCenterService.setCommunicationEvent(
                    { eventtype: CommunicationEvent.CommunicationIconsVisibility, data: { drawerType: CommunicationHeader.CommunicationDrawer, state: true } });
            }
        }
    }
    authAccess = () => {
        this.hasCreateAccess = this.authAccessByType(this.createAuthAbbreviation);
    }
    authAccessByType = (authtype: string) => {
        const result = this.patSecurityService.IsAuthorizedByAbbreviation(authtype);
        return result;
    }
    exportCommunications = (exporttype: string) => {
        if (exporttype === 'export') {
            this.patientCommunicationCenterService.setCommunicationEvent({ eventtype: CommunicationEvent.CSVExport, data: null });
        } else if (exporttype === 'print') {
            this.patientCommunicationCenterService.setCommunicationEvent({ eventtype: CommunicationEvent.Print, data: null });
        }
    }
    getIncompleteToDoCount = () => {
        if (this.inCompleteToDoCount == null) {
            this.patientCommunicationCenterService.getPatientCommunicationToDoByPatientId(this.route.patientId)
                .subscribe((communications: any) => {
                    if (communications) {
                        this.toDoCommunications = communications.filter(
                            (x: any) => x.IsComplete === false);
                        if (this.toDoCommunications) {
                            this.inCompleteToDoCount = this.toDoCommunications.length;
                        }
                    }
                },
                    (err: any) => { });
        } else {
            this.inCompleteToDoCount = this.patientCommunicationCenterService.inCompleteToDoCounts;
        }
    }
}
