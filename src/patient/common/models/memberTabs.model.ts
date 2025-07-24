import { FormControl, FormGroup } from "@angular/forms";

export interface memberTabs {
  title: string;
  personGroup: FormGroup;
  personId: any;
  isResponsiblePerson: boolean;
  cachePatientSearchList: FormControl;
  isTabComplete: FormControl;
  isTabCanDelete: boolean;
}
