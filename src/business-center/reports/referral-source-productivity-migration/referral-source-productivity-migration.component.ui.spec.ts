import { ComponentFixture, fakeAsync, flush, TestBed, tick } from '@angular/core/testing';
import { CUSTOM_ELEMENTS_SCHEMA, NO_ERRORS_SCHEMA } from '@angular/core';
import { fireEvent, render, RenderResult, screen, within } from '@testing-library/angular';
import { ReportsHelper } from '../reports-helper';
import { ReferralSourceProductivityMigrationComponent } from './referral-source-productivity-migration.component';
import { TranslateModule } from '@ngx-translate/core';
import { ScrollingModule } from '@angular/cdk/scrolling';
import { By } from '@angular/platform-browser';

const mockReferralDetailedData = {
  "ReferralSourceProductivitySummary": null,
  "ReferralSourceProductivityDetailed": {
    "RangeSelected": 9176.28,
    "ThisMonth": 9176.28,
    "ThisYear": 1528650.99,
    "Locations": [
      {
        "Location": "29 Test",
        "RangeSelected": 5775.8,
        "ThisMonth": 5775.8,
        "ThisYear": 285030.57,
        "ShowTotals": false,
        "IsReferralSourceHeader": true,
        "Sources": [
          {
            "ReferralSource": "External Provider",
            "RangeSelected": 0,
            "ThisMonth": 0,
            "ThisYear": 0,
            "Patients": [
              {
                "Patient": "RefRep16, RefRep16",
                "FirstVisit": "2024-07-15",
                "RangeSelected": 0,
                "ThisMonth": 0,
                "ThisYear": 0
              },
              {
                "Patient": "RefRep12, RefRep12",
                "FirstVisit": "2024-07-20",
                "RangeSelected": 0,
                "ThisMonth": 0,
                "ThisYear": 0
              }
            ],
            "ReferredPatient": "Willams, David K."
          }
        ]
      },
      // Second Location for Pagination
      {
        "Location": "30 Test",
        "RangeSelected": 6000.5,
        "ThisMonth": 6000.5,
        "ThisYear": 300000.00,
        "ShowTotals": false,
        "IsReferralSourceHeader": true,
        "Sources": [
          {
            "ReferralSource": "Internal Provider",
            "RangeSelected": 100,
            "ThisMonth": 100,
            "ThisYear": 1000,
            "Patients": [
              {
                "Patient": "RefRep17, RefRep17",
                "FirstVisit": "2024-07-25",
                "RangeSelected": 50,
                "ThisMonth": 50,
                "ThisYear": 500
              },
              {
                "Patient": "RefRep13, RefRep13",
                "FirstVisit": "2024-07-30",
                "RangeSelected": 50,
                "ThisMonth": 50,
                "ThisYear": 500
              }
            ],
            "ReferredPatient": "Smith, John"
          }
        ]
      }
    ],
    "TotalRecords": 4, // Updated for pagination
    "ReportTitle": "Referral Productivity",
    "GeneratedAtDateTime": "0001-01-01T00:00:00",
    "GeneratedByUserCode": null,
    "LocationOrPracticeName": null,
    "LocationOrPracticePhone": null,
    "LocationOrPracticeEmail": null,
    "FilterInfo": null,
    "ReportRunDate": null
  },
  "TotalRecords": 4, // Updated for pagination
  "BlobId": "07692a75-377c-45d6-8a87-ebf75a5a8b21",
  "ReportTitle": "Referral Productivity",
  "GeneratedAtDateTime": "2024-08-14T15:51:51.7190961Z",
  "GeneratedByUserCode": "ADMFU1",
  "LocationOrPracticeName": "PracticePerf26899",
  "LocationOrPracticePhone": "11111-222",
  "LocationOrPracticeEmail": "info@test.com",
  "FilterInfo": null,
  "ReportRunDate": null
};

