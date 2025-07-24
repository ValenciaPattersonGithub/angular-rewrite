import { Component, Inject, Input, OnInit, SecurityContext } from "@angular/core";
import { DomSanitizer } from "@angular/platform-browser";
import { FuseFlag } from "src/@core/feature-flags";
import { FeatureFlagService } from "src/featureflag/featureflag.service";
import { PatientHttpService } from "src/patient/common/http-providers/patient-http.service";
@Component({
  selector: "app-patient-dental-records",
  templateUrl: "./patient-dental-records.component.html",
  styleUrls: ["./patient-dental-records.component.scss"],
})
export class PatientDentalRecordsComponent implements OnInit {
  dentalOffice: any;
  address: any = "";
  displayCityStateZipCode: any = "";
  patientDetail: any;
  primaryEmail: any;
  @Input() patientProfile: any;
  @Input() isTabView: boolean = false;
  editPersonProfileMFE: boolean;
  editAuthAbbreviation = "soar-per-perdem-modify";
  hasEditAccess = false;
  constructor(@Inject("$routeParams") private route, private patientHttpService: PatientHttpService, @Inject("patSecurityService") private patSecurityService, private featureFlagService: FeatureFlagService,
  private sanitizer: DomSanitizer) {}

  ngOnInit(): void {
    this.getDentalOfficeRecord(this.patientProfile ? this.patientProfile.PatientId : this.route.patientId);
    this.authAccess();
    this.checkFeatureFlags();
  }
  getDentalOfficeRecord = (patientId: any) => {
    this.patientHttpService.getPatientDentalRecord(patientId).subscribe(
      (data: any) => this.getPatientDentalRecordByPatientIdSuccess(data),
      (error) => this.getPatientDentalRecordPatientIdFailure()
    );
  };
  getPatientDentalRecordByPatientIdSuccess = (dentalOfficeRecord: any) => {
    if (dentalOfficeRecord) {
      this.dentalOffice = dentalOfficeRecord;
      if (dentalOfficeRecord.Address) {
        this.address = "";
        if (dentalOfficeRecord.Address.AddressLine1) {
          this.address = `${dentalOfficeRecord.Address.AddressLine1} `;
        }
        if (dentalOfficeRecord.Address.AddressLine2) {
          this.address += `${dentalOfficeRecord.Address.AddressLine2} `;
        }
        if (dentalOfficeRecord.Address.City) {
          this.displayCityStateZipCode = `${dentalOfficeRecord.Address.City}`;
        }
        if (dentalOfficeRecord.Address.City && (dentalOfficeRecord.Address.State || dentalOfficeRecord.Address.ZipCode)) {
          this.displayCityStateZipCode += `, `;
        }
        if (dentalOfficeRecord.Address.State) {
          this.displayCityStateZipCode += `${dentalOfficeRecord.Address.State} `;
        }
        if (dentalOfficeRecord.Address.ZipCode) {
          this.displayCityStateZipCode += `${dentalOfficeRecord.Address.ZipCode}`;
        }
      }
    }
  };
  getPatientDentalRecordPatientIdFailure = () => {};
  updatePerson = () => {
    let urlPerson = `#/Patient/${this.patientProfile ? this.patientProfile.PatientId : this.route.patientId}/Person/?sectionId=5`;
    let urlPersonTab = `#/Patient/${this.patientProfile ? this.patientProfile.PatientId : this.route.patientId}/PersonTab/?sectionId=5`;
    if (this.editPersonProfileMFE) {
      urlPerson = urlPerson.replace('#/Patient/', '#/patientv2/');
      urlPersonTab = urlPersonTab.replace('#/Patient/', '#/patientv2/');
    }
    const path = this.isTabView ? urlPersonTab : urlPerson;
    window.location.href = this.sanitizer.sanitize(SecurityContext.URL, path);  
  };
  authAccessByType = (authtype: string) => {
    const result = this.patSecurityService.IsAuthorizedByAbbreviation(authtype);
    return result;
  };
  authAccess = () => {
    this.hasEditAccess = this.authAccessByType(this.editAuthAbbreviation);
  };
  
  checkFeatureFlags() {  
    this.featureFlagService.getOnce$(FuseFlag.EnableEditProfileMFEPage).subscribe((value) => {
        this.editPersonProfileMFE = value;
    });
  };
}
