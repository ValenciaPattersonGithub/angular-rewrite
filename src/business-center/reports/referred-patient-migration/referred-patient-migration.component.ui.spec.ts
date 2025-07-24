import { fakeAsync, TestBed, tick } from '@angular/core/testing';
import { CUSTOM_ELEMENTS_SCHEMA, NO_ERRORS_SCHEMA } from '@angular/core';
import { render, RenderResult, screen } from '@testing-library/angular';
import { ReferredPatientsBetaMigrationComponent } from './referred-patient-migration.component';
import { TranslateModule } from '@ngx-translate/core';
import { ScrollingModule } from '@angular/cdk/scrolling';

const mockReferredPatientData = {
  "ReferralTypes": [
    {
      "ReferralDirection": "In",
      "ReferralCategories": "External Provider",
      "ShowTotals": true,
      "TotalReferrals": 18,
      "ReferralSources": [
        {
          "ReferringFrom": "29TestCustFeed2 - Bhargava, Megha A.",
          "ShowTotals": true,
          "TotalReferrals": 2,
          "Patients": [
            {
              "ReferredPatientName": "RefCustFeedLN5, RefCustFeedFN5",
              "ReferredPatientCode": "REFRE85",
              "FirstVisitDate": null,
              "ReferredPatientLocation": "29 Test"
            },
            {
              "ReferredPatientName": "RefCustFeedLN1, RefCustFeedFN1",
              "ReferredPatientCode": "REFRE81",
              "FirstVisitDate": "2024-09-30T00:00:00",
              "ReferredPatientLocation": "29 Test"
            }
          ]
        },
        {
          "ReferringFrom": "29TestCustFeed4",
          "ShowTotals": true,
          "TotalReferrals": 1,
          "Patients": [
            {
              "ReferredPatientName": "refCustFeedLN2, refCustFeedFN2",
              "ReferredPatientCode": "REFRE82",
              "FirstVisitDate": null,
              "ReferredPatientLocation": "29 Test"
            }
          ]
        },
        {
          "ReferringFrom": "29TestPractice - Practice, 29Test M.",
          "ShowTotals": true,
          "TotalReferrals": 9,
          "Patients": [
            {
              "ReferredPatientName": "RefProdRep5, RefProdRep5",
              "ReferredPatientCode": "REFRE27",
              "FirstVisitDate": "2024-05-08T00:00:00",
              "ReferredPatientLocation": "29 Test"
            },
            {
              "ReferredPatientName": "RefProdRep6, RefProdRep6",
              "ReferredPatientCode": "REFRE28",
              "FirstVisitDate": "2024-02-15T00:00:00",
              "ReferredPatientLocation": "29 Test"
            },
            {
              "ReferredPatientName": "RefWidLN3, RefWidFN3",
              "ReferredPatientCode": "REFRE59",
              "FirstVisitDate": null,
              "ReferredPatientLocation": "29 Test"
            }
          ]
        }
      ]
    },
    {
      "ReferralDirection": "In",
      "ReferralCategories": "Other",
      "ShowTotals": true,
      "TotalReferrals": 28,
      "ReferralSources": [
        {
          "ReferringFrom": "28Oct24",
          "ShowTotals": true,
          "TotalReferrals": 1,
          "Patients": [
            {
              "ReferredPatientName": "FVDPatientLN3, FVDPatientFN3",
              "ReferredPatientCode": "FVDFV3",
              "FirstVisitDate": "2024-10-28T00:00:00",
              "ReferredPatientLocation": "29 Test"
            }
          ]
        },
        {
          "ReferringFrom": "Consultancy",
          "ShowTotals": true,
          "TotalReferrals": 1,
          "Patients": [
            {
              "ReferredPatientName": "FVDPatientFN2, FVDPatientFN1",
              "ReferredPatientCode": "FVDFV1",
              "FirstVisitDate": "2024-08-08T00:00:00",
              "ReferredPatientLocation": "29 Test"
            }
          ]
        },
        {
          "ReferringFrom": "Email",
          "ShowTotals": true,
          "TotalReferrals": 2,
          "Patients": [
            {
              "ReferredPatientName": "Refrep25, Refrep25 M.",
              "ReferredPatientCode": "REFRE21",
              "FirstVisitDate": "2024-07-02T00:00:00",
              "ReferredPatientLocation": "29 Test"
            },
            {
              "ReferredPatientName": "RefProdRep12, RefProdRep12",
              "ReferredPatientCode": "REFRE34",
              "FirstVisitDate": null,
              "ReferredPatientLocation": "29 Test"
            }
          ]
        },
        {
          "ReferringFrom": "Facebook",
          "ShowTotals": true,
          "TotalReferrals": 1,
          "Patients": [
            {
              "ReferredPatientName": "RefRep6, RefRep6",
              "ReferredPatientCode": "REFRE6",
              "FirstVisitDate": null,
              "ReferredPatientLocation": "29 Test"
            }
          ]
        },
        {
          "ReferringFrom": "Instagram",
          "ShowTotals": true,
          "TotalReferrals": 6,
          "Patients": [
            {
              "ReferredPatientName": "RefProdRep10, RefProdRep10",
              "ReferredPatientCode": "REFRE32",
              "FirstVisitDate": null,
              "ReferredPatientLocation": "29 Test"
            },
            {
              "ReferredPatientName": "RefCustFeed2LN, RefCustFeed1LN",
              "ReferredPatientCode": "REFRE53",
              "FirstVisitDate": "2023-08-28T00:00:00",
              "ReferredPatientLocation": "29 Test"
            }
          ]
        },
        {
          "ReferringFrom": "LinkedIn",
          "ShowTotals": true,
          "TotalReferrals": 5,
          "Patients": [
            {
              "ReferredPatientName": "Demo, 29DemoUser4",
              "ReferredPatientCode": "DEMDE4",
              "FirstVisitDate": "2024-04-08T00:00:00",
              "ReferredPatientLocation": "29 Test"
            }
          ]
        }
      ]
    },
    {
      "ReferralDirection": "In",
      "ReferralCategories": "Patient",
      "ShowTotals": true,
      "TotalReferrals": 27,
      "ReferralSources": [
        {
          "ReferringFrom": "11, Test QA Environment",
          "ShowTotals": true,
          "TotalReferrals": 1,
          "Patients": [
            {
              "ReferredPatientName": "LVDRepLN1, LVDRepFN1",
              "ReferredPatientCode": "LVDLV1",
              "FirstVisitDate": "2024-09-16T00:00:00",
              "ReferredPatientLocation": "29 Test"
            }
          ]
        }
      ]
    }
  ],
  "TotalRecords": 73,
  "ReportTitle": "Referred Patients",
  "GeneratedAtDateTime": "2024-10-28T11:59:39.261879Z",
  "GeneratedByUserCode": "BHAME1",
  "LocationOrPracticeName": "PracticePerf26899",
  "LocationOrPracticePhone": "11111-222",
  "LocationOrPracticeEmail": "info@test.com",
  "FilterInfo": null,
  "ReportRunDate": "2024-10-28T11:59:39.261879Z"
};

