import { Component, OnInit, ViewChild, Inject, OnDestroy } from '@angular/core';
import { CommunicationCustomEvent } from '../../common/models/communication-custom-event.model';
import { PatientCommunicationCenterService } from '../../common/http-providers/patient-communication-center.service';
import { CommunicationEvent, CommunicationTab, FormMode, CommunicationMode, CommunicationHeader, Gender } from '../../common/models/enums';
import { TabStripComponent } from '@progress/kendo-angular-layout';
import { ConfirmationModalService } from 'src/@shared/components/confirmation-modal/confirmation-modal.service';
import { ConfirmationModalOverlayRef } from 'src/@shared/components/confirmation-modal/confirmation-modal.overlayref';
import { Subject, Subscription } from 'rxjs';
import { take, filter, takeUntil } from 'rxjs/operators';
import { CommunicationConstants } from '../communication-constants/communication.costants';
import { DialogRef } from '@progress/kendo-angular-dialog';
import { TranslateService } from '@ngx-translate/core';
import { OrderByPipe } from 'src/@shared/pipes';
@Component({
    selector: 'communication-drawer-tabs',
    templateUrl: './communication-drawer-tabs.component.html',
    styleUrls: ['./communication-drawer-tabs.component.scss']
})
export class CommunicationDrawerTabsComponent implements OnInit, OnDestroy {
    isDrawerOpened: boolean;
    selectedTab: CommunicationTab;
    CommunicationTab = CommunicationTab;
    confirmationRef: ConfirmationModalOverlayRef;
    confirmationModalSubscription: Subscription;
    dialog: DialogRef;
    CommunicationMode = CommunicationMode;
    showPatientCommunicationDrawer = false;
    drawerTitle: string;
    patientInitial: string;
    drawerType: any;
    patientProfile: any;
    description: any;
    Gender = Gender;
    flags: any[];
    medicalAlerts: any[];
    symbolList: any
    defaultFlagOrderKey = 'Description';
    defaultMedicalAlertsOrderKey = 'MedicalHistoryAlertDescription';
    sortDirectionAsce: any = 1;
    private unsubscribe$: Subject<any> = new Subject<any>();
    @ViewChild('communicationCenterTab', { static: false }) public communicationCenterTab: TabStripComponent;
    constructor(
        private patientCommunicationCenterService: PatientCommunicationCenterService,
        private confirmationModalService: ConfirmationModalService,
        public communicationConstants: CommunicationConstants,
        private translate: TranslateService,
        @Inject('StaticData') private staticData) {
    }

