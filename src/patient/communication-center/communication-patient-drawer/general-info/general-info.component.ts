import { Component, Input, OnInit } from '@angular/core';
import { Gender } from '../../../common/models/enums';

@Component({
  selector: 'general-info',
  templateUrl: './general-info.component.html',
  styleUrls: ['./general-info.component.scss']
})
export class GeneralInfoComponent implements OnInit {
  @Input() patientProfile: any;
  Gender = Gender;
  constructor() { }

  ngOnInit() {
    if (!this.patientProfile) {
      this.initializePatientProfile();
    }
  }
  initializePatientProfile = () => {
    this.patientProfile = {};
  }
}
