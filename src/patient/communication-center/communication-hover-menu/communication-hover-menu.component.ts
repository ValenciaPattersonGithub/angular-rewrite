import { Component, Inject, OnInit } from '@angular/core';
import { CommunicationEvent, CommunicationType } from '../../common/models/enums';
import { PatientCommunicationCenterService } from '../../common/http-providers/patient-communication-center.service';

@Component({
  selector: 'communication-hover-menu',
  templateUrl: './communication-hover-menu.component.html',
  styleUrls: ['./communication-hover-menu.component.scss']
})
export class CommunicationHoverMenuComponent implements OnInit {
  communicationHover: boolean;
  CommunicationType = CommunicationType;
  constructor(
    @Inject('$routeParams') private route,
    @Inject('tabLauncher') private tabLauncher,
    private patientCommunicationCenterService: PatientCommunicationCenterService

  ) { }

  ngOnInit() {
    this.communicationHover = false;
  }

  navigateToPatientCommunication(communicationType: CommunicationType) {
    if (this.route.Category !== 'Communication') {
      const patientId = this.route.patientId;
      this.tabLauncher.launchNewTab(`#/Patient/${patientId}/Communication/?withDrawerOpened=true&communicationType=${communicationType}`);
    } else {
      this.patientCommunicationCenterService.setCommunicationEvent(
        { eventtype: CommunicationEvent.LaunchFromHeader, data: communicationType }
      );
    }
  }

}