    ngOnInit() {
        this.isDrawerOpened = false;
        this.selectedTab = CommunicationTab.Communication;
        this.patientCommunicationCenterService.getCommunicationEvent().pipe(takeUntil(this.unsubscribe$)).subscribe(
            (event: CommunicationCustomEvent) => {
                if (event) {
                    switch (event.eventtype) {
                        case CommunicationEvent.DrawerVisibility:
                            const cachedTab = this.patientCommunicationCenterService.cachedCommunicationTab;
                            if (cachedTab) {
                                this.patientCommunicationCenterService.activeTab = cachedTab.activeTab;
                            }
                            this.selectedTab = this.patientCommunicationCenterService.activeTab;
                            this.setDrawerState(event.data);
                            break;
                    }
                }
            });
    }
    setDrawerState = (drawerState: any) => {
        this.showPatientCommunicationDrawer = false;
        this.drawerType = drawerState.drawerType;
        this.isDrawerOpened = drawerState.data;
        if (!drawerState.data && drawerState.drawerType !== CommunicationHeader.PatientCommunicationDrawer) {
            this.patientCommunicationCenterService.activeTab = this.selectedTab = CommunicationTab.Communication;
        } else if (drawerState.data && drawerState.drawerType !== CommunicationHeader.PatientCommunicationDrawer) {
            this.drawerTitle = this.translate.instant('Message Center');
            setTimeout(() => {
                this.communicationCenterTab.selectTab(this.selectedTab);
            }, 100);
        } else {
            this.showPatientCommunicationDrawer = true;
            this.getDisplayName();
        }
    }
    closeDrawer = () => {
        this.patientCommunicationCenterService.setCommunicationEvent(
            {
                eventtype: CommunicationEvent.CommunicationIconsVisibility, data: {
                    drawerType: this.drawerType,
                    state: false
                }
            });
        if (this.drawerType === CommunicationHeader.CommunicationDrawer) {
            if (this.patientCommunicationCenterService.formValuesChanged) {
                this.openConfirmationModal(this.communicationConstants.confirmationModalData, null);
            } else {
                this.handleTabClose();
            }
        } else {
            const cachedTab = this.patientCommunicationCenterService.cachedCommunicationTab;
            if (cachedTab) {
                if (cachedTab.cachedFormData) {
                    this.openConfirmationModal(this.communicationConstants.confirmationModalData, null);
                }
            } else {
                this.handleTabClose();
            }
        }

    }
    onTabSelect(e: any) {
        if (this.patientCommunicationCenterService.formValuesChanged) {
            e.prevented = true;
            this.openConfirmationModal(this.communicationConstants.confirmationModalData, e);
        } else {
            this.selectedTab = e.index;
            this.patientCommunicationCenterService.activeTab = this.selectedTab;
        }
    }
    openConfirmationModal = (data: any, e: any) => {
        if (!this.patientCommunicationCenterService.isModalOpen) {
            this.confirmationRef = this.confirmationModalService.open({
                data
            });
            this.confirmationModalSubscription = this.confirmationRef.events.pipe(
                filter((event) => !!event),
                filter((event) => {
                    return event.type === 'confirm' || event.type === 'close';
                }),
                take(1)
            ).subscribe((events) => {
                switch (events.type) {
                    case 'confirm':
                        if (e) {
                            e.prevented = false;
                            this.selectedTab = e.index;
                        } else {
                            this.confirmationRef.close();
                            this.handleTabClose();
                        }
                        this.handleConfirmEventOnTabSwitch();
                        break;
                    case 'close':
                        this.patientCommunicationCenterService.isModalOpen = false;
                        if (this.patientCommunicationCenterService.drawerMode === FormMode.AddMode) {
                            this.patientCommunicationCenterService.setCommunicationEvent({
                                eventtype: CommunicationEvent.EditCommunication,
                                data: { Communication: this.patientCommunicationCenterService.oldCommunication, Mode: FormMode.AddMode }
                            });
                        }
                        this.confirmationRef.close();
                        break;
                }
            });
        }
    }
    handleConfirmEventOnTabSwitch = () => {
        this.patientCommunicationCenterService.formValuesChanged = false;
        this.patientCommunicationCenterService.isModalOpen = false;
        this.confirmationRef.close();
        this.patientCommunicationCenterService.activeTab = this.selectedTab;
        this.communicationCenterTab.selectTab(this.selectedTab);
        if ((this.patientCommunicationCenterService.oldCommunication
            && this.patientCommunicationCenterService.oldCommunication.CommunicationMode === CommunicationMode.LetterCommunication)
            && this.patientCommunicationCenterService.activeTab === CommunicationTab.GenerateLetter) {
            this.patientCommunicationCenterService
                .setCommunicationEvent({
                    eventtype: CommunicationEvent.EditCommunication,
                    data: { Communication: this.patientCommunicationCenterService.oldCommunication, Mode: FormMode.EditMode }
                });
        } else if ((this.patientCommunicationCenterService.oldCommunication &&
            this.patientCommunicationCenterService.oldCommunication.CommunicationMode === CommunicationMode.GeneralCommunication) &&
            this.patientCommunicationCenterService.activeTab === CommunicationTab.Communication) {
            this.patientCommunicationCenterService.setCommunicationEvent({
                eventtype: CommunicationEvent.EditCommunication,
                data: { Communication: this.patientCommunicationCenterService.oldCommunication, Mode: FormMode.EditMode }
            });
        } else {
            this.patientCommunicationCenterService.setCommunicationEvent({ eventtype: CommunicationEvent.EditCommunication, data: null });
        }
    }
    handleTabClose = () => {
        this.isDrawerOpened = false;
        this.patientCommunicationCenterService.cachedCommunicationTab = null;
        this.patientCommunicationCenterService.resetPatientCommunicationService();
        this.patientCommunicationCenterService.setCommunicationEvent(
            {
                eventtype: CommunicationEvent.DrawerVisibility,
                data: { drawerType: CommunicationHeader.CommunicationDrawer, data: this.isDrawerOpened }
            });
        return;
    }
    getDisplayName = () => {
        if (this.patientCommunicationCenterService.patientDetail) {
            const patient = this.patientCommunicationCenterService.patientDetail.Profile;
            if (patient) {
                let name = patient.LastName;
                if (patient.Suffix) {
                    name += ' ' + patient.Suffix;
                }
                name += ', ' + patient.FirstName;
                if (patient.MiddleName) {
                    name += ' ' + patient.MiddleName[0];
                }
                if (patient.PreferredName) {
                    name += ' (' + patient.PreferredName + ')';
                }
                this.drawerTitle = name;
                this.patientInitial = `${patient.FirstName[0].toUpperCase()}${patient.LastName[0].toUpperCase()}`;
            }
        }
        return true;
    }
    applyOrderByPipe = (data: any, sortOrder: any, orderKey: any) => {
        const orderPipe = new OrderByPipe();
        return orderPipe.transform(data, { sortColumnName: orderKey, sortDirection: sortOrder });
    }
    ngOnDestroy() {
        
        this.unsubscribe$.next();
        this.unsubscribe$.complete();
    }
}
