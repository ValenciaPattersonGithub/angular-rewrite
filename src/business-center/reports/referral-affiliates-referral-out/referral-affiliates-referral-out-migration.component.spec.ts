import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ReferralAffiliatesReferralOutMigrationComponent } from './referral-affiliates-referral-out-migration.component';

describe('ReferralSourceProductivityMigrationComponent', () => {
  let component: ReferralAffiliatesReferralOutMigrationComponent;
  let fixture: ComponentFixture<ReferralAffiliatesReferralOutMigrationComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ReferralAffiliatesReferralOutMigrationComponent]
    })
      .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(ReferralAffiliatesReferralOutMigrationComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  describe('Refresh the data', () => {
    it('should create the component', () => {
      let data =
      {
        "Success": true,
        "ResultCode": 0,
        "Value": {
            "ReferralAffiliates": [
                {
                    "Location": "Innovators",
                    "Provider": "",
                    "ExternalProvider": "19Test  19Test",
                    "Patient": "Harvey M Specter",
                    "TreatmentPlan": "Treatment Plan-P,R",
                    "ServiceType": "Implant Services",
                    "Note": null,
                    "NextAppointment": "0001-01-01T00:00:00",
                    "Return": "0001-01-01T00:00:00",
                    "DateCreated": "2024-07-11T09:56:24.187"
                },
                {
                    "Location": "Innovators",
                    "Provider": "James  Bond",
                    "ExternalProvider": "29Test M Practice",
                    "Patient": "RefProdRep11  RefProdRep11",
                    "TreatmentPlan": "",
                    "ServiceType": "",
                    "Note": null,
                    "NextAppointment": "0001-01-01T00:00:00",
                    "Return": "0001-01-01T00:00:00",
                    "DateCreated": "2024-07-23T08:20:55.743"
                },
                {
                    "Location": "Innovators",
                    "Provider": "",
                    "ExternalProvider": "29Test M Practice",
                    "Patient": "RefProdRep6  RefProdRep6",
                    "TreatmentPlan": "Treatment Plan-P,R",
                    "ServiceType": "Implant Services",
                    "Note": null,
                    "NextAppointment": "0001-01-01T00:00:00",
                    "Return": "0001-01-01T00:00:00",
                    "DateCreated": "2024-07-23T07:55:26.67"
                },
                {
                    "Location": "Innovators",
                    "Provider": "",
                    "ExternalProvider": "29Test M Practice",
                    "Patient": "David  C Color",
                    "TreatmentPlan": "Treatment Plan-P,R",
                    "ServiceType": "Implant Services",
                    "Note": null,
                    "NextAppointment": "0001-01-01T00:00:00",
                    "Return": "0001-01-01T00:00:00",
                    "DateCreated": "2024-07-22T12:59:17.12"
                },
                {
                    "Location": "Innovators",
                    "Provider": "Yewande  InnovatorPO",
                    "ExternalProvider": "29Test M Practice",
                    "Patient": "David  C Color",
                    "TreatmentPlan": "",
                    "ServiceType": "",
                    "Note": "Testing",
                    "NextAppointment": "0001-01-01T00:00:00",
                    "Return": "0001-01-01T00:00:00",
                    "DateCreated": "2024-07-22T12:58:46.49"
                },
                {
                    "Location": "Innovators",
                    "Provider": "",
                    "ExternalProvider": "29Test M Practice",
                    "Patient": "RefProdRep5  RefProdRep5",
                    "TreatmentPlan": "Treatment Plan-P,R",
                    "ServiceType": "Implant Services",
                    "Note": null,
                    "NextAppointment": "0001-01-01T00:00:00",
                    "Return": "0001-01-01T00:00:00",
                    "DateCreated": "2024-07-19T16:19:53.803"
                },
                {
                    "Location": "Innovators",
                    "Provider": "",
                    "ExternalProvider": "29Test M Practice",
                    "Patient": "RefProdRep2  RefProdRep2",
                    "TreatmentPlan": "Treatment Plan-P,R",
                    "ServiceType": "Implant Services",
                    "Note": null,
                    "NextAppointment": "0001-01-01T00:00:00",
                    "Return": "0001-01-01T00:00:00",
                    "DateCreated": "2024-07-19T11:06:33.103"
                },
                {
                    "Location": "Innovators",
                    "Provider": "",
                    "ExternalProvider": "29Test M Practice",
                    "Patient": "RefProdRep1  RefProdRep1",
                    "TreatmentPlan": "Treatment Plan-P,R",
                    "ServiceType": "Implant Services",
                    "Note": null,
                    "NextAppointment": "0001-01-01T00:00:00",
                    "Return": "0001-01-01T00:00:00",
                    "DateCreated": "2024-07-18T16:35:02.503"
                },
                {
                    "Location": "Innovators",
                    "Provider": "Shelly  S",
                    "ExternalProvider": "29Test M Practice",
                    "Patient": "Harvey M Specter",
                    "TreatmentPlan": "",
                    "ServiceType": "",
                    "Note": "",
                    "NextAppointment": "0001-01-01T00:00:00",
                    "Return": "0001-01-01T00:00:00",
                    "DateCreated": "2024-07-09T19:17:41.55"
                },
                {
                    "Location": "Innovators",
                    "Provider": "",
                    "ExternalProvider": "29Test M Practice",
                    "Patient": "Harvey M Specter",
                    "TreatmentPlan": "Treatment Plan-P,R",
                    "ServiceType": "Implant Services",
                    "Note": "",
                    "NextAppointment": "0001-01-01T00:00:00",
                    "Return": "0001-01-01T00:00:00",
                    "DateCreated": "2024-07-09T19:07:32.813"
                },
                {
                    "Location": "Innovators",
                    "Provider": "Shelly  S",
                    "ExternalProvider": "29Test M Practice",
                    "Patient": "Harvey M Specter",
                    "TreatmentPlan": "",
                    "ServiceType": "",
                    "Note": "test",
                    "NextAppointment": "0001-01-01T00:00:00",
                    "Return": "0001-01-01T00:00:00",
                    "DateCreated": "2024-07-09T19:04:18.183"
                },
                {
                    "Location": "Innovators",
                    "Provider": "",
                    "ExternalProvider": "29Test M Practice",
                    "Patient": "Harvey M Specter",
                    "TreatmentPlan": "Treatment Plan-P,R",
                    "ServiceType": "Implant Services",
                    "Note": "edit",
                    "NextAppointment": "0001-01-01T00:00:00",
                    "Return": "0001-01-01T00:00:00",
                    "DateCreated": "2024-07-09T18:55:16.953"
                },
                {
                    "Location": "Innovators",
                    "Provider": "",
                    "ExternalProvider": "29Test M Practice",
                    "Patient": "Harvey M Specter",
                    "TreatmentPlan": "Treatment Plan-P,R",
                    "ServiceType": "Implant Services",
                    "Note": "Practice Name Av and Prov Add av...Navigation: Fuse| Account| Profile and Clinical| NotesAs a Fuse user, I want to capture and manage referrals from external providers, so that I can ensure seamless tracking and coordination of patient care.Referral InExternal ProviderI must be able to see the referred from office location and display as:Referred office NameAddressPatientI must be able to see the referred from patient and display as:Patient Full NameAddressemail (if provided)email (If provided)OtherI must be able to see the Source information  and display as:Source Name {Social Media}Campaign Name Navigation: Fuse| Account| Profile and Clinical| NotesAs a Fuse user, I want to capture and manage referrals from external providers, so that I can ensure seamless tracking and coordination of patient care.Referral InExternal ProviderI must be able to see the referred from office location and display as:Referred office NameAddressPatientI must be able to see the referred from patient and display as:Patient Full NameAddressemail (if provided)email (If provided)OtherI must be able to see the Source information  and display as:Source Name {Social Media}Campaign Name Navigation: Fuse| Account| Profile and Clinical| NotesAs a Fuse user, I want to capture and manage referrals from external providers, so that I can ensure seamless tracking and coordination of patient care.Referral InExternal ProviderI must be able to see the referred from office location and display as:Referred office NameAddressPatientI must be able to see the referred from patient and display as:Patient Full NameAddressemail (if provided)email (If provided)OtherI must be able to see the Source information  and display as:Source Name {Social Media}Campaign Name Navigation: Fuse| Account| Profile and Clinical| NotesAs a Fuse user, I want to capture and manage referrals from external providers, so that I can ensure seamless tracking and coordination of patient care.Referral InExternal ProviderI must be able to see",
                    "NextAppointment": "0001-01-01T00:00:00",
                    "Return": "0001-01-01T00:00:00",
                    "DateCreated": "2024-07-01T09:31:14.113"
                },
                {
                    "Location": "Innovators",
                    "Provider": "Megha  Bhargava",
                    "ExternalProvider": "29Test M Practice",
                    "Patient": "Harvey M Specter",
                    "TreatmentPlan": "",
                    "ServiceType": "",
                    "Note": "fhefhaelk;fdjs;afjasfklahsfl;asfla",
                    "NextAppointment": "0001-01-01T00:00:00",
                    "Return": "0001-01-01T00:00:00",
                    "DateCreated": "2024-07-01T09:01:18.117"
                },
                {
                    "Location": "Innovators",
                    "Provider": "Michael  Scott",
                    "ExternalProvider": "aa  Smithh",
                    "Patient": "Zach  Patient 1",
                    "TreatmentPlan": "",
                    "ServiceType": "",
                    "Note": null,
                    "NextAppointment": "0001-01-01T00:00:00",
                    "Return": "0001-01-01T00:00:00",
                    "DateCreated": "2024-07-09T13:01:59.757"
                }
            ],
            "ReferralAffiliatesSummary": [],
            "TotalRecords": 15,
            "ReportTitle": "Referral Affiliates",
            "GeneratedAtDateTime": "2024-07-30T09:30:19.0332555Z",
            "GeneratedByUserCode": "ADMFU1",
            "LocationOrPracticeName": "PracticePerf26899",
            "LocationOrPracticePhone": "11111-222",
            "LocationOrPracticeEmail": "info@test.com",
            "FilterInfo": null,
            "ReportRunDate": null
        },
        "Count": null,
        "InvalidProperties": null
    }

      component.data = data;
      component.refreshData = jasmine.createSpy();
      component.ngOnChanges();
      expect(component.refreshData).toHaveBeenCalled();
    });
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
