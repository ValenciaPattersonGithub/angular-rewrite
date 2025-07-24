import { Component, Input, OnInit, Inject, OnChanges, SimpleChanges, SecurityContext } from "@angular/core";
import { DomSanitizer } from "@angular/platform-browser";
import { TranslateService } from "@ngx-translate/core";
import { FuseFlag } from "src/@core/feature-flags";
import { FeatureFlagService } from "src/featureflag/featureflag.service";

@Component({
  selector: "app-patient-contact-details",
  templateUrl: "./patient-contact-details.component.html",
  styleUrls: ["./patient-contact-details.component.scss"],
})
export class PatientContactDetailsComponent implements OnInit {
  primaryEmail: any;
  primaryPhone: any;
  responsibleParty: any;
  address: any = "";
  displayCityStateZipCode: any = "";
  primaryPhoneType: any;
  Emails: any[] = [];
  Phones: any[] = [];
  editAuthAbbreviation = "soar-per-perdem-modify";
  hasEditAccess = false;
  @Input() patientProfile: any;
  @Input() isTabView: boolean = false;
  editPersonProfileMFE: boolean;

  constructor(private translate: TranslateService, @Inject("patSecurityService") private patSecurityService, private featureFlagService: FeatureFlagService, private sanitizer: DomSanitizer ) {}

  ngOnInit(): void {
    if (this.patientProfile) {
      if (this.patientProfile.Emails && this.patientProfile.Emails.length) {
        this.Emails = this.patientProfile.Emails.map((email) => ({
          Email: email.AccountEMail == null ? email.Email : email.AccountEMail.Email,
          ReminderOK: email.ReminderOK,
          IsPrimary: email.IsPrimary,
        }));
      }
      if (this.patientProfile.PhoneNumbers && this.patientProfile.PhoneNumbers.length) {
        this.Phones = this.patientProfile.PhoneNumbers.map((phone) => ({
          PhoneNumber: phone.PhoneReferrer ? phone.PhoneReferrer.PhoneNumber : phone.PhoneNumber,
          IsPrimary: phone.IsPrimary,
          Type: phone.PhoneReferrer ? phone.PhoneReferrer.Type : phone.Type,
          ReminderOK: phone.ReminderOK,
          TextOk: phone.TextOk,
        }));
      }
      this.responsibleParty = this.patientProfile.ResponsiblePersonName;
      this.address = "";
      if (this.patientProfile.AddressReferrerId) {
        this.patientProfile.AddressLine1 = this.patientProfile.AddressReferrer.AddressLine1;
        this.patientProfile.AddressLine2 = this.patientProfile.AddressReferrer.AddressLine2;
        this.patientProfile.City = this.patientProfile.AddressReferrer.City;
        this.patientProfile.State = this.patientProfile.AddressReferrer.State;
        this.patientProfile.ZipCode = this.patientProfile.AddressReferrer.ZipCode;
      }
      if (this.patientProfile.AddressLine1) {
        this.address = `${this.patientProfile.AddressLine1} `;
      }
      if (this.patientProfile.AddressLine2) {
        this.address += `${this.patientProfile.AddressLine2} `;
      }
      if (this.patientProfile.City) {
        this.displayCityStateZipCode = `${this.patientProfile.City}`;
      }
      if (this.patientProfile.City && (this.patientProfile.State || this.patientProfile.ZipCode)) {
        this.displayCityStateZipCode += `, `;
      }
      if (this.patientProfile.State) {
        this.displayCityStateZipCode += `${this.patientProfile.State} `;
      }
      if (this.patientProfile.ZipCode) {
        this.displayCityStateZipCode += `${this.patientProfile.ZipCode}`;
      }

      if (!this.address && !this.displayCityStateZipCode) {
        this.address = this.translate.instant("No Address on File");
      }
    }
    this.authAccess();
    this.checkFeatureFlags();
  }
  updatePerson = () => {
    let urlPerson = `#/Patient/${this.patientProfile.PatientId}/Person/?sectionId=2`;
    let urlPersonTab = `#/Patient/${this.patientProfile.PatientId}/PersonTab/?sectionId=2`;
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
