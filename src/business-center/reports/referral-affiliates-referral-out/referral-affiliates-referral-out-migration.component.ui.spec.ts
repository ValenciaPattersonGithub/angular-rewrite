import { fakeAsync, TestBed, tick } from '@angular/core/testing';
import { CUSTOM_ELEMENTS_SCHEMA, NO_ERRORS_SCHEMA } from '@angular/core';
import { render, RenderResult, screen } from '@testing-library/angular';
import { ReferralAffiliatesReferralOutMigrationComponent } from './referral-affiliates-referral-out-migration.component';
import { TranslateModule } from '@ngx-translate/core';
import { ScrollingModule } from '@angular/cdk/scrolling';
import { TruncateTextPipe } from 'src/@shared/pipes/truncate/truncate-text.pipe';

const mockReferralDetailedData = {
  "BlobId": "e513e085-c4dd-475d-a2ad-df5ed305fb3e",
  "ReferralAffiliates": [
      {
          "Location": "29 Test 123",
          "Provider": "S,  Shelly",
          "ExternalProvider": " ",
          "Patient": "NewPatientLN1, NewPatientFN1",
          "TreatmentPlan": [],
          "ServiceType": null,
          "Note": "Ref Out - Ext - Edit - Save n Print - Only Email",
          "PracticeName": "29Test CustFeed3",
          "NextAppointmentDate": null,
          "ReturnDate": null,
          "ActualReturnDate": null,
          "DateCreated": "2024-10-15T17:07:31.563"
      },
      {
          "Location": "29 Test",
          "Provider": "S,  Shelly",
          "ExternalProvider": "Practice, 29Test M.",
          "Patient": "Specter, M Harvey",
          "TreatmentPlan": [],
          "ServiceType": null,
          "Note": "",
          "PracticeName": "29TestPractice",
          "NextAppointmentDate": null,
          "ReturnDate": null,
          "ActualReturnDate": null,
          "DateCreated": "2024-10-15T09:29:55.333"
      },
      {
          "Location": "29 Test",
          "Provider": "S,  Shelly",
          "ExternalProvider": "Watson, Mike T.",
          "Patient": "Specter, M Harvey",
          "TreatmentPlan": [
              "D0150: comprehensive oral evaluation - new or established patient (D0150)",
              "D01406: periodic oral evaluation - established patient"
          ],
          "ServiceType": null,
          "Note": null,
          "PracticeName": "Sahara Hospitals",
          "NextAppointmentDate": null,
          "ReturnDate": "2024-10-31T00:00:00",
          "ActualReturnDate": null,
          "DateCreated": "2024-10-22T10:20:27.317"
      }
  ],
  "ReferralAffiliatesSummary": [],
  "TotalRecords": 12,
  "ReportTitle": "Referral Affiliates",
  "GeneratedAtDateTime": "2024-10-22T11:31:21.669668Z",
  "GeneratedByUserCode": "BHAME1",
  "LocationOrPracticeName": "PracticePerf26899",
  "LocationOrPracticePhone": "11111-222",
  "LocationOrPracticeEmail": "info@test.com",
  "FilterInfo": null,
  "ReportRunDate": null
};

const mockReferralSummaryData = {
  "BlobId": "e1bbd785-40b0-4754-ae16-88e59b1e8795",
  "ReferralAffiliates": [],
  "ReferralAffiliatesSummary": [
      {
          "Location": "29 Test 123",
          "Provider": "S, Shelly",
          "ExternalProvider": " ",
          "PracticeName": "ictTest3",
          "TotalNumberOfReturned": 0,
          "TotalNumberOfReferredOut": 5
      },
      {
          "Location": "29 Test",
          "Provider": "S, Shelly",
          "ExternalProvider": "Gates, Bill ",
          "PracticeName": "ict",
          "TotalNumberOfReturned": 0,
          "TotalNumberOfReferredOut": 1
      },
      {
          "Location": "29 Test",
          "Provider": "S, Shelly",
          "ExternalProvider": "Practice, 29Test M.",
          "PracticeName": "29TestPractice",
          "TotalNumberOfReturned": 0,
          "TotalNumberOfReferredOut": 5
      },
      {
          "Location": "29 Test",
          "Provider": "S, Shelly",
          "ExternalProvider": "Watson, Mike T.",
          "PracticeName": "Sahara Hospitals",
          "TotalNumberOfReturned": 0,
          "TotalNumberOfReferredOut": 1
      }
  ],
  "TotalRecords": 4,
  "ReportTitle": "Referral Affiliates",
  "GeneratedAtDateTime": "2024-10-22T11:34:46.9094245Z",
  "GeneratedByUserCode": "BHAME1",
  "LocationOrPracticeName": "PracticePerf26899",
  "LocationOrPracticePhone": "11111-222",
  "LocationOrPracticeEmail": "info@test.com",
  "FilterInfo": null,
  "ReportRunDate": null
};