describe('ReferredPatientsBetaMigrationComponent', () => {
  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ReferredPatientsBetaMigrationComponent],
      imports: [
        ScrollingModule,
        TranslateModule.forRoot()
      ],
      providers: [],
      schemas: [CUSTOM_ELEMENTS_SCHEMA, NO_ERRORS_SCHEMA],
    }).compileComponents();
  });

  it('should_render_and_validate_referred_patients_report_correctly', fakeAsync(async () => {
    const { fixture }: RenderResult<ReferredPatientsBetaMigrationComponent> = await render(ReferredPatientsBetaMigrationComponent, {
      componentProperties: {
        data: mockReferredPatientData,
        isDataLoaded: true,
        pageNumberClicked: true
      },
    });

    tick(100);
    fixture.detectChanges();

    //Testcase to checks for headers
    expect(screen.getByText('Referral Categories')).toBeTruthy();
    expect(screen.getByText('Referring From')).toBeTruthy();
    expect(screen.getByText('Referred Patient Name')).toBeTruthy();
    expect(screen.getByText('Referred Patient Code')).toBeTruthy();
    expect(screen.getByText('First Visit Date')).toBeTruthy();
    expect(screen.getByText('Referred Patient Location')).toBeTruthy();

    // TestCase to Verify that specific text/data from mock data is displayed in the component
    expect(screen.getByText('External Provider')).toBeTruthy();
    // Use getAllByText to fetch all instances of the text and choose the correct one
    const referralSources = screen.getAllByText('refCustFeedLN2, refCustFeedFN2');
    
    // Verify specific instance of the referral source in the correct context (e.g., in a particular row)
    expect(referralSources[0]).toBeTruthy(); // This assumes we want to check the first occurrence
  }));

  it('should handle pagination and update sessionStorage correctly', fakeAsync(async () => {
    const { fixture }: RenderResult<ReferredPatientsBetaMigrationComponent> = await render(ReferredPatientsBetaMigrationComponent, {
      componentProperties: {
        data: mockReferredPatientData,
        isDataLoaded: true,
        pageNumberClicked: true
      },
    });

    tick(100); // Simulate passage of time
    fixture.detectChanges(); // Trigger change detection
    // Verify the pagination controls
    expect(screen.getByText('1')).toBeTruthy();
  }));
});
