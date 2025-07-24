import { Component, EventEmitter, Input, OnInit, Output } from '@angular/core';
import { PatientOverview } from '../common/models/patient-overview.model';
import { ServiceCodeModel } from 'src/business-center/service-code/service-code-model';
import { NewStandardServiceModel } from 'src/@shared/models/new-standard-service.model';
import { Patient } from '../common/models/patient.model';
import { ActiveTemplateUrl } from '../common/models/enums/patient.enum';

@Component({
  selector: 'patient-dashboard',
  templateUrl: './patient-dashboard.component.html',
  styleUrls: ['./patient-dashboard.component.scss']
})
export class PatientDashboardComponent implements OnInit {

  @Input() person: PatientOverview;
  @Input() serviceCodes?: ServiceCodeModel[];
  patient = new NewStandardServiceModel<Patient>();
  activeUrlTab : string;
  @Output() activeUrlPath = new EventEmitter<string>();
  templateUrl = ActiveTemplateUrl

  constructor() { }

  ngOnInit(): void {
    if (this.person) {
      this.patient.Data = this.person?.Profile;
      this.patient.Data["Flag"] = this.person?.Flags;
      this.patient.Data["Groups"] = this.person?.PatientGroups;
      this.patient.Data["BenefitPlans"] = this.person?.BenefitPlans;
      this.patient.Data["Emails"] = this.person?.Emails;
    }
  }

  activeUrl = (url) => {
    if(url){
      this.activeUrlTab = url?.TemplateUrl;
      this.activeUrlPath?.emit(url?.TemplateUrl);
    }else{
      //set default tab
      this.activeUrlTab = this.templateUrl?.Overview;
    }
  }

}
