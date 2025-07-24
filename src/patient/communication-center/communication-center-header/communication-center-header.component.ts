import { Component, OnInit, Inject } from '@angular/core';
import { PatientCommunicationCenterService } from '../../common/http-providers/patient-communication-center.service';
import { CommunicationEvent, CommunicationHeader } from '../../common/models/enums';
import { CommunicationCustomEvent } from 'src/patient/common/models/communication-custom-event.model';
import { takeUntil } from 'rxjs/operators';
import { Subject } from 'rxjs';

@Component({
    selector: 'communication-center-header',
    templateUrl: './communication-center-header.component.html',
    styleUrls: ['./communication-center-header.component.scss']
})
export class CommunicationCenterHeaderComponent implements OnInit {

    drawerChange: any = false;
    drawerType: any;
    private unsubscribe$: Subject<any> = new Subject<any>();

    constructor(private patientCommunicationCenterService: PatientCommunicationCenterService,
        @Inject('$routeParams') private route) {
    }

    ngOnInit() {
        this.patientCommunicationCenterService.getCommunicationEvent().pipe(takeUntil(this.unsubscribe$)).subscribe(
            (event: CommunicationCustomEvent) => {
                if (event) {
                    switch (event.eventtype) {
                        case CommunicationEvent.CommunicationIconsVisibility:
                            this.setCommunicationIconsState(event.data);
                            break;
                    }
                }
            });
        if (this.route.tabIdentifier == 5 || this.route.tabIdentifier == 6 || this.route.tabIdentifier == 7 || this.route.tabIdentifier == 1) {
            this.patientCommunicationCenterService.setCommunicationEvent(
                { eventtype: CommunicationEvent.CommunicationIconsVisibility, data: { drawerType: 1, state: true } });
        }

    }
    openDrawer = (type: any) => {
        this.patientCommunicationCenterService.setCommunicationEvent(
            { eventtype: CommunicationEvent.CommunicationIconsVisibility, data: { drawerType: type, state: true } });
        this.patientCommunicationCenterService.setCommunicationEvent(
            { eventtype: CommunicationEvent.DrawerVisibility, data: { drawerType: type, data: true } });
    }
    setCommunicationIconsState = (data: any) => {
        if (data.drawerType === CommunicationHeader.CommunicationDrawer) {
            this.drawerChange = data.state;
            this.drawerType = data.drawerType;
        } else {
            this.drawerChange = data.state;
            this.drawerType = data.drawerType;
        }
    }
}