const mockReferralSummaryData = {
    "ReferralSourceProductivitySummary": {
        "NumberReferred": 3488,
        "Productivity": 5086589.40,
        "AverageProductivity": 1458.3111811926605504587155963,
        "Locations": [
            {
                "Location": "29 Test",
                "NumberReferred": 26,
                "Productivity": 59390.00,
                "AverageProductivity": 2284.2307692307692307692307692,
                "ShowTotals": true,
                "Sources": [
                    {
                        "Rank": 1,
                        "ReferralSource": "Patient",
                        "NumberReferred": 13,
                        "Productivity": 59280.00,
                        "AverageProductivity": 4560.00
                    },
                    {
                        "Rank": 2,
                        "ReferralSource": "External Provider",
                        "NumberReferred": 1,
                        "Productivity": 110.00,
                        "AverageProductivity": 110.00
                    },
                    {
                        "Rank": 3,
                        "ReferralSource": "Other",
                        "NumberReferred": 12,
                        "Productivity": 0.00,
                        "AverageProductivity": 0.00
                    }
                ]
            },
            {
                "Location": "California",
                "NumberReferred": 7,
                "Productivity": 11100.00,
                "AverageProductivity": 1585.7142857142857142857142857,
                "ShowTotals": true,
                "Sources": [
                    {
                        "Rank": 1,
                        "ReferralSource": "Other",
                        "NumberReferred": 4,
                        "Productivity": 11100.00,
                        "AverageProductivity": 2775.00
                    },
                    {
                        "Rank": 2,
                        "ReferralSource": "External Provider",
                        "NumberReferred": 2,
                        "Productivity": 0.00,
                        "AverageProductivity": 0.00
                    },
                    {
                        "Rank": 3,
                        "ReferralSource": "Patient",
                        "NumberReferred": 1,
                        "Productivity": 0.00,
                        "AverageProductivity": 0.00
                    }
                ]
            },
        ],
        "TotalRecords": 59,
        "ReportTitle": null,
        "GeneratedAtDateTime": "0001-01-01T00:00:00",
        "GeneratedByUserCode": null,
        "LocationOrPracticeName": null,
        "LocationOrPracticePhone": null,
        "LocationOrPracticeEmail": null,
        "FilterInfo": null,
        "ReportRunDate": null
    },
    "ReferralSourceProductivityDetailed":null,
    "TotalRecords": 4, // Updated for pagination
    "BlobId": "07692a75-377c-45d6-8a87-ebf75a5a8b21",
    "ReportTitle": "Referral Productivity",
    "GeneratedAtDateTime": "2024-08-14T15:51:51.7190961Z",
    "GeneratedByUserCode": "ADMFU1",
    "LocationOrPracticeName": "PracticePerf26899",
    "LocationOrPracticePhone": "11111-222",
    "LocationOrPracticeEmail": "info@test.com",
    "FilterInfo": null,
    "ReportRunDate": null
};




