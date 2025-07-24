import { Component, Inject, Input, OnInit, SecurityContext } from "@angular/core";
import { DomSanitizer } from "@angular/platform-browser";
import { FuseFlag } from "src/@core/feature-flags";
import { FeatureFlagService } from "src/featureflag/featureflag.service";
import { PatientHttpService } from "src/patient/common/http-providers/patient-http.service";

@Component({
  selector: "app-patient-additional-identifiers",
  templateUrl: "./patient-additional-identifiers.component.html",
  styleUrls: ["./patient-additional-identifiers.component.scss"],
})
export class PatientAdditionalIdentifiersComponent implements OnInit {
  patientAdditionalIdentifiers: any[] = [];
  editAuthAbbreviation = "soar-per-perdem-modify";
  hasEditAccess = false;
  @Input() patientProfile: any;
  @Input() isTabView: boolean = false;
  editPersonProfileMFE: boolean;
  constructor(@Inject("$routeParams") private route, private patientHttpService: PatientHttpService, @Inject("patSecurityService") private patSecurityService, private featureFlagService: FeatureFlagService, private sanitizer: DomSanitizer) {}

  ngOnInit(): void {
    this.patientAdditionalIdentifiers = [];
    this.getAdditionalIdentifiers(this.patientProfile ? this.patientProfile.PatientId : this.route.patientId);
    this.authAccess();
    this.checkFeatureFlags();
  }
  getAdditionalIdentifiers = (patientId: any) => {
    this.patientHttpService.getPatientAdditionalIdentifiers(patientId).subscribe(
      (data: any) => this.getPatientAdditionalIdentifiersByPatientIdSuccess(data),
      (error) => this.getPatientAdditionalIdentifiersByPatientIdFailure()
    );
  };
  getPatientAdditionalIdentifiersByPatientIdSuccess = (additionalIdentifiers: any) => {
    if (additionalIdentifiers && additionalIdentifiers.length) {
      this.patientAdditionalIdentifiers = additionalIdentifiers;
    }
  };
  getPatientAdditionalIdentifiersByPatientIdFailure = () => {};
  updatePerson = () => {
    let urlPerson = `#/Patient/${this.patientProfile ? this.patientProfile.PatientId : this.route.patientId}/Person/?sectionId=7`;
    let urlPersonTab = `#/Patient/${this.patientProfile ? this.patientProfile.PatientId : this.route.patientId}/PersonTab/?sectionId=7`;
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
