import { FormControl, FormGroup } from "@angular/forms";

export interface patientProfileTabs {
  title: string;
  personId: any;
  patientInfo: any;
  isTabComplete: FormControl;
}