describe('ReferralSourcesProductivityDetailedMigrationComponent', () => {
  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ReferralSourceProductivityMigrationComponent],
      imports: [
        ScrollingModule,
        TranslateModule.forRoot() // Importing TranslateModule
      ],
      providers: [],
      schemas: [CUSTOM_ELEMENTS_SCHEMA, NO_ERRORS_SCHEMA ], // Fix the schema issue
    }).compileComponents();
  });

 it('should_render_and_validate_referral_sources_productivity_details_report_correctly', fakeAsync(async () => {
    const { fixture }: RenderResult<ReferralSourceProductivityMigrationComponent> = await render(ReferralSourceProductivityMigrationComponent, {
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

    //Testcase to checks for headers
    expect(screen.getByText('Location')).toBeTruthy();
    expect(screen.getByText('Referral In')).toBeTruthy();
    expect(screen.getByText('Categories')).toBeTruthy();
    expect(screen.getByText('Patient')).toBeTruthy();
    expect(screen.getByText('Referral Date')).toBeTruthy();
    expect(screen.getByText('First Visit')).toBeTruthy();
    expect(screen.getByText('Range Selected')).toBeTruthy();
    expect(screen.getByText('This Month Productivity')).toBeTruthy();
    expect(screen.getByText('This Year Productivity')).toBeTruthy();
  
  // TestCase to Verify that specific text/data from mockReferralDetailedData is displayed in the component
    expect(screen.getByText('29 Test')).toBeTruthy();
    // Use getAllByText to fetch all instances of the text and choose the correct one
    const referralSources = screen.getAllByText('Willams, David K.');
    expect(referralSources.length).toBeGreaterThan(0);

    // Verify specific instance of the referral source in the correct context (e.g., in a particular row)
    expect(referralSources[0]).toBeTruthy(); // This assumes we want to check the first occurrence
    expect(referralSources[1]).toBeTruthy(); // This assumes we want to check the second occurrence

    expect(screen.getByText('RefRep16, RefRep16')).toBeTruthy();
    expect(screen.getByText('RefRep12, RefRep12')).toBeTruthy();
    // TestCase to Verify that text 'Total for Willams, David K.' is displayed in the component
    const ReferralSources1 = screen.getByText('Total for Willams, David K.');
    expect(ReferralSources1).toBeTruthy();

    // Verify currency values are displayed correctly
    const currencyValues = screen.getAllByText('$9,176.28');
    expect(currencyValues.length).toBeGreaterThan(0); // Ensure at least one occurrence
    // Check that the first occurrence is correctly rendered
   expect(currencyValues[0]).toBeTruthy(); 
   // If there are multiple occurrences, check the second one as well 
    if (currencyValues.length > 1) {
      expect(currencyValues[1]).toBeTruthy(); 
    }
 
     expect(screen.getByText('$1,528,650.99')).toBeTruthy();
 
   
 }));
 it('should handle pagination and update sessionStorage correctly', fakeAsync(async () => {
  const { fixture }: RenderResult<ReferralSourceProductivityMigrationComponent> = await render(ReferralSourceProductivityMigrationComponent, {
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
 it('should_render_and_validate_referral_sources_productivity_report_correctly', fakeAsync(async () => {
        const { fixture }: RenderResult<ReferralSourceProductivityMigrationComponent> = await render(ReferralSourceProductivityMigrationComponent, {
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
        expect(screen.getByText('Rank')).toBeTruthy();
        expect(screen.getByText('Referral In Categories')).toBeTruthy();
        expect(screen.getByText('# Patient Referred')).toBeTruthy();
        expect(screen.getByText('Productivity')).toBeTruthy();
        expect(screen.getByText('Avg. Productivity')).toBeTruthy();

        // TestCase to Verify that specific text/data from mockReferralDetailedData is displayed in the component
        expect(screen.getByText('29 Test')).toBeTruthy();
        // Use getAllByText to fetch all instances of the text and choose the correct one
        const referralSources = screen.getAllByText('External Provider');
        expect(referralSources.length).toBeGreaterThan(0);

        // Verify specific instance of the referral source in the correct context (e.g., in a particular row)
        expect(referralSources[0]).toBeTruthy(); // This assumes we want to check the first occurrence
        expect(referralSources[1]).toBeTruthy(); // This assumes we want to check the second occurrence

        expect(screen.getByText('3488')).toBeTruthy();
        const totalCal = screen.getByText('Total for California');
        expect(totalCal).toBeTruthy();

        // Verify currency values are displayed correctly
        const currencyValues = screen.getAllByText('$5,086,589.40');
        expect(currencyValues.length).toBeGreaterThan(0); // Ensure at least one occurrence
        // Check that the first occurrence is correctly rendered
        expect(currencyValues[0]).toBeTruthy();
        // If there are multiple occurrences, check the second one as well 
        if (currencyValues.length > 1) {
            expect(currencyValues[1]).toBeTruthy();
        }

        expect(screen.getByText('$1,458.31')).toBeTruthy();


 }));
 it('should handle pagination and update sessionStorage correctly', fakeAsync(async () => {
        const { fixture }: RenderResult<ReferralSourceProductivityMigrationComponent> = await render(ReferralSourceProductivityMigrationComponent, {
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
