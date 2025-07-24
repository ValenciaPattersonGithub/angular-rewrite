import { Component, Input, OnInit } from '@angular/core';
import { AuthAccess } from 'src/@shared/models/auth-access.model';
import { PatientOdontogram } from 'src/patient/common/models/patient-overview.model';

@Component({
  selector: 'odontogram-snapshot',
  templateUrl: './odontogram-snapshot.component.html',
  styleUrls: ['./odontogram-snapshot.component.scss']
})
export class OdontogramSnapshotComponent implements OnInit {

  @Input() personId: string;
  @Input() patientDirectoryId: string;

  savingOdontogram = false;
  snapshotIsDirty = false;
  defaultImageSrc = "";
  showRetryMessage = false;

  authAccess = new AuthAccess();
  patientOdontogram: PatientOdontogram;

  constructor() { }

  ngOnInit(): void {
    //ToDo: Remove Console logs while migration
    console.log("odontogram-snapshot");
    console.log(this.personId);
    console.log(this.patientDirectoryId);
  }

}