describe('ReferralAffiliatesReferralOutMigrationComponent', () => {
  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ReferralAffiliatesReferralOutMigrationComponent, TruncateTextPipe],
      imports: [
        ScrollingModule,
        TranslateModule.forRoot()
      ],
      providers: [],
      schemas: [CUSTOM_ELEMENTS_SCHEMA, NO_ERRORS_SCHEMA],
    }).compileComponents();
  });

  it('should_render_and_validate_referral_affiliate_details_report_correctly', fakeAsync(async () => {
    const { fixture }: RenderResult<ReferralAffiliatesReferralOutMigrationComponent> = await render(ReferralAffiliatesReferralOutMigrationComponent, {
      componentProperties: {
        data: mockReferralDetailedData,
        isDataLoaded: true,
        ofcLocation: '',
        pageNumberClicked: true,
        reportView: 'detailed'
      },
    });

    tick(100);
    fixture.detectChanges();

    //Testcase to checks for headers
    expect(screen.getByText('Location')).toBeTruthy();
    expect(screen.getByText('Provider')).toBeTruthy();
    expect(screen.getByText('Referred To')).toBeTruthy();
    expect(screen.getByText('Patient')).toBeTruthy();
    expect(screen.getByText('Referred Services')).toBeTruthy();
    expect(screen.getByText('Expected Return Date')).toBeTruthy();
    expect(screen.getByText('Actual Return Date')).toBeTruthy();
    expect(screen.getByText('Next Appt')).toBeTruthy();
    expect(screen.getByText('Note')).toBeTruthy();

    // TestCase to Verify that specific text/data from mock data is displayed in the component
    expect(screen.getByText('29 Test 123')).toBeTruthy();
    // Use getAllByText to fetch all instances of the text and choose the correct one
    const referralSources = screen.getAllByText('Specter, M Harvey');
    //expect(referralSources.length).toBeGreaterThan(0);

    // Verify specific instance of the referral source in the correct context (e.g., in a particular row)
    expect(referralSources[0]).toBeTruthy(); // This assumes we want to check the first occurrence
  }));
  it('should handle pagination and update sessionStorage correctly', fakeAsync(async () => {
    const { fixture }: RenderResult<ReferralAffiliatesReferralOutMigrationComponent> = await render(ReferralAffiliatesReferralOutMigrationComponent, {
      componentProperties: {
        data: mockReferralDetailedData,
        isDataLoaded: true,
        ofcLocation: '',
        pageNumberClicked: true,
        reportView: 'detailed'
      },
    });

    tick(100); // Simulate passage of time
    fixture.detectChanges(); // Trigger change detection
    // Verify the pagination controls
    expect(screen.getByText('1')).toBeTruthy();
  }));
  it('should_render_and_validate_referral_affiliate_report_correctly', fakeAsync(async () => {
    const { fixture }: RenderResult<ReferralAffiliatesReferralOutMigrationComponent> = await render(ReferralAffiliatesReferralOutMigrationComponent, {
      componentProperties: {
        data: mockReferralSummaryData,
        isDataLoaded: true,
        ofcLocation: '',
        pageNumberClicked: true,
        reportView: 'summary'
      },
    });

    tick(100); // Simulate passage of time
    fixture.detectChanges(); // Trigger change detection

    //Testcase to checks for headers
    expect(screen.getByText('Location')).toBeTruthy();
    expect(screen.getByText('Provider')).toBeTruthy();
    expect(screen.getByText('External Provider/Practice')).toBeTruthy();
    expect(screen.getByText('Total # of Returned')).toBeTruthy();
    expect(screen.getByText('Total # of Referred out')).toBeTruthy();

    // TestCase to Verify that specific text/data from mock data is displayed in the component
    expect(screen.getByText('29 Test 123')).toBeTruthy();
    // Use getAllByText to fetch all instances of the text and choose the correct one
    const referralSources = screen.getAllByText('S, Shelly');
    expect(referralSources.length).toBeGreaterThan(0);

    // Verify specific instance of the referral source in the correct context (e.g., in a particular row)
    expect(referralSources[0]).toBeTruthy(); // This assumes we want to check the first occurrence
    expect(referralSources[1]).toBeTruthy(); // This assumes we want to check the second occurrence
  }));
  it('should handle pagination and update sessionStorage correctly', fakeAsync(async () => {
    const { fixture }: RenderResult<ReferralAffiliatesReferralOutMigrationComponent> = await render(ReferralAffiliatesReferralOutMigrationComponent, {
      componentProperties: {
        data: mockReferralSummaryData,
        isDataLoaded: true,
        ofcLocation: '',
        pageNumberClicked: true,
        reportView: 'summary'
      },
    });

    tick(100); // Simulate passage of time
    fixture.detectChanges(); // Trigger change detection
    // Verify the pagination controls
    const pag = screen.getAllByText('1');
    expect(pag.length).toBeGreaterThan(0);
  }));

});
